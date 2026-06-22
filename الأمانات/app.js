class AmanatApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('الأمانات');
        this.bindEvents();
        this.renderAmanat();
        this.renderAmanatIncoming();
        this.renderAmanatOutgoing();
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

        document.getElementById('aiDate').addEventListener('change', function () {
            if (this.value) document.getElementById('aiDay').value = app.getDayName(this.value);
        });
        document.getElementById('aiQuantity').addEventListener('input', () => this.calcAiTotal());
        document.getElementById('aiPrice').addEventListener('input', () => this.calcAiTotal());

        document.getElementById('aoDate').addEventListener('change', function () {
            if (this.value) document.getElementById('aoDay').value = app.getDayName(this.value);
        });
        document.getElementById('aoQuantity').addEventListener('input', () => this.calcAoTotal());
        document.getElementById('aoPrice').addEventListener('input', () => this.calcAoTotal());
    }

    renderCurrentPage() {
        this.renderAmanat();
        this.renderAmanatIncoming();
        this.renderAmanatOutgoing();
    }

    /* === Amanat Main === */
    renderAmanat() {
        const items = this.data.amanat;
        const tbody = document.getElementById('amanatBody');
        const empty = document.getElementById('amanatEmpty');
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
                    <button class="btn-icon btn-edit" onclick="app.editAmanat('${item.id}')" title="تعديل" data-perm="الأمانات - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('amanat','${item.id}')" title="حذف" data-perm="الأمانات - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openAmanatModal(id) {
        document.getElementById('amanatModalTitle').textContent = id ? 'تعديل أمانة' : 'إضافة أمانة جديدة';
        document.getElementById('amanatForm').reset();
        document.getElementById('amanatId').value = '';

        const amanatData = id ? this.data.amanat.find(i => i.id === id) : null;
        const selAmanatUnit = amanatData?.unit || '';
        let selAmanatCat = amanatData?.category || '';
        if (selAmanatCat && !this.data.categories.includes(selAmanatCat)) {
            this.data.categories.push(selAmanatCat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        this.populateUnits('amanatUnit', selAmanatUnit);
        this.populateCategories('amanatCategory', selAmanatCat);

        if (id) {
            const item = this.data.amanat.find(i => i.id === id);
            if (!item) return;
            document.getElementById('amanatId').value = item.id;
            document.getElementById('amanatCode').value = item.code;
            document.getElementById('amanatMinistryCode').value = item.ministryCode || '';
            document.getElementById('amanatName').value = item.name;
            document.getElementById('amanatUnit').value = item.unit || '';
            document.getElementById('amanatCategory').value = item.category || '';
            document.getElementById('amanatOpeningBalance').value = item.openingBalance;
            document.getElementById('amanatIncoming').value = item.incoming;
            document.getElementById('amanatOutgoing').value = item.outgoing;
            document.getElementById('amanatPrice').value = item.price || 0;
        }
        this.openModal('amanatModal');
    }

    saveAmanat() {
        const id = document.getElementById('amanatId').value;
        const data = {
            code: document.getElementById('amanatCode').value.trim(),
            ministryCode: document.getElementById('amanatMinistryCode').value.trim(),
            name: document.getElementById('amanatName').value.trim(),
            unit: document.getElementById('amanatUnit').value.trim(),
            category: document.getElementById('amanatCategory').value.trim(),
            openingBalance: parseInt(document.getElementById('amanatOpeningBalance').value) || 0,
            incoming: parseInt(document.getElementById('amanatIncoming').value) || 0,
            outgoing: parseInt(document.getElementById('amanatOutgoing').value) || 0,
            price: parseFloat(document.getElementById('amanatPrice').value) || 0,
        };
        if (!data.code || !data.name) { alert('يرجى إدخال كود واسم الصنف'); return; }
        if (id) {
            const idx = this.data.amanat.findIndex(i => i.id === id);
            if (idx !== -1) this.data.amanat[idx] = { ...this.data.amanat[idx], ...data };
        } else {
            data.id = this.getNextId('amanat');
            this.data.amanat.push(data);
        }
        this.saveAll();
        this.closeModal('amanatModal');
        this.renderAmanat();
    }

    editAmanat(id) { this.openAmanatModal(id); }

    /* === Amanat Incoming === */
    renderAmanatIncoming() {
        const items = this.data.amanatIncoming;
        const tbody = document.getElementById('amanatIncomingBody');
        const empty = document.getElementById('amanatIncomingEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.code}</td>
                <td>${item.name}</td><td>${item.quantity}</td><td>${item.source || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td><td>${total.toFixed(2)}</td>
                <td><button class="btn-icon btn-delete" onclick="app.deleteItem('amanatIncoming','${item.id}')" title="حذف" data-perm="الأمانات - حذف"><span class="emoji-icon">🗑️</span></button></td>
            </tr>`;
        }).join('');
    }

    openAmanatIncomingModal() {
        document.getElementById('amanatIncomingForm').reset();
        document.getElementById('aiId').value = '';
        this.populateAmanatSelect('aiItemSelect');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('aiDate').value = today;
        document.getElementById('aiDay').value = this.getDayName(today);
        this.populateDestinations('aiSource', '');
        this.openModal('amanatIncomingModal');
    }

    calcAiTotal() {
        const q = parseInt(document.getElementById('aiQuantity').value) || 0;
        const p = parseFloat(document.getElementById('aiPrice').value) || 0;
        document.getElementById('aiTotal').value = (q * p).toFixed(2);
    }

    saveAmanatIncoming() {
        const id = document.getElementById('aiId').value;
        const data = {
            day: document.getElementById('aiDay').value,
            date: document.getElementById('aiDate').value,
            code: document.getElementById('aiCode').value.trim(),
            name: document.getElementById('aiName').value.trim(),
            quantity: parseInt(document.getElementById('aiQuantity').value) || 0,
            source: document.getElementById('aiSource').value.trim(),
            price: parseFloat(document.getElementById('aiPrice').value) || 0,
            total: parseFloat(document.getElementById('aiTotal').value) || 0,
        };
        if (!data.code || !data.name || !data.quantity || !data.source) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (id) {
            const idx = this.data.amanatIncoming.findIndex(i => i.id === id);
            if (idx !== -1) this.data.amanatIncoming[idx] = { ...this.data.amanatIncoming[idx], ...data };
        } else {
            data.id = this.getNextId('amanatIncoming');
            this.data.amanatIncoming.push(data);
            const amanatItem = this.data.amanat.find(i => i.code === data.code);
            if (amanatItem) amanatItem.incoming = (amanatItem.incoming || 0) + data.quantity;
        }
        this.saveAll();
        this.closeModal('amanatIncomingModal');
        this.renderAmanatIncoming();
        this.renderAmanat();
    }

    onAiItemSelect() {
        const sel = document.getElementById('aiItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('aiCode').value = opt.value;
        document.getElementById('aiName').value = opt.dataset.name || '';
        document.getElementById('aiPrice').value = opt.dataset.price || 0;
        this.calcAiTotal();
    }

    /* === Amanat Outgoing === */
    renderAmanatOutgoing() {
        const items = this.data.amanatOutgoing;
        const tbody = document.getElementById('amanatOutgoingBody');
        const empty = document.getElementById('amanatOutgoingEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.code}</td>
                <td>${item.name}</td><td>${item.quantity}</td><td>${item.destination || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td><td>${total.toFixed(2)}</td>
                <td><button class="btn-icon btn-delete" onclick="app.deleteItem('amanatOutgoing','${item.id}')" title="حذف" data-perm="الأمانات - حذف"><span class="emoji-icon">🗑️</span></button></td>
            </tr>`;
        }).join('');
    }

    openAmanatOutgoingModal() {
        document.getElementById('amanatOutgoingForm').reset();
        document.getElementById('aoId').value = '';
        this.populateAmanatSelect('aoItemSelect');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('aoDate').value = today;
        document.getElementById('aoDay').value = this.getDayName(today);
        this.populateDestinations('aoDestination', '');
        this.openModal('amanatOutgoingModal');
    }

    calcAoTotal() {
        const q = parseInt(document.getElementById('aoQuantity').value) || 0;
        const p = parseFloat(document.getElementById('aoPrice').value) || 0;
        document.getElementById('aoTotal').value = (q * p).toFixed(2);
    }

    saveAmanatOutgoing() {
        const id = document.getElementById('aoId').value;
        const data = {
            day: document.getElementById('aoDay').value,
            date: document.getElementById('aoDate').value,
            code: document.getElementById('aoCode').value.trim(),
            name: document.getElementById('aoName').value.trim(),
            quantity: parseInt(document.getElementById('aoQuantity').value) || 0,
            destination: document.getElementById('aoDestination').value.trim(),
            price: parseFloat(document.getElementById('aoPrice').value) || 0,
            total: parseFloat(document.getElementById('aoTotal').value) || 0,
        };
        if (!data.code || !data.name || !data.quantity || !data.destination) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (id) {
            const idx = this.data.amanatOutgoing.findIndex(i => i.id === id);
            if (idx !== -1) this.data.amanatOutgoing[idx] = { ...this.data.amanatOutgoing[idx], ...data };
        } else {
            data.id = this.getNextId('amanatOutgoing');
            this.data.amanatOutgoing.push(data);
            const amanatItem = this.data.amanat.find(i => i.code === data.code);
            if (amanatItem) amanatItem.outgoing = (amanatItem.outgoing || 0) + data.quantity;
        }
        this.saveAll();
        this.closeModal('amanatOutgoingModal');
        this.renderAmanatOutgoing();
        this.renderAmanat();
    }

    onAoItemSelect() {
        const sel = document.getElementById('aoItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('aoCode').value = opt.value;
        document.getElementById('aoName').value = opt.dataset.name || '';
        document.getElementById('aoPrice').value = opt.dataset.price || 0;
        this.calcAoTotal();
    }
}

const app = new AmanatApp();
