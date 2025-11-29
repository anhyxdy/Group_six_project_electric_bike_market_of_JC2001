// ===== 用户认证系统 =====

// 用户数据存储
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    checkLoginStatus();
});

// ===== 初始化认证系统 =====
function initAuth() {
    // 登录按钮事件
    document.getElementById('login-btn').addEventListener('click', function() {
        showModal('login-modal');
    });

    // 注册按钮事件
    document.getElementById('register-btn').addEventListener('click', function() {
        showModal('register-modal');
    });

    // 聊天按钮事件
    document.getElementById('chat-btn').addEventListener('click', function() {
        showModal('chat-modal');
    });

    // 退出按钮事件
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });

    // 管理后台按钮（若存在）——切换页面内嵌面板显示
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            const panel = document.getElementById('admin-panel');
            if (!panel) {
                // 后备：打开单独的 admin 页面
                window.open('admin.html', '_blank');
                return;
            }
            if (panel.style.display === 'none' || panel.style.display === '') {
                panel.style.display = 'block';
                // 当面板显示时加载数据（若提供了该方法）
                if (window.adminLoadPending) window.adminLoadPending();
                // 滚动到面板
                panel.scrollIntoView({ behavior: 'smooth' });
            } else {
                panel.style.display = 'none';
            }
        });
    }

    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
}

// ===== 显示模态框 =====
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ===== 关闭模态框 =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===== 处理登录 =====
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // 验证输入
    if (!email || !password) {
        showNotification('请填写所有字段', 'warning');
        return;
    }

    // 查找用户
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // 登录成功
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showNotification(`欢迎回来，${user.name}！`, 'success');
        closeModal('login-modal');
        updateUI();
        
        // 清空表单
        document.getElementById('login-form').reset();
    } else {
        showNotification('邮箱或密码错误', 'error');
    }
}

// ===== 处理注册 =====
function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // 验证输入
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('请填写所有字段', 'warning');
        return;
    }

    // 验证密码
    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'warning');
        return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('请输入有效的邮箱地址', 'warning');
        return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showNotification('请输入有效的手机号码', 'warning');
        return;
    }

    // 检查邮箱是否已存在
    if (users.find(u => u.email === email)) {
        showNotification('该邮箱已被注册', 'warning');
        return;
    }

    // 创建新用户
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        // 如果使用特定邮箱注册则赋予 admin 权限（仅演示用）
        role: email === 'admin@group6.com' ? 'admin' : 'user',
        registerTime: new Date().toISOString()
    };

    // 保存用户
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 初始化信誉（使用前端模块生成并保存，演示用）
    if (window.reputation && typeof window.reputation.getReputation === 'function') {
        window.reputation.getReputation(newUser.id);
    }

    showNotification('注册成功！请登录', 'success');
    closeModal('register-modal');
    
    // 清空表单
    document.getElementById('register-form').reset();
    
    // 自动打开登录框
    setTimeout(() => {
        showModal('login-modal');
    }, 1000);
}

// ===== 检查登录状态 =====
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUI();
    }
}

// ===== 更新UI状态 =====
function updateUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const chatBtn = document.getElementById('chat-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');

    if (currentUser) {
        // 用户已登录
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        chatBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'inline-flex';
        // 如果是管理员，显示后台管理入口
        if (adminBtn) {
            if (currentUser.role && currentUser.role === 'admin') {
                adminBtn.style.display = 'inline-flex';
            } else {
                adminBtn.style.display = 'none';
            }
        }
        
        // 更新按钮文本（英文）
        logoutBtn.textContent = `Logout (${currentUser.name})`;
        // 在导航上显示用户信誉徽章（若模块可用）
        try {
            const navActions = logoutBtn.parentElement;
            // 移除已有的 badge 容器（如果有）
            const existing = document.getElementById('user-reputation-badge');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            const container = document.createElement('span');
            container.id = 'user-reputation-badge';
            container.style.marginLeft = '8px';
            container.style.display = 'inline-flex';
            if (window.reputation && typeof window.reputation.createReputationBadge === 'function') {
                const score = window.reputation.getReputation(currentUser.id);
                const badge = window.reputation.createReputationBadge(score);
                container.appendChild(badge);
            } else {
                container.textContent = '信誉: —';
            }
            if (navActions) navActions.insertBefore(container, logoutBtn.nextSibling);
        } catch (e) {
            console.error('渲染信誉徽章失败', e);
        }
    } else {
        // 用户未登录
        loginBtn.style.display = 'inline-flex';
        registerBtn.style.display = 'inline-flex';
        chatBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        if (adminBtn) adminBtn.style.display = 'none';
        // 确保未登录时移除任何遗留的信誉徽章
        try {
            const existing = document.getElementById('user-reputation-badge');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        } catch (e) {
            // ignore
        }
    }
}

// ===== 退出登录 =====
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    // 移除信誉徽章并更新 UI
    try {
        const existing = document.getElementById('user-reputation-badge');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    } catch (e) {}
    updateUI();
    showNotification('已退出登录', 'info');
}

// ===== 获取当前用户 =====
function getCurrentUser() {
    return currentUser;
}

// ===== 检查是否已登录 =====
function isLoggedIn() {
    return currentUser !== null;
}

// ===== 点击模态框外部关闭 =====
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===== ESC键关闭模态框 =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// ===== 导出函数供其他模块使用 =====
window.showModal = showModal;
window.closeModal = closeModal;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;

// 调试用：把当前登录用户提升为管理员（用于本地演示）
window.promoteCurrentToAdmin = function() {
    if (!currentUser) return false;
    currentUser.role = 'admin';
    // 更新 users 列表
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        users[idx].role = 'admin';
        localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUI();
    return true;
}
