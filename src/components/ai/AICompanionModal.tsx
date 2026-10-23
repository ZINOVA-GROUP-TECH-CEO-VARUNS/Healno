import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Paperclip,
  FileText,
  Upload,
  Copy,
  Square,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import { AIChatMessage, UserProfile, SymptomLog, MedicalDocument } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { HealnoLogo } from '../common/HealnoLogo';

interface AICompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceCall: () => void;
  userProfile: UserProfile;
  remainingSpoons: number;
  onSymptomLogged?: () => void;
}

const FormattedChatMessage: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
  if (!content) return null;

  const paragraphs = content.split(/\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const isBullet = /^[•\*\-]\s+/.test(trimmed);
        const cleanPara = isBullet ? trimmed.replace(/^[•\*\-]\s+/, '') : trimmed;

        const renderInlineFormatted = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|\*\*.*)/g);
          return parts.map((part, i) => {
            if (!part) return null;

            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
              return (
                <strong key={i} className={isUser ? 'font-bold text-white' : 'font-bold text-[#132A1F]'}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('**')) {
              const cleaned = part.slice(2).replace(/\*\*$/, '');
              return (
                <strong key={i} className={isUser ? 'font-bold text-white' : 'font-bold text-[#132A1F]'}>
                  {cleaned}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
              return (
                <code key={i} className="bg-black/10 px-1 py-0.5 rounded text-[0.85em] font-mono">
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
              return (
                <em key={i} className="italic">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          });
        };

        if (isBullet) {
          return (
            <div key={pIdx} className="flex items-start gap-2 pl-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isUser ? 'bg-white' : 'bg-[#FF6A00]'}`} />
              <div className="flex-1 leading-relaxed">{renderInlineFormatted(cleanPara)}</div>
            </div>
          );
        }

        return <p key={pIdx} className="leading-relaxed">{renderInlineFormatted(trimmed)}</p>;
      })}
    </div>
  );
};

export const AICompanionModal: React.FC<AICompanionModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceCall,
  userProfile,
  remainingSpoons,
  onSymptomLogged,
}) => {
  const defaultInitialMessage: AIChatMessage = {
    id: 'init_1',
    role: 'assistant',
    content: `Hello ${userProfile.name ? userProfile.name.split(' ')[0] : 'there'}! I'm your Healno AI Assistant.

I can help answer questions on any topic—from everyday curiosities, science, writing, coding, and problem-solving, to health, energy pacing, symptom tracking, and uploaded medical reports.

What's on your mind right now?`,
    timestamp: 'Just now',
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([defaultInitialMessage]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [showDocSelector, setShowDocSelector] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableDocs = storageService.getDocuments();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, messages, isStreaming]);

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
        provider: 'Diagnostic Records',
        date: new Date().toISOString().split('T')[0],
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileUrl: base64,
        mimeType: file.type || 'application/octet-stream',
        keyFindings: ['Document attached for question answering'],
        plainLanguageSummary: 'Uploaded record ready for questions and review.',
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

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleResetChat = () => {
    handleStopStreaming();
    setMessages([defaultInitialMessage]);
    setErrorState(null);
    setSelectedDoc(null);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isStreaming) return;

    handleStopStreaming();

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

    const assistantPlaceholderId = `asst_${Date.now()}`;
    const assistantMessage: AIChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages([...updatedHistory, assistantMessage]);
    setInputText('');
    setLastPrompt(text.trim());
    setErrorState(null);
    const currentDoc = selectedDoc;
    setSelectedDoc(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

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

        let formattedReply = qaResult.answer || '';
        if (qaResult.extractedFacts && qaResult.extractedFacts.length > 0) {
          formattedReply += `\n\n📌 **Extracted From Document:**\n${qaResult.extractedFacts.map((f: string) => `• ${f}`).join('\n')}`;
        }
        if (qaResult.questionsForDoctor && qaResult.questionsForDoctor.length > 0) {
          formattedReply += `\n\n💬 **Suggested Doctor Questions:**\n${qaResult.questionsForDoctor.map((q: string) => `• ${q}`).join('\n')}`;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId ? { ...msg, content: formattedReply } : msg
          )
        );
      } else {
        const allDocs = storageService.getDocuments();
        const allSymptoms = storageService.getSymptoms();
        const allMeds = storageService.getMedications();
        const allAppts = storageService.getAppointments();
        const allJournals = storageService.getJournalEntries();

        await apiService.streamChatWithCompanion(
          updatedHistory,
          userProfile,
          {
            recentSymptoms: allSymptoms.map((s) => `${s.name} (${s.intensity}/10 intensity, ${s.date})`),
            remainingSpoons,
            documents: allDocs.map((d) => ({
              title: d.title,
              type: d.documentType,
              date: d.date,
              provider: d.provider,
              summary: d.plainLanguageSummary,
              findings: d.keyFindings,
            })),
            medications: allMeds.map((m) => `${m.name} ${m.dosage} (${m.status})`),
            appointments: allAppts.map((a) => `${a.provider} on ${a.date} (${a.purpose})`),
            journalNotes: allJournals.slice(0, 5).map((j) => `[${j.date}] ${j.title}: ${j.content}`),
          },
          (accumulatedText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantPlaceholderId ? { ...msg, content: accumulatedText } : msg
              )
            );
          },
          controller.signal
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped streaming
        return;
      }
      console.warn('AI Assistant response error', err);
      setErrorState('Connection was interrupted while generating response.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content:
                  msg.content ||
                  "I'm listening and I'm right here with you. A momentary connection issue occurred. Click 'Retry' below to resend your message.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
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
        notes: action.details || 'Logged via Healno AI Assistant.',
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
    'How do sleep cycles and REM sleep work?',
    'Help me draft a concise message for my doctor',
    'What are 3 easy high-protein meals with minimal prep?',
    'Explain the science behind post-exertional pacing',
    'Can you write a poem about patience and rest?',
    'What is the difference between ferritin and hemoglobin?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FAF8F5] w-full max-w-2xl h-[94vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#132A1F]/15 animate-in zoom-in-95 duration-200">
        {/* Top Navigation Header */}
        <div className="bg-[#132A1F] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <HealnoLogo size={32} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-display tracking-tight">Healno AI Assistant</h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time AI</span>
                </span>
              </div>
              <p className="text-[11px] text-[#B7E4C7]/80">Answers questions on any topic • Fast streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              title="Start New Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenVoiceCall();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs font-semibold shadow-xs transition-colors"
              title="Start Voice Session"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>

            <button
              onClick={() => {
                handleStopStreaming();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Medical disclaimer note banner */}
        <div className="bg-[#FFF4EB] px-4 py-1.5 text-[11px] text-[#B84E00] font-medium flex items-center gap-2 border-b border-[#FFE0C8]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#FF6A00]" />
          <span>
            Healno AI provides educational information and conversational assistance. Always consult a licensed clinician for medical decisions.
          </span>
        </div>

        {/* Saved symptom notification */}
        {savedSuccessMsg && (
          <div className="bg-[#D8F3DC] text-[#1B4332] text-xs px-4 py-2 font-medium flex items-center gap-2 border-b border-[#74C69D]/30 animate-in fade-in">
            <Check className="w-4 h-4 text-[#2D6A4F]" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {/* Conversation Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                {/* Document attachment label if attached */}
                {msg.attachedDocument && (
                  <div className="mb-1 text-[11px] bg-[#E8EFE9] text-[#132A1F] border border-[#B7E4C7] rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>
                      Attached: <strong>{msg.attachedDocument.name}</strong> ({msg.attachedDocument.type})
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00] shrink-0 mt-0.5 border border-[#FF6A00]/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isUser
                        ? 'bg-[#132A1F] text-white rounded-tr-xs'
                        : 'bg-white text-[#132A1F] border border-[#132A1F]/10 rounded-tl-xs'
                    }`}
                  >
                    <div>
                      {msg.content ? (
                        <FormattedChatMessage content={msg.content} isUser={isUser} />
                      ) : isStreaming ? (
                        <span className="flex items-center gap-1 text-[#132A1F]/50">
                          <span>Thinking</span>
                          <span className="animate-pulse">...</span>
                        </span>
                      ) : null}
                      {/* Active streaming blinking cursor */}
                      {isStreaming && !isUser && msg.id === messages[messages.length - 1]?.id && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#FF6A00] animate-pulse align-middle" />
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-[#132A1F] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Footer tools: timestamp, copy response, suggested actions */}
                <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-[#132A1F]/40 ${isUser ? 'mr-9' : 'ml-9'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.content && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="hover:text-[#132A1F] flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Suggested Action Card */}
                {msg.suggestedAction && (
                  <div className="mt-2 ml-9 max-w-[85%] bg-[#FFFDF9] border border-[#FF6A00]/40 rounded-xl p-3 shadow-xs text-xs">
                    <div className="flex items-center gap-1.5 text-[#FF6A00] font-semibold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggested Health Record</span>
                    </div>
                    <div className="font-medium text-[#132A1F]">{msg.suggestedAction.title}</div>
                    <div className="text-[#132A1F]/70 text-[11px] mb-2">{msg.suggestedAction.details}</div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#132A1F]/10">
                      <button
                        onClick={() => handleConfirmAction(msg.suggestedAction)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#FF6A00] text-white rounded-lg hover:bg-[#E05E00] transition-colors font-medium text-[11px]"
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

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Document Attachment Preview Chip */}
        {selectedDoc && (
          <div className="mx-4 mb-2 p-2.5 bg-[#FFF4EB] border border-[#FFE0C8] rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6A00]" />
              <div>
                <span className="font-bold text-[#132A1F]">{selectedDoc.title}</span>
                <span className="text-[10px] text-[#132A1F]/60 ml-1.5">({selectedDoc.documentType})</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="w-5 h-5 rounded-full bg-white text-[#132A1F]/70 hover:text-red-500 flex items-center justify-center text-xs shadow-2xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Document Selector Tray */}
        {showDocSelector && (
          <div className="mx-4 mb-2 p-3 bg-white border border-[#132A1F]/10 rounded-2xl shadow-lg space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-[#132A1F]">
              <span>Attach Medical Document or Test Report</span>
              <button onClick={() => setShowDocSelector(false)} className="text-[#132A1F]/50 hover:text-[#132A1F]">✕</button>
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
                    <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span className="font-semibold text-[#132A1F]">{doc.title}</span>
                  </div>
                  <span className="text-[10px] text-[#132A1F]/50">{doc.date}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 rounded-xl border border-dashed border-[#FF6A00] text-[#FF6A00] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#FFF4EB] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
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

        {/* Retry Banner if Error Occurred */}
        {errorState && (
          <div className="mx-4 mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorState}</span>
            </div>
            {lastPrompt && (
              <button
                type="button"
                onClick={() => handleSendMessage(lastPrompt)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3 h-3 text-red-600" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Conversation Starter Chips */}
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

        {/* Input Bar & Controls */}
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
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors shrink-0 ${
                selectedDoc
                  ? 'bg-[#FFF4EB] border-[#FF6A00] text-[#FF6A00]'
                  : 'bg-[#F8F6F0] border-[#132A1F]/15 text-[#132A1F]/60 hover:text-[#FF6A00]'
              }`}
              title="Attach medical report or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="flex-1 relative flex items-center">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  selectedDoc
                    ? `Ask anything about "${selectedDoc.title}"...`
                    : 'Ask anything (science, coding, health, writing, daily tasks)...'
                }
                className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] resize-none max-h-24"
              />
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="w-10 h-10 rounded-2xl bg-[#6B4435] hover:bg-[#523327] text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
                title="Stop response generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-2xl bg-[#FF6A00] hover:bg-[#E05E00] disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
