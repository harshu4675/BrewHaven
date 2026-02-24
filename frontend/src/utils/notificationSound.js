// Notification sound utility
class NotificationSoundManager {
  constructor() {
    this.audio = null;
    this.isEnabled = true;
    this.volume = 1.0; // Increased default volume
    this.hasUserInteracted = false;
    this.init();
  }

  init() {
    // Create audio element
    this.audio = new Audio();
    this.audio.src = "/sounds/nit.wav";

    // Preload the audio
    this.audio.preload = "auto";
    this.audio.volume = this.volume;

    // Load settings from localStorage
    this.loadSettings();

    // Track user interaction for autoplay policy
    this.setupUserInteractionTracking();

    // Fallback: If local file fails, use base64 encoded beep sound
    this.audio.onerror = () => {
      console.log("Local sound file not found, using fallback sound");
      this.useFallbackSound();
    };
  }

  setupUserInteractionTracking() {
    const handleInteraction = () => {
      this.hasUserInteracted = true;
      // Preload audio after user interaction
      if (this.audio) {
        this.audio.load();
      }
      // Remove listeners after first interaction
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
  }

  useFallbackSound() {
    // Base64 encoded short notification beep sound
    // This is a simple beep that works without external files
    const fallbackBase64 =
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR8NVrPO0MF3JwYkicPh1qB1Fx1Eli++9t6hewYJOYy28NqsewQRQZnF4tSjfBcSPpTA3tqnfQ8VN5fH3M2bax8gMYvB0sCOVy0uNYDB0cGPWS4xNoG/zsGRWy4yNYC+zsGSXC8xNYC+zsCSXC8xNYC+zr+RWy4xNn++zb+QWy4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zb+QWi4xNn++zQ==";

    this.audio = new Audio(fallbackBase64);
    this.audio.volume = this.volume;
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem("notificationSoundEnabled");
      if (saved !== null) {
        this.isEnabled = JSON.parse(saved);
      }

      const savedVolume = localStorage.getItem("notificationVolume");
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
        if (this.audio) {
          this.audio.volume = this.volume;
        }
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(
        "notificationSoundEnabled",
        JSON.stringify(this.isEnabled),
      );
      localStorage.setItem("notificationVolume", this.volume.toString());
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  }

  async play() {
    if (!this.isEnabled || !this.audio) {
      console.log("Notification sound disabled or audio not available");
      return;
    }

    try {
      // Reset audio to start
      this.audio.currentTime = 0;
      this.audio.volume = this.volume;

      // Play the sound
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        await playPromise;
        console.log("Notification sound played successfully");
      }
    } catch (error) {
      console.warn("Audio play failed:", error.message);

      // If autoplay was blocked, try alternative approaches
      if (error.name === "NotAllowedError") {
        console.log(
          "Autoplay blocked - sound will play after user interaction",
        );

        // Queue sound to play on next user interaction
        const playOnInteraction = async () => {
          try {
            if (this.audio) {
              this.audio.currentTime = 0;
              await this.audio.play();
            }
          } catch (e) {
            console.warn("Still could not play sound");
          }
          document.removeEventListener("click", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction, { once: true });
      }
    }
  }

  // Play with vibration for mobile devices
  playWithVibration() {
    this.play();

    // Also vibrate on mobile if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]); // Vibrate pattern
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.saveSettings();
    console.log(`Notification sound ${enabled ? "enabled" : "disabled"}`);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.saveSettings();
    console.log(`Notification volume set to ${this.volume}`);
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSettings();
    console.log(`Notification sound toggled: ${this.isEnabled}`);
    return this.isEnabled;
  }

  // Test sound - useful for settings page
  testSound() {
    const wasEnabled = this.isEnabled;
    this.isEnabled = true;
    this.play();
    this.isEnabled = wasEnabled;
  }

  // Get current status
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      volume: this.volume,
      hasUserInteracted: this.hasUserInteracted,
    };
  }
}

// Create singleton instance
const notificationSound = new NotificationSoundManager();

export default notificationSound;
