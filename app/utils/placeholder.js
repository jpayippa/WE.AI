import { useState, useEffect } from 'react';

export const placeholders = [
  "Tell me more about the Software Engineering Program.",
  "How can I book a meeting room?",
  "What can I expect as a First Year?",
  "What average is required for first year?",
  "What are the admission requirements for Civil Engineering?",
  "How do I know who my guidance counseller is?",
];

export const useAnimatedPlaceholder = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = placeholders[currentIndex];
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(50);
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(50);
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 1200);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        setTypingSpeed(50);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentIndex, typingSpeed]);

  return currentText + '|'; // Add blinking cursor character
};