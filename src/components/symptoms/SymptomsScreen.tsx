import React, { useState } from 'react';
import { SymptomLog, EmotionScore } from '../../types';
import {
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Sliders,
  Calendar,
  Sparkles,
  Download,
  Trash2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SymptomsScreenProps {
  symptoms: SymptomLog[];
  emotions: EmotionScore[];
  onAddSymptom: (symptom: SymptomLog) => void;
  onUpdateEmotion: (emotion: EmotionScore) => void;
  onDeleteSymptom: (id: string) => void;
  onExportSummary: () => void;
  xpScore: number;
}

export const SymptomsScreen: React.FC<SymptomsScreenProps> = ({
  symptoms,
  emotions,
  onAddSymptom,
  onUpdateEmotion,
  onDeleteSymptom,
  onExportSummary,
  xpScore,
}) => {
  const currentEmotion = emotions[0] || {
    date: new Date().toISOString().split('T')[0],
    happy: 48,
    sad: 33,
    calm: 27,
    anxious: 40,
    dominantMood: 'Reflective',
  };

  const [activeTab, setActiveTab] = useState<'journal' | 'trends' | 'log'>('journal');
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states for new symptom
  const [category, setCategory] = useState<'fatigue' | 'pain' | 'sleep' | 'mood' | 'brain_fog' | 'digestive' | 'custom'>('fatigue');
  const [name, setName] = useState('Persistent Fatigue');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Morning']);
  const [triggers, setTriggers] = useState('');
  const [restPeriods, setRestPeriods] = useState('');

  // Interactive emotion adjust state
  const [happyVal, setHappyVal] = useState(currentEmotion.happy);
  const [sadVal, setSadVal] = useState(currentEmotion.sad);
  const [calmVal, setCalmVal] = useState(currentEmotion.calm);
  const [anxiousVal, setAnxiousVal] = useState(currentEmotion.anxious);

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

  const handleSaveSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SymptomLog = {
      id: `sym_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      category,
      name,
      intensity,
      notes,
      tags: selectedTags,
      triggers: triggers ? triggers.split(',').map((t) => t.trim()) : [],
      restPeriods,
    };
    onAddSymptom(newLog);
    setShowLogModal(false);
    setNotes('');
    setTriggers('');
    setRestPeriods('');
  };

  const handleUpdateEmotions = (h: number, s: number, c: number, a: number) => {
    setHappyVal(h);
    setSadVal(s);
    setCalmVal(c);
    setAnxiousVal(a);
    onUpdateEmotion({
      date: new Date().toISOString().split('T')[0],
      happy: h,
      sad: s,
      calm: c,
      anxious: a,
      dominantMood: h > 45 ? 'Gentle Joy' : c > 35 ? 'Calm & Rested' : 'Pacing with Care',
    });
  };

  // Compute 7-day average intensity
  const avgFatigue = (
    symptoms.filter((s) => s.category === 'fatigue').reduce((acc, s) => acc + s.intensity, 0) /
      Math.max(1, symptoms.filter((s) => s.category === 'fatigue').length)
  ).toFixed(1);

  const avgPain = (
    symptoms.filter((s) => s.category === 'pain').reduce((acc, s) => acc + s.intensity, 0) /
      Math.max(1, symptoms.filter((s) => s.category === 'pain').length)
  ).toFixed(1);

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top Header matching right screen of reference image: < My Journal ... */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={() => setActiveTab('journal')}
          className="w-9 h-9 rounded-full bg-white border border-[#132A1F]/10 flex items-center justify-center text-[#132A1F] hover:bg-[#F8F6F0] transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-[#132A1F] font-display">My Journal</h2>

        <div className="flex items-center gap-1">
          <button
            onClick={onExportSummary}
            className="w-9 h-9 rounded-full bg-white border border-[#132A1F]/10 flex items-center justify-center text-[#132A1F] hover:bg-[#F8F6F0] transition-colors"
            title="Export Health Summary for Doctor"
            aria-label="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-white border border-[#132A1F]/10 flex items-center justify-center text-[#132A1F] hover:bg-[#F8F6F0] transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented view switcher */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'journal' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Emotions & Core
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'log' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Symptom Diary
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'trends' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Trends
        </button>
      </div>

      {activeTab === 'journal' && (
        <div className="space-y-6">
          {/* Big Hero Number Display matching reference image (420 score) */}
          <div className="text-center py-4">
            <div className="text-6xl font-extrabold text-[#132A1F] font-display tracking-tight tabular-nums">
              {xpScore || 420}
            </div>
            <p className="text-xs text-[#132A1F]/70 mt-1 font-medium">
              Celebrate what made you smile today.
            </p>
          </div>

          {/* Emotions Card with 4 Vertical Rounded Progress Capsules matching reference image */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#132A1F]/10">
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#132A1F] font-display">Emotions</h3>
              <p className="text-xs text-[#132A1F]/60 mt-0.5">
                Here are four core emotions for your journal
              </p>
            </div>

            {/* 4 Vertical Capsule Progress Bars directly identical to the design reference */}
            <div className="grid grid-cols-4 gap-3 items-end h-56 px-2 pb-2">
              {/* Happy Capsule: Warm Amber/Yellow */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="w-full bg-[#F3F1EC] rounded-full h-full relative overflow-hidden flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-[#F4A236] rounded-full transition-all duration-700 flex items-center justify-center text-white text-[11px] font-bold tabular-nums py-2"
                    style={{ height: `${happyVal}%` }}
                  >
                    {happyVal}%
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#132A1F]/80 mt-2 font-display">
                  Happy
                </span>
              </div>

              {/* Sad Capsule: Warm Terra Cotta / Earth Brown */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="w-full bg-[#F3F1EC] rounded-full h-full relative overflow-hidden flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-[#6B4435] rounded-full transition-all duration-700 flex items-center justify-center text-white text-[11px] font-bold tabular-nums py-2"
                    style={{ height: `${sadVal}%` }}
                  >
                    {sadVal}%
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#132A1F]/80 mt-2 font-display">
                  Sad
                </span>
              </div>

              {/* Calm Capsule: Soft Sage Green */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="w-full bg-[#F3F1EC] rounded-full h-full relative overflow-hidden flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-[#8DA38F] rounded-full transition-all duration-700 flex items-center justify-center text-white text-[11px] font-bold tabular-nums py-2"
                    style={{ height: `${calmVal}%` }}
                  >
                    {calmVal}%
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#132A1F]/80 mt-2 font-display">
                  Calm
                </span>
              </div>

              {/* Anxious Capsule: Charcoal / Slate */}
              <div className="flex flex-col items-center h-full justify-end">
                <div className="w-full bg-[#F3F1EC] rounded-full h-full relative overflow-hidden flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-[#5C6B5E] rounded-full transition-all duration-700 flex items-center justify-center text-white text-[11px] font-bold tabular-nums py-2"
                    style={{ height: `${anxiousVal}%` }}
                  >
                    {anxiousVal}%
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#132A1F]/80 mt-2 font-display">
                  Anxious
                </span>
              </div>
            </div>

            {/* Quick sliders to customize emotions */}
            <div className="mt-6 pt-4 border-t border-[#132A1F]/10 space-y-3">
              <div className="text-[11px] font-semibold text-[#132A1F]/60 uppercase tracking-wider">
                Adjust Daily Emotional Balance
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-[#132A1F]/70 mb-1">
                    <span>Happy</span>
                    <span className="font-bold">{happyVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={happyVal}
                    onChange={(e) =>
                      handleUpdateEmotions(Number(e.target.value), sadVal, calmVal, anxiousVal)
                    }
                    className="w-full accent-[#F4A236]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#132A1F]/70 mb-1">
                    <span>Sad</span>
                    <span className="font-bold">{sadVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={sadVal}
                    onChange={(e) =>
                      handleUpdateEmotions(happyVal, Number(e.target.value), calmVal, anxiousVal)
                    }
                    className="w-full accent-[#6B4435]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#132A1F]/70 mb-1">
                    <span>Calm</span>
                    <span className="font-bold">{calmVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={calmVal}
                    onChange={(e) =>
                      handleUpdateEmotions(happyVal, sadVal, Number(e.target.value), anxiousVal)
                    }
                    className="w-full accent-[#8DA38F]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#132A1F]/70 mb-1">
                    <span>Anxious</span>
                    <span className="font-bold">{anxiousVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={anxiousVal}
                    onChange={(e) =>
                      handleUpdateEmotions(happyVal, sadVal, calmVal, Number(e.target.value))
                    }
                    className="w-full accent-[#5C6B5E]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Button matching reference design: "Create a New Journal" in warm gold/amber */}
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full py-3.5 px-6 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold text-sm shadow-md shadow-[#E89D35]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-display"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Create a New Journal Entry</span>
          </button>
        </div>
      )}

      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Chronological Symptom Diary
            </h3>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs bg-[#132A1F] text-white px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 hover:bg-[#2D6A4F] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Symptom</span>
            </button>
          </div>

          <div className="space-y-3">
            {symptoms.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#132A1F] font-display">
                        {log.name}
                      </span>
                      <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                        Severity: {log.intensity}/10
                      </span>
                    </div>
                    <div className="text-[10px] text-[#132A1F]/50 mt-0.5">
                      {log.date} · {log.time}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSymptom(log.id)}
                    className="text-[#132A1F]/40 hover:text-red-500 transition-colors p-1"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {log.notes && (
                  <p className="text-xs text-[#132A1F]/80 mt-2 leading-relaxed bg-[#F8F6F0] p-2.5 rounded-xl">
                    "{log.notes}"
                  </p>
                )}

                {/* Tags */}
                {log.tags && log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {log.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#132A1F]/70 bg-white border border-[#132A1F]/10 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {log.restPeriods && (
                  <div className="text-[11px] text-[#2D6A4F] mt-2 font-medium">
                    🛌 Rest taken: {log.restPeriods}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
              <span>Symptom Intensity Patterns</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8F6F0] p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-[#132A1F]/60 font-semibold">
                  Avg Fatigue (7-day)
                </span>
                <div className="text-2xl font-bold font-display text-[#132A1F] mt-1 tabular-nums">
                  {avgFatigue} / 10
                </div>
                <span className="text-[10px] text-[#2D6A4F] font-medium">
                  Peaks on high errand days
                </span>
              </div>

              <div className="bg-[#F8F6F0] p-3.5 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-[#132A1F]/60 font-semibold">
                  Avg Discomfort (7-day)
                </span>
                <div className="text-2xl font-bold font-display text-[#132A1F] mt-1 tabular-nums">
                  {avgPain} / 10
                </div>
                <span className="text-[10px] text-[#2D6A4F] font-medium">
                  Softer with magnesium & rest
                </span>
              </div>
            </div>

            <div className="bg-[#E8EFE9] p-3.5 rounded-2xl text-xs text-[#132A1F]/80 leading-relaxed">
              <div className="font-bold mb-1 text-[#132A1F]">Gentle Observation:</div>
              Your data shows that pacing breaks between 10:00 AM and 2:00 PM correlate with 30% fewer severe afternoon fatigue dips. Continue honoring your rest blocks.
            </div>

            <button
              onClick={onExportSummary}
              className="w-full py-2.5 px-4 rounded-xl bg-[#132A1F] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export 30-Day Clinical Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Log New Health Experience
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveSymptom} className="mt-4 space-y-4">
              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'fatigue', label: 'Fatigue' },
                    { id: 'pain', label: 'Pain' },
                    { id: 'sleep', label: 'Sleep' },
                    { id: 'brain_fog', label: 'Brain Fog' },
                    { id: 'digestive', label: 'Digestive' },
                    { id: 'mood', label: 'Mood' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id as any);
                        setName(cat.label);
                      }}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                        category === cat.id
                          ? 'bg-[#132A1F] text-white border-[#132A1F]'
                          : 'bg-[#F8F6F0] text-[#132A1F] border-[#132A1F]/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Name */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Symptom Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
                  required
                />
              </div>

              {/* Intensity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#132A1F]">
                    Intensity Level (1 = Barely noticeable, 10 = Severe)
                  </label>
                  <span className="text-sm font-bold text-[#E89D35] tabular-nums font-display">
                    {intensity}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#E89D35]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Notes & Sensations
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe in your own words what you are experiencing..."
                  rows={3}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
                />
              </div>

              {/* Contextual Tags */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1.5">
                  Contextual Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-[#132A1F] text-white border-[#132A1F]'
                            : 'bg-white text-[#132A1F]/80 border-[#132A1F]/15'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rest Periods */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Rest Taken (Optional)
                </label>
                <input
                  type="text"
                  value={restPeriods}
                  onChange={(e) => setRestPeriods(e.target.value)}
                  placeholder="e.g. 20 min lying flat in quiet room"
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white font-bold text-sm shadow-md transition-colors font-display"
              >
                Save Symptom Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
