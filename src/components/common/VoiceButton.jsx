import { Mic, MicOff, Radio } from "lucide-react";
import useVoiceNavigation from "../../hooks/usevoicenavigation";

// ✅ Check if voice commands are enabled in settings
const isVoiceEnabled = () => {
  return localStorage.getItem('voiceCommandEnabled') !== 'false';
};

const VoiceButton = () => {
  // ✅ If voice is permanently disabled in settings, don't render anything
  if (!isVoiceEnabled()) {
    return null;
  }

  return <VoiceButtonInner />;
};

// Inner component that uses the hook (only rendered when voice is enabled)
const VoiceButtonInner = () => {
  const { listening, wakeWordActive, toggleWakeWord } = useVoiceNavigation();

  return (
    <button
      onClick={toggleWakeWord}
      title={
        listening 
          ? "Listening to your command..." 
          : wakeWordActive 
          ? "Voice assistant active - Say your command directly" 
          : "Click to activate voice assistant"
      }
      className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110
      ${
        listening
          ? "bg-red-500 text-white scale-110 animate-pulse"
          : wakeWordActive
          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
          : "bg-emerald-600 hover:bg-emerald-700 text-white"
      }`}
    >
      {listening ? (
        <MicOff size={28} className="animate-pulse" />
      ) : wakeWordActive ? (
        <Radio size={28} />
      ) : (
        <Mic size={28} />
      )}
      
      {/* Active indicator */}
      {(listening || wakeWordActive) && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${listening ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-4 w-4 ${listening ? 'bg-red-500' : 'bg-green-500'}`}></span>
        </span>
      )}
    </button>
  );
};

export default VoiceButton;
