import React, { useState } from 'react';
import { Appointment, CareProvider, SymptomLog, Medication } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileCheck,
  Search,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { defaultCareProviders } from '../../services/storage';
import { apiService } from '../../services/api';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  recentSymptoms: SymptomLog[];
  medications: Medication[];
  onSaveAppointment: (apt: Appointment) => void;
  onBack: () => void;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  recentSymptoms,
  medications,
  onSaveAppointment,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'finder' | 'outreach'>('appointments');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(appointments[0] || null);
  const [searchCareQuery, setSearchCareQuery] = useState('');
  const [careTypeFilter, setCareTypeFilter] = useState<string>('all');
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);

  // Outreach assistance generator state
  const [outreachPurpose, setOutreachPurpose] = useState<'book' | 'reschedule' | 'ask_test'>('book');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const filteredProviders = defaultCareProviders.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchCareQuery.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchCareQuery.toLowerCase());
    const matchesType = careTypeFilter === 'all' || p.type === careTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleGenerateDoctorPrep = async (apt: Appointment) => {
    setIsGeneratingPrep(true);
    try {
      const prep = await apiService.generateDoctorPrep(
        apt,
        recentSymptoms,
        medications,
        apt.clinicalNotes
      );

      const updated: Appointment = {
        ...apt,
        talkingPoints: prep.talkingPoints || apt.talkingPoints,
        doctorQuestions: prep.questionsForDoctor || apt.doctorQuestions,
      };

      onSaveAppointment(updated);
      setSelectedApt(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  const generateOutreachScript = () => {
    if (outreachPurpose === 'book') {
      setGeneratedScript(
        `"Hello, my name is Jose Maria and I am calling to schedule an appointment with Dr. Evelyn Vance regarding ongoing dysautonomia and fatigue management. I am looking for a morning slot on a Tuesday or Thursday when my cognitive energy is highest. Do you have any availability within the next 4 weeks?"`
      );
    } else if (outreachPurpose === 'reschedule') {
      setGeneratedScript(
        `"Hello, I am calling regarding my upcoming appointment on October 28th with Dr. Vance. I am experiencing a severe symptom flare and need to reschedule to a later date when I can safely travel. Could we look at dates two weeks from now?"`
      );
    } else {
      setGeneratedScript(
        `"Hello, I am calling to check if my recent lab panel (Ferritin and Vitamin D) ordered on October 5th has been reviewed by the clinician, and if there are any next steps or prescription instructions added to my chart."`
      );
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Appointments & Care Coordination</h2>
          <p className="text-xs text-[#132A1F]/60">Clinician preparation briefs & verified care discovery</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'appointments' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          My Visits ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('finder')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'finder' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Local Care Finder
        </button>
        <button
          onClick={() => setActiveTab('outreach')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'outreach' ? 'bg-white text-[#132A1F] shadow-xs' : 'text-[#132A1F]/60'
          }`}
        >
          Call Scripts
        </button>
      </div>

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {selectedApt && (
            <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-[#E89D35] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Next Consultation
                  </span>
                  <h3 className="text-base font-bold text-[#132A1F] font-display mt-2">
                    {selectedApt.provider}
                  </h3>
                  <p className="text-xs text-[#132A1F]/70">
                    {selectedApt.specialty} · {selectedApt.location}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#132A1F] tabular-nums">
                    {selectedApt.date}
                  </div>
                  <div className="text-xs text-[#132A1F]/60">{selectedApt.time}</div>
                </div>
              </div>

              {/* Purpose */}
              <div className="bg-[#F8F6F0] p-3 rounded-2xl text-xs text-[#132A1F]/80">
                <span className="font-bold text-[#132A1F]">Visit Purpose: </span>
                {selectedApt.purpose}
              </div>

              {/* Doctor Prep Brief Generator */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Clinician Talking Points ({selectedApt.talkingPoints.length})</span>
                  </h4>

                  <button
                    onClick={() => handleGenerateDoctorPrep(selectedApt)}
                    disabled={isGeneratingPrep}
                    className="text-xs bg-[#132A1F] text-white px-3 py-1 rounded-full font-medium hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
                  >
                    {isGeneratingPrep ? 'Synthesizing...' : 'Re-generate Brief'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  {selectedApt.talkingPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#132A1F]/10 rounded-xl p-2.5 text-xs text-[#132A1F]/85 flex items-start gap-2"
                    >
                      <span className="text-[#2D6A4F] font-bold">{idx + 1}.</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to Ask Doctor */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider">
                  Top Questions For Clinician
                </h4>
                <div className="space-y-1.5">
                  {selectedApt.doctorQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFE5D9]/40 border border-[#F4A261]/20 rounded-xl p-2.5 text-xs text-[#6B4435] flex items-start gap-2"
                    >
                      <span className="font-bold">?</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appointment list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#132A1F] px-1 uppercase tracking-wider">
              All Scheduled Appointments
            </h4>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => setSelectedApt(apt)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedApt?.id === apt.id
                    ? 'bg-white border-[#132A1F] shadow-xs'
                    : 'bg-white/80 border-[#132A1F]/10 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#132A1F]">{apt.provider}</div>
                  <div className="text-[10px] text-[#132A1F]/60">
                    {apt.date} at {apt.time} · {apt.purpose}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#132A1F]/40" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finder' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-[#132A1F]/10 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search nearby clinics, labs, dysautonomia specialists..."
                value={searchCareQuery}
                onChange={(e) => setSearchCareQuery(e.target.value)}
                className="w-full bg-[#F8F6F0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {['all', 'Specialist', 'Clinic', 'Lab', 'Hospital'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCareTypeFilter(type)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                    careTypeFilter === type
                      ? 'bg-[#132A1F] text-white'
                      : 'bg-[#F8F6F0] text-[#132A1F]/70'
                  }`}
                >
                  {type === 'all' ? 'All Providers' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-2.5">
            {filteredProviders.map((prov) => (
              <div
                key={prov.id}
                className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#132A1F]">{prov.name}</h4>
                      {prov.verified && (
                        <span className="text-[9px] bg-[#D8F3DC] text-[#1B4332] px-1.5 py-0.2 rounded-md font-bold">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#132A1F]/60 mt-0.5">{prov.specialty}</p>
                  </div>

                  <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                    {prov.distanceMiles} mi away
                  </span>
                </div>

                <div className="text-xs text-[#132A1F]/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#132A1F]/40 shrink-0" />
                  <span>{prov.address}</span>
                </div>

                <div className="text-xs text-[#132A1F]/70 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#132A1F]/40 shrink-0" />
                  <span>{prov.phone}</span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#132A1F]/5">
                  <span className="text-[11px] text-[#2D6A4F] font-semibold">
                    ★ {prov.rating} patient review rating
                  </span>

                  <a
                    href={`tel:${prov.phone.replace(/\D/g, '')}`}
                    className="text-xs bg-[#132A1F] text-white px-3 py-1 rounded-full font-medium hover:bg-[#2D6A4F] transition-colors"
                  >
                    Call Office
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'outreach' && (
        <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Clinician Communication & Call Scripts
            </h3>
            <p className="text-xs text-[#132A1F]/60 mt-0.5">
              Phone calls while experiencing fatigue or brain fog can feel exhausting. Use these tailored scripts.
            </p>
          </div>

          {/* Purpose buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'book', label: 'Schedule Visit' },
              { id: 'reschedule', label: 'Flare Reschedule' },
              { id: 'ask_test', label: 'Test Results' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setOutreachPurpose(p.id as any);
                  setGeneratedScript(null);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors text-center ${
                  outreachPurpose === p.id
                    ? 'bg-[#132A1F] text-white'
                    : 'bg-[#F8F6F0] text-[#132A1F]/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={generateOutreachScript}
            className="w-full py-2.5 rounded-xl bg-[#E89D35] hover:bg-[#d88d25] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Clear Call Script</span>
          </button>

          {generatedScript && (
            <div className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#132A1F]/10 space-y-2 animate-in fade-in">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#132A1F]/70">
                Read or customize this during your phone call:
              </div>
              <p className="text-xs text-[#132A1F] leading-relaxed italic">
                {generatedScript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
