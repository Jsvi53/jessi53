// 主控制脚本 - 生日庆祝网站

// 全局配置
const CONFIG = {
    // 动画配置
    animation: {
        fireworkDuration: 3000,
        confettiDuration: 3000,
        particleCount: 80,
        enableAutoEffects: true
    },
    
    // 音乐配置
    music: {
        defaultVolume: 0.3,
        fadeInDuration: 1000,
        autoplay: false
    },
    
    // 性能配置
    performance: {
        enableGPUAcceleration: true,
        reduceMotionOnLowEnd: true,
        maxParticles: 150
    },
    
    // 主题配置
    theme: {
        primaryColor: '#ff6b6b',
        secondaryColor: '#4ecdc4',
        accentColor: '#f9ca24',
        backgroundGradients: [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ]
    }
};

// 主应用类
class BirthdayApp {
    constructor() {
        this.isInitialized = false;
        this.effects = {};
        this.performance = {
            fps: 60,
            frameCount: 0,
            lastTime: performance.now()
        };
        
        this.init();
    }

    // 初始化应用
    async init() {
        try {
            console.log('🎂 初始化生日庆祝应用...');
            
            // 检测设备性能
            this.detectPerformance();
            
            // 预加载资源
            await this.preloadAssets();
            
            // 初始化核心功能
            this.initializeCore();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 启动性能监控
            this.startPerformanceMonitoring();
            
            // 显示欢迎动画
            this.showWelcomeAnimation();
            
            this.isInitialized = true;
            console.log('✅ 应用初始化完成！');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.showErrorMessage('应用加载失败，请刷新页面重试');
        }
    }

    // 检测设备性能
    detectPerformance() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        // GPU 检测
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            console.log('GPU Renderer:', renderer);
            
            // 低端设备优化
            if (renderer.toLowerCase().includes('software') || 
                renderer.toLowerCase().includes('intel')) {
                CONFIG.performance.reduceMotionOnLowEnd = true;
                CONFIG.animation.particleCount = 30;
            }
        }

        // 内存检测
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            CONFIG.performance.maxParticles = 50;
            CONFIG.animation.particleCount = 40;
        }

        // 移动设备检测
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            CONFIG.performance.maxParticles = 30;
            CONFIG.animation.particleCount = 25;
        }
    }

    // 预加载资源
    async preloadAssets() {
        const assets = [
            // 可以在这里添加需要预加载的音频、图片等资源
        ];

        // 预加载音频
        const audioPromises = [
            this.preloadAudio('assets/audio/birthday-song.mp3'),
            // 可以添加更多音频文件
        ];

        try {
            await Promise.allSettled(audioPromises);
            console.log('🎵 音频资源预加载完成');
        } catch (error) {
            console.warn('⚠️ 部分资源预加载失败:', error);
        }
    }

    // 预加载音频
    preloadAudio(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load ${src}`));
            audio.src = src;
            audio.load();
        });
    }

    // 初始化核心功能
    initializeCore() {
        // 初始化主题
        this.initializeTheme();
        
        // 初始化响应式设计
        this.initializeResponsive();
        
        // 初始化可访问性
        this.initializeAccessibility();
        
        // 初始化调试工具（开发模式）
        if (this.isDevelopment()) {
            this.initializeDebugTools();
        }
    }

    // 初始化主题
    initializeTheme() {
        document.documentElement.style.setProperty('--primary-color', CONFIG.theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', CONFIG.theme.secondaryColor);
        document.documentElement.style.setProperty('--accent-color', CONFIG.theme.accentColor);
    }

    // 初始化响应式设计
    initializeResponsive() {
        this.updateViewport();
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateViewport(), 100);
        });
    }

    // 更新视口
    updateViewport() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // 处理窗口大小变化
    handleResize() {
        this.updateViewport();
        
        // 重新初始化粒子系统
        if (window.pJSDom && window.pJSDom[0]) {
            setTimeout(() => {
                window.pJSDom[0].pJS.fn.vendors.resize();
            }, 100);
        }
    }

    // 初始化可访问性
    initializeAccessibility() {
        // 添加键盘导航支持
        this.setupKeyboardNavigation();
        
        // 添加屏幕阅读器支持
        this.setupScreenReaderSupport();
        
        // 检测用户的运动偏好
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.disableAnimations();
        }
    }

    // 设置键盘导航
    setupKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid #fff';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
    }

    // 设置屏幕阅读器支持
    setupScreenReaderSupport() {
        // 添加 aria-labels
        const musicBtn = document.getElementById('musicToggle');
        if (musicBtn) {
            musicBtn.setAttribute('aria-label', '播放生日音乐');
        }

        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach((btn, index) => {
            const labels = ['触发烟花效果', '播放彩带动画', '吹灭生日蜡烛'];
            btn.setAttribute('aria-label', labels[index] || '特效按钮');
        });
    }

    // 禁用动画（减弱运动）
    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 错误处理
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.handleError(e.error);
        });

        // 未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的 Promise 拒绝:', e.reason);
            this.handleError(e.reason);
        });
    }

    // 启动性能监控
    startPerformanceMonitoring() {
        const monitor = () => {
            const now = performance.now();
            const delta = now - this.performance.lastTime;
            
            if (delta >= 1000) {
                this.performance.fps = Math.round((this.performance.frameCount * 1000) / delta);
                this.performance.frameCount = 0;
                this.performance.lastTime = now;
                
                // 性能警告
                if (this.performance.fps < 30) {
                    console.warn('⚠️ 低帧率检测到:', this.performance.fps, 'FPS');
                    this.optimizePerformance();
                }
            }
            
            this.performance.frameCount++;
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    // 性能优化
    optimizePerformance() {
        // 减少粒子数量
        if (CONFIG.animation.particleCount > 20) {
            CONFIG.animation.particleCount -= 10;
            changeParticleMode('calm');
        }
        
        // 禁用一些特效
        CONFIG.animation.enableAutoEffects = false;
    }

    // 显示欢迎动画
    showWelcomeAnimation() {
        // 延迟显示主内容
        setTimeout(() => {
            const mainContainer = document.querySelector('.main-container');
            if (mainContainer) {
                mainContainer.style.opacity = '1';
                mainContainer.style.transform = 'translateY(0)';
            }
            
            // 启动庆祝模式
            if (CONFIG.animation.enableAutoEffects) {
                this.startCelebrationMode();
            }
        }, 500);
    }

    // 启动庆祝模式
    startCelebrationMode() {
        setTimeout(() => {
            changeParticleMode('celebration');
        }, 1000);

        // 自动特效展示
        setTimeout(() => {
            if (window.AnimationEffects) {
                window.AnimationEffects.hearts.create(5);
            }
        }, 2000);

        setTimeout(() => {
            if (window.AnimationEffects) {
                window.AnimationEffects.bubbles.createBubbles(8);
            }
        }, 4000);
    }

    // 暂停动画
    pauseAnimations() {
        if (window.AnimationEffects) {
            window.AnimationEffects.fireworks.stop();
        }
    }

    // 恢复动画
    resumeAnimations() {
        // 恢复粒子效果
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.fn.modes.pushParticles(10);
        }
    }

    // 初始化调试工具
    initializeDebugTools() {
        // 添加调试控制台
        window.DEBUG = {
            config: CONFIG,
            app: this,
            triggerFireworks: () => triggerFireworks(),
            triggerConfetti: () => triggerConfetti(),
            blowCandles: () => blowCandles(),
            changeTheme: (gradient) => {
                document.body.style.background = gradient;
            },
            getPerformance: () => this.performance
        };
        
        console.log('🛠️ 调试工具已启用，使用 DEBUG 对象访问');
        console.log('可用命令:', Object.keys(window.DEBUG));
    }

    // 错误处理
    handleError(error) {
        // 这里可以添加错误上报逻辑
        console.error('应用错误:', error);
    }

    // 显示错误消息
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 16px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // 检测是否为开发模式
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    // 清理资源
    cleanup() {
        // 停止动画
        this.pauseAnimations();
        
        // 清理事件监听器
        // 这里可以添加具体的清理逻辑
        
        console.log('🧹 资源清理完成');
    }
}

// 全局工具函数
window.Utils = {
    // 随机数生成
    random: (min, max) => Math.random() * (max - min) + min,
    
    // 颜色工具
    randomColor: () => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // 延迟执行
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // 节流函数
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 防抖函数
    debounce: (func, wait) => {
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
};

// 应用启动
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new BirthdayApp();
    window.BirthdayApp = app;
});

// 导出全局访问
window.CONFIG = CONFIG; 