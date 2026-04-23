import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import voiceCommands from "../utils/voiceCommand";

const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [listening, setListening] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const recognitionRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);
  const continuousListeningRef = useRef(false);

  const speak = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1.2;
    speech.volume = 1;
    speech.pitch = 1;
    
    window.speechSynthesis.speak(speech);
  };

  const handleCommand = useCallback((transcript) => {
    console.log("Processing command:", transcript);
    
    // Check for mic off command first
    if (transcript.includes("mic off") || transcript.includes("stop") || transcript.includes("band karo") || transcript.includes("close")) {
      speak("Mic off");
      continuousListeningRef.current = false;
      setListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Already stopped");
        }
      }
      return;
    }

    let matched = false;

    for (const command of voiceCommands) {
      const found = command.keywords.some((word) =>
        transcript.includes(word)
      );

      if (found) {
        matched = true;
        console.log("Command matched:", command);

        if (command.route) {
          navigate(command.route);
          const pageName = command.route.replace("/", "").replace("-", " ");
          speak(`Opening ${pageName}`);
        }

        if (command.action === "back") {
          navigate(-1);
          speak("Going back");
        }

        if (command.action === "logout") {
          logout();
          speak("Logging out");
          continuousListeningRef.current = false;
          return;
        }

        break;
      }
    }

    if (!matched) {
      speak("Sorry, command not understood");
      console.log("No command matched for:", transcript);
    }

    // Continue listening if continuous mode is active
    if (continuousListeningRef.current) {
      setTimeout(() => {
        startListening();
      }, 1200);
    }
  }, [navigate, logout]);

  // Wake word detection (continuous listening for "Hey Stock")
  const startWakeWordDetection = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return;
    }

    const wakeRecognition = new SpeechRecognition();
    wakeRecognition.lang = "en-IN";
    wakeRecognition.continuous = true;
    wakeRecognition.interimResults = false;

    wakeWordRecognitionRef.current = wakeRecognition;

    try {
      wakeRecognition.start();
      setWakeWordActive(true);
      console.log("Wake word detection started");
    } catch (error) {
      console.error("Failed to start wake word detection:", error);
    }

    wakeRecognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

      console.log("Wake word detection heard:", transcript);

      // Check for wake words - more flexible matching
      const hasWakeWord = 
        transcript.includes("hey") ||
        transcript.includes("stock") ||
        transcript.includes("ok") ||
        transcript.includes("hello");

      if (hasWakeWord) {
        console.log("Wake word detected! Starting command listening...");
        speak("Yes Boss");
        
        // Enable continuous listening mode
        continuousListeningRef.current = true;
        
        // Start listening for commands immediately
        setTimeout(() => {
          startListening();
        }, 800);
      }
    };

    wakeRecognition.onerror = (event) => {
      console.error("Wake word detection error:", event.error);
      if (event.error !== 'not-allowed' && event.error !== 'aborted') {
        setTimeout(() => {
          if (wakeWordActive && wakeWordRecognitionRef.current) {
            try {
              wakeWordRecognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart wake word detection:", e);
            }
          }
        }, 1000);
      }
    };

    wakeRecognition.onend = () => {
      console.log("Wake word detection ended, restarting...");
      if (wakeWordActive) {
        setTimeout(() => {
          if (wakeWordRecognitionRef.current && wakeWordActive) {
            try {
              wakeWordRecognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart wake word detection:", e);
            }
          }
        }, 500);
      }
    };
  }, [wakeWordActive]);

  const stopWakeWordDetection = () => {
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.stop();
      wakeWordRecognitionRef.current = null;
    }
    setWakeWordActive(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak("Voice recognition not supported");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("No active recognition to stop");
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      console.log("Command listening started");
    } catch (error) {
      console.error("Failed to start listening:", error);
      setListening(false);
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
        .toLowerCase()
        .trim();

      console.log("Command heard:", transcript);
      handleCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      
      if (event.error === 'no-speech') {
        console.log("No speech detected, continuing to listen...");
        if (continuousListeningRef.current) {
          setTimeout(() => {
            startListening();
          }, 1000);
        }
      } else if (event.error === 'not-allowed') {
        speak("Microphone access denied");
        continuousListeningRef.current = false;
      } else if (event.error !== 'aborted') {
        if (continuousListeningRef.current) {
          setTimeout(() => {
            startListening();
          }, 1000);
        }
      }
    };

    recognition.onend = () => {
      console.log("Command listening ended");
      setListening(false);
    };
  };

  const stopListening = () => {
    continuousListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Recognition already stopped");
      }
    }
    setListening(false);
  };

  const toggleWakeWord = () => {
    if (wakeWordActive) {
      stopWakeWordDetection();
      stopListening();
      speak("Voice assistant deactivated");
    } else {
      startWakeWordDetection();
      speak("Voice assistant activated. Say Hey Stock");
    }
  };

  // Auto-start wake word detection on mount
  useEffect(() => {
    // Start wake word detection automatically when component mounts
    const timer = setTimeout(() => {
      startWakeWordDetection();
    }, 1000); // 1 second delay to ensure everything is loaded

    return () => {
      clearTimeout(timer);
      stopListening();
      stopWakeWordDetection();
    };
  }, []);

  return {
    listening,
    wakeWordActive,
    toggleWakeWord,
  };
};

export default useVoiceNavigation;