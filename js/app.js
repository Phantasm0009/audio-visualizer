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
        
        // Load enhanced genre classifier
        document.getElementById('statusIndicator').textContent = 'Loading Enhanced ML Model...';
        await this.genreClassifier.loadModel();
        document.getElementById('statusIndicator').textContent = 'Ready - Upload Audio File';
        
        // Initialize enhanced visualizers
        this.visualizers = new Visualizers(this.canvas, this.audioProcessor);
        this.visualizers.setAlgorithm(this.currentSettings.algorithm);
        
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

        // Enhanced algorithm selection with new visualizers
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

        // Enhanced preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
                
                // Update active state
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

        // Enhanced share functionality
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.openShareModal();
        });

        // Demo mode button
        document.getElementById('demoBtn').addEventListener('click', () => {
            this.toggleDemoMode();
        });

        // Add import preset functionality
        this.setupImportPreset();
    }

    setupImportPreset() {
        // Create import preset button and modal
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import Preset';
        importBtn.className = 'btn btn-secondary';
        importBtn.style.marginLeft = '10px';
        
        // Add to header controls
        const headerControls = document.querySelector('.header-controls');
        headerControls.insertBefore(importBtn, document.getElementById('shareBtn'));
        
        // Create import modal
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
        
        // Add event listener for import button
        importBtn.addEventListener('click', () => {
            document.getElementById('importModal').style.display = 'block';
        });
        
        // Add global functions for import modal
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
                
                // Apply imported settings
                this.currentSettings = { ...this.currentSettings, ...importedSettings };
                this.updateUIFromSettings();
                this.updateVisualizerSettings();
                
                statusDiv.textContent = 'Preset imported successfully!';
                statusDiv.style.color = '#4ecdc4';
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    window.closeImportModal();
                }, 2000);
                
            } catch (error) {
                statusDiv.textContent = error.message;
                statusDiv.style.color = '#ff6b6b';
            }
        };
    }

    updateUIFromSettings() {
        // Update all UI elements to reflect current settings
        document.getElementById('algorithmSelect').value = this.currentSettings.algorithm;
        document.getElementById('sensitivity').value = this.currentSettings.sensitivity;
        document.getElementById('colorIntensity').value = this.currentSettings.colorIntensity;
        document.getElementById('motionSpeed').value = this.currentSettings.motionSpeed;
        document.getElementById('particleCount').value = this.currentSettings.particleCount;
        
        // Update value displays
        document.getElementById('sensitivityValue').textContent = this.currentSettings.sensitivity;
        document.getElementById('colorIntensityValue').textContent = this.currentSettings.colorIntensity;
        document.getElementById('motionSpeedValue').textContent = this.currentSettings.motionSpeed;
        document.getElementById('particleCountValue').textContent = this.currentSettings.particleCount;
        
        // Update color palette
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.palette === this.currentSettings.colorPalette);
        });
        
        // Update algorithm if visualizers are loaded
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
        
        // Update settings
        this.currentSettings = { ...this.currentSettings, ...preset };
        
        // Update UI
        this.updateUIFromSettings();
        
        console.log(`Applied preset: ${presetName}`, preset);
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
                    // Regular audio mode - get frequency data and pass to visualizer
                    const frequencyData = this.audioProcessor.getFrequencyData();
                    this.visualizers.updateVisualization({ frequencyData });
                    
                    // Extract audio features for genre classification
                    const audioFeatures = this.audioProcessor.extractFeatures();
                    
                    // Classify genre periodically (every 3 seconds for better accuracy)
                    if (Math.floor(Date.now() / 3000) !== this.lastGenreUpdate) {
                        this.lastGenreUpdate = Math.floor(Date.now() / 3000);
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
        // Enhanced demo animation
        if (!this.visualizers) return;
        
        const time = Date.now() * 0.001;
        
        // Create more dynamic demo movement
        this.visualizers.camera.position.x = Math.sin(time * 0.3) * 8 + Math.cos(time * 0.1) * 3;
        this.visualizers.camera.position.y = Math.cos(time * 0.25) * 5 + Math.sin(time * 0.15) * 2;
        this.visualizers.camera.position.z = 50 + Math.sin(time * 0.2) * 10;
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
            
            // Enhanced auto-apply preset with higher confidence threshold
            if (result.confidence > 0.75) {
                // Find if any preset button matches the detected genre
                const presetBtn = document.querySelector(`[data-preset="${result.genre}"]`);
                if (presetBtn && !presetBtn.classList.contains('active')) {
                    // Only auto-apply if no preset is currently active
                    const activePreset = document.querySelector('.preset-btn.active');
                    if (!activePreset) {
                        this.applyPreset(result.genre);
                        presetBtn.classList.add('active');
                        
                        // Show notification
                        this.showNotification(`Auto-applied ${result.genre} preset (${Math.round(result.confidence * 100)}% confidence)`);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating genre classification:', error);
        }
    }

    showNotification(message) {
        // Create and show notification
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
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    updateFrequencyDisplay() {
        const frequencyData = this.audioProcessor.getFrequencyData();
        const frequencyDisplay = document.getElementById('frequencyDisplay');
        
        // Clear existing bars
        frequencyDisplay.innerHTML = '';
        
        // Create enhanced frequency bars (show 64 for better resolution)
        for (let i = 0; i < 64; i++) {
            const bar = document.createElement('div');
            bar.className = 'freq-bar';
            const height = (frequencyData[i] / 255 * 120) + 'px';
            bar.style.height = height;
            bar.style.background = `hsl(${i * 5}, 70%, 60%)`;
            frequencyDisplay.appendChild(bar);
        }
    }

    openShareModal() {
        const presetData = this.genreClassifier.exportPreset(this.currentSettings);
        document.getElementById('presetCode').value = presetData;
        document.getElementById('shareModal').style.display = 'block';
    }

    updateUI() {
        // Set initial values
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
    const importModal = document.getElementById('importModal');
    
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
    
    if (e.target === shareModal) {
        shareModal.style.display = 'none';
    }
    
    if (e.target === importModal) {
        importModal.style.display = 'none';
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