# 🎵 Algorithmic Music Visualizer

A cutting-edge web application that creates real-time generative art from local music files using advanced signal processing, WebAudio API, Three.js graphics, and machine learning-powered genre classification.

![Music Visualizer Demo](screenshot.png)

## ✨ Features

### 🎨 **Real-time Generative Visuals**
- **Multiple Visualization Algorithms**: 
  - Particle Systems with dynamic movement
  - Dynamic Waveform visualization
  - Fractal pattern generation
  - Fluid dynamics simulation
  - Geometric pattern arrays

### 🤖 **Machine Learning Integration**
- **Automatic Genre Classification** using TensorFlow.js
- **Audio Feature Extraction**: MFCC, Chroma, Spectral Centroid, Energy analysis
- **Auto-preset Selection** based on detected music genre
- **Adaptive Learning** from user preferences

### 🎛️ **User Customization**
- **Real-time Controls**: Sensitivity, Color Intensity, Motion Speed
- **Color Palettes**: Rainbow, Ocean, Fire, Neon, Monochrome themes
- **Preset System**: Genre-specific visualization presets
- **Shareable Configurations**: Export and import custom presets

### 🎵 **Advanced Audio Processing**
- **WebAudio API** integration for precise audio analysis
- **Multi-band Frequency Analysis** (Bass, Mid, Treble)
- **Spectral Feature Extraction** for ML classification
- **Real-time FFT processing** with customizable parameters

## 🚀 Quick Start

1. **Open the Application**
   ```bash
   # Simply open index.html in a modern web browser
   # Or serve it using a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Load Your Music**
   - Click "Choose Audio File" to select any audio file (MP3, WAV, etc.)
   - The audio player will appear with standard playback controls

3. **Start Visualizing**
   - Press play on the audio player
   - Watch as the AI automatically detects the genre
   - Customize the visualization using the controls

## 🎛️ Controls Guide

### **Audio Source**
- **File Upload**: Support for all major audio formats
- **Audio Player**: Standard playback controls with WebAudio integration

### **Visualization Algorithms**
- **Particles**: Dynamic particle systems that respond to frequency data
- **Waveform**: Real-time waveform visualization with multi-layer effects
- **Fractal**: Recursive geometric patterns that evolve with the music
- **Fluid**: Fluid dynamics simulation with audio-reactive deformation
- **Geometric**: Array of 3D shapes with physics-based movement

### **Genre Detection**
- **Real-time Analysis**: Continuous ML-powered genre classification
- **Confidence Indicator**: Visual confidence level display
- **Auto-preset**: Automatic visualization preset selection

### **Customization Controls**
- **Sensitivity** (0.1-2.0): Adjust responsiveness to audio input
- **Color Intensity** (0.1-2.0): Control color saturation and brightness
- **Motion Speed** (0.1-3.0): Modify animation and movement speed
- **Particle Count** (100-2000): Adjust number of visual elements

### **Color Palettes**
- **Rainbow**: Full spectrum color cycling
- **Ocean**: Blue-green aquatic themes
- **Fire**: Warm red-orange-yellow tones
- **Neon**: Bright synthetic colors
- **Monochrome**: Grayscale aesthetic

## 🧠 Machine Learning Features

### **Genre Classification Model**
The app uses a neural network trained to recognize:
- Rock
- Electronic
- Jazz
- Classical
- Pop
- Hip-Hop
- Ambient
- Folk

### **Audio Feature Extraction**
- **Spectral Centroid**: Brightness measure
- **Spectral Rolloff**: Frequency distribution
- **Spectral Flux**: Rate of spectral change
- **MFCC**: Mel-frequency cepstral coefficients
- **Chroma Features**: Harmonic content analysis
- **Zero Crossing Rate**: Temporal characteristics
- **Energy**: Overall signal power

### **Adaptive Learning**
The system learns from user interactions and can be trained on custom data for improved accuracy.

## 🏗️ Technical Architecture

### **Frontend Technologies**
- **HTML5**: Semantic structure and audio elements
- **CSS3**: Modern styling with gradients and animations
- **JavaScript ES6+**: Modular architecture with classes
- **WebAudio API**: Real-time audio processing
- **Three.js**: 3D graphics and WebGL rendering
- **TensorFlow.js**: Client-side machine learning

### **File Structure**
```
music-visualizer/
├── index.html              # Main application page
├── styles.css              # Complete styling and animations
├── js/
│   ├── app.js              # Main application controller
│   ├── audioProcessor.js   # WebAudio API integration
│   ├── visualizers.js      # Three.js visualization engines
│   └── genreClassifier.js  # TensorFlow.js ML model
└── README.md               # Documentation
```

### **Audio Processing Pipeline**
1. **Audio Input**: File upload or microphone
2. **WebAudio Processing**: FFT analysis and feature extraction
3. **Signal Analysis**: Frequency bands and spectral features
4. **ML Classification**: Genre detection and preset selection
5. **Visualization**: Real-time 3D graphics rendering

## 🎨 Visualization Algorithms Deep Dive

### **Particle System**
- Creates thousands of particles in 3D space
- Each particle responds to specific frequency bands
- Dynamic color mapping based on audio intensity
- Physics-based movement with audio-reactive forces

### **Dynamic Waveform**
- Real-time time-domain visualization
- Multi-layer waveforms for stereo depth
- Frequency-based color modulation
- Smooth interpolation and motion blur effects

### **Fractal Generator**
- Recursive geometric pattern creation
- Audio-reactive scaling and rotation
- Nested complexity based on harmonic content
- Real-time material property changes

### **Fluid Dynamics**
- WebGL shader-based fluid simulation
- Audio data mapped to fluid velocity fields
- Real-time surface deformation
- Particle advection and turbulence

### **Geometric Patterns**
- Array of 3D primitive shapes
- Individual object audio responsiveness
- Dynamic material properties
- Physics-based collision and interaction

## 🔧 Advanced Configuration

### **Audio Settings**
- **FFT Size**: 512, 1024, 2048, 4096 samples
- **Smoothing**: 0.0-0.9 temporal smoothing
- **Sample Rate**: Automatic detection

### **Performance Options**
- **Target FPS**: 30, 60, 120 frames per second
- **Particle Limits**: Automatic GPU capability detection
- **Quality Scaling**: Dynamic resolution adjustment

### **Preset System**
Presets are JSON objects containing:
```json
{
  "algorithm": "particles",
  "sensitivity": 1.5,
  "colorIntensity": 1.8,
  "motionSpeed": 2.0,
  "particleCount": 1500,
  "colorPalette": "neon"
}
```

## 🎮 User Interface

### **Modern Design**
- **Glass-morphism**: Translucent panels with backdrop blur
- **Gradient Animations**: Dynamic color transitions
- **Responsive Layout**: Works on desktop and mobile
- **Dark Theme**: Easy on the eyes during long sessions

### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: Alternative color schemes
- **Motion Reduction**: Respects user preferences

## 🌐 Browser Compatibility

### **Supported Browsers**
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (iOS 14.5+)
- **Edge**: Full support

### **Required Features**
- WebAudio API
- WebGL 2.0
- ES6 Modules
- File API
- Canvas 2D/3D

## 🚀 Performance Optimization

### **Rendering Optimizations**
- **Object Pooling**: Reuse geometry and materials
- **LOD System**: Level-of-detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Shader Optimization**: Efficient GPU operations

### **Audio Optimizations**
- **Buffer Management**: Circular audio buffers
- **Feature Caching**: Cache expensive calculations
- **Async Processing**: Non-blocking audio analysis
- **Memory Management**: Proper resource disposal

## 🔮 Future Enhancements

### **Planned Features**
- **VR Support**: WebXR integration for immersive experiences
- **Live Input**: Real-time microphone visualization
- **Social Sharing**: Direct social media integration
- **Cloud Presets**: Community-shared visualization presets
- **MIDI Control**: Hardware controller integration
- **Video Export**: Record visualizations as video files

### **ML Improvements**
- **Better Training Data**: Larger, more diverse datasets
- **Style Transfer**: AI-generated visual styles
- **Emotion Detection**: Mood-based visualizations
- **Tempo Detection**: BPM-synchronized animations

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Areas for Contribution**
- New visualization algorithms
- ML model improvements
- Performance optimizations
- UI/UX enhancements
- Documentation and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: Amazing 3D graphics library
- **TensorFlow.js Team**: Making ML accessible in browsers
- **WebAudio API**: Enabling real-time audio processing
- **Open Source Community**: Inspiration and collaboration

## 📧 Contact

For questions, suggestions, or collaboration opportunities:
- **GitHub Issues**: Use for bug reports and feature requests
- **Email**: [your-email@domain.com]
- **Discord**: Join our community server

---

**Built with ❤️ for music lovers and visual artists everywhere!**
