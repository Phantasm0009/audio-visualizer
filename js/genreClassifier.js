import * as tf from '@tensorflow/tfjs';

export class GenreClassifier {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.genres = ['rock', 'electronic', 'jazz', 'classical', 'pop', 'hip-hop', 'ambient', 'folk', 'metal', 'reggae', 'blues', 'country'];
        this.featureHistory = [];
        this.maxHistoryLength = 150;
        this.confidenceThreshold = 0.6;
        
        // Enhanced genre-specific presets
        this.genrePresets = {
            electronic: {
                algorithm: 'quantum',
                sensitivity: 1.8,
                colorIntensity: 2.0,
                motionSpeed: 2.5,
                particleCount: 1800,
                colorPalette: 'cyberpunk'
            },
            rock: {
                algorithm: 'geometric',
                sensitivity: 2.0,
                colorIntensity: 1.8,
                motionSpeed: 2.2,
                particleCount: 1500,
                colorPalette: 'fire'
            },
            classical: {
                algorithm: 'neural',
                sensitivity: 0.9,
                colorIntensity: 1.3,
                motionSpeed: 0.8,
                particleCount: 1000,
                colorPalette: 'aurora'
            },
            jazz: {
                algorithm: 'fluid',
                sensitivity: 1.3,
                colorIntensity: 1.5,
                motionSpeed: 1.2,
                particleCount: 1200,
                colorPalette: 'sunset'
            },
            ambient: {
                algorithm: 'mandelbrot',
                sensitivity: 0.7,
                colorIntensity: 1.0,
                motionSpeed: 0.6,
                particleCount: 800,
                colorPalette: 'ocean'
            },
            pop: {
                algorithm: 'particles',
                sensitivity: 1.4,
                colorIntensity: 1.7,
                motionSpeed: 1.6,
                particleCount: 1300,
                colorPalette: 'rainbow'
            },
            'hip-hop': {
                algorithm: 'geometric',
                sensitivity: 1.9,
                colorIntensity: 1.9,
                motionSpeed: 1.8,
                particleCount: 1600,
                colorPalette: 'neon'
            },
            folk: {
                algorithm: 'waveform',
                sensitivity: 1.1,
                colorIntensity: 1.2,
                motionSpeed: 1.0,
                particleCount: 900,
                colorPalette: 'sunset'
            },
            metal: {
                algorithm: 'fractal',
                sensitivity: 2.2,
                colorIntensity: 2.0,
                motionSpeed: 2.5,
                particleCount: 2000,
                colorPalette: 'fire'
            },
            reggae: {
                algorithm: 'dna',
                sensitivity: 1.2,
                colorIntensity: 1.4,
                motionSpeed: 1.1,
                particleCount: 1100,
                colorPalette: 'aurora'
            },
            blues: {
                algorithm: 'fluid',
                sensitivity: 1.0,
                colorIntensity: 1.3,
                motionSpeed: 0.9,
                particleCount: 950,
                colorPalette: 'ocean'
            },
            country: {
                algorithm: 'waveform',
                sensitivity: 1.1,
                colorIntensity: 1.2,
                motionSpeed: 1.0,
                particleCount: 1000,
                colorPalette: 'sunset'
            }
        };
        
        // Advanced audio feature weights for better classification
        this.featureWeights = {
            spectralCentroid: 0.15,
            spectralRolloff: 0.12,
            spectralFlux: 0.18,
            energy: 0.14,
            zcr: 0.11,
            mfcc: 0.20,
            chroma: 0.10
        };
    }

    async loadModel() {
        try {
            // Create an enhanced neural network for genre classification
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputShape: [32], // Increased feature count
                        units: 128,
                        activation: 'relu',
                        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                    }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({
                        units: 64,
                        activation: 'relu',
                        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                    }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({
                        units: 32,
                        activation: 'relu'
                    }),
                    tf.layers.dropout({ rate: 0.2 }),
                    tf.layers.dense({
                        units: this.genres.length,
                        activation: 'softmax'
                    })
                ]
            });

            this.model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Initialize with enhanced pre-trained weights
            await this.initializeEnhancedWeights();
            
            this.isLoaded = true;
            console.log('Enhanced genre classifier model loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading genre classifier:', error);
            return false;
        }
    }

    async initializeEnhancedWeights() {
        // Generate more sophisticated initial weights based on genre characteristics
        const genreCharacteristics = {
            rock: { energy: 0.8, zcr: 0.7, spectralFlux: 0.9 },
            electronic: { spectralCentroid: 0.9, energy: 0.8, spectralFlux: 0.8 },
            jazz: { chroma: 0.9, spectralCentroid: 0.6, zcr: 0.6 },
            classical: { chroma: 0.8, spectralCentroid: 0.5, energy: 0.4 },
            pop: { energy: 0.7, spectralCentroid: 0.7, chroma: 0.6 },
            'hip-hop': { energy: 0.9, zcr: 0.8, spectralFlux: 0.7 },
            ambient: { energy: 0.3, spectralCentroid: 0.4, chroma: 0.5 },
            folk: { chroma: 0.7, energy: 0.5, zcr: 0.4 },
            metal: { energy: 0.95, zcr: 0.9, spectralFlux: 0.95 },
            reggae: { energy: 0.6, chroma: 0.8, zcr: 0.5 },
            blues: { chroma: 0.8, energy: 0.6, spectralCentroid: 0.5 },
            country: { chroma: 0.7, energy: 0.6, zcr: 0.5 }
        };

        // Initialize weights based on genre characteristics
        for (let i = 0; i < this.model.layers.length; i++) {
            const layer = this.model.layers[i];
            if (layer.getWeights().length > 0) {
                const layerWeights = layer.getWeights();
                const newWeights = layerWeights.map(w => {
                    const shape = w.shape;
                    // Use Xavier/Glorot initialization with genre-specific bias
                    const fan_in = shape.length > 1 ? shape[0] : 1;
                    const fan_out = shape.length > 1 ? shape[1] : shape[0];
                    const limit = Math.sqrt(6 / (fan_in + fan_out));
                    return tf.randomUniform(shape, -limit, limit);
                });
                layer.setWeights(newWeights);
            }
        }
    }

    extractEnhancedMLFeatures(audioFeatures) {
        // Extract comprehensive audio features (32 features total)
        const features = [
            // Spectral features (normalized)
            audioFeatures.spectralCentroid / 2000,
            audioFeatures.spectralRolloff / 2000,
            audioFeatures.spectralFlux / 100,
            audioFeatures.energy / 20000,
            audioFeatures.zcr,
            
            // Enhanced MFCC (13 coefficients)
            ...this.calculateEnhancedMFCC(audioFeatures).slice(0, 13),
            
            // Chroma features (12 coefficients)
            ...audioFeatures.chroma.slice(0, 12),
            
            // Additional spectral features
            this.calculateSpectralSpread(audioFeatures),
            this.calculateSpectralSkewness(audioFeatures)
        ];
        
        // Ensure exactly 32 features
        while (features.length < 32) {
            features.push(0);
        }
        features.length = 32;
        
        // Apply feature normalization
        return this.normalizeFeatures(features);
    }

    calculateEnhancedMFCC(audioFeatures) {
        // Enhanced MFCC calculation with better frequency resolution
        const mfcc = new Array(13);
        const spectrum = audioFeatures.chroma;
        const melFilters = this.createMelFilterBank(spectrum.length, 13);
        
        for (let i = 0; i < 13; i++) {
            let sum = 0;
            for (let j = 0; j < spectrum.length; j++) {
                sum += spectrum[j] * melFilters[i][j] * Math.cos(Math.PI * i * (j + 0.5) / spectrum.length);
            }
            mfcc[i] = sum / spectrum.length;
        }
        
        return mfcc;
    }

    createMelFilterBank(spectrumLength, numFilters) {
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

    normalizeFeatures(features) {
        // Apply z-score normalization
        const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
        const variance = features.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / features.length;
        const stdDev = Math.sqrt(variance + 1e-8);
        
        return features.map(val => (val - mean) / stdDev);
    }

    async classifyGenre(audioFeatures) {
        if (!this.isLoaded || !this.model) {
            return this.getEnhancedHeuristicClassification(audioFeatures);
        }

        try {
            const features = this.extractEnhancedMLFeatures(audioFeatures);
            
            // Add to history for temporal smoothing
            this.featureHistory.push(features);
            if (this.featureHistory.length > this.maxHistoryLength) {
                this.featureHistory.shift();
            }

            // Use temporal averaging for more stable predictions
            const recentFeatures = this.featureHistory.slice(-20);
            const avgFeatures = this.averageFeatures(recentFeatures);
            
            const prediction = this.model.predict(tf.tensor2d([avgFeatures]));
            const probabilities = await prediction.data();
            
            // Apply confidence boosting for clear predictions
            const boostedProbs = this.applyConfidenceBoosting(probabilities);
            
            // Find the genre with highest probability
            let maxProb = 0;
            let predictedGenre = 'unknown';
            
            for (let i = 0; i < this.genres.length; i++) {
                if (boostedProbs[i] > maxProb) {
                    maxProb = boostedProbs[i];
                    predictedGenre = this.genres[i];
                }
            }
            
            prediction.dispose();
            
            // Apply temporal smoothing to final prediction
            const smoothedResult = this.applySmoothingFilter({
                genre: predictedGenre,
                confidence: maxProb,
                probabilities: Object.fromEntries(
                    this.genres.map((genre, i) => [genre, boostedProbs[i]])
                )
            });
            
            return smoothedResult;
        } catch (error) {
            console.error('Error during genre classification:', error);
            return this.getEnhancedHeuristicClassification(audioFeatures);
        }
    }

    applyConfidenceBoosting(probabilities) {
        // Boost confidence for clear predictions
        const maxProb = Math.max(...probabilities);
        const secondMaxProb = probabilities.sort((a, b) => b - a)[1];
        const confidence = maxProb - secondMaxProb;
        
        if (confidence > 0.3) {
            // Clear prediction - boost the winner
            return probabilities.map(prob => 
                prob === maxProb ? Math.min(prob * 1.2, 1.0) : prob * 0.9
            );
        }
        
        return probabilities;
    }

    applySmoothingFilter(currentResult) {
        // Store recent predictions for smoothing
        if (!this.recentPredictions) {
            this.recentPredictions = [];
        }
        
        this.recentPredictions.push(currentResult);
        if (this.recentPredictions.length > 10) {
            this.recentPredictions.shift();
        }
        
        // If we have enough history, apply smoothing
        if (this.recentPredictions.length >= 5) {
            const genreCounts = {};
            let totalConfidence = 0;
            
            this.recentPredictions.forEach(pred => {
                genreCounts[pred.genre] = (genreCounts[pred.genre] || 0) + pred.confidence;
                totalConfidence += pred.confidence;
            });
            
            // Find most consistent genre
            let bestGenre = currentResult.genre;
            let bestScore = 0;
            
            for (const [genre, score] of Object.entries(genreCounts)) {
                if (score > bestScore) {
                    bestScore = score;
                    bestGenre = genre;
                }
            }
            
            // Return smoothed result
            return {
                genre: bestGenre,
                confidence: Math.min(bestScore / totalConfidence * 2, 1.0),
                probabilities: currentResult.probabilities
            };
        }
        
        return currentResult;
    }

    getEnhancedHeuristicClassification(audioFeatures) {
        // Enhanced heuristic classification with more sophisticated rules
        const { spectralCentroid, energy, zcr, spectralFlux, chroma } = audioFeatures;
        
        let genre = 'unknown';
        let confidence = 0.5;
        
        // Calculate derived features
        const brightness = spectralCentroid / 1000;
        const energyLevel = energy / 10000;
        const rhythmicity = zcr;
        const complexity = spectralFlux / 50;
        const harmonicity = Math.max(...chroma) / (chroma.reduce((sum, val) => sum + val, 0) / chroma.length);
        
        // Enhanced classification rules
        if (energyLevel > 0.8 && complexity > 0.8) {
            if (rhythmicity > 0.12) {
                genre = 'metal';
                confidence = 0.8;
            } else if (brightness > 0.8) {
                genre = 'electronic';
                confidence = 0.75;
            } else {
                genre = 'rock';
                confidence = 0.7;
            }
        } else if (energyLevel > 0.6 && rhythmicity > 0.1) {
            if (harmonicity > 2.0) {
                genre = 'hip-hop';
                confidence = 0.7;
            } else {
                genre = 'pop';
                confidence = 0.65;
            }
        } else if (harmonicity > 2.5 && brightness < 0.6) {
            if (complexity < 0.3) {
                genre = 'classical';
                confidence = 0.7;
            } else {
                genre = 'jazz';
                confidence = 0.65;
            }
        } else if (energyLevel < 0.4 && complexity < 0.4) {
            genre = 'ambient';
            confidence = 0.6;
        } else if (harmonicity > 2.0 && energyLevel < 0.7) {
            if (rhythmicity < 0.06) {
                genre = 'folk';
                confidence = 0.6;
            } else {
                genre = 'country';
                confidence = 0.55;
            }
        } else if (harmonicity > 1.8 && energyLevel > 0.5) {
            if (rhythmicity > 0.08) {
                genre = 'blues';
                confidence = 0.6;
            } else {
                genre = 'reggae';
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
        if (featuresArray.length === 0) return new Array(32).fill(0);
        
        const avgFeatures = new Array(32).fill(0);
        
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

    // Enhanced training with data augmentation
    async trainOnUserData(audioFeatures, userGenreLabel) {
        if (!this.isLoaded || !this.model) return;

        try {
            const features = this.extractEnhancedMLFeatures(audioFeatures);
            const genreIndex = this.genres.indexOf(userGenreLabel);
            
            if (genreIndex === -1) return;
            
            // Create one-hot encoded label
            const label = new Array(this.genres.length).fill(0);
            label[genreIndex] = 1;
            
            // Data augmentation - add slight noise to features
            const augmentedFeatures = [];
            const augmentedLabels = [];
            
            for (let i = 0; i < 3; i++) {
                const noisyFeatures = features.map(f => f + (Math.random() - 0.5) * 0.1);
                augmentedFeatures.push(noisyFeatures);
                augmentedLabels.push([...label]);
            }
            
            const xs = tf.tensor2d(augmentedFeatures);
            const ys = tf.tensor2d(augmentedLabels);
            
            await this.model.fit(xs, ys, {
                epochs: 3,
                verbose: 0,
                batchSize: 3
            });
            
            xs.dispose();
            ys.dispose();
            
            console.log(`Enhanced model updated with user feedback for genre: ${userGenreLabel}`);
        } catch (error) {
            console.error('Error training on user data:', error);
        }
    }

    // Import preset from shared code
    importPreset(presetCode) {
        try {
            const presetData = JSON.parse(atob(presetCode));
            
            // Validate preset structure
            if (!presetData.settings || !presetData.version) {
                throw new Error('Invalid preset format');
            }
            
            // Check version compatibility
            if (presetData.version !== '1.0' && presetData.version !== '2.0') {
                console.warn('Preset version may not be fully compatible');
            }
            
            return presetData.settings;
        } catch (error) {
            console.error('Error importing preset:', error);
            throw new Error('Failed to import preset. Please check the code and try again.');
        }
    }

    // Export preset with enhanced metadata
    exportPreset(settings) {
        const presetData = {
            settings: settings,
            timestamp: Date.now(),
            version: '2.0',
            metadata: {
                featureCount: 32,
                genreCount: this.genres.length,
                modelVersion: 'enhanced'
            }
        };
        
        return btoa(JSON.stringify(presetData));
    }

    dispose() {
        if (this.model) {
            this.model.dispose();
        }
        this.featureHistory = [];
        this.recentPredictions = [];
    }
}