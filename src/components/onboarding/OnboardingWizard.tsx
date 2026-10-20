import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
  Heart,
  Shield,
  X,
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: Partial<UserProfile>) => void;
  initialProfile: UserProfile;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form states
  const [name, setName] = useState(initialProfile.name || 'Jose Maria');
  const [age, setAge] = useState(initialProfile.age || 32);
  const [gender, setGender] = useState(initialProfile.gender || 'Non-binary');
  const [conditions, setConditions] = useState<string[]>(initialProfile.conditions || ['Dysautonomia / POTS']);
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>(initialProfile.commonSymptoms || ['Fatigue', 'Brain Fog']);
  const [medsSummary, setMedsSummary] = useState(initialProfile.currentMedicationsSummary || 'Electrolytes, CoQ10');
  const [dailySpoons, setDailySpoons] = useState(initialProfile.dailySpoonsCapacity || 12);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(initialProfile.dietaryPreferences || ['Low Histamine']);
  const [allergies, setAllergies] = useState<string[]>(initialProfile.allergies || ['Penicillin']);

  if (!isOpen) return null;

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinish = () => {
    onComplete({
      name,
      age,
      gender,
      conditions,
      commonSymptoms,
      currentMedicationsSummary: medsSummary,
      dailySpoonsCapacity: dailySpoons,
      dietaryPreferences: dietaryPrefs,
      allergies,
      isOnboarded: true,
      isAuthenticated: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#132A1F]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#132A1F]/10 flex flex-col max-h-[92vh]">
        {/* Top Header & Step Progress */}
        <div className="p-4 pb-3 bg-[#132A1F] text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#B7E4C7] uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={onClose}
              className="text-xs text-white/60 hover:text-white"
            >
              Skip for now
            </button>
          </div>

          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#E89D35] rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center pb-2">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#132A1F]/10 p-2.5 shadow-xs flex items-center justify-center mx-auto mb-2">
                  <img
                    src="/assets/aistudio/Orange_Cross_Heart_Medical_Icon_bd9b638a.png"
                    alt="Healno Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#132A1F] font-display">
                  Welcome to Healno
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-1 max-w-xs mx-auto">
                  Let's personalize your companion so it fits your real daily energy.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#132A1F] block mb-1">Gender (Optional)</label>
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="e.g. Non-binary, Female, Male"
                    className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Chronic Conditions */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  Chronic Health Conditions & Concerns
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5">
                  Select any conditions you are managing so Healno understands your context.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Dysautonomia / POTS',
                  'Chronic Fatigue Syndrome (ME/CFS)',
                  'Fibromyalgia',
                  'Long COVID',
                  'Ehlers-Danlos / Hypermobility',
                  'Endometriosis',
                  'Autoimmune (Lupus, RA, Hashimoto\'s)',
                  'Chronic Migraines',
                  'MCAS / Histamine Sensitivity',
                  'IBS / SIBO',
                ].map((item) => {
                  const isSelected = conditions.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleArrayItem(conditions, item, setConditions)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-[#132A1F] text-white border-[#132A1F]'
                          : 'bg-white text-[#132A1F]/80 border-[#132A1F]/15'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Common Symptoms */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  Symptoms That Affect You Most
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5">
                  We will surface quick logging buttons for these in your daily journal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Persistent Fatigue',
                  'Brain Fog & Word Finding',
                  'Joint & Muscle Pain',
                  'Unrefreshing Sleep',
                  'Lightheadedness / Orthostatic',
                  'Sensory / Light Sensitivity',
                  'Digestive Discomfort',
                  'Temperature Fluctuations',
                ].map((sym) => {
                  const isSelected = commonSymptoms.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleArrayItem(commonSymptoms, sym, setCommonSymptoms)}
                      className={`p-3 rounded-2xl border text-left font-medium transition-all ${
                        isSelected
                          ? 'bg-[#E8EFE9] border-[#2D6A4F] text-[#132A1F] font-bold shadow-xs'
                          : 'bg-white border-[#132A1F]/10 text-[#132A1F]/70'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Spoons & Energy Limit */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  Daily Energy & Spoon Budget
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5">
                  How many spoons do you typically start with on an average day? (You can adjust this anytime).
                </p>
              </div>

              <div className="bg-[#132A1F] text-white rounded-3xl p-5 text-center space-y-2">
                <span className="text-xs text-[#B7E4C7] font-semibold uppercase tracking-wider">
                  Baseline Capacity
                </span>
                <div className="text-4xl font-extrabold font-display tabular-nums">
                  {dailySpoons} Spoons
                </div>
                <p className="text-xs text-white/70">
                  {dailySpoons <= 8
                    ? 'Pacing-focused: protects against PEM crashes.'
                    : dailySpoons <= 14
                    ? 'Moderate daily capacity with regular rest intervals.'
                    : 'Higher capacity with gentle pacing breaks.'}
                </p>
              </div>

              <input
                type="range"
                min="4"
                max="24"
                value={dailySpoons}
                onChange={(e) => setDailySpoons(Number(e.target.value))}
                className="w-full accent-[#E89D35]"
              />
            </div>
          )}

          {/* Step 5: Nutrition & Allergies */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  Dietary Preferences & Allergies
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-0.5">
                  Helps us recommend low-spoon recipes that are gentle on your digestion.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Low Histamine',
                  'Gluten-Free',
                  'Dairy-Free',
                  'Low FODMAP',
                  'Anti-inflammatory',
                  'Plant-Based',
                  'High Hydration / Salt',
                ].map((diet) => {
                  const isSelected = dietaryPrefs.includes(diet);
                  return (
                    <button
                      type="button"
                      key={diet}
                      onClick={() => toggleArrayItem(dietaryPrefs, diet, setDietaryPrefs)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-[#132A1F] text-white border-[#132A1F]'
                          : 'bg-white text-[#132A1F]/80 border-[#132A1F]/15'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Medication or Food Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Shellfish, Peanuts"
                  value={allergies.join(', ')}
                  onChange={(e) =>
                    setAllergies(e.target.value.split(',').map((x) => x.trim()))
                  }
                  className="w-full bg-white border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 6: Confirmation & Hopeful Illustration */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in text-center">
              <div className="rounded-3xl overflow-hidden h-36 bg-[#132A1F] relative shadow-md">
                <img
                  src="/src/assets/images/healno_rocket_journey_1792488329975.jpg"
                  alt="Friendly 3D character exploring on a rocket"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#132A1F] font-display">
                  Your Healno Sanctuary is Ready
                </h3>
                <p className="text-xs text-[#132A1F]/70 mt-1 max-w-xs mx-auto leading-relaxed">
                  Remember: your body does not need to be fixed or pushed. Taking rest is a radical, productive act of care.
                </p>
              </div>

              <div className="bg-[#E8EFE9] p-3 rounded-2xl text-xs text-[#132A1F]/80 text-left space-y-1">
                <div>✓ Daily capacity set to {dailySpoons} Spoons</div>
                <div>✓ Personalized symptom tracking enabled</div>
                <div>✓ Gentle AI companion ready to assist</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="p-4 bg-white border-t border-[#132A1F]/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="py-2.5 px-4 rounded-xl border border-[#132A1F]/15 text-xs font-semibold text-[#132A1F] flex items-center gap-1 hover:bg-[#F8F6F0]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="py-2.5 px-6 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white text-xs font-bold font-display shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="py-2.5 px-6 rounded-full bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-bold font-display shadow-md flex items-center gap-1.5 transition-colors"
            >
              <span>Enter Healno</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
