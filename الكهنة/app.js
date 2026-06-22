class PriestsApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('الكهنة');
        this.bindEvents();
        this.renderPriests();
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
    }

    renderCurrentPage() {
        this.renderPriests();
    }

    renderPriests() {
        const items = this.data.priests;
        const tbody = document.getElementById('priestsBody');
        const empty = document.getElementById('priestsEmpty');
        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        tbody.innerHTML = items.map(item =>
            `<tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.details || '—'}</td>
                <td>${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editPriest('${item.id}')" title="تعديل" data-perm="الكهنة - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('priests','${item.id}')" title="حذف" data-perm="الكهنة - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`
        ).join('');
    }

    openPriestModal(id) {
        document.getElementById('priestModalTitle').textContent = id ? 'تعديل' : 'إضافة';
        document.getElementById('priestForm').reset();
        document.getElementById('priestId').value = '';
        if (id) {
            const item = this.data.priests.find(i => i.id === id);
            if (!item) return;
            document.getElementById('priestId').value = item.id;
            document.getElementById('priestName').value = item.name;
            document.getElementById('priestDetails').value = item.details || '';
            document.getElementById('priestNotes').value = item.notes || '';
        }
        this.openModal('priestModal');
    }

    savePriest() {
        const id = document.getElementById('priestId').value;
        const data = {
            name: document.getElementById('priestName').value.trim(),
            details: document.getElementById('priestDetails').value.trim(),
            notes: document.getElementById('priestNotes').value.trim(),
        };
        if (!data.name) { alert('يرجى إدخال الاسم'); return; }
        if (id) {
            const idx = this.data.priests.findIndex(i => i.id === id);
            if (idx !== -1) this.data.priests[idx] = { ...this.data.priests[idx], ...data };
        } else {
            data.id = this.getNextId('priests');
            this.data.priests.push(data);
        }
        this.saveAll();
        this.closeModal('priestModal');
        this.renderPriests();
    }

    editPriest(id) { this.openPriestModal(id); }
}

const app = new PriestsApp();
