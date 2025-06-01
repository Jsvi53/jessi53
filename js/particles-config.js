// Particles.js 配置
const particlesConfig = {
    "particles": {
        "number": {
            "value": 80,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#eb4d4b", "#6c5ce7"]
        },
        "shape": {
            "type": ["circle", "triangle", "star"],
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            }
        },
        "opacity": {
            "value": 0.6,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 4,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 2,
                "size_min": 0.5,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.2,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "bounce",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 100,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
};

// 初始化粒子系统
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', particlesConfig);
    } else {
        console.warn('Particles.js library not loaded');
    }
}

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保库已加载
    setTimeout(initParticles, 100);
});

// 动态改变粒子效果
function changeParticleMode(mode) {
    switch(mode) {
        case 'celebration':
            particlesConfig.particles.number.value = 120;
            particlesConfig.particles.color.value = ["#ff6b6b", "#feca57", "#ff9ff3", "#54a0ff"];
            particlesConfig.particles.move.speed = 4;
            break;
        case 'calm':
            particlesConfig.particles.number.value = 50;
            particlesConfig.particles.color.value = ["#74b9ff", "#a29bfe", "#fd79a8"];
            particlesConfig.particles.move.speed = 1;
            break;
        case 'party':
            particlesConfig.particles.number.value = 150;
            particlesConfig.particles.move.speed = 6;
            particlesConfig.particles.size.value = 6;
            break;
    }
    
    // 重新初始化粒子
    if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        particlesJS('particles-js', particlesConfig);
    }
} 