export const speakText = (text, onStart, onEnd) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return null;
    }
  
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
  
    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (error) => console.error('Speech error:', error);
  
    window.speechSynthesis.speak(utterance);
    return utterance;
  };
  
  export const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
  
  export const isSpeaking = () => {
    return window.speechSynthesis?.speaking || false;
  };