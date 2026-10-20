import React, { useState } from 'react';
import { PacingTask, UserProfile } from '../../types';
import {
  BatteryCharging,
  Sliders,
  Plus,
  Sparkles,
  CheckCircle2,
  Trash2,
  HeartHandshake,
  Calendar,
  AlertTriangle,
  Smile,
} from 'lucide-react';

interface PaceScreenProps {
  tasks: PacingTask[];
  dailyCapacity: number;
  remainingSpoons: number;
  onUpdateCapacity: (newCapacity: number) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: PacingTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const PaceScreen: React.FC<PaceScreenProps> = ({
  tasks,
  dailyCapacity,
  remainingSpoons,
  onUpdateCapacity,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'work' | 'personal' | 'care' | 'rest' | 'household'>('personal');
  const [taskSpoonCost, setTaskSpoonCost] = useState(2);
  const [isRestorative, setIsRestorative] = useState(false);
  const [taskTime, setTaskTime] = useState('11:00');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate used spoons
  const totalPlannedSpoons = tasks.reduce((sum, t) => sum + (t.isRestorative ? 0 : t.spoonCost), 0);
  const isOverBudget = remainingSpoons < 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: PacingTask = {
      id: `task_${Date.now()}`,
      title: taskTitle.trim(),
      category: taskCategory,
      spoonCost: isRestorative ? -1 : taskSpoonCost,
      isRestorative,
      completed: false,
      date: todayStr,
      time: taskTime,
    };

    onAddTask(newTask);
    setShowAddTask(false);
    setTaskTitle('');
    setTaskSpoonCost(2);
    setIsRestorative(false);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Energy Pacing (Spoon Theory)</h2>
          <p className="text-xs text-[#132A1F]/60">Budget your daily capacity gently without guilt</p>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Main Spoon Budget Card */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#B7E4C7] uppercase tracking-wider">
            Daily Spoon Allocation
          </span>
          <span className="text-xs text-[#B7E4C7]/80">Adjustable Anytime</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-4xl font-extrabold font-display tabular-nums tracking-tight">
              {remainingSpoons}{' '}
              <span className="text-base font-normal text-[#B7E4C7]">/ {dailyCapacity} spoons remaining</span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Planned tasks: {totalPlannedSpoons} spoons · Rest pauses: {tasks.filter(t => t.isRestorative).length}
            </p>
          </div>

          <div className="text-3xl">🥄</div>
        </div>

        {/* Capacity Slider */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs text-[#B7E4C7] mb-1.5 font-medium">
            <span>Set Today's Estimated Capacity</span>
            <span className="font-bold text-white tabular-nums">{dailyCapacity} Spoons</span>
          </div>
          <input
            type="range"
            min="4"
            max="24"
            value={dailyCapacity}
            onChange={(e) => onUpdateCapacity(Number(e.target.value))}
            className="w-full accent-[#E89D35]"
          />
          <div className="flex justify-between text-[10px] text-white/40 mt-1">
            <span>4 Spoons (Low / Crash Day)</span>
            <span>12 Spoons (Moderate)</span>
            <span>24 Spoons (High)</span>
          </div>
        </div>

        {/* Over-capacity Non-Judgmental Response if exceeded */}
        {isOverBudget && (
          <div className="mt-4 bg-[#E76F51]/20 border border-[#E76F51]/40 rounded-2xl p-3 text-xs text-[#FFE5D9] flex items-start gap-2 animate-in fade-in">
            <HeartHandshake className="w-4 h-4 text-[#F4A261] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">No guilt, friend.</div>
              You’ve scheduled slightly more than your planned spoons. Pacing isn’t a test; it’s an invitation to protect your peace. Can you postpone or simplify one task?
            </div>
          </div>
        )}
      </div>

      {/* Restorative Pause Quick Add */}
      <div className="bg-[#E8EFE9] rounded-2xl p-3.5 flex items-center justify-between border border-[#132A1F]/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#132A1F] text-[#B7E4C7] flex items-center justify-center font-bold">
            🛌
          </div>
          <div>
            <div className="text-xs font-bold text-[#132A1F]">Add 20-Min Rest Block</div>
            <div className="text-[10px] text-[#132A1F]/70">Recharge sensory reserves (+1 Spoon)</div>
          </div>
        </div>

        <button
          onClick={() => {
            onAddTask({
              id: `rest_${Date.now()}`,
              title: '20-Minute Sensory Quiet Pause',
              category: 'rest',
              spoonCost: -1,
              isRestorative: true,
              completed: false,
              date: todayStr,
              time: '14:00',
            });
          }}
          className="text-xs bg-white text-[#132A1F] px-3 py-1.5 rounded-full font-semibold border border-[#132A1F]/10 hover:bg-[#132A1F] hover:text-white transition-colors"
        >
          + Add Rest
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#132A1F] font-display">
            Today's Activities & Spoon Cost
          </h3>
          <span className="text-xs text-[#132A1F]/50">Tap circle when completed</span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                task.completed
                  ? 'bg-[#E8EFE9]/40 border-[#74C69D]/30 opacity-75'
                  : 'border-[#132A1F]/10 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-[#2D6A4F] text-white'
                      : 'border-2 border-[#132A1F]/30 hover:border-[#132A1F]'
                  }`}
                  aria-label={`Mark task ${task.title} complete`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div
                    className={`text-xs font-semibold ${
                      task.completed ? 'line-through text-[#132A1F]/50' : 'text-[#132A1F]'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[10px] text-[#132A1F]/50 flex items-center gap-2 mt-0.5">
                    <span>{task.category}</span>
                    {task.time && <span>· {task.time}</span>}
                    {task.isRestorative && (
                      <span className="text-[#2D6A4F] font-bold">
                        Restorative (+1 Spoon)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${
                    task.isRestorative
                      ? 'bg-[#D8F3DC] text-[#1B4332]'
                      : 'bg-[#F8F6F0] text-[#132A1F]'
                  }`}
                >
                  {task.spoonCost > 0 ? `${task.spoonCost} 🥄` : `+${Math.abs(task.spoonCost)} 🥄`}
                </span>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="text-[#132A1F]/30 hover:text-red-500 p-1"
                  title="Remove activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Add Paced Activity
              </h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery pick-up, Desk work, Gentle walk"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="care">Self-Care & Health</option>
                    <option value="work">Work & Study</option>
                    <option value="household">Household</option>
                    <option value="rest">Rest & Pause</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Planned Time</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#132A1F]">
                    Estimated Spoon Cost (1 = Light, 4 = Heavy)
                  </label>
                  <span className="text-sm font-bold text-[#E89D35] tabular-nums font-display">
                    {taskSpoonCost} Spoons
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  disabled={isRestorative}
                  value={taskSpoonCost}
                  onChange={(e) => setTaskSpoonCost(Number(e.target.value))}
                  className="w-full accent-[#E89D35]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#E8EFE9] rounded-xl">
                <input
                  type="checkbox"
                  id="restCheck"
                  checked={isRestorative}
                  onChange={(e) => setIsRestorative(e.target.checked)}
                  className="w-4 h-4 accent-[#2D6A4F] rounded"
                />
                <label htmlFor="restCheck" className="text-xs text-[#132A1F] font-medium cursor-pointer">
                  This is a restorative rest block (adds +1 Spoon back)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-colors font-display"
              >
                Add to Daily Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
