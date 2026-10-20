import React from 'react';
import { UserProfile, SymptomLog, Medication, EmotionScore, Appointment } from '../../types';
import { Printer, Download, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  symptoms: SymptomLog[];
  medications: Medication[];
  emotions: EmotionScore[];
  appointments: Appointment[];
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  profile,
  symptoms,
  medications,
  emotions,
  appointments,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const nextApt = appointments.find((a) => !a.completed);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#132A1F]/10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Action Bar */}
        <div className="p-4 bg-[#132A1F] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm font-display">Healno Clinical Visit Brief</span>
            <span className="text-[10px] bg-[#B7E4C7]/20 text-[#B7E4C7] px-2 py-0.5 rounded-full">
              Print-Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#132A1F] bg-white print:p-0 print:m-0">
          {/* Header */}
          <div className="border-b pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-bold font-display tracking-tight text-[#132A1F]">
                Patient Health & Functional Summary
              </div>
              <div className="text-xs text-[#132A1F]/70 mt-0.5">
                Prepared via Healno Health Companion · Generated {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold">{profile.name}</div>
              <div className="text-[#132A1F]/60">Age: {profile.age || 32} · {profile.gender || 'Patient'}</div>
            </div>
          </div>

          {/* Chronic Conditions & Baseline */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#132A1F]/10">
              <div className="font-bold text-[#132A1F] uppercase tracking-wider text-[10px] mb-1">
                Documented Conditions
              </div>
              <p className="font-medium text-[#132A1F]">
                {profile.conditions.join(', ') || 'Under clinical investigation'}
              </p>
            </div>

            <div className="bg-[#F8F6F0] p-3 rounded-xl border border-[#132A1F]/10">
              <div className="font-bold text-[#132A1F] uppercase tracking-wider text-[10px] mb-1">
                Known Allergies
              </div>
              <p className="font-medium text-[#6B4435]">
                {profile.allergies.join(', ') || 'No known drug allergies reported'}
              </p>
            </div>
          </div>

          {/* Current Active Medications */}
          <div>
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
              Current Medications & Daily Regimen
            </h4>
            <div className="border border-[#132A1F]/15 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F8F6F0] text-[#132A1F]/70 font-semibold border-b border-[#132A1F]/15">
                  <tr>
                    <th className="p-2.5">Medication</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Schedule</th>
                    <th className="p-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132A1F]/10">
                  {medications.map((m) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-bold">{m.name}</td>
                      <td className="p-2.5">{m.dosage}</td>
                      <td className="p-2.5">{m.timeSlot}</td>
                      <td className="p-2.5 text-[#132A1F]/80">{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Symptom Observations */}
          <div>
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
              Recent Symptom & Functional Logs (Last 14 Days)
            </h4>
            <div className="space-y-2">
              {symptoms.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="bg-[#F8F6F0] p-3 rounded-xl text-xs flex justify-between items-start border border-[#132A1F]/5"
                >
                  <div>
                    <div className="font-bold text-[#132A1F]">
                      {s.name} (Severity: {s.intensity}/10)
                    </div>
                    <div className="text-[#132A1F]/80 mt-0.5">"{s.notes}"</div>
                    {s.restPeriods && (
                      <div className="text-[10px] text-[#2D6A4F] mt-1">
                        Rest intervention: {s.restPeriods}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#132A1F]/50 whitespace-nowrap pl-2">
                    {s.date} {s.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Talking Points if prepared */}
          {nextApt && nextApt.talkingPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
                Patient Priority Questions for This Visit
              </h4>
              <div className="bg-[#FFFDF9] border border-[#E89D35]/30 p-3.5 rounded-xl space-y-1.5 text-xs text-[#132A1F]">
                {nextApt.doctorQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-[#E89D35]">Q{idx + 1}:</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer footer */}
          <div className="border-t pt-3 text-[10px] text-[#132A1F]/60 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#132A1F]/40 shrink-0 mt-0.5" />
            <span>
              This document is compiled from user self-reported tracking in Healno to facilitate productive clinical dialogue. It does not replace clinical laboratory certifications or official diagnostic reports.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
