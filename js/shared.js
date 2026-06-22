class SharedApp {
    constructor() {
        this.data = {
            inventory: JSON.parse(localStorage.getItem('inv_inventory')) || [
                { id: 'i1', code: 'MED001', ministryCode: 'MOH001', name: 'باراسيتامول 500mg', unit: 'شريط', category: 'أدوية', type: 'مستهلك', openingBalance: 500, incoming: 200, outgoing: 150, price: 3.5, notes: '' },
                { id: 'i2', code: 'MED002', ministryCode: 'MOH002', name: 'أموكسيسيلين 500mg', unit: 'شريط', category: 'أدوية', type: 'مستهلك', openingBalance: 300, incoming: 100, outgoing: 80, price: 5.0, notes: '' },
                { id: 'i3', code: 'SUP001', ministryCode: 'MOH010', name: 'قفازات جراحية', unit: 'كرتون', category: 'مستلزمات', type: 'مستهلك', openingBalance: 50, incoming: 20, outgoing: 15, price: 120, notes: 'مقاس 7.5' },
                { id: 'i4', code: 'SUP002', ministryCode: 'MOH011', name: 'شاش طبي معقم', unit: 'كرتون', category: 'مستلزمات', type: 'مستهلك', openingBalance: 80, incoming: 30, outgoing: 25, price: 85, notes: '10x10' },
                { id: 'i5', code: 'EQP001', ministryCode: 'MOH020', name: 'جهاز قياس ضغط', unit: 'جهاز', category: 'معدات', type: 'غير مستهلك', openingBalance: 10, incoming: 2, outgoing: 1, price: 450, notes: '' },
                { id: 'i6', code: 'DIS001', ministryCode: 'MOH030', name: 'كحول طبي 70%', unit: 'لتر', category: 'مطهرات', type: 'مستهلك', openingBalance: 100, incoming: 50, outgoing: 30, price: 15, notes: '' },
            ],
            incoming: JSON.parse(localStorage.getItem('inv_incoming')) || [],
            outgoing: JSON.parse(localStorage.getItem('inv_outgoing')) || [],
            loan: JSON.parse(localStorage.getItem('inv_loan')) || [
                { id: 'l1', code: 'EQP002', ministryCode: 'MOH021', name: 'سرير عناية مركزة', unit: 'قطعة', category: 'معدات', openingBalance: 5, incoming: 1, outgoing: 0, price: 2500 },
                { id: 'l2', code: 'EQP003', ministryCode: 'MOH022', name: 'جهاز تنفس صناعي', unit: 'قطعة', category: 'معدات', openingBalance: 3, incoming: 0, outgoing: 1, price: 15000 },
            ],
            loanIncoming: JSON.parse(localStorage.getItem('inv_loanIncoming')) || [],
            loanOutgoing: JSON.parse(localStorage.getItem('inv_loanOutgoing')) || [],
            amanat: JSON.parse(localStorage.getItem('inv_amanat')) || [
                { id: 'a1', code: 'AMN001', ministryCode: '', name: 'صندوق أمانات', unit: 'قطعة', category: 'معدات', openingBalance: 2, incoming: 0, outgoing: 0, price: 500 },
            ],
            amanatIncoming: JSON.parse(localStorage.getItem('inv_amanatIncoming')) || [],
            amanatOutgoing: JSON.parse(localStorage.getItem('inv_amanatOutgoing')) || [],
            priests: JSON.parse(localStorage.getItem('inv_priests')) || [
                { id: 'p1', name: 'الأب إلياس', details: 'كاهن رعية دير البلح', notes: '' },
                { id: 'p2', name: 'الأب يوسف', details: 'كاهن مساعد', notes: '' },
            ],
            units: JSON.parse(localStorage.getItem('inv_units')) || ['قطعة', 'كرتون', 'لتر', 'شريط', 'جهاز', 'علبة', 'زجاجة', 'كيلو', 'متر'],
            categories: JSON.parse(localStorage.getItem('inv_categories')) || ['أثاث طبي + مكتبي', 'أجهزة كهربائية + حاسوب', 'أجهزة ميكانيكية', 'أدوات جراحية + أجهزة طبية', 'أقمشة و ملبوسات', 'خيام وملحقاتها'],
            types: JSON.parse(localStorage.getItem('inv_types')) || ['مستديم', 'مستهلك', 'أعارة', 'أمانات'],
            destinations: JSON.parse(localStorage.getItem('inv_destinations')) || ['مستشفى شهداء الأقصى', 'مستشفى الشفاء', 'مستشفى النجار', 'وزارة الصحة', 'الهلال الأحمر', 'المخزن المركزي', 'قسم الطوارئ', 'قسم العناية المركزة', 'الصيدلية', 'المختبر', 'العيادات الخارجية', 'مستودع الأدوية'],
            nextCode: parseInt(localStorage.getItem('inv_nextCode')) || 1,
        };
        this.deleteContext = null;
        this.currentUser = JSON.parse(localStorage.getItem('inv_current_user')) || null;
    }

    initShared() {
        if (!localStorage.getItem('inv_inventory')) {
            this.initDefaults();
        }
        this.migratePerms();
    }

    migratePerms() {
        const stored = JSON.parse(localStorage.getItem('inv_permItems'));
        if (!stored) return;
        const newPerms = ['التقارير - عرض', 'التقارير - تصدير'];
        let changed = false;
        newPerms.forEach(p => {
            if (!stored.includes(p)) { stored.push(p); changed = true; }
        });
        if (changed) {
            localStorage.setItem('inv_permItems', JSON.stringify(stored));
            const users = JSON.parse(localStorage.getItem('inv_users')) || [];
            users.forEach(u => {
                newPerms.forEach(p => {
                    if (!u.permissions.includes(p)) u.permissions.push(p);
                });
            });
            localStorage.setItem('inv_users', JSON.stringify(users));
        }
    }

    initDefaults() {
        const nums = this.data.inventory.map(i => parseInt(i.code)).filter(n => !isNaN(n));
        this.data.nextCode = nums.length > 0 ? Math.max(...nums) + 1 : 1;
        this.data.inventory.forEach(i => {
            if (i.category && !this.data.categories.includes(i.category)) this.data.categories.push(i.category);
            if (i.type && !this.data.types.includes(i.type)) this.data.types.push(i.type);
        });
        this.data.loan.forEach(i => {
            if (i.category && !this.data.categories.includes(i.category)) this.data.categories.push(i.category);
        });
        this.data.amanat.forEach(i => {
            if (i.category && !this.data.categories.includes(i.category)) this.data.categories.push(i.category);
        });
        this.saveAll();
    }

    /* === Auth === */
    checkAuthBase() {
        if (!this.currentUser) {
            window.location.href = '../login/index.html';
            return false;
        }
        this.addUserSidebarLink();
        this.applyPermissions();
        this.updateUserDisplay();
        this.applyTheme();
        this.applySidebar();
        this.updateDate();
        setInterval(() => this.updateDate(), 1000);
        return true;
    }

    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            localStorage.removeItem('inv_remembered_user');
            localStorage.removeItem('inv_remembered_pass');
            localStorage.removeItem('inv_current_user');
            window.location.href = '../login/index.html';
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('inv_users')) || [];
    }

    saveUsers(users) {
        localStorage.setItem('inv_users', JSON.stringify(users));
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

    savePermItems(items) {
        localStorage.setItem('inv_permItems', JSON.stringify(items));
    }

    /* === Users Management === */
    openUsersModal() {
        this.populateUserPermCheckboxes('userPermsList', null);
        this.renderUsersList();
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('userModalTitle').textContent = 'إضافة مستخدم';
        document.getElementById('editingUserIdx').value = '';
        document.getElementById('usersError').style.display = 'none';
        this.openModal('usersModal');
    }

    renderUsersList() {
        const users = this.getUsers();
        const container = document.getElementById('usersList');
        if (users.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:20px">لا يوجد مستخدمين</p>';
            return;
        }
        container.innerHTML = users.map((u, i) =>
            `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:6px">
                <div>
                    <strong style="font-size:14px">${u.username}</strong>
                    <span style="font-size:12px;color:var(--gray-500);margin-right:8px;background:var(--gray-100);padding:2px 8px;border-radius:20px">${u.role === 'admin' ? 'مدير' : (u.permissions?.length || 0) + ' صلاحية'}</span>
                </div>
                <div style="display:flex;gap:4px">
                    <button class="btn-icon btn-edit" onclick="app.editUserForm(${i})" title="تعديل"><span class="emoji-icon">✏️</span></button>
                    ${users.length > 1 ? `<button class="btn-icon btn-delete" onclick="app.deleteUser(${i})" title="حذف"><span class="emoji-icon">🗑️</span></button>` : ''}
                </div>
            </div>`
        ).join('');
    }

    populateUserPermCheckboxes(containerId, selectedPerms) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = this.getPermItems();
        selectedPerms = selectedPerms || [];
        container.innerHTML = items.map(p =>
            `<label style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:13px;cursor:pointer">
                <input type="checkbox" value="${p}" ${selectedPerms.includes(p) ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer">
                ${p}
            </label>`
        ).join('');
    }

    saveUserFromForm() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const editingIdx = document.getElementById('editingUserIdx').value;
        const err = document.getElementById('usersError');
        if (!username) {
            err.textContent = 'يرجى إدخال اسم المستخدم';
            err.style.display = 'block'; return;
        }
        const checkedBoxes = document.querySelectorAll('#userPermsList input[type="checkbox"]:checked');
        const permissions = Array.from(checkedBoxes).map(cb => cb.value);
        const users = this.getUsers();

        if (editingIdx) {
            const idx = parseInt(editingIdx);
            users[idx].username = username;
            if (password.trim()) users[idx].password = password.trim();
            users[idx].permissions = permissions;
            if (users[idx].role === 'admin') users[idx].role = 'user';
        } else {
            if (!password) {
                err.textContent = 'يرجى إدخال كلمة المرور';
                err.style.display = 'block'; return;
            }
            if (password.length < 4) {
                err.textContent = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل';
                err.style.display = 'block'; return;
            }
            if (users.find(u => u.username === username)) {
                err.textContent = 'اسم المستخدم موجود مسبقاً';
                err.style.display = 'block'; return;
            }
            users.push({ username, password, role: 'user', permissions });
        }
        err.style.display = 'none';
        this.saveUsers(users);
        this.closeModal('usersModal');
        this.openUsersModal();
    }

    editUserForm(idx) {
        const users = this.getUsers();
        const u = users[idx];
        document.getElementById('editingUserIdx').value = idx;
        document.getElementById('userModalTitle').textContent = 'تعديل مستخدم';
        document.getElementById('newUsername').value = u.username;
        document.getElementById('newPassword').value = '';
        document.getElementById('newPassword').placeholder = 'اترك فارغاً للإبقاء على كلمة المرور';
        this.populateUserPermCheckboxes('userPermsList', u.permissions || []);
    }

    deleteUser(idx) {
        const users = this.getUsers();
        if (users.length <= 1) return;
        if (!confirm(`هل أنت متأكد من حذف المستخدم "${users[idx].username}"؟`)) return;
        users.splice(idx, 1);
        this.saveUsers(users);
        this.renderUsersList();
    }

    addUserSidebarLink() {
        const nav = document.querySelector('.sidebar-nav');
        if (nav && !document.getElementById('navUsers')) {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'nav-item';
            a.id = 'navUsers';
            a.innerHTML = '<span class="emoji-icon">👥</span><span>المستخدمين</span>';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.openUsersModal();
            });
            nav.appendChild(a);
        }
    }

    /* === Permissions Management === */
    openPermsModal() {
        this.renderPermsItems();
        document.getElementById('permNewInput').value = '';
        this.openModal('permsModal');
    }

    renderPermsItems() {
        const items = this.getPermItems();
        const container = document.getElementById('permsList');
        if (items.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:20px">لا توجد صلاحيات</p>';
            return;
        }
        container.innerHTML = items.map((p, i) =>
            `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:4px">
                <span style="font-size:14px">${p}</span>
                <div style="display:flex;gap:4px">
                    <button class="btn-icon btn-edit" onclick="app.editPermItem(${i})" title="تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deletePermItem(${i})" title="حذف"><span class="emoji-icon">🗑️</span></button>
                </div>
            </div>`
        ).join('');
    }

    addPermItem() {
        const input = document.getElementById('permNewInput');
        const val = input.value.trim();
        if (!val) return;
        const items = this.getPermItems();
        if (!items.includes(val)) {
            items.push(val);
            this.savePermItems(items);
            this.renderPermsItems();
        }
        input.value = '';
    }

    editPermItem(idx) {
        const items = this.getPermItems();
        const oldVal = items[idx];
        const newVal = prompt('تعديل الصلاحية:', oldVal);
        if (newVal && newVal.trim() && newVal.trim() !== oldVal) {
            items[idx] = newVal.trim();
            this.savePermItems(items);
            this.renderPermsItems();
            this.refreshUsersPerms();
        }
    }

    deletePermItem(idx) {
        const items = this.getPermItems();
        if (!confirm(`حذف "${items[idx]}"؟`)) return;
        const deleted = items[idx];
        items.splice(idx, 1);
        this.savePermItems(items);
        this.renderPermsItems();
        let users = this.getUsers();
        let changed = false;
        users.forEach(u => {
            if (u.permissions) {
                const i = u.permissions.indexOf(deleted);
                if (i !== -1) { u.permissions.splice(i, 1); changed = true; }
            }
        });
        if (changed) this.saveUsers(users);
    }

    refreshUsersPerms() {
        const perms = this.getPermItems();
        let users = this.getUsers();
        let changed = false;
        users.forEach(u => {
            if (!u.permissions) { u.permissions = []; changed = true; }
            u.permissions = u.permissions.filter(p => perms.includes(p));
        });
        if (changed) this.saveUsers(users);
    }

    /* === Permissions UI === */
    applyPermissions() {
        if (!this.currentUser) return;
        const role = this.currentUser.role;
        const perms = this.currentUser.permissions || [];
        const isAdmin = role === 'admin';

        document.querySelectorAll('[data-perm]').forEach(el => {
            const required = el.getAttribute('data-perm').split(',').map(s => s.trim());
            const hasAny = isAdmin || required.some(r => perms.includes(r));
            if (el.tagName === 'BUTTON' || el.classList.contains('btn')) {
                el.style.display = hasAny ? '' : 'none';
            } else if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                el.disabled = !hasAny;
            } else {
                el.style.display = hasAny ? '' : 'none';
            }
        });

        if (document.getElementById('navUsers')) {
            document.getElementById('navUsers').style.display = isAdmin ? '' : 'none';
        }
    }

    updateUserDisplay() {
        const el = document.getElementById('userDisplay');
        if (!el || !this.currentUser) return;
        const roleLabel = this.currentUser.role === 'admin' ? 'مدير' : this.currentUser.role === 'guest' ? 'ضيف' : 'مستخدم';
        el.textContent = `${this.currentUser.username} (${roleLabel})`;
    }

    /* === Theme === */
    applyTheme() {
        const saved = localStorage.getItem('inv_theme');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            const btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            const btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '🌙';
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('inv_theme', 'light');
            const btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('inv_theme', 'dark');
            const btn = document.getElementById('themeToggle');
            if (btn) btn.textContent = '☀️';
        }
    }

    /* === Sidebar === */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        const btn = document.getElementById('sidebarCollapse');
        btn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
        localStorage.setItem('inv_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    }

    applySidebar() {
        const sidebar = document.getElementById('sidebar');
        if (localStorage.getItem('inv_sidebar_collapsed') === 'true') {
            sidebar.classList.add('collapsed');
            const btn = document.getElementById('sidebarCollapse');
            if (btn) btn.textContent = '▶';
        }
    }

    /* === Date/Time === */
    updateDate() {
        const now = new Date();
        const dayEl = document.getElementById('dayDisplay');
        const dateEl = document.getElementById('dateDisplay');
        const timeEl = document.getElementById('timeDisplay');
        if (dayEl) dayEl.textContent = now.toLocaleDateString('ar-EG', { weekday: 'long' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    getDayName(dateStr) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[new Date(dateStr).getDay()];
    }

    /* === Helpers === */
    getNextId(store) {
        const items = this.data[store];
        const nums = items.map(i => parseInt(i.id.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n));
        const prefix = store === 'inventory' ? 'i' : store === 'incoming' ? 'inc' : store === 'outgoing' ? 'out' : store === 'loan' ? 'l' : store === 'loanIncoming' ? 'li' : store === 'loanOutgoing' ? 'lo' : store === 'amanat' ? 'a' : store === 'amanatIncoming' ? 'ai' : store === 'amanatOutgoing' ? 'ao' : 'p';
        return `${prefix}${Math.max(0, ...nums) + 1}`;
    }

    saveAll() {
        for (const key in this.data) {
            localStorage.setItem(`inv_${key}`, JSON.stringify(this.data[key]));
        }
    }

    /* === Modals === */
    openModal(id) {
        document.getElementById(id).classList.add('active');
        this.applyPermissions();
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    /* === Delete === */
    deleteItem(store, id) {
        this.deleteContext = { store, id };
        document.getElementById('deleteMessage').textContent = 'هل أنت متأكد من حذف هذا العنصر؟';
        this.openModal('deleteModal');
    }

    confirmDelete() {
        if (!this.deleteContext) return;
        const { store, id } = this.deleteContext;
        this.data[store] = this.data[store].filter(i => i.id !== id);
        this.deleteContext = null;
        this.saveAll();
        this.closeModal('deleteModal');
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        // Override in page-specific app
    }

    /* === List Management === */
    populateList(selectId, list, storageKey, selected, addLabel, addValue) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = '';
        list.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            if (v === selected) opt.selected = true;
            sel.appendChild(opt);
        });
        const addOpt = document.createElement('option');
        addOpt.value = addValue;
        addOpt.textContent = addLabel;
        addOpt.style.color = 'var(--primary)';
        sel.appendChild(addOpt);

        sel.onchange = () => {
            if (sel.value === addValue) {
                const newVal = prompt(`أدخل ${addLabel.replace('➕ إضافة ', '').replace(' جديد...', '')} الجديد:`);
                if (newVal && newVal.trim()) {
                    const trimmed = newVal.trim();
                    if (!list.includes(trimmed)) {
                        list.push(trimmed);
                        localStorage.setItem(storageKey, JSON.stringify(list));
                    }
                    this.populateList(selectId, list, storageKey, trimmed, addLabel, addValue);
                } else {
                    this.populateList(selectId, list, storageKey, selected || '', addLabel, addValue);
                }
            }
        };
        const typeMap = { units: 'units', categories: 'categories', types: 'types', destinations: 'destinations' };
        const listKey = Object.keys(typeMap).find(k => list === this.data[k]);
        this.addManageBtn(selectId, listKey);
    }

    populateUnits(selectId, selected) {
        this.populateList(selectId, this.data.units, 'inv_units', selected, '➕ إضافة وحدة جديدة...', '__ADD_UNIT__');
    }

    populateCategories(selectId, selected) {
        this.populateList(selectId, this.data.categories, 'inv_categories', selected, '➕ إضافة تصنيف جديد...', '__ADD_CAT__');
    }

    populateTypes(selectId, selected) {
        this.populateList(selectId, this.data.types, 'inv_types', selected, '➕ إضافة نوع جديد...', '__ADD_TYPE__');
    }

    populateDestinations(selectId, selected) {
        this.populateList(selectId, this.data.destinations, 'inv_destinations', selected, '➕ إضافة جهة جديدة...', '__ADD_DEST__');
    }

    addManageBtn(selectId, listType) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        const existing = sel.parentNode.querySelector('.manage-list-btn');
        if (existing) return;
        if (!sel.nextSibling || !sel.nextSibling.classList || !sel.nextSibling.classList.contains('manage-list-btn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'manage-list-btn';
            btn.innerHTML = '⚙️ إدارة';
            btn.title = 'إدارة القائمة';
            btn.style.cssText = 'background:var(--gray-100);border:1px solid var(--gray-300);border-radius:var(--radius-sm);cursor:pointer;font-size:13px;padding:8px 10px;margin-top:4px;width:100%;text-align:center;color:var(--gray-700);transition:all .2s';
            btn.setAttribute('data-perm', 'إدارة القوائم');
            btn.onmouseover = () => btn.style.background = 'var(--gray-200)';
            btn.onmouseout = () => btn.style.background = 'var(--gray-100)';
            btn.onclick = () => this.openListManager(listType);
            sel.parentNode.insertBefore(btn, sel.nextSibling);
        }
    }

    openListManager(type) {
        this._manageType = type;
        const labels = { units: 'الوحدات', categories: 'التصنيفات', types: 'الأنواع', destinations: 'الجهات' };
        document.getElementById('managerTitle').textContent = `إدارة ${labels[type] || 'القائمة'}`;
        document.getElementById('managerNewInput').placeholder = `إضافة ${labels[type] || ''} جديد...`;
        document.getElementById('managerNewInput').onkeydown = (e) => {
            if (e.key === 'Enter') this.addManagedItem();
        };
        this.renderManagerList();
        this.openModal('listManagerModal');
    }

    getManageList() {
        if (this._manageType === 'units') return this.data.units;
        if (this._manageType === 'categories') return this.data.categories;
        if (this._manageType === 'types') return this.data.types;
        if (this._manageType === 'destinations') return this.data.destinations;
        return [];
    }

    getManageStorageKey() {
        if (this._manageType === 'units') return 'inv_units';
        if (this._manageType === 'categories') return 'inv_categories';
        if (this._manageType === 'types') return 'inv_types';
        if (this._manageType === 'destinations') return 'inv_destinations';
        return '';
    }

    renderManagerList() {
        const container = document.getElementById('managerListItems');
        const list = this.getManageList();
        if (list.length === 0) {
            container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:20px">لا توجد عناصر</p>';
            return;
        }
        container.innerHTML = list.map((item, idx) =>
            `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid var(--gray-200);border-radius:var(--radius-sm);margin-bottom:6px">
                <span style="font-size:14px">${item}</span>
                <div style="display:flex;gap:4px">
                    <button class="btn-icon btn-edit" onclick="app.editManagedItem(${idx})" title="تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteManagedItem(${idx})" title="حذف"><span class="emoji-icon">🗑️</span></button>
                </div>
            </div>`
        ).join('');
    }

    addManagedItem() {
        const input = document.getElementById('managerNewInput');
        if (!input) return;
        const val = input.value.trim();
        if (!val) return;
        const list = this.getManageList();
        if (!list.includes(val)) {
            list.push(val);
            localStorage.setItem(this.getManageStorageKey(), JSON.stringify(list));
            this.refreshAllSelects();
        }
        input.value = '';
        this.renderManagerList();
    }

    editManagedItem(idx) {
        const list = this.getManageList();
        const oldVal = list[idx];
        const newVal = prompt('تعديل القيمة:', oldVal);
        if (newVal && newVal.trim() && newVal.trim() !== oldVal) {
            list[idx] = newVal.trim();
            localStorage.setItem(this.getManageStorageKey(), JSON.stringify(list));
            this.refreshAllSelects();
            this.renderManagerList();
        }
    }

    deleteManagedItem(idx) {
        if (!confirm('هل أنت متأكد من حذف "' + this.getManageList()[idx] + '"؟')) return;
        const list = this.getManageList();
        list.splice(idx, 1);
        localStorage.setItem(this.getManageStorageKey(), JSON.stringify(list));
        this.refreshAllSelects();
        this.renderManagerList();
    }

    refreshAllSelects() {
        const allSelects = ['invUnit', 'incUnit', 'outUnit', 'loanUnit', 'amanatUnit', 'invCategory', 'incCategory', 'outCategory', 'loanCategory', 'amanatCategory', 'invType', 'incType', 'outType', 'incSource', 'outDestination', 'liSource', 'loDestination', 'aiSource', 'aoDestination'];
        allSelects.forEach(id => {
            const sel = document.getElementById(id);
            if (sel) {
                const current = sel.value;
                if (['invUnit', 'incUnit', 'outUnit', 'loanUnit', 'amanatUnit'].includes(id)) this.populateUnits(id, current);
                else if (['invCategory', 'incCategory', 'outCategory', 'loanCategory', 'amanatCategory'].includes(id)) this.populateCategories(id, current);
                else if (['invType', 'incType', 'outType'].includes(id)) this.populateTypes(id, current);
                else if (['incSource', 'outDestination', 'liSource', 'loDestination', 'aiSource', 'aoDestination'].includes(id)) this.populateDestinations(id, current);
            }
        });
    }

    /* === Excel Export === */
    exportTable(type) {
        let data, headers, filename;

        switch (type) {
            case 'inventory':
                data = this.data.inventory;
                headers = ['كود الصنف', 'كود وزارة', 'اسم الصنف', 'الوحدة', 'التصنيف', 'النوع', 'رصيد أول المدة', 'الوارد', 'الصادر', 'الرصيد المتبقي', 'السعر', 'ملاحظات'];
                filename = 'المخزون';
                break;
            case 'incoming':
                data = this.data.incoming;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'كود وزارة', 'اسم الصنف', 'الوحدة', 'التصنيف', 'النوع', 'الكمية', 'الجهة الوارد منها', 'السعر', 'الإجمالي', 'ملاحظات'];
                filename = 'الوارد';
                break;
            case 'outgoing':
                data = this.data.outgoing;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'كود وزارة', 'اسم الصنف', 'الوحدة', 'التصنيف', 'النوع', 'الكمية', 'الجهة المصروف لها', 'السعر', 'الإجمالي', 'ملاحظات'];
                filename = 'الصادر';
                break;
            case 'loan':
                data = this.data.loan;
                headers = ['كود الصنف', 'كود وزارة', 'اسم الصنف', 'الوحدة', 'التصنيف', 'رصيد أول المدة', 'الوارد', 'الصادر', 'الرصيد المتبقي'];
                filename = 'الإعارة';
                break;
            case 'loanIncoming':
                data = this.data.loanIncoming;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'اسم الصنف', 'الكمية', 'الجهة الوارد منها', 'السعر', 'الإجمالي'];
                filename = 'وارد_الإعارة';
                break;
            case 'loanOutgoing':
                data = this.data.loanOutgoing;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'اسم الصنف', 'الكمية', 'الجهة المصروف لها', 'السعر', 'الإجمالي'];
                filename = 'صادر_الإعارة';
                break;
            case 'amanat':
                data = this.data.amanat;
                headers = ['الكود', 'كود الوزارة', 'الاسم', 'الوحدة', 'التصنيف', 'الرصيد أول المدة', 'الوارد', 'الصادر', 'المتبقي', 'السعر'];
                filename = 'الأمانات';
                break;
            case 'amanatIncoming':
                data = this.data.amanatIncoming;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'اسم الصنف', 'الكمية', 'المصدر', 'السعر', 'الإجمالي'];
                filename = 'وارد_الأمانات';
                break;
            case 'amanatOutgoing':
                data = this.data.amanatOutgoing;
                headers = ['اليوم', 'التاريخ', 'كود الصنف', 'اسم الصنف', 'الكمية', 'الجهة', 'السعر', 'الإجمالي'];
                filename = 'صادر_الأمانات';
                break;
            case 'priests':
                data = this.data.priests;
                headers = ['الاسم', 'التفاصيل', 'ملاحظات'];
                filename = 'الكهنة';
                break;
            default: return;
        }

        const rows = data.map(item => {
            if (type === 'inventory') {
                return [item.code, item.ministryCode, item.name, item.unit, item.category, item.type, item.openingBalance, item.incoming, item.outgoing, item.openingBalance + item.incoming - item.outgoing, item.price, item.notes];
            }
            if (type === 'incoming') {
                return [item.day, item.date, item.itemCode, item.ministryCode, item.itemName, item.unit, item.category, item.type, item.quantity, item.source, item.price, (item.quantity * item.price).toFixed(2), item.notes];
            }
            if (type === 'outgoing') {
                return [item.day, item.date, item.itemCode, item.ministryCode, item.itemName, item.unit, item.category, item.type, item.quantity, item.destination, item.price, (item.quantity * item.price).toFixed(2), item.notes];
            }
            if (type === 'loan') {
                return [item.code, item.ministryCode, item.name, item.unit, item.category, item.openingBalance, item.incoming, item.outgoing, item.openingBalance + item.incoming - item.outgoing];
            }
            if (type === 'loanIncoming') {
                return [item.day, item.date, item.code, item.name, item.quantity, item.source, item.price, (item.quantity * item.price).toFixed(2)];
            }
            if (type === 'loanOutgoing') {
                return [item.day, item.date, item.code, item.name, item.quantity, item.destination, item.price, (item.quantity * item.price).toFixed(2)];
            }
            if (type === 'amanat') {
                return [item.code, item.ministryCode, item.name, item.unit, item.category, item.openingBalance, item.incoming, item.outgoing, item.openingBalance + item.incoming - item.outgoing, item.price];
            }
            if (type === 'amanatIncoming') {
                return [item.day, item.date, item.code, item.name, item.quantity, item.source, item.price, (item.quantity * item.price).toFixed(2)];
            }
            if (type === 'amanatOutgoing') {
                return [item.day, item.date, item.code, item.name, item.quantity, item.destination, item.price, (item.quantity * item.price).toFixed(2)];
            }
            if (type === 'priests') {
                return [item.name, item.details, item.notes];
            }
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    /* === Excel Import === */
    importExcel(type, input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (json.length < 2) { alert('الملف فارغ أو غير صحيح'); return; }

                const rows = json.slice(1);

                const imported = rows.map(row => {
                    const obj = { id: this.getNextId(type) };

                    if (type === 'inventory') {
                        obj.code = row[0] ? String(row[0]) : `AUTO${Date.now()}`;
                        obj.ministryCode = row[1] ? String(row[1]) : '';
                        obj.name = row[2] ? String(row[2]) : '';
                        obj.unit = row[3] ? String(row[3]) : '';
                        obj.category = row[4] ? String(row[4]) : '';
                        obj.type = row[5] ? String(row[5]) : '';
                        obj.openingBalance = parseInt(row[6]) || 0;
                        obj.incoming = parseInt(row[7]) || 0;
                        obj.outgoing = parseInt(row[8]) || 0;
                        obj.price = parseFloat(row[10]) || 0;
                        obj.notes = row[11] ? String(row[11]) : '';
                    } else if (type === 'incoming') {
                        obj.day = row[0] ? String(row[0]) : '';
                        obj.date = row[1] ? String(row[1]) : '';
                        obj.itemCode = row[2] ? String(row[2]) : '';
                        obj.ministryCode = row[3] ? String(row[3]) : '';
                        obj.itemName = row[4] ? String(row[4]) : '';
                        obj.unit = row[5] ? String(row[5]) : '';
                        obj.category = row[6] ? String(row[6]) : '';
                        obj.type = row[7] ? String(row[7]) : '';
                        obj.quantity = parseInt(row[8]) || 0;
                        obj.source = row[9] ? String(row[9]) : '';
                        obj.price = parseFloat(row[10]) || 0;
                        obj.total = obj.quantity * obj.price;
                        obj.notes = row[12] ? String(row[12]) : '';
                    } else if (type === 'outgoing') {
                        obj.day = row[0] ? String(row[0]) : '';
                        obj.date = row[1] ? String(row[1]) : '';
                        obj.itemCode = row[2] ? String(row[2]) : '';
                        obj.ministryCode = row[3] ? String(row[3]) : '';
                        obj.itemName = row[4] ? String(row[4]) : '';
                        obj.unit = row[5] ? String(row[5]) : '';
                        obj.category = row[6] ? String(row[6]) : '';
                        obj.type = row[7] ? String(row[7]) : '';
                        obj.quantity = parseInt(row[8]) || 0;
                        obj.destination = row[9] ? String(row[9]) : '';
                        obj.price = parseFloat(row[10]) || 0;
                        obj.total = obj.quantity * obj.price;
                        obj.notes = row[12] ? String(row[12]) : '';
                    } else if (type === 'loan') {
                        obj.code = row[0] ? String(row[0]) : `AUTO${Date.now()}`;
                        obj.ministryCode = row[1] ? String(row[1]) : '';
                        obj.name = row[2] ? String(row[2]) : '';
                        obj.unit = row[3] ? String(row[3]) : '';
                        obj.category = row[4] ? String(row[4]) : '';
                        obj.openingBalance = parseInt(row[5]) || 0;
                        obj.incoming = parseInt(row[6]) || 0;
                        obj.outgoing = parseInt(row[7]) || 0;
                        obj.price = parseFloat(row[9]) || 0;
                    } else if (type === 'loanIncoming') {
                        obj.day = row[0] ? String(row[0]) : '';
                        obj.date = row[1] ? String(row[1]) : '';
                        obj.code = row[2] ? String(row[2]) : '';
                        obj.name = row[3] ? String(row[3]) : '';
                        obj.quantity = parseInt(row[4]) || 0;
                        obj.source = row[5] ? String(row[5]) : '';
                        obj.price = parseFloat(row[6]) || 0;
                        obj.total = obj.quantity * obj.price;
                    } else if (type === 'loanOutgoing') {
                        obj.day = row[0] ? String(row[0]) : '';
                        obj.date = row[1] ? String(row[1]) : '';
                        obj.code = row[2] ? String(row[2]) : '';
                        obj.name = row[3] ? String(row[3]) : '';
                        obj.quantity = parseInt(row[4]) || 0;
                        obj.destination = row[5] ? String(row[5]) : '';
                        obj.price = parseFloat(row[6]) || 0;
                        obj.total = obj.quantity * obj.price;
                    } else if (type === 'amanat') {
                        obj.code = row[0] ? String(row[0]) : `AUTO${Date.now()}`;
                        obj.ministryCode = row[1] ? String(row[1]) : '';
                        obj.name = row[2] ? String(row[2]) : '';
                        obj.unit = row[3] ? String(row[3]) : '';
                        obj.category = row[4] ? String(row[4]) : '';
                        obj.openingBalance = parseInt(row[5]) || 0;
                        obj.incoming = parseInt(row[6]) || 0;
                        obj.outgoing = parseInt(row[7]) || 0;
                        obj.price = parseFloat(row[9]) || 0;
                    }

                    return obj;
                }).filter(obj => obj.name || obj.code);

                if (imported.length === 0) { alert('لم يتم استيراد أي بيانات'); return; }

                this.data[type].push(...imported);
                this.saveAll();
                this.renderCurrentPage();
                alert(`تم استيراد ${imported.length} سجل بنجاح`);
            } catch (err) {
                alert('حدث خطأ أثناء قراءة الملف');
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
        input.value = '';
    }

    /* === Selects === */
    populateInventorySelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- اختر صنف من المخزون --</option>';
        this.data.inventory.forEach(item => {
            sel.innerHTML += `<option value="${item.code}" data-ministry="${item.ministryCode || ''}" data-name="${item.name}" data-unit="${item.unit || ''}" data-category="${item.category || ''}" data-type="${item.type || ''}" data-price="${item.price || 0}">${item.code} - ${item.name}</option>`;
        });
    }

    populateLoanSelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- اختر من المعدات المعارة --</option>';
        this.data.loan.forEach(item => {
            sel.innerHTML += `<option value="${item.code}" data-name="${item.name}" data-price="${item.price || 0}">${item.code} - ${item.name}</option>`;
        });
    }

    populateAmanatSelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- اختر من الأمانات --</option>';
        this.data.amanat.forEach(item => {
            sel.innerHTML += `<option value="${item.code}" data-name="${item.name}" data-price="${item.price || 0}">${item.code} - ${item.name}</option>`;
        });
    }

    /* === Navigation === */
    initSidebarNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    window.location.href = `../${page}/index.html`;
                }
            });
        });

        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    highlightCurrentPage(pageId) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const currentNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (currentNav) currentNav.classList.add('active');
    }

    /* === Search === */
    setupSearch(searchId, renderFn, fields) {
        const input = document.getElementById(searchId);
        if (!input) return;
        const handler = () => {
            const q = input.value.toLowerCase();
            renderFn(q);
        };
        input.addEventListener('input', handler);
    }
}

window.SharedApp = SharedApp;
