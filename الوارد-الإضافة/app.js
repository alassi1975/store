class IncomingApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('الوارد-الإضافة');
        this.bindEvents();
        this.renderIncoming();
    }

    bindEvents() {
        document.getElementById('addIncomingBtn').addEventListener('click', () => this.openIncomingModal());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('deleteModal').classList.contains('active')) {
                this.confirmDelete();
            }
        });

        document.getElementById('incDate').addEventListener('change', function () {
            if (this.value) document.getElementById('incDay').value = app.getDayName(this.value);
        });
        document.getElementById('incQuantity').addEventListener('input', () => this.calcIncomingTotal());
        document.getElementById('incPrice').addEventListener('input', () => this.calcIncomingTotal());

        this.setupSearch('incomingSearch', (q) => {
            const items = q ? this.data.incoming.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.incoming;
            this.renderIncoming(items);
        });

        const incBtn = document.getElementById('importIncomingBtn');
        const incInput = document.getElementById('excelIncomingInput');
        if (incBtn && incInput) {
            incBtn.addEventListener('click', () => incInput.click());
            incInput.addEventListener('change', (e) => this.importExcel('incoming', e.target));
        }
    }

    renderIncoming(items) {
        const q = (document.getElementById('incomingSearch')?.value || '').toLowerCase();
        if (!items) {
            items = q ? this.data.incoming.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.incoming;
        }
        const tbody = document.getElementById('incomingBody');
        const empty = document.getElementById('incomingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.itemCode}</td>
                <td>${item.ministryCode || '—'}</td><td>${item.itemName}</td><td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td><td>${item.type || '—'}</td><td>${item.quantity}</td>
                <td>${item.source || '—'}</td><td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editIncoming('${item.id}')" title="تعديل" data-perm="الوارد - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('incoming','${item.id}')" title="حذف" data-perm="الوارد - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    renderCurrentPage() {
        this.renderIncoming();
    }

    openIncomingModal(id) {
        document.getElementById('incomingModalTitle').textContent = id ? 'تعديل وارد' : 'إضافة وارد جديد';
        document.getElementById('incomingForm').reset();
        document.getElementById('incId').value = '';

        this.populateInventorySelect('incItemSelect');

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('incDate').value = today;
        document.getElementById('incDay').value = this.getDayName(today);

        const incData = id ? this.data.incoming.find(i => i.id === id) : null;
        const selIncUnit = incData?.unit || '';
        let selIncCat = incData?.category || '';
        if (selIncCat && !this.data.categories.includes(selIncCat)) {
            this.data.categories.push(selIncCat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        let incType = incData?.type || '';
        if (incType && !this.data.types.includes(incType)) {
            this.data.types.push(incType);
            localStorage.setItem('inv_types', JSON.stringify(this.data.types));
        }
        this.populateUnits('incUnit', selIncUnit);
        this.populateCategories('incCategory', selIncCat);
        this.populateTypes('incType', incType);
        this.populateDestinations('incSource', incData?.source || '');

        if (id) {
            const item = this.data.incoming.find(i => i.id === id);
            if (!item) return;
            document.getElementById('incId').value = item.id;
            document.getElementById('incDay').value = item.day || '';
            document.getElementById('incDate').value = item.date || '';
            document.getElementById('incItemCode').value = item.itemCode;
            document.getElementById('incMinistryCode').value = item.ministryCode || '';
            document.getElementById('incItemName').value = item.itemName;
            document.getElementById('incUnit').value = item.unit || '';
            document.getElementById('incCategory').value = item.category || '';
            document.getElementById('incType').value = item.type || '';
            document.getElementById('incQuantity').value = item.quantity;
            document.getElementById('incPrice').value = item.price || 0;
            this.calcIncomingTotal();
            document.getElementById('incNotes').value = item.notes || '';
        }
        this.openModal('incomingModal');
    }

    calcIncomingTotal() {
        const q = parseInt(document.getElementById('incQuantity').value) || 0;
        const p = parseFloat(document.getElementById('incPrice').value) || 0;
        document.getElementById('incTotal').value = (q * p).toFixed(2);
    }

    saveIncoming() {
        const id = document.getElementById('incId').value;
        const data = {
            day: document.getElementById('incDay').value,
            date: document.getElementById('incDate').value,
            itemCode: document.getElementById('incItemCode').value.trim(),
            ministryCode: document.getElementById('incMinistryCode').value.trim(),
            itemName: document.getElementById('incItemName').value.trim(),
            unit: document.getElementById('incUnit').value.trim(),
            category: document.getElementById('incCategory').value.trim(),
            type: document.getElementById('incType').value.trim(),
            quantity: parseInt(document.getElementById('incQuantity').value) || 0,
            source: document.getElementById('incSource').value.trim(),
            price: parseFloat(document.getElementById('incPrice').value) || 0,
            total: parseFloat(document.getElementById('incTotal').value) || 0,
            notes: document.getElementById('incNotes').value.trim(),
        };

        if (!data.itemCode || !data.itemName || !data.quantity || !data.source) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (!data.date) { alert('يرجى اختيار التاريخ'); return; }

        if (id) {
            const idx = this.data.incoming.findIndex(i => i.id === id);
            if (idx !== -1) this.data.incoming[idx] = { ...this.data.incoming[idx], ...data };
        } else {
            data.id = this.getNextId('incoming');
            this.data.incoming.push(data);
            const invItem = this.data.inventory.find(i => i.code === data.itemCode);
            if (invItem) invItem.incoming = (invItem.incoming || 0) + data.quantity;
        }

        this.saveAll();
        this.closeModal('incomingModal');
        this.renderIncoming();
    }

    editIncoming(id) { this.openIncomingModal(id); }

    onIncItemSelect() {
        const sel = document.getElementById('incItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('incItemCode').value = opt.value;
        document.getElementById('incMinistryCode').value = opt.dataset.ministry || '';
        document.getElementById('incItemName').value = opt.dataset.name || '';
        const unit = opt.dataset.unit || '';
        if (!this.data.units.includes(unit) && unit) {
            this.data.units.push(unit);
            localStorage.setItem('inv_units', JSON.stringify(this.data.units));
        }
        this.populateUnits('incUnit', unit);
        const cat = opt.dataset.category || '';
        if (!this.data.categories.includes(cat) && cat) {
            this.data.categories.push(cat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        this.populateCategories('incCategory', cat);
        const typeVal = opt.dataset.type || '';
        if (!this.data.types.includes(typeVal) && typeVal) {
            this.data.types.push(typeVal);
            localStorage.setItem('inv_types', JSON.stringify(this.data.types));
        }
        this.populateTypes('incType', typeVal);
        document.getElementById('incPrice').value = opt.dataset.price || 0;
        this.calcIncomingTotal();
    }
}

const app = new IncomingApp();
