import React, { useState } from 'react';
import { Medication, MedicationEvent } from '../../types';
import {
  Pill,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  AlertTriangle,
  Calendar,
  Sparkles,
  Trash2,
  Info,
} from 'lucide-react';

interface MedsScreenProps {
  medications: Medication[];
  medEvents: MedicationEvent[];
  onSaveMedication: (med: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onRecordMedEvent: (event: MedicationEvent) => void;
}

export const MedsScreen: React.FC<MedsScreenProps> = ({
  medications,
  medEvents,
  onSaveMedication,
  onDeleteMedication,
  onRecordMedEvent,
}) => {
  const [activeSection, setActiveSection] = useState<'today' | 'all' | 'refills'>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // New med form state
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'As Needed'>('Morning');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [instructions, setInstructions] = useState('');
  const [isAsNeeded, setIsAsNeeded] = useState(false);
  const [category, setCategory] = useState<'Prescription' | 'Supplement' | 'OTC'>('Prescription');
  const [supplyCount, setSupplyCount] = useState<number>(30);
  const [refillReminder, setRefillReminder] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStatusChange = (medId: string, timeSlotStr: string, status: 'taken' | 'skipped' | 'snoozed') => {
    onRecordMedEvent({
      id: `me_${Date.now()}`,
      medicationId: medId,
      date: todayStr,
      timeSlot: timeSlotStr,
      status,
      recordedAt: new Date().toTimeString().slice(0, 5),
    });
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: medName.trim(),
      dosage: dosage.trim() || 'Standard Dose',
      scheduleTimes: [scheduleTime],
      timeSlot,
      instructions: instructions.trim() || 'Take as advised with water.',
      isAsNeeded,
      category,
      currentSupply: supplyCount,
      refillReminder,
      refillDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };

    onSaveMedication(newMed);
    setShowAddModal(false);
    setMedName('');
    setDosage('');
    setInstructions('');
  };

  // Group medications by timeSlot
  const timeSlots: ('Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'As Needed')[] = [
    'Morning',
    'Afternoon',
    'Evening',
    'Bedtime',
    'As Needed',
  ];

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Medication & Supplements</h2>
          <p className="text-xs text-[#132A1F]/60">Schedules, taken records, and refill alerts</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Med</span>
        </button>
      </div>

      {/* Clinical safety notice */}
      <div className="bg-[#E8EFE9] rounded-2xl p-3 text-xs text-[#132A1F]/80 flex items-start gap-2 border border-[#132A1F]/5">
        <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <span>
          Always consult your pharmacist or prescribing clinician regarding medication changes, dosage adjustments, or interactions.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveSection('today')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeSection === 'today' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Today's Schedule
        </button>
        <button
          onClick={() => setActiveSection('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeSection === 'all' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          All Items ({medications.length})
        </button>
        <button
          onClick={() => setActiveSection('refills')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeSection === 'refills' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Refill Alerts
        </button>
      </div>

      {activeSection === 'today' && (
        <div className="space-y-5">
          {timeSlots.map((slot) => {
            const slotMeds = medications.filter((m) => m.timeSlot === slot);
            if (slotMeds.length === 0) return null;

            return (
              <div key={slot} className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#132A1F]/70 flex items-center justify-between px-1">
                  <span>{slot}</span>
                  <span className="text-[10px] text-[#132A1F]/40 font-normal">
                    {slotMeds.length} {slotMeds.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {slotMeds.map((med) => {
                    const event = medEvents.find(
                      (e) => e.medicationId === med.id && e.date === todayStr && e.timeSlot === slot
                    );
                    const status = event?.status || 'pending';

                    return (
                      <div
                        key={med.id}
                        className={`bg-white rounded-2xl p-4 border transition-all ${
                          status === 'taken'
                            ? 'border-[#74C69D]/40 bg-[#E8EFE9]/30'
                            : status === 'skipped'
                            ? 'border-gray-200 bg-gray-50/50'
                            : 'border-[#132A1F]/10 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-bold font-display ${
                                  status === 'taken'
                                    ? 'line-through text-[#132A1F]/60'
                                    : 'text-[#132A1F]'
                                }`}
                              >
                                {med.name}
                              </h4>
                              <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                                {med.dosage}
                              </span>
                              <span className="text-[10px] text-[#132A1F]/50 font-medium">
                                {med.category}
                              </span>
                            </div>

                            <p className="text-xs text-[#132A1F]/70 mt-1">
                              {med.instructions}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                status === 'taken'
                                  ? 'bg-[#D8F3DC] text-[#1B4332]'
                                  : status === 'skipped'
                                  ? 'bg-gray-200 text-gray-700'
                                  : status === 'snoozed'
                                  ? 'bg-[#FFE5D9] text-[#6B4435]'
                                  : 'bg-[#F8F6F0] text-[#132A1F]/70 border border-[#132A1F]/10'
                              }`}
                            >
                              {status === 'taken'
                                ? '✓ Taken'
                                : status === 'skipped'
                                ? 'Skipped'
                                : status === 'snoozed'
                                ? 'Snoozed'
                                : 'Pending'}
                            </span>
                            {event?.recordedAt && (
                              <div className="text-[9px] text-[#132A1F]/40 mt-1">
                                at {event.recordedAt}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#132A1F]/5">
                          <button
                            onClick={() => handleStatusChange(med.id, slot, 'taken')}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                              status === 'taken'
                                ? 'bg-[#2D6A4F] text-white'
                                : 'bg-[#E8EFE9] hover:bg-[#d8e3da] text-[#132A1F]'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Taken</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(med.id, slot, 'snoozed')}
                            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                              status === 'snoozed'
                                ? 'bg-[#FFE5D9] border-[#E76F51] text-[#6B4435]'
                                : 'border-[#132A1F]/10 text-[#132A1F]/70 hover:bg-[#F8F6F0]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            <span>Snooze</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange(med.id, slot, 'skipped')}
                            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                              status === 'skipped'
                                ? 'bg-gray-200 border-gray-400 text-gray-800'
                                : 'border-[#132A1F]/10 text-[#132A1F]/70 hover:bg-[#F8F6F0]'
                            }`}
                          >
                            <span>Skip</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSection === 'all' && (
        <div className="space-y-3">
          {medications.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#132A1F] font-display">{med.name}</h4>
                  <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                    {med.dosage}
                  </span>
                  <span className="text-[10px] bg-white border border-[#132A1F]/10 text-[#132A1F]/70 px-2 py-0.5 rounded-full font-medium">
                    {med.timeSlot}
                  </span>
                </div>

                <p className="text-xs text-[#132A1F]/70 mt-1">{med.instructions}</p>
                {med.prescriber && (
                  <p className="text-[11px] text-[#132A1F]/50 mt-1">Prescriber: {med.prescriber}</p>
                )}

                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#132A1F]/60">
                  <span>Supply: {med.currentSupply ?? 30} days remaining</span>
                  {med.refillDate && <span>Next refill: {med.refillDate}</span>}
                </div>
              </div>

              <button
                onClick={() => onDeleteMedication(med.id)}
                className="text-[#132A1F]/40 hover:text-red-500 p-1.5 transition-colors"
                title="Remove Medication"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'refills' && (
        <div className="space-y-3">
          <div className="bg-[#FFFDF9] rounded-3xl p-4 border border-[#E89D35]/30">
            <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#E89D35]" />
              <span>Upcoming Pharmacy Refills</span>
            </h3>

            <div className="space-y-2 mt-3">
              {medications
                .filter((m) => (m.currentSupply ?? 30) <= 15)
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#132A1F]/5"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#132A1F]">{m.name}</div>
                      <div className="text-[10px] text-[#E76F51] font-semibold">
                        Only {m.currentSupply} doses remaining (Due {m.refillDate})
                      </div>
                    </div>
                    <button className="text-xs bg-[#132A1F] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#2D6A4F] transition-colors">
                      Request Refill
                    </button>
                  </div>
                ))}
              {medications.filter((m) => (m.currentSupply ?? 30) <= 15).length === 0 && (
                <p className="text-xs text-[#132A1F]/60 py-2">
                  All active medications have adequate supply for the next 15+ days.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Add Medication or Supplement
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Medication or Supplement Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magnesium Glycinate or Fludrocortisone"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#132A1F]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.1 mg or 200 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Supplement">Supplement</option>
                    <option value="OTC">Over-the-Counter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as any)}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="As Needed">As Needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Supply Days</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={supplyCount}
                    onChange={(e) => setSupplyCount(Number(e.target.value))}
                    className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Instructions & Reminders
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take with morning meal and full glass of electrolyte water."
                  rows={2}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-colors font-display"
              >
                Save to Medications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
