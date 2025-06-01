/**
 * 公告板工具函数库
 */

// 日期时间工具
const DateUtils = {
    /**
     * 格式化日期为相对时间
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return '刚刚';
        } else if (minutes < 60) {
            return `${minutes} 分钟前`;
        } else if (hours < 24) {
            return `${hours} 小时前`;
        } else if (days < 7) {
            return `${days} 天前`;
        } else {
            return this.formatDate(date);
        }
    },

    /**
     * 格式化日期为标准格式
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(date) {
        const dateStr = this.formatDate(date);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${dateStr} ${hours}:${minutes}`;
    },

    /**
     * 检查是否为今天
     */
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
};

// DOM 操作工具
const DOMUtils = {
    /**
     * 创建元素
     */
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },

    /**
     * 添加事件监听器
     */
    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    },

    /**
     * 切换元素显示/隐藏
     */
    toggle(element, className = 'active') {
        element.classList.toggle(className);
    },

    /**
     * 显示元素
     */
    show(element, className = 'active') {
        element.classList.add(className);
    },

    /**
     * 隐藏元素
     */
    hide(element, className = 'active') {
        element.classList.remove(className);
    },

    /**
     * 平滑滚动到元素
     */
    scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    },

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 文件处理工具
const FileUtils = {
    /**
     * 读取文件为Base64
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * 验证图片文件
     */
    isValidImage(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: '不支持的图片格式' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: '图片大小不能超过5MB' };
        }

        return { valid: true };
    },

    /**
     * 压缩图片
     */
    compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
};

// 字符串工具
const StringUtils = {
    /**
     * 截断文本
     */
    truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length - suffix.length) + suffix;
    },

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 高亮搜索文本
     */
    highlightText(text, search) {
        if (!search) return text;
        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    /**
     * 生成随机ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// 验证工具
const ValidationUtils = {
    /**
     * 验证必填字段
     */
    required(value, fieldName = '字段') {
        if (!value || value.trim() === '') {
            return { valid: false, message: `${fieldName}不能为空` };
        }
        return { valid: true };
    },

    /**
     * 验证文本长度
     */
    length(value, min = 0, max = Infinity, fieldName = '字段') {
        const length = value ? value.length : 0;
        
        if (length < min) {
            return { valid: false, message: `${fieldName}至少需要${min}个字符` };
        }
        
        if (length > max) {
            return { valid: false, message: `${fieldName}不能超过${max}个字符` };
        }
        
        return { valid: true };
    },

    /**
     * 组合验证
     */
    validate(value, rules = []) {
        for (const rule of rules) {
            const result = rule(value);
            if (!result.valid) {
                return result;
            }
        }
        return { valid: true };
    }
};

// 动画工具
const AnimationUtils = {
    /**
     * 添加进入动画
     */
    animateIn(element, className = 'fade-in-up') {
        element.classList.add(className);
        return new Promise(resolve => {
            element.addEventListener('animationend', resolve, { once: true });
        });
    },

    /**
     * 添加退出动画
     */
    animateOut(element, className = 'fade-out') {
        element.classList.add(className);
        return new Promise(resolve => {
            element.addEventListener('animationend', () => {
                element.classList.remove(className);
                resolve();
            }, { once: true });
        });
    },

    /**
     * 交错动画
     */
    staggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateIn(element);
            }, index * delay);
        });
    }
};

// 浏览器兼容性检测
const BrowserUtils = {
    /**
     * 检测是否支持某个特性
     */
    supports(feature) {
        const features = {
            localStorage: () => {
                try {
                    const test = 'test';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch {
                    return false;
                }
            },
            dragAndDrop: () => 'draggable' in document.createElement('div'),
            fileReader: () => typeof FileReader !== 'undefined',
            webp: () => {
                const canvas = document.createElement('canvas');
                return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            }
        };

        return features[feature] ? features[feature]() : false;
    },

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Tablet/i.test(navigator.userAgent),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }
};

// 导出工具函数
window.Utils = {
    Date: DateUtils,
    DOM: DOMUtils,
    File: FileUtils,
    String: StringUtils,
    Validation: ValidationUtils,
    Animation: AnimationUtils,
    Browser: BrowserUtils
}; 