import React, { useState, useEffect } from 'react';
import { SymptomLog, Medication } from '../../types';
import { storageService } from '../../services/storage';
import {
  Activity,
  Plus,
  Search,
  Calendar,
  Sparkles,
  Download,
  Trash2,
  AlertCircle,
  TrendingUp,
  Clock,
  Pill,
  Edit2,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Sliders,
  Check,
  X,
  History,
} from 'lucide-react';
import { EmptyStateIllustration, TimelineIllustration } from '../common/CodeIllustrations';

interface SymptomsScreenProps {
  symptoms: SymptomLog[];
  onAddSymptom: (symptom: SymptomLog) => void;
  onDeleteSymptom: (id: string) => void;
  onExportSummary: () => void;
  xpScore?: number;
}

export const SymptomsScreen: React.FC<SymptomsScreenProps> = ({
  symptoms,
  onAddSymptom,
  onDeleteSymptom,
  onExportSummary,
}) => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'medicines' | 'trends'>('symptoms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Symptoms state & modal
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<SymptomLog | null>(null);
  const [isCondition, setIsCondition] = useState(false);
  const [category, setCategory] = useState<SymptomLog['category']>('fatigue');
  const [name, setName] = useState('Persistent Fatigue');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Morning']);
  const [triggers, setTriggers] = useState('');
  const [restPeriods, setRestPeriods] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));

  // Medications state & modal
  const [medications, setMedications] = useState<Medication[]>(() => storageService.getMedications());
  const [medTab, setMedTab] = useState<'active' | 'past'>('active');
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeSlot, setTimeSlot] = useState<Medication['timeSlot']>('Morning');
  const [medCategory, setMedCategory] = useState<Medication['category']>('Prescription');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [associatedCondition, setAssociatedCondition] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isAsNeeded, setIsAsNeeded] = useState(false);

  useEffect(() => {
    setMedications(storageService.getMedications());
  }, []);

  const availableTags = [
    'Morning',
    'Afternoon Crash',
    'Post-Exertional',
    'Overexertion',
    'Poor Sleep',
    'Weather Shift',
    'Screen Time',
    'Standing Long',
    'Digestive',
    'Rest Day',
  ];

  const symptomCategories: { id: SymptomLog['category']; label: string }[] = [
    { id: 'fatigue', label: 'Fatigue & PEM' },
    { id: 'pain', label: 'Pain & Soreness' },
    { id: 'brain_fog', label: 'Brain Fog' },
    { id: 'sleep', label: 'Sleep & Rest' },
    { id: 'digestive', label: 'Digestive & Gut' },
    { id: 'mood', label: 'Mood & Stress' },
    { id: 'condition', label: 'Chronic Condition' },
    { id: 'custom', label: 'Other / Custom' },
  ];

  const openAddSymptomModal = () => {
    setEditingSymptom(null);
    setIsCondition(false);
    setCategory('fatigue');
    setName('Persistent Fatigue');
    setIntensity(5);
    setNotes('');
    setSelectedTags(['Morning']);
    setTriggers('');
    setRestPeriods('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setShowSymptomModal(true);
  };

  const openEditSymptomModal = (sym: SymptomLog) => {
    setEditingSymptom(sym);
    setIsCondition(Boolean(sym.isCondition));
    setCategory(sym.category);
    setName(sym.name);
    setIntensity(sym.intensity);
    setNotes(sym.notes || '');
    setSelectedTags(sym.tags || []);
    setTriggers(sym.triggers ? sym.triggers.join(', ') : '');
    setRestPeriods(sym.restPeriods || '');
    setDate(sym.date);
    setTime(sym.time || new Date().toTimeString().slice(0, 5));
    setShowSymptomModal(true);
  };

  const handleSaveSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSymptom) {
      // Delete old and add updated
      onDeleteSymptom(editingSymptom.id);
      const updated: SymptomLog = {
        ...editingSymptom,
        date,
        time,
        category: isCondition ? 'condition' : category,
        name: name.trim(),
        intensity: Number(intensity),
        notes: notes.trim(),
        tags: selectedTags,
        triggers: triggers ? triggers.split(',').map((t) => t.trim()).filter(Boolean) : [],
        restPeriods: restPeriods.trim(),
        isCondition,
        status: 'active',
      };
      onAddSymptom(updated);
    } else {
      const newLog: SymptomLog = {
        id: `sym_${Date.now()}`,
        date,
        time,
        category: isCondition ? 'condition' : category,
        name: name.trim(),
        intensity: Number(intensity),
        notes: notes.trim(),
        tags: selectedTags,
        triggers: triggers ? triggers.split(',').map((t) => t.trim()).filter(Boolean) : [],
        restPeriods: restPeriods.trim(),
        isCondition,
        status: 'active',
      };
      onAddSymptom(newLog);
    }

    setShowSymptomModal(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Medicine operations
  const openAddMedModal = () => {
    setEditingMed(null);
    setMedName('');
    setDosage('');
    setFrequency('Once daily');
    setTimeSlot('Morning');
    setMedCategory('Prescription');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setAssociatedCondition('');
    setInstructions('');
    setIsAsNeeded(false);
    setShowMedModal(true);
  };

  const openEditMedModal = (med: Medication) => {
    setEditingMed(med);
    setMedName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency || 'Once daily');
    setTimeSlot(med.timeSlot);
    setMedCategory(med.category);
    setStartDate(med.startDate || new Date().toISOString().split('T')[0]);
    setEndDate(med.endDate || '');
    setAssociatedCondition(med.associatedCondition || '');
    setInstructions(med.instructions || '');
    setIsAsNeeded(med.isAsNeeded);
    setShowMedModal(true);
  };

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return;

    if (editingMed) {
      const updated: Medication = {
        ...editingMed,
        name: medName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timeSlot,
        category: medCategory,
        startDate,
        endDate: endDate ? endDate : undefined,
        associatedCondition: associatedCondition.trim(),
        instructions: instructions.trim(),
        isAsNeeded,
        updatedAt: new Date().toISOString(),
      };
      storageService.saveMedication(updated);
    } else {
      const newMed: Medication = {
        id: `med_${Date.now()}`,
        name: medName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timeSlot,
        scheduleTimes: [timeSlot === 'Morning' ? '08:00' : timeSlot === 'Evening' ? '20:00' : '12:00'],
        category: medCategory,
        startDate,
        endDate: endDate ? endDate : undefined,
        associatedCondition: associatedCondition.trim(),
        instructions: instructions.trim(),
        isAsNeeded,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      storageService.saveMedication(newMed);
    }

    setMedications(storageService.getMedications());
    setShowMedModal(false);
  };

  const handleDiscontinueMed = (id: string) => {
    storageService.discontinueMedication(id);
    setMedications(storageService.getMedications());
  };

  const handleDeleteMed = (id: string) => {
    storageService.deleteMedication(id);
    setMedications(storageService.getMedications());
  };

  // Filter symptoms
  const filteredSymptoms = symptoms.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter medications
  const activeMeds = medications.filter((m) => m.status !== 'discontinued');
  const pastMeds = medications.filter((m) => m.status === 'discontinued');

  const filteredMeds = (medTab === 'active' ? activeMeds : pastMeds).filter((m) => {
    return (
      searchQuery === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.associatedCondition?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Metrics
  const fatigueLogs = symptoms.filter((s) => s.category === 'fatigue');
  const avgFatigue = fatigueLogs.length > 0
    ? (fatigueLogs.reduce((acc, s) => acc + s.intensity, 0) / fatigueLogs.length).toFixed(1)
    : '0.0';

  const painLogs = symptoms.filter((s) => s.category === 'pain');
  const avgPain = painLogs.length > 0
    ? (painLogs.reduce((acc, s) => acc + s.intensity, 0) / painLogs.length).toFixed(1)
    : '0.0';

  const avgOverall = symptoms.length > 0
    ? (symptoms.reduce((acc, s) => acc + s.intensity, 0) / symptoms.length).toFixed(1)
    : '0.0';

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF7A24]" />
            <span>Symptoms & Medicines</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Log medical conditions, symptoms, and manage prescription regimens
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'symptoms' ? (
            <button
              onClick={openAddSymptomModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Symptom</span>
            </button>
          ) : activeTab === 'medicines' ? (
            <button
              onClick={openAddMedModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Medicine</span>
            </button>
          ) : (
            <button
              onClick={onExportSummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#132A1F]/15 hover:bg-[#F8F6F0] text-xs font-semibold text-[#132A1F] shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#FF7A24]" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Segmented Switcher: Symptoms vs Medicines vs Trends */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => { setActiveTab('symptoms'); setSearchQuery(''); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'symptoms' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Symptoms ({symptoms.length})
        </button>
        <button
          onClick={() => { setActiveTab('medicines'); setSearchQuery(''); }}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'medicines' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Medicines ({activeMeds.length})
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'trends' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Trends
        </button>
      </div>

      {/* ================= TAB 1: SYMPTOMS & DISORDERS ================= */}
      {activeTab === 'symptoms' && (
        <div className="space-y-4">
          {/* Search & Category Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search symptoms, conditions, notes, or triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#132A1F] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                All Categories
              </button>
              {symptomCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#FF7A24] text-white shadow-xs'
                      : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Symptoms & Conditions */}
          {filteredSymptoms.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
              <EmptyStateIllustration type="symptoms" />
              <h4 className="text-sm font-bold text-[#132A1F] font-display">No symptoms recorded yet</h4>
              <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                Log sensations like fatigue, joint pain, brain fog, or diagnosed medical conditions to build your personal clinical timeline.
              </p>
              <button
                onClick={openAddSymptomModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Log Your First Symptom</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSymptoms.map((log) => {
                const severityColor =
                  log.intensity >= 8
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : log.intensity >= 5
                    ? 'bg-[#FFF4EB] text-[#FF7A24] border-[#FFE0C8]'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                return (
                  <div
                    key={log.id}
                    className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs relative hover:border-[#FF7A24]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#132A1F] font-display">
                            {log.name}
                          </span>
                          {log.isCondition && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                              Diagnosed Condition
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${severityColor}`}>
                            Severity: {log.intensity}/10
                          </span>
                        </div>
                        <div className="text-[10px] text-[#132A1F]/50 mt-0.5">
                          {log.date} {log.time && `· ${log.time}`} · {log.category.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSymptomModal(log)}
                          className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-[#FFE0C8] text-[#132A1F]/60 hover:text-[#FF7A24] flex items-center justify-center transition-colors"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSymptom(log.id)}
                          className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-red-50 text-[#132A1F]/40 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-xs text-[#132A1F]/80 mt-2.5 leading-relaxed bg-[#F8F6F0] p-3 rounded-xl">
                        "{log.notes}"
                      </p>
                    )}

                    {log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {log.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-[#132A1F]/70 bg-white border border-[#132A1F]/15 px-2 py-0.5 rounded-md"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {log.triggers && log.triggers.length > 0 && (
                      <div className="text-[11px] text-[#6B4435] mt-2 font-medium">
                        Triggers: {log.triggers.join(', ')}
                      </div>
                    )}

                    {log.restPeriods && (
                      <div className="text-[11px] text-[#2D6A4F] mt-1 font-medium">
                        Rest taken: {log.restPeriods}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MEDICINE MANAGEMENT ================= */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          {/* Sub-tab: Active vs Past Medications */}
          <div className="flex items-center justify-between border-b border-[#132A1F]/10 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMedTab('active')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  medTab === 'active'
                    ? 'bg-[#132A1F] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                Active Regimens ({activeMeds.length})
              </button>
              <button
                onClick={() => setMedTab('past')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  medTab === 'past'
                    ? 'bg-[#132A1F] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Discontinued / Past ({pastMeds.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-[#132A1F]/50 font-medium">
              {filteredMeds.length} items
            </span>
          </div>

          {/* Search box for medicines */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search medication name, dosage, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]"
            />
          </div>

          {/* List of Medications */}
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24]">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#132A1F] font-display">
                {medTab === 'active' ? 'No active medications recorded' : 'No past medications recorded'}
              </h4>
              <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                Record prescriptions, supplements, dosage, and schedules so you have an accurate medication history for clinical visits.
              </p>
              {medTab === 'active' && (
                <button
                  onClick={openAddMedModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add First Medication</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeds.map((med) => (
                <div
                  key={med.id}
                  className={`bg-white rounded-2xl p-4.5 border transition-all shadow-xs ${
                    med.status === 'discontinued'
                      ? 'border-[#132A1F]/10 opacity-75'
                      : 'border-[#132A1F]/10 hover:border-[#FF7A24]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF4EB] border border-[#FFE0C8] flex items-center justify-center text-[#FF7A24] shrink-0 mt-0.5">
                        <Pill className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#132A1F] font-display">
                            {med.name}
                          </h4>
                          <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-bold px-2 py-0.5 rounded-full">
                            {med.dosage}
                          </span>
                          <span className="text-[10px] bg-[#F8F6F0] text-[#132A1F]/70 px-2 py-0.5 rounded-full">
                            {med.category}
                          </span>
                          {med.isAsNeeded && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                              PRN / As Needed
                            </span>
                          )}
                          {med.status === 'discontinued' && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              Discontinued
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#132A1F]/60 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Frequency: {med.frequency || med.timeSlot}</span>
                          {med.startDate && <span>· Started: {med.startDate}</span>}
                          {med.endDate && <span>· Ended: {med.endDate}</span>}
                        </div>

                        {med.associatedCondition && (
                          <div className="text-[11px] text-[#FF7A24] font-medium mt-1">
                            Associated with: {med.associatedCondition}
                          </div>
                        )}

                        {med.instructions && (
                          <p className="text-[11px] text-[#132A1F]/70 mt-1.5 bg-[#FAF8F5] p-2 rounded-lg italic">
                            "{med.instructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditMedModal(med)}
                        className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-[#FFE0C8] text-[#132A1F]/60 hover:text-[#FF7A24] flex items-center justify-center transition-colors"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {med.status !== 'discontinued' ? (
                        <button
                          onClick={() => handleDiscontinueMed(med.id)}
                          className="px-2.5 py-1 rounded-full bg-[#F8F6F0] hover:bg-amber-50 text-[#132A1F]/60 hover:text-amber-700 text-[10px] font-bold transition-colors"
                          title="Discontinue medicine"
                        >
                          Discontinue
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            med.status = 'active';
                            med.endDate = undefined;
                            storageService.saveMedication(med);
                            setMedications(storageService.getMedications());
                          }}
                          className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold transition-colors"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="w-7 h-7 rounded-full bg-[#F8F6F0] hover:bg-red-50 text-[#132A1F]/40 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Delete medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TRENDS & PATTERNS ================= */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FF7A24]" />
                <span>Clinical Symptom Averages</span>
              </h3>
              <span className="text-[10px] text-[#132A1F]/60">Based on {symptoms.length} logs</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#FFF4EB] p-3 rounded-2xl border border-[#FFE0C8]">
                <span className="text-[10px] uppercase tracking-wider text-[#FF7A24] font-bold">
                  Avg Fatigue
                </span>
                <div className="text-xl font-bold font-display text-[#132A1F] mt-1 tabular-nums">
                  {avgFatigue} / 10
                </div>
                <span className="text-[9px] text-[#132A1F]/60">Exertion sensitive</span>
              </div>

              <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-[#132A1F]/10">
                <span className="text-[10px] uppercase tracking-wider text-[#132A1F]/70 font-bold">
                  Avg Pain
                </span>
                <div className="text-xl font-bold font-display text-[#132A1F] mt-1 tabular-nums">
                  {avgPain} / 10
                </div>
                <span className="text-[9px] text-[#132A1F]/60">Musculoskeletal</span>
              </div>

              <div className="bg-[#E8EFE9] p-3 rounded-2xl border border-[#B7E4C7]">
                <span className="text-[10px] uppercase tracking-wider text-[#2D6A4F] font-bold">
                  Overall Mean
                </span>
                <div className="text-xl font-bold font-display text-[#132A1F] mt-1 tabular-nums">
                  {avgOverall} / 10
                </div>
                <span className="text-[9px] text-[#2D6A4F]">Active baseline</span>
              </div>
            </div>
          </div>

          {/* Timeline Illustration Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#132A1F] font-display">Longitudinal Health Timeline</h4>
              <p className="text-xs text-[#132A1F]/60 max-w-xs">
                All symptom intensities and medications are preserved chronologically for doctor appointments.
              </p>
              <button
                onClick={onExportSummary}
                className="mt-2 text-xs text-[#FF7A24] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Generate Clinical Summary</span>
                <span>→</span>
              </button>
            </div>
            <div className="shrink-0 pl-2">
              <TimelineIllustration className="w-16 h-16" />
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG / EDIT SYMPTOM OR CONDITION ================= */}
      {showSymptomModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {editingSymptom ? 'Edit Health Record' : 'Record Symptom / Condition'}
                </h3>
              </div>
              <button
                onClick={() => setShowSymptomModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSymptom} className="space-y-4">
              {/* Type Switcher: Acute Symptom vs Chronic Condition */}
              <div className="flex items-center p-1 bg-[#E8EFE9] rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsCondition(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    !isCondition ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70'
                  }`}
                >
                  Acute Symptom
                </button>
                <button
                  type="button"
                  onClick={() => setIsCondition(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isCondition ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70'
                  }`}
                >
                  Diagnosed Disorder / Condition
                </button>
              </div>

              {!isCondition && (
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomCategories.filter(c => c.id !== 'condition').map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          if (cat.id === 'fatigue') setName('Persistent Fatigue');
                          else if (cat.id === 'pain') setName('Joint or Muscle Aches');
                          else if (cat.id === 'brain_fog') setName('Brain Fog / Concentration');
                          else if (cat.id === 'sleep') setName('Non-Restorative Sleep');
                          else if (cat.id === 'digestive') setName('Abdominal Discomfort');
                          else setName('');
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                          category === cat.id
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-xs'
                            : 'bg-white text-[#132A1F] border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  {isCondition ? 'Medical Condition / Disorder Name *' : 'Symptom Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isCondition ? "e.g. POTS, ME/CFS, Fibromyalgia, Endometriosis" : "e.g. Brain fog, Post-exertional crash, Migraine"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              {/* Severity Slider */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#132A1F]">
                  <span>Severity Rating</span>
                  <span className="text-[#FF7A24] font-display text-sm">{intensity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#FF7A24]"
                />
                <div className="flex justify-between text-[10px] text-[#132A1F]/50">
                  <span>1 - Mild / Manageable</span>
                  <span>5 - Disruptive</span>
                  <span>10 - Severe / Debilitating</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    {isCondition ? 'Diagnosed Date' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              {!isCondition && (
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Context Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24]'
                            : 'bg-white text-[#132A1F]/70 border-[#132A1F]/15 hover:bg-[#F8F6F0]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Triggers or Context (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standing up quickly, heavy meal, hot shower, stress"
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Clinical Notes & Impact
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe sensation, pain quality (throbbing, burning), duration, or limitation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  {editingSymptom ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT MEDICATION ================= */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {editingMed ? 'Edit Medication' : 'Add Medication / Supplement'}
                </h3>
              </div>
              <button
                onClick={() => setShowMedModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedication} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fludrocortisone, CoQ10"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0.1 mg, 200 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Every 8 hours">Every 8 hours</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Primary Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as any)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Category
                  </label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Supplement">Supplement / Vitamin</option>
                    <option value="OTC">Over-The-Counter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Associated Condition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POTS, Migraine, Sleep"
                    value={associatedCondition}
                    onChange={(e) => setAssociatedCondition(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Instructions & Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with 500ml water and breakfast. Do not take within 2 hours of iron."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="asNeededCheck"
                  checked={isAsNeeded}
                  onChange={(e) => setIsAsNeeded(e.target.checked)}
                  className="rounded border-[#132A1F]/30 text-[#FF7A24] focus:ring-[#FF7A24]"
                />
                <label htmlFor="asNeededCheck" className="text-xs font-bold text-[#132A1F]">
                  Take only as needed (PRN) for flare-ups
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  {editingMed ? 'Update Medication' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
