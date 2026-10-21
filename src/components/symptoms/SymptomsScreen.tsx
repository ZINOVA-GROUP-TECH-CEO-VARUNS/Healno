import React, { useState } from 'react';
import { SymptomLog } from '../../types';
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
  Filter,
  Clock,
  Tag,
  Check,
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
  xpScore = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'diary' | 'trends'>('diary');
  const [showLogModal, setShowLogModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states for new symptom
  const [category, setCategory] = useState<SymptomLog['category']>('fatigue');
  const [name, setName] = useState('Persistent Fatigue');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Morning']);
  const [triggers, setTriggers] = useState('');
  const [restPeriods, setRestPeriods] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));

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
    { id: 'custom', label: 'Other / Custom' },
  ];

  const handleSaveSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLog: SymptomLog = {
      id: `sym_${Date.now()}`,
      date,
      time,
      category,
      name: name.trim(),
      intensity: Number(intensity),
      notes: notes.trim(),
      tags: selectedTags,
      triggers: triggers ? triggers.split(',').map((t) => t.trim()).filter(Boolean) : [],
      restPeriods: restPeriods.trim(),
    };

    onAddSymptom(newLog);
    setShowLogModal(false);
    setNotes('');
    setTriggers('');
    setRestPeriods('');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Compute metrics from actual persisted symptoms
  const filteredSymptoms = symptoms.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
            <span>Symptoms Tracker</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Log physical sensations, severity patterns, and doctor-ready clinical records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#132A1F]/15 hover:bg-[#F8F6F0] text-xs font-semibold text-[#132A1F] shadow-2xs transition-colors"
            title="Export Clinical Health Summary"
          >
            <Download className="w-3.5 h-3.5 text-[#FF7A24]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Symptom</span>
          </button>
        </div>
      </div>

      {/* Segmented view switcher */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('diary')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'diary' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Symptom Diary
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'trends' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Trends & Patterns
        </button>
      </div>

      {/* TAB 1: SYMPTOM DIARY */}
      {activeTab === 'diary' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search symptoms, notes, or triggers..."
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

          {/* List of Symptoms */}
          {filteredSymptoms.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
              <EmptyStateIllustration type="symptoms" />
              <h4 className="text-sm font-bold text-[#132A1F] font-display">No symptoms recorded yet</h4>
              <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                Log sensations like fatigue, joint pain, brain fog, or gut changes to build your personal clinical timeline and detect triggers.
              </p>
              <button
                onClick={() => setShowLogModal(true)}
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#132A1F] font-display">
                            {log.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${severityColor}`}>
                            Severity: {log.intensity}/10
                          </span>
                        </div>
                        <div className="text-[10px] text-[#132A1F]/50 mt-0.5">
                          {log.date} · {log.time} · {log.category.replace('_', ' ')}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSymptom(log.id)}
                        className="text-[#132A1F]/40 hover:text-red-500 transition-colors p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* TAB 2: TRENDS & PATTERNS */}
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
                All symptom intensities are preserved chronologically with timestamps for doctor appointments.
              </p>
              <button
                onClick={onExportSummary}
                className="mt-2 text-xs text-[#FF7A24] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Generate Clinical PDF / Summary</span>
                <span>→</span>
              </button>
            </div>
            <div className="shrink-0 pl-2">
              <TimelineIllustration className="w-16 h-16" />
            </div>
          </div>
        </div>
      )}

      {/* Log Symptom Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">Log a Symptom</h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSymptom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {symptomCategories.map((cat) => (
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

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Symptom Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brain fog, Post-exertional crash, Migraine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#132A1F]">Intensity Severity</label>
                  <span className="text-xs font-bold text-[#FF7A24]">{intensity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#FF7A24]"
                />
                <div className="flex justify-between text-[10px] text-[#132A1F]/50 mt-1">
                  <span>1 (Mild flutter)</span>
                  <span>5 (Noticeable impact)</span>
                  <span>10 (Debilitating)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Context Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all ${
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

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Triggers (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standing 20 mins, Missed lunch, Cold wind"
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Detailed Notes & Physical Sensation
                </label>
                <textarea
                  rows={2}
                  placeholder="How did this symptom feel? Did anything provide relief?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  Save Symptom Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
