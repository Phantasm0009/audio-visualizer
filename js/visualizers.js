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
            monochrome: [0x000000, 0x333333, 0x666666, 0x999999, 0xcccccc, 0xffffff]
        };
        
        this.particles = [];
        this.geometries = [];
        this.time = 0;
        
        this.initializeRenderer();
        this.initializeCamera();
        this.setupLighting();
    }

    initializeRenderer() {
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    initializeCamera() {
        this.camera.position.z = 50;
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Dynamic colored lights
        this.lights = [];
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(
                Math.cos(i * Math.PI * 2 / 3) * 30,
                Math.sin(i * Math.PI * 2 / 3) * 30,
                20
            );
            light.castShadow = true;
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    createPointTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // Particle System Visualizer
    initializeParticles() {
        this.clearScene();
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.settings.particleCount * 3);
        const colors = new Float32Array(this.settings.particleCount * 3);
        const scales = new Float32Array(this.settings.particleCount);
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            // Random spherical distribution
            const radius = Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
            
            scales[i] = Math.random() * 2 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pointTexture: { value: this.createPointTexture() }
            },
            vertexShader: `
                attribute float scale;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Add movement based on audio
                    pos.x += sin(time * 0.01 + position.y * 0.01) * 2.0;
                    pos.y += cos(time * 0.01 + position.z * 0.01) * 2.0;
                    pos.z += sin(time * 0.01 + position.x * 0.01) * 2.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = scale * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                
                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        
        try {
            this.particleSystem = new THREE.Points(geometry, material);
            this.scene.add(this.particleSystem);
        } catch (error) {
            console.warn('Error creating particle system, falling back to basic geometry:', error);
            // Fallback to basic geometry if shaders fail
            const basicMaterial = new THREE.PointsMaterial({
                color: 0x00ffff,
                size: 2,
                transparent: true,
                opacity: 0.8
            });
            this.particleSystem = new THREE.Points(geometry, basicMaterial);
            this.scene.add(this.particleSystem);
        }
    }

    // Dynamic Waveform Visualizer
    initializeWaveform() {
        this.clearScene();
        
        const points = [];
        for (let i = 0; i < 512; i++) {
            points.push(new THREE.Vector3((i - 256) * 0.1, 0, 0));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            linewidth: 2
        });
        
        this.waveform = new THREE.Line(geometry, material);
        this.scene.add(this.waveform);
        
        // Add multiple waveforms for stereo effect
        for (let i = 0; i < 5; i++) {
            const wf = this.waveform.clone();
            wf.position.z = i * 2 - 4;
            wf.material = material.clone();
            this.scene.add(wf);
            this.geometries.push(wf);
        }
    }

    // Fractal Generator
    initializeFractal() {
        this.clearScene();
        
        const createFractalGeometry = (depth, scale) => {
            const geometry = new THREE.OctahedronGeometry(scale);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.7,
                wireframe: Math.random() > 0.5
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            
            if (depth > 0) {
                for (let i = 0; i < 4; i++) {
                    const child = createFractalGeometry(depth - 1, scale * 0.6);
                    child.position.set(
                        Math.cos(i * Math.PI / 2) * scale * 1.5,
                        Math.sin(i * Math.PI / 2) * scale * 1.5,
                        0
                    );
                    mesh.add(child);
                }
            }
            
            return mesh;
        };
        
        this.fractal = createFractalGeometry(3, 5);
        this.scene.add(this.fractal);
    }

    // Fluid Dynamics Simulation
    initializeFluid() {
        this.clearScene();
        
        const geometry = new THREE.PlaneGeometry(50, 50, 64, 64);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                audioLevel: { value: 0.0 },
                resolution: { value: new THREE.Vector2(64, 64) }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float audioLevel;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    pos.z += sin(pos.x * 0.1 + time * 0.005) * audioLevel * 10.0;
                    pos.z += cos(pos.y * 0.1 + time * 0.003) * audioLevel * 5.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float audioLevel;
                
                void main() {
                    vec3 color1 = vec3(1.0, 0.0, 1.0);
                    vec3 color2 = vec3(0.0, 1.0, 1.0);
                    vec3 color = mix(color1, color2, sin(vUv.x * 10.0 + time * 0.01) * 0.5 + 0.5);
                    color *= audioLevel;
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.fluidMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.fluidMesh);
    }

    // Geometric Patterns
    initializeGeometric() {
        this.clearScene();
        
        const geometries = [
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.SphereGeometry(1, 8, 6),
            new THREE.ConeGeometry(1, 2, 6),
            new THREE.TorusGeometry(1, 0.3, 8, 16)
        ];
        
        for (let i = 0; i < 20; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshPhongMaterial({
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.scene.add(mesh);
            this.geometries.push(mesh);
        }
    }

    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        
        switch (algorithm) {
            case 'particles':
                this.initializeParticles();
                break;
            case 'waveform':
                this.initializeWaveform();
                break;
            case 'fractal':
                this.initializeFractal();
                break;
            case 'fluid':
                this.initializeFluid();
                break;
            case 'geometric':
                this.initializeGeometric();
                break;
        }
    }

    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        
        // Reinitialize if particle count changed
        if (settings.particleCount && this.currentAlgorithm === 'particles') {
            this.initializeParticles();
        }
    }

    getColorFromPalette(index, intensity = 1) {
        const palette = this.colorPalettes[this.settings.colorPalette] || this.colorPalettes.rainbow;
        const color = new THREE.Color(palette[index % palette.length]);
        color.multiplyScalar(intensity * this.settings.colorIntensity);
        return color;
    }

    animate() {
        this.time += 16 * this.settings.motionSpeed; // Assuming 60 FPS
        
        const frequencyData = this.audioProcessor.getFrequencyData();
        const timeData = this.audioProcessor.getTimeData();
        const bandLevels = this.audioProcessor.getBandLevels();
        
        // Update camera movement based on audio
        this.camera.position.x = Math.sin(this.time * 0.001) * bandLevels.bass * 0.1;
        this.camera.position.y = Math.cos(this.time * 0.0015) * bandLevels.mid * 0.1;
        this.camera.lookAt(0, 0, 0);
        
        // Update lighting based on audio
        this.lights.forEach((light, index) => {
            const audioLevel = frequencyData[index * 50] / 255;
            light.intensity = 0.5 + audioLevel * 2;
            light.color = this.getColorFromPalette(index, audioLevel);
        });
        
        // Algorithm-specific updates
        switch (this.currentAlgorithm) {
            case 'particles':
                this.updateParticles(frequencyData, bandLevels);
                break;
            case 'waveform':
                this.updateWaveform(timeData, frequencyData);
                break;
            case 'fractal':
                this.updateFractal(bandLevels);
                break;
            case 'fluid':
                this.updateFluid(frequencyData);
                break;
            case 'geometric':
                this.updateGeometric(frequencyData, bandLevels);
                break;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    updateParticles(frequencyData, bandLevels) {
        if (!this.particleSystem) return;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const scales = this.particleSystem.geometry.attributes.scale.array;
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            const freqIndex = Math.floor((i / this.settings.particleCount) * frequencyData.length);
            const audioLevel = frequencyData[freqIndex] / 255 * this.settings.sensitivity;
            
            // Update scale based on audio
            scales[i] = 1 + audioLevel * 5;
            
            // Update color
            const color = this.getColorFromPalette(Math.floor(audioLevel * 10), audioLevel);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
        this.particleSystem.geometry.attributes.scale.needsUpdate = true;
        this.particleSystem.material.uniforms.time.value = this.time;
        this.particleSystem.rotation.y += bandLevels.bass * 0.01 * this.settings.motionSpeed;
    }

    updateWaveform(timeData, frequencyData) {
        if (!this.waveform) return;
        
        const positions = this.waveform.geometry.attributes.position.array;
        
        for (let i = 0; i < 512; i++) {
            positions[i * 3 + 1] = (timeData[i] - 128) * 0.1 * this.settings.sensitivity;
        }
        
        this.waveform.geometry.attributes.position.needsUpdate = true;
        
        // Update additional waveforms
        this.geometries.forEach((wf, index) => {
            const offset = index * 20;
            for (let i = 0; i < 512; i++) {
                const dataIndex = (i + offset) % timeData.length;
                wf.geometry.attributes.position.array[i * 3 + 1] = 
                    (timeData[dataIndex] - 128) * 0.05 * this.settings.sensitivity;
            }
            wf.geometry.attributes.position.needsUpdate = true;
            
            const color = this.getColorFromPalette(index, frequencyData[index * 10] / 255);
            wf.material.color = color;
        });
    }

    updateFractal(bandLevels) {
        if (!this.fractal) return;
        
        this.fractal.rotation.x += bandLevels.bass * 0.02 * this.settings.motionSpeed;
        this.fractal.rotation.y += bandLevels.mid * 0.01 * this.settings.motionSpeed;
        this.fractal.rotation.z += bandLevels.treble * 0.015 * this.settings.motionSpeed;
        
        this.fractal.scale.setScalar(1 + bandLevels.bass * 0.3 * this.settings.sensitivity);
        
        // Update colors recursively
        const updateColors = (mesh, depth = 0) => {
            if (mesh.material) {
                const color = this.getColorFromPalette(depth, bandLevels.bass);
                mesh.material.color = color;
            }
            mesh.children.forEach((child, index) => updateColors(child, depth + index));
        };
        
        updateColors(this.fractal);
    }

    updateFluid(frequencyData) {
        if (!this.fluidMesh) return;
        
        this.fluidMesh.material.uniforms.time.value = this.time;
        
        // Calculate average audio level
        const avgLevel = frequencyData.reduce((sum, val) => sum + val, 0) / (frequencyData.length * 255);
        this.fluidMesh.material.uniforms.audioLevel.value = avgLevel * this.settings.sensitivity;
    }

    updateGeometric(frequencyData, bandLevels) {
        this.geometries.forEach((mesh, index) => {
            const audioLevel = frequencyData[index * 10] / 255 * this.settings.sensitivity;
            
            mesh.rotation.x += audioLevel * 0.1 * this.settings.motionSpeed;
            mesh.rotation.y += audioLevel * 0.05 * this.settings.motionSpeed;
            mesh.scale.setScalar(1 + audioLevel * 0.5);
            
            const color = this.getColorFromPalette(index, audioLevel);
            mesh.material.color = color;
            mesh.material.opacity = 0.5 + audioLevel * 0.5;
        });
    }

    clearScene() {
        while (this.scene.children.length > this.lights.length + 1) { // +1 for ambient light
            const child = this.scene.children[this.lights.length + 1];
            this.scene.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        }
        this.geometries = [];
        this.particleSystem = null;
        this.waveform = null;
        this.fractal = null;
        this.fluidMesh = null;
    }

    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.clearScene();
        this.renderer.dispose();
    }
}