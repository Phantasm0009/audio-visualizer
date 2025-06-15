import * as tf from '@tensorflow/tfjs';

export class GenreClassifier {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.genres = ['rock', 'electronic', 'jazz', 'classical', 'pop', 'hip-hop', 'ambient', 'folk'];
        this.featureHistory = [];
        this.maxHistoryLength = 100;
        
        // Genre-specific presets
        this.genrePresets = {
            electronic: {
                algorithm: 'particles',
                sensitivity: 1.5,
                colorIntensity: 1.8,
                motionSpeed: 2.0,
                particleCount: 1500,
                colorPalette: 'neon'
            },
            rock: {
                algorithm: 'geometric',
                sensitivity: 1.8,
                colorIntensity: 1.5,
                motionSpeed: 1.8,
                particleCount: 1200,
                colorPalette: 'fire'
            },
            classical: {
                algorithm: 'fluid',
                sensitivity: 0.8,
                colorIntensity: 1.2,
                motionSpeed: 0.8,
                particleCount: 800,
                colorPalette: 'ocean'
            },
            jazz: {
                algorithm: 'waveform',
                sensitivity: 1.2,
                colorIntensity: 1.4,
                motionSpeed: 1.1,
                particleCount: 1000,
                colorPalette: 'rainbow'
            },
            ambient: {
                algorithm: 'fractal',
                sensitivity: 0.6,
                colorIntensity: 0.9,
                motionSpeed: 0.5,
                particleCount: 600,
                colorPalette: 'monochrome'
            },
            pop: {
                algorithm: 'particles',
                sensitivity: 1.3,
                colorIntensity: 1.6,
                motionSpeed: 1.4,
                particleCount: 1100,
                colorPalette: 'rainbow'
            },
            'hip-hop': {
                algorithm: 'geometric',
                sensitivity: 1.7,
                colorIntensity: 1.7,
                motionSpeed: 1.6,
                particleCount: 1300,
                colorPalette: 'neon'
            },
            folk: {
                algorithm: 'waveform',
                sensitivity: 1.0,
                colorIntensity: 1.1,
                motionSpeed: 0.9,
                particleCount: 900,
                colorPalette: 'ocean'
            }
        };
    }

    async loadModel() {
        try {
            // Create a simple neural network for genre classification
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputShape: [26], // 13 MFCC + 12 chroma + 1 spectral centroid
                        units: 64,
                        activation: 'relu'
                    }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({
                        units: 32,
                        activation: 'relu'
                    }),
                    tf.layers.dropout({ rate: 0.3 }),
                    tf.layers.dense({
                        units: this.genres.length,
                        activation: 'softmax'
                    })
                ]
            });

            this.model.compile({
                optimizer: 'adam',
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Initialize with some pre-trained weights (simulated)
            await this.initializeWeights();
            
            this.isLoaded = true;
            console.log('Genre classifier model loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading genre classifier:', error);
            return false;
        }
    }

    async initializeWeights() {
        // This simulates loading pre-trained weights
        // In a real application, you would load actual trained weights
        const weights = [];
        
        // Generate reasonable initial weights
        for (let i = 0; i < this.model.layers.length; i++) {
            const layer = this.model.layers[i];
            if (layer.getWeights().length > 0) {
                const layerWeights = layer.getWeights();
                const newWeights = layerWeights.map(w => {
                    const shape = w.shape;
                    return tf.randomNormal(shape, 0, 0.1);
                });
                layer.setWeights(newWeights);
            }
        }
    }

    extractMLFeatures(audioFeatures) {
        // Combine audio features for ML model (ensure exactly 26 features)
        const features = [
            audioFeatures.spectralCentroid / 1000, // Normalize
            audioFeatures.spectralRolloff / 1000,  // Normalize
            audioFeatures.spectralFlux,
            audioFeatures.energy / 10000,          // Normalize
            audioFeatures.zcr,
            ...audioFeatures.chroma.slice(0, 12),  // Ensure exactly 12 chroma features
            ...this.calculateMFCC(audioFeatures).slice(0, 9)   // 9 MFCC values to total 26
        ];
        
        // Ensure exactly 26 features
        while (features.length < 26) {
            features.push(0);
        }
        features.length = 26;
        
        return features;
    }

    calculateMFCC(audioFeatures) {
        // Simplified MFCC calculation
        // In a real implementation, you would use proper MFCC extraction
        const mfcc = new Array(9); // Changed to 9 to match total feature count
        const spectrum = audioFeatures.chroma;
        
        for (let i = 0; i < 9; i++) {
            let sum = 0;
            for (let j = 0; j < spectrum.length; j++) {
                sum += spectrum[j] * Math.cos(Math.PI * i * (j + 0.5) / spectrum.length);
            }
            mfcc[i] = sum / spectrum.length;
        }
        
        return mfcc;
    }

    async classifyGenre(audioFeatures) {
        if (!this.isLoaded || !this.model) {
            return this.getHeuristicClassification(audioFeatures);
        }

        try {
            const features = this.extractMLFeatures(audioFeatures);
            
            // Add to history for temporal smoothing
            this.featureHistory.push(features);
            if (this.featureHistory.length > this.maxHistoryLength) {
                this.featureHistory.shift();
            }

            // Use recent history for classification
            const recentFeatures = this.featureHistory.slice(-10);
            const avgFeatures = this.averageFeatures(recentFeatures);
            
            const prediction = this.model.predict(tf.tensor2d([avgFeatures]));
            const probabilities = await prediction.data();
            
            // Find the genre with highest probability
            let maxProb = 0;
            let predictedGenre = 'unknown';
            
            for (let i = 0; i < this.genres.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    predictedGenre = this.genres[i];
                }
            }
            
            prediction.dispose();
            
            return {
                genre: predictedGenre,
                confidence: maxProb,
                probabilities: Object.fromEntries(
                    this.genres.map((genre, i) => [genre, probabilities[i]])
                )
            };
        } catch (error) {
            console.error('Error during genre classification:', error);
            return this.getHeuristicClassification(audioFeatures);
        }
    }

    getHeuristicClassification(audioFeatures) {
        // Fallback heuristic classification based on audio features
        const { spectralCentroid, energy, zcr, spectralFlux } = audioFeatures;
        
        let genre = 'unknown';
        let confidence = 0.5;
        
        // Simple heuristic rules
        if (energy > 8000 && spectralFlux > 50) {
            if (zcr > 0.1) {
                genre = 'rock';
                confidence = 0.7;
            } else {
                genre = 'electronic';
                confidence = 0.6;
            }
        } else if (spectralCentroid < 500 && energy < 3000) {
            genre = 'ambient';
            confidence = 0.6;
        } else if (spectralCentroid > 800 && zcr > 0.08) {
            genre = 'jazz';
            confidence = 0.5;
        } else if (energy < 5000 && spectralFlux < 30) {
            genre = 'classical';
            confidence = 0.6;
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
        if (featuresArray.length === 0) return new Array(26).fill(0);
        
        const avgFeatures = new Array(26).fill(0);
        
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

    async trainOnUserData(audioFeatures, userGenreLabel) {
        if (!this.isLoaded || !this.model) return;

        try {
            const features = this.extractMLFeatures(audioFeatures);
            const genreIndex = this.genres.indexOf(userGenreLabel);
            
            if (genreIndex === -1) return;
            
            // Create one-hot encoded label
            const label = new Array(this.genres.length).fill(0);
            label[genreIndex] = 1;
            
            // Simple online learning (single sample)
            const xs = tf.tensor2d([features]);
            const ys = tf.tensor2d([label]);
            
            await this.model.fit(xs, ys, {
                epochs: 1,
                verbose: 0
            });
            
            xs.dispose();
            ys.dispose();
            
            console.log(`Model updated with user feedback for genre: ${userGenreLabel}`);
        } catch (error) {
            console.error('Error training on user data:', error);
        }
    }

    // Analyze musical characteristics for better classification
    analyzeMusicalCharacteristics(audioFeatures) {
        const characteristics = {
            energy: this.categorizeEnergy(audioFeatures.energy),
            brightness: this.categorizeBrightness(audioFeatures.spectralCentroid),
            complexity: this.categorizeComplexity(audioFeatures.spectralFlux),
            harmonic: this.categorizeHarmonic(audioFeatures.chroma),
            rhythmic: this.categorizeRhythmic(audioFeatures.zcr)
        };
        
        return characteristics;
    }

    categorizeEnergy(energy) {
        if (energy < 2000) return 'low';
        if (energy < 6000) return 'medium';
        return 'high';
    }

    categorizeBrightness(spectralCentroid) {
        if (spectralCentroid < 400) return 'dark';
        if (spectralCentroid < 800) return 'medium';
        return 'bright';
    }

    categorizeComplexity(spectralFlux) {
        if (spectralFlux < 20) return 'simple';
        if (spectralFlux < 50) return 'medium';
        return 'complex';
    }

    categorizeHarmonic(chroma) {
        const maxChroma = Math.max(...chroma);
        const avgChroma = chroma.reduce((sum, val) => sum + val, 0) / chroma.length;
        const ratio = maxChroma / avgChroma;
        
        if (ratio < 1.5) return 'atonal';
        if (ratio < 2.5) return 'moderate';
        return 'harmonic';
    }

    categorizeRhythmic(zcr) {
        if (zcr < 0.05) return 'smooth';
        if (zcr < 0.1) return 'moderate';
        return 'percussive';
    }

    dispose() {
        if (this.model) {
            this.model.dispose();
        }
        this.featureHistory = [];
    }
}