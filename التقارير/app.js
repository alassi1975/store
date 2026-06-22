class ReportsApp extends SharedApp {
    constructor() {
        super();
        this.initShared();
        if (!this.checkAuthBase()) return;
        this.initSidebarNav();
        this.highlightCurrentPage('التقارير');
        this.currentReport = null;
    }

    getPermItems() {
        return JSON.parse(localStorage.getItem('inv_permItems')) || [
            'المخزون - إضافة', 'المخزون - تعديل', 'المخزون - حذف',
            'الوارد - إضافة', 'الوارد - تعديل', 'الوارد - حذف',
            'الصادر - إضافة', 'الصادر - تعديل', 'الصادر - حذف',
            'الإعارة - إضافة', 'الإعارة - تعديل', 'الإعارة - حذف',
            'الأمانات - إضافة', 'الأمانات - تعديل', 'الأمانات - حذف',
            'الكهنة - إضافة', 'الكهنة - تعديل', 'الكهنة - حذف',
            'التقارير - عرض', 'التقارير - تصدير',
            'إدارة المستخدمين', 'إدارة القوائم', 'تصدير Excel'
        ];
    }

    generateReport() {
        const type = document.getElementById('reportType').value;
        const container = document.getElementById('reportContent');

        switch (type) {
            case 'movement':
                this.renderMovementReport(container);
                break;
            case 'inventory':
                this.renderInventoryReport(container);
                break;
            case 'incoming':
                this.renderIncomingReport(container);
                break;
            case 'outgoing':
                this.renderOutgoingReport(container);
                break;
            case 'lowStock':
                this.renderLowStockReport(container);
                break;
        }
    }

    renderMovementReport(container) {
        const items = this.data.inventory.map(item => {
            const itemIncoming = this.data.incoming.filter(i => i.itemCode === item.code || i.itemName === item.name);
            const itemOutgoing = this.data.outgoing.filter(i => i.itemCode === item.code || i.itemName === item.name);
            const totalIn = itemIncoming.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
            const totalOut = itemOutgoing.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
            return { ...item, totalIn, totalOut, balance: item.openingBalance + totalIn - totalOut, transactions: [...itemIncoming.map(i => ({ ...i, type: 'وارد' })), ...itemOutgoing.map(i => ({ ...i, type: 'صادر' }))].sort((a, b) => (a.date || '').localeCompare(b.date || '')) };
        });

        const totalBalance = items.reduce((s, i) => s + i.balance, 0);
        const totalValue = items.reduce((s, i) => s + (i.price || 0) * i.balance, 0);

        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-box"><div class="stat-value">${items.length}</div><div class="stat-label">إجمالي الأصناف</div></div>
                <div class="stat-box"><div class="stat-value">${totalBalance}</div><div class="stat-label">إجمالي الرصيد</div></div>
                <div class="stat-box"><div class="stat-value">${totalValue.toFixed(2)}</div><div class="stat-label">القيمة الإجمالية</div></div>
            </div>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>الكود</th><th>الاسم</th><th>الرصيد الافتتاحي</th><th>إجمالي الوارد</th><th>إجمالي الصادر</th><th>الرصيد الحالي</th><th></th></tr></thead>
                    <tbody>${items.map(item => {
                        const bal = item.balance;
                        const rowClass = bal <= 0 ? 'style="background:#fce8e6"' : bal < 10 ? 'style="background:#fef7e0"' : '';
                        return `<tr ${rowClass}>
                            <td><strong>${item.code}</strong></td>
                            <td>${item.name}</td>
                            <td>${item.openingBalance}</td>
                            <td style="color:#00B894;font-weight:600">+${item.totalIn}</td>
                            <td style="color:#FF6B6B;font-weight:600">-${item.totalOut}</td>
                            <td><strong>${bal}</strong></td>
                            <td><button class="btn btn-sm btn-primary" onclick="app.showItemMovement('${item.code}')"><span class="emoji-icon">📋</span> الحركة</button></td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        `;
        this.currentReport = { type: 'movement', items, label: 'تقرير حركة الأصناف' };
    }

    showItemMovement(code) {
        const item = this.data.inventory.find(i => i.code === code);
        if (!item) return;
        const incoming = this.data.incoming.filter(i => i.itemCode === code || i.itemName === item.name);
        const outgoing = this.data.outgoing.filter(i => i.itemCode === code || i.itemName === item.name);
        const transactions = [
            { date: '—', type: 'رصيد افتتاحي', qty: item.openingBalance, source: '', running: item.openingBalance },
            ...incoming.map(i => ({ date: i.date || '—', type: 'وارد', qty: parseFloat(i.quantity) || 0, source: i.source || '—', running: 0 })),
            ...outgoing.map(i => ({ date: i.date || '—', type: 'صادر', qty: -(parseFloat(i.quantity) || 0), source: i.destination || '—', running: 0 }))
        ].sort((a, b) => (a.date === '—' ? '' : a.date).localeCompare(b.date === '—' ? '' : b.date));

        let running = item.openingBalance;
        transactions.forEach(t => {
            if (t.type === 'وارد') { running += t.qty; t.running = running; }
            else if (t.type === 'صادر') { running += t.qty; t.running = running; }
        });

        const content = `
            <h4 style="margin-bottom:12px">حركة الصنف: ${item.code} - ${item.name}</h4>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>التاريخ</th><th>النوع</th><th>الكمية</th><th>الجهة</th><th>الرصيد</th></tr></thead>
                    <tbody>${transactions.map(t => {
                        const color = t.type === 'وارد' ? '#00B894' : t.type === 'صادر' ? '#FF6B6B' : '#6C5CE7';
                        return `<tr><td>${t.date}</td><td style="color:${color};font-weight:600">${t.type}</td><td style="color:${color}">${t.qty > 0 ? '+' : ''}${t.qty}</td><td>${t.source}</td><td><strong>${t.running}</strong></td></tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
            <div style="margin-top:12px">
                <button class="btn btn-secondary" onclick="app.closeMovementDetail()"><span class="emoji-icon">🔙</span> عودة</button>
            </div>
        `;
        document.getElementById('reportContent').innerHTML = content;
    }

    closeMovementDetail() {
        this.generateReport();
    }

    renderInventoryReport(container) {
        const items = this.data.inventory;
        const totalItems = items.length;
        const totalValue = items.reduce((s, i) => s + (i.price || 0) * (i.openingBalance + i.incoming - i.outgoing), 0);
        const lowStock = items.filter(i => (i.openingBalance + i.incoming - i.outgoing) <= 0).length;

        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-box"><div class="stat-value">${totalItems}</div><div class="stat-label">إجمالي الأصناف</div></div>
                <div class="stat-box"><div class="stat-value">${totalValue.toFixed(2)}</div><div class="stat-label">القيمة الإجمالية</div></div>
                <div class="stat-box"><div class="stat-value">${lowStock}</div><div class="stat-label">منتهي</div></div>
            </div>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>الكود</th><th>الاسم</th><th>الرصيد</th><th>السعر</th><th>الإجمالي</th></tr></thead>
                    <tbody>${items.map(i => {
                        const bal = i.openingBalance + i.incoming - i.outgoing;
                        return `<tr><td>${i.code}</td><td>${i.name}</td><td>${bal}</td><td>${(i.price || 0).toFixed(2)}</td><td>${(bal * (i.price || 0)).toFixed(2)}</td></tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        `;
        this.currentReport = { type: 'inventory', items, label: 'تقرير المخزون العام' };
    }

    renderIncomingReport(container) {
        const items = this.data.incoming;
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-box"><div class="stat-value">${items.length}</div><div class="stat-label">إجمالي الواردات</div></div>
            </div>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>التاريخ</th><th>الصنف</th><th>الكمية</th><th>الجهة</th></tr></thead>
                    <tbody>${items.length ? items.map(i => `<tr><td>${i.date || '—'}</td><td>${i.itemName || i.name || '—'}</td><td>${i.quantity || 0}</td><td>${i.source || '—'}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center">لا توجد بيانات</td></tr>'}</tbody>
                </table>
            </div>
        `;
        this.currentReport = { type: 'incoming', items, label: 'تقرير الوارد' };
    }

    renderOutgoingReport(container) {
        const items = this.data.outgoing;
        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-box"><div class="stat-value">${items.length}</div><div class="stat-label">إجمالي الصادرات</div></div>
            </div>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>التاريخ</th><th>الصنف</th><th>الكمية</th><th>الجهة</th></tr></thead>
                    <tbody>${items.length ? items.map(i => `<tr><td>${i.date || '—'}</td><td>${i.itemName || i.name || '—'}</td><td>${i.quantity || 0}</td><td>${i.destination || '—'}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center">لا توجد بيانات</td></tr>'}</tbody>
                </table>
            </div>
        `;
        this.currentReport = { type: 'outgoing', items, label: 'تقرير الصادر' };
    }

    renderLowStockReport(container) {
        const items = this.data.inventory.filter(i => {
            const bal = i.openingBalance + i.incoming - i.outgoing;
            return bal <= 5;
        }).sort((a, b) => (a.openingBalance + a.incoming - a.outgoing) - (b.openingBalance + b.incoming - b.outgoing));

        container.innerHTML = `
            <div class="report-stats">
                <div class="stat-box"><div class="stat-value">${items.length}</div><div class="stat-label">أصناف منخفضة</div></div>
            </div>
            <div class="report-table">
                <table class="table">
                    <thead><tr><th>الكود</th><th>الاسم</th><th>الرصيد</th><th>الحالة</th></tr></thead>
                    <tbody>${items.length ? items.map(i => {
                        const bal = i.openingBalance + i.incoming - i.outgoing;
                        const status = bal <= 0 ? '⚠️ منتهي' : '⚠️ منخفض';
                        return `<tr style="background:${bal <= 0 ? '#fce8e6' : '#fef7e0'}"><td>${i.code}</td><td>${i.name}</td><td>${bal}</td><td>${status}</td></tr>`;
                    }).join('') : '<tr><td colspan="4" style="text-align:center">جميع الأصناف متوفرة</td></tr>'}</tbody>
                </table>
            </div>
        `;
        this.currentReport = { type: 'lowStock', items, label: 'الأصناف منخفضة المخزون' };
    }

    exportReport() {
        if (!this.currentReport) {
            this.showModal('تنبيه', 'الرجاء عرض تقرير أولاً قبل التصدير');
            return;
        }
        let data;
        if (this.currentReport.type === 'movement') {
            data = this.currentReport.items.map(i => ({ الكود: i.code, الاسم: i.name, 'الرصيد الافتتاحي': i.openingBalance, 'إجمالي الوارد': i.totalIn, 'إجمالي الصادر': i.totalOut, 'الرصيد الحالي': i.balance }));
        } else if (this.currentReport.type === 'inventory') {
            data = this.currentReport.items.map(i => ({ الكود: i.code, الاسم: i.name, الرصيد: i.openingBalance + i.incoming - i.outgoing, السعر: i.price || 0 }));
        } else if (this.currentReport.type === 'incoming') {
            data = this.currentReport.items.map(i => ({ التاريخ: i.date || '', الصنف: i.itemName || i.name || '', الكمية: i.quantity || 0, الجهة: i.source || '' }));
        } else if (this.currentReport.type === 'outgoing') {
            data = this.currentReport.items.map(i => ({ التاريخ: i.date || '', الصنف: i.itemName || i.name || '', الكمية: i.quantity || 0, الجهة: i.destination || '' }));
        } else if (this.currentReport.type === 'lowStock') {
            data = this.currentReport.items.map(i => ({ الكود: i.code, الاسم: i.name, الرصيد: i.openingBalance + i.incoming - i.outgoing }));
        } else {
            data = this.currentReport.items;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
        XLSX.writeFile(wb, `${this.currentReport.label}.xlsx`);
    }
}

const app = new ReportsApp();
