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
        this.meshes = [];
        this.time = 0;
        this.audioHistory = [];
        this.beatDetector = new BeatDetector();
        this.currentVisualization = null;
        
        this.initializeRenderer();
        this.initializeCamera();
        this.setupLighting();
        this.initializeVisualization();
    }

    initializeRenderer() {
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    initializeCamera() {
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        // Clear existing lights
        this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.Light));
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Dynamic point lights
        this.lights = [];
        for (let i = 0; i < 4; i++) {
            const light = new THREE.PointLight(0xffffff, 1, 100);
            const angle = (i / 4) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 30,
                Math.sin(angle) * 30,
                20
            );
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    initializeVisualization() {
        this.setAlgorithm(this.currentAlgorithm);
    }

    updateVisualization(audioData) {
        if (!audioData || !audioData.frequencyData) {
            // Create demo data if no audio
            audioData = this.createDemoAudioData();
        }
        
        this.time += 0.016; // 60fps
        
        // Process audio data
        const processedAudio = this.processAudioData(audioData);
        
        // Update lighting based on audio
        this.updateLighting(processedAudio);
        
        // Update camera movement
        this.updateCamera(processedAudio);
        
        // Update current visualization
        switch (this.currentAlgorithm) {
            case 'particles':
                this.updateParticles(processedAudio);
                break;
            case 'waveform':
                this.updateWaveform(processedAudio);
                break;
            case 'fractal':
                this.updateFractal(processedAudio);
                break;
            case 'fluid':
                this.updateFluid(processedAudio);
                break;
            case 'geometric':
                this.updateGeometric(processedAudio);
                break;
            case 'neural':
                this.updateNeural(processedAudio);
                break;
            case 'dna':
                this.updateDNA(processedAudio);
                break;
            case 'quantum':
                this.updateQuantum(processedAudio);
                break;
            case 'mandelbrot':
                this.updateMandelbrot(processedAudio);
                break;
            default:
                this.updateParticles(processedAudio);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    createDemoAudioData() {
        const frequencyData = new Uint8Array(1024);
        for (let i = 0; i < frequencyData.length; i++) {
            frequencyData[i] = Math.sin(this.time * 0.01 + i * 0.1) * 50 + 100 + Math.random() * 50;
        }
        return { frequencyData };
    }

    processAudioData(audioData) {
        const frequencyData = audioData.frequencyData;
        
        // Calculate frequency bands
        const bassEnd = Math.floor(frequencyData.length * 0.1);
        const midEnd = Math.floor(frequencyData.length * 0.5);
        
        let bass = 0, mid = 0, treble = 0;
        
        for (let i = 0; i < bassEnd; i++) {
            bass += frequencyData[i];
        }
        bass /= bassEnd;
        
        for (let i = bassEnd; i < midEnd; i++) {
            mid += frequencyData[i];
        }
        mid /= (midEnd - bassEnd);
        
        for (let i = midEnd; i < frequencyData.length; i++) {
            treble += frequencyData[i];
        }
        treble /= (frequencyData.length - midEnd);
        
        // Normalize to 0-1
        bass /= 255;
        mid /= 255;
        treble /= 255;
        
        // Apply sensitivity
        bass *= this.settings.sensitivity;
        mid *= this.settings.sensitivity;
        treble *= this.settings.sensitivity;
        
        // Beat detection
        const beatStrength = this.beatDetector.detectBeat(bass);
        
        return {
            bass,
            mid,
            treble,
            beatStrength,
            frequencyData,
            averageLevel: (bass + mid + treble) / 3
        };
    }

    updateLighting(audioData) {
        this.lights.forEach((light, index) => {
            const audioLevel = [audioData.bass, audioData.mid, audioData.treble, audioData.averageLevel][index] || 0;
            light.intensity = 0.5 + audioLevel * 2;
            
            // Color based on palette
            const color = this.getColorFromPalette(index, audioLevel);
            light.color = color;
            
            // Move lights based on audio
            const angle = this.time * 0.001 + index * Math.PI * 0.5;
            light.position.x = Math.cos(angle) * (20 + audioLevel * 10);
            light.position.y = Math.sin(angle) * (20 + audioLevel * 10);
            light.position.z = 10 + audioLevel * 20;
        });
    }

    updateCamera(audioData) {
        const bassLevel = audioData.bass;
        const beatStrength = audioData.beatStrength;
        
        // Smooth camera movement based on audio
        this.camera.position.x += (Math.sin(this.time * 0.001) * bassLevel * 5 - this.camera.position.x) * 0.1;
        this.camera.position.y += (Math.cos(this.time * 0.0015) * audioData.mid * 3 - this.camera.position.y) * 0.1;
        
        // Beat-responsive zoom
        const targetZ = 50 - beatStrength * 20;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;
        
        this.camera.lookAt(0, 0, 0);
    }

    // Enhanced Particle System
    updateParticles(audioData) {
        if (!this.currentVisualization) {
            this.createEnhancedParticles();
        }
        
        const particles = this.currentVisualization;
        const positions = particles.geometry.attributes.position.array;
        const colors = particles.geometry.attributes.color.array;
        const scales = particles.geometry.attributes.scale.array;
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            const i3 = i * 3;
            const freqIndex = Math.floor((i / this.settings.particleCount) * audioData.frequencyData.length);
            const audioLevel = audioData.frequencyData[freqIndex] / 255 * this.settings.sensitivity;
            
            // Update positions with audio-reactive movement
            positions[i3] += Math.sin(this.time * 0.01 + i * 0.1) * audioLevel * 0.1;
            positions[i3 + 1] += Math.cos(this.time * 0.01 + i * 0.1) * audioLevel * 0.1;
            positions[i3 + 2] += Math.sin(this.time * 0.005 + i * 0.05) * audioLevel * 0.05;
            
            // Beat response
            if (audioData.beatStrength > 0.5) {
                const distance = Math.sqrt(positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2);
                const expansion = audioData.beatStrength * 2;
                positions[i3] *= (1 + expansion / distance);
                positions[i3 + 1] *= (1 + expansion / distance);
                positions[i3 + 2] *= (1 + expansion / distance);
            }
            
            // Update scale
            scales[i] = 1 + audioLevel * 3 + audioData.beatStrength * 2;
            
            // Update color
            const color = this.getColorFromPalette(Math.floor(audioLevel * 10), audioLevel);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;
        
        particles.material.uniforms.time.value = this.time;
        particles.rotation.y += audioData.bass * 0.01 * this.settings.motionSpeed;
    }

    createEnhancedParticles() {
        this.clearVisualization();
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.settings.particleCount * 3);
        const colors = new Float32Array(this.settings.particleCount * 3);
        const scales = new Float32Array(this.settings.particleCount);
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            // Spherical distribution
            const radius = Math.random() * 30 + 10;
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
        
        this.currentVisualization = new THREE.Points(geometry, material);
        this.scene.add(this.currentVisualization);
    }

    // Dynamic Waveform
    updateWaveform(audioData) {
        if (!this.currentVisualization) {
            this.createWaveform();
        }
        
        const waveforms = this.currentVisualization;
        
        waveforms.forEach((waveform, waveIndex) => {
            const positions = waveform.geometry.attributes.position.array;
            
            for (let i = 0; i < 256; i++) {
                const dataIndex = Math.floor((i / 256) * audioData.frequencyData.length);
                const audioLevel = audioData.frequencyData[dataIndex] / 255;
                
                positions[i * 3 + 1] = audioLevel * 20 * this.settings.sensitivity + 
                                       Math.sin(this.time * 0.01 + i * 0.1) * 5;
                
                // Add wave offset for multiple waveforms
                positions[i * 3 + 2] = waveIndex * 5 - 10;
            }
            
            waveform.geometry.attributes.position.needsUpdate = true;
            
            // Update color based on audio
            const color = this.getColorFromPalette(waveIndex, audioData.averageLevel);
            waveform.material.color = color;
            
            // Rotate based on beat
            waveform.rotation.z += audioData.beatStrength * 0.1;
        });
    }

    createWaveform() {
        this.clearVisualization();
        this.currentVisualization = [];
        
        for (let w = 0; w < 5; w++) {
            const points = [];
            for (let i = 0; i < 256; i++) {
                points.push(new THREE.Vector3((i - 128) * 0.2, 0, w * 5 - 10));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0x00ffff,
                linewidth: 2
            });
            
            const waveform = new THREE.Line(geometry, material);
            this.scene.add(waveform);
            this.currentVisualization.push(waveform);
        }
    }

    // Fractal Generator
    updateFractal(audioData) {
        if (!this.currentVisualization) {
            this.createFractal();
        }
        
        const fractal = this.currentVisualization;
        
        // Rotate based on audio
        fractal.rotation.x += audioData.bass * 0.02 * this.settings.motionSpeed;
        fractal.rotation.y += audioData.mid * 0.01 * this.settings.motionSpeed;
        fractal.rotation.z += audioData.treble * 0.015 * this.settings.motionSpeed;
        
        // Scale based on beat
        const scale = 1 + audioData.beatStrength * 0.5;
        fractal.scale.setScalar(scale);
        
        // Update colors recursively
        this.updateFractalColors(fractal, audioData, 0);
    }

    createFractal() {
        this.clearVisualization();
        this.currentVisualization = this.createFractalGeometry(3, 5);
        this.scene.add(this.currentVisualization);
    }

    createFractalGeometry(depth, scale) {
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
                const child = this.createFractalGeometry(depth - 1, scale * 0.6);
                child.position.set(
                    Math.cos(i * Math.PI / 2) * scale * 1.5,
                    Math.sin(i * Math.PI / 2) * scale * 1.5,
                    0
                );
                mesh.add(child);
            }
        }
        
        return mesh;
    }

    updateFractalColors(mesh, audioData, depth) {
        if (mesh.material) {
            const color = this.getColorFromPalette(depth, audioData.averageLevel);
            mesh.material.color = color;
        }
        
        mesh.children.forEach((child, index) => {
            this.updateFractalColors(child, audioData, depth + index);
        });
    }

    // Fluid Dynamics
    updateFluid(audioData) {
        if (!this.currentVisualization) {
            this.createFluid();
        }
        
        const fluid = this.currentVisualization;
        fluid.material.uniforms.time.value = this.time;
        fluid.material.uniforms.audioLevel.value = audioData.averageLevel * this.settings.sensitivity;
        fluid.material.uniforms.beatStrength.value = audioData.beatStrength;
        
        fluid.rotation.x += audioData.bass * 0.005;
        fluid.rotation.y += audioData.mid * 0.003;
    }

    createFluid() {
        this.clearVisualization();
        
        const geometry = new THREE.PlaneGeometry(40, 40, 128, 128);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                audioLevel: { value: 0.0 },
                beatStrength: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float audioLevel;
                uniform float beatStrength;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    pos.z += sin(pos.x * 0.1 + time * 0.005) * audioLevel * 10.0;
                    pos.z += cos(pos.y * 0.1 + time * 0.003) * audioLevel * 5.0;
                    pos.z += sin(length(pos.xy) * 0.1 - time * 0.01) * beatStrength * 15.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform float audioLevel;
                uniform float beatStrength;
                
                void main() {
                    vec3 color1 = vec3(1.0, 0.0, 1.0);
                    vec3 color2 = vec3(0.0, 1.0, 1.0);
                    vec3 color3 = vec3(1.0, 1.0, 0.0);
                    
                    float mixer = sin(vUv.x * 10.0 + time * 0.01) * 0.5 + 0.5;
                    vec3 color = mix(color1, color2, mixer);
                    color = mix(color, color3, beatStrength);
                    color *= audioLevel + 0.3;
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.currentVisualization = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentVisualization);
    }

    // Geometric Patterns
    updateGeometric(audioData) {
        if (!this.currentVisualization) {
            this.createGeometric();
        }
        
        this.currentVisualization.forEach((mesh, index) => {
            const audioLevel = audioData.frequencyData[index * 10] / 255 * this.settings.sensitivity;
            
            mesh.rotation.x += audioLevel * 0.1 * this.settings.motionSpeed;
            mesh.rotation.y += audioLevel * 0.05 * this.settings.motionSpeed;
            mesh.scale.setScalar(1 + audioLevel * 0.5 + audioData.beatStrength * 0.3);
            
            const color = this.getColorFromPalette(index, audioLevel);
            mesh.material.color = color;
            mesh.material.opacity = 0.5 + audioLevel * 0.5;
        });
    }

    createGeometric() {
        this.clearVisualization();
        this.currentVisualization = [];
        
        const geometries = [
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.SphereGeometry(1, 16, 12),
            new THREE.ConeGeometry(1, 2, 8),
            new THREE.TorusGeometry(1, 0.3, 8, 16),
            new THREE.OctahedronGeometry(1.5),
            new THREE.TetrahedronGeometry(1.5)
        ];
        
        for (let i = 0; i < 25; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshPhongMaterial({
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.scene.add(mesh);
            this.currentVisualization.push(mesh);
        }
    }

    // Neural Network Visualization
    updateNeural(audioData) {
        if (!this.currentVisualization) {
            this.createNeural();
        }
        
        const { nodes, connections } = this.currentVisualization;
        
        // Update nodes
        nodes.forEach((node, index) => {
            const audioLevel = audioData.frequencyData[index * 5] / 255;
            node.scale.setScalar(0.5 + audioLevel * 2);
            
            const color = this.getColorFromPalette(index % 8, audioLevel);
            node.material.color = color;
            
            // Pulse with beat
            if (audioData.beatStrength > 0.5) {
                node.scale.multiplyScalar(1 + audioData.beatStrength);
            }
        });
        
        // Update connections
        connections.forEach((connection, index) => {
            const audioLevel = audioData.frequencyData[index * 3] / 255;
            connection.material.opacity = audioLevel * 0.8;
        });
    }

    createNeural() {
        this.clearVisualization();
        
        const nodes = [];
        const connections = [];
        const nodePositions = [];
        
        // Create layers
        const layers = [8, 12, 8, 4];
        let nodeIndex = 0;
        
        layers.forEach((layerSize, layerIndex) => {
            for (let i = 0; i < layerSize; i++) {
                const x = (layerIndex - layers.length / 2) * 15;
                const y = (i - layerSize / 2) * 4;
                const z = 0;
                
                const geometry = new THREE.SphereGeometry(0.5, 8, 6);
                const material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
                const node = new THREE.Mesh(geometry, material);
                
                node.position.set(x, y, z);
                nodes.push(node);
                nodePositions.push({ x, y, z, layer: layerIndex, index: i });
                this.scene.add(node);
                
                // Create connections to next layer
                if (layerIndex < layers.length - 1) {
                    const nextLayerSize = layers[layerIndex + 1];
                    for (let j = 0; j < nextLayerSize; j++) {
                        const nextX = ((layerIndex + 1) - layers.length / 2) * 15;
                        const nextY = (j - nextLayerSize / 2) * 4;
                        
                        const points = [
                            new THREE.Vector3(x, y, z),
                            new THREE.Vector3(nextX, nextY, 0)
                        ];
                        
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const material = new THREE.LineBasicMaterial({ 
                            color: 0x444444,
                            transparent: true,
                            opacity: 0.3
                        });
                        
                        const connection = new THREE.Line(geometry, material);
                        connections.push(connection);
                        this.scene.add(connection);
                    }
                }
            }
        });
        
        this.currentVisualization = { nodes, connections };
    }

    // DNA Helix
    updateDNA(audioData) {
        if (!this.currentVisualization) {
            this.createDNA();
        }
        
        const { helix1, helix2, connections } = this.currentVisualization;
        
        // Rotate helixes
        helix1.rotation.y += audioData.bass * 0.02 * this.settings.motionSpeed;
        helix2.rotation.y += audioData.bass * 0.02 * this.settings.motionSpeed;
        
        // Update colors and scales
        helix1.children.forEach((sphere, index) => {
            const audioLevel = audioData.frequencyData[index * 2] / 255;
            sphere.scale.setScalar(0.5 + audioLevel * 1.5);
            
            const color = this.getColorFromPalette(0, audioLevel);
            sphere.material.color = color;
        });
        
        helix2.children.forEach((sphere, index) => {
            const audioLevel = audioData.frequencyData[index * 2 + 1] / 255;
            sphere.scale.setScalar(0.5 + audioLevel * 1.5);
            
            const color = this.getColorFromPalette(4, audioLevel);
            sphere.material.color = color;
        });
    }

    createDNA() {
        this.clearVisualization();
        
        const helix1 = new THREE.Group();
        const helix2 = new THREE.Group();
        const connections = [];
        
        const radius = 8;
        const height = 40;
        const segments = 50;
        
        for (let i = 0; i < segments; i++) {
            const y = (i / segments) * height - height / 2;
            const angle1 = (i / segments) * Math.PI * 8;
            const angle2 = angle1 + Math.PI;
            
            // First helix
            const x1 = Math.cos(angle1) * radius;
            const z1 = Math.sin(angle1) * radius;
            
            const geometry1 = new THREE.SphereGeometry(0.5, 8, 6);
            const material1 = new THREE.MeshPhongMaterial({ color: 0xff0080 });
            const sphere1 = new THREE.Mesh(geometry1, material1);
            sphere1.position.set(x1, y, z1);
            helix1.add(sphere1);
            
            // Second helix
            const x2 = Math.cos(angle2) * radius;
            const z2 = Math.sin(angle2) * radius;
            
            const geometry2 = new THREE.SphereGeometry(0.5, 8, 6);
            const material2 = new THREE.MeshPhongMaterial({ color: 0x00ffff });
            const sphere2 = new THREE.Mesh(geometry2, material2);
            sphere2.position.set(x2, y, z2);
            helix2.add(sphere2);
            
            // Connection
            if (i % 3 === 0) {
                const points = [
                    new THREE.Vector3(x1, y, z1),
                    new THREE.Vector3(x2, y, z2)
                ];
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0x666666 });
                const connection = new THREE.Line(geometry, material);
                connections.push(connection);
                this.scene.add(connection);
            }
        }
        
        this.scene.add(helix1);
        this.scene.add(helix2);
        
        this.currentVisualization = { helix1, helix2, connections };
    }

    // Quantum Field
    updateQuantum(audioData) {
        if (!this.currentVisualization) {
            this.createQuantum();
        }
        
        const particles = this.currentVisualization;
        
        particles.forEach((particle, index) => {
            const audioLevel = audioData.frequencyData[index * 3] / 255;
            
            // Quantum tunneling effect
            particle.position.x += Math.sin(this.time * 0.01 + index) * audioLevel * 0.5;
            particle.position.y += Math.cos(this.time * 0.01 + index) * audioLevel * 0.5;
            particle.position.z += Math.sin(this.time * 0.005 + index) * audioLevel * 0.3;
            
            // Quantum entanglement - particles affect each other
            if (index > 0) {
                const prevParticle = particles[index - 1];
                const distance = particle.position.distanceTo(prevParticle.position);
                if (distance < 5) {
                    const force = (5 - distance) * 0.1;
                    particle.position.lerp(prevParticle.position, force * audioLevel);
                }
            }
            
            // Scale and color
            particle.scale.setScalar(0.3 + audioLevel * 2);
            const color = this.getColorFromPalette(index % 6, audioLevel);
            particle.material.color = color;
            
            // Quantum superposition - multiple states
            particle.material.opacity = 0.3 + audioLevel * 0.7;
        });
    }

    createQuantum() {
        this.clearVisualization();
        this.currentVisualization = [];
        
        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 8, 6);
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.5
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            );
            
            this.scene.add(particle);
            this.currentVisualization.push(particle);
        }
    }

    // 3D Mandelbrot
    updateMandelbrot(audioData) {
        if (!this.currentVisualization) {
            this.createMandelbrot();
        }
        
        const mandelbrot = this.currentVisualization;
        
        // Rotate based on audio
        mandelbrot.rotation.x += audioData.mid * 0.01;
        mandelbrot.rotation.y += audioData.bass * 0.005;
        mandelbrot.rotation.z += audioData.treble * 0.008;
        
        // Update shader uniforms
        mandelbrot.material.uniforms.time.value = this.time;
        mandelbrot.material.uniforms.audioLevel.value = audioData.averageLevel;
        mandelbrot.material.uniforms.beatStrength.value = audioData.beatStrength;
    }

    createMandelbrot() {
        this.clearVisualization();
        
        const geometry = new THREE.BoxGeometry(20, 20, 20, 32, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                audioLevel: { value: 0 },
                beatStrength: { value: 0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                uniform float time;
                uniform float audioLevel;
                
                void main() {
                    vPosition = position;
                    vec3 pos = position;
                    
                    // Mandelbrot-inspired deformation
                    float x = pos.x * 0.1;
                    float y = pos.y * 0.1;
                    float z = pos.z * 0.1;
                    
                    for(int i = 0; i < 5; i++) {
                        float xtemp = x*x - y*y - z*z + 0.5;
                        y = 2.0*x*y + 0.3;
                        z = 2.0*x*z + time * 0.01;
                        x = xtemp;
                    }
                    
                    pos += vec3(x, y, z) * audioLevel * 5.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform float time;
                uniform float audioLevel;
                uniform float beatStrength;
                
                void main() {
                    vec3 color = vec3(0.5 + 0.5 * cos(time * 0.01 + vPosition.x * 0.1));
                    color.g = 0.5 + 0.5 * cos(time * 0.01 + vPosition.y * 0.1 + 2.0);
                    color.b = 0.5 + 0.5 * cos(time * 0.01 + vPosition.z * 0.1 + 4.0);
                    
                    color *= audioLevel + 0.3;
                    color += vec3(beatStrength * 0.5);
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.currentVisualization = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentVisualization);
    }

    getColorFromPalette(index, intensity = 1) {
        const palette = this.colorPalettes[this.settings.colorPalette] || this.colorPalettes.rainbow;
        const color = new THREE.Color(palette[index % palette.length]);
        color.multiplyScalar(intensity * this.settings.colorIntensity);
        return color;
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

    setAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        this.clearVisualization();
        
        // Initialize the new visualization
        switch (algorithm) {
            case 'particles':
                this.createEnhancedParticles();
                break;
            case 'waveform':
                this.createWaveform();
                break;
            case 'fractal':
                this.createFractal();
                break;
            case 'fluid':
                this.createFluid();
                break;
            case 'geometric':
                this.createGeometric();
                break;
            case 'neural':
                this.createNeural();
                break;
            case 'dna':
                this.createDNA();
                break;
            case 'quantum':
                this.createQuantum();
                break;
            case 'mandelbrot':
                this.createMandelbrot();
                break;
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Reinitialize if particle count changed
        if (newSettings.particleCount && this.currentAlgorithm === 'particles') {
            this.createEnhancedParticles();
        }
    }

    clearVisualization() {
        if (this.currentVisualization) {
            if (Array.isArray(this.currentVisualization)) {
                this.currentVisualization.forEach(obj => {
                    this.scene.remove(obj);
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                });
            } else if (this.currentVisualization.nodes) {
                // Neural network cleanup
                this.currentVisualization.nodes.forEach(node => {
                    this.scene.remove(node);
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) node.material.dispose();
                });
                this.currentVisualization.connections.forEach(conn => {
                    this.scene.remove(conn);
                    if (conn.geometry) conn.geometry.dispose();
                    if (conn.material) conn.material.dispose();
                });
            } else if (this.currentVisualization.helix1) {
                // DNA cleanup
                this.scene.remove(this.currentVisualization.helix1);
                this.scene.remove(this.currentVisualization.helix2);
                this.currentVisualization.connections.forEach(conn => {
                    this.scene.remove(conn);
                    if (conn.geometry) conn.geometry.dispose();
                    if (conn.material) conn.material.dispose();
                });
            } else {
                this.scene.remove(this.currentVisualization);
                if (this.currentVisualization.geometry) this.currentVisualization.geometry.dispose();
                if (this.currentVisualization.material) this.currentVisualization.material.dispose();
            }
        }
        this.currentVisualization = null;
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    dispose() {
        this.clearVisualization();
        
        // Clean up lights
        this.lights.forEach(light => {
            this.scene.remove(light);
        });
        
        this.renderer.dispose();
    }
}

// Enhanced Beat Detection Class
class BeatDetector {
    constructor() {
        this.history = [];
        this.threshold = 1.5;
        this.minTimeBetweenBeats = 150; // ms
        this.lastBeatTime = 0;
        this.energyHistory = [];
        this.variance = 0;
    }
    
    detectBeat(bassLevel) {
        const now = Date.now();
        this.history.push({ level: bassLevel, time: now });
        this.energyHistory.push(bassLevel);
        
        // Keep only recent history (last 2 seconds)
        this.history = this.history.filter(entry => now - entry.time < 2000);
        if (this.energyHistory.length > 43) { // ~43 samples per second at 60fps
            this.energyHistory.shift();
        }
        
        if (this.history.length < 10) return 0;
        
        // Calculate local energy average and variance
        const recentEnergy = this.energyHistory.slice(-10);
        const localAverage = recentEnergy.reduce((sum, level) => sum + level, 0) / recentEnergy.length;
        
        // Calculate variance for adaptive threshold
        this.variance = recentEnergy.reduce((sum, level) => sum + Math.pow(level - localAverage, 2), 0) / recentEnergy.length;
        const adaptiveThreshold = this.threshold + Math.sqrt(this.variance) * 0.5;
        
        // Detect beat if current level is significantly above local average
        const currentLevel = bassLevel;
        const beatStrength = (currentLevel - localAverage) / (Math.sqrt(this.variance) + 0.01);
        
        if (beatStrength > adaptiveThreshold && now - this.lastBeatTime > this.minTimeBetweenBeats) {
            this.lastBeatTime = now;
            return Math.min(beatStrength / 4, 1); // Normalize to 0-1
        }
        
        return Math.max(0, (beatStrength - 1) / 3); // Subtle beat indication
    }
}