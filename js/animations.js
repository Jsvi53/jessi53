// 动画控制模块

// 烟花效果类
class FireworkShow {
    constructor() {
        this.container = document.getElementById('fireworks');
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple'];
        this.isActive = false;
    }

    // 创建单个烟花
    createFirework(x, y) {
        const firework = document.createElement('div');
        firework.className = `firework ${this.colors[Math.floor(Math.random() * this.colors.length)]}`;
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        
        this.container.appendChild(firework);

        // 创建粒子效果
        setTimeout(() => {
            this.createParticles(x, y, firework.className.split(' ')[1]);
            firework.remove();
        }, 400);
    }

    // 创建烟花粒子
    createParticles(x, y, color) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `firework-particle ${color}`;
            
            const angle = (360 / particleCount) * i;
            const distance = 50 + Math.random() * 50;
            const endX = Math.cos(angle * Math.PI / 180) * distance;
            const endY = Math.sin(angle * Math.PI / 180) * distance;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.setProperty('--x', endX + 'px');
            particle.style.setProperty('--y', endY + 'px');
            
            this.container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1500);
        }
    }

    // 开始烟花表演
    start() {
        this.isActive = true;
        const showDuration = 3000; // 3秒表演
        const interval = 300; // 每300ms一个烟花
        
        const fireworkInterval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(fireworkInterval);
                return;
            }
            
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.6);
            this.createFirework(x, y);
        }, interval);

        setTimeout(() => {
            this.isActive = false;
            clearInterval(fireworkInterval);
        }, showDuration);
    }

    // 停止烟花
    stop() {
        this.isActive = false;
    }
}

// 彩带效果类
class ConfettiRain {
    constructor() {
        this.container = document.getElementById('confetti');
        this.colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 
                      'color-6', 'color-7', 'color-8', 'color-9', 'color-10'];
        this.shapes = ['square', 'circle', 'triangle'];
    }

    // 创建单个彩带
    createConfetti() {
        const confetti = document.createElement('div');
        const colorClass = this.colors[Math.floor(Math.random() * this.colors.length)];
        const shapeClass = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        
        confetti.className = `confetti ${shapeClass} ${colorClass}`;
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        this.container.appendChild(confetti);
        
        // 清理
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 5000);
    }

    // 开始彩带雨
    start() {
        const duration = 3000;
        const interval = 100;
        
        const confettiInterval = setInterval(() => {
            this.createConfetti();
        }, interval);

        setTimeout(() => {
            clearInterval(confettiInterval);
        }, duration);
    }
}

// 魔法粉尘效果
class MagicDust {
    constructor() {
        this.container = document.body;
    }

    // 在指定位置创建魔法粉尘
    createAt(x, y) {
        for (let i = 0; i < 8; i++) {
            const dust = document.createElement('div');
            dust.className = 'magic-dust';
            dust.style.left = x + (Math.random() - 0.5) * 20 + 'px';
            dust.style.top = y + (Math.random() - 0.5) * 20 + 'px';
            
            this.container.appendChild(dust);
            
            setTimeout(() => dust.remove(), 2000);
        }
    }
}

// 心形粒子效果
class HeartParticles {
    constructor() {
        this.container = document.body;
    }

    // 创建心形粒子
    create(count = 5) {
        for (let i = 0; i < count; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight + 'px';
            heart.style.animationDelay = Math.random() * 2 + 's';
            
            this.container.appendChild(heart);
            
            setTimeout(() => heart.remove(), 3000);
        }
    }
}

// 气泡效果
class BubbleEffect {
    constructor() {
        this.container = document.body;
    }

    // 创建气泡
    createBubbles(count = 10) {
        for (let i = 0; i < count; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 40 + 20;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = Math.random() * window.innerWidth + 'px';
            bubble.style.bottom = '-50px';
            bubble.style.animationDelay = Math.random() * 2 + 's';
            
            this.container.appendChild(bubble);
            
            setTimeout(() => bubble.remove(), 4000);
        }
    }
}

// 文字动画效果
class TextAnimations {
    // 打字机效果
    static typewriter(element, text, speed = 100) {
        element.textContent = '';
        let index = 0;
        
        const timer = setInterval(() => {
            element.textContent += text[index];
            index++;
            
            if (index >= text.length) {
                clearInterval(timer);
            }
        }, speed);
    }

    // 文字发光效果
    static addGlow(element) {
        element.classList.add('neon-glow');
    }

    // 移除发光效果
    static removeGlow(element) {
        element.classList.remove('neon-glow');
    }

    // 摇摆动画
    static shake(element) {
        element.classList.add('animate-shake');
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 500);
    }

    // 橡皮筋效果
    static rubberBand(element) {
        element.classList.add('animate-rubber');
        setTimeout(() => {
            element.classList.remove('animate-rubber');
        }, 1000);
    }
}

// 背景动画效果
class BackgroundEffects {
    // 改变背景渐变
    static changeGradient() {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        document.body.style.background = randomGradient;
    }

    // 脉冲背景效果
    static pulseBackground() {
        document.body.style.animation = 'backgroundPulse 2s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
    }
}

// 导出实例
const fireworkShow = new FireworkShow();
const confettiRain = new ConfettiRain();
const magicDust = new MagicDust();
const heartParticles = new HeartParticles();
const bubbleEffect = new BubbleEffect();

// 全局动画函数
window.AnimationEffects = {
    fireworks: fireworkShow,
    confetti: confettiRain,
    magic: magicDust,
    hearts: heartParticles,
    bubbles: bubbleEffect,
    text: TextAnimations,
    background: BackgroundEffects
}; 