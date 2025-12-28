// Sound effects for the emergency platform
// Uses Web Audio API for better performance

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = this.loadPreference();
    this.volume = 0.3; // 30% volume as requested
    this.sounds = {};
    this.initialized = false;
    this.onSoundPlay = null; // Callback for visual notifications
  }

  // Load sound preference from localStorage
  loadPreference() {
    try {
      const saved = localStorage.getItem('emergencyHub_soundEnabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  }

  // Save sound preference to localStorage
  savePreference() {
    try {
      localStorage.setItem('emergencyHub_soundEnabled', String(this.enabled));
    } catch {
      // localStorage not available
    }
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Sound system initialized');
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  // Generate a beep tone
  playBeep(frequency = 800, duration = 0.15, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Critical alert sound - urgent beeping (440Hz as requested)
  playCriticalAlert() {
    if (!this.enabled) return;
    this.init();

    // Play 3 rapid beeps at 440Hz (0.2s total as requested)
    this.playBeep(440, 0.07);
    setTimeout(() => this.playBeep(440, 0.07), 80);
    setTimeout(() => this.playBeep(520, 0.1), 160);
    
    // Trigger visual notification
    if (this.onSoundPlay) {
      this.onSoundPlay('critical', '🚨 New Critical Incident');
    }
  }

  // New incident sound
  playNewIncident() {
    if (!this.enabled) return;
    this.init();

    // Two-tone notification
    this.playBeep(600, 0.1);
    setTimeout(() => this.playBeep(800, 0.15), 120);
  }

  // Dispatched sound - Success chime (ascending tones)
  playDispatched() {
    if (!this.enabled) return;
    this.init();

    // Ascending tones for dispatch
    this.playBeep(400, 0.08);
    setTimeout(() => this.playBeep(500, 0.08), 100);
    setTimeout(() => this.playBeep(600, 0.08), 200);
    setTimeout(() => this.playBeep(800, 0.15), 300);
    
    // Trigger visual notification
    if (this.onSoundPlay) {
      this.onSoundPlay('dispatched', '🚀 Responders Dispatched');
    }
  }

  // Success chime (alias for dispatched)
  playSuccess() {
    if (!this.enabled) return;
    this.init();

    // Ascending tones
    this.playBeep(400, 0.1);
    setTimeout(() => this.playBeep(600, 0.1), 100);
    setTimeout(() => this.playBeep(800, 0.15), 200);
  }

  // Resolved sound - Soft completion tone
  playResolved() {
    if (!this.enabled) return;
    this.init();

    // Soft pleasant completion sound
    this.playBeep(500, 0.15, 'triangle');
    setTimeout(() => this.playBeep(650, 0.2, 'triangle'), 150);
    setTimeout(() => this.playBeep(800, 0.25, 'triangle'), 300);
    
    // Trigger visual notification
    if (this.onSoundPlay) {
      this.onSoundPlay('resolved', '✅ Incident Resolved');
    }
  }

  // Completion tone (alias)
  playComplete() {
    this.playResolved();
  }

  // Error sound
  playError() {
    if (!this.enabled) return;
    this.init();

    // Low warning tone
    this.playBeep(300, 0.2);
    setTimeout(() => this.playBeep(200, 0.3), 150);
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    this.savePreference();
    return this.enabled;
  }

  // Set enabled state
  setEnabled(enabled) {
    this.enabled = enabled;
    this.savePreference();
  }

  // Set volume (0-1)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // Set callback for visual notifications
  setOnSoundPlay(callback) {
    this.onSoundPlay = callback;
  }
}

// Singleton instance
const soundManager = new SoundManager();

// Export individual functions for easy use
export const playSound = {
  criticalAlert: () => soundManager.playCriticalAlert(),
  newIncident: () => soundManager.playNewIncident(),
  dispatched: () => soundManager.playDispatched(),
  resolved: () => soundManager.playResolved(),
  success: () => soundManager.playSuccess(),
  complete: () => soundManager.playComplete(),
  error: () => soundManager.playError()
};

export const soundControls = {
  toggle: () => soundManager.toggle(),
  setEnabled: (enabled) => soundManager.setEnabled(enabled),
  setVolume: (vol) => soundManager.setVolume(vol),
  isEnabled: () => soundManager.enabled,
  init: () => soundManager.init(),
  setOnSoundPlay: (callback) => soundManager.setOnSoundPlay(callback)
};

export default soundManager;
