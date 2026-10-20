import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Sparkles, Check, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import { AIChatMessage, UserProfile, SymptomLog } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';

interface AICompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceCall: () => void;
  userProfile: UserProfile;
  remainingSpoons: number;
  onSymptomLogged?: () => void;
}

export const AICompanionModal: React.FC<AICompanionModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceCall,
  userProfile,
  remainingSpoons,
  onSymptomLogged,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello ${userProfile.name.split(' ')[0]}. I'm Healno, your calm health companion. Whether you're navigating a symptom flare, feeling brain fog, pacing your spoons, or just need a supportive space—let's take today one step at a time. How are you feeling right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await apiService.chatWithCompanion(
        [...messages, userMessage],
        userProfile,
        {
          recentSymptoms: userProfile.commonSymptoms,
          remainingSpoons,
        }
      );

      const assistantMessage: AIChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: result.suggestedAction || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: "I'm listening and I'm here with you. Let's take a slow breath. Rest is always productive.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (action: any) => {
    if (action.type === 'log_symptom') {
      const newSymptom: SymptomLog = {
        id: `sym_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        category: 'fatigue',
        name: action.title || 'Symptom Mentioned',
        intensity: action.severity || 5,
        notes: action.details || 'Logged via Healno AI Companion discussion.',
        tags: ['AI-Assisted', 'Check-in'],
        triggers: ['Daily activity'],
      };
      storageService.addSymptom(newSymptom);
      setSavedSuccessMsg(`Saved "${newSymptom.name}" to your Symptoms log.`);
      if (onSymptomLogged) onSymptomLogged();
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  const quickStarters = [
    "I'm feeling a sudden fatigue crash right now",
    "Help me prepare 3 questions for my doctor",
    "Explain my ferritin and vitamin D results in plain terms",
    "What is a simple 1-spoon meal I can make?",
    "I overdid my energy yesterday and feel guilty",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FAF8F5] w-full max-w-lg h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#132A1F]/10">
        {/* Top Header */}
        <div className="bg-[#132A1F] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#B7E4C7] shadow-inner">
              <Sparkles className="w-5 h-5 text-[#B7E4C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display">Healno AI Companion</h2>
                <span className="text-[10px] bg-[#B7E4C7]/20 text-[#B7E4C7] px-2 py-0.5 rounded-full font-medium">
                  Supportive
                </span>
              </div>
              <p className="text-xs text-[#B7E4C7]/75">Here to listen, organize, and pace with you</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Call Trigger Button */}
            <button
              onClick={() => {
                onClose();
                onOpenVoiceCall();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-semibold shadow-xs transition-colors"
              title="Start Voice Session"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Medical disclaimer banner */}
        <div className="bg-[#E8EFE9] px-4 py-2 text-[11px] text-[#132A1F]/80 flex items-start gap-2 border-b border-[#132A1F]/5">
          <AlertCircle className="w-3.5 h-3.5 text-[#132A1F] shrink-0 mt-0.5" />
          <span>
            Healno is an educational and pacing companion. It does not provide medical diagnoses or replace licensed clinical advice.
          </span>
        </div>

        {/* Success toast if action saved */}
        {savedSuccessMsg && (
          <div className="bg-[#D8F3DC] text-[#1B4332] text-xs px-4 py-2 font-medium flex items-center gap-2 border-b border-[#74C69D]/30 animate-in fade-in">
            <Check className="w-4 h-4 text-[#2D6A4F]" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#132A1F] text-white rounded-br-xs'
                      : 'bg-white text-[#132A1F] border border-[#132A1F]/10 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <span className="text-[10px] text-[#132A1F]/40 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Suggested Action Card (editable preview before saving) */}
                {msg.suggestedAction && (
                  <div className="mt-2 max-w-[85%] bg-[#FFFDF9] border border-[#E89D35]/40 rounded-xl p-3 shadow-sm text-xs">
                    <div className="flex items-center gap-1.5 text-[#B26A00] font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggested Health Record</span>
                    </div>
                    <div className="font-medium text-[#132A1F]">{msg.suggestedAction.title}</div>
                    <div className="text-[#132A1F]/70 text-[11px] mb-2">{msg.suggestedAction.details}</div>
                    
                    <div className="flex items-center gap-2 pt-1 border-t border-[#132A1F]/10">
                      <button
                        onClick={() => handleConfirmAction(msg.suggestedAction)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#132A1F] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors font-medium text-[11px]"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save to Log</span>
                      </button>
                      <span className="text-[10px] text-[#132A1F]/50">Editable confirmation</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#132A1F]/60 bg-white/70 rounded-full px-3 py-1.5 w-fit border border-[#132A1F]/10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D6A4F]" />
              <span>Healno is thinking gently...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Conversation Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[#132A1F]/5 overflow-x-auto no-scrollbar flex items-center gap-2">
            {quickStarters.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(starter)}
                className="whitespace-nowrap shrink-0 text-xs bg-white hover:bg-[#E8EFE9] border border-[#132A1F]/10 text-[#132A1F]/80 px-3 py-1.5 rounded-full transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 bg-white border-t border-[#132A1F]/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tell Healno how your body is feeling..."
              className="flex-1 bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#132A1F]/30"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
