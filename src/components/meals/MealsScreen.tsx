import React, { useState, useEffect } from 'react';
import { MealRecipe, DailyMealPlan, UserProfile } from '../../types';
import {
  Utensils,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  Calendar,
  Coffee,
  Sun,
  Moon,
  Cookie,
  ShieldCheck,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';

interface MealsScreenProps {
  meals: MealRecipe[];
  remainingSpoons: number;
  userDietaryPreferences: string[];
  userProfile?: UserProfile;
  onSaveMeal: (meal: MealRecipe) => void;
  onBack: () => void;
}

export const MealsScreen: React.FC<MealsScreenProps> = ({
  meals,
  remainingSpoons,
  userDietaryPreferences,
  userProfile,
  onSaveMeal,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'dailyPlan' | 'recipes'>('dailyPlan');
  const [dailyPlan, setDailyPlan] = useState<DailyMealPlan | null>(() => storageService.getDailyMealPlan());
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Single recipe state
  const [selectedMeal, setSelectedMeal] = useState<MealRecipe | null>(meals[0] || null);
  const [spoonFilter, setSpoonFilter] = useState<number | 'all'>('all');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Generator form
  const [energyLevel, setEnergyLevel] = useState<number>(remainingSpoons > 4 ? 6 : 3);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [prepMax, setPrepMax] = useState(15);

  const effectiveProfile = userProfile || storageService.getProfile();

  const handleGenerateDailyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await apiService.generateDailyMealPlan(effectiveProfile, remainingSpoons);
      const fullPlan: DailyMealPlan = {
        id: `plan_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        breakfast: plan.breakfast,
        lunch: plan.lunch,
        dinner: plan.dinner,
        snack: plan.snack,
        dietaryNotes: plan.dietaryNotes,
        generatedAt: new Date().toISOString(),
      };
      storageService.saveDailyMealPlan(fullPlan);
      setDailyPlan(fullPlan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const filteredMeals = meals.filter((m) => {
    if (spoonFilter === 'all') return true;
    return m.spoonCost === spoonFilter;
  });

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingRecipe(true);

    try {
      const generated = await apiService.generatePersonalizedMeal(
        energyLevel,
        userDietaryPreferences,
        ingredientsInput,
        prepMax
      );

      const newRecipe: MealRecipe = {
        id: `meal_${Date.now()}`,
        name: generated.recipeName || 'Spoon-Friendly Nourish Meal',
        spoonCost: generated.energySpoonCost || (energyLevel <= 4 ? 1 : 2),
        prepTimeMinutes: generated.prepTimeMinutes || 12,
        difficulty: generated.difficulty || (energyLevel <= 4 ? 'Low Effort' : 'Moderate'),
        dietaryTags: userDietaryPreferences,
        ingredients: generated.ingredients || ['Broth', 'Rice', 'Greens'],
        instructions: generated.instructions || ['Warm broth', 'Combine ingredients', 'Rest and nourish'],
        lowEffortAlternative: generated.lowEffortAlternative || 'Warm pre-made broth with plain crackers.',
        nutritionNotes: generated.nutritionNotes || 'Gentle on digestion, hydrating electrolytes.',
        storageGuidance: 'Store in refrigerator up to 2 days.',
      };

      onSaveMeal(newRecipe);
      setSelectedMeal(newRecipe);
      setShowGeneratorModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#FF7A24]" />
            <span>Spoon Nutrition & Meal Plans</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">Personalized daily nourishment respecting your spoons and allergies</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3.5 py-1.5 rounded-full font-semibold hover:bg-[#d8e3da] transition-colors"
        >
          Back
        </button>
      </div>

      {/* Tabs Switcher: Daily Plan vs Recipes Vault */}
      <div className="flex items-center justify-center p-1 bg-[#E8EFE9] rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('dailyPlan')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'dailyPlan' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Today's 1-Day Plan
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'recipes' ? 'bg-[#FF7A24] text-white shadow-xs' : 'text-[#132A1F]/70 hover:text-[#132A1F]'
          }`}
        >
          Recipe Vault ({meals.length})
        </button>
      </div>

      {/* ================= TAB 1: TODAY'S 1-DAY MEAL PLAN ================= */}
      {activeTab === 'dailyPlan' && (
        <div className="space-y-4">
          {/* Header Card with Regeneration */}
          <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF7A24] uppercase tracking-wider">
                  Personalized AI Plan
                </span>
                <h3 className="text-base font-bold font-display mt-0.5">
                  Today's Paced Nutrition Schedule
                </h3>
                <p className="text-xs text-white/70 mt-1 max-w-xs">
                  Tailored to your {remainingSpoons} remaining spoons, {effectiveProfile.dietaryPreferences.join(', ') || 'balanced diet'}, and avoids known allergies ({effectiveProfile.allergies.join(', ') || 'none'}).
                </p>
              </div>

              <button
                onClick={handleGenerateDailyPlan}
                disabled={isGeneratingPlan}
                className="px-4 py-2 rounded-2xl bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/30 transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
                <span>{isGeneratingPlan ? 'Generating...' : dailyPlan ? 'Refresh Plan' : 'Generate Plan'}</span>
              </button>
            </div>

            {dailyPlan?.dietaryNotes && (
              <div className="bg-white/10 rounded-2xl p-3 text-xs text-[#B7E4C7] leading-relaxed">
                <span className="font-bold text-white">Clinical Note: </span>
                {dailyPlan.dietaryNotes}
              </div>
            )}
          </div>

          {/* Meals Cards: Breakfast, Lunch, Dinner, Snack */}
          {!dailyPlan ? (
            <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
              <Utensils className="w-10 h-10 text-[#FF7A24] mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-[#132A1F] font-display">No meal plan generated yet</h4>
              <p className="text-xs text-[#132A1F]/60 max-w-sm mx-auto leading-relaxed">
                Generate an individualized breakfast, lunch, dinner, and snack suggestion tailored to your energy capacity and digestive comfort.
              </p>
              <button
                onClick={handleGenerateDailyPlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingPlan ? 'Generating...' : 'Generate Today\'s Plan'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Breakfast */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#FFF4EB] text-[#FF7A24] flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A24]">
                      Breakfast
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-bold px-2 py-0.5 rounded-full">
                    {dailyPlan.breakfast.spoonCost} Spoon ({dailyPlan.breakfast.prepTimeMinutes}m)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#132A1F]">{dailyPlan.breakfast.name}</h4>
                <div className="text-xs text-[#132A1F]/70">
                  <span className="font-semibold text-[#132A1F]">Ingredients: </span>
                  {dailyPlan.breakfast.ingredients.join(', ')}
                </div>
                {dailyPlan.breakfast.nutritionNotes && (
                  <p className="text-[11px] text-[#2D6A4F] bg-[#E8EFE9]/40 p-2 rounded-xl">
                    {dailyPlan.breakfast.nutritionNotes}
                  </p>
                )}
              </div>

              {/* Lunch */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#FFF4EB] text-[#FF7A24] flex items-center justify-center">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A24]">
                      Lunch
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-bold px-2 py-0.5 rounded-full">
                    {dailyPlan.lunch.spoonCost} Spoon ({dailyPlan.lunch.prepTimeMinutes}m)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#132A1F]">{dailyPlan.lunch.name}</h4>
                <div className="text-xs text-[#132A1F]/70">
                  <span className="font-semibold text-[#132A1F]">Ingredients: </span>
                  {dailyPlan.lunch.ingredients.join(', ')}
                </div>
                {dailyPlan.lunch.nutritionNotes && (
                  <p className="text-[11px] text-[#2D6A4F] bg-[#E8EFE9]/40 p-2 rounded-xl">
                    {dailyPlan.lunch.nutritionNotes}
                  </p>
                )}
              </div>

              {/* Dinner */}
              <div className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#FFF4EB] text-[#FF7A24] flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A24]">
                      Dinner
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-bold px-2 py-0.5 rounded-full">
                    {dailyPlan.dinner.spoonCost} Spoon ({dailyPlan.dinner.prepTimeMinutes}m)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#132A1F]">{dailyPlan.dinner.name}</h4>
                <div className="text-xs text-[#132A1F]/70">
                  <span className="font-semibold text-[#132A1F]">Ingredients: </span>
                  {dailyPlan.dinner.ingredients.join(', ')}
                </div>
                {dailyPlan.dinner.nutritionNotes && (
                  <p className="text-[11px] text-[#2D6A4F] bg-[#E8EFE9]/40 p-2 rounded-xl">
                    {dailyPlan.dinner.nutritionNotes}
                  </p>
                )}
              </div>

              {/* Optional Snack */}
              {dailyPlan.snack && (
                <div className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs hover:border-[#FF7A24]/30 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#FFF4EB] text-[#FF7A24] flex items-center justify-center">
                        <Cookie className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7A24]">
                        Gentle Snack
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] font-bold px-2 py-0.5 rounded-full">
                      {dailyPlan.snack.spoonCost} Spoon ({dailyPlan.snack.prepTimeMinutes}m)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#132A1F]">{dailyPlan.snack.name}</h4>
                  <div className="text-xs text-[#132A1F]/70">
                    <span className="font-semibold text-[#132A1F]">Ingredients: </span>
                    {dailyPlan.snack.ingredients.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: RECIPE VAULT ================= */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          {/* Hero Spoon Card */}
          <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-xs relative overflow-hidden flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#B7E4C7] uppercase tracking-wider">
                Current Capacity Awareness
              </span>
              <h3 className="text-base font-bold font-display mt-0.5">
                {remainingSpoons <= 4 ? '1-Spoon Low Energy Day' : 'Comfortable Pacing Mode'}
              </h3>
              <p className="text-xs text-white/70 mt-1 max-w-xs">
                {remainingSpoons <= 4
                  ? 'Focusing on zero-chop meals, 10-minute warm broths, and single-dish cleanups.'
                  : 'Room for gentle cooking with balanced proteins and roasted veggies.'}
              </p>
            </div>

            <button
              onClick={() => setShowGeneratorModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#FF7A24] hover:bg-[#E06516] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Recipe</span>
            </button>
          </div>

          {/* Filter by Spoon Cost */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#132A1F]/60">Filter Effort:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Recipes' },
                { id: 1, label: '1 Spoon (<10m)' },
                { id: 2, label: '2 Spoons (15-25m)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSpoonFilter(item.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    spoonFilter === item.id
                      ? 'bg-[#132A1F] text-white'
                      : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Recipe Detail Card */}
          {selectedMeal && (
            <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#FF7A24] text-white px-2.5 py-0.5 rounded-full font-bold">
                      {selectedMeal.spoonCost} Spoon Effort
                    </span>
                    <span className="text-xs text-[#132A1F]/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedMeal.prepTimeMinutes} mins</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#132A1F] font-display mt-2">
                    {selectedMeal.name}
                  </h3>
                </div>

                <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold">
                  {selectedMeal.difficulty}
                </span>
              </div>

              {/* Nutrition and digestion notes */}
              <div className="bg-[#E8EFE9] rounded-2xl p-3.5 text-xs text-[#132A1F]/80 leading-relaxed">
                <span className="font-bold text-[#132A1F]">Digestive & Energy Support: </span>
                {selectedMeal.nutritionNotes}
              </div>

              {/* Ingredients list */}
              <div>
                <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
                  Ingredients
                </h4>
                <div className="space-y-1.5">
                  {selectedMeal.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#132A1F]/10 rounded-xl p-2.5 text-xs text-[#132A1F]/85 flex items-center gap-2"
                    >
                      <span className="text-[#2D6A4F] font-bold">✓</span>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
                  Gentle Step-by-Step
                </h4>
                <div className="space-y-2">
                  {selectedMeal.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#132A1F]/10 rounded-xl p-3 text-xs text-[#132A1F]/85 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#132A1F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low-effort fallback alternative */}
              <div className="bg-[#FFE5D9]/50 border border-[#F4A261]/30 rounded-2xl p-3.5 text-xs text-[#6B4435]">
                <span className="font-bold">Zero-Energy Crash Alternative: </span>
                {selectedMeal.lowEffortAlternative}
              </div>
            </div>
          )}

          {/* Recipe list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#132A1F] px-1 uppercase tracking-wider">
              Saved Spoon Recipes ({filteredMeals.length})
            </h4>
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedMeal?.id === meal.id
                    ? 'bg-white border-[#132A1F] shadow-xs'
                    : 'bg-white/80 border-[#132A1F]/10 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#132A1F]">{meal.name}</div>
                  <div className="text-[10px] text-[#132A1F]/60">
                    {meal.spoonCost} Spoon · {meal.prepTimeMinutes} min prep · {meal.difficulty}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#132A1F]/40" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <h3 className="text-base font-bold text-[#132A1F] font-display">
                Generate Spoon-Aware Meal
              </h3>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-xs bg-[#E8EFE9] text-[#132A1F] px-2.5 py-1 rounded-full font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleGenerateRecipe} className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#132A1F]">
                    Current Energy Level (1-10)
                  </label>
                  <span className="text-xs font-bold text-[#FF7A24] tabular-nums">
                    {energyLevel} / 10 ({energyLevel <= 4 ? 'Low Spoons' : 'Moderate Spoons'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-[#FF7A24]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Available Ingredients in Pantry / Fridge
                </label>
                <input
                  type="text"
                  placeholder="e.g. rice, frozen peas, eggs, broth, noodles, tofu"
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#132A1F] block mb-1">
                  Maximum Prep Time
                </label>
                <select
                  value={prepMax}
                  onChange={(e) => setPrepMax(Number(e.target.value))}
                  className="w-full bg-[#F8F6F0] border border-[#132A1F]/15 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value={10}>10 minutes or less (Very low effort)</option>
                  <option value={15}>15 minutes</option>
                  <option value={25}>25 minutes</option>
                </select>
              </div>

              <div className="bg-[#E8EFE9] p-3 rounded-xl text-[11px] text-[#132A1F]/80">
                Dietary profile automatically considered: {userDietaryPreferences.join(', ')}
              </div>

              <button
                type="submit"
                disabled={isGeneratingRecipe}
                className="w-full py-3 rounded-full bg-[#FF7A24] hover:bg-[#E06516] text-white font-bold text-sm shadow-md transition-colors font-display disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingRecipe ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating your gentle recipe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Nourishing Meal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
