import React, { useState } from 'react';
import { MealRecipe } from '../../types';
import {
  Utensils,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';
import { apiService } from '../../services/api';

interface MealsScreenProps {
  meals: MealRecipe[];
  remainingSpoons: number;
  userDietaryPreferences: string[];
  onSaveMeal: (meal: MealRecipe) => void;
  onBack: () => void;
}

export const MealsScreen: React.FC<MealsScreenProps> = ({
  meals,
  remainingSpoons,
  userDietaryPreferences,
  onSaveMeal,
  onBack,
}) => {
  const [selectedMeal, setSelectedMeal] = useState<MealRecipe | null>(meals[0] || null);
  const [spoonFilter, setSpoonFilter] = useState<number | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Generator form
  const [energyLevel, setEnergyLevel] = useState<number>(remainingSpoons > 4 ? 6 : 3);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [prepMax, setPrepMax] = useState(15);

  const filteredMeals = meals.filter((m) => {
    if (spoonFilter === 'all') return true;
    return m.spoonCost === spoonFilter;
  });

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

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
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Personalized Meal Discovery</h2>
          <p className="text-xs text-[#132A1F]/60">Spoon-aware nourishment tailored to your capacity</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
        >
          Back
        </button>
      </div>

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
          className="px-3.5 py-2 rounded-2xl bg-[#E89D35] hover:bg-[#d88d25] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
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
                <span className="text-xs bg-[#E89D35] text-white px-2.5 py-0.5 rounded-full font-bold">
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
                  <span className="text-xs font-bold text-[#E89D35] tabular-nums">
                    {energyLevel} / 10 ({energyLevel <= 4 ? 'Low Spoons' : 'Moderate Spoons'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-[#E89D35]"
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
                disabled={isGenerating}
                className="w-full py-3 rounded-full bg-[#132A1F] hover:bg-[#2D6A4F] text-white font-bold text-sm shadow-md transition-colors font-display disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
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
