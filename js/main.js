// ===== DOM加载完成后执行 =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== 主初始化函数 =====
function initializeApp() {
    initMobileMenu();
    initTestimonialSlider();
    initScrollAnimations();
    initSearchForm();
    initSmoothScrolling();
    initVehicleCards();
    initSellButton();
    initBackToTop();
}

// ===== 移动端菜单功能 =====
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!mobileToggle || !navMenu) return;
    
    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // 切换汉堡菜单动画
        const spans = mobileToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (mobileToggle.classList.contains('active')) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    });
    
    // 点击菜单项后关闭移动端菜单
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            resetMobileMenuIcon();
        });
    });
    
    // 点击外部区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            resetMobileMenuIcon();
        }
    });
}

function resetMobileMenuIcon() {
    const mobileToggle = document.getElementById('mobile-toggle');
    if (!mobileToggle) return;
    
    const spans = mobileToggle.querySelectorAll('span');
    spans.forEach(span => {
        span.style.transform = 'none';
        span.style.opacity = '1';
    });
}

// ===== 用户评价轮播功能 =====
function initTestimonialSlider() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    
    if (!testimonialCards.length || !dots.length) return;
    
    let currentSlide = 0;
    
    // 显示指定幻灯片
    function showSlide(index) {
        testimonialCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    // 点击圆点切换
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // 自动轮播
    setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialCards.length;
        showSlide(currentSlide);
    }, 5000);
    
    // 键盘导航
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentSlide > 0) {
            showSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight' && currentSlide < testimonialCards.length - 1) {
            showSlide(currentSlide + 1);
        }
    });
}

// ===== 滚动动画功能 =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .vehicle-card, .category-card, .about-text, .about-image');
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 初始化动画元素
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
    
    // 导航栏滚动效果
    let lastScrollY = window.scrollY;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.backdropFilter = 'none';
        }
        
        lastScrollY = currentScrollY;
    });
}

// ===== 搜索表单功能 =====
function initSearchForm() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchSelects = document.querySelectorAll('.search-select');
    
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchTerm = searchInput.value.trim();
        const priceRange = searchSelects[0].value;
        const vehicleType = searchSelects[1].value;
        
        // 模拟搜索功能
        if (searchTerm || priceRange || vehicleType) {
            showSearchResults(searchTerm, priceRange, vehicleType);
        } else {
            showNotification('Please enter search criteria', 'warning');
        }
    });
    
    // 实时搜索建议
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const value = this.value.trim();
            if (value.length > 2) {
                showSearchSuggestions(value);
            } else {
                hideSearchSuggestions();
            }
        }, 300);
    });
}

function showSearchResults(term, price, type) {
    const resultsData = {
        term: term || 'All',
        price: price || 'Any',
        type: type || 'All types',
        count: Math.floor(Math.random() * 50) + 10
    };

    showNotification(
        `Found ${resultsData.count} vehicles matching: ${resultsData.term} | ${resultsData.price} | ${resultsData.type}`,
        'success'
    );
    
    // 滚动到车辆展示区域
    document.getElementById('vehicles').scrollIntoView({
        behavior: 'smooth'
    });
}

function showSearchSuggestions(term) {
    const suggestions = [
        'Niu', 'Yadea', 'Aima', 'Tailg',
        'Luyuan', 'Ninebot', 'Sunra', 'Xinri'
    ].filter(item => item.toLowerCase().includes(term.toLowerCase()));

    // show search suggestions UI (placeholder)
    console.log('Search suggestions:', suggestions);
}

function hideSearchSuggestions() {
    // hide search suggestions
    console.log('Hide search suggestions');
}

// ===== 平滑滚动功能 =====
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // 考虑固定导航栏高度
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== 车辆卡片交互功能 =====
function initVehicleCards() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach((card, index) => {
        // 添加点击事件
        card.addEventListener('click', function() {
            showVehicleDetails(index);
        });
        
        // 添加键盘导航
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showVehicleDetails(index);
            }
        });
        
        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function showVehicleDetails(index) {
    const vehicles = [
        {
            name: '小牛电动车N1S',
            price: '¥3,200',
            originalPrice: '¥5,999',
            specs: '续航60km • 2022年',
            location: '北京朝阳区',
            description: '车况良好，定期保养，电池续航能力强，适合日常通勤使用。'
        },
        {
            name: '雅迪电动车 DE2',
            price: '¥2,800',
            originalPrice: '¥4,599',
            specs: '续航80km • 2023年',
            location: '上海浦东区',
            description: '几乎全新，使用时间短，性能优异，续航里程长。'
        },
        {
            name: '爱玛电动车 AM6',
            price: '¥1,800',
            originalPrice: '¥3,299',
            specs: '续航50km • 2021年',
            location: '广州天河区',
            description: '性价比高，适合学生和上班族，维护成本低。'
        },
        {
            name: '台铃电动车 TL800',
            price: '¥2,600',
            originalPrice: '¥4,199',
            specs: '续航70km • 2022年',
            location: '深圳南山区',
            description: '品牌知名度高，质量可靠，售后服务完善。'
        },
        {
            name: '绿源电动车 LY20',
            price: '¥3,000',
            originalPrice: '¥4,899',
            specs: '续航65km • 2023年',
            location: '杭州西湖区',
            description: '环保节能，设计时尚，配置丰富。'
        },
        {
            name: '九号电动车 C30',
            price: '¥2,400',
            originalPrice: '¥3,999',
            specs: '续航55km • 2022年',
            location: '成都锦江区',
            description: '智能化程度高，操控便捷，适合年轻人使用。'
        }
    ];
    
    const vehicle = vehicles[index];
    if (vehicle) {
        showModal(vehicle);
    }
}

// ===== 模态框功能 =====
function showModal(vehicle) {
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal-overlay" id="vehicle-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${vehicle.name}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="vehicle-image-large">
                        <div style="background: var(--light-gray); height: 200px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);">
                                            Vehicle image
                                        </div>
                    </div>
                    <div class="vehicle-details">
                        <div class="price-section">
                            <span class="current-price">${vehicle.price}</span>
                            <span class="original-price">${vehicle.originalPrice}</span>
                        </div>
                        <p class="specs">${vehicle.specs}</p>
                        <p class="location">📍 ${vehicle.location}</p>
                        <p class="description">${vehicle.description}</p>
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="contactSeller()">联系卖家</button>
                            <button class="btn btn-outline" onclick="addToFavorites()">收藏</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加模态框样式
    const modalStyles = `
        <style>
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: var(--spacing-md);
            }
            .modal-content {
                background: var(--white);
                border-radius: var(--radius-lg);
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--light-gray);
            }
            .modal-close {
                font-size: var(--font-size-2xl);
                color: var(--gray);
                background: none;
                border: none;
                cursor: pointer;
            }
            .modal-body {
                padding: var(--spacing-lg);
            }
            .vehicle-details {
                margin-top: var(--spacing-lg);
            }
            .price-section {
                margin-bottom: var(--spacing-md);
            }
            .action-buttons {
                display: flex;
                gap: var(--spacing-md);
                margin-top: var(--spacing-lg);
            }
        </style>
    `;
    
    // 添加到页面
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
    
    // ESC键关闭
    document.addEventListener('keydown', handleEscKey);
}

function closeModal() {
    const modal = document.getElementById('vehicle-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscKey);
    }
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

function contactSeller() {
    if (!isLoggedIn()) {
        showNotification('Please log in to contact the seller', 'warning');
        showModal('login-modal');
        return;
    }

    showNotification('Opening chat window...', 'info');
    setTimeout(() => {
        showModal('chat-modal');
    }, 1000);
}

function addToFavorites() {
    showNotification('Added to favorites', 'success');
}

// ===== 返回顶部功能 =====
function initBackToTop() {
    // 创建返回顶部按钮
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(backToTopButton);
    
    // 滚动显示/隐藏按钮
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    // 点击返回顶部
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== 通知功能 =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const styles = {
        info: 'background: var(--secondary-color); color: white;',
        success: 'background: var(--success-color); color: white;',
        warning: 'background: var(--warning-color); color: white;',
        error: 'background: var(--accent-color); color: white;'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-md);
        z-index: 10001;
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        ${styles[type]}
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动消失
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== 工具函数 =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===== 性能优化 =====
// 懒加载图片
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ===== 辅助功能支持 =====
function initAccessibility() {
    // 跳转到主要内容的链接
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--dark);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // 为主要区域添加ID
    const main = document.querySelector('main');
    if (main) {
        main.id = 'main-content';
    }
}

// ===== 发布车辆功能 =====
function initSellButton() {
    const sellBtn = document.getElementById('sell-btn');
    if (!sellBtn) return;
    sellBtn.addEventListener('click', function() {
        if (!window.isLoggedIn || !window.isLoggedIn()) {
            showNotification('Please log in to post a listing', 'warning');
            // 自动打开登录弹窗
            if (window.showModal) window.showModal('login-modal');
            return;
        }
        if (window.showModal) window.showModal('sell-modal');
    });

    const sellForm = document.getElementById('sell-form');
    if (sellForm) {
        sellForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSellSubmit();
        });
    }
}

function handleSellSubmit() {
    const name = document.getElementById('sell-name').value.trim();
    const price = document.getElementById('sell-price').value.trim();
    const specs = document.getElementById('sell-specs').value.trim();
    const location = document.getElementById('sell-location').value.trim();
    const description = document.getElementById('sell-description').value.trim();
    const imagesRaw = document.getElementById('sell-images').value.trim();
    const images = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (!name || !price) {
        showNotification('Please provide vehicle name and price', 'warning');
        return;
    }

    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    const listing = {
        id: Date.now(),
        name: name,
        price: price,
        specs: specs,
        location: location,
        description: description,
        images: images,
        ownerId: currentUser ? currentUser.id : null,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // 保存到 localStorage（前端演示用）
    const stored = JSON.parse(localStorage.getItem('local_listings') || '[]');
    stored.push(listing);
    localStorage.setItem('local_listings', JSON.stringify(stored));

    // 在页面中添加到车辆展示区（放到最前面）
    appendListingCard(listing, true);

    showNotification('Listing submitted — added to pending review (local demo only)', 'success');
    if (window.closeModal) window.closeModal('sell-modal');
    document.getElementById('sell-form').reset();
}

function appendListingCard(listing, scrollIntoView = false) {
    const grid = document.querySelector('.vehicles-grid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'vehicle-card';
    const imageHtml = (listing.images && listing.images.length) ? `<img src="${listing.images[0]}" alt="${listing.name}" loading="lazy">` : `<div class="vehicle-placeholder">${escapeHtml(listing.name)}</div>`;
    card.innerHTML = `
        <div class="vehicle-image">${imageHtml}<div class="vehicle-badge">For Sale</div></div>
        <div class="vehicle-info">
            <h3 class="vehicle-name">${escapeHtml(listing.name)}</h3>
            <p class="vehicle-specs">${escapeHtml(listing.specs || '')}</p>
            <div class="vehicle-price"><span class="current-price">${escapeHtml(listing.price)}</span></div>
            <div class="vehicle-location">📍 ${escapeHtml(listing.location || '')}</div>
        </div>
    `;

    // 插入到顶部
    grid.insertBefore(card, grid.firstChild);
    initVehicleCards();
    if (scrollIntoView) card.scrollIntoView({ behavior: 'smooth' });
}


// ===== 页面加载完成后的额外初始化 =====
window.addEventListener('load', function() {
    initLazyLoading();
    initAccessibility();
    
    // 页面加载性能监控
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`页面加载时间: ${loadTime}ms`);
    }
});

// ===== 错误处理 =====
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // 在生产环境中，这里可以发送错误报告到服务器
});

// ===== 导出函数供全局使用 =====
window.closeModal = closeModal;
window.contactSeller = contactSeller;
window.addToFavorites = addToFavorites; 