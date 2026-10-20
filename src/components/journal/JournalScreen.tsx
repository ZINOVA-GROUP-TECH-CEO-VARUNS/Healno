import React, { useState } from 'react';
import { JournalEntry } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  Trash2,
  Edit3,
  ChevronRight,
  Bold,
  Italic,
  List,
  Quote,
  Smile,
  Battery,
  X,
  Check,
  Filter,
} from 'lucide-react';

interface JournalScreenProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onBack?: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(entries[0] || null);

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [moodRating, setMoodRating] = useState<JournalEntry['moodRating']>('Reflective');
  const [energyRating, setEnergyRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>(['Reflection']);
  const [customTagInput, setCustomTagInput] = useState('');

  const moodOptions: { label: JournalEntry['moodRating']; emoji: string }[] = [
    { label: 'Grateful', emoji: '💛' },
    { label: 'Peaceful', emoji: '🕊️' },
    { label: 'Reflective', emoji: '🌿' },
    { label: 'Joyful', emoji: '🌸' },
    { label: 'Tender', emoji: '🕯️' },
    { label: 'Low / Exhausted', emoji: '🌧️' },
    { label: 'Anxious', emoji: '⚡' },
  ];

  const suggestedTags = [
    'Morning Reflection',
    'Evening Wind-Down',
    'Pacing Win',
    'Flare Thoughts',
    'Gratitude',
    'Sensory Rest',
    'Self-Compassion',
    'Doctor Prep',
  ];

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || entry.tags.includes(selectedTag);
    const matchesMood = selectedMood === 'all' || entry.moodRating === selectedMood;
    return matchesSearch && matchesTag && matchesMood;
  });

  const openNewEditor = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setMoodRating('Reflective');
    setEnergyRating(5);
    setTags(['Morning Reflection']);
    setIsEditorOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setDate(entry.date);
    setTime(entry.time);
    setMoodRating(entry.moodRating || 'Reflective');
    setEnergyRating(entry.energyRating || 5);
    setTags(entry.tags || []);
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const entryToSave: JournalEntry = {
      id: editingId || `entry_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date,
      time,
      moodRating,
      energyRating,
      tags,
      createdAt: editingId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveEntry(entryToSave);
    setSelectedEntry(entryToSave);
    setIsEditorOpen(false);
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}${prefix}${suffix}`);
  };

  const insertPrompt = (promptText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${promptText}\n` : `${promptText}\n`));
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Personal Diary & Journal</h2>
          <p className="text-xs text-[#132A1F]/60">Your private sanctuary for thoughts, reflections, and pacing</p>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
            >
              Back
            </button>
          )}
          <button
            onClick={openNewEditor}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write Entry</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search diary by keywords, title, or memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
          />
        </div>

        {/* Tags filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedTag === 'all'
                ? 'bg-[#132A1F] text-white shadow-xs'
                : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
            }`}
          >
            All Tags
          </button>
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTag === tag
                  ? 'bg-[#E89D35] text-white shadow-xs'
                  : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Active Entry Detail Reader Card */}
      {selectedEntry && (
        <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2.5 py-0.5 rounded-full font-bold">
                  {selectedEntry.date} · {selectedEntry.time}
                </span>
                {selectedEntry.moodRating && (
                  <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2.5 py-0.5 rounded-full font-semibold">
                    Mood: {selectedEntry.moodRating}
                  </span>
                )}
                {selectedEntry.energyRating && (
                  <span className="text-[10px] bg-white border border-[#132A1F]/10 text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                    ⚡ {selectedEntry.energyRating}/10
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#132A1F] font-display mt-2">
                {selectedEntry.title}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(selectedEntry)}
                className="w-8 h-8 rounded-full bg-white border border-[#132A1F]/10 flex items-center justify-center text-[#132A1F]/70 hover:text-[#132A1F] transition-colors"
                title="Edit Entry"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this journal entry?')) {
                    onDeleteEntry(selectedEntry.id);
                    setSelectedEntry(entries.find((e) => e.id !== selectedEntry.id) || null);
                  }
                }}
                className="w-8 h-8 rounded-full bg-white border border-[#132A1F]/10 flex items-center justify-center text-[#132A1F]/40 hover:text-red-500 transition-colors"
                title="Delete Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="bg-white rounded-2xl p-4 border border-[#132A1F]/5 text-xs text-[#132A1F]/90 leading-relaxed whitespace-pre-line shadow-xs">
            {selectedEntry.content}
          </div>

          {/* Tags */}
          {selectedEntry.tags && selectedEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedEntry.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-[#2D6A4F] bg-[#E8EFE9] px-2 py-0.5 rounded-md font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chronological History List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
            Diary Entries ({filteredEntries.length})
          </h4>
          <span className="text-[10px] text-[#132A1F]/50">Chronological Archive</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#132A1F]/10 text-xs text-[#132A1F]/60 space-y-2">
            <BookOpen className="w-8 h-8 text-[#132A1F]/30 mx-auto" />
            <div className="font-semibold text-[#132A1F]">No journal entries found</div>
            <p>Write your first gentle reflection to begin your personal diary.</p>
            <button
              onClick={openNewEditor}
              className="mt-2 text-xs bg-[#132A1F] text-white px-3 py-1.5 rounded-full font-semibold inline-block"
            >
              Start Journaling
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedEntry?.id === entry.id
                  ? 'bg-white border-[#132A1F] shadow-xs'
                  : 'bg-white/80 border-[#132A1F]/10 hover:bg-white'
              }`}
            >
              <div className="space-y-1 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#132A1F] font-display truncate">
                    {entry.title}
                  </span>
                  {entry.moodRating && (
                    <span className="text-[9px] bg-[#FFE5D9] text-[#6B4435] px-1.5 py-0.2 rounded-md font-medium shrink-0">
                      {entry.moodRating}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#132A1F]/70 line-clamp-1">
                  {entry.content}
                </p>
                <div className="text-[10px] text-[#132A1F]/40 flex items-center gap-2">
                  <span>{entry.date} · {entry.time}</span>
                  {entry.tags && entry.tags.length > 0 && (
                    <span>· {entry.tags.join(', ')}</span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#132A1F]/40 shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Write / Edit Journal Entry Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                {editingId ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full bg-[#E8EFE9] text-[#132A1F] flex items-center justify-center hover:bg-[#d8e3da] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Entry Title</label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon breath, Pacing victory, Soft thoughts..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none font-semibold text-[#132A1F]"
                  required
                />
              </div>

              {/* Simple Formatting Toolbar & Gentle Prompts */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#E8EFE9] p-1.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1 hover:bg-white rounded font-bold px-2 text-[#132A1F]"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1 hover:bg-white rounded italic px-2 text-[#132A1F]"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n• ')}
                  className="p-1 hover:bg-white rounded px-2 text-[#132A1F]"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n> "')}
                  className="p-1 hover:bg-white rounded px-2 text-[#132A1F]"
                  title="Quote"
                >
                  “ Quote
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      insertPrompt('Reflection: What would feel like genuine physical comfort right now?')
                    }
                    className="text-[10px] bg-white text-[#2D6A4F] px-2 py-0.5 rounded-md font-semibold hover:bg-white/80"
                  >
                    + Comfort Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertPrompt('Gratitude: Name one small sensory detail that brought relief today.')
                    }
                    className="text-[10px] bg-white text-[#E89D35] px-2 py-0.5 rounded-md font-semibold hover:bg-white/80"
                  >
                    + Relief Prompt
                  </button>
                </div>
              </div>

              {/* Content text area */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Journal Reflections & Notes
                </label>
                <textarea
                  rows={6}
                  placeholder="Pour your thoughts freely. No judgment, no rush, your private words are safe..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl p-3 text-xs focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Mood rating */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1.5">
                  How does your emotional body feel? (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {moodOptions.map((m) => (
                    <button
                      type="button"
                      key={m.label}
                      onClick={() => setMoodRating(m.label)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                        moodRating === m.label
                          ? 'bg-[#132A1F] text-white border-[#132A1F] font-bold'
                          : 'bg-white text-[#132A1F]/70 border-[#132A1F]/10'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#132A1F]">
                    Energy Capacity (1 = Depleted, 10 = Rested)
                  </label>
                  <span className="text-xs font-bold text-[#E89D35] tabular-nums font-display">
                    {energyRating} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyRating}
                  onChange={(e) => setEnergyRating(Number(e.target.value))}
                  className="w-full accent-[#E89D35]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1.5">
                  Add Contextual Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestedTags.map((st) => {
                    const isSelected = tags.includes(st);
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => {
                          if (isSelected) {
                            setTags(tags.filter((t) => t !== st));
                          } else {
                            setTags([...tags, st]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                            : 'bg-white text-[#132A1F]/70 border-[#132A1F]/15'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Custom tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customTagInput.trim() && !tags.includes(customTagInput.trim())) {
                          setTags([...tags, customTagInput.trim()]);
                          setCustomTagInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-white border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTagInput.trim() && !tags.includes(customTagInput.trim())) {
                        setTags([...tags, customTagInput.trim()]);
                        setCustomTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#E8EFE9] text-[#132A1F] rounded-xl text-xs font-semibold"
                  >
                    + Tag
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-colors font-display"
              >
                {editingId ? 'Update Diary Entry' : 'Save Diary Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
