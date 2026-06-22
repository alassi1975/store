class InventoryApp {
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
        this.currentPage = 'inventory';
        this.deleteContext = null;
        this.currentUser = null;
        this.checkAuth();
    }

    init() {
        if (!localStorage.getItem('inv_inventory')) {
            const nums = this.data.inventory.map(i => parseInt(i.code)).filter(n => !isNaN(n));
            this.data.nextCode = nums.length > 0 ? Math.max(...nums) + 1 : 1;
            this.data.inventory.forEach(i => {
                if (i.category && !this.data.categories.includes(i.category)) {
                    this.data.categories.push(i.category);
                }
            });
            this.data.loan.forEach(i => {
                if (i.category && !this.data.categories.includes(i.category)) {
                    this.data.categories.push(i.category);
                }
            });
            this.data.amanat.forEach(i => {
                if (i.category && !this.data.categories.includes(i.category)) {
                    this.data.categories.push(i.category);
                }
            });
            this.data.inventory.forEach(i => {
                if (i.type && !this.data.types.includes(i.type)) {
                    this.data.types.push(i.type);
                }
            });
            this.saveAll();
        }
        this.bindEvents();
        this.addUserSidebarLink();
        this.applyPermissions();
        this.updateUserDisplay();
        this.applyTheme();
        this.applySidebar();
        this.switchPage('inventory');
        this.updateDate();
        setInterval(() => this.updateDate(), 1000);
    }

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage(item.dataset.page);
            });
        });

        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('addInventoryBtn').addEventListener('click', () => this.openInventoryModal());
        document.getElementById('addIncomingBtn').addEventListener('click', () => this.openIncomingModal());
        document.getElementById('addOutgoingBtn').addEventListener('click', () => this.openOutgoingModal());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });

        document.getElementById('incDate').addEventListener('change', function () {
            if (this.value) document.getElementById('incDay').value = app.getDayName(this.value);
        });
        document.getElementById('incQuantity').addEventListener('input', () => this.calcIncomingTotal());
        document.getElementById('incPrice').addEventListener('input', () => this.calcIncomingTotal());

        document.getElementById('outDate').addEventListener('change', function () {
            if (this.value) document.getElementById('outDay').value = app.getDayName(this.value);
        });
        document.getElementById('outQuantity').addEventListener('input', () => this.calcOutgoingTotal());
        document.getElementById('outPrice').addEventListener('input', () => this.calcOutgoingTotal());

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

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && document.getElementById('deleteModal').classList.contains('active')) {
                app.confirmDelete();
            }
        });
    }

    /* === Permission Items === */
    getPermItems() {
        return JSON.parse(localStorage.getItem('inv_permItems')) || [
            'المخزون - إضافة', 'المخزون - تعديل', 'المخزون - حذف',
            'الوارد - إضافة', 'الوارد - تعديل', 'الوارد - حذف',
            'الصادر - إضافة', 'الصادر - تعديل', 'الصادر - حذف',
            'الإعارة - إضافة', 'الإعارة - تعديل', 'الإعارة - حذف',
            'الأمانات - إضافة', 'الأمانات - تعديل', 'الأمانات - حذف',
            'الكهنة - إضافة', 'الكهنة - تعديل', 'الكهنة - حذف',
            'إدارة المستخدمين', 'إدارة القوائم', 'تصدير Excel'
        ];
    }

    savePermItems(items) {
        localStorage.setItem('inv_permItems', JSON.stringify(items));
    }

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

    /* === Users === */
    getUsers() {
        return JSON.parse(localStorage.getItem('inv_users')) || [];
    }

    saveUsers(users) {
        localStorage.setItem('inv_users', JSON.stringify(users));
    }

    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            localStorage.removeItem('inv_remembered_user');
            localStorage.removeItem('inv_remembered_pass');
            this.currentUser = null;
            document.getElementById('loginOverlay').style.display = 'flex';
            document.querySelector('.layout').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('setupForm').style.display = 'none';
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
            document.getElementById('rememberMe').checked = false;
            document.getElementById('loginError').style.display = 'none';
            document.getElementById('loginUser').focus();
        }
    }

    checkAuth() {
        const users = this.getUsers();
        const overlay = document.getElementById('loginOverlay');
        const layout = document.querySelector('.layout');
        if (users.length === 0) {
            overlay.style.display = 'flex';
            layout.style.display = 'none';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('setupForm').style.display = 'block';
            document.getElementById('setupError').style.display = 'none';
        } else {
            overlay.style.display = 'flex';
            layout.style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('setupForm').style.display = 'none';
            const savedUser = localStorage.getItem('inv_remembered_user');
            const savedPass = localStorage.getItem('inv_remembered_pass');
            if (savedUser) {
                document.getElementById('loginUser').value = savedUser;
                document.getElementById('loginPass').value = savedPass || '';
                document.getElementById('rememberMe').checked = true;
            }
            document.getElementById('loginUser').focus();
        }
        document.addEventListener('keydown', function authEnter(e) {
            if (e.key === 'Enter') {
                if (document.getElementById('setupForm').style.display === 'block') app.setup();
                else app.login();
            }
        });
    }

    login() {
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        const users = this.getUsers();
        const found = users.find(u => u.username === user && u.password === pass);
        if (!found) {
            document.getElementById('loginError').style.display = 'block';
            return;
        }
        if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('inv_remembered_user', user);
            localStorage.setItem('inv_remembered_pass', pass);
        } else {
            localStorage.removeItem('inv_remembered_user');
            localStorage.removeItem('inv_remembered_pass');
        }
        this.currentUser = { username: found.username, role: found.role || 'user', permissions: found.permissions || [] };
        document.getElementById('loginOverlay').style.display = 'none';
        document.querySelector('.layout').style.display = 'flex';
        this.init();
    }

    guestLogin() {
        this.currentUser = { username: 'ضيف', role: 'guest', permissions: [] };
        document.getElementById('loginOverlay').style.display = 'none';
        document.querySelector('.layout').style.display = 'flex';
        this.init();
    }

    setup() {
        const user = document.getElementById('setupUser').value.trim();
        const pass = document.getElementById('setupPass').value.trim();
        const confirm = document.getElementById('setupConfirm').value.trim();
        const err = document.getElementById('setupError');
        if (!user || !pass) {
            err.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
            err.style.display = 'block'; return;
        }
        if (pass !== confirm) {
            err.textContent = 'كلمة المرور وتأكيدها غير متطابقتين';
            err.style.display = 'block'; return;
        }
        if (pass.length < 4) {
            err.textContent = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل';
            err.style.display = 'block'; return;
        }
        err.style.display = 'none';
        const allPerms = this.getPermItems();
        this.saveUsers([{ username: user, password: pass, role: 'admin', permissions: allPerms }]);
        this.currentUser = { username: user, role: 'admin', permissions: allPerms };
        this.addUserSidebarLink();
        document.getElementById('loginOverlay').style.display = 'none';
        document.querySelector('.layout').style.display = 'flex';
        this.init();
    }

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
            a.dataset.page = 'users';
            a.innerHTML = '<span class="emoji-icon">👥</span><span>المستخدمين</span>';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.openUsersModal();
            });
            nav.appendChild(a);
        }
    }

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

    applyTheme() {
        const saved = localStorage.getItem('inv_theme');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('themeToggle').textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.getElementById('themeToggle').textContent = '🌙';
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('inv_theme', 'light');
            document.getElementById('themeToggle').textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('inv_theme', 'dark');
            document.getElementById('themeToggle').textContent = '☀️';
        }
    }

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
            document.getElementById('sidebarCollapse').textContent = '▶';
        }
    }

    updateDate() {
        const now = new Date();
        document.getElementById('dayDisplay').textContent = now.toLocaleDateString('ar-EG', { weekday: 'long' });
        document.getElementById('dateDisplay').textContent = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('timeDisplay').textContent = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    getDayName(dateStr) {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[new Date(dateStr).getDay()];
    }

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

    onLiItemSelect() {
        const sel = document.getElementById('liItemSelect');
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('liCode').value = opt.value;
        document.getElementById('liName').value = opt.dataset.name || '';
        document.getElementById('liPrice').value = opt.dataset.price || 0;
        this.calcLiTotal();
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
            btn.onclick = () => app.openListManager(listType);
            sel.parentNode.insertBefore(btn, sel.nextSibling);
        }
    }

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

        sel.onchange = function () {
            if (this.value === addValue) {
                const newVal = prompt(`أدخل ${addLabel.replace('➕ إضافة ', '').replace(' جديد...', '')} الجديد:`);
                if (newVal && newVal.trim()) {
                    const trimmed = newVal.trim();
                    if (!list.includes(trimmed)) {
                        list.push(trimmed);
                        localStorage.setItem(storageKey, JSON.stringify(list));
                    }
                    app.populateList(selectId, list, storageKey, trimmed, addLabel, addValue);
                } else {
                    app.populateList(selectId, list, storageKey, selected || '', addLabel, addValue);
                }
            }
        };
        app.addManageBtn(selectId, list === app.data.units ? 'units' : list === app.data.categories ? 'categories' : list === app.data.types ? 'types' : 'destinations');
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

    /* === List Management === */
    openListManager(type) {
        this._manageType = type;
        const labels = { units: 'الوحدات', categories: 'التصنيفات', types: 'الأنواع', destinations: 'الجهات' };
        document.getElementById('managerTitle').textContent = `إدارة ${labels[type] || 'القائمة'}`;
        document.getElementById('managerNewInput').placeholder = `إضافة ${labels[type] || ''} جديد...`;
        document.getElementById('managerNewInput').onkeydown = function (e) {
            if (e.key === 'Enter') app.addManagedItem();
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

    /* === Navigation === */
    switchPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

        const titles = {
            inventory: 'المخزون', incoming: 'الوارد / الإضافة', outgoing: 'الصادر / المنصرف',
            loan: 'الإعارة', amanat: 'الأمانات', priests: 'الكهنة'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'المخزون';

        if (page === 'inventory') this.renderInventory();
        if (page === 'incoming') this.renderIncoming();
        if (page === 'outgoing') this.renderOutgoing();
        if (page === 'loan') { this.renderLoan(); this.renderLoanIncoming(); this.renderLoanOutgoing(); }
        if (page === 'amanat') { this.renderAmanat(); this.renderAmanatIncoming(); this.renderAmanatOutgoing(); }
        if (page === 'priests') this.renderPriests();

        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
    }

    /* ========================
       المخزون (Inventory)
       ======================== */
    renderInventory() {
        const q = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
        const items = q ? this.data.inventory.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)) : this.data.inventory;
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

    openInventoryModal(id) {
        const modal = document.getElementById('inventoryModal');
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
            if (exists) {
                data.code = String(this.data.nextCode);
            }

            this.data.inventory.push(data);
            this.data.nextCode++;
        }

        this.saveAll();
        this.closeModal('inventoryModal');
        this.renderInventory();
    }

    editInventory(id) { this.openInventoryModal(id); }

    /* ========================
       الوارد / الإضافة (Incoming)
       ======================== */
    renderIncoming() {
        const q = (document.getElementById('incomingSearch')?.value || '').toLowerCase();
        const items = q ? this.data.incoming.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.incoming;
        const tbody = document.getElementById('incomingBody');
        const empty = document.getElementById('incomingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.itemCode}</td>
                <td>${item.ministryCode || '—'}</td>
                <td>${item.itemName}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td>
                <td>${item.type || '—'}</td>
                <td>${item.quantity}</td>
                <td>${item.source || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editIncoming('${item.id}')" title="تعديل" data-perm="الوارد - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('incoming','${item.id}')" title="حذف" data-perm="الوارد - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    editIncoming(id) { this.openIncomingModal(id); }

    openIncomingModal(id) {
        const modal = document.getElementById('incomingModal');
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
        this.renderInventory();
    }

    /* ========================
       الصادر / المنصرف (Outgoing)
       ======================== */
    renderOutgoing() {
        const q = (document.getElementById('outgoingSearch')?.value || '').toLowerCase();
        const items = q ? this.data.outgoing.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)) : this.data.outgoing;
        const tbody = document.getElementById('outgoingBody');
        const empty = document.getElementById('outgoingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.itemCode}</td>
                <td>${item.ministryCode || '—'}</td>
                <td>${item.itemName}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td>
                <td>${item.type || '—'}</td>
                <td>${item.quantity}</td>
                <td>${item.destination || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.notes || '—'}</td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editOutgoing('${item.id}')" title="تعديل" data-perm="الصادر - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('outgoing','${item.id}')" title="حذف" data-perm="الصادر - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    editOutgoing(id) { this.openOutgoingModal(id); }

    openOutgoingModal(id) {
        const modal = document.getElementById('outgoingModal');
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
        this.renderInventory();
    }

    /* ========================
       الإعارة (Loan)
       ======================== */
    renderLoan() {
        const items = this.data.loan;
        const tbody = document.getElementById('loanBody');
        const empty = document.getElementById('loanEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const remaining = item.openingBalance + item.incoming - item.outgoing;
            return `<tr>
                <td>${item.code}</td>
                <td>${item.ministryCode || '—'}</td>
                <td>${item.name}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td>
                <td>${item.openingBalance}</td>
                <td>${item.incoming}</td>
                <td>${item.outgoing}</td>
                <td><strong>${remaining}</strong></td>
                <td>
                    <button class="btn-icon btn-edit" onclick="app.editLoan('${item.id}')" title="تعديل" data-perm="الإعارة - تعديل"><span class="emoji-icon">✏️</span></button>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('loan','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openLoanModal(id) {
        const modal = document.getElementById('loanModal');
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

    /* ========================
       سجل الإعارة الوارد (Loan Incoming)
       ======================== */
    renderLoanIncoming() {
        const items = this.data.loanIncoming;
        const tbody = document.getElementById('loanIncomingBody');
        const empty = document.getElementById('loanIncomingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.source || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('loanIncoming','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openLoanIncomingModal(id) {
        const modal = document.getElementById('loanIncomingModal');
        document.getElementById('loanIncomingForm').reset();
        document.getElementById('liId').value = '';

        this.populateLoanSelect('liItemSelect');

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('liDate').value = today;
        document.getElementById('liDay').value = this.getDayName(today);

        const liData = id ? this.data.loanIncoming.find(i => i.id === id) : null;
        this.populateDestinations('liSource', liData?.source || '');

        if (id) {
            const item = this.data.loanIncoming.find(i => i.id === id);
            if (!item) return;
            document.getElementById('liId').value = item.id;
            document.getElementById('liDay').value = item.day || '';
            document.getElementById('liDate').value = item.date || '';
            document.getElementById('liCode').value = item.code;
            document.getElementById('liName').value = item.name;
            document.getElementById('liQuantity').value = item.quantity;
            document.getElementById('liPrice').value = item.price || 0;
            this.calcLiTotal();
        }
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

    /* ========================
       سجل الإعارة الصادر (Loan Outgoing)
       ======================== */
    renderLoanOutgoing() {
        const items = this.data.loanOutgoing;
        const tbody = document.getElementById('loanOutgoingBody');
        const empty = document.getElementById('loanOutgoingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.destination || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('loanOutgoing','${item.id}')" title="حذف" data-perm="الإعارة - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openLoanOutgoingModal() {
        const modal = document.getElementById('loanOutgoingModal');
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

    /* ========================
       الأمانات (Amanat)
       ======================== */
    populateAmanatSelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        sel.innerHTML = '<option value="">-- اختر من الأمانات --</option>';
        this.data.amanat.forEach(item => {
            sel.innerHTML += `<option value="${item.code}" data-name="${item.name}" data-price="${item.price || 0}">${item.code} - ${item.name}</option>`;
        });
    }

    renderAmanat() {
        const items = this.data.amanat;
        const tbody = document.getElementById('amanatBody');
        const empty = document.getElementById('amanatEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const remaining = item.openingBalance + item.incoming - item.outgoing;
            return `<tr>
                <td>${item.code}</td>
                <td>${item.ministryCode || '—'}</td>
                <td>${item.name}</td>
                <td>${item.unit || '—'}</td>
                <td>${item.category || '—'}</td>
                <td>${item.openingBalance}</td>
                <td>${item.incoming}</td>
                <td>${item.outgoing}</td>
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

    renderAmanatIncoming() {
        const items = this.data.amanatIncoming;
        const tbody = document.getElementById('amanatIncomingBody');
        const empty = document.getElementById('amanatIncomingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.source || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('amanatIncoming','${item.id}')" title="حذف" data-perm="الأمانات - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
            </tr>`;
        }).join('');
    }

    openAmanatIncomingModal(id) {
        document.getElementById('amanatIncomingForm').reset();
        document.getElementById('aiId').value = '';

        this.populateAmanatSelect('aiItemSelect');

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('aiDate').value = today;
        document.getElementById('aiDay').value = this.getDayName(today);

        const aiData = id ? this.data.amanatIncoming.find(i => i.id === id) : null;
        this.populateDestinations('aiSource', aiData?.source || '');

        if (id) {
            const item = this.data.amanatIncoming.find(i => i.id === id);
            if (!item) return;
            document.getElementById('aiId').value = item.id;
            document.getElementById('aiDay').value = item.day || '';
            document.getElementById('aiDate').value = item.date || '';
            document.getElementById('aiCode').value = item.code;
            document.getElementById('aiName').value = item.name;
            document.getElementById('aiQuantity').value = item.quantity;
            document.getElementById('aiPrice').value = item.price || 0;
            this.calcAiTotal();
        }
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

    renderAmanatOutgoing() {
        const items = this.data.amanatOutgoing;
        const tbody = document.getElementById('amanatOutgoingBody');
        const empty = document.getElementById('amanatOutgoingEmpty');

        if (items.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
        empty.style.display = 'none';

        tbody.innerHTML = items.map(item => {
            const total = (item.quantity || 0) * (item.price || 0);
            return `<tr>
                <td>${item.day || '—'}</td>
                <td>${item.date || '—'}</td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.destination || '—'}</td>
                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                <td>${total.toFixed(2)}</td>
                <td>
                    <button class="btn-icon btn-delete" onclick="app.deleteItem('amanatOutgoing','${item.id}')" title="حذف" data-perm="الأمانات - حذف"><span class="emoji-icon">🗑️</span></button>
                </td>
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

    /* ========================
       الكهنة (Priests)
       ======================== */
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
        const modal = document.getElementById('priestModal');
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

    /* ========================
       Delete
       ======================== */
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

        if (store === 'inventory') this.renderInventory();
        else if (store === 'incoming') this.renderIncoming();
        else if (store === 'outgoing') this.renderOutgoing();
        else if (store === 'loan') this.renderLoan();
        else if (store === 'loanIncoming') this.renderLoanIncoming();
        else if (store === 'loanOutgoing') this.renderLoanOutgoing();
        else if (store === 'amanat') this.renderAmanat();
        else if (store === 'amanatIncoming') this.renderAmanatIncoming();
        else if (store === 'amanatOutgoing') this.renderAmanatOutgoing();
        else if (store === 'priests') this.renderPriests();
    }

    /* ========================
       Modal helpers
       ======================== */
    openModal(id) {
        document.getElementById(id).classList.add('active');
        this.applyPermissions();
    }

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    /* ========================
       Excel Export
       ======================== */
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

    /* ========================
       Excel Import
       ======================== */
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

                const headers = json[0];
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
                        obj.code = row[0] ? String(row[0]) : '';
                        obj.ministryCode = row[1] ? String(row[1]) : '';
                        obj.name = row[2] ? String(row[2]) : '';
                        obj.unit = row[3] ? String(row[3]) : '';
                        obj.category = row[4] ? String(row[4]) : '';
                        obj.openingBalance = parseInt(row[5]) || 0;
                        obj.incoming = parseInt(row[6]) || 0;
                        obj.outgoing = parseInt(row[7]) || 0;
                        obj.price = 0;
                    }

                    return obj;
                }).filter(r => r.name || r.itemName);

                this.data[type] = [...this.data[type], ...imported];
                this.saveAll();
                alert(`تم استيراد ${imported.length} سجل بنجاح`);

                if (type === 'inventory') this.renderInventory();
                else if (type === 'incoming') this.renderIncoming();
                else if (type === 'outgoing') this.renderOutgoing();
                else if (type === 'loan') this.renderLoan();

            } catch (err) {
                alert('خطأ في قراءة الملف: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
        input.value = '';
    }
}

const app = new InventoryApp();
