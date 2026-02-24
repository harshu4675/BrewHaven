import { useRef, useCallback, useEffect } from "react";

const useSound = (soundUrl, options = {}) => {
  const { volume = 1.0, playOnMount = false } = options;
  const audioRef = useRef(null);
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(soundUrl);
    audioRef.current.volume = volume;
    audioRef.current.preload = "auto";

    // Track user interaction
    const handleInteraction = () => {
      hasUserInteracted.current = true;
      // Load the audio after interaction
      if (audioRef.current) {
        audioRef.current.load();
      }
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl, volume]);

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // Reset to start
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;

      // Play
      await audioRef.current.play();
      console.log("Sound played successfully");
    } catch (error) {
      console.warn("Could not play sound:", error.message);

      // If autoplay blocked, wait for user interaction
      if (error.name === "NotAllowedError") {
        const playOnInteraction = async () => {
          try {
            await audioRef.current?.play();
            document.removeEventListener("click", playOnInteraction);
          } catch (e) {
            console.warn("Still could not play:", e);
          }
        };
        document.addEventListener("click", playOnInteraction, { once: true });
      }
    }
  }, [volume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
};

export default useSound;
