import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Sparkles, Heart } from 'lucide-react';
import { apiService } from '../../services/api';
import { UserProfile } from '../../types';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  remainingSpoons: number;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  remainingSpoons,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'listening' | 'thinking' | 'speaking'>('connecting');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [companionReply, setCompanionReply] = useState('');
  const speechRecognizerRef = useRef<any>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (cancelSpeechRef.current) cancelSpeechRef.current();
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch {}
      }
      return;
    }

    // Call connected greeting
    setCallStatus('connecting');
    const timer = setTimeout(() => {
      const greeting = `Hello ${userProfile.name.split(' ')[0]}. I'm right here with you. How are your body and energy feeling right now? Take all the time you need.`;
      setCompanionReply(greeting);
      setCallStatus('speaking');
      if (isSpeakerOn) {
        cancelSpeechRef.current = apiService.speakText(greeting, () => {
          setCallStatus('listening');
          startListening();
        });
      } else {
        setCallStatus('listening');
        startListening();
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (cancelSpeechRef.current) cancelSpeechRef.current();
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (isMuted) return;
    if (!apiService.isSpeechRecognitionAvailable()) {
      setLiveTranscript('Voice input is ready. You can speak or tap below.');
      return;
    }

    try {
      speechRecognizerRef.current = apiService.createSpeechRecognizer(
        (transcript: string) => {
          setLiveTranscript(transcript);
          handleUserVoiceInput(transcript);
        },
        () => {
          if (callStatus === 'listening') {
            // Keep listening if still in listening state
          }
        }
      );
      speechRecognizerRef.current.start();
    } catch (e) {
      console.warn('Could not start recognition', e);
    }
  };

  const handleUserVoiceInput = async (text: string) => {
    setCallStatus('thinking');
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch {}
    }

    try {
      const result = await apiService.chatWithCompanion(
        [{ id: 'voice_msg', role: 'user', content: text, timestamp: new Date().toLocaleTimeString() }],
        userProfile,
        { recentSymptoms: userProfile.commonSymptoms, remainingSpoons }
      );

      const replyText = result.reply || `Thank you for sharing that. Let's make sure you take time to rest.`;
      setCompanionReply(replyText);
      setCallStatus('speaking');

      if (isSpeakerOn) {
        cancelSpeechRef.current = apiService.speakText(replyText, () => {
          setCallStatus('listening');
          startListening();
        });
      } else {
        setCallStatus('listening');
        startListening();
      }
    } catch (err) {
      setCompanionReply("I'm right here beside you. Resting is always productive.");
      setCallStatus('listening');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setLiveTranscript(prompt);
    handleUserVoiceInput(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#132A1F]/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B7E4C7] flex items-center justify-center text-[#132A1F] font-bold">
            H
          </div>
          <div>
            <h2 className="text-base font-bold font-display">Healno Companion Call</h2>
            <p className="text-xs text-[#B7E4C7]/80">Gentle Voice Session</p>
          </div>
        </div>

        <div className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#B7E4C7] font-medium">
          {callStatus === 'connecting' && 'Connecting...'}
          {callStatus === 'listening' && 'Listening to you...'}
          {callStatus === 'thinking' && 'Reflecting gently...'}
          {callStatus === 'speaking' && 'Healno is speaking...'}
        </div>
      </div>

      {/* Center Voice Visualizer */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Pulsing Orb */}
        <div className="relative flex items-center justify-center my-8">
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-tr from-[#2D6A4F] to-[#74C69D] opacity-40 blur-xl absolute transition-transform duration-700 ${
              callStatus === 'speaking' ? 'scale-125 animate-pulse' : callStatus === 'listening' ? 'scale-110' : 'scale-90'
            }`}
          />
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-b from-[#52B788] to-[#1B4332] shadow-2xl flex items-center justify-center relative z-10 transition-transform duration-300 ${
              callStatus === 'speaking' ? 'scale-105' : 'scale-100'
            }`}
          >
            <Sparkles className="w-12 h-12 text-[#D8F3DC] animate-pulse" />
          </div>

          {/* Sound Wave Rings */}
          {callStatus === 'speaking' && (
            <div className="absolute inset-0 rounded-full border-2 border-[#B7E4C7]/40 animate-ping" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-white/90 font-display mb-2">
          {callStatus === 'listening' ? "Speak freely whenever you're ready" : "Healno Voice Companion"}
        </h3>

        {/* Live Conversation Display */}
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-4 my-2 text-left shadow-inner min-h-[90px] flex flex-col justify-center">
          {callStatus === 'speaking' || companionReply ? (
            <p className="text-sm text-[#D8F3DC] leading-relaxed italic">
              "{companionReply}"
            </p>
          ) : (
            <p className="text-xs text-white/50 text-center">
              "Tell me how your fatigue or spoons feel today..."
            </p>
          )}

          {liveTranscript && (
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/70">
              <span className="text-[#E9B44C] font-semibold">You: </span>
              {liveTranscript}
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Shortcuts */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-sm">
          <button
            onClick={() => handleQuickPrompt("I am having a fatigue flare-up and low spoons today.")}
            className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-white/80 transition-colors"
          >
            "I'm feeling a fatigue flare today"
          </button>
          <button
            onClick={() => handleQuickPrompt("What is a gentle pacing reminder for this afternoon?")}
            className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-white/80 transition-colors"
          >
            "Give me a gentle pacing tip"
          </button>
          <button
            onClick={() => handleQuickPrompt("Help me take three slow relaxing breaths.")}
            className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-white/80 transition-colors"
          >
            "Guide me through a calm breath"
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-6 max-w-sm mx-auto w-full pt-4 border-t border-white/10">
        {/* Mute Mic */}
        <button
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (nextMuted && speechRecognizerRef.current) {
              speechRecognizerRef.current.stop();
            } else {
              startListening();
            }
          }}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/15 text-white hover:bg-white/20'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 transition-transform"
          title="End Voice Session"
          aria-label="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={() => {
            setIsSpeakerOn(!isSpeakerOn);
            if (isSpeakerOn && cancelSpeechRef.current) {
              cancelSpeechRef.current();
            }
          }}
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
            !isSpeakerOn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/15 text-white hover:bg-white/20'
          }`}
          title={isSpeakerOn ? 'Mute Audio Output' : 'Enable Audio Output'}
          aria-label="Speaker"
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
