// ===== MAIN JAVASCRIPT FOR GUESS THE WORD APP =====

class GuessTheWordApp {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.isAnimating = false;
        this.particles = [];
        this.interactiveSquares = [];
        this.floatingShapes = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createParticles();
        this.createInteractiveSquares();
        this.createFloatingShapes();
        this.setupScrollAnimations();
        this.setupCursorEffects();
        this.setupFormAnimations();
        this.setupChartAnimations();
        this.setupGameButtons();
        this.setupPopups();
        this.startAnimationLoop();
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateCursorEffects();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Click events for interactive elements
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        });

        // Input focus/blur effects
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', (e) => {
                this.handleInputFocus(e);
            });
            
            input.addEventListener('blur', (e) => {
                this.handleInputBlur(e);
            });
        });
    }

    // ===== POPUPS & CONFETTI =====
    setupPopups(){
        const popup = document.getElementById('popupContainer');
        if(!popup) return;
        const closeBtn = document.getElementById('popupCloseBtn');
        if(closeBtn){
            closeBtn.addEventListener('click', ()=> popup.remove());
        }
        // If win popup exists, run confetti
        if(popup.querySelector('.popup-card.win, .popup-card.win *, .popup-card.success, .popup-card.success *')){
            this.launchConfetti('confettiCanvas');
        }
    }

    launchConfetti(canvasId){
        const canvas = document.getElementById(canvasId);
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = canvas.offsetWidth;
        const H = canvas.height = canvas.offsetHeight;
        const colors = ['#19e56f','#ffd84d','#ffffff'];
        const pieces = Array.from({length: 120}).map(()=>({
            x: Math.random()*W,
            y: -10 - Math.random()*H,
            r: 4+Math.random()*4,
            c: colors[Math.floor(Math.random()*colors.length)],
            s: 2+Math.random()*3,
            a: Math.random()*Math.PI*2
        }));
        let animId;
        const draw = ()=>{
            ctx.clearRect(0,0,W,H);
            pieces.forEach(p=>{
                ctx.save();
                ctx.fillStyle = p.c;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.a);
                ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
                ctx.restore();
                p.y += p.s; p.x += Math.sin(p.y*0.02)*0.6; p.a += 0.02;
                if(p.y>H+20){ p.y=-10; p.x=Math.random()*W; }
            });
            animId=requestAnimationFrame(draw);
        };
        draw();
        // auto stop after 6s
        setTimeout(()=> cancelAnimationFrame(animId), 6000);
    }

    // ===== PARTICLE SYSTEM =====
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100vh';
        
        // Random size and color
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        const colors = ['#19e56f', '#ffd84d', '#ffffff'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation duration
        const duration = Math.random() * 10 + 10;
        particle.style.animationDuration = duration + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }

    // ===== INTERACTIVE SQUARES =====
    createInteractiveSquares() {
        const squaresContainer = document.getElementById('interactiveSquares');
        if (!squaresContainer) return;

        for (let i = 0; i < 15; i++) {
            this.createInteractiveSquare(squaresContainer);
        }
    }

    createInteractiveSquare(container) {
        const square = document.createElement('div');
        square.className = 'interactive-square';
        
        // Random position
        square.style.left = Math.random() * 100 + '%';
        square.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 15 + 10;
        square.style.width = size + 'px';
        square.style.height = size + 'px';
        
        // Random rotation
        square.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        // Random animation delay
        square.style.animationDelay = Math.random() * 10 + 's';
        
        // Click handler
        square.addEventListener('click', (e) => {
            this.handleSquareClick(e, square);
        });
        
        // Hover effects
        square.addEventListener('mouseenter', () => {
            this.handleSquareHover(square, true);
        });
        
        square.addEventListener('mouseleave', () => {
            this.handleSquareHover(square, false);
        });
        
        container.appendChild(square);
        this.interactiveSquares.push(square);
    }

    handleSquareClick(e, square) {
        e.preventDefault();
        
        // Create explosion effect
        this.createExplosion(e.clientX, e.clientY);
        
        // Bounce animation
        square.style.animation = 'none';
        square.style.transform = 'scale(1.5) rotate(180deg)';
        square.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            square.style.transform = 'scale(1) rotate(0deg)';
            square.style.animation = 'square-float 10s infinite linear';
        }, 300);
        
        // Change color temporarily
        const originalColor = square.style.background;
        square.style.background = '#19e56f';
        
        setTimeout(() => {
            square.style.background = originalColor;
        }, 1000);
    }

    handleSquareHover(square, isHovering) {
        if (isHovering) {
            square.style.transform = 'scale(1.2) rotate(45deg)';
            square.style.boxShadow = '0 0 20px rgba(25, 229, 111, 0.8)';
        } else {
            square.style.transform = 'scale(1) rotate(0deg)';
            square.style.boxShadow = 'none';
        }
    }

    // ===== FLOATING SHAPES =====
    createFloatingShapes() {
        const shapesContainer = document.getElementById('floatingShapes');
        if (!shapesContainer) return;

        for (let i = 0; i < 8; i++) {
            this.createFloatingShape(shapesContainer);
        }
    }

    createFloatingShape(container) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        
        // Random shape type
        const shapes = ['circle', 'square', 'triangle'];
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Random size
        const size = Math.random() * 100 + 50;
        shape.style.width = size + 'px';
        shape.style.height = size + 'px';
        
        // Random position
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = Math.random() * 100 + '%';
        
        // Random color
        const colors = ['#19e56f', '#ffd84d', '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        if (shapeType === 'circle') {
            shape.style.borderRadius = '50%';
            shape.style.background = `radial-gradient(circle, ${color}, transparent)`;
        } else if (shapeType === 'square') {
            shape.style.borderRadius = '10px';
            shape.style.background = `linear-gradient(45deg, ${color}, transparent)`;
        } else {
            shape.style.width = '0';
            shape.style.height = '0';
            shape.style.borderLeft = `${size/2}px solid transparent`;
            shape.style.borderRight = `${size/2}px solid transparent`;
            shape.style.borderBottom = `${size}px solid ${color}`;
            shape.style.background = 'none';
        }
        
        // Random animation
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        shape.style.animation = `float1 ${duration}s infinite linear`;
        shape.style.animationDelay = delay + 's';
        
        // Add eyes and smile for some shapes
        if (Math.random() > 0.5) {
            this.addFaceToShape(shape);
        }
        
        container.appendChild(shape);
        this.floatingShapes.push(shape);
    }

    addFaceToShape(shape) {
        const eyes = document.createElement('div');
        eyes.style.position = 'absolute';
        eyes.style.top = '30%';
        eyes.style.left = '50%';
        eyes.style.transform = 'translateX(-50%)';
        eyes.style.fontSize = '20px';
        eyes.style.color = '#000';
        eyes.innerHTML = '👀';
        
        const smile = document.createElement('div');
        smile.style.position = 'absolute';
        smile.style.bottom = '30%';
        smile.style.left = '50%';
        smile.style.transform = 'translateX(-50%)';
        smile.style.fontSize = '16px';
        smile.style.color = '#000';
        smile.innerHTML = '😊';
        
        shape.appendChild(eyes);
        shape.appendChild(smile);
        
        // Make face follow cursor
        shape.addEventListener('mousemove', (e) => {
            const rect = shape.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            eyes.style.transform = `translateX(-50%) rotate(${angle}rad)`;
        });
    }

    // ===== CURSOR EFFECTS =====
    setupCursorEffects() {
        // Create custom cursor
        this.createCustomCursor();
        
        // Setup cursor trail
        this.setupCursorTrail();
    }

    createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #19e56f, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            opacity: 0.8;
        `;
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });
        
        // Scale cursor on hover over interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, a, input, .interactive-square, .letter-tile')) {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.background = 'radial-gradient(circle, #ffd84d, transparent)';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('button, a, input, .interactive-square, .letter-tile')) {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'radial-gradient(circle, #19e56f, transparent)';
            }
        });
    }

    setupCursorTrail() {
        const trail = [];
        const trailLength = 10;
        
        for (let i = 0; i < trailLength; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail';
            dot.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #19e56f;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                opacity: ${1 - i / trailLength};
                transition: all 0.1s ease;
            `;
            document.body.appendChild(dot);
            trail.push(dot);
        }
        
        let lastX = 0;
        let lastY = 0;
        
        document.addEventListener('mousemove', (e) => {
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            trail.forEach((dot, index) => {
                setTimeout(() => {
                    dot.style.left = (lastX + (currentX - lastX) * (index / trailLength)) + 'px';
                    dot.style.top = (lastY + (currentY - lastY) * (index / trailLength)) + 'px';
                }, index * 10);
            });
            
            lastX = currentX;
            lastY = currentY;
        });
    }

    updateCursorEffects() {
        // Update floating shapes to look at cursor
        this.floatingShapes.forEach(shape => {
            const rect = shape.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = this.mouseX - centerX;
            const deltaY = this.mouseY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < 200) {
                const angle = Math.atan2(deltaY, deltaX);
                shape.style.transform = `rotate(${angle}rad) scale(${1 + (200 - distance) / 200 * 0.2})`;
            } else {
                shape.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    }

    // ===== SCROLL ANIMATIONS =====
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .rule-card, .stat-card, .chart-card, .table-card').forEach(el => {
            observer.observe(el);
        });
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        // Parallax effect for background elements
        document.querySelectorAll('.floating-shapes, .particles').forEach(el => {
            el.style.transform = `translateY(${parallax}px)`;
        });
        
        // Update navbar background opacity
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const opacity = Math.min(scrolled / 100, 1);
            navbar.style.background = `rgba(0, 0, 0, ${0.8 + opacity * 0.2})`;
        }
    }

    // ===== FORM ANIMATIONS =====
    setupFormAnimations() {
        // Input focus animations
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', (e) => {
                this.animateInputFocus(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.animateInputBlur(e.target);
            });
        });
        
        // Form submission animations
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                this.animateFormSubmit(form);
            });
        });
    }

    animateInputFocus(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.style.transform = 'scale(1.02)';
            wrapper.style.boxShadow = '0 0 20px rgba(25, 229, 111, 0.3)';
        }
    }

    animateInputBlur(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.style.transform = 'scale(1)';
            wrapper.style.boxShadow = 'none';
        }
    }

    animateFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.style.transform = 'scale(0.95)';
            submitBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                submitBtn.style.transform = 'scale(1)';
                submitBtn.style.opacity = '1';
            }, 200);
        }
    }

    // ===== CHART ANIMATIONS =====
    setupChartAnimations() {
        // Animate stat counters
        this.animateCounters();
        
        // Setup chart interactions
        this.setupChartInteractions();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    setupChartInteractions() {
        // Chart button interactions
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from siblings
                btn.parentNode.querySelectorAll('.chart-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Animate chart update
                this.animateChartUpdate(btn);
            });
        });
    }

    animateChartUpdate(btn) {
        const chartCard = btn.closest('.chart-card');
        if (chartCard) {
            chartCard.style.transform = 'scale(0.98)';
            chartCard.style.opacity = '0.8';
            
            setTimeout(() => {
                chartCard.style.transform = 'scale(1)';
                chartCard.style.opacity = '1';
            }, 300);
        }
    }

    // ===== CLICK HANDLERS =====
    handleClick(e) {
        // Create ripple effect
        this.createRipple(e);
        
        // Handle specific element clicks
        if (e.target.matches('.letter-tile')) {
            this.handleLetterTileClick(e.target);
        }
        
        if (e.target.matches('.btn')) {
            this.handleButtonClick(e.target);
        }
    }

    createRipple(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(25, 229, 111, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1000;
        `;
        
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        e.target.style.position = 'relative';
        e.target.style.overflow = 'hidden';
        e.target.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    handleLetterTileClick(tile) {
        // Add bounce animation
        tile.style.animation = 'none';
        tile.style.transform = 'scale(1.2) rotateY(180deg)';
        tile.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            tile.style.transform = 'scale(1) rotateY(0deg)';
        }, 300);
        
        // Change color temporarily
        const originalColor = tile.style.color;
        tile.style.color = '#ffd84d';
        
        setTimeout(() => {
            tile.style.color = originalColor;
        }, 1000);
    }

    handleButtonClick(button) {
        // Add click animation
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    // ===== EXPLOSION EFFECT =====
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, #19e56f, #ffd84d, transparent);
            pointer-events: none;
            z-index: 10000;
            animation: explosion 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 600);
    }

    // ===== UTILITY FUNCTIONS =====
    handleResize() {
        // Recalculate positions for responsive elements
        this.updateResponsiveElements();
    }

    updateResponsiveElements() {
        // Update any elements that need repositioning on resize
        this.interactiveSquares.forEach(square => {
            // Reset any position-dependent styles
            square.style.transition = 'all 0.3s ease';
        });
    }

    handleFormSubmit(e) {
        // Add loading state to forms
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Re-enable after 3 seconds (adjust based on actual form processing time)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    }

    handleInputFocus(e) {
        const input = e.target;
        const wrapper = input.closest('.input-wrapper');
        
        if (wrapper) {
            wrapper.style.transform = 'scale(1.02)';
            wrapper.style.boxShadow = '0 0 20px rgba(25, 229, 111, 0.3)';
        }
    }

    handleInputBlur(e) {
        const input = e.target;
        const wrapper = input.closest('.input-wrapper');
        
        if (wrapper) {
            wrapper.style.transform = 'scale(1)';
            wrapper.style.boxShadow = 'none';
        }
    }

    // ===== ANIMATION LOOP =====
    startAnimationLoop() {
        const animate = () => {
            this.updateAnimations();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateAnimations() {
        // Update particle positions
        this.updateParticles();
        
        // Update interactive elements
        this.updateInteractiveElements();
    }

    updateParticles() {
        // Add new particles periodically
        if (Math.random() < 0.02) {
            const particlesContainer = document.getElementById('particles');
            if (particlesContainer) {
                this.createParticle(particlesContainer);
            }
        }
    }

    updateInteractiveElements() {
        // Update square positions and animations
        this.interactiveSquares.forEach(square => {
            if (Math.random() < 0.001) {
                // Randomly change square properties
                square.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`;
            }
        });
    }

    // ===== GAME BUTTONS =====
    setupGameButtons() {
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.handleStartGame();
            });
        }
    }

    async handleStartGame() {
        const startBtn = document.getElementById('startGameBtn');
        if (!startBtn) return;

        // Show loading state
        const originalText = startBtn.innerHTML;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
        startBtn.disabled = true;

        try {
            // Create a form to submit the POST request
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/start_game';
            
            // Submit the form
            document.body.appendChild(form);
            form.submit();
            
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start new game. Please try again.');
            // Reset button state
            startBtn.innerHTML = originalText;
            startBtn.disabled = false;
        }
    }

    // ===== SCROLL TO SECTION =====
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ===== ADDITIONAL CSS ANIMATIONS =====
const additionalStyles = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

@keyframes explosion {
    0% {
        width: 0;
        height: 0;
        opacity: 1;
    }
    50% {
        width: 100px;
        height: 100px;
        opacity: 0.8;
    }
    100% {
        width: 200px;
        height: 200px;
        opacity: 0;
    }
}

.custom-cursor {
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, #19e56f, transparent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
    opacity: 0.8;
}

.cursor-trail {
    position: fixed;
    width: 4px;
    height: 4px;
    background: #19e56f;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: all 0.1s ease;
}

.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(25, 229, 111, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
    z-index: 1000;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    new GuessTheWordApp();
});

// ===== GLOBAL FUNCTIONS =====
window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// ===== EXPORT FOR MODULE SYSTEMS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuessTheWordApp;
}
