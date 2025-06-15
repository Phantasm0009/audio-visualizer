# 🎵 Music Visualizer - Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 🎵 **Audio Not Playing / Stuck at 0:00**

#### **Possible Causes:**
1. **Audio Context Suspended**: Modern browsers require user interaction to start audio
2. **File Format Not Supported**: Browser might not support the audio codec
3. **CORS Issues**: File might be blocked by browser security
4. **Audio Context Connection Failed**: WebAudio API connection issue

#### **Solutions:**

1. **Try Demo Mode First**:
   - Click the "Demo Mode" button in the header
   - This will test if the visualization works without audio
   - If demo works, the issue is with audio processing

2. **Supported Audio Formats**:
   - ✅ **MP3** (most compatible)
   - ✅ **WAV** (uncompressed, large files)
   - ✅ **OGG** (Firefox/Chrome)
   - ✅ **M4A/AAC** (Safari/Chrome)
   - ❌ **FLAC** (limited support)

3. **Browser Compatibility**:
   - **Chrome**: Best support (recommended)
   - **Firefox**: Good support
   - **Safari**: Good support (requires iOS 14.5+)
   - **Edge**: Good support

4. **File Size Limits**:
   - Keep files under 100MB for best performance
   - Large files may take longer to load

### 🎨 **Visualization Issues**

#### **WebGL Errors**:
- Error: `WebGL: INVALID_VALUE: texImage2D: bad image data`
- **Solution**: Refresh the page and try demo mode first

#### **Black Screen / No Visualization**:
1. Check browser console for errors (F12)
2. Try different visualization algorithms
3. Ensure WebGL is enabled in browser
4. Update graphics drivers

### 🤖 **ML Model Errors**

#### **Shape Mismatch Error**:
- Error: `expected dense_Dense1_input to have shape [null,26] but got array with shape [1,30]`
- **Status**: Fixed in latest version
- **Solution**: Refresh the page

### 🎯 **Step-by-Step Debugging**

1. **Open Browser Console** (F12):
   - Look for error messages in red
   - Note any warnings in yellow

2. **Test Demo Mode**:
   ```
   Click "Demo Mode" → Should show moving particles
   ```

3. **Test Audio Loading**:
   ```
   Choose small MP3 file → Check status indicator
   Should show: "Audio Ready - Click Play"
   ```

4. **Test Audio Playback**:
   ```
   Click play on audio player → Should start playing
   Status should show: "Playing"
   ```

5. **Check Audio Context**:
   ```
   In console, check: window.musicVisualizerApp.audioProcessor.audioContext.state
   Should be: "running"
   ```

### 🔍 **Browser Console Commands**

Test audio context state:
```javascript
console.log('Audio Context State:', window.musicVisualizerApp.audioProcessor.audioContext?.state);
```

Test visualization:
```javascript
window.musicVisualizerApp.toggleDemoMode();
```

Check for errors:
```javascript
window.musicVisualizerApp.audioProcessor.getFrequencyData();
```

### 📱 **Mobile Device Issues**

1. **iOS Safari**:
   - Requires user interaction before audio
   - Tap screen before loading audio
   - Use MP3 or M4A formats

2. **Android Chrome**:
   - Usually works well
   - May need to enable hardware acceleration

### 🔧 **Advanced Troubleshooting**

#### **Audio Context Suspended**:
```javascript
// Manually resume audio context
await window.musicVisualizerApp.audioProcessor.audioContext.resume();
```

#### **Force Audio Reconnection**:
```javascript
// Reconnect audio after loading
const audioPlayer = document.getElementById('audioPlayer');
window.musicVisualizerApp.audioProcessor.connectToAudioElement(audioPlayer);
```

#### **Clear Browser Cache**:
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear all browser data for localhost

### 📊 **Performance Optimization**

1. **Reduce Particle Count**:
   - Lower particle count for better performance
   - Adjust in Customization section

2. **Change Visualization Algorithm**:
   - "Particles" is most intensive
   - "Waveform" is lightest

3. **Adjust FFT Size**:
   - Settings → Advanced Settings → FFT Size
   - Lower values = better performance

### 🆘 **Still Not Working?**

1. **Check System Requirements**:
   - Modern browser (Chrome 80+, Firefox 75+, Safari 14+)
   - WebGL support enabled
   - Hardware acceleration enabled

2. **Try Different Files**:
   - Use a simple MP3 file (< 10MB)
   - Try a different audio format

3. **Test on Different Browser**:
   - Chrome usually has best compatibility
   - Disable browser extensions

4. **Check Network**:
   - Ensure good internet connection for CDN resources
   - Try refreshing the page

### 📋 **Quick Checklist**

- [ ] Demo mode works
- [ ] Audio file loads (shows filename)
- [ ] Status shows "Audio Ready - Click Play"
- [ ] Audio player shows duration (not 0:00)
- [ ] Console shows no red errors
- [ ] WebGL is enabled
- [ ] Using supported audio format

---

## 🎵 **Success Indicators**

When everything works correctly, you should see:

1. ✅ Status: "Playing"
2. ✅ Audio player shows progress
3. ✅ Particles moving and changing colors
4. ✅ Frequency bars updating
5. ✅ Genre detection working
6. ✅ No console errors

---

**Happy Visualizing! 🎨✨**
