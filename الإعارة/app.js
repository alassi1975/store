class LoanApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('الإعارة');
        this.bindEvents();
        this.renderLoan();
        this.renderLoanIncoming();
        this.renderLoanOutgoing();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('deleteModal').classList.contains('active')) {
                this.confirmDelete();
            }
        });

        document.getElementById('liDate').addEventListener('change', function () {
            if (this.value) document.getElementById('liDay').value = app.getDayName(this.value);
        });
        document.getElementById('liQuantity').addEventListener('input', () => this.calcLiTotal());
        document.getElementById('liPrice').addEventListener('input', () => this.calcLiTotal());

        document.getElementById('loDate').addEventListener('change', function () {
            if (this.value) document.getElementById('loDay').value = app.getDayName(this.value);
        });
        document.getElementById('loQuantity').addEventListener('input', () => this.calcLoTotal());
        document.getElementById('loPrice').addEventListener('input', () => this.calcLoTotal());
    }

    renderCurrentPage() {
        this.renderLoan();
        this.renderLoanIncoming();
        this.renderLoanOutgoing();
    }

    /* === Loan Main === */
    renderLoan() {
        const items = this.data.loan;
        const tbody = document.getElementById('loanBody');
        const empty = document.getElementById('loanEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item => {
            const remaining = item.openingBalance + item.incoming - item.outgoing;
            return `<tr>
                <td>${item.code}</td><td>${item.ministryCode || '—'}</td><td>${item.name}</td>
                <td>${item.unit || '—'}</td><td>${item.category || '—'}</td>
                <td>${item.openingBalance}</td><td>${item.incoming}</td><td>${item.outgoing}</td>
                <td><strong>${remaining}</strong></td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editLoan('${item.id}')" title="تعديل" data-perm="الإعارة - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('loan','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openLoanModal(id) {
        document.getElementById('loanModalTitle').textContent = id ? 'تعديل إعارة' : 'إضافة إعارة جديدة';
        document.getElementById('loanForm').reset();
        document.getElementById('loanId').value = '';

        const loanData = id ? this.data.loan.find(i => i.id === id) : null;
        const selLoanUnit = loanData?.unit || '';
        let selLoanCat = loanData?.category || '';
        if (selLoanCat && !this.data.categories.includes(selLoanCat)) {
            this.data.categories.push(selLoanCat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        this.populateUnits('loanUnit', selLoanUnit);
        this.populateCategories('loanCategory', selLoanCat);

        if (id) {
            const item = this.data.loan.find(i => i.id === id);
            if (!item) return;
            document.getElementById('loanId').value = item.id;
            document.getElementById('loanCode').value = item.code;
            document.getElementById('loanMinistryCode').value = item.ministryCode || '';
            document.getElementById('loanName').value = item.name;
            document.getElementById('loanUnit').value = item.unit || '';
            document.getElementById('loanCategory').value = item.category || '';
            document.getElementById('loanOpeningBalance').value = item.openingBalance;
            document.getElementById('loanIncoming').value = item.incoming;
            document.getElementById('loanOutgoing').value = item.outgoing;
            document.getElementById('loanPrice').value = item.price || 0;
        }
        this.openModal('loanModal');
    }

    saveLoan() {
        const id = document.getElementById('loanId').value;
        const data = {
            code: document.getElementById('loanCode').value.trim(),
            ministryCode: document.getElementById('loanMinistryCode').value.trim(),
            name: document.getElementById('loanName').value.trim(),
            unit: document.getElementById('loanUnit').value.trim(),
            category: document.getElementById('loanCategory').value.trim(),
            openingBalance: parseInt(document.getElementById('loanOpeningBalance').value) || 0,
            incoming: parseInt(document.getElementById('loanIncoming').value) || 0,
            outgoing: parseInt(document.getElementById('loanOutgoing').value) || 0,
            price: parseFloat(document.getElementById('loanPrice').value) || 0,
        };
        if (!data.code || !data.name) { alert('يرجى إدخال كود واسم الصنف'); return; }
        if (id) {
            const idx = this.data.loan.findIndex(i => i.id === id);
            if (idx !== -1) this.data.loan[idx] = { ...this.data.loan[idx], ...data };
        } else {
            data.id = this.getNextId('loan');
            this.data.loan.push(data);
        }
        this.saveAll();
        this.closeModal('loanModal');
        this.renderLoan();
    }

    editLoan(id) { this.openLoanModal(id); }

    /* === Loan Incoming === */
    renderLoanIncoming() {
        const items = this.data.loanIncoming;
        const tbody = document.getElementById('loanIncomingBody');
        const empty = document.getElementById('loanIncomingEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.code}</td>
                <td>${item.name}</td><td>${item.quantity}</td><td>${item.source || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td><td>${total.toFixed(2)}</td>
                <td><button class="btn-icon btn-delete" onclick="app.deleteItem('loanIncoming','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button></td>
            </tr>`;
        }).join('');
    }

    openLoanIncomingModal() {
        document.getElementById('loanIncomingForm').reset();
        document.getElementById('liId').value = '';
        this.populateLoanSelect('liItemSelect');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('liDate').value = today;
        document.getElementById('liDay').value = this.getDayName(today);
        this.populateDestinations('liSource', '');
        this.openModal('loanIncomingModal');
    }

    calcLiTotal() {
        const q = parseInt(document.getElementById('liQuantity').value) || 0;
        const p = parseFloat(document.getElementById('liPrice').value) || 0;
        document.getElementById('liTotal').value = (q * p).toFixed(2);
    }

    saveLoanIncoming() {
        const id = document.getElementById('liId').value;
        const data = {
            day: document.getElementById('liDay').value,
            date: document.getElementById('liDate').value,
            code: document.getElementById('liCode').value.trim(),
            name: document.getElementById('liName').value.trim(),
            quantity: parseInt(document.getElementById('liQuantity').value) || 0,
            source: document.getElementById('liSource').value.trim(),
            price: parseFloat(document.getElementById('liPrice').value) || 0,
            total: parseFloat(document.getElementById('liTotal').value) || 0,
        };
        if (!data.code || !data.name || !data.quantity || !data.source) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (id) {
            const idx = this.data.loanIncoming.findIndex(i => i.id === id);
            if (idx !== -1) this.data.loanIncoming[idx] = { ...this.data.loanIncoming[idx], ...data };
        } else {
            data.id = this.getNextId('loanIncoming');
            this.data.loanIncoming.push(data);
            const loanItem = this.data.loan.find(i => i.code === data.code);
            if (loanItem) loanItem.incoming = (loanItem.incoming || 0) + data.quantity;
        }
        this.saveAll();
        this.closeModal('loanIncomingModal');
        this.renderLoanIncoming();
        this.renderLoan();
    }

    onLiItemSelect() {
        const sel = document.getElementById('liItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('liCode').value = opt.value;
        document.getElementById('liName').value = opt.dataset.name || '';
        document.getElementById('liPrice').value = opt.dataset.price || 0;
        this.calcLiTotal();
    }

    /* === Loan Outgoing === */
    renderLoanOutgoing() {
        const items = this.data.loanOutgoing;
        const tbody = document.getElementById('loanOutgoingBody');
        const empty = document.getElementById('loanOutgoingEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.code}</td>
                <td>${item.name}</td><td>${item.quantity}</td><td>${item.destination || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td><td>${total.toFixed(2)}</td>
                <td><button class="btn-icon btn-delete" onclick="app.deleteItem('loanOutgoing','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button></td>
            </tr>`;
        }).join('');
    }

    openLoanOutgoingModal() {
        document.getElementById('loanOutgoingForm').reset();
        document.getElementById('loId').value = '';
        this.populateLoanSelect('loItemSelect');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('loDate').value = today;
        document.getElementById('loDay').value = this.getDayName(today);
        this.populateDestinations('loDestination', '');
        this.openModal('loanOutgoingModal');
    }

    calcLoTotal() {
        const q = parseInt(document.getElementById('loQuantity').value) || 0;
        const p = parseFloat(document.getElementById('loPrice').value) || 0;
        document.getElementById('loTotal').value = (q * p).toFixed(2);
    }

    saveLoanOutgoing() {
        const id = document.getElementById('loId').value;
        const data = {
            day: document.getElementById('loDay').value,
            date: document.getElementById('loDate').value,
            code: document.getElementById('loCode').value.trim(),
            name: document.getElementById('loName').value.trim(),
            quantity: parseInt(document.getElementById('loQuantity').value) || 0,
            destination: document.getElementById('loDestination').value.trim(),
            price: parseFloat(document.getElementById('loPrice').value) || 0,
            total: parseFloat(document.getElementById('loTotal').value) || 0,
        };
        if (!data.code || !data.name || !data.quantity || !data.destination) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (id) {
            const idx = this.data.loanOutgoing.findIndex(i => i.id === id);
            if (idx !== -1) this.data.loanOutgoing[idx] = { ...this.data.loanOutgoing[idx], ...data };
        } else {
            data.id = this.getNextId('loanOutgoing');
            this.data.loanOutgoing.push(data);
            const loanItem = this.data.loan.find(i => i.code === data.code);
            if (loanItem) loanItem.outgoing = (loanItem.outgoing || 0) + data.quantity;
        }
        this.saveAll();
        this.closeModal('loanOutgoingModal');
        this.renderLoanOutgoing();
        this.renderLoan();
    }

    onLoItemSelect() {
        const sel = document.getElementById('loItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('loCode').value = opt.value;
        document.getElementById('loName').value = opt.dataset.name || '';
        document.getElementById('loPrice').value = opt.dataset.price || 0;
        this.calcLoTotal();
    }
}

const app = new LoanApp();
