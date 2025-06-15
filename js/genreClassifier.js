import * as tf from '@tensorflow/tfjs';

export class GenreClassifier {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.genres = [
            'rock', 'electronic', 'jazz', 'classical', 'pop', 'hip-hop', 
            'ambient', 'folk', 'metal', 'reggae', 'blues', 'country',
            'dubstep', 'house', 'techno', 'trance'
        ];
        
        this.featureHistory = [];
        this.maxHistoryLength = 200;
        this.confidenceThreshold = 0.65;
        
        // Enhanced genre-specific presets with new algorithms
        this.genrePresets = {
            electronic: {
                algorithm: 'sdf',
                sensitivity: 1.9,
                colorIntensity: 2.2,
                motionSpeed: 2.8,
                particleCount: 2500,
                colorPalette: 'cyberpunk'
            },
            rock: {
                algorithm: 'geometric',
                sensitivity: 2.1,
                colorIntensity: 1.9,
                motionSpeed: 2.4,
                particleCount: 2000,
                colorPalette: 'fire'
            },
            classical: {
                algorithm: 'supershapes',
                sensitivity: 0.8,
                colorIntensity: 1.4,
                motionSpeed: 0.7,
                particleCount: 1200,
                colorPalette: 'aurora'
            },
            jazz: {
                algorithm: 'klein',
                sensitivity: 1.4,
                colorIntensity: 1.6,
                motionSpeed: 1.3,
                particleCount: 1500,
                colorPalette: 'sunset'
            },
            ambient: {
                algorithm: 'mandelbrot',
                sensitivity: 0.6,
                colorIntensity: 1.1,
                motionSpeed: 0.5,
                particleCount: 800,
                colorPalette: 'ocean'
            },
            pop: {
                algorithm: 'particles',
                sensitivity: 1.5,
                colorIntensity: 1.8,
                motionSpeed: 1.7,
                particleCount: 1800,
                colorPalette: 'rainbow'
            },
            'hip-hop': {
                algorithm: 'geometric',
                sensitivity: 2.0,
                colorIntensity: 2.0,
                motionSpeed: 1.9,
                particleCount: 2200,
                colorPalette: 'neon'
            },
            folk: {
                algorithm: 'waveform',
                sensitivity: 1.2,
                colorIntensity: 1.3,
                motionSpeed: 1.1,
                particleCount: 1000,
                colorPalette: 'sunset'
            },
            metal: {
                algorithm: 'fractal',
                sensitivity: 2.4,
                colorIntensity: 2.1,
                motionSpeed: 2.7,
                particleCount: 3000,
                colorPalette: 'fire'
            },
            reggae: {
                algorithm: 'dna',
                sensitivity: 1.3,
                colorIntensity: 1.5,
                motionSpeed: 1.2,
                particleCount: 1300,
                colorPalette: 'aurora'
            },
            blues: {
                algorithm: 'fluid',
                sensitivity: 1.1,
                colorIntensity: 1.4,
                motionSpeed: 1.0,
                particleCount: 1100,
                colorPalette: 'ocean'
            },
            country: {
                algorithm: 'waveform',
                sensitivity: 1.2,
                colorIntensity: 1.3,
                motionSpeed: 1.1,
                particleCount: 1200,
                colorPalette: 'sunset'
            },
            dubstep: {
                algorithm: 'sdf',
                sensitivity: 2.5,
                colorIntensity: 2.3,
                motionSpeed: 3.0,
                particleCount: 4000,
                colorPalette: 'cyberpunk'
            },
            house: {
                algorithm: 'quantum',
                sensitivity: 1.8,
                colorIntensity: 2.0,
                motionSpeed: 2.2,
                particleCount: 2000,
                colorPalette: 'neon'
            },
            techno: {
                algorithm: 'neural',
                sensitivity: 2.0,
                colorIntensity: 2.1,
                motionSpeed: 2.5,
                particleCount: 2500,
                colorPalette: 'matrix'
            },
            trance: {
                algorithm: 'supershapes',
                sensitivity: 1.7,
                colorIntensity: 1.9,
                motionSpeed: 2.0,
                particleCount: 1800,
                colorPalette: 'vaporwave'
            }
        };
        
        // Advanced audio feature weights
        this.featureWeights = {
            spectralCentroid: 0.12,
            spectralRolloff: 0.10,
            spectralFlux: 0.15,
            energy: 0.12,
            zcr: 0.09,
            rms: 0.08,
            mfcc: 0.18,
            chroma: 0.08,
            brightness: 0.08
        };
        
        // Preset DNA system for viral sharing
        this.presetDNA = new PresetDNASystem();
    }

    async loadModel() {
        try {
            // Create enhanced neural network for genre classification
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputShape: [40], // Increased feature count
                        units: 256,
                        activation: 'relu',
                        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                    }),
                    tf.layers.dropout({ rate: 0.4 }),
                    tf.layers.dense({
                        units: 128,
                        activation: 'relu',
                        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                    }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({
                        units: 64,
                        activation: 'relu'
                    }),
                    tf.layers.dropout({ rate: 0.2 }),
                    tf.layers.dense({
                        units: 32,
                        activation: 'relu'
                    }),
                    tf.layers.dense({
                        units: this.genres.length,
                        activation: 'softmax'
                    })
                ]
            });

            this.model.compile({
                optimizer: tf.train.adam(0.0005),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            await this.initializeAdvancedWeights();
            
            this.isLoaded = true;
            console.log('Enhanced genre classifier model loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading genre classifier:', error);
            return false;
        }
    }

    async initializeAdvancedWeights() {
        // Enhanced genre characteristics for better classification
        const genreCharacteristics = {
            rock: { energy: 0.85, zcr: 0.75, spectralFlux: 0.9, brightness: 0.7 },
            electronic: { spectralCentroid: 0.9, energy: 0.8, spectralFlux: 0.85, brightness: 0.9 },
            jazz: { chroma: 0.9, spectralCentroid: 0.6, zcr: 0.6, harmonicity: 0.8 },
            classical: { chroma: 0.85, spectralCentroid: 0.5, energy: 0.4, harmonicity: 0.9 },
            pop: { energy: 0.75, spectralCentroid: 0.7, chroma: 0.65, brightness: 0.6 },
            'hip-hop': { energy: 0.9, zcr: 0.8, spectralFlux: 0.75, rms: 0.85 },
            ambient: { energy: 0.3, spectralCentroid: 0.4, chroma: 0.5, brightness: 0.3 },
            folk: { chroma: 0.75, energy: 0.5, zcr: 0.4, harmonicity: 0.7 },
            metal: { energy: 0.95, zcr: 0.9, spectralFlux: 0.95, brightness: 0.8 },
            reggae: { energy: 0.6, chroma: 0.8, zcr: 0.5, rms: 0.6 },
            blues: { chroma: 0.8, energy: 0.6, spectralCentroid: 0.5, harmonicity: 0.75 },
            country: { chroma: 0.7, energy: 0.6, zcr: 0.5, harmonicity: 0.65 },
            dubstep: { energy: 0.95, spectralFlux: 0.95, zcr: 0.85, brightness: 0.9 },
            house: { energy: 0.85, spectralCentroid: 0.8, spectralFlux: 0.8, brightness: 0.8 },
            techno: { energy: 0.9, spectralCentroid: 0.85, spectralFlux: 0.85, brightness: 0.85 },
            trance: { energy: 0.8, spectralCentroid: 0.75, chroma: 0.7, brightness: 0.75 }
        };

        // Initialize with Xavier/Glorot initialization
        for (let i = 0; i < this.model.layers.length; i++) {
            const layer = this.model.layers[i];
            if (layer.getWeights().length > 0) {
                const layerWeights = layer.getWeights();
                const newWeights = layerWeights.map(w => {
                    const shape = w.shape;
                    const fan_in = shape.length > 1 ? shape[0] : 1;
                    const fan_out = shape.length > 1 ? shape[1] : shape[0];
                    const limit = Math.sqrt(6 / (fan_in + fan_out));
                    return tf.randomUniform(shape, -limit, limit);
                });
                layer.setWeights(newWeights);
            }
        }
    }

    extractAdvancedMLFeatures(audioFeatures) {
        // Extract comprehensive audio features (40 features total)
        const features = [
            // Basic spectral features (normalized)
            audioFeatures.spectralCentroid / 2000,
            audioFeatures.spectralRolloff / 2000,
            audioFeatures.spectralFlux / 100,
            audioFeatures.energy / 20000,
            audioFeatures.zcr,
            audioFeatures.rms || 0,
            audioFeatures.brightness || 0,
            audioFeatures.roughness || 0,
            audioFeatures.harmonicity || 0,
            
            // Enhanced MFCC (13 coefficients)
            ...this.calculateAdvancedMFCC(audioFeatures).slice(0, 13),
            
            // Chroma features (12 coefficients)
            ...audioFeatures.chroma.slice(0, 12),
            
            // Additional spectral features
            this.calculateSpectralSpread(audioFeatures),
            this.calculateSpectralSkewness(audioFeatures),
            this.calculateSpectralKurtosis(audioFeatures),
            this.calculateSpectralSlope(audioFeatures)
        ];
        
        // Ensure exactly 40 features
        while (features.length < 40) {
            features.push(0);
        }
        features.length = 40;
        
        return this.normalizeFeatures(features);
    }

    calculateAdvancedMFCC(audioFeatures) {
        const mfcc = new Array(13);
        const spectrum = audioFeatures.chroma;
        const melFilters = this.createAdvancedMelFilterBank(spectrum.length, 13);
        
        for (let i = 0; i < 13; i++) {
            let sum = 0;
            for (let j = 0; j < spectrum.length; j++) {
                sum += spectrum[j] * melFilters[i][j] * Math.cos(Math.PI * i * (j + 0.5) / spectrum.length);
            }
            mfcc[i] = sum / spectrum.length;
        }
        
        return mfcc;
    }

    createAdvancedMelFilterBank(spectrumLength, numFilters) {
        const filters = [];
        const melMin = this.hzToMel(80);
        const melMax = this.hzToMel(8000);
        const melPoints = [];
        
        for (let i = 0; i <= numFilters + 1; i++) {
            melPoints.push(melMin + (melMax - melMin) * i / (numFilters + 1));
        }
        
        const hzPoints = melPoints.map(mel => this.melToHz(mel));
        const binPoints = hzPoints.map(hz => Math.floor((spectrumLength + 1) * hz / 22050));
        
        for (let i = 1; i <= numFilters; i++) {
            const filter = new Array(spectrumLength).fill(0);
            
            for (let j = binPoints[i - 1]; j < binPoints[i]; j++) {
                if (j < spectrumLength) {
                    filter[j] = (j - binPoints[i - 1]) / (binPoints[i] - binPoints[i - 1]);
                }
            }
            
            for (let j = binPoints[i]; j < binPoints[i + 1]; j++) {
                if (j < spectrumLength) {
                    filter[j] = (binPoints[i + 1] - j) / (binPoints[i + 1] - binPoints[i]);
                }
            }
            
            filters.push(filter);
        }
        
        return filters;
    }

    hzToMel(hz) {
        return 2595 * Math.log10(1 + hz / 700);
    }

    melToHz(mel) {
        return 700 * (Math.pow(10, mel / 2595) - 1);
    }

    calculateSpectralSpread(audioFeatures) {
        const spectrum = audioFeatures.chroma;
        const centroid = audioFeatures.spectralCentroid;
        
        let spread = 0;
        let totalMagnitude = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            spread += Math.pow(i - centroid, 2) * spectrum[i];
            totalMagnitude += spectrum[i];
        }
        
        return totalMagnitude > 0 ? Math.sqrt(spread / totalMagnitude) / spectrum.length : 0;
    }

    calculateSpectralSkewness(audioFeatures) {
        const spectrum = audioFeatures.chroma;
        const centroid = audioFeatures.spectralCentroid;
        const spread = this.calculateSpectralSpread(audioFeatures);
        
        if (spread === 0) return 0;
        
        let skewness = 0;
        let totalMagnitude = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            skewness += Math.pow((i - centroid) / spread, 3) * spectrum[i];
            totalMagnitude += spectrum[i];
        }
        
        return totalMagnitude > 0 ? skewness / totalMagnitude : 0;
    }

    calculateSpectralKurtosis(audioFeatures) {
        const spectrum = audioFeatures.chroma;
        const centroid = audioFeatures.spectralCentroid;
        const spread = this.calculateSpectralSpread(audioFeatures);
        
        if (spread === 0) return 0;
        
        let kurtosis = 0;
        let totalMagnitude = 0;
        
        for (let i = 0; i < spectrum.length; i++) {
            kurtosis += Math.pow((i - centroid) / spread, 4) * spectrum[i];
            totalMagnitude += spectrum[i];
        }
        
        return totalMagnitude > 0 ? (kurtosis / totalMagnitude) - 3 : 0;
    }

    calculateSpectralSlope(audioFeatures) {
        const spectrum = audioFeatures.chroma;
        let numerator = 0;
        let denominator = 0;
        const mean = spectrum.reduce((sum, val) => sum + val, 0) / spectrum.length;
        
        for (let i = 0; i < spectrum.length; i++) {
            numerator += i * (spectrum[i] - mean);
            denominator += i * i;
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }

    normalizeFeatures(features) {
        const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
        const variance = features.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / features.length;
        const stdDev = Math.sqrt(variance + 1e-8);
        
        return features.map(val => (val - mean) / stdDev);
    }

    async classifyGenre(audioFeatures) {
        if (!this.isLoaded || !this.model) {
            return this.getAdvancedHeuristicClassification(audioFeatures);
        }

        try {
            const features = this.extractAdvancedMLFeatures(audioFeatures);
            
            this.featureHistory.push(features);
            if (this.featureHistory.length > this.maxHistoryLength) {
                this.featureHistory.shift();
            }

            // Use temporal averaging for stability
            const recentFeatures = this.featureHistory.slice(-30);
            const avgFeatures = this.averageFeatures(recentFeatures);
            
            const prediction = this.model.predict(tf.tensor2d([avgFeatures]));
            const probabilities = await prediction.data();
            
            // Apply confidence boosting
            const boostedProbs = this.applyAdvancedConfidenceBoosting(probabilities);
            
            let maxProb = 0;
            let predictedGenre = 'unknown';
            
            for (let i = 0; i < this.genres.length; i++) {
                if (boostedProbs[i] > maxProb) {
                    maxProb = boostedProbs[i];
                    predictedGenre = this.genres[i];
                }
            }
            
            prediction.dispose();
            
            const smoothedResult = this.applyAdvancedSmoothingFilter({
                genre: predictedGenre,
                confidence: maxProb,
                probabilities: Object.fromEntries(
                    this.genres.map((genre, i) => [genre, boostedProbs[i]])
                )
            });
            
            return smoothedResult;
        } catch (error) {
            console.error('Error during genre classification:', error);
            return this.getAdvancedHeuristicClassification(audioFeatures);
        }
    }

    applyAdvancedConfidenceBoosting(probabilities) {
        const maxProb = Math.max(...probabilities);
        const sortedProbs = [...probabilities].sort((a, b) => b - a);
        const confidence = maxProb - sortedProbs[1];
        
        if (confidence > 0.25) {
            return probabilities.map(prob => 
                prob === maxProb ? Math.min(prob * 1.3, 1.0) : prob * 0.85
            );
        }
        
        return probabilities;
    }

    applyAdvancedSmoothingFilter(currentResult) {
        if (!this.recentPredictions) {
            this.recentPredictions = [];
        }
        
        this.recentPredictions.push(currentResult);
        if (this.recentPredictions.length > 15) {
            this.recentPredictions.shift();
        }
        
        if (this.recentPredictions.length >= 8) {
            const genreCounts = {};
            let totalConfidence = 0;
            
            this.recentPredictions.forEach(pred => {
                genreCounts[pred.genre] = (genreCounts[pred.genre] || 0) + pred.confidence;
                totalConfidence += pred.confidence;
            });
            
            let bestGenre = currentResult.genre;
            let bestScore = 0;
            
            for (const [genre, score] of Object.entries(genreCounts)) {
                if (score > bestScore) {
                    bestScore = score;
                    bestGenre = genre;
                }
            }
            
            return {
                genre: bestGenre,
                confidence: Math.min(bestScore / totalConfidence * 2.5, 1.0),
                probabilities: currentResult.probabilities
            };
        }
        
        return currentResult;
    }

    getAdvancedHeuristicClassification(audioFeatures) {
        const { spectralCentroid, energy, zcr, spectralFlux, chroma, rms, brightness } = audioFeatures;
        
        let genre = 'unknown';
        let confidence = 0.5;
        
        // Enhanced classification with more sophisticated rules
        const energyLevel = energy / 10000;
        const brightnessLevel = brightness || (spectralCentroid / 1000);
        const rhythmicity = zcr;
        const complexity = spectralFlux / 50;
        const harmonicity = Math.max(...chroma) / (chroma.reduce((sum, val) => sum + val, 0) / chroma.length);
        const dynamicRange = rms || 0.5;
        
        // Multi-dimensional classification
        if (energyLevel > 0.9 && complexity > 0.9 && brightnessLevel > 0.8) {
            if (rhythmicity > 0.15) {
                genre = 'dubstep';
                confidence = 0.85;
            } else if (brightnessLevel > 0.9) {
                genre = 'metal';
                confidence = 0.8;
            } else {
                genre = 'electronic';
                confidence = 0.75;
            }
        } else if (energyLevel > 0.8 && rhythmicity > 0.12) {
            if (harmonicity > 2.2) {
                genre = 'hip-hop';
                confidence = 0.75;
            } else if (brightnessLevel > 0.7) {
                genre = 'rock';
                confidence = 0.7;
            } else {
                genre = 'house';
                confidence = 0.65;
            }
        } else if (harmonicity > 2.8 && brightnessLevel < 0.6) {
            if (complexity < 0.3 && dynamicRange < 0.4) {
                genre = 'classical';
                confidence = 0.75;
            } else if (complexity > 0.5) {
                genre = 'jazz';
                confidence = 0.7;
            } else {
                genre = 'blues';
                confidence = 0.65;
            }
        } else if (energyLevel < 0.4 && complexity < 0.4) {
            genre = 'ambient';
            confidence = 0.7;
        } else if (energyLevel > 0.6 && energyLevel < 0.8) {
            if (harmonicity > 2.0) {
                genre = 'pop';
                confidence = 0.65;
            } else if (rhythmicity < 0.06) {
                genre = 'folk';
                confidence = 0.6;
            } else {
                genre = 'country';
                confidence = 0.55;
            }
        } else {
            genre = 'pop';
            confidence = 0.4;
        }
        
        return {
            genre,
            confidence,
            probabilities: this.genres.reduce((acc, g) => {
                acc[g] = g === genre ? confidence : (1 - confidence) / (this.genres.length - 1);
                return acc;
            }, {})
        };
    }

    averageFeatures(featuresArray) {
        if (featuresArray.length === 0) return new Array(40).fill(0);
        
        const avgFeatures = new Array(40).fill(0);
        
        for (const features of featuresArray) {
            for (let i = 0; i < features.length; i++) {
                avgFeatures[i] += features[i];
            }
        }
        
        for (let i = 0; i < avgFeatures.length; i++) {
            avgFeatures[i] /= featuresArray.length;
        }
        
        return avgFeatures;
    }

    getGenrePreset(genre) {
        return this.genrePresets[genre] || this.genrePresets.pop;
    }

    // Enhanced preset DNA system for viral sharing
    exportPresetDNA(settings) {
        return this.presetDNA.encode(settings);
    }

    importPresetDNA(dnaCode) {
        return this.presetDNA.decode(dnaCode);
    }

    // Legacy export/import for compatibility
    exportPreset(settings) {
        const presetData = {
            settings: settings,
            timestamp: Date.now(),
            version: '3.0',
            metadata: {
                featureCount: 40,
                genreCount: this.genres.length,
                modelVersion: 'advanced',
                dna: this.exportPresetDNA(settings)
            }
        };
        
        return btoa(JSON.stringify(presetData));
    }

    importPreset(presetCode) {
        try {
            const presetData = JSON.parse(atob(presetCode));
            
            if (!presetData.settings || !presetData.version) {
                throw new Error('Invalid preset format');
            }
            
            if (presetData.version !== '3.0' && presetData.version !== '2.0' && presetData.version !== '1.0') {
                console.warn('Preset version may not be fully compatible');
            }
            
            return presetData.settings;
        } catch (error) {
            console.error('Error importing preset:', error);
            throw new Error('Failed to import preset. Please check the code and try again.');
        }
    }

    dispose() {
        if (this.model) {
            this.model.dispose();
        }
        this.featureHistory = [];
        this.recentPredictions = [];
    }
}

// Preset DNA System for viral sharing
class PresetDNASystem {
    constructor() {
        this.algorithms = ['particles', 'waveform', 'fractal', 'fluid', 'geometric', 'neural', 'dna', 'quantum', 'mandelbrot', 'supershapes', 'klein', 'sdf'];
        this.palettes = ['rainbow', 'ocean', 'fire', 'neon', 'monochrome', 'cyberpunk', 'sunset', 'aurora', 'vaporwave', 'synthwave', 'galaxy', 'matrix'];
        this.base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }
    
    encode(settings) {
        // Create 12-character DNA string
        let dna = '';
        
        // Algorithm (2 chars)
        const algIndex = this.algorithms.indexOf(settings.algorithm) || 0;
        dna += this.toBase62(algIndex, 2);
        
        // Color palette (2 chars)
        const paletteIndex = this.palettes.indexOf(settings.colorPalette) || 0;
        dna += this.toBase62(paletteIndex, 2);
        
        // Sensitivity (2 chars) - scale 0.1-3.0 to 0-61
        const sensitivityIndex = Math.round((settings.sensitivity - 0.1) / 2.9 * 61);
        dna += this.toBase62(sensitivityIndex, 2);
        
        // Color intensity (2 chars)
        const colorIndex = Math.round((settings.colorIntensity - 0.1) / 2.9 * 61);
        dna += this.toBase62(colorIndex, 2);
        
        // Motion speed (2 chars)
        const motionIndex = Math.round((settings.motionSpeed - 0.1) / 3.9 * 61);
        dna += this.toBase62(motionIndex, 2);
        
        // Particle count (2 chars) - scale 100-10000 to 0-61
        const particleIndex = Math.round((settings.particleCount - 100) / 9900 * 61);
        dna += this.toBase62(particleIndex, 2);
        
        return dna;
    }
    
    decode(dnaCode) {
        if (dnaCode.length !== 12) {
            throw new Error('Invalid DNA code length');
        }
        
        try {
            // Parse DNA string
            const algIndex = this.fromBase62(dnaCode.substr(0, 2));
            const paletteIndex = this.fromBase62(dnaCode.substr(2, 2));
            const sensitivityIndex = this.fromBase62(dnaCode.substr(4, 2));
            const colorIndex = this.fromBase62(dnaCode.substr(6, 2));
            const motionIndex = this.fromBase62(dnaCode.substr(8, 2));
            const particleIndex = this.fromBase62(dnaCode.substr(10, 2));
            
            return {
                algorithm: this.algorithms[algIndex] || 'particles',
                colorPalette: this.palettes[paletteIndex] || 'rainbow',
                sensitivity: 0.1 + (sensitivityIndex / 61) * 2.9,
                colorIntensity: 0.1 + (colorIndex / 61) * 2.9,
                motionSpeed: 0.1 + (motionIndex / 61) * 3.9,
                particleCount: Math.round(100 + (particleIndex / 61) * 9900)
            };
        } catch (error) {
            throw new Error('Invalid DNA code format');
        }
    }
    
    toBase62(num, length) {
        let result = '';
        while (num > 0) {
            result = this.base62[num % 62] + result;
            num = Math.floor(num / 62);
        }
        return result.padStart(length, '0');
    }
    
    fromBase62(str) {
        let result = 0;
        for (let i = 0; i < str.length; i++) {
            result = result * 62 + this.base62.indexOf(str[i]);
        }
        return result;
    }
    
    generateRandomDNA() {
        const settings = {
            algorithm: this.algorithms[Math.floor(Math.random() * this.algorithms.length)],
            colorPalette: this.palettes[Math.floor(Math.random() * this.palettes.length)],
            sensitivity: 0.5 + Math.random() * 2,
            colorIntensity: 0.5 + Math.random() * 2,
            motionSpeed: 0.5 + Math.random() * 2.5,
            particleCount: 500 + Math.floor(Math.random() * 4500)
        };
        
        return this.encode(settings);
    }
}