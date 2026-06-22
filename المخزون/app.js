class InventoryApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('المخزون');
        this.bindEvents();
        this.renderInventory();
    }

    bindEvents() {
        document.getElementById('addInventoryBtn').addEventListener('click', () => this.openInventoryModal());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.getElementById('deleteModal').classList.contains('active')) {
                this.confirmDelete();
            }
        });

        this.setupSearch('inventorySearch', (q) => {
            const items = q ? this.data.inventory.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)) : this.data.inventory;
            this.renderInventory(items);
        });
    }

    renderInventory(items) {
        const q = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
        if (!items) {
            items = q ? this.data.inventory.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)) : this.data.inventory;
        }
        const tbody = document.getElementById('inventoryBody');
        const empty = document.getElementById('inventoryEmpty');

        if (items.length === 0) {
            tbody.innerHTML = '';
            empty.style.display = 'block';
            return;
        }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const remaining = item.openingBalance + item.incoming - item.outgoing;
            const rowClass = remaining <= 0 ? 'style="background:#fce8e6"' : remaining < 10 ? 'style="background:#fef7e0"' : '';
            return `<tr ${rowClass}>
                <td><strong>${item.code}</strong></td>
                <td>${item.ministryCode || '—'}</td>
                <td>${item.name}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td>
                <td>${item.type || '—'}</td>
                <td>${item.openingBalance}</td>
                <td>${item.incoming}</td>
                <td>${item.outgoing}</td>
                <td><strong>${remaining}</strong></td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editInventory('${item.id}')" title="تعديل" data-perm="المخزون - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('inventory','${item.id}')" title="حذف" data-perm="المخزون - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    renderCurrentPage() {
        this.renderInventory();
    }

    openInventoryModal(id) {
        document.getElementById('inventoryModalTitle').textContent = id ? 'تعديل صنف' : 'إضافة صنف جديد';
        document.getElementById('inventoryForm').reset();
        document.getElementById('invId').value = '';

        const itemData = id ? this.data.inventory.find(i => i.id === id) : null;
        const selectedUnit = itemData?.unit || '';
        let selectedCat = itemData?.category || '';
        if (selectedCat && !this.data.categories.includes(selectedCat)) {
            this.data.categories.push(selectedCat);
            localStorage.setItem('inv_categories', JSON.stringify(this.data.categories));
        }
        let selectedType = itemData?.type || '';
        if (selectedType && !this.data.types.includes(selectedType)) {
            this.data.types.push(selectedType);
            localStorage.setItem('inv_types', JSON.stringify(this.data.types));
        }
        this.populateUnits('invUnit', selectedUnit);
        this.populateCategories('invCategory', selectedCat);
        this.populateTypes('invType', selectedType);

        if (!id) {
            document.getElementById('invCode').value = this.data.nextCode;
            document.getElementById('invCode').readOnly = true;
        } else {
            document.getElementById('invCode').readOnly = false;
        }

        if (id) {
            const item = this.data.inventory.find(i => i.id === id);
            if (!item) return;
            document.getElementById('invId').value = item.id;
            document.getElementById('invCode').value = item.code;
            document.getElementById('invMinistryCode').value = item.ministryCode || '';
            document.getElementById('invName').value = item.name;
            document.getElementById('invUnit').value = item.unit || '';
            document.getElementById('invCategory').value = item.category || '';
            document.getElementById('invType').value = item.type || '';
            document.getElementById('invOpeningBalance').value = item.openingBalance;
            document.getElementById('invIncoming').value = item.incoming;
            document.getElementById('invOutgoing').value = item.outgoing;
            document.getElementById('invPrice').value = item.price || 0;
            document.getElementById('invNotes').value = item.notes || '';
        }
        this.openModal('inventoryModal');
    }

    saveInventory() {
        const id = document.getElementById('invId').value;
        const data = {
            code: document.getElementById('invCode').value.trim(),
            ministryCode: document.getElementById('invMinistryCode').value.trim(),
            name: document.getElementById('invName').value.trim(),
            unit: document.getElementById('invUnit').value.trim(),
            category: document.getElementById('invCategory').value.trim(),
            type: document.getElementById('invType').value.trim(),
            openingBalance: parseInt(document.getElementById('invOpeningBalance').value) || 0,
            incoming: parseInt(document.getElementById('invIncoming').value) || 0,
            outgoing: parseInt(document.getElementById('invOutgoing').value) || 0,
            price: parseFloat(document.getElementById('invPrice').value) || 0,
            notes: document.getElementById('invNotes').value.trim(),
        };

        if (!data.code || !data.name) { alert('يرجى إدخال كود واسم الصنف'); return; }

        if (id) {
            const idx = this.data.inventory.findIndex(i => i.id === id);
            if (idx !== -1) this.data.inventory[idx] = { ...this.data.inventory[idx], ...data };
        } else {
            data.id = this.getNextId('inventory');
            const exists = this.data.inventory.some(i => i.code === data.code);
            if (exists) data.code = String(this.data.nextCode);
            this.data.inventory.push(data);
            this.data.nextCode++;
        }

        this.saveAll();
        this.closeModal('inventoryModal');
        this.renderInventory();
    }

    editInventory(id) {
        this.openInventoryModal(id);
    }
}

const app = new InventoryApp();
