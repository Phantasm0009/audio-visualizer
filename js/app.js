import * as THREE from 'three';
import * as tf from '@tensorflow/tfjs';

// Import modules
import { AudioProcessor } from './audioProcessor.js';
import { Visualizers } from './visualizers.js';
import { GenreClassifier } from './genreClassifier.js';

class MusicVisualizerApp {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.genreClassifier = new GenreClassifier();
        this.visualizers = null;
        this.isPlaying = false;
        this.demoMode = false;
        this.animationId = null;
        this.canvas = null;
        
        this.currentSettings = {
            sensitivity: 1.0,
            colorIntensity: 1.0,
            motionSpeed: 1.0,
            particleCount: 2000, // Increased default
            colorPalette: 'rainbow',
            algorithm: 'particles'
        };
        
        // Advanced features
        this.socialFeatures = new SocialFeatures();
        this.performanceMonitor = new PerformanceMonitor();
        this.storyMode = new StoryMode();
        
        
        
        this.init();
    }

    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateUI();
        
        // Initialize audio processor with enhanced features
        const audioInitialized = await this.audioProcessor.initializeAudio();
        if (!audioInitialized) {
            document.getElementById('statusIndicator').textContent = 'Audio Failed to Initialize';
            return;
        }
        
        // Load enhanced genre classifier
        document.getElementById('statusIndicator').textContent = 'Loading Advanced ML Model...';
        await this.genreClassifier.loadModel();
        document.getElementById('statusIndicator').textContent = 'Ready - Upload Audio File';
        
        // Initialize enhanced visualizers
        this.visualizers = new Visualizers(this.canvas, this.audioProcessor);
        this.visualizers.setAlgorithm(this.currentSettings.algorithm);
        
        // Initialize advanced features
        this.socialFeatures.init();
        this.performanceMonitor.init();
        this.storyMode.init(this.visualizers);
        
        // Start animation loop
        this.animate();
        
        console.log('Enhanced Music Visualizer App initialized successfully');
    }

    setupCanvas() {
        this.canvas = document.getElementById('visualizer');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.visualizers) {
                this.visualizers.resize(this.canvas.width, this.canvas.height);
            }
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        // Audio file input with enhanced processing
        const audioFileInput = document.getElementById('audioFile');
        const audioPlayer = document.getElementById('audioPlayer');

        audioFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const url = URL.createObjectURL(file);
                    audioPlayer.src = url;
                    document.getElementById('fileName').textContent = file.name;
                    document.getElementById('statusIndicator').textContent = 'Loading Audio...';
                    
                    // Enhanced audio loading with metadata extraction
                    const loadPromise = new Promise((resolve, reject) => {
                        const onLoad = () => {
                            audioPlayer.removeEventListener('loadedmetadata', onLoad);
                            audioPlayer.removeEventListener('error', onError);
                            resolve();
                        };
                        const onError = (error) => {
                            audioPlayer.removeEventListener('loadedmetadata', onLoad);
                            audioPlayer.removeEventListener('error', onError);
                            reject(error);
                        };
                        audioPlayer.addEventListener('loadedmetadata', onLoad);
                        audioPlayer.addEventListener('error', onError);
                    });
                    
                    await loadPromise;
                    
                    // Connect audio element to processor
                    const connected = this.audioProcessor.connectToAudioElement(audioPlayer);
                    if (connected) {
                        document.getElementById('statusIndicator').textContent = 'Audio Ready - Click Play';
                        
                        // Initialize story mode for this track
                        this.storyMode.analyzeTrack(file);
                    } else {
                        document.getElementById('statusIndicator').textContent = 'Audio Connection Failed';
                    }
                } catch (error) {
                    console.error('Error loading audio file:', error);
                    document.getElementById('statusIndicator').textContent = 'Error Loading Audio';
                    document.getElementById('fileName').textContent = 'Failed to load: ' + file.name;
                }
            }
        });

        // Enhanced audio player events
        audioPlayer.addEventListener('play', async () => {
            if (this.audioProcessor.audioContext && this.audioProcessor.audioContext.state === 'suspended') {
                await this.audioProcessor.audioContext.resume();
            }
            this.isPlaying = true;
            document.getElementById('statusIndicator').textContent = 'Playing';
            
            // Start story mode
            this.storyMode.start();
            
            console.log('Audio Context State:', this.audioProcessor.audioContext?.state);
            console.log('Audio Element Ready State:', audioPlayer.readyState);
        });

        audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            document.getElementById('statusIndicator').textContent = 'Paused';
            this.storyMode.pause();
        });

        audioPlayer.addEventListener('ended', () => {
            this.isPlaying = false;
            document.getElementById('statusIndicator').textContent = 'Ready';
            this.storyMode.stop();
        });

        // Enhanced algorithm selection
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.currentSettings.algorithm = e.target.value;
            if (this.visualizers) {
                this.visualizers.setAlgorithm(e.target.value);
            }
        });

        // Enhanced control sliders
        this.setupSlider('sensitivity', (value) => {
            this.currentSettings.sensitivity = value;
            this.updateVisualizerSettings();
        });

        this.setupSlider('colorIntensity', (value) => {
            this.currentSettings.colorIntensity = value;
            this.updateVisualizerSettings();
        });

        this.setupSlider('motionSpeed', (value) => {
            this.currentSettings.motionSpeed = value;
            this.updateVisualizerSettings();
        });

        this.setupSlider('particleCount', (value) => {
            this.currentSettings.particleCount = parseInt(value);
            this.updateVisualizerSettings();
        });

        // Enhanced preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
                
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Enhanced color palette selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const palette = option.dataset.palette;
                this.currentSettings.colorPalette = palette;
                this.updateVisualizerSettings();
                
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').style.display = 'block';
        });

        // Advanced settings
        this.setupSlider('smoothing', (value) => {
            this.audioProcessor.updateSettings({ smoothing: value });
        });

        document.getElementById('fftSize').addEventListener('change', (e) => {
            this.audioProcessor.updateSettings({ fftSize: e.target.value });
        });

        // Enhanced share functionality with DNA system
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.openShareModal();
        });

        // Demo mode button
        document.getElementById('demoBtn').addEventListener('click', () => {
            this.toggleDemoMode();
        });

        // Setup enhanced import/export system
        this.setupAdvancedPresetSystem();
        
        // Setup social features
        this.setupSocialFeatures();
    }

    setupAdvancedPresetSystem() {
        // DNA Import button
        const dnaImportBtn = document.createElement('button');
        dnaImportBtn.textContent = 'Import DNA';
        dnaImportBtn.className = 'btn btn-secondary';
        dnaImportBtn.style.marginLeft = '10px';
        
        // Random DNA button
        const randomDNABtn = document.createElement('button');
        randomDNABtn.textContent = 'Random DNA';
        randomDNABtn.className = 'btn btn-secondary';
        randomDNABtn.style.marginLeft = '10px';
        
        const headerControls = document.querySelector('.header-controls');
        headerControls.insertBefore(dnaImportBtn, document.getElementById('shareBtn'));
        headerControls.insertBefore(randomDNABtn, document.getElementById('shareBtn'));
        
        // DNA Import modal
        const dnaModal = document.createElement('div');
        dnaModal.id = 'dnaModal';
        dnaModal.className = 'modal';
        dnaModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Import Preset DNA</h2>
                    <button class="close-btn" onclick="closeDNAModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="dna-content">
                        <p>Enter a 12-character DNA code:</p>
                        <input type="text" id="dnaInput" placeholder="e.g., K3j9F2i8xQ4m" maxlength="12" class="dna-input">
                        <div class="share-buttons">
                            <button class="btn btn-primary" onclick="importDNA()">Import DNA</button>
                            <button class="btn btn-secondary" onclick="closeDNAModal()">Cancel</button>
                        </div>
                        <div id="dnaStatus" style="margin-top: 10px; color: #4ecdc4;"></div>
                        <div class="dna-info">
                            <small>DNA format: [Algorithm:2][Palette:2][Sensitivity:2][Color:2][Motion:2][Particles:2]</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dnaModal);
        
        // Event listeners
        dnaImportBtn.addEventListener('click', () => {
            document.getElementById('dnaModal').style.display = 'block';
        });
        
        randomDNABtn.addEventListener('click', () => {
            const randomDNA = this.genreClassifier.presetDNA.generateRandomDNA();
            try {
                const settings = this.genreClassifier.importPresetDNA(randomDNA);
                this.currentSettings = { ...this.currentSettings, ...settings };
                this.updateUIFromSettings();
                this.updateVisualizerSettings();
                this.showNotification(`Applied random DNA: ${randomDNA}`);
            } catch (error) {
                console.error('Error applying random DNA:', error);
            }
        });
        
        // Global functions
        window.closeDNAModal = () => {
            document.getElementById('dnaModal').style.display = 'none';
            document.getElementById('dnaInput').value = '';
            document.getElementById('dnaStatus').textContent = '';
        };
        
        window.importDNA = () => {
            const dnaCode = document.getElementById('dnaInput').value.trim();
            const statusDiv = document.getElementById('dnaStatus');
            
            if (!dnaCode) {
                statusDiv.textContent = 'Please enter a DNA code';
                statusDiv.style.color = '#ff6b6b';
                return;
            }
            
            if (dnaCode.length !== 12) {
                statusDiv.textContent = 'DNA code must be exactly 12 characters';
                statusDiv.style.color = '#ff6b6b';
                return;
            }
            
            try {
                const settings = this.genreClassifier.importPresetDNA(dnaCode);
                this.currentSettings = { ...this.currentSettings, ...settings };
                this.updateUIFromSettings();
                this.updateVisualizerSettings();
                
                statusDiv.textContent = 'DNA imported successfully!';
                statusDiv.style.color = '#4ecdc4';
                
                setTimeout(() => {
                    window.closeDNAModal();
                }, 2000);
                
            } catch (error) {
                statusDiv.textContent = error.message;
                statusDiv.style.color = '#ff6b6b';
            }
        };
        
        // Legacy import system
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import Preset';
        importBtn.className = 'btn btn-secondary';
        importBtn.style.marginLeft = '10px';
        
        headerControls.insertBefore(importBtn, document.getElementById('shareBtn'));
        
        const importModal = document.createElement('div');
        importModal.id = 'importModal';
        importModal.className = 'modal';
        importModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Import Preset</h2>
                    <button class="close-btn" onclick="closeImportModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-content">
                        <p>Paste your preset code below:</p>
                        <textarea id="importPresetCode" placeholder="Paste preset code here..." class="preset-textarea"></textarea>
                        <div class="share-buttons">
                            <button class="btn btn-primary" onclick="importPreset()">Import Preset</button>
                            <button class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>
                        </div>
                        <div id="importStatus" style="margin-top: 10px; color: #4ecdc4;"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(importModal);
        
        importBtn.addEventListener('click', () => {
            document.getElementById('importModal').style.display = 'block';
        });
        
        window.closeImportModal = () => {
            document.getElementById('importModal').style.display = 'none';
            document.getElementById('importPresetCode').value = '';
            document.getElementById('importStatus').textContent = '';
        };
        
        window.importPreset = () => {
            const presetCode = document.getElementById('importPresetCode').value.trim();
            const statusDiv = document.getElementById('importStatus');
            
            if (!presetCode) {
                statusDiv.textContent = 'Please paste a preset code';
                statusDiv.style.color = '#ff6b6b';
                return;
            }
            
            try {
                const importedSettings = this.genreClassifier.importPreset(presetCode);
                this.currentSettings = { ...this.currentSettings, ...importedSettings };
                this.updateUIFromSettings();
                this.updateVisualizerSettings();
                
                statusDiv.textContent = 'Preset imported successfully!';
                statusDiv.style.color = '#4ecdc4';
                
                setTimeout(() => {
                    window.closeImportModal();
                }, 2000);
                
            } catch (error) {
                statusDiv.textContent = error.message;
                statusDiv.style.color = '#ff6b6b';
            }
        };
    }

    setupSocialFeatures() {
        // Video recording button
        const recordBtn = document.createElement('button');
        recordBtn.textContent = '🎥 Record';
        recordBtn.className = 'btn btn-secondary';
        recordBtn.style.marginLeft = '10px';
        
        const headerControls = document.querySelector('.header-controls');
        headerControls.appendChild(recordBtn);
        
        recordBtn.addEventListener('click', () => {
            this.socialFeatures.toggleRecording(this.canvas);
        });
        
        // Screenshot button
        const screenshotBtn = document.createElement('button');
        screenshotBtn.textContent = '📸 Screenshot';
        screenshotBtn.className = 'btn btn-secondary';
        screenshotBtn.style.marginLeft = '10px';
        
        headerControls.appendChild(screenshotBtn);
        
        screenshotBtn.addEventListener('click', () => {
            this.socialFeatures.takeScreenshot(this.canvas);
        });
    }

    updateUIFromSettings() {
        document.getElementById('algorithmSelect').value = this.currentSettings.algorithm;
        document.getElementById('sensitivity').value = this.currentSettings.sensitivity;
        document.getElementById('colorIntensity').value = this.currentSettings.colorIntensity;
        document.getElementById('motionSpeed').value = this.currentSettings.motionSpeed;
        document.getElementById('particleCount').value = this.currentSettings.particleCount;
        
        document.getElementById('sensitivityValue').textContent = this.currentSettings.sensitivity;
        document.getElementById('colorIntensityValue').textContent = this.currentSettings.colorIntensity;
        document.getElementById('motionSpeedValue').textContent = this.currentSettings.motionSpeed;
        document.getElementById('particleCountValue').textContent = this.currentSettings.particleCount;
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.palette === this.currentSettings.colorPalette);
        });
        
        if (this.visualizers) {
            this.visualizers.setAlgorithm(this.currentSettings.algorithm);
        }
    }

    setupSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = value;
            callback(value);
        });
    }

    updateVisualizerSettings() {
        if (this.visualizers) {
            this.visualizers.updateSettings(this.currentSettings);
        }
    }

    applyPreset(presetName) {
        const preset = this.genreClassifier.getGenrePreset(presetName);
        
        this.currentSettings = { ...this.currentSettings, ...preset };
        this.updateUIFromSettings();
        
        console.log(`Applied preset: ${presetName}`, preset);
    }

    async animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Performance monitoring
        this.performanceMonitor.update();
        
        if (this.visualizers) {
            if (this.isPlaying) {
                if (this.demoMode) {
                    this.createDemoVisualization();
                } else {
                    // Enhanced audio processing
                    const audioFeatures = await this.audioProcessor.extractFeaturesAsync();
                    const frequencyData = this.audioProcessor.getFrequencyData();
                    
                    // Update visualization with enhanced data
                    this.visualizers.updateVisualization({ 
                        frequencyData,
                        audioFeatures 
                    });
                    
                    // Story mode updates
                    this.storyMode.update(audioFeatures);
                    
                    // Genre classification with enhanced features
                    if (Math.floor(Date.now() / 2000) !== this.lastGenreUpdate) {
                        this.lastGenreUpdate = Math.floor(Date.now() / 2000);
                        try {
                            this.updateGenreClassification(audioFeatures);
                        } catch (error) {
                            console.warn('Genre classification error:', error);
                        }
                    }
                    
                    this.updateFrequencyDisplay();
                }
            }
        }
    }

    createDemoVisualization() {
        if (!this.visualizers) return;
        
        const time = Date.now() * 0.001;
        
        // Enhanced demo movement with multiple patterns
        this.visualizers.camera.position.x = Math.sin(time * 0.3) * 12 + Math.cos(time * 0.1) * 5;
        this.visualizers.camera.position.y = Math.cos(time * 0.25) * 8 + Math.sin(time * 0.15) * 3;
        this.visualizers.camera.position.z = 50 + Math.sin(time * 0.2) * 15;
        this.visualizers.camera.lookAt(0, 0, 0);
        
        this.visualizers.renderer.render(this.visualizers.scene, this.visualizers.camera);
    }

    toggleDemoMode() {
        this.demoMode = !this.demoMode;
        const demoBtn = document.getElementById('demoBtn');
        
        if (this.demoMode) {
            this.isPlaying = true;
            demoBtn.textContent = 'Stop Demo';
            demoBtn.classList.add('active');
            document.getElementById('statusIndicator').textContent = 'Demo Mode Active';
        } else {
            this.isPlaying = false;
            demoBtn.textContent = 'Demo Mode';
            demoBtn.classList.remove('active');
            document.getElementById('statusIndicator').textContent = 'Ready - Upload Audio File';
        }
    }

    async updateGenreClassification(audioFeatures) {
        try {
            const result = await this.genreClassifier.classifyGenre(audioFeatures);
            
            document.getElementById('detectedGenre').textContent = 
                result.genre.charAt(0).toUpperCase() + result.genre.slice(1);
            
            const confidenceLevel = document.getElementById('confidenceLevel');
            confidenceLevel.style.width = (result.confidence * 100) + '%';
            
            // Enhanced auto-apply with higher threshold
            if (result.confidence > 0.8) {
                const presetBtn = document.querySelector(`[data-preset="${result.genre}"]`);
                if (presetBtn && !presetBtn.classList.contains('active')) {
                    const activePreset = document.querySelector('.preset-btn.active');
                    if (!activePreset) {
                        this.applyPreset(result.genre);
                        presetBtn.classList.add('active');
                        
                        this.showNotification(`Auto-applied ${result.genre} preset (${Math.round(result.confidence * 100)}% confidence)`);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating genre classification:', error);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 3000;
            font-size: 14px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    updateFrequencyDisplay() {
        const frequencyData = this.audioProcessor.getFrequencyData();
        const frequencyDisplay = document.getElementById('frequencyDisplay');
        
        frequencyDisplay.innerHTML = '';
        
        // Enhanced frequency bars with better resolution
        for (let i = 0; i < 128; i++) {
            const bar = document.createElement('div');
            bar.className = 'freq-bar';
            const height = (frequencyData[i] / 255 * 120) + 'px';
            bar.style.height = height;
            bar.style.background = `hsl(${i * 2.8}, 70%, 60%)`;
            bar.style.width = '2px';
            bar.style.marginRight = '1px';
            frequencyDisplay.appendChild(bar);
        }
    }

    openShareModal() {
        const presetData = this.genreClassifier.exportPreset(this.currentSettings);
        const dnaCode = this.genreClassifier.exportPresetDNA(this.currentSettings);
        
        document.getElementById('presetCode').value = presetData;
        
        // Add DNA code display
        const shareModal = document.getElementById('shareModal');
        const modalBody = shareModal.querySelector('.modal-body');
        
        // Check if DNA section already exists
        let dnaSection = modalBody.querySelector('.dna-section');
        if (!dnaSection) {
            dnaSection = document.createElement('div');
            dnaSection.className = 'dna-section';
            dnaSection.innerHTML = `
                <h4 style="color: #4ecdc4; margin-top: 1rem;">Preset DNA Code</h4>
                <input type="text" id="dnaCode" readonly class="dna-input" style="width: 100%; padding: 0.5rem; margin: 0.5rem 0; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 4px; font-family: monospace; font-size: 1.2rem; text-align: center;">
                <div class="share-buttons" style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" onclick="copyDNA()">Copy DNA</button>
                </div>
                <div class="dna-info" style="margin-top: 0.5rem;">
                    <small style="color: #888;">Share this 12-character code for instant preset sharing!</small>
                </div>
            `;
            modalBody.appendChild(dnaSection);
        }
        
        document.getElementById('dnaCode').value = dnaCode;
        document.getElementById('shareModal').style.display = 'block';
    }

    updateUI() {
        this.updateUIFromSettings();
        document.getElementById('smoothingValue').textContent = '0.8';
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.visualizers) {
            this.visualizers.dispose();
        }
        
        this.audioProcessor.dispose();
        this.genreClassifier.dispose();
        this.socialFeatures.dispose();
        this.performanceMonitor.dispose();
        this.storyMode.dispose();
    }
}

// Social Features Class
class SocialFeatures {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
    }
    
    init() {
        // Add CSS animations for notifications
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .dna-input {
                width: 100%;
                padding: 0.75rem;
                margin: 0.5rem 0;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                font-size: 1rem;
                text-align: center;
                letter-spacing: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    async toggleRecording(canvas) {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording(canvas);
        }
    }
    
    async startRecording(canvas) {
        try {
            const stream = canvas.captureStream(30); // 30 FPS
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update button
            const recordBtn = document.querySelector('button:contains("🎥 Record")') || 
                             Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Record'));
            if (recordBtn) {
                recordBtn.textContent = '⏹️ Stop Recording';
                recordBtn.classList.add('active');
            }
            
            this.showNotification('Recording started! 🎥');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showNotification('Recording failed. Please try again.');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update button
            const recordBtn = document.querySelector('button:contains("⏹️ Stop Recording")') || 
                             Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Stop Recording'));
            if (recordBtn) {
                recordBtn.textContent = '🎥 Record';
                recordBtn.classList.remove('active');
            }
        }
    }
    
    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `music-visualizer-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Recording saved! 💾');
    }
    
    takeScreenshot(canvas) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `music-visualizer-screenshot-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Screenshot saved! 📸');
        });
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 3000;
            font-size: 14px;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    dispose() {
        if (this.isRecording) {
            this.stopRecording();
        }
    }
}

// Performance Monitor Class
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.fps = 60;
        this.memoryUsage = 0;
    }
    
    init() {
        // Monitor performance metrics
        setInterval(() => {
            this.updateMemoryUsage();
        }, 5000);
    }
    
    update() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            // Update FPS display
            const fpsElement = document.getElementById('fpsCounter');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${this.fps}`;
                
                // Color code based on performance
                if (this.fps >= 50) {
                    fpsElement.style.color = '#4ecdc4';
                } else if (this.fps >= 30) {
                    fpsElement.style.color = '#feca57';
                } else {
                    fpsElement.style.color = '#ff6b6b';
                }
            }
        }
    }
    
    updateMemoryUsage() {
        if (performance.memory) {
            this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            console.log(`Memory usage: ${this.memoryUsage} MB`);
        }
    }
    
    dispose() {
        // Cleanup if needed
    }
}

// Story Mode Class for Generative Storytelling
class StoryMode {
    constructor() {
        this.isActive = false;
        this.currentSection = 'intro';
        this.sectionStartTime = 0;
        this.trackStructure = [];
        this.visualizers = null;
    }
    
    init(visualizers) {
        this.visualizers = visualizers;
    }
    
    analyzeTrack(file) {
        // Analyze track structure (simplified)
        // In a real implementation, this would use advanced audio analysis
        this.trackStructure = [
            { type: 'intro', start: 0, duration: 15 },
            { type: 'verse', start: 15, duration: 30 },
            { type: 'chorus', start: 45, duration: 20 },
            { type: 'verse', start: 65, duration: 30 },
            { type: 'chorus', start: 95, duration: 20 },
            { type: 'bridge', start: 115, duration: 15 },
            { type: 'chorus', start: 130, duration: 20 },
            { type: 'outro', start: 150, duration: 10 }
        ];
    }
    
    start() {
        this.isActive = true;
        this.sectionStartTime = Date.now();
    }
    
    pause() {
        this.isActive = false;
    }
    
    stop() {
        this.isActive = false;
        this.currentSection = 'intro';
    }
    
    update(audioFeatures) {
        if (!this.isActive || !this.visualizers) return;
        
        // Determine current section based on audio analysis
        const currentTime = (Date.now() - this.sectionStartTime) / 1000;
        const section = this.getCurrentSection(currentTime);
        
        if (section !== this.currentSection) {
            this.currentSection = section;
            this.adaptVisualizationToSection(section, audioFeatures);
        }
    }
    
    getCurrentSection(time) {
        for (const section of this.trackStructure) {
            if (time >= section.start && time < section.start + section.duration) {
                return section.type;
            }
        }
        return 'outro';
    }
    
    adaptVisualizationToSection(section, audioFeatures) {
        if (!this.visualizers) return;
        
        switch (section) {
            case 'intro':
                // Minimalist approach
                this.visualizers.setAlgorithm('waveform');
                break;
            case 'verse':
                // Moderate complexity
                this.visualizers.setAlgorithm('particles');
                break;
            case 'chorus':
                // Explosive visuals
                this.visualizers.setAlgorithm('fractal');
                break;
            case 'bridge':
                // Morphing effects
                this.visualizers.setAlgorithm('fluid');
                break;
            case 'outro':
                // Fade out effect
                this.visualizers.setAlgorithm('ambient');
                break;
        }
        
        console.log(`Story mode: Switched to ${section} section`);
    }
    
    dispose() {
        this.isActive = false;
    }
}

// Global functions for modal management
window.closeModal = function() {
    document.getElementById('settingsModal').style.display = 'none';
};

window.closeShareModal = function() {
    document.getElementById('shareModal').style.display = 'none';
};

window.copyPreset = function() {
    const presetCode = document.getElementById('presetCode');
    presetCode.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
};

window.copyDNA = function() {
    const dnaCode = document.getElementById('dnaCode');
    dnaCode.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
};

window.savePreset = function() {
    const presetCode = document.getElementById('presetCode').value;
    const blob = new Blob([presetCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `music-visualizer-preset-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const modals = ['settingsModal', 'shareModal', 'importModal', 'dnaModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicVisualizerApp = new MusicVisualizerApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.musicVisualizerApp) {
        window.musicVisualizerApp.dispose();
    }
});