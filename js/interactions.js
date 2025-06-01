// 交互控制模块

// 音乐控制
class MusicController {
    constructor() {
        this.audio = document.getElementById('bgMusic');
        this.toggleBtn = document.getElementById('musicToggle');
        this.isPlaying = false;
        this.init();
    }

    init() {
        // 设置音频属性
        this.audio.volume = 0.3;
        this.audio.loop = true;

        // 绑定按钮事件
        this.toggleBtn.addEventListener('click', () => this.toggle());

        // 页面可见性改变时暂停/播放
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isPlaying) {
                this.pause();
            }
        });
    }

    async toggle() {
        try {
            if (this.isPlaying) {
                this.pause();
            } else {
                await this.play();
            }
        } catch (error) {
            console.log('音频播放失败:', error);
        }
    }

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updateButton();
            this.startVisualizer();
        } catch (error) {
            console.log('无法播放音频:', error);
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateButton();
        this.stopVisualizer();
    }

    updateButton() {
        const icon = this.toggleBtn.querySelector('.music-icon');
        const text = this.toggleBtn.querySelector('.music-text');
        
        if (this.isPlaying) {
            icon.textContent = '🎵';
            text.textContent = '播放中';
            this.toggleBtn.style.background = 'rgba(46, 213, 115, 0.9)';
        } else {
            icon.textContent = '🔇';
            text.textContent = '点击播放';
            this.toggleBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    }

    startVisualizer() {
        // 简单的音乐可视化效果
        this.toggleBtn.classList.add('animate-pulse');
    }

    stopVisualizer() {
        this.toggleBtn.classList.remove('animate-pulse');
    }

    setVolume(volume) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
    }
}

// 特效触发函数
function triggerFireworks() {
    // 按钮动画
    const btn = event.target;
    btn.classList.add('animate-rubber');
    
    // 启动烟花
    if (window.AnimationEffects) {
        window.AnimationEffects.fireworks.start();
        changeParticleMode('party');
    }
    
    // 背景变化
    setTimeout(() => {
        if (window.AnimationEffects) {
            window.AnimationEffects.background.changeGradient();
        }
    }, 1000);
    
    // 移除按钮动画
    setTimeout(() => {
        btn.classList.remove('animate-rubber');
    }, 1000);
}

function triggerConfetti() {
    const btn = event.target;
    btn.classList.add('animate-bounce');
    
    // 启动彩带雨
    if (window.AnimationEffects) {
        window.AnimationEffects.confetti.start();
        window.AnimationEffects.hearts.create(8);
    }
    
    // 主图标动画
    const mainIcon = document.querySelector('.main-icon');
    if (mainIcon) {
        mainIcon.classList.add('animate-heartbeat');
        setTimeout(() => {
            mainIcon.classList.remove('animate-heartbeat');
        }, 2000);
    }
    
    setTimeout(() => {
        btn.classList.remove('animate-bounce');
    }, 2000);
}

function blowCandles() {
    const btn = event.target;
    btn.classList.add('animate-glow');
    
    // 显示魔法效果
    const magicEffect = document.getElementById('magicEffect');
    magicEffect.style.opacity = '1';
    
    // 魔法粉尘效果
    if (window.AnimationEffects) {
        const rect = btn.getBoundingClientRect();
        window.AnimationEffects.magic.createAt(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
        
        // 气泡效果
        window.AnimationEffects.bubbles.createBubbles(15);
    }
    
    // 特色文字动画
    const featureText = document.getElementById('featureText');
    if (featureText) {
        const messages = [
            '✨ 创意点燃无限可能的火花！',
            '🌟 让想象力在现实中绽放光芒！',
            '🎨 每一次创新都是艺术的诞生！',
            '💫 科技与艺术的完美融合！',
            '🚀 探索未知，创造奇迹！'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        window.AnimationEffects.text.typewriter(featureText, randomMessage, 80);
    }
    
    // 隐藏魔法效果
    setTimeout(() => {
        magicEffect.style.opacity = '0';
        btn.classList.remove('animate-glow');
    }, 2000);
}

// 鼠标跟踪魔法效果
class MouseMagic {
    constructor() {
        this.lastX = 0;
        this.lastY = 0;
        this.particles = [];
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.animate();
    }

    handleMouseMove(e) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10 && window.AnimationEffects) {
            // 创建跟踪粒子
            this.createTrailParticle(e.clientX, e.clientY);
        }
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    createTrailParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'light-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--end-x', (Math.random() - 0.5) * 100 + 'px');
        particle.style.setProperty('--end-y', (Math.random() - 0.5) * 100 + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }

    animate() {
        // 动画循环
        requestAnimationFrame(() => this.animate());
    }
}

// 键盘快捷键
class KeyboardShortcuts {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case 'f':
                triggerFireworks();
                break;
            case 'c':
                triggerConfetti();
                break;
            case 'b':
                blowCandles();
                break;
            case ' ':
                e.preventDefault();
                if (window.musicController) {
                    window.musicController.toggle();
                }
                break;
            case 'r':
                // 重置所有效果
                location.reload();
                break;
        }
    }
}

// 触摸设备支持
class TouchSupport {
    constructor() {
        this.init();
    }

    init() {
        // 触摸开始
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        
        // 触摸移动
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // 长按效果
        let touchTimer;
        document.addEventListener('touchstart', (e) => {
            touchTimer = setTimeout(() => {
                this.createTouchEffect(e.touches[0].clientX, e.touches[0].clientY);
            }, 500);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.createRipple(touch.clientX, touch.clientY);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        if (window.AnimationEffects) {
            window.AnimationEffects.magic.createAt(touch.clientX, touch.clientY);
        }
    }

    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.6), transparent)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'rippleExpand 0.6s ease-out forwards';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    createTouchEffect(x, y) {
        if (window.AnimationEffects) {
            window.AnimationEffects.magic.createAt(x, y);
            window.AnimationEffects.hearts.create(3);
        }
    }
}

// 自动播放提示
class AutoplayHelper {
    constructor() {
        this.hasShownPrompt = false;
        this.init();
    }

    init() {
        // 等待用户首次交互后尝试播放音乐
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, () => this.tryAutoplay(), { once: true });
        });
    }

    async tryAutoplay() {
        if (!this.hasShownPrompt && window.musicController) {
            this.hasShownPrompt = true;
            
            // 显示音乐提示
            this.showMusicPrompt();
        }
    }

    showMusicPrompt() {
        const prompt = document.createElement('div');
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                z-index: 1000;
                font-size: 14px;
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.5s ease-out forwards;
            ">
                🎵 点击右上角按钮开启背景音乐 🎵
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        setTimeout(() => {
            prompt.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => prompt.remove(), 500);
        }, 3000);
    }
}

// 初始化所有交互控制
document.addEventListener('DOMContentLoaded', function() {
    // 初始化音乐控制器
    window.musicController = new MusicController();
    
    // 初始化鼠标魔法效果
    window.mouseMagic = new MouseMagic();
    
    // 初始化键盘快捷键
    window.keyboardShortcuts = new KeyboardShortcuts();
    
    // 初始化触摸支持
    window.touchSupport = new TouchSupport();
    
    // 初始化自动播放助手
    window.autoplayHelper = new AutoplayHelper();
    
    // 添加加载完成动画
    setTimeout(() => {
        document.body.style.opacity = '1';
        changeParticleMode('celebration');
    }, 100);
});

// CSS动画辅助
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleExpand {
        to {
            transform: translate(-50%, -50%) scale(10);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    body {
        opacity: 0;
        transition: opacity 0.5s ease-in;
    }
`;
document.head.appendChild(style); 