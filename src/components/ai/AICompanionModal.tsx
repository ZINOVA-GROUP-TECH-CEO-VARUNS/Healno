import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Sparkles,
  Check,
  Edit2,
  AlertCircle,
  RefreshCw,
  Paperclip,
  FileText,
  Upload,
  Info,
} from 'lucide-react';
import { AIChatMessage, UserProfile, SymptomLog, MedicalDocument } from '../../types';
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
      content: `Hello ${userProfile.name ? userProfile.name.split(' ')[0] : 'Friend'}. I'm your Healno Health Companion & Test Companion.

I am connected to your authorized records (symptoms, medications, and uploaded test reports). You can ask questions about your health, upload a medical report for explanation, or get support with pacing your spoons. How can I assist you right now?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableDocs = storageService.getDocuments();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newDoc: MedicalDocument = {
        id: `doc_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        documentType: file.name.toLowerCase().includes('prescription') ? 'Prescription' : 'Lab Report',
        provider: 'Healthcare Laboratory',
        date: new Date().toISOString().split('T')[0],
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileUrl: base64,
        mimeType: file.type || 'application/octet-stream',
        keyFindings: ['File attached for AI test companion discussion'],
        plainLanguageSummary: 'Uploaded test report ready for question answering.',
        suggestedDoctorQuestions: ['What do these results mean for my daily symptoms?'],
        unverified: true,
        createdAt: new Date().toISOString(),
      };

      storageService.saveDocument(newDoc);
      setSelectedDoc(newDoc);
      setShowDocSelector(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const attached = selectedDoc
      ? {
          name: selectedDoc.title || selectedDoc.fileName,
          type: selectedDoc.documentType,
          summary: selectedDoc.plainLanguageSummary,
        }
      : undefined;

    const userMessage: AIChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedDocument: attached,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    const currentDoc = selectedDoc;
    setSelectedDoc(null);
    setIsLoading(true);

    try {
      if (currentDoc) {
        // Document Q&A route
        const qaResult = await apiService.askDocumentQA(
          text.trim(),
          {
            title: currentDoc.title,
            documentType: currentDoc.documentType,
            keyFindings: currentDoc.keyFindings,
            plainLanguageSummary: currentDoc.plainLanguageSummary,
          },
          {
            userName: userProfile.name,
            conditions: userProfile.conditions,
            medications: storageService.getMedications().map((m) => `${m.name} (${m.dosage})`),
            recentSymptoms: storageService.getSymptoms().slice(0, 3).map((s) => `${s.name} (${s.intensity}/10)`),
          }
        );

        let formattedReply = qaResult.answer;
        if (qaResult.extractedFacts && qaResult.extractedFacts.length > 0) {
          formattedReply += `\n\n📌 **Extracted From Document:**\n${qaResult.extractedFacts.map((f: string) => `• ${f}`).join('\n')}`;
        }
        if (qaResult.questionsForDoctor && qaResult.questionsForDoctor.length > 0) {
          formattedReply += `\n\n💬 **Suggested Doctor Questions:**\n${qaResult.questionsForDoctor.map((q: string) => `• ${q}`).join('\n')}`;
        }

        const assistantMessage: AIChatMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: formattedReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Standard companion chat
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
      }
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
    "What do my ferritin and vitamin D numbers indicate?",
    "I'm feeling a sudden fatigue crash right now",
    "Help me prepare 3 questions for my doctor",
    "What is a gentle 1-spoon meal I can make?",
    "Explain difference between acute symptom and chronic condition",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FAF8F5] w-full max-w-lg h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#132A1F]/10 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#132A1F] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF7A24] flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display">AI Test & Health Companion</h2>
                <span className="text-[10px] bg-[#B7E4C7]/20 text-[#B7E4C7] px-2 py-0.5 rounded-full font-medium">
                  Authorized Records
                </span>
              </div>
              <p className="text-xs text-[#B7E4C7]/75">Report explanations & record-grounded guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenVoiceCall();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-semibold shadow-xs transition-colors"
              title="Start Voice Session"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>

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
        <div className="bg-[#FFF4EB] px-4 py-2 text-[11px] text-[#FF7A24] font-medium flex items-start gap-2 border-b border-[#FFE0C8]">
          <AlertCircle className="w-3.5 h-3.5 text-[#FF7A24] shrink-0 mt-0.5" />
          <span>
            Extracted document values and AI interpretations are provided for patient education and do not replace licensed medical consultations.
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
                {msg.attachedDocument && (
                  <div className="mb-1 text-[11px] bg-[#E8EFE9] text-[#132A1F] border border-[#B7E4C7] rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Attached: <strong>{msg.attachedDocument.name}</strong> ({msg.attachedDocument.type})</span>
                  </div>
                )}

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

                {/* Suggested Action Card */}
                {msg.suggestedAction && (
                  <div className="mt-2 max-w-[85%] bg-[#FFFDF9] border border-[#FF7A24]/40 rounded-xl p-3 shadow-sm text-xs">
                    <div className="flex items-center gap-1.5 text-[#FF7A24] font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggested Health Record</span>
                    </div>
                    <div className="font-medium text-[#132A1F]">{msg.suggestedAction.title}</div>
                    <div className="text-[#132A1F]/70 text-[11px] mb-2">{msg.suggestedAction.details}</div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#132A1F]/10">
                      <button
                        onClick={() => handleConfirmAction(msg.suggestedAction)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#FF7A24] text-white rounded-lg hover:bg-[#E06516] transition-colors font-medium text-[11px]"
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
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF7A24]" />
              <span>Analyzing records & formulating gentle guidance...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Document Attachment Chip */}
        {selectedDoc && (
          <div className="mx-4 mb-2 p-2 bg-[#FFF4EB] border border-[#FFE0C8] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF7A24]" />
              <div>
                <span className="font-bold text-[#132A1F]">{selectedDoc.title}</span>
                <span className="text-[10px] text-[#132A1F]/60 ml-1.5">({selectedDoc.documentType})</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-5 h-5 rounded-full bg-white text-[#132A1F]/70 hover:text-red-500 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Document Selector Dropdown / Tray */}
        {showDocSelector && (
          <div className="mx-4 mb-2 p-3 bg-white border border-[#132A1F]/10 rounded-2xl shadow-lg space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-[#132A1F]">
              <span>Attach Medical Document for Q&A</span>
              <button onClick={() => setShowDocSelector(false)} className="text-[#132A1F]/50">✕</button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1">
              {availableDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setShowDocSelector(false);
                  }}
                  className="p-2 rounded-xl hover:bg-[#F8F6F0] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#FF7A24]" />
                    <span className="font-semibold text-[#132A1F]">{doc.title}</span>
                  </div>
                  <span className="text-[10px] text-[#132A1F]/50">{doc.date}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 rounded-xl border border-dashed border-[#FF7A24] text-[#FF7A24] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#FFF4EB]"
            >
              <Upload className="w-3 h-3" />
              <span>Upload New File From Device</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf,text/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

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
            <button
              type="button"
              onClick={() => setShowDocSelector(!showDocSelector)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                selectedDoc
                  ? 'bg-[#FFF4EB] border-[#FF7A24] text-[#FF7A24]'
                  : 'bg-[#F8F6F0] border-[#132A1F]/15 text-[#132A1F]/60 hover:text-[#FF7A24]'
              }`}
              title="Attach medical report or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedDoc ? `Ask about "${selectedDoc.title}"...` : "Ask about symptoms, reports, or medications..."}
              className="flex-1 bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#FF7A24] hover:bg-[#E06516] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs"
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
