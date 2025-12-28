// Sound effects for the emergency platform
// Uses Web Audio API for better performance

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    this.sounds = {};
    this.initialized = false;
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

  // Critical alert sound - urgent beeping
  playCriticalAlert() {
    if (!this.enabled) return;
    this.init();

    // Play 3 rapid high-pitched beeps
    this.playBeep(1000, 0.1);
    setTimeout(() => this.playBeep(1000, 0.1), 150);
    setTimeout(() => this.playBeep(1200, 0.15), 300);
  }

  // New incident sound
  playNewIncident() {
    if (!this.enabled) return;
    this.init();

    // Two-tone notification
    this.playBeep(600, 0.1);
    setTimeout(() => this.playBeep(800, 0.15), 120);
  }

  // Success chime
  playSuccess() {
    if (!this.enabled) return;
    this.init();

    // Ascending tones
    this.playBeep(400, 0.1);
    setTimeout(() => this.playBeep(600, 0.1), 100);
    setTimeout(() => this.playBeep(800, 0.15), 200);
  }

  // Completion tone
  playComplete() {
    if (!this.enabled) return;
    this.init();

    // Soft completion sound
    this.playBeep(500, 0.2, 'triangle');
    setTimeout(() => this.playBeep(700, 0.3, 'triangle'), 150);
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
    return this.enabled;
  }

  // Set enabled state
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Set volume (0-1)
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

// Singleton instance
const soundManager = new SoundManager();

// Export individual functions for easy use
export const playSound = {
  criticalAlert: () => soundManager.playCriticalAlert(),
  newIncident: () => soundManager.playNewIncident(),
  success: () => soundManager.playSuccess(),
  complete: () => soundManager.playComplete(),
  error: () => soundManager.playError()
};

export const soundControls = {
  toggle: () => soundManager.toggle(),
  setEnabled: (enabled) => soundManager.setEnabled(enabled),
  setVolume: (vol) => soundManager.setVolume(vol),
  isEnabled: () => soundManager.enabled,
  init: () => soundManager.init()
};

export default soundManager;
