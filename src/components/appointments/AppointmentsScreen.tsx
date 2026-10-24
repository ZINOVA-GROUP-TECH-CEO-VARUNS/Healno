import React, { useState } from 'react';
import { Appointment, CareProvider, SymptomLog, Medication } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Search,
  Plus,
  Sparkles,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  Edit2,
  Trash2,
  AlertCircle,
  User,
  Stethoscope,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { apiService } from '../../services/api';

interface AppointmentsScreenProps {
  appointments: Appointment[];
  recentSymptoms: SymptomLog[];
  medications: Medication[];
  onSaveAppointment: (apt: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onBack: () => void;
  userName?: string;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  recentSymptoms,
  medications,
  onSaveAppointment,
  onDeleteAppointment,
  onBack,
  userName = 'Friend',
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'directory' | 'outreach'>('appointments');
  const [providers, setProviders] = useState<CareProvider[]>(() => storageService.getProviders());
  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CareProvider | null>(null);

  // Provider Form fields
  const [provName, setProvName] = useState('');
  const [provType, setProvType] = useState<CareProvider['type']>('Clinic');
  const [provSpecialty, setProvSpecialty] = useState('');
  const [provAddress, setProvAddress] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [timelineTab, setTimelineTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(appointments[0] || null);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);

  // Modal states for creating / editing / rescheduling
  const [showModal, setShowModal] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);

  // Form fields
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Practice / Primary Care');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');

  // Outreach assistance generator state
  const [outreachPurpose, setOutreachPurpose] = useState<'book' | 'reschedule' | 'ask_test'>('book');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const upcomingAppointments = appointments
    .filter((a) => !a.isCancelled && (a.date >= todayStr || !a.completed))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const pastAppointments = appointments
    .filter((a) => a.isCancelled || a.completed || a.date < todayStr)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const displayedList = timelineTab === 'upcoming' ? upcomingAppointments : pastAppointments;


  const openNewAptModal = () => {
    setEditingApt(null);
    setIsRescheduleMode(false);
    setDoctorName('');
    setSpecialty('General Practice / Primary Care');
    setClinicName('');
    setDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setTime('10:00');
    setPurpose('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setIsRescheduleMode(false);
    setDoctorName(apt.doctorName || apt.provider);
    setSpecialty(apt.specialty);
    setClinicName(apt.location);
    setDate(apt.date);
    setTime(apt.time);
    setPurpose(apt.purpose);
    setNotes(apt.clinicalNotes || '');
    setShowModal(true);
  };

  const openRescheduleModal = (apt: Appointment) => {
    setEditingApt(apt);
    setIsRescheduleMode(true);
    setDoctorName(apt.doctorName || apt.provider);
    setSpecialty(apt.specialty);
    setClinicName(apt.location);
    setDate(apt.date);
    setTime(apt.time);
    setPurpose(apt.purpose);
    setNotes(apt.clinicalNotes || '');
    setShowModal(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !date) return;

    if (editingApt) {
      const updated: Appointment = {
        ...editingApt,
        doctorName: doctorName.trim(),
        provider: doctorName.trim(),
        specialty: specialty.trim(),
        location: clinicName.trim() || 'Unspecified Facility',
        date,
        time,
        purpose: purpose.trim() || 'Health consultation',
        clinicalNotes: notes.trim(),
        isRescheduled: isRescheduleMode ? true : editingApt.isRescheduled,
        updatedAt: new Date().toISOString(),
      };
      onSaveAppointment(updated);
      setSelectedApt(updated);
    } else {
      const newApt: Appointment = {
        id: `apt_${Date.now()}`,
        doctorName: doctorName.trim(),
        provider: doctorName.trim(),
        specialty: specialty.trim(),
        location: clinicName.trim() || 'Unspecified Facility',
        date,
        time,
        purpose: purpose.trim() || 'Health consultation',
        reminderSet: true,
        completed: false,
        doctorQuestions: [
          `What are the recommended diagnostic follow-ups for my symptoms?`,
          `Are there lifestyle adjustments or pacing techniques I should prioritize?`,
        ],
        talkingPoints: [
          `Experiencing fatigue and symptom variations across the day.`,
          `Reviewing current medication tolerability.`,
        ],
        clinicalNotes: notes.trim(),
        createdAt: new Date().toISOString(),
      };
      onSaveAppointment(newApt);
      setSelectedApt(newApt);
    }

    setShowModal(false);
  };

  const handleCancelAppointment = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      isCancelled: true,
      updatedAt: new Date().toISOString(),
    };
    onSaveAppointment(updated);
    if (selectedApt?.id === apt.id) {
      setSelectedApt(updated);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    if (onDeleteAppointment) {
      onDeleteAppointment(id);
    } else {
      storageService.deleteAppointment(id);
    }
    if (selectedApt?.id === id) {
      setSelectedApt(null);
    }
  };

  const openNewProviderModal = () => {
    setEditingProvider(null);
    setProvName('');
    setProvType('Clinic');
    setProvSpecialty('');
    setProvAddress('');
    setProvPhone('');
    setShowProviderModal(true);
  };

  const openEditProviderModal = (prov: CareProvider) => {
    setEditingProvider(prov);
    setProvName(prov.name);
    setProvType(prov.type);
    setProvSpecialty(prov.specialty);
    setProvAddress(prov.address);
    setProvPhone(prov.phone);
    setShowProviderModal(true);
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim()) return;

    const provider: CareProvider = {
      id: editingProvider?.id || `prov_${Date.now()}`,
      name: provName.trim(),
      type: provType,
      specialty: provSpecialty.trim(),
      address: provAddress.trim(),
      phone: provPhone.trim(),
      distanceMiles: editingProvider?.distanceMiles || 0,
      rating: editingProvider?.rating || 5,
      verified: editingProvider?.verified || false,
    };

    storageService.saveProvider(provider);
    setProviders(storageService.getProviders());
    setShowProviderModal(false);
  };

  const handleDeleteProvider = (id: string) => {
    if (window.confirm('Delete this care provider from your directory?')) {
      storageService.deleteProvider(id);
      setProviders(storageService.getProviders());
    }
  };

  const filteredProviders = providers.filter((p) => {
    const search = providerSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(search) ||
      p.specialty.toLowerCase().includes(search) ||
      p.type.toLowerCase().includes(search)
    );
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
    const callerName = userName || 'Patient';
    const targetDoc = selectedApt?.doctorName || selectedApt?.provider || 'the clinic';

    if (outreachPurpose === 'book') {
      setGeneratedScript(
        `"Hello, my name is ${callerName} and I am calling to schedule an appointment with ${targetDoc} regarding my chronic symptoms and fatigue management. I am looking for a morning slot when my cognitive energy is highest. Do you have any availability in the upcoming weeks?"`
      );
    } else if (outreachPurpose === 'reschedule') {
      const aptDate = selectedApt ? selectedApt.date : 'my scheduled date';
      setGeneratedScript(
        `"Hello, my name is ${callerName}. I am calling regarding my upcoming appointment on ${aptDate} with ${targetDoc}. I am experiencing a health flare and need to reschedule to a later date when I can safely travel. Could we look at dates two weeks from now?"`
      );
    } else {
      setGeneratedScript(
        `"Hello, my name is ${callerName}. I am calling to check if my recent diagnostic lab results and test reports ordered by ${targetDoc} have been received and reviewed by the clinician, and if any treatment instructions were added to my file."`
      );
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF7A24]" />
            <span>Doctor Appointments & Visits</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">Schedule visits, generate prep briefs, and coordinate clinical care</p>
        </div>

        <button
          onClick={openNewAptModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Visit</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'appointments' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Visits ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'directory' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Hospitals & Labs ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('outreach')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'outreach' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Call Scripts
        </button>
      </div>

      {/* ================= APPOINTMENTS TAB ================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Upcoming vs Past Selector */}
          <div className="flex items-center justify-between border-b border-[#132A1F]/10 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimelineTab('upcoming')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  timelineTab === 'upcoming'
                    ? 'bg-[#132A1F] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                Upcoming Visits ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setTimelineTab('past')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  timelineTab === 'past'
                    ? 'bg-[#132A1F] text-white shadow-xs'
                    : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
                }`}
              >
                Past & Cancelled ({pastAppointments.length})
              </button>
            </div>

            <span className="text-[11px] text-[#132A1F]/50 font-medium">
              {displayedList.length} total
            </span>
          </div>

          {/* Selected Appointment Detailed Card */}
          {selectedApt && (
            <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        selectedApt.isCancelled
                          ? 'bg-red-100 text-red-800'
                          : selectedApt.isRescheduled
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#FF7A24] text-white'
                      }`}
                    >
                      {selectedApt.isCancelled
                        ? 'Cancelled Visit'
                        : selectedApt.isRescheduled
                        ? 'Rescheduled Visit'
                        : 'Scheduled Visit'}
                    </span>
                    {selectedApt.completed && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#132A1F] font-display mt-2 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#FF7A24]" />
                    <span>{selectedApt.doctorName || selectedApt.provider}</span>
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

              {/* Action Controls for this appointment */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#132A1F]/5 flex-wrap">
                <button
                  onClick={() => openEditModal(selectedApt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8F6F0] hover:bg-[#FFE0C8] text-[#132A1F] text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-[#FF7A24]" />
                  <span>Edit Details</span>
                </button>
                {!selectedApt.isCancelled && (
                  <button
                    onClick={() => openRescheduleModal(selectedApt)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFF4EB] hover:bg-[#FFE0C8] text-[#FF7A24] text-xs font-bold border border-[#FFE0C8] transition-colors"
                  >
                    <CalendarCheck className="w-3 h-3" />
                    <span>Reschedule</span>
                  </button>
                )}
                {!selectedApt.isCancelled ? (
                  <button
                    onClick={() => handleCancelAppointment(selectedApt)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                  >
                    <CalendarX className="w-3 h-3" />
                    <span>Cancel Visit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeleteAppointment(selectedApt.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Record</span>
                  </button>
                )}
              </div>

              {/* Purpose & Clinical Notes */}
              <div className="bg-[#F8F6F0] p-3 rounded-2xl text-xs text-[#132A1F]/80 space-y-1">
                <div>
                  <span className="font-bold text-[#132A1F]">Visit Purpose: </span>
                  {selectedApt.purpose}
                </div>
                {selectedApt.clinicalNotes && (
                  <div className="text-[#132A1F]/70 pt-1 border-t border-[#132A1F]/10">
                    <span className="font-bold text-[#132A1F]">Notes: </span>
                    {selectedApt.clinicalNotes}
                  </div>
                )}
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
              {timelineTab === 'upcoming' ? 'Upcoming Schedule' : 'Past & Cancelled Records'}
            </h4>

            {displayedList.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-[#132A1F]/10 space-y-2">
                <Calendar className="w-8 h-8 text-[#FF7A24] mx-auto opacity-70" />
                <h5 className="text-xs font-bold text-[#132A1F]">No {timelineTab} appointments</h5>
                <p className="text-[11px] text-[#132A1F]/60">
                  {timelineTab === 'upcoming'
                    ? 'Schedule follow-up consultations or specialist appointments.'
                    : 'Completed and cancelled appointments will be archived here.'}
                </p>
                {timelineTab === 'upcoming' && (
                  <button
                    onClick={openNewAptModal}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#FF7A24] text-white text-xs font-bold mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Appointment</span>
                  </button>
                )}
              </div>
            ) : (
              displayedList.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedApt(apt)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedApt?.id === apt.id
                      ? 'bg-white border-[#FF7A24] shadow-xs'
                      : 'bg-white/80 border-[#132A1F]/10 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-[#132A1F]">{apt.doctorName || apt.provider}</div>
                      {apt.isCancelled && (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                          Cancelled
                        </span>
                      )}
                      {apt.isRescheduled && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                          Rescheduled
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#132A1F]/60 mt-0.5">
                      {apt.date} at {apt.time} · {apt.specialty} · {apt.location}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#132A1F]/40" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= MY DIRECTORY TAB ================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132A1F] font-display flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FF7A24]" />
                  <span>My Healthcare Directory</span>
                </h3>
                <p className="text-[11px] text-[#132A1F]/60">Manage your manually added hospitals, labs, and specialists</p>
              </div>
              <button
                onClick={openNewProviderModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#132A1F] text-white text-[10px] font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Provider</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search directory by name, specialty, or type..."
                value={providerSearch}
                onChange={(e) => setProviderSearch(e.target.value)}
                className="w-full bg-[#F8F6F0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]/40"
              />
            </div>
          </div>

          {/* Directory list */}
          <div className="space-y-2.5">
            {filteredProviders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-[#132A1F]/10 space-y-2">
                <MapPin className="w-8 h-8 text-[#FF7A24] mx-auto opacity-70" />
                <h5 className="text-xs font-bold text-[#132A1F]">Your directory is empty</h5>
                <p className="text-[11px] text-[#132A1F]/60">
                  Add hospitals, labs, and clinics to quickly reuse them when scheduling visits.
                </p>
                <button
                  onClick={openNewProviderModal}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#FF7A24] text-white text-xs font-bold mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Entry</span>
                </button>
              </div>
            ) : (
              filteredProviders.map((prov) => (
                <div
                  key={prov.id}
                  className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs space-y-2.5 hover:border-[#FF7A24]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-[#E8EFE9] text-[#132A1F] px-1.5 py-0.2 rounded font-bold uppercase">
                          {prov.type}
                        </span>
                        <h4 className="text-xs font-bold text-[#132A1F]">{prov.name}</h4>
                      </div>
                      <p className="text-[11px] text-[#132A1F]/60 mt-0.5">{prov.specialty || 'General Care'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditProviderModal(prov)}
                        className="p-1.5 rounded-full hover:bg-[#F8F6F0] text-[#132A1F]/40 hover:text-[#FF7A24] transition-colors"
                        title="Edit Provider"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(prov.id)}
                        className="p-1.5 rounded-full hover:bg-rose-50 text-[#132A1F]/40 hover:text-rose-600 transition-colors"
                        title="Delete Provider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#132A1F]/70 pt-2 border-t border-[#132A1F]/5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#132A1F]/30 shrink-0" />
                      <span className="truncate">{prov.address || 'No address provided'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#132A1F]/30 shrink-0" />
                      <span>{prov.phone || 'No phone listed'}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        setDoctorName(prov.name);
                        setSpecialty(prov.specialty);
                        setClinicName(prov.address);
                        setActiveTab('appointments');
                        setShowModal(true);
                      }}
                      className="text-[10px] font-bold text-[#FF7A24] hover:underline flex items-center gap-1"
                    >
                      Schedule Visit Here <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= OUTREACH & CALL SCRIPTS TAB ================= */}
      {activeTab === 'outreach' && (
        <div className="bg-white rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#132A1F] font-display">
              Clinician Communication & Call Scripts
            </h3>
            <p className="text-xs text-[#132A1F]/60 mt-0.5">
              Phone calls while experiencing fatigue or brain fog can feel exhausting. Use these personalized scripts tailored for {userName}.
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
            className="w-full py-2.5 rounded-xl bg-[#FF7A24] hover:bg-[#E06516] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
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

      {/* ================= MODAL: ADD / EDIT / RESCHEDULE APPOINTMENT ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {isRescheduleMode
                    ? 'Reschedule Appointment'
                    : editingApt
                    ? 'Edit Appointment'
                    : 'Schedule Doctor Appointment'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {providers.length > 0 && !editingApt && (
                <div className="bg-[#E8EFE9]/50 p-3 rounded-2xl border border-[#132A1F]/5 space-y-1.5">
                  <label className="block text-[10px] font-bold text-[#2D6A4F] uppercase">Quick Select from Directory</label>
                  <select
                    onChange={(e) => {
                      const selected = providers.find(p => p.id === e.target.value);
                      if (selected) {
                        setDoctorName(selected.name);
                        setSpecialty(selected.specialty);
                        setClinicName(selected.address);
                      }
                    }}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-1.5 text-xs outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a saved provider...</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Doctor / Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins, Northwestern Neuro"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dysautonomia, Cardiology, Primary Care"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">
                    Clinic / Hospital
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lakeview Medical Center"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#132A1F] mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
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

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6-Month autonomic check-in, bloodwork review, medication titration"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">
                  Appointment Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Items to remember, symptoms to highlight, or questions for reception..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/25 transition-all"
                >
                  {isRescheduleMode
                    ? 'Confirm Reschedule'
                    : editingApt
                    ? 'Update Appointment'
                    : 'Schedule Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: ADD / EDIT PROVIDER ================= */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4EB] flex items-center justify-center text-[#FF7A24]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  {editingProvider ? 'Edit Provider Details' : 'Add New Care Provider'}
                </h3>
              </div>
              <button
                onClick={() => setShowProviderModal(false)}
                className="w-7 h-7 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">Provider or Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude Hospital, Central Lab"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">Type</label>
                  <select
                    value={provType}
                    onChange={(e) => setProvType(e.target.value as any)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  >
                    <option value="Clinic">Clinic</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Lab">Lab</option>
                    <option value="Specialist">Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132A1F] mb-1">Specialty / Dept</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Blood Tests"
                    value={provSpecialty}
                    onChange={(e) => setProvSpecialty(e.target.value)}
                    className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State"
                  value={provAddress}
                  onChange={(e) => setProvAddress(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132A1F] mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. (555) 123-4567"
                  value={provPhone}
                  onChange={(e) => setProvPhone(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/20 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#FF7A24] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#132A1F]/70 hover:bg-[#E8EFE9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#132A1F] text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  {editingProvider ? 'Update Provider' : 'Add to Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
