class LoginApp {
    constructor() {
        this.currentUser = null;
        this.checkAuth();
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

    checkAuth() {
        const users = this.getUsers();
        if (users.length === 0) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('setupForm').style.display = 'block';
            document.getElementById('setupUser').focus();
        } else {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('setupForm').style.display = 'none';
            document.getElementById('loginUser').focus();
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('setupForm').style.display === 'block') this.setup();
                else this.login();
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
        document.getElementById('loginError').style.display = 'none';
        localStorage.setItem('inv_current_user', JSON.stringify({
            username: found.username,
            role: found.role || 'user',
            permissions: found.permissions || []
        }));
        window.location.href = '../المخزون/index.html';
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
        localStorage.setItem('inv_current_user', JSON.stringify({
            username: user, role: 'admin', permissions: allPerms
        }));
        window.location.href = '../المخزون/index.html';
    }
}

const app = new LoginApp();
