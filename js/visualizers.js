import * as THREE from 'three';

export class Visualizers {
    constructor(canvas, audioProcessor) {
        this.canvas = canvas;
        this.audioProcessor = audioProcessor;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        
        this.currentAlgorithm = 'particles';
        this.settings = {
            sensitivity: 1.0,
            colorIntensity: 1.0,
            motionSpeed: 1.0,
            particleCount: 1000,
            colorPalette: 'rainbow'
        };
        
        this.colorPalettes = {
            rainbow: [0xff0000, 0xff8000, 0xffff00, 0x80ff00, 0x00ff00, 0x00ff80, 0x00ffff, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff, 0xff0080],
            ocean: [0x006994, 0x0099cc, 0x00ccff, 0x66d9ef, 0x99e6ff],
            fire: [0xff4500, 0xff6600, 0xff8800, 0xffaa00, 0xffcc00],
            neon: [0xff00ff, 0xff0080, 0x8000ff, 0x0080ff, 0x00ffff, 0x80ff00, 0xffff00],
            monochrome: [0x000000, 0x333333, 0x666666, 0x999999, 0xcccccc, 0xffffff],
            cyberpunk: [0xff0080, 0x00ffff, 0xff8000, 0x8000ff, 0x00ff80],
            sunset: [0xff4500, 0xff6347, 0xffa500, 0xffd700, 0xff69b4],
            aurora: [0x00ff7f, 0x00bfff, 0x9370db, 0xff1493, 0x00ced1]
        };
        
        this.particles = [];
        this.geometries = [];
        this.time = 0;
        this.audioHistory = [];
        this.beatDetector = new BeatDetector();
        
        this.initializeRenderer();
        this.initializeCamera();
        this.setupLighting();
    }

    initializeRenderer() {
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    initializeCamera() {
        this.camera.position.z = 5;
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    // Placeholder methods for visualization algorithms
    updateVisualization(audioData) {
        if (!audioData) return;
        
        this.time += 0.016; // Approximate 60fps
        
        switch (this.currentAlgorithm) {
            case 'particles':
                this.updateParticles(audioData);
                break;
            case 'waveform':
                this.updateWaveform(audioData);
                break;
            case 'spectrum':
                this.updateSpectrum(audioData);
                break;
            default:
                this.updateParticles(audioData);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    updateParticles(audioData) {
        // Basic particle system implementation
        if (this.particles.length === 0) {
            this.createParticles();
        }
        
        // Update particles based on audio data
        const bassLevel = audioData.frequencyData ? audioData.frequencyData[0] / 255 : 0;
        const beatStrength = this.beatDetector.detectBeat(bassLevel);
        
        this.particles.forEach((particle, index) => {
            if (particle && particle.position) {
                particle.position.y += Math.sin(this.time + index * 0.1) * 0.01;
                particle.position.x += Math.cos(this.time + index * 0.1) * 0.01;
                
                if (beatStrength > 0) {
                    particle.scale.setScalar(1 + beatStrength * 0.5);
                }
            }
        });
    }

    updateWaveform(audioData) {
        // Placeholder for waveform visualization
        console.log('Waveform visualization not implemented');
    }

    updateSpectrum(audioData) {
        // Placeholder for spectrum visualization
        console.log('Spectrum visualization not implemented');
    }

    createParticles() {
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material.clone());
            particle.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            this.particles.push(particle);
            this.scene.add(particle);
        }
    }

    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        // Clean up resources
        this.particles.forEach(particle => {
            this.scene.remove(particle);
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
        });
        this.particles = [];
        
        this.geometries.forEach(geometry => {
            if (geometry.dispose) geometry.dispose();
        });
        this.geometries = [];
        
        this.renderer.dispose();
    }
}

// Beat Detection Class
class BeatDetector {
    constructor() {
        this.history = [];
        this.threshold = 1.3;
        this.minTimeBetweenBeats = 200; // ms
        this.lastBeatTime = 0;
    }
    
    detectBeat(bassLevel) {
        const now = Date.now();
        this.history.push({ level: bassLevel, time: now });
        
        // Keep only recent history (last 2 seconds)
        this.history = this.history.filter(entry => now - entry.time < 2000);
        
        if (this.history.length < 10) return 0;
        
        // Calculate average and variance
        const levels = this.history.map(entry => entry.level);
        const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
        const variance = levels.reduce((sum, level) => sum + Math.pow(level - average, 2), 0) / levels.length;
        
        // Detect beat if current level is significantly above average
        const currentLevel = bassLevel;
        const beatStrength = (currentLevel - average) / Math.sqrt(variance + 0.01);
        
        if (beatStrength > this.threshold && now - this.lastBeatTime > this.minTimeBetweenBeats) {
            this.lastBeatTime = now;
            return Math.min(beatStrength / 3, 1); // Normalize to 0-1
        }
        
        return 0;
    }
}