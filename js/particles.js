class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createParticle(x, y, color, type = 'normal') {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        if (type === 'win') {
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = `radial-gradient(circle at center, ${color}, transparent)`;
            particle.style.boxShadow = `0 0 10px ${color}`;
        } else {
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = color;
        }
        
        particle.style.position = 'absolute';
        particle.style.borderRadius = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const distance = type === 'win' ? 100 + Math.random() * 100 : 50 + Math.random() * 50;
        const duration = type === 'win' ? 2 : 1;
        
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        particle.style.setProperty('--duration', `${duration}s`);

        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }

    emit(x, y, color, type = 'normal', count = 20) {
        const particleCount = type === 'win' ? count * 2 : count;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(x, y, color, type);
        }
    }
} 