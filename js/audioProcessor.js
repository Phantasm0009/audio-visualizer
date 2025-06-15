export class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.isPlaying = false;
        this.frequencyData = new Uint8Array(1024);
        this.timeData = new Uint8Array(1024);
        this.smoothingTimeConstant = 0.8;
        this.fftSize = 1024;
        
        // Audio features for ML
        this.features = {
            spectralCentroid: 0,
            spectralRolloff: 0,
            spectralFlux: 0,
            mfcc: new Array(13).fill(0),
            chroma: new Array(12).fill(0),
            tempo: 120,
            energy: 0,
            zcr: 0 // Zero Crossing Rate
        };
        
        this.previousSpectrum = new Float32Array(1024);
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
            // Resume audio context if suspended (required by browsers)
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
            // Return empty array if no analyser
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
            // Return baseline for silent audio
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

    // Calculate spectral centroid (brightness)
    calculateSpectralCentroid(frequencyData) {
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            numerator += frequencyData[i] * i;
            denominator += frequencyData[i];
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }

    // Calculate spectral rolloff (frequency below which 85% of energy is contained)
    calculateSpectralRolloff(frequencyData) {
        const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
        const threshold = totalEnergy * 0.85;
        
        let cumulativeEnergy = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            cumulativeEnergy += frequencyData[i];
            if (cumulativeEnergy >= threshold) {
                return i;
            }
        }
        return frequencyData.length - 1;
    }

    // Calculate spectral flux (measure of rate of change in spectrum)
    calculateSpectralFlux(frequencyData) {
        let flux = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            const diff = frequencyData[i] - this.previousSpectrum[i];
            flux += diff > 0 ? diff : 0;
        }
        
        // Update previous spectrum
        for (let i = 0; i < frequencyData.length; i++) {
            this.previousSpectrum[i] = frequencyData[i];
        }
        
        return flux / frequencyData.length;
    }

    // Calculate zero crossing rate
    calculateZCR(timeData) {
        let crossings = 0;
        for (let i = 1; i < timeData.length; i++) {
            if ((timeData[i] - 128) * (timeData[i-1] - 128) < 0) {
                crossings++;
            }
        }
        return crossings / timeData.length;
    }

    // Calculate energy
    calculateEnergy(frequencyData) {
        return frequencyData.reduce((sum, val) => sum + val * val, 0) / frequencyData.length;
    }

    // Simple chroma feature extraction
    calculateChroma(frequencyData) {
        const chroma = new Array(12).fill(0);
        
        if (!frequencyData || frequencyData.length === 0) {
            return chroma;
        }
        
        const binToNote = (bin) => Math.floor((Math.log2(Math.max(bin + 1, 1)) * 12) % 12);
        
        for (let i = 1; i < frequencyData.length; i++) {
            const note = binToNote(i);
            if (note >= 0 && note < 12) {
                chroma[note] += frequencyData[i];
            }
        }
        
        // Normalize
        const maxVal = Math.max(...chroma);
        return maxVal > 0 ? chroma.map(val => val / maxVal) : chroma;
    }

    // Extract all audio features for ML
    extractFeatures() {
        const frequencyData = this.getFrequencyData();
        const timeData = this.getTimeData();
        
        this.features.spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        this.features.spectralRolloff = this.calculateSpectralRolloff(frequencyData);
        this.features.spectralFlux = this.calculateSpectralFlux(frequencyData);
        this.features.energy = this.calculateEnergy(frequencyData);
        this.features.zcr = this.calculateZCR(timeData);
        this.features.chroma = this.calculateChroma(frequencyData);
        
        return this.features;
    }

    // Get frequency bands for visualization
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

    // Get bass, mid, treble levels
    getBandLevels() {
        const frequencyData = this.getFrequencyData();
        const length = frequencyData.length;
        
        // Bass: 0-250 Hz (roughly first 1/8 of spectrum)
        let bass = 0;
        const bassEnd = Math.floor(length / 8);
        for (let i = 0; i < bassEnd; i++) {
            bass += frequencyData[i];
        }
        bass /= bassEnd;
        
        // Mid: 250-4000 Hz (roughly 1/8 to 1/2 of spectrum)
        let mid = 0;
        const midEnd = Math.floor(length / 2);
        for (let i = bassEnd; i < midEnd; i++) {
            mid += frequencyData[i];
        }
        mid /= (midEnd - bassEnd);
        
        // Treble: 4000+ Hz (roughly 1/2 to end of spectrum)
        let treble = 0;
        for (let i = midEnd; i < length; i++) {
            treble += frequencyData[i];
        }
        treble /= (length - midEnd);
        
        return { bass, mid, treble };
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