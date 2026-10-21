import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalTask } from '../../types';
import { storageService } from '../../services/storage';
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
  Smile,
  Battery,
  X,
  Check,
  CheckCircle2,
  CheckSquare,
  Square,
  Filter,
  Flame,
} from 'lucide-react';
import { DiaryJournalIllustration, EmptyStateIllustration } from '../common/CodeIllustrations';

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
  const [activeTab, setActiveTab] = useState<'diary' | 'tasks'>('diary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(entries[0] || null);

  // Personal Tasks state from storageService
  const [tasks, setTasks] = useState<JournalTask[]>(() => storageService.getJournalTasks());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [moodRating, setMoodRating] = useState<JournalEntry['moodRating']>('Reflective');
  const [energyRating, setEnergyRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>(['Morning Reflection']);
  const [customTagInput, setCustomTagInput] = useState('');

  const moodOptions: { label: JournalEntry['moodRating']; color: string }[] = [
    { label: 'Grateful', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { label: 'Peaceful', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { label: 'Reflective', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { label: 'Joyful', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { label: 'Tender', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    { label: 'Low / Exhausted', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { label: 'Anxious', color: 'bg-purple-100 text-purple-800 border-purple-300' },
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
    return matchesSearch && matchesTag;
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: JournalTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: newTaskPriority,
      completed: false,
    };

    storageService.saveJournalTask(task);
    setTasks(storageService.getJournalTasks());
    setNewTaskTitle('');
  };

  const handleToggleTask = (id: string) => {
    storageService.toggleJournalTask(id);
    setTasks(storageService.getJournalTasks());
  };

  const handleDeleteTask = (id: string) => {
    storageService.deleteJournalTask(id);
    setTasks(storageService.getJournalTasks());
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF7A24]" />
            <span>Personal Diary & Journal</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">Your private sanctuary for thoughts, reflections, and personal tasks</p>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Write Entry</span>
          </button>
        </div>
      </div>

      {/* Segmented switcher: Diary vs Personal Tasks */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('diary')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'diary' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Diary & Entries
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tasks' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Personal Tasks ({tasks.filter((t) => !t.completed).length})
        </button>
      </div>

      {/* TAB 1: DIARY & ENTRIES */}
      {activeTab === 'diary' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search diary by keywords, title, or memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]"
              />
            </div>

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
                      ? 'bg-[#FF7A24] text-white shadow-xs'
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
                      <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] border border-[#FFE0C8] px-2.5 py-0.5 rounded-full font-semibold">
                        Mood: {selectedEntry.moodRating}
                      </span>
                    )}
                    {selectedEntry.energyRating && (
                      <span className="text-[10px] bg-white border border-[#132A1F]/10 text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                        Energy: {selectedEntry.energyRating}/10
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

              <div className="text-xs text-[#132A1F]/85 leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-2xl border border-[#132A1F]/5">
                {selectedEntry.content}
              </div>

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedEntry.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#F8F6F0] text-[#132A1F]/70 px-2 py-0.5 rounded-md font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chronological History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#132A1F] flex items-center justify-between">
              <span>Chronological History</span>
              <span className="text-[#132A1F]/50 font-normal">{filteredEntries.length} entries</span>
            </h4>

            {filteredEntries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
                <DiaryJournalIllustration className="w-20 h-20 mx-auto" />
                <h4 className="text-sm font-bold text-[#132A1F] font-display">Your diary is waiting</h4>
                <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                  Write reflections on your pacing, feelings, flare thoughts, or peaceful moments. Entries remain private and securely saved.
                </p>
                <button
                  onClick={openNewEditor}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Write First Diary Entry</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEntries.map((entry) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between hover:shadow-xs ${
                        isSelected
                          ? 'border-[#FF7A24] ring-1 ring-[#FF7A24]'
                          : 'border-[#132A1F]/10 hover:border-[#132A1F]/20'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#132A1F]/50 font-medium">
                            {entry.date} · {entry.time}
                          </span>
                          {entry.moodRating && (
                            <span className="text-[9px] bg-[#FFF4EB] text-[#FF7A24] px-1.5 py-0.2 rounded font-semibold">
                              {entry.moodRating}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#132A1F] truncate">{entry.title}</h4>
                        <p className="text-[11px] text-[#132A1F]/60 line-clamp-1">{entry.content}</p>
                      </div>

                      <div className="shrink-0 text-[#132A1F]/40">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#132A1F] font-display">Create Personal Task</h4>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Schedule blood panel, 15m horizontal rest, Refill ginger tea..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#132A1F] outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
              <EmptyStateIllustration type="tasks" />
              <h4 className="text-sm font-bold text-[#132A1F] font-display">No personal tasks yet</h4>
              <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                Add low-pressure personal reminders, gentle pacing objectives, or medicine tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                    task.completed
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-[#132A1F]/10 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-[#132A1F]/30 hover:border-[#FF7A24]'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <span
                        className={`text-xs font-semibold block truncate ${
                          task.completed ? 'line-through text-[#132A1F]/40' : 'text-[#132A1F]'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[#132A1F]/50 mt-0.5">
                        <span>{task.date}</span>
                        {task.priority && (
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-full text-[#132A1F]/40 hover:text-red-500 hover:bg-red-50 transition-colors ml-2"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg max-h-[92vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {editingId ? 'Edit Diary Entry' : 'New Diary Entry'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">Entry Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon rest notes, Celebrating 5 days of pacing..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Mood State</label>
                <div className="flex flex-wrap gap-1.5">
                  {moodOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => setMoodRating(opt.label)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition-all ${
                        moodRating === opt.label
                          ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-xs'
                          : `${opt.color} hover:opacity-80`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#132A1F]">Energy Level</label>
                  <span className="text-xs font-bold text-[#FF7A24]">{energyRating} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyRating}
                  onChange={(e) => setEnergyRating(Number(e.target.value))}
                  className="w-full accent-[#FF7A24]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border transition-all ${
                        tags.includes(tag)
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
                  Thoughts & Journal Content
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Pour your heart out, record physical sensations, or note gentle wins..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
