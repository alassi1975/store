class OutgoingApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('الصادر-المنصرف');
        this.bindEvents();
        this.renderOutgoing();
    }

    bindEvents() {
        document.getElementById('addOutgoingBtn').addEventListener('click', () => this.openOutgoingModal());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('deleteModal').classList.contains('active')) {
                this.confirmDelete();
            }
        });

        document.getElementById('outDate').addEventListener('change', function () {
            if (this.value) document.getElementById('outDay').value = app.getDayName(this.value);
        });
        document.getElementById('outQuantity').addEventListener('input', () => this.calcOutgoingTotal());
        document.getElementById('outPrice').addEventListener('input', () => this.calcOutgoingTotal());

        this.setupSearch('outgoingSearch', (q) => {
            const items = q ? this.data.outgoing.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.outgoing;
            this.renderOutgoing(items);
        });
    }

    renderOutgoing(items) {
        const q = (document.getElementById('outgoingSearch')?.value || '').toLowerCase();
        if (!items) {
            items = q ? this.data.outgoing.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.outgoing;
        }
        const tbody = document.getElementById('outgoingBody');
        const empty = document.getElementById('outgoingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td><td>${item.date || '—'}</td><td>${item.itemCode}</td>
                <td>${item.ministryCode || '—'}</td><td>${item.itemName}</td><td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td><td>${item.type || '—'}</td><td>${item.quantity}</td>
                <td>${item.destination || '—'}</td><td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editOutgoing('${item.id}')" title="تعديل" data-perm="الصادر - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('outgoing','${item.id}')" title="حذف" data-perm="الصادر - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    renderCurrentPage() {
        this.renderOutgoing();
    }

    openOutgoingModal(id) {
        document.getElementById('outgoingModalTitle').textContent = id ? 'تعديل صادر' : 'إضافة صادر جديد';
        document.getElementById('outgoingForm').reset();
        document.getElementById('outId').value = '';

        this.populateInventorySelect('outItemSelect');

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('outDate').value = today;
        document.getElementById('outDay').value = this.getDayName(today);

        const outData = id ? this.data.outgoing.find(i => i.id === id) : null;
        const selOutUnit = outData?.unit || '';
        let selOutCat = outData?.category || '';
        if (selOutCat && !this.data.categories.includes(selOutCat)) {
            this.data.categories.push(selOutCat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        let outType = outData?.type || '';
        if (outType && !this.data.types.includes(outType)) {
            this.data.types.push(outType);
            localStorage.setItem('inv_types', JSON.stringify(this.data.types));
        }
        this.populateUnits('outUnit', selOutUnit);
        this.populateCategories('outCategory', selOutCat);
        this.populateTypes('outType', outType);
        this.populateDestinations('outDestination', outData?.destination || '');

        if (id) {
            const item = this.data.outgoing.find(i => i.id === id);
            if (!item) return;
            document.getElementById('outId').value = item.id;
            document.getElementById('outDay').value = item.day || '';
            document.getElementById('outDate').value = item.date || '';
            document.getElementById('outItemCode').value = item.itemCode;
            document.getElementById('outMinistryCode').value = item.ministryCode || '';
            document.getElementById('outItemName').value = item.itemName;
            document.getElementById('outUnit').value = item.unit || '';
            document.getElementById('outCategory').value = item.category || '';
            document.getElementById('outType').value = item.type || '';
            document.getElementById('outQuantity').value = item.quantity;
            document.getElementById('outPrice').value = item.price || 0;
            this.calcOutgoingTotal();
            document.getElementById('outNotes').value = item.notes || '';
        }
        this.openModal('outgoingModal');
    }

    calcOutgoingTotal() {
        const q = parseInt(document.getElementById('outQuantity').value) || 0;
        const p = parseFloat(document.getElementById('outPrice').value) || 0;
        document.getElementById('outTotal').value = (q * p).toFixed(2);
    }

    saveOutgoing() {
        const id = document.getElementById('outId').value;
        const data = {
            day: document.getElementById('outDay').value,
            date: document.getElementById('outDate').value,
            itemCode: document.getElementById('outItemCode').value.trim(),
            ministryCode: document.getElementById('outMinistryCode').value.trim(),
            itemName: document.getElementById('outItemName').value.trim(),
            unit: document.getElementById('outUnit').value.trim(),
            category: document.getElementById('outCategory').value.trim(),
            type: document.getElementById('outType').value.trim(),
            quantity: parseInt(document.getElementById('outQuantity').value) || 0,
            destination: document.getElementById('outDestination').value.trim(),
            price: parseFloat(document.getElementById('outPrice').value) || 0,
            total: parseFloat(document.getElementById('outTotal').value) || 0,
            notes: document.getElementById('outNotes').value.trim(),
        };

        if (!data.itemCode || !data.itemName || !data.quantity || !data.destination) { alert('يرجى ملء الحقول المطلوبة'); return; }
        if (!data.date) { alert('يرجى اختيار التاريخ'); return; }

        if (id) {
            const idx = this.data.outgoing.findIndex(i => i.id === id);
            if (idx !== -1) this.data.outgoing[idx] = { ...this.data.outgoing[idx], ...data };
        } else {
            data.id = this.getNextId('outgoing');
            this.data.outgoing.push(data);
            const invItem = this.data.inventory.find(i => i.code === data.itemCode);
            if (invItem) invItem.outgoing = (invItem.outgoing || 0) + data.quantity;
        }

        this.saveAll();
        this.closeModal('outgoingModal');
        this.renderOutgoing();
    }

    editOutgoing(id) { this.openOutgoingModal(id); }

    onOutItemSelect() {
        const sel = document.getElementById('outItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('outItemCode').value = opt.value;
        document.getElementById('outMinistryCode').value = opt.dataset.ministry || '';
        document.getElementById('outItemName').value = opt.dataset.name || '';
        const unit = opt.dataset.unit || '';
        if (!this.data.units.includes(unit) && unit) {
            this.data.units.push(unit);
            localStorage.setItem('inv_units', JSON.stringify(this.data.units));
        }
        this.populateUnits('outUnit', unit);
        const cat = opt.dataset.category || '';
        if (!this.data.categories.includes(cat) && cat) {
            this.data.categories.push(cat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        this.populateCategories('outCategory', cat);
        const outTypeVal = opt.dataset.type || '';
        if (!this.data.types.includes(outTypeVal) && outTypeVal) {
            this.data.types.push(outTypeVal);
            localStorage.setItem('inv_types', JSON.stringify(this.data.types));
        }
        this.populateTypes('outType', outTypeVal);
        document.getElementById('outPrice').value = opt.dataset.price || 0;
        this.calcOutgoingTotal();
    }
}

const app = new OutgoingApp();
