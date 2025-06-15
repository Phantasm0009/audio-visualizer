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
            particleCount: 1000,
            colorPalette: 'rainbow',
            algorithm: 'particles'
        };
        
        this.init();
    }

    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.updateUI();
        
        // Initialize audio processor
        const audioInitialized = await this.audioProcessor.initializeAudio();
        if (!audioInitialized) {
            document.getElementById('statusIndicator').textContent = 'Audio Failed to Initialize';
            return;
        }
        
        // Load genre classifier
        document.getElementById('statusIndicator').textContent = 'Loading ML Model...';
        await this.genreClassifier.loadModel();
        document.getElementById('statusIndicator').textContent = 'Ready - Upload Audio File';
        
        // Initialize visualizers
        this.visualizers = new Visualizers(this.canvas, this.audioProcessor);
        this.visualizers.setAlgorithm(this.currentSettings.algorithm);
        
        // Start animation loop
        this.animate();
        
        console.log('Music Visualizer App initialized successfully');
    }

    setupCanvas() {
        this.canvas = document.getElementById('visualizer');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.visualizers) {
                this.visualizers.resize();
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
        // Audio file input
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
                    
                    // Wait for audio metadata to load
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
                    
                    // Connect audio element to processor after metadata loads
                    const connected = this.audioProcessor.connectToAudioElement(audioPlayer);
                    if (connected) {
                        document.getElementById('statusIndicator').textContent = 'Audio Ready - Click Play';
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

        // Audio player events
        audioPlayer.addEventListener('play', async () => {
            // Resume audio context if suspended
            if (this.audioProcessor.audioContext && this.audioProcessor.audioContext.state === 'suspended') {
                await this.audioProcessor.audioContext.resume();
            }
            this.isPlaying = true;
            document.getElementById('statusIndicator').textContent = 'Playing';
            
            // Debug: Log audio context state
            console.log('Audio Context State:', this.audioProcessor.audioContext?.state);
            console.log('Audio Element Ready State:', audioPlayer.readyState);
        });

        audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            document.getElementById('statusIndicator').textContent = 'Paused';
        });

        audioPlayer.addEventListener('ended', () => {
            this.isPlaying = false;
            document.getElementById('statusIndicator').textContent = 'Ready';
        });

        // Algorithm selection
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.currentSettings.algorithm = e.target.value;
            if (this.visualizers) {
                this.visualizers.setAlgorithm(e.target.value);
            }
        });

        // Control sliders
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

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
                
                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Color palette selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const palette = option.dataset.palette;
                this.currentSettings.colorPalette = palette;
                this.updateVisualizerSettings();
                
                // Update active state
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

        // Share functionality
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.openShareModal();
        });

        // Demo mode button
        document.getElementById('demoBtn').addEventListener('click', () => {
            this.toggleDemoMode();
        });
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
        
        // Update settings
        this.currentSettings = { ...this.currentSettings, ...preset };
        
        // Update UI
        document.getElementById('algorithmSelect').value = preset.algorithm;
        document.getElementById('sensitivity').value = preset.sensitivity;
        document.getElementById('colorIntensity').value = preset.colorIntensity;
        document.getElementById('motionSpeed').value = preset.motionSpeed;
        document.getElementById('particleCount').value = preset.particleCount;
        
        // Update value displays
        document.getElementById('sensitivityValue').textContent = preset.sensitivity;
        document.getElementById('colorIntensityValue').textContent = preset.colorIntensity;
        document.getElementById('motionSpeedValue').textContent = preset.motionSpeed;
        document.getElementById('particleCountValue').textContent = preset.particleCount;
        
        // Update color palette
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.palette === preset.colorPalette);
        });
        
        // Apply to visualizer
        if (this.visualizers) {
            this.visualizers.setAlgorithm(preset.algorithm);
            this.visualizers.updateSettings(this.currentSettings);
        }
    }

    async animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.visualizers) {
            // Always update visualization (with demo data if no audio)
            if (this.isPlaying) {
                if (this.demoMode) {
                    // Demo mode - create fake audio data for testing
                    this.createDemoVisualization();
                } else {
                    // Regular audio mode
                    this.visualizers.animate();
                    
                    // Extract audio features for genre classification
                    const audioFeatures = this.audioProcessor.extractFeatures();
                    
                    // Classify genre periodically (every 2 seconds)
                    if (Math.floor(Date.now() / 2000) !== this.lastGenreUpdate) {
                        this.lastGenreUpdate = Math.floor(Date.now() / 2000);
                        try {
                            this.updateGenreClassification(audioFeatures);
                        } catch (error) {
                            console.warn('Genre classification error:', error);
                        }
                    }
                    
                    // Update frequency display
                    this.updateFrequencyDisplay();
                }
            }
        }
    }

    createDemoVisualization() {
        // Create demo animation even without audio
        if (!this.visualizers) return;
        
        const time = Date.now() * 0.001;
        
        // Update camera for demo
        this.visualizers.camera.position.x = Math.sin(time * 0.2) * 5;
        this.visualizers.camera.position.y = Math.cos(time * 0.15) * 3;
        this.visualizers.camera.lookAt(0, 0, 0);
        
        // Render the scene
        this.visualizers.renderer.render(this.visualizers.scene, this.visualizers.camera);
    }

    toggleDemoMode() {
        this.demoMode = !this.demoMode;
        const demoBtn = document.getElementById('demoBtn');
        
        if (this.demoMode) {
            this.isPlaying = true; // Enable animation loop
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
            
            // Update UI
            document.getElementById('detectedGenre').textContent = 
                result.genre.charAt(0).toUpperCase() + result.genre.slice(1);
            
            const confidenceLevel = document.getElementById('confidenceLevel');
            confidenceLevel.style.width = (result.confidence * 100) + '%';
            
            // Auto-apply preset if confidence is high
            if (result.confidence > 0.7) {
                // Find if any preset button matches the detected genre
                const presetBtn = document.querySelector(`[data-preset="${result.genre}"]`);
                if (presetBtn && !presetBtn.classList.contains('active')) {
                    // Only auto-apply if no preset is currently active
                    const activePreset = document.querySelector('.preset-btn.active');
                    if (!activePreset) {
                        this.applyPreset(result.genre);
                        presetBtn.classList.add('active');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating genre classification:', error);
        }
    }

    updateFrequencyDisplay() {
        const frequencyData = this.audioProcessor.getFrequencyData();
        const frequencyDisplay = document.getElementById('frequencyDisplay');
        
        // Clear existing bars
        frequencyDisplay.innerHTML = '';
        
        // Create frequency bars (show only first 32 for performance)
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'freq-bar';
            bar.style.height = (frequencyData[i] / 255 * 100) + 'px';
            frequencyDisplay.appendChild(bar);
        }
    }

    openShareModal() {
        const presetData = {
            settings: this.currentSettings,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        const presetCode = btoa(JSON.stringify(presetData));
        document.getElementById('presetCode').value = presetCode;
        document.getElementById('shareModal').style.display = 'block';
    }

    updateUI() {
        // Set initial values
        document.getElementById('sensitivityValue').textContent = this.currentSettings.sensitivity;
        document.getElementById('colorIntensityValue').textContent = this.currentSettings.colorIntensity;
        document.getElementById('motionSpeedValue').textContent = this.currentSettings.motionSpeed;
        document.getElementById('particleCountValue').textContent = this.currentSettings.particleCount;
        document.getElementById('smoothingValue').textContent = '0.8';
        
        // Set active color palette
        document.querySelector(`[data-palette="${this.currentSettings.colorPalette}"]`).classList.add('active');
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
    
    // Show feedback
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
    const settingsModal = document.getElementById('settingsModal');
    const shareModal = document.getElementById('shareModal');
    
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
    
    if (e.target === shareModal) {
        shareModal.style.display = 'none';
    }
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