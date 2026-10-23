import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  Achievement,
  JournalEntry,
  SymptomLog,
  EmotionScore,
  Medication,
  Appointment,
  MedicalDocument,
} from '../../types';
import {
  User,
  Shield,
  Bell,
  Award,
  Download,
  Trash2,
  Lock,
  Sparkles,
  CheckCircle2,
  FileDown,
  LogOut,
  Moon,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookOpen,
  Activity,
  Pill,
  Clock,
  Plus,
  Info,
  MapPin,
  FileText,
  Upload,
  Eye,
  ExternalLink,
  History,
  Check,
  Stethoscope,
  Filter,
} from 'lucide-react';
import { storageService, getLocalGreeting, resolveTimeZone } from '../../services/storage';
import { apiService } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';

interface ProfileScreenProps {
  profile: UserProfile;
  achievements: Achievement[];
  initialTab?: 'profile' | 'documents' | 'timeline' | 'calendar' | 'achievements' | 'privacy';
  onUpdateProfile: (updated: UserProfile) => void;
  onExportAllData: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onBack: () => void;
  onOpenJournal?: () => void;
  onOpenSymptoms?: () => void;
  onOpenAppointments?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  achievements,
  initialTab,
  onUpdateProfile,
  onExportAllData,
  onResetData,
  onLogout,
  onBack,
  onOpenJournal,
  onOpenSymptoms,
  onOpenAppointments,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'timeline' | 'calendar' | 'achievements' | 'privacy'>(
    initialTab || 'profile'
  );

  // Location / TimeZone state
  const [locationInput, setLocationInput] = useState(profile.location || '');
  const [locationSavedNotice, setLocationSavedNotice] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => storageService.getDocuments());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);
  const [summarizingDocId, setSummarizingDocId] = useState<string | null>(null);

  // Timeline state
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'symptoms' | 'documents' | 'medications' | 'appointments'>('all');
  const [timelineDetailItem, setTimelineDetailItem] = useState<any | null>(null);

  // Calendar State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Health Profile Edit States
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [editedConditions, setEditedConditions] = useState<string[]>(profile.conditions || []);
  const [editedDietary, setEditedDietary] = useState<string[]>(profile.dietaryPreferences || []);
  const [editedAllergies, setEditedAllergies] = useState<string[]>(profile.allergies || []);
  const [editedSymptomBehavior, setEditedSymptomBehavior] = useState(profile.symptomBehavior || '');
  const [editedSharingPref, setEditedSharingPref] = useState(profile.sharingPreference || '');
  const [healthSavedNotice, setHealthSavedNotice] = useState(false);

  // Custom inputs for adding new items
  const [newCondition, setNewCondition] = useState('');
  const [newDietary, setNewDietary] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Sync tab if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Real greeting calculation
  const currentGreeting = useMemo(() => {
    return getLocalGreeting(profile.location, profile.timeZone, profile.name);
  }, [profile.location, profile.timeZone, profile.name]);

  const realStreak = useMemo(() => {
    return storageService.calculateRealStreak();
  }, [profile, activeTab]);

  const activeDateMap = useMemo(() => {
    return storageService.getAllActiveDates();
  }, [profile, activeTab]);

  const selectedDayData = useMemo(() => {
    return storageService.getHistoricalDayData(selectedCalendarDate);
  }, [selectedCalendarDate, profile, activeTab]);

  // Handle Location save
  const handleSaveLocation = (loc: string) => {
    const tz = resolveTimeZone(loc);
    const updated: UserProfile = {
      ...profile,
      location: loc.trim(),
      timeZone: tz,
    };
    onUpdateProfile(updated);
    storageService.setProfile(updated);
    setLocationSavedNotice(true);
    setTimeout(() => setLocationSavedNotice(false), 2500);
  };

  const handleSaveHealthProfile = () => {
    const updated: UserProfile = {
      ...profile,
      conditions: editedConditions,
      dietaryPreferences: editedDietary,
      allergies: editedAllergies,
      symptomBehavior: editedSymptomBehavior,
      sharingPreference: editedSharingPref,
    };
    onUpdateProfile(updated);
    storageService.setProfile(updated);
    setIsEditingHealth(false);
    setHealthSavedNotice(true);
    setTimeout(() => setHealthSavedNotice(false), 2500);
  };

  const toggleListItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const fileSizeFormatted = `${(file.size / 1024).toFixed(0)} KB`;
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        let docType: MedicalDocument['documentType'] = 'Lab Report';

        if (file.name.toLowerCase().includes('prescription') || file.name.toLowerCase().includes('rx')) {
          docType = 'Prescription';
        } else if (file.name.toLowerCase().includes('scan') || file.name.toLowerCase().includes('mri') || file.name.toLowerCase().includes('xray')) {
          docType = 'Imaging';
        } else if (file.name.toLowerCase().includes('note') || file.name.toLowerCase().includes('clinic')) {
          docType = 'Clinic Note';
        }

        const newDoc: MedicalDocument = {
          id: `doc_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          documentType: docType,
          provider: 'Medical Care Facility',
          date: new Date().toISOString().split('T')[0],
          fileName: file.name,
          fileSize: fileSizeFormatted,
          fileUrl: base64Data,
          mimeType: file.type || 'application/octet-stream',
          keyFindings: ['File uploaded and securely preserved in your local health record.'],
          plainLanguageSummary: 'Uploaded test report or clinical document available for clinician discussion.',
          suggestedDoctorQuestions: [
            'How do these test results relate to my current daily symptoms?',
            'Are there follow-up tests recommended based on these findings?',
          ],
          unverified: true,
          createdAt: new Date().toISOString(),
        };

        storageService.saveDocument(newDoc);
        setDocuments(storageService.getDocuments());
        setIsUploading(false);

        // Auto trigger AI extraction if image
        if (file.type.startsWith('image/')) {
          handleSummarizeWithAI(newDoc.id, base64Data, file.type, file.name);
        }
      };

      reader.onerror = () => {
        setUploadError('Could not read file. Please try again.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError('Upload failed. Please check the file and retry.');
      setIsUploading(false);
    }
  };

  const handleSummarizeWithAI = async (docId: string, base64Url?: string, mimeType?: string, fileName?: string) => {
    setSummarizingDocId(docId);
    try {
      const doc = documents.find((d) => d.id === docId);
      const b64 = base64Url || doc?.fileUrl || '';
      const mime = mimeType || doc?.mimeType || 'image/jpeg';
      const name = fileName || doc?.fileName || 'document';

      const analysis = await apiService.analyzeDocument(b64, mime, name);
      if (doc) {
        const updated: MedicalDocument = {
          ...doc,
          documentType: analysis.documentType || doc.documentType,
          provider: analysis.provider || doc.provider,
          keyFindings: analysis.keyFindings || doc.keyFindings,
          plainLanguageSummary: analysis.plainLanguageSummary || doc.plainLanguageSummary,
          suggestedDoctorQuestions: analysis.suggestedDoctorQuestions || doc.suggestedDoctorQuestions,
          unverified: true,
        };
        storageService.saveDocument(updated);
        setDocuments(storageService.getDocuments());
      }
    } catch (err) {
      console.warn('AI Summarization fallback error', err);
    } finally {
      setSummarizingDocId(null);
    }
  };

  const handleDeleteDocument = (id: string) => {
    storageService.deleteDocument(id);
    setDocuments(storageService.getDocuments());
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  // Build Chronological Medical Timeline
  const chronologicalTimeline = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      time?: string;
      type: 'symptom' | 'document' | 'medication' | 'appointment';
      title: string;
      categoryOrType: string;
      details: string;
      raw: any;
    }> = [];

    // Symptoms & Conditions
    const symptoms = storageService.getSymptoms();
    symptoms.forEach((s) => {
      items.push({
        id: s.id,
        date: s.date,
        time: s.time,
        type: 'symptom',
        title: s.name,
        categoryOrType: s.isCondition ? 'Diagnosed Disorder' : `Symptom (${s.category})`,
        details: `Severity: ${s.intensity}/10. ${s.notes || ''}`,
        raw: s,
      });
    });

    // Medical Documents
    documents.forEach((d) => {
      items.push({
        id: d.id,
        date: d.date,
        type: 'document',
        title: d.title || d.fileName,
        categoryOrType: d.documentType,
        details: `${d.provider} · ${d.plainLanguageSummary}`,
        raw: d,
      });
    });

    // Medications
    const meds = storageService.getMedications();
    meds.forEach((m) => {
      if (m.startDate) {
        items.push({
          id: m.id,
          date: m.startDate,
          type: 'medication',
          title: m.name,
          categoryOrType: `${m.category} (${m.status === 'discontinued' ? 'Discontinued' : 'Active'})`,
          details: `Dosage: ${m.dosage} · Frequency: ${m.frequency || m.timeSlot}. ${m.associatedCondition ? `For: ${m.associatedCondition}` : ''}`,
          raw: m,
        });
      }
    });

    // Appointments
    const apts = storageService.getAppointments();
    apts.forEach((a) => {
      items.push({
        id: a.id,
        date: a.date,
        time: a.time,
        type: 'appointment',
        title: a.doctorName || a.provider,
        categoryOrType: `${a.specialty} Visit`,
        details: `${a.location} · ${a.purpose}. ${a.isCancelled ? '(Cancelled)' : a.isRescheduled ? '(Rescheduled)' : ''}`,
        raw: a,
      });
    });

    // Sort descending by date
    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [documents, profile]);

  const filteredTimeline = chronologicalTimeline.filter((item) => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'symptoms') return item.type === 'symptom';
    if (timelineFilter === 'documents') return item.type === 'document';
    if (timelineFilter === 'medications') return item.type === 'medication';
    if (timelineFilter === 'appointments') return item.type === 'appointment';
    return true;
  });

  // Calendar Helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({
        dayNumber: d,
        dateString,
        hasActivity: Boolean(activeDateMap[dateString]),
        activityTypes: activeDateMap[dateString] || { journal: false, symptoms: false, meds: false, tasks: false },
      });
    }
    return days;
  }, [currentYear, currentMonth, activeDateMap]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF7A24]" />
            <span>Profile & Health Timeline</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Account settings, medical document vault, and unified health history
          </p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3.5 py-1.5 rounded-full font-semibold hover:bg-[#d8e3da] transition-colors"
        >
          Back
        </button>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-[#E8EFE9] rounded-2xl">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 px-3 whitespace-nowrap text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-1.5 px-3 whitespace-nowrap text-xs font-bold rounded-xl transition-all ${
            activeTab === 'documents' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-1.5 px-3 whitespace-nowrap text-xs font-bold rounded-xl transition-all ${
            activeTab === 'timeline' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 px-3 whitespace-nowrap text-xs font-bold rounded-xl transition-all ${
            activeTab === 'calendar' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-1.5 px-3 whitespace-nowrap text-xs font-bold rounded-xl transition-all ${
            activeTab === 'privacy' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Privacy
        </button>
      </div>

      {/* ================= TAB 1: MY PROFILE & LOCATION ================= */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* User Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs flex items-center gap-4">
            <UserAvatar name={profile.name} email={profile.email || 'thexplorervaruns@gmail.com'} size="xl" />

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#132A1F] font-display truncate">
                {profile.name || 'Healno Member'}
              </h3>
              <p className="text-xs font-medium text-[#FF7A24] truncate">
                {profile.email || 'thexplorervaruns@gmail.com'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                  {profile.age ? `${profile.age} years old` : 'Active Member'}
                </span>
                <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#FF7A24] fill-[#FF7A24]" />
                  <span>{realStreak} Day Streak</span>
                </span>
                <span className="text-[10px] bg-[#FFFDF9] border border-[#FF7A24]/30 text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                  {profile.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Location & Timezone Setting Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
                    Location & Timezone
                  </h4>
                  <p className="text-[11px] text-[#132A1F]/60">
                    Calculates local time for personalized dashboard greetings
                  </p>
                </div>
              </div>

              {locationSavedNotice && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter city (e.g. San Francisco, Chicago, London, Tokyo, Mumbai)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveLocation(locationInput)}
                  className="px-4 py-2 rounded-xl bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Save
                </button>
              </div>

              {/* Quick Select City Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-[#132A1F]/50">Popular:</span>
                {['San Francisco', 'New York', 'Chicago', 'London', 'Tokyo', 'Mumbai', 'Paris', 'Sydney'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setLocationInput(city);
                      handleSaveLocation(city);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      profile.location?.toLowerCase().includes(city.toLowerCase())
                        ? 'bg-[#FF7A24] text-white border-[#FF7A24]'
                        : 'bg-[#F8F6F0] text-[#132A1F]/70 border-[#132A1F]/10 hover:bg-[#FFE0C8]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Live Timezone Greeting Preview */}
              <div className="bg-[#FFF8F2] p-3 rounded-2xl border border-[#FFE0C8] flex items-center justify-between text-xs mt-2">
                <div>
                  <span className="font-bold text-[#132A1F]">Current Greeting Preview: </span>
                  <span className="text-[#FF7A24] font-semibold">{currentGreeting.greeting}</span>
                </div>
                <div className="text-[11px] text-[#132A1F]/60">
                  {currentGreeting.timeString} · {currentGreeting.timeZone}
                </div>
              </div>
            </div>
          </div>

          {/* Health Profile Section */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
                  Health & Dietary Profile
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {healthSavedNotice && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-in fade-in">
                    Saved
                  </span>
                )}
                <button
                  onClick={() => isEditingHealth ? handleSaveHealthProfile() : setIsEditingHealth(true)}
                  className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all ${
                    isEditingHealth 
                      ? 'bg-[#FF7A24] text-white' 
                      : 'bg-[#E8EFE9] text-[#132A1F] hover:bg-[#d8e3da]'
                  }`}
                >
                  {isEditingHealth ? 'Save Changes' : 'Edit Health Info'}
                </button>
                {isEditingHealth && (
                  <button
                    onClick={() => setIsEditingHealth(false)}
                    className="text-[10px] text-[#132A1F]/60 font-bold hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#132A1F]/50 uppercase">Recorded Conditions</label>
                {isEditingHealth && editedConditions.length > 0 && (
                  <button 
                    onClick={() => setEditedConditions([])}
                    className="text-[9px] text-red-500 font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {isEditingHealth ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {editedConditions.map((c, i) => (
                      <span key={i} className="text-xs bg-[#FF7A24] text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm group">
                        <span>{c}</span>
                        <button 
                          onClick={() => toggleListItem(editedConditions, c, setEditedConditions)}
                          className="hover:scale-125 transition-transform p-0.5"
                          title="Delete condition"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newCondition.trim()) {
                          setEditedConditions(prev => [...prev, newCondition.trim()]);
                          setNewCondition('');
                        }
                      }}
                      className="flex-1 bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF7A24] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newCondition.trim()) {
                          setEditedConditions(prev => [...prev, newCondition.trim()]);
                          setNewCondition('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#132A1F] text-white text-[10px] font-bold rounded-xl active:scale-95 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.conditions.length === 0 ? (
                    <span className="text-xs text-[#132A1F]/50 italic">No chronic conditions listed</span>
                  ) : (
                    profile.conditions.map((c, i) => (
                      <span key={i} className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-medium border border-[#132A1F]/5">
                        {c}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Dietary Focus */}
            <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#132A1F]/50 uppercase">Dietary Focus</label>
                {isEditingHealth && editedDietary.length > 0 && (
                  <button 
                    onClick={() => setEditedDietary([])}
                    className="text-[9px] text-red-500 font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {isEditingHealth ? (
                <div className="space-y-3">
                  {/* Removable Pills for all current dietary prefs */}
                  <div className="flex flex-wrap gap-1.5">
                    {editedDietary.map((d, i) => (
                      <span key={i} className="text-xs bg-[#FF7A24] text-white px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm group">
                        <span>{d}</span>
                        <button 
                          onClick={() => toggleListItem(editedDietary, d, setEditedDietary)}
                          className="hover:scale-125 transition-transform p-0.5"
                          title="Delete dietary focus"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Popular Selection Grid */}
                  <div className="bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#132A1F]/5">
                    <p className="text-[9px] font-bold text-[#132A1F]/40 uppercase mb-2">Popular Options</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        'Anti-Inflammatory', 'Low Histamine', 'Gluten-Free', 'Dairy-Free',
                        'Plant-Based', 'Low FODMAP', 'Keto / Low Carb', 'Mediterranean'
                      ].map(diet => (
                        <button
                          key={diet}
                          type="button"
                          onClick={() => toggleListItem(editedDietary, diet, setEditedDietary)}
                          className={`text-[10px] px-2 py-1.5 rounded-lg border text-left transition-all ${
                            editedDietary.includes(diet)
                              ? 'bg-[#FF7A24] text-white border-[#FF7A24] font-bold'
                              : 'bg-white border-[#132A1F]/10 text-[#132A1F]/70 hover:border-[#FF7A24]/30'
                          }`}
                        >
                          {diet} {editedDietary.includes(diet) && '✓'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Other dietary preference..."
                      value={newDietary}
                      onChange={(e) => setNewDietary(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDietary.trim()) {
                          setEditedDietary(prev => [...prev, newDietary.trim()]);
                          setNewDietary('');
                        }
                      }}
                      className="flex-1 bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF7A24] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newDietary.trim()) {
                          setEditedDietary(prev => [...prev, newDietary.trim()]);
                          setNewDietary('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#132A1F] text-white text-[10px] font-bold rounded-xl active:scale-95 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.dietaryPreferences.length === 0 ? (
                    <span className="text-xs text-[#132A1F]/50 italic">None specified</span>
                  ) : (
                    profile.dietaryPreferences.map((d, i) => (
                      <span key={i} className="text-xs bg-[#F8F6F0] border border-[#132A1F]/10 px-2.5 py-1 rounded-full">
                        {d}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#132A1F]/50 uppercase">Known Allergies</label>
                {isEditingHealth && editedAllergies.length > 0 && (
                  <button 
                    onClick={() => setEditedAllergies([])}
                    className="text-[9px] text-red-500 font-bold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {isEditingHealth ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {editedAllergies.map((a, i) => (
                      <span key={i} className="text-xs bg-[#FFE5D9] text-[#6B4435] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                        <span>{a}</span>
                        <button 
                          onClick={() => toggleListItem(editedAllergies, a, setEditedAllergies)}
                          className="hover:scale-125 transition-transform p-0.5"
                          title="Delete allergy"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add allergy..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newAllergy.trim()) {
                          setEditedAllergies(prev => [...prev, newAllergy.trim()]);
                          setNewAllergy('');
                        }
                      }}
                      className="flex-1 bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#FF7A24] outline-none"
                    />
                    <button
                      onClick={() => {
                        if (newAllergy.trim()) {
                          setEditedAllergies(prev => [...prev, newAllergy.trim()]);
                          setNewAllergy('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#132A1F] text-white text-[10px] font-bold rounded-xl active:scale-95 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.allergies.length === 0 ? (
                    <span className="text-xs text-[#132A1F]/50 italic">No allergies listed</span>
                  ) : (
                    profile.allergies.map((a, i) => (
                      <span key={i} className="text-xs bg-[#FFE5D9] text-[#6B4435] px-2.5 py-1 rounded-full font-semibold border border-[#132A1F]/5">
                        {a}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Behavior & Goals */}
            <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
              <label className="text-[10px] font-bold text-[#132A1F]/50 uppercase">Symptom Behavior</label>
              {isEditingHealth ? (
                <select
                  value={editedSymptomBehavior}
                  onChange={(e) => setEditedSymptomBehavior(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF7A24] outline-none"
                >
                  <option value="">Select behavior...</option>
                  <option value="Fluctuates depending on activity and rest">Fluctuates with activity</option>
                  <option value="Steady baseline with sudden flare-ups">Steady with flares</option>
                  <option value="Triggered by stress, weather, or exertion">Triggered by factors</option>
                  <option value="Gradually improving or still under investigation">Under investigation</option>
                </select>
              ) : (
                <p className="text-xs text-[#132A1F]/80">
                  {profile.symptomBehavior || 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#132A1F]/5">
              <label className="text-[10px] font-bold text-[#132A1F]/50 uppercase">Healno Use Plan</label>
              {isEditingHealth ? (
                <select
                  value={editedSharingPref}
                  onChange={(e) => setEditedSharingPref(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#FF7A24] outline-none"
                >
                  <option value="">Select plan...</option>
                  <option value="Personal reflection & tracking only">Personal tracking</option>
                  <option value="Prepare clinical summary notes before doctor appointments">Doctor preparation</option>
                  <option value="Share exported symptom reports with my healthcare provider">Healthcare sharing</option>
                  <option value="Manage my daily energy, tasks, and pacing">Energy management</option>
                </select>
              ) : (
                <p className="text-xs text-[#132A1F]/80">
                  {profile.sharingPreference || 'Not specified'}
                </p>
              )}
            </div>

            {/* Reset Profile Option */}
            {isEditingHealth && (
              <div className="pt-4 border-t border-[#132A1F]/10 text-center">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire health profile? This will remove all conditions, dietary preferences, and allergies.')) {
                      setEditedConditions([]);
                      setEditedDietary([]);
                      setEditedAllergies([]);
                      setEditedSymptomBehavior('');
                      setEditedSharingPref('');
                    }
                  }}
                  className="text-[10px] bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset All Onboarding Health Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: MEDICAL DOCUMENTS & REPORTS ================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Upload Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#132A1F] font-display">Upload Medical Document</h3>
                  <p className="text-[11px] text-[#132A1F]/60">Lab reports, prescriptions, MRI scans, or clinical notes</p>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {uploadError}
              </div>
            )}

            <label className="border-2 border-dashed border-[#132A1F]/20 hover:border-[#FF7A24] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#FAF8F5] transition-all">
              <input
                type="file"
                accept="image/*,application/pdf,text/*,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <FileText className="w-8 h-8 text-[#FF7A24] mb-2" />
              <span className="text-xs font-bold text-[#132A1F]">
                {isUploading ? 'Securely Uploading Document...' : 'Click to Upload Report or Prescription'}
              </span>
              <span className="text-[10px] text-[#132A1F]/50 mt-1">
                Supports PDF, JPEG, PNG, Text (Up to 10MB)
              </span>
            </label>
          </div>

          {/* List of Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#132A1F]">
              <span>Saved Medical Records</span>
              <span className="text-[#132A1F]/50 font-normal">{documents.length} files</span>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-[#132A1F]/10 space-y-2">
                <FileText className="w-8 h-8 text-[#FF7A24] mx-auto opacity-60" />
                <h5 className="text-xs font-bold text-[#132A1F]">No documents uploaded yet</h5>
                <p className="text-[11px] text-[#132A1F]/60 max-w-xs mx-auto">
                  Upload blood tests, imaging results, or doctor notes to preserve records and get plain-language AI explanations.
                </p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24] shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#132A1F]">{doc.title}</h4>
                          <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-semibold px-2 py-0.2 rounded-full">
                            {doc.documentType}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#132A1F]/50 mt-0.5">
                          {doc.date} · {doc.fileName} {doc.fileSize && `· ${doc.fileSize}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-[#FFE0C8] text-[#132A1F]/60 hover:text-[#FF7A24] flex items-center justify-center transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-[#E8EFE9] text-[#132A1F]/60 hover:text-[#132A1F] flex items-center justify-center transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-red-50 text-[#132A1F]/40 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary & Findings */}
                  {doc.plainLanguageSummary && (
                    <p className="text-xs text-[#132A1F]/80 bg-[#FAF8F5] p-3 rounded-xl leading-relaxed">
                      {doc.plainLanguageSummary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#FF7A24] font-medium">
                      {doc.keyFindings?.length || 0} Key findings identified
                    </span>

                    <button
                      onClick={() => handleSummarizeWithAI(doc.id)}
                      disabled={summarizingDocId === doc.id}
                      className="text-xs bg-[#132A1F] hover:bg-[#2D6A4F] text-white px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF7A24]" />
                      <span>{summarizingDocId === doc.id ? 'Analyzing...' : 'Summarize with AI'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: UNIFIED MEDICAL TIMELINE ================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#FF7A24]" />
                  <span>Chronological Health Timeline</span>
                </h3>
                <p className="text-[11px] text-[#132A1F]/60">
                  Comprehensive chronological history of symptoms, conditions, medicines, appointments, and test reports
                </p>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'symptoms', label: 'Symptoms & Conditions' },
                { id: 'documents', label: 'Medical Documents' },
                { id: 'medications', label: 'Medicines' },
                { id: 'appointments', label: 'Appointments' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimelineFilter(f.id as any)}
                  className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap font-semibold transition-all ${
                    timelineFilter === f.id
                      ? 'bg-[#FF7A24] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-[#132A1F]/70 hover:bg-[#E8EFE9]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          {filteredTimeline.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-[#132A1F]/10 space-y-2">
              <History className="w-8 h-8 text-[#FF7A24] mx-auto opacity-60" />
              <h5 className="text-xs font-bold text-[#132A1F]">No timeline events in this category</h5>
              <p className="text-[11px] text-[#132A1F]/60">
                Log symptoms, upload lab reports, or schedule appointments to build your longitudinal timeline.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 border-l-2 border-[#132A1F]/10 ml-3">
              {filteredTimeline.map((item) => {
                const badgeColor =
                  item.type === 'symptom'
                    ? 'bg-[#FFF4EB] text-[#FF7A24]'
                    : item.type === 'document'
                    ? 'bg-blue-50 text-blue-700'
                    : item.type === 'medication'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-emerald-50 text-emerald-800';

                return (
                  <div
                    key={item.id}
                    onClick={() => setTimelineDetailItem(item)}
                    className="relative bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 cursor-pointer transition-all space-y-1.5"
                  >
                    {/* Node Dot on Left Border */}
                    <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-[#FF7A24] border-2 border-white" />

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#132A1F]/50">
                        {item.date} {item.time && `· ${item.time}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${badgeColor}`}>
                        {item.categoryOrType}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#132A1F]">{item.title}</h4>
                    <p className="text-[11px] text-[#132A1F]/70 line-clamp-2">{item.details}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: CALENDAR ================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#FF7A24] font-bold">
                  Spoon & Check-in Calendar
                </span>
                <h3 className="text-base font-bold font-display mt-0.5">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-1 text-center pt-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[10px] font-bold text-white/50 py-1">
                  {day}
                </div>
              ))}

              {calendarDays.map((d, index) => {
                if (!d) return <div key={`empty_${index}`} className="h-9" />;

                const isSelected = d.dateString === selectedCalendarDate;
                const isToday = d.dateString === today.toISOString().split('T')[0];

                return (
                  <button
                    key={d.dateString}
                    onClick={() => setSelectedCalendarDate(d.dateString)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? 'bg-[#FF7A24] text-white font-bold shadow-md'
                        : isToday
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs">{d.dayNumber}</span>
                    {d.hasActivity && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A24] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Historical Details for Selected Day */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
              Records for {selectedCalendarDate}
            </h4>

            {selectedDayData.hasActivity ? (
              <div className="space-y-2 text-xs">
                {selectedDayData.symptoms.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-[#FFF4EB] border border-[#FFE0C8]">
                    <span className="font-bold text-[#132A1F]">{s.name}</span> — Severity {s.intensity}/10
                  </div>
                ))}
                {selectedDayData.journal.map((j) => (
                  <div key={j.id} className="p-2.5 rounded-xl bg-[#F8F6F0] border border-[#132A1F]/10">
                    <span className="font-bold text-[#132A1F]">{j.title}</span>: {j.content}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#132A1F]/60 italic">No activity logged for this date.</p>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: PRIVACY & DATA ================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-sm font-bold text-[#132A1F] font-display">
                Data Ownership & Protection
              </h3>
            </div>
            <p className="text-xs text-[#132A1F]/80 leading-relaxed">
              Your health diary, symptoms, medications, and document summaries are stored locally and encrypted in transit. You hold exclusive sovereignty over your health data.
            </p>

            <div className="pt-2 border-t border-[#132A1F]/5 space-y-2">
              <button
                onClick={onExportAllData}
                className="w-full py-2.5 px-4 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Complete JSON Health Export</span>
              </button>

              <button
                onClick={onResetData}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Local Data & Re-seed</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onLogout}
              className="text-xs text-[#132A1F]/60 hover:text-[#132A1F] font-semibold flex items-center justify-center gap-1.5 mx-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= PREVIEW DOCUMENT MODAL ================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF7A24]" />
                <h3 className="text-base font-bold text-[#132A1F] font-display truncate">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            {/* If Image, show image preview */}
            {previewDoc.fileUrl && previewDoc.mimeType?.startsWith('image/') && (
              <div className="rounded-2xl overflow-hidden border border-[#132A1F]/10 max-h-72 flex items-center justify-center bg-black/5">
                <img src={previewDoc.fileUrl} alt={previewDoc.title} className="max-h-72 object-contain" />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#132A1F]/70">
                <span className="font-bold text-[#132A1F]">Category:</span> {previewDoc.documentType}
                <span>·</span>
                <span className="font-bold text-[#132A1F]">Date:</span> {previewDoc.date}
              </div>

              {previewDoc.plainLanguageSummary && (
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 space-y-1">
                  <h5 className="text-xs font-bold text-[#132A1F]">Plain Language Summary</h5>
                  <p className="text-xs text-[#132A1F]/80 leading-relaxed">
                    {previewDoc.plainLanguageSummary}
                  </p>
                </div>
              )}

              {previewDoc.keyFindings && previewDoc.keyFindings.length > 0 && (
                <div className="bg-[#FFF4EB] p-3.5 rounded-2xl border border-[#FFE0C8] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#FF7A24]">Key Findings</h5>
                  <ul className="text-xs text-[#132A1F]/85 space-y-1 list-disc pl-4">
                    {previewDoc.keyFindings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewDoc.suggestedDoctorQuestions && previewDoc.suggestedDoctorQuestions.length > 0 && (
                <div className="bg-[#E8EFE9] p-3.5 rounded-2xl border border-[#B7E4C7] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#2D6A4F]">Suggested Questions for Doctor</h5>
                  <ul className="text-xs text-[#132A1F]/85 space-y-1 list-disc pl-4">
                    {previewDoc.suggestedDoctorQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#132A1F]/10">
              {previewDoc.fileUrl ? (
                <a
                  href={previewDoc.fileUrl}
                  download={previewDoc.fileName}
                  className="px-4 py-2 rounded-full bg-[#FF7A24] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              ) : <div />}

              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-full bg-[#E8EFE9] text-xs font-semibold text-[#132A1F]/70"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TIMELINE DETAIL MODAL ================= */}
      {timelineDetailItem && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF7A24]">
                  {timelineDetailItem.categoryOrType}
                </span>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {timelineDetailItem.title}
                </h3>
              </div>
              <button
                onClick={() => setTimelineDetailItem(null)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#132A1F]/60">
              Recorded on: {timelineDetailItem.date} {timelineDetailItem.time && `at ${timelineDetailItem.time}`}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#132A1F]/10 text-xs text-[#132A1F]/80 leading-relaxed">
              {timelineDetailItem.details}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTimelineDetailItem(null)}
                className="px-5 py-2 rounded-full bg-[#132A1F] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
