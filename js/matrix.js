class MatrixBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-bg';
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(15, 15, 35, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#64ffda22';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        requestAnimationFrame(() => this.animate());
    }
} 