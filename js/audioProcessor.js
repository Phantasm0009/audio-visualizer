export class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.isPlaying = false;
        this.frequencyData = new Uint8Array(2048);
        this.timeData = new Uint8Array(2048);
        this.smoothingTimeConstant = 0.8;
        this.fftSize = 2048;
        
        // Enhanced audio features for professional analysis
        this.features = {
            spectralCentroid: 0,
            spectralRolloff: 0,
            spectralFlux: 0,
            mfcc: new Array(13).fill(0),
            chroma: new Array(12).fill(0),
            tempo: 120,
            energy: 0,
            zcr: 0, // Zero Crossing Rate
            rms: 0, // Root Mean Square (volume intensity)
            brightness: 0,
            roughness: 0,
            harmonicity: 0,
            onset: 0,
            spectralSpread: 0,
            spectralSkewness: 0,
            spectralKurtosis: 0,
            spectralSlope: 0,
            spectralDecrease: 0,
            spectralRolloff85: 0,
            spectralRolloff95: 0
        };
        
        this.previousSpectrum = new Float32Array(2048);
        this.beatDetector = new AdvancedBeatDetector();
        this.onsetDetector = new OnsetDetector();
        this.tempoAnalyzer = new TempoAnalyzer();
        
        // Audio history for advanced analysis
        this.audioHistory = [];
        this.maxHistoryLength = 300; // 5 seconds at 60fps
        
        // Performance optimization
        this.worker = null;
        this.initializeWorker();
    }

    async initializeWorker() {
        // Create Web Worker for heavy audio processing
        const workerCode = `
            class AudioWorker {
                constructor() {
                    this.previousSpectrum = new Float32Array(2048);
                }
                
                calculateMFCC(spectrum) {
                    const mfcc = new Array(13);
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
                
                processAudio(data) {
                    const { frequencyData, timeData } = data;
                    
                    // Calculate advanced features
                    const features = {
                        mfcc: this.calculateMFCC(frequencyData),
                        spectralCentroid: this.calculateSpectralCentroid(frequencyData),
                        spectralSpread: this.calculateSpectralSpread(frequencyData),
                        spectralSkewness: this.calculateSpectralSkewness(frequencyData),
                        spectralKurtosis: this.calculateSpectralKurtosis(frequencyData),
                        zcr: this.calculateZCR(timeData),
                        rms: this.calculateRMS(timeData)
                    };
                    
                    return features;
                }
                
                calculateSpectralCentroid(spectrum) {
                    let numerator = 0;
                    let denominator = 0;
                    
                    for (let i = 0; i < spectrum.length; i++) {
                        numerator += spectrum[i] * i;
                        denominator += spectrum[i];
                    }
                    
                    return denominator > 0 ? numerator / denominator : 0;
                }
                
                calculateSpectralSpread(spectrum) {
                    const centroid = this.calculateSpectralCentroid(spectrum);
                    let spread = 0;
                    let totalMagnitude = 0;
                    
                    for (let i = 0; i < spectrum.length; i++) {
                        spread += Math.pow(i - centroid, 2) * spectrum[i];
                        totalMagnitude += spectrum[i];
                    }
                    
                    return totalMagnitude > 0 ? Math.sqrt(spread / totalMagnitude) : 0;
                }
                
                calculateSpectralSkewness(spectrum) {
                    const centroid = this.calculateSpectralCentroid(spectrum);
                    const spread = this.calculateSpectralSpread(spectrum);
                    
                    if (spread === 0) return 0;
                    
                    let skewness = 0;
                    let totalMagnitude = 0;
                    
                    for (let i = 0; i < spectrum.length; i++) {
                        skewness += Math.pow((i - centroid) / spread, 3) * spectrum[i];
                        totalMagnitude += spectrum[i];
                    }
                    
                    return totalMagnitude > 0 ? skewness / totalMagnitude : 0;
                }
                
                calculateSpectralKurtosis(spectrum) {
                    const centroid = this.calculateSpectralCentroid(spectrum);
                    const spread = this.calculateSpectralSpread(spectrum);
                    
                    if (spread === 0) return 0;
                    
                    let kurtosis = 0;
                    let totalMagnitude = 0;
                    
                    for (let i = 0; i < spectrum.length; i++) {
                        kurtosis += Math.pow((i - centroid) / spread, 4) * spectrum[i];
                        totalMagnitude += spectrum[i];
                    }
                    
                    return totalMagnitude > 0 ? (kurtosis / totalMagnitude) - 3 : 0;
                }
                
                calculateZCR(timeData) {
                    let crossings = 0;
                    for (let i = 1; i < timeData.length; i++) {
                        if ((timeData[i] - 128) * (timeData[i-1] - 128) < 0) {
                            crossings++;
                        }
                    }
                    return crossings / timeData.length;
                }
                
                calculateRMS(timeData) {
                    let sum = 0;
                    for (let i = 0; i < timeData.length; i++) {
                        const normalized = (timeData[i] - 128) / 128;
                        sum += normalized * normalized;
                    }
                    return Math.sqrt(sum / timeData.length);
                }
            }
            
            const audioWorker = new AudioWorker();
            
            self.onmessage = function(e) {
                const result = audioWorker.processAudio(e.data);
                self.postMessage(result);
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.frequencyData = new Uint8Array(bufferLength);
            this.timeData = new Uint8Array(bufferLength);
            
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    async loadAudioFile(file) {
        if (!this.audioContext) {
            await this.initializeAudio();
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (this.source) {
                this.source.disconnect();
            }
            
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            return true;
        } catch (error) {
            console.error('Error loading audio file:', error);
            return false;
        }
    }

    connectToAudioElement(audioElement) {
        if (!this.audioContext) {
            this.initializeAudio();
        }

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            if (this.source) {
                this.source.disconnect();
            }
            
            this.source = this.audioContext.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            return true;
        } catch (error) {
            console.error('Error connecting to audio element:', error);
            return false;
        }
    }

    getFrequencyData() {
        if (!this.analyser) {
            this.frequencyData.fill(0);
            return this.frequencyData;
        }
        
        try {
            this.analyser.getByteFrequencyData(this.frequencyData);
        } catch (error) {
            console.warn('Error getting frequency data:', error);
            this.frequencyData.fill(0);
        }
        return this.frequencyData;
    }

    getTimeData() {
        if (!this.analyser) {
            this.timeData.fill(128);
            return this.timeData;
        }
        
        try {
            this.analyser.getByteTimeDomainData(this.timeData);
        } catch (error) {
            console.warn('Error getting time data:', error);
            this.timeData.fill(128);
        }
        return this.timeData;
    }

    // Enhanced spectral analysis
    calculateSpectralCentroid(frequencyData) {
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            numerator += frequencyData[i] * i;
            denominator += frequencyData[i];
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }

    calculateSpectralRolloff(frequencyData, percentage = 0.85) {
        const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
        const threshold = totalEnergy * percentage;
        
        let cumulativeEnergy = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            cumulativeEnergy += frequencyData[i];
            if (cumulativeEnergy >= threshold) {
                return i;
            }
        }
        return frequencyData.length - 1;
    }

    calculateSpectralFlux(frequencyData) {
        let flux = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const diff = frequencyData[i] - this.previousSpectrum[i];
            flux += diff > 0 ? diff : 0;
        }
        
        for (let i = 0; i < frequencyData.length; i++) {
            this.previousSpectrum[i] = frequencyData[i];
        }
        
        return flux / frequencyData.length;
    }

    calculateRMS(timeData) {
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            const normalized = (timeData[i] - 128) / 128;
            sum += normalized * normalized;
        }
        return Math.sqrt(sum / timeData.length);
    }

    calculateZCR(timeData) {
        let crossings = 0;
        for (let i = 1; i < timeData.length; i++) {
            if ((timeData[i] - 128) * (timeData[i-1] - 128) < 0) {
                crossings++;
            }
        }
        return crossings / timeData.length;
    }

    calculateBrightness(frequencyData) {
        // Brightness is the ratio of high-frequency to total energy
        const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
        const highFreqStart = Math.floor(frequencyData.length * 0.5);
        const highFreqEnergy = frequencyData.slice(highFreqStart).reduce((sum, val) => sum + val, 0);
        
        return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
    }

    calculateRoughness(frequencyData) {
        // Roughness based on spectral irregularity
        let roughness = 0;
        for (let i = 1; i < frequencyData.length - 1; i++) {
            roughness += Math.abs(frequencyData[i] - (frequencyData[i-1] + frequencyData[i+1]) / 2);
        }
        return roughness / (frequencyData.length - 2);
    }

    calculateHarmonicity(frequencyData) {
        // Simple harmonicity measure based on peak detection
        const peaks = this.findPeaks(frequencyData);
        if (peaks.length < 2) return 0;
        
        let harmonicScore = 0;
        const fundamental = peaks[0];
        
        for (let i = 1; i < peaks.length; i++) {
            const ratio = peaks[i] / fundamental;
            const nearestHarmonic = Math.round(ratio);
            const error = Math.abs(ratio - nearestHarmonic);
            harmonicScore += Math.exp(-error * 10); // Exponential decay for error
        }
        
        return harmonicScore / (peaks.length - 1);
    }

    findPeaks(data, threshold = 0.1) {
        const peaks = [];
        const maxVal = Math.max(...data);
        const minThreshold = maxVal * threshold;
        
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i-1] && data[i] > data[i+1] && data[i] > minThreshold) {
                peaks.push(i);
            }
        }
        
        return peaks;
    }

    calculateChroma(frequencyData) {
        const chroma = new Array(12).fill(0);
        
        if (!frequencyData || frequencyData.length === 0) {
            return chroma;
        }
        
        const binToNote = (bin) => {
            const freq = bin * this.audioContext.sampleRate / (2 * frequencyData.length);
            const noteNumber = 12 * Math.log2(freq / 440) + 69; // A4 = 440Hz = note 69
            return Math.floor(noteNumber) % 12;
        };
        
        for (let i = 1; i < frequencyData.length; i++) {
            const note = binToNote(i);
            if (note >= 0 && note < 12) {
                chroma[note] += frequencyData[i];
            }
        }
        
        const maxVal = Math.max(...chroma);
        return maxVal > 0 ? chroma.map(val => val / maxVal) : chroma;
    }

    // Advanced feature extraction with Web Worker
    async extractFeaturesAsync() {
        const frequencyData = this.getFrequencyData();
        const timeData = this.getTimeData();
        
        // Basic features (calculated on main thread)
        this.features.spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        this.features.spectralRolloff = this.calculateSpectralRolloff(frequencyData);
        this.features.spectralFlux = this.calculateSpectralFlux(frequencyData);
        this.features.energy = frequencyData.reduce((sum, val) => sum + val * val, 0) / frequencyData.length;
        this.features.brightness = this.calculateBrightness(frequencyData);
        this.features.roughness = this.calculateRoughness(frequencyData);
        this.features.harmonicity = this.calculateHarmonicity(frequencyData);
        this.features.chroma = this.calculateChroma(frequencyData);
        
        // Advanced features (calculated in Web Worker)
        if (this.worker) {
            try {
                const workerFeatures = await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Worker timeout')), 100);
                    
                    this.worker.onmessage = (e) => {
                        clearTimeout(timeout);
                        resolve(e.data);
                    };
                    
                    this.worker.postMessage({ frequencyData, timeData });
                });
                
                // Merge worker results
                Object.assign(this.features, workerFeatures);
            } catch (error) {
                console.warn('Worker processing failed, using fallback:', error);
                // Fallback to main thread
                this.features.zcr = this.calculateZCR(timeData);
                this.features.rms = this.calculateRMS(timeData);
            }
        } else {
            // Fallback calculations
            this.features.zcr = this.calculateZCR(timeData);
            this.features.rms = this.calculateRMS(timeData);
        }
        
        // Beat and tempo detection
        this.features.onset = this.onsetDetector.detect(frequencyData);
        const beatInfo = this.beatDetector.detectBeat(this.features.energy);
        this.features.tempo = this.tempoAnalyzer.analyze(beatInfo.isBeat);
        
        // Add to history for temporal analysis
        this.audioHistory.push({
            timestamp: Date.now(),
            features: { ...this.features }
        });
        
        if (this.audioHistory.length > this.maxHistoryLength) {
            this.audioHistory.shift();
        }
        
        return this.features;
    }

    // Synchronous feature extraction for compatibility
    extractFeatures() {
        const frequencyData = this.getFrequencyData();
        const timeData = this.getTimeData();
        
        this.features.spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        this.features.spectralRolloff = this.calculateSpectralRolloff(frequencyData);
        this.features.spectralFlux = this.calculateSpectralFlux(frequencyData);
        this.features.energy = frequencyData.reduce((sum, val) => sum + val * val, 0) / frequencyData.length;
        this.features.zcr = this.calculateZCR(timeData);
        this.features.rms = this.calculateRMS(timeData);
        this.features.brightness = this.calculateBrightness(frequencyData);
        this.features.roughness = this.calculateRoughness(frequencyData);
        this.features.harmonicity = this.calculateHarmonicity(frequencyData);
        this.features.chroma = this.calculateChroma(frequencyData);
        
        return this.features;
    }

    getFrequencyBands(numBands = 64) {
        const frequencyData = this.getFrequencyData();
        const bands = new Array(numBands);
        const bandSize = Math.floor(frequencyData.length / numBands);
        
        for (let i = 0; i < numBands; i++) {
            let sum = 0;
            const start = i * bandSize;
            const end = start + bandSize;
            
            for (let j = start; j < end && j < frequencyData.length; j++) {
                sum += frequencyData[j];
            }
            
            bands[i] = sum / bandSize;
        }
        
        return bands;
    }

    getBandLevels() {
        const frequencyData = this.getFrequencyData();
        const length = frequencyData.length;
        
        // Enhanced frequency band separation
        let subBass = 0, bass = 0, lowMid = 0, mid = 0, highMid = 0, treble = 0, presence = 0, brilliance = 0;
        
        // Sub-bass: 20-60 Hz
        const subBassEnd = Math.floor(length * 0.02);
        for (let i = 0; i < subBassEnd; i++) {
            subBass += frequencyData[i];
        }
        subBass /= subBassEnd;
        
        // Bass: 60-250 Hz
        const bassEnd = Math.floor(length * 0.08);
        for (let i = subBassEnd; i < bassEnd; i++) {
            bass += frequencyData[i];
        }
        bass /= (bassEnd - subBassEnd);
        
        // Low-mid: 250-500 Hz
        const lowMidEnd = Math.floor(length * 0.15);
        for (let i = bassEnd; i < lowMidEnd; i++) {
            lowMid += frequencyData[i];
        }
        lowMid /= (lowMidEnd - bassEnd);
        
        // Mid: 500-2000 Hz
        const midEnd = Math.floor(length * 0.4);
        for (let i = lowMidEnd; i < midEnd; i++) {
            mid += frequencyData[i];
        }
        mid /= (midEnd - lowMidEnd);
        
        // High-mid: 2000-4000 Hz
        const highMidEnd = Math.floor(length * 0.6);
        for (let i = midEnd; i < highMidEnd; i++) {
            highMid += frequencyData[i];
        }
        highMid /= (highMidEnd - midEnd);
        
        // Treble: 4000-8000 Hz
        const trebleEnd = Math.floor(length * 0.8);
        for (let i = highMidEnd; i < trebleEnd; i++) {
            treble += frequencyData[i];
        }
        treble /= (trebleEnd - highMidEnd);
        
        // Presence: 8000-16000 Hz
        const presenceEnd = Math.floor(length * 0.9);
        for (let i = trebleEnd; i < presenceEnd; i++) {
            presence += frequencyData[i];
        }
        presence /= (presenceEnd - trebleEnd);
        
        // Brilliance: 16000+ Hz
        for (let i = presenceEnd; i < length; i++) {
            brilliance += frequencyData[i];
        }
        brilliance /= (length - presenceEnd);
        
        return { 
            subBass, bass, lowMid, mid, highMid, treble, presence, brilliance,
            // Legacy compatibility
            bass: (subBass + bass) / 2,
            mid: (lowMid + mid + highMid) / 3,
            treble: (treble + presence + brilliance) / 3
        };
    }

    updateSettings(settings) {
        if (this.analyser) {
            if (settings.fftSize) {
                this.analyser.fftSize = parseInt(settings.fftSize);
                const bufferLength = this.analyser.frequencyBinCount;
                this.frequencyData = new Uint8Array(bufferLength);
                this.timeData = new Uint8Array(bufferLength);
            }
            
            if (settings.smoothing !== undefined) {
                this.analyser.smoothingTimeConstant = parseFloat(settings.smoothing);
            }
        }
    }

    dispose() {
        if (this.worker) {
            this.worker.terminate();
        }
        if (this.source) {
            this.source.disconnect();
        }
        if (this.analyser) {
            this.analyser.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Advanced Beat Detection Class
class AdvancedBeatDetector {
    constructor() {
        this.history = [];
        this.energyHistory = [];
        this.threshold = 1.3;
        this.minTimeBetweenBeats = 100; // ms
        this.lastBeatTime = 0;
        this.variance = 0;
        this.localAverage = 0;
        this.bpm = 120;
        this.beatStrength = 0;
        this.confidence = 0;
    }
    
    detectBeat(energy) {
        const now = Date.now();
        this.history.push({ energy, time: now });
        this.energyHistory.push(energy);
        
        // Keep only recent history
        this.history = this.history.filter(entry => now - entry.time < 3000);
        if (this.energyHistory.length > 60) {
            this.energyHistory.shift();
        }
        
        if (this.energyHistory.length < 10) {
            return { isBeat: false, strength: 0, confidence: 0 };
        }
        
        // Calculate local energy statistics
        const recentEnergy = this.energyHistory.slice(-20);
        this.localAverage = recentEnergy.reduce((sum, e) => sum + e, 0) / recentEnergy.length;
        this.variance = recentEnergy.reduce((sum, e) => sum + Math.pow(e - this.localAverage, 2), 0) / recentEnergy.length;
        
        // Adaptive threshold
        const adaptiveThreshold = this.threshold + Math.sqrt(this.variance) * 0.3;
        
        // Beat detection
        const energyRatio = energy / (this.localAverage + 0.001);
        this.beatStrength = Math.max(0, (energyRatio - 1) / 2);
        
        const isBeat = energyRatio > adaptiveThreshold && 
                      now - this.lastBeatTime > this.minTimeBetweenBeats;
        
        if (isBeat) {
            this.lastBeatTime = now;
            this.updateBPM();
            this.confidence = Math.min(this.beatStrength, 1);
        }
        
        return {
            isBeat,
            strength: this.beatStrength,
            confidence: this.confidence,
            bpm: this.bpm
        };
    }
    
    updateBPM() {
        if (this.history.length < 4) return;
        
        const recentBeats = this.history.slice(-8);
        const intervals = [];
        
        for (let i = 1; i < recentBeats.length; i++) {
            intervals.push(recentBeats[i].time - recentBeats[i-1].time);
        }
        
        if (intervals.length > 0) {
            const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
            this.bpm = Math.round(60000 / avgInterval);
            this.bpm = Math.max(60, Math.min(200, this.bpm)); // Clamp to reasonable range
        }
    }
}

// Onset Detection Class
class OnsetDetector {
    constructor() {
        this.previousSpectrum = new Float32Array(1024);
        this.spectralFluxHistory = [];
        this.threshold = 0.1;
    }
    
    detect(frequencyData) {
        // Calculate spectral flux
        let flux = 0;
        for (let i = 0; i < Math.min(frequencyData.length, this.previousSpectrum.length); i++) {
            const diff = frequencyData[i] - this.previousSpectrum[i];
            flux += diff > 0 ? diff : 0;
        }
        
        this.spectralFluxHistory.push(flux);
        if (this.spectralFluxHistory.length > 10) {
            this.spectralFluxHistory.shift();
        }
        
        // Update previous spectrum
        for (let i = 0; i < Math.min(frequencyData.length, this.previousSpectrum.length); i++) {
            this.previousSpectrum[i] = frequencyData[i];
        }
        
        // Onset detection based on flux peaks
        if (this.spectralFluxHistory.length < 5) return 0;
        
        const recent = this.spectralFluxHistory.slice(-5);
        const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        
        return flux > average * (1 + this.threshold) ? flux / average : 0;
    }
}

// Tempo Analysis Class
class TempoAnalyzer {
    constructor() {
        this.beatTimes = [];
        this.tempoHistory = [];
        this.currentTempo = 120;
    }
    
    analyze(isBeat) {
        if (isBeat) {
            const now = Date.now();
            this.beatTimes.push(now);
            
            // Keep only recent beats (last 10 seconds)
            this.beatTimes = this.beatTimes.filter(time => now - time < 10000);
            
            if (this.beatTimes.length >= 4) {
                const intervals = [];
                for (let i = 1; i < this.beatTimes.length; i++) {
                    intervals.push(this.beatTimes[i] - this.beatTimes[i-1]);
                }
                
                // Calculate tempo from intervals
                const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
                const tempo = 60000 / avgInterval;
                
                if (tempo >= 60 && tempo <= 200) {
                    this.tempoHistory.push(tempo);
                    if (this.tempoHistory.length > 8) {
                        this.tempoHistory.shift();
                    }
                    
                    // Smooth tempo calculation
                    this.currentTempo = this.tempoHistory.reduce((sum, t) => sum + t, 0) / this.tempoHistory.length;
                }
            }
        }
        
        return Math.round(this.currentTempo);
    }
}