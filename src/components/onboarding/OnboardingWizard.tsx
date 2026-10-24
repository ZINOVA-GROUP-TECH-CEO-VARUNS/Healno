import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../../types';
import { HealnoLogo } from '../common/HealnoLogo';
import { storageService } from '../../services/storage';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Plus,
  Trash2,
  Edit2,
  Shield,
  User,
  Activity,
  Pill,
  Sparkles,
  Sliders,
  CheckCircle2,
  Heart,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: Partial<UserProfile>) => void;
  initialProfile: UserProfile;
}

interface MedicationEntry {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  isCurrent: boolean;
  notes: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
}) => {
  // 7 Structured Onboarding Steps
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Step 1: Personal Profile
  const [name, setName] = useState(initialProfile.name || '');
  const [email] = useState(initialProfile.email || '');
  const [ageGroup, setAgeGroup] = useState<string>('25-34');
  const [gender, setGender] = useState<string>('Prefer not to say');

  // Step 2: Health Conditions
  const [conditionsSearch, setConditionsSearch] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(initialProfile.conditions || []);
  const [customConditionInput, setCustomConditionInput] = useState('');

  // Step 3: Symptoms
  const [symptomsSearch, setSymptomsSearch] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialProfile.commonSymptoms || []);
  const [customSymptomInput, setCustomSymptomInput] = useState('');

  // Step 4: Medicines & Supplements
  const [medsList, setMedsList] = useState<MedicationEntry[]>([]);
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('Vitamins & Supplements');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('Daily');
  const [newMedNotes, setNewMedNotes] = useState('');

  // Step 5: Daily-Life Impact
  const [impactAreas, setImpactAreas] = useState<string[]>([]);
  const [symptomBehavior, setSymptomBehavior] = useState<string[]>([]);
  const [supportGoals, setSupportGoals] = useState<string[]>([]);

  const [sharingPreference, setSharingPreference] = useState<string[]>([]);
  const [trackingMethods, setTrackingMethods] = useState<string[]>([]);

  // Step 7: Dietary Focus
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(initialProfile.dietaryPreferences || []);
  const [allergies, setAllergies] = useState<string[]>(initialProfile.allergies || []);
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  // Resume partial progress if available
  useEffect(() => {
    if (isOpen) {
      const savedProgress = storageService.getOnboardingProgress();
      if (savedProgress) {
        if (savedProgress.step) setStep(savedProgress.step);
        if (savedProgress.name) setName(savedProgress.name);
        if (savedProgress.ageGroup) setAgeGroup(savedProgress.ageGroup);
        if (savedProgress.gender) setGender(savedProgress.gender);
        if (savedProgress.selectedConditions) setSelectedConditions(savedProgress.selectedConditions);
        if (savedProgress.selectedSymptoms) setSelectedSymptoms(savedProgress.selectedSymptoms);
        if (savedProgress.medsList) setMedsList(savedProgress.medsList);
        if (savedProgress.impactAreas) setImpactAreas(savedProgress.impactAreas);
        if (savedProgress.symptomBehavior) setSymptomBehavior(savedProgress.symptomBehavior);
        if (savedProgress.supportGoals) setSupportGoals(savedProgress.supportGoals);
         if (savedProgress.sharingPreference) setSharingPreference(savedProgress.sharingPreference);
        if (savedProgress.trackingMethods) setTrackingMethods(savedProgress.trackingMethods);
        if (savedProgress.dietaryPreferences) setDietaryPreferences(savedProgress.dietaryPreferences);
        if (savedProgress.allergies) setAllergies(savedProgress.allergies);
      }
    }
  }, [isOpen]);

  // Save partial progress upon step change
  const saveProgressState = (currentStep: number) => {
    storageService.saveOnboardingProgress({
      step: currentStep,
      name,
      ageGroup,
      gender,
      selectedConditions,
      selectedSymptoms,
      medsList,
      impactAreas,
      symptomBehavior,
      supportGoals,
      sharingPreference,
      trackingMethods,
      dietaryPreferences,
      allergies,
    });
  };

  const handleNext = () => {
    const nextStep = Math.min(totalSteps, step + 1);
    setStep(nextStep);
    saveProgressState(nextStep);
  };

  const handleBack = () => {
    const prevStep = Math.max(1, step - 1);
    setStep(prevStep);
    saveProgressState(prevStep);
  };

  // Final confirmation & dashboard activation
  const handleCompleteAll = () => {
    storageService.clearOnboardingProgress();
    storageService.setOnboardingCompleted(true);

    // Save actual user medications if any were added
    medsList.forEach((m) => {
      storageService.saveMedication({
        id: m.id,
        name: m.name,
        dosage: m.dosage || 'As directed',
        scheduleTimes: ['08:00'],
        timeSlot: 'Morning',
        instructions: m.notes || m.frequency,
        isAsNeeded: m.frequency.toLowerCase().includes('needed'),
        category: m.category.includes('Prescription') ? 'Prescription' : 'Supplement',
      });
    });

    const summaryMedString = medsList.map((m) => `${m.name} ${m.dosage}`.trim()).join(', ');

    onComplete({
      name: (name.trim() && name.trim() !== 'Friend') ? name.trim() : 'Healno Friend',
      email: email || initialProfile.email || 'account@healno.app',
      gender,
      conditions: selectedConditions,
      commonSymptoms: selectedSymptoms,
      currentMedicationsSummary: summaryMedString,
      dailySpoonsCapacity: 12,
      dietaryPreferences,
      allergies,
      symptomBehavior,
      sharingPreference,
      isOnboarded: true,
      isAuthenticated: true,
    });

    onClose();
  };

  if (!isOpen) return null;

  // Toggle helper
  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Condition Categories
  const conditionCategories = [
    { name: 'Common Conditions', items: ['Asthma', 'Migraines', 'Hypertension', 'Insomnia', 'Chronic Sinusitis'] },
    { name: 'Autoimmune', items: ["Hashimoto's Thyroiditis", 'Lupus (SLE)', 'Rheumatoid Arthritis', 'Celiac Disease', 'Multiple Sclerosis'] },
    { name: 'Allergies', items: ['Seasonal Allergies', 'Food Allergies', 'Medication Allergy', 'Environmental Sensitivity'] },
    { name: 'Pain-Related', items: ['Fibromyalgia', 'Chronic Lower Back Pain', 'Neuropathic Pain', 'Myofascial Pain'] },
    { name: 'Gut & Digestion', items: ['Irritable Bowel Syndrome (IBS)', 'GERD / Acid Reflux', 'SIBO', 'Crohn’s Disease'] },
    { name: 'Hormonal', items: ['PCOS', 'Endometriosis', 'Hypothyroidism', 'Perimenopause / Menopause'] },
    { name: 'Metabolism', items: ['Type 2 Diabetes', 'Insulin Resistance', 'Metabolic Syndrome', 'Prediabetes'] },
    { name: 'Heart & Circulation', items: ['Postural Orthostatic Tachycardia (POTS)', 'Dysautonomia', 'Orthostatic Hypotension', 'Palpitations'] },
    { name: 'Brain & Nerves', items: ['ME/CFS (Chronic Fatigue Syndrome)', 'Peripheral Neuropathy', 'Brain Fog', 'Post-Concussion'] },
    { name: 'Mental Health', items: ['Generalized Anxiety', 'Depression', 'PTSD', 'ADHD'] },
    { name: 'Skin Conditions', items: ['Eczema', 'Psoriasis', 'Rosacea', 'Urticaria (Hives)'] },
  ];

  // Symptom Categories
  const symptomCategories = [
    { name: 'General', items: ['Persistent Fatigue', 'Post-Exertional Malaise', 'Unrefreshing Sleep', 'Weakness'] },
    { name: 'Pain & Aches', items: ['Joint Pain', 'Muscle Aches', 'Tension Headache', 'Neck & Shoulder Stiffness'] },
    { name: 'Digestion', items: ['Abdominal Bloating', 'Nausea', 'Stomach Cramps', 'Early Satiety'] },
    { name: 'Heart & Breathing', items: ['Palpitations / Racing Heart', 'Shortness of Breath', 'Lightheadedness on Standing', 'Chest Heaviness'] },
    { name: 'Skin & Body', items: ['Flushing / Temperature Shifts', 'Dry Skin', 'Cold Extremities', 'Swelling'] },
    { name: 'Mind & Sleep', items: ['Brain Fog / Word Finding', 'Difficulty Concentrating', 'Restless Sleep', 'Racing Thoughts'] },
    { name: 'Senses & Nerves', items: ['Light Sensitivity', 'Sound Sensitivity', 'Dizziness', 'Tingling in Hands/Feet'] },
    { name: 'Hormonal', items: ['Night Sweats', 'Sudden Energy Dips', 'Mood Fluctuations', 'Fluid Retention'] },
  ];

  const medicationCategories = [
    'Pain Relief',
    'Nerve Pain',
    'Heart & Circulation',
    'Allergies & Histamine',
    'Digestion & Gut',
    'Hormones & Thyroid',
    'Mental Health & Mood',
    'Sleep Support',
    'Vitamins & Supplements',
    'Other Prescription / OTC',
  ];

  const impactList = [
    { id: 'energy', label: 'Energy & Fatigue', icon: '⚡', desc: 'Running out of energy before the day finishes' },
    { id: 'sleep', label: 'Restorative Sleep', icon: '🌙', desc: 'Waking up feeling unrefreshed or waking often' },
    { id: 'concentration', label: 'Cognitive Focus', icon: '🧠', desc: 'Word-finding difficulty, brain fog, or memory lag' },
    { id: 'mobility', label: 'Physical Stamina & Mobility', icon: '🚶', desc: 'Standing, stairs, or physical endurance' },
    { id: 'routine', label: 'Personal Care & Routine', icon: '🛁', desc: 'Bathing, dressing, and gentle daily activities' },
    { id: 'household', label: 'Household Responsibilities', icon: '🧹', desc: 'Cooking, dishes, laundry, or home chores' },
    { id: 'work_school', label: 'Work, School & Study', icon: '💼', desc: 'Meeting deadlines without triggering post-exertional crashes' },
    { id: 'social', label: 'Social & Emotional Peace', icon: '🌿', desc: 'Maintaining connections while protecting energy' },
  ];

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const entry: MedicationEntry = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      category: newMedCategory,
      dosage: newMedDosage.trim() || 'Unspecified',
      frequency: newMedFrequency,
      isCurrent: true,
      notes: newMedNotes.trim(),
    };

    setMedsList((prev) => [...prev, entry]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedNotes('');
    setShowAddMedForm(false);
  };

  const handleRemoveMed = (id: string) => {
    setMedsList((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132A1F]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#132A1F]/10 flex flex-col max-h-[94vh] animate-in fade-in duration-200">
        {/* Top Header & Step Progress Indicator */}
        <div className="p-4 bg-[#132A1F] text-white shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HealnoLogo size={26} />
              <span className="text-[11px] font-bold tracking-wider text-[#FF7A24] uppercase font-display">
                Healno Onboarding
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#B7E4C7] font-semibold">
                Step {step} of {totalSteps}
              </span>
              {/* Individual Skip for Now button on optional steps */}
              {step > 1 && step < 7 && (
                <button
                  onClick={handleNext}
                  className="text-xs text-white/70 hover:text-white underline decoration-white/30 ml-2"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF8F3D] to-[#FF7A24] rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Personal Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-2">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#132A1F] font-display">
                  Welcome! Let's get acquainted.
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-1 max-w-sm mx-auto">
                  Healno adapts to your real pace. We never invent or share your personal health identity.
                </p>
              </div>

              <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-[#132A1F]/10 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-[#132A1F] block mb-1">
                    Your Real Name or Preferred Display Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3.5 py-2.5 text-sm text-[#132A1F] focus:outline-none focus:ring-2 focus:ring-[#FF7A24]/40 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#132A1F] block mb-1">
                    Authenticated Account Email
                  </label>
                  <input
                    type="email"
                    value={email || 'account@healno.app'}
                    disabled
                    className="w-full bg-[#E8EFE9]/40 border border-[#132A1F]/10 rounded-xl px-3.5 py-2 text-xs text-[#132A1F]/70 select-none cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#132A1F]/50 mt-0.5 block">
                    Verified through your authenticated session.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#132A1F] block mb-1">
                    Age Group
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setAgeGroup(range)}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all ${
                          ageGroup === range
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/10 hover:border-[#FF7A24]/40'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#132A1F] block mb-1">
                    Gender Identity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-3 text-xs rounded-xl font-bold border text-left transition-all ${
                          gender === g
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] shadow-xs'
                            : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/10 hover:border-[#FF7A24]/40'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Health Conditions */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Health Conditions (Optional)
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Select conditions you live with so Healno can support your specific pacing needs. We never verify or assume a diagnosis.
                </p>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search conditions (e.g. POTS, Migraine, Thyroid...)"
                  value={conditionsSearch}
                  onChange={(e) => setConditionsSearch(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#132A1F] focus:outline-none focus:ring-2 focus:ring-[#FF7A24]/40"
                />
              </div>

              {/* Selected Pills */}
              {selectedConditions.length > 0 && (
                <div className="bg-[#FFF4EB] p-3 rounded-2xl border border-[#FF7A24]/20 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#FF7A24]">Selected Conditions ({selectedConditions.length}):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConditions.map((item) => (
                      <span
                        key={item}
                        onClick={() => toggleItem(selectedConditions, item, setSelectedConditions)}
                        className="text-xs bg-[#FF7A24] text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:bg-[#d86214] transition-colors"
                      >
                        <span>{item}</span>
                        <span>✕</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Options */}
              <div className="space-y-3 max-h-[36vh] overflow-y-auto pr-1">
                {conditionCategories.map((cat) => {
                  const filtered = cat.items.filter((item) =>
                    item.toLowerCase().includes(conditionsSearch.toLowerCase())
                  );
                  if (filtered.length === 0) return null;

                  return (
                    <div key={cat.name} className="bg-white p-3 rounded-2xl border border-[#132A1F]/10">
                      <h4 className="text-xs font-bold text-[#132A1F]/70 mb-2 uppercase tracking-wider">
                        {cat.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {filtered.map((item) => {
                          const isSelected = selectedConditions.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleItem(selectedConditions, item, setSelectedConditions)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                isSelected
                                  ? 'bg-[#FF7A24] text-white border-[#FF7A24] font-bold shadow-xs'
                                  : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/15 hover:border-[#FF7A24]/50 font-medium'
                              }`}
                            >
                              {item} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom condition input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another custom condition..."
                  value={customConditionInput}
                  onChange={(e) => setCustomConditionInput(e.target.value)}
                  className="flex-1 bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customConditionInput.trim() && !selectedConditions.includes(customConditionInput.trim())) {
                      setSelectedConditions((prev) => [...prev, customConditionInput.trim()]);
                      setCustomConditionInput('');
                    }
                  }}
                  className="px-3 py-2 bg-[#FF7A24] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Symptoms */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Frequent Symptoms (Optional)
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Choose symptoms you frequently experience. This prepares your personalized symptom diary.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search symptoms (e.g. Fatigue, Brain fog, Dizziness...)"
                  value={symptomsSearch}
                  onChange={(e) => setSymptomsSearch(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#132A1F] focus:outline-none focus:ring-2 focus:ring-[#FF7A24]/40"
                />
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="bg-[#FFF4EB] p-3 rounded-2xl border border-[#FF7A24]/20 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#FF7A24]">Selected Symptoms ({selectedSymptoms.length}):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((item) => (
                      <span
                        key={item}
                        onClick={() => toggleItem(selectedSymptoms, item, setSelectedSymptoms)}
                        className="text-xs bg-[#FF7A24] text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:bg-[#d86214] transition-colors"
                      >
                        <span>{item}</span>
                        <span>✕</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Options */}
              <div className="space-y-3 max-h-[36vh] overflow-y-auto pr-1">
                {symptomCategories.map((cat) => {
                  const filtered = cat.items.filter((item) =>
                    item.toLowerCase().includes(symptomsSearch.toLowerCase())
                  );
                  if (filtered.length === 0) return null;

                  return (
                    <div key={cat.name} className="bg-white p-3 rounded-2xl border border-[#132A1F]/10">
                      <h4 className="text-xs font-bold text-[#132A1F]/70 mb-2 uppercase tracking-wider">
                        {cat.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {filtered.map((item) => {
                          const isSelected = selectedSymptoms.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleItem(selectedSymptoms, item, setSelectedSymptoms)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                isSelected
                                  ? 'bg-[#FF7A24] text-white border-[#FF7A24] font-bold shadow-xs'
                                  : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/15 hover:border-[#FF7A24]/50 font-medium'
                              }`}
                            >
                              {item} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom symptom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom symptom..."
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  className="flex-1 bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSymptomInput.trim() && !selectedSymptoms.includes(customSymptomInput.trim())) {
                      setSelectedSymptoms((prev) => [...prev, customSymptomInput.trim()]);
                      setCustomSymptomInput('');
                    }
                  }}
                  className="px-3 py-2 bg-[#FF7A24] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Medicines & Supplements */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Medicines & Supplements (Optional)
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Keep track of what you take. We never suggest prescription changes or share this without consent.
                </p>
              </div>

              {/* Added Meds List */}
              {medsList.length > 0 ? (
                <div className="space-y-2">
                  {medsList.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-3 rounded-2xl border border-[#132A1F]/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#132A1F]">{m.name}</div>
                        <div className="text-[11px] text-[#132A1F]/60">
                          {m.dosage} · {m.frequency} · <span className="text-[#FF7A24]">{m.category}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(m.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF8F5] border border-dashed border-[#132A1F]/20 rounded-2xl p-4 text-center">
                  <p className="text-xs text-[#132A1F]/60">No medicines or supplements added yet.</p>
                </div>
              )}

              {/* Add form toggle */}
              {!showAddMedForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddMedForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FFF4EB] border border-[#FF7A24]/30 text-[#FF7A24] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#ffe8d6] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add a Medicine or Supplement</span>
                </button>
              ) : (
                <form onSubmit={handleAddMed} className="bg-white p-4 rounded-2xl border border-[#FF7A24]/30 space-y-3">
                  <h4 className="text-xs font-bold text-[#132A1F]">Add Medicine / Supplement</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#132A1F] block mb-0.5">Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. CoQ10, Electrolytes"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-lg px-2.5 py-1.5 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#132A1F] block mb-0.5">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 100mg, 1 tablet"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#132A1F] block mb-0.5">Category</label>
                      <select
                        value={newMedCategory}
                        onChange={(e) => setNewMedCategory(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-lg px-2 py-1.5 text-xs"
                      >
                        {medicationCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#132A1F] block mb-0.5">Frequency</label>
                      <select
                        value={newMedFrequency}
                        onChange={(e) => setNewMedFrequency(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#132A1F]/15 rounded-lg px-2 py-1.5 text-xs"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Morning">Morning</option>
                        <option value="Bedtime">Bedtime</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddMedForm(false)}
                      className="px-3 py-1.5 text-xs text-[#132A1F]/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#FF7A24] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Save Item
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 5: Daily-Life Impact */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Daily-Life Impact (Optional)
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Understanding what affects you most helps personalize your energy capacity and pacing recommendations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#132A1F] block">
                  Which areas of daily life are most impacted? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {impactList.map((item) => {
                    const isSelected = impactAreas.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(impactAreas, item.id, setImpactAreas)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#FFF4EB] border-[#FF7A24] shadow-xs'
                            : 'bg-white border-[#132A1F]/10 hover:border-[#132A1F]/30'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold ${isSelected ? 'text-[#FF7A24]' : 'text-[#132A1F]'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-[#132A1F]/60 leading-tight mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 space-y-2">
                <label className="text-xs font-bold text-[#132A1F] block">
                  How do your symptoms typically behave over time?
                </label>
                <div className="space-y-1.5">
                  {[
                    'Fluctuates depending on activity and rest',
                    'Steady baseline with sudden flare-ups',
                    'Triggered by stress, weather, or exertion',
                    'Gradually improving or still under investigation',
                  ].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => toggleItem(symptomBehavior, opt, setSymptomBehavior)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        symptomBehavior.includes(opt)
                          ? 'bg-[#FFF4EB] border-[#FF7A24] shadow-xs'
                          : 'bg-[#FAF8F5] border-[#132A1F]/10 hover:border-[#132A1F]/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        symptomBehavior.includes(opt) ? 'border-[#FF7A24] bg-[#FF7A24]' : 'border-[#132A1F]/30 bg-white'
                      }`}>
                        {symptomBehavior.includes(opt) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs ${symptomBehavior.includes(opt) ? 'font-bold text-[#FF7A24]' : 'text-[#132A1F]'}`}>
                        {opt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Dietary Focus */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Dietary Focus (Optional)
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Nutrition affects energy levels. Let us know your focus areas to better tailor your pacing and rest advice.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#132A1F]/10 space-y-2.5">
                <label className="text-xs font-bold text-[#132A1F] block">
                  Do you follow a specific dietary focus? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Anti-Inflammatory',
                    'Low Histamine',
                    'Gluten-Free',
                    'Dairy-Free',
                    'Plant-Based',
                    'Low FODMAP',
                    'Keto / Low Carb',
                    'Mediterranean',
                  ].map((diet) => {
                    const isSelected = dietaryPreferences.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleItem(dietaryPreferences, diet, setDietaryPreferences)}
                        className={`text-xs py-2 px-3 rounded-xl border text-left font-medium transition-all ${
                          isSelected
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] font-bold shadow-xs'
                            : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/10 hover:border-[#FF7A24]/40'
                        }`}
                      >
                        {diet} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#132A1F]/10 space-y-2">
                <label className="text-xs font-bold text-[#132A1F] block">
                  Known Allergies or Sensitivities
                </label>
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {allergies.map((a) => (
                      <span
                        key={a}
                        onClick={() => toggleItem(allergies, a, setAllergies)}
                        className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:bg-[#ffd1c0]"
                      >
                        {a} ✕
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add allergy (e.g. Nuts, Soy, Shellfish...)"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAllergyInput.trim() && !allergies.includes(customAllergyInput.trim())) {
                        setAllergies((prev) => [...prev, customAllergyInput.trim()]);
                        setCustomAllergyInput('');
                      }
                    }}
                    className="px-3 py-2 bg-[#FF7A24] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Healthcare Preferences */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF4EB] border border-[#FF7A24]/30 flex items-center justify-center mx-auto mb-2 text-[#FF7A24]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Healthcare & Privacy Preferences
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  You stay in full control. Your health data is never shared with providers, caregivers, or third parties without explicit authorization.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#132A1F]/10 space-y-2.5">
                <label className="text-xs font-bold text-[#132A1F] block">
                  How do you plan to use Healno?
                </label>
                <div className="space-y-2">
                  {[
                    'Personal reflection & tracking only',
                    'Prepare clinical summary notes before doctor appointments',
                    'Share exported symptom reports with my healthcare provider',
                    'Manage my daily energy, tasks, and pacing',
                  ].map((pref) => (
                    <div
                      key={pref}
                      onClick={() => toggleItem(sharingPreference, pref, setSharingPreference)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        sharingPreference.includes(pref)
                          ? 'bg-[#FFF4EB] border-[#FF7A24]'
                          : 'bg-[#FAF8F5] border-[#132A1F]/10 hover:border-[#132A1F]/30'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors ${
                        sharingPreference.includes(pref) ? 'border-[#FF7A24] bg-[#FF7A24]' : 'border-[#132A1F]/30 bg-white'
                      }`}>
                        {sharingPreference.includes(pref) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs ${sharingPreference.includes(pref) ? 'font-bold text-[#FF7A24]' : 'text-[#132A1F]'}`}>
                        {pref}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#132A1F]/10 space-y-2">
                <label className="text-xs font-bold text-[#132A1F] block">
                  How do you currently track health & symptoms?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Paper journal / diary',
                    'Notes app on phone',
                    'Wearables (Apple Watch/Garmin)',
                    'Other health apps',
                    'Spreadsheets',
                    'In my head / memory',
                  ].map((method) => {
                    const isSelected = trackingMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => toggleItem(trackingMethods, method, setTrackingMethods)}
                        className={`text-xs py-2 px-3 rounded-xl border text-left font-medium transition-all ${
                          isSelected
                            ? 'bg-[#FF7A24] text-white border-[#FF7A24] font-bold shadow-xs'
                            : 'bg-[#FAF8F5] text-[#132A1F] border-[#132A1F]/10 hover:border-[#FF7A24]/40'
                        }`}
                      >
                        {method} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Review & Confirmation */}
          {step === 8 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#D8F3DC] border border-[#52B788]/40 flex items-center justify-center mx-auto mb-2 text-[#2D6A4F]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#132A1F] font-display">
                  Review Your Real Health Profile
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5 max-w-sm mx-auto">
                  Everything here reflects only what you entered. You can edit any section below or later in Profile.
                </p>
              </div>

              <div className="space-y-3">
                {/* Profile review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Profile</span>
                    <div className="text-sm font-bold text-[#132A1F]">{name || 'Health Friend'}</div>
                    <div className="text-xs text-[#132A1F]/60">Age: {ageGroup} · {gender}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Conditions review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Conditions</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {selectedConditions.length > 0 ? selectedConditions.join(', ') : 'None added'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Symptoms review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Frequent Symptoms</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'None added'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Medicines review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Medicines & Routine</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {medsList.length > 0 ? medsList.map((m) => `${m.name} (${m.dosage})`).join(', ') : 'None added'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Dietary Focus review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Dietary Focus</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'None specified'}
                      {allergies.length > 0 && ` · Allergies: ${allergies.join(', ')}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Impact & Behavior review card */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Symptom Behavior</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {symptomBehavior.length > 0 ? symptomBehavior.join(', ') : 'None specified'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Impact & Preference */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#132A1F]/10 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A24]">Healthcare Preferences</span>
                    <div className="text-xs text-[#132A1F] font-semibold mt-0.5">
                      {sharingPreference.length > 0 ? sharingPreference.join(', ') : 'None specified'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    className="text-xs text-[#FF7A24] font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-white border-t border-[#132A1F]/10 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#132A1F]/20 text-xs font-bold text-[#132A1F] hover:bg-[#FAF8F5] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#d86214] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/30 active:scale-95 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteAll}
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#FF7A24] hover:bg-[#d86214] text-white text-sm font-bold shadow-lg shadow-[#FF7A24]/35 active:scale-95 transition-all font-display"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Activate Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
