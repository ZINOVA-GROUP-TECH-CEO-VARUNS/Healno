import React, { useState } from 'react';
import { Lesson } from '../../types';
import {
  BookOpen,
  Award,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  X,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LearningQuizIllustration, EmptyStateIllustration } from '../common/CodeIllustrations';

interface MythsScreenProps {
  lessons: Lesson[];
  onCompleteLesson: (lessonId: string) => void;
  onBack?: () => void;
}

export const MythsScreen: React.FC<MythsScreenProps> = ({
  lessons,
  onCompleteLesson,
  onBack,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [justCompleted, setJustCompleted] = useState(false);

  const categories = ['all', 'Pacing & Spoons', 'Fatigue Science', 'Advocacy', 'Dysautonomia', 'Gut & Histamine'];

  const filteredLessons = lessons.filter((l) => {
    const matchesCategory = selectedCategory === 'all' || l.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.intro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
    setJustCompleted(false);
  };

  const handleSubmitQuiz = () => {
    if (selectedQuizOption === null || !selectedLesson) return;
    setIsQuizSubmitted(true);
    if (selectedQuizOption === selectedLesson.quiz.correctIndex) {
      onCompleteLesson(selectedLesson.id);
      setJustCompleted(true);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF7A24]" />
            <span>Myths & Evidence Hub</span>
          </h2>
          <p className="text-xs text-[#132A1F]/60">
            Evidence-based chronic health science, myth debunking, and clinical insights
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
          >
            Back
          </button>
        )}
      </div>

      {/* Hero Banner with Code-based illustration */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1.5 max-w-xs z-10">
          <span className="text-[10px] font-bold text-[#FF7A24] uppercase tracking-wider">
            Validated Medical Insights
          </span>
          <h3 className="text-base font-bold font-display text-white">
            Facts Over Myths in Chronic Care
          </h3>
          <p className="text-xs text-white/75 leading-relaxed">
            Short, brain-fog-friendly modules explaining the biology of post-exertional malaise, autonomic regulation, and clinical advocacy.
          </p>
          <div className="pt-1 text-[11px] text-[#B7E4C7] font-semibold">
            {lessons.filter((l) => l.completed).length} of {lessons.length} modules completed
          </div>
        </div>

        <div className="shrink-0 pl-2">
          <LearningQuizIllustration className="w-20 h-20" />
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search health myths, fatigue biology, pacing rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#132A1F]/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF7A24]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#FF7A24] text-white shadow-xs'
                  : 'bg-white text-[#132A1F]/70 border border-[#132A1F]/10 hover:bg-[#F8F6F0]'
              }`}
            >
              {cat === 'all' ? 'All Lessons' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson List */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#132A1F]/10 text-center space-y-3">
          <EmptyStateIllustration type="search" />
          <h4 className="text-sm font-bold text-[#132A1F] font-display">No lessons match your search</h4>
          <p className="text-xs text-[#132A1F]/60">Try searching for other keywords like "pacing" or "mitochondria".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs text-[#FF7A24] font-bold underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => handleOpenLesson(lesson)}
              className="bg-white rounded-2xl p-4.5 border border-[#132A1F]/10 shadow-xs cursor-pointer hover:border-[#FF7A24]/40 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] px-2 py-0.5 rounded-full font-bold">
                    {lesson.category}
                  </span>
                  <span className="text-[10px] text-[#132A1F]/50">
                    {lesson.readingMinutes} min read
                  </span>
                  {lesson.completed && (
                    <span className="text-[10px] bg-[#E8EFE9] text-[#2D6A4F] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#132A1F] group-hover:text-[#FF7A24] transition-colors">
                  {lesson.title}
                </h4>

                <p className="text-xs text-[#132A1F]/65 line-clamp-1">
                  {lesson.keyTakeaway}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#F8F6F0] flex items-center justify-center text-[#132A1F]/40 group-hover:text-[#FF7A24] group-hover:bg-[#FFF4EB] transition-colors shrink-0 ml-3">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Reader & Interactive Mini-Test Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-[#132A1F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg max-h-[90vh] rounded-3xl p-6 shadow-2xl border border-[#132A1F]/10 overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#FFF4EB] text-[#FF7A24] px-2.5 py-0.5 rounded-full font-bold">
                  {selectedLesson.category}
                </span>
                <span className="text-xs text-[#132A1F]/60">
                  {selectedLesson.readingMinutes} min read
                </span>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="w-8 h-8 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]/70 hover:bg-[#d8e3da]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#132A1F] font-display">
                {selectedLesson.title}
              </h3>
              <p className="text-xs text-[#132A1F]/70 mt-1 leading-relaxed">
                {selectedLesson.intro}
              </p>
            </div>

            {/* Bite-sized sections */}
            <div className="space-y-3">
              {selectedLesson.biteSizedSections.map((sec, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 space-y-1.5">
                  <h5 className="text-xs font-bold text-[#132A1F] font-display">{sec.title}</h5>
                  <p className="text-xs text-[#132A1F]/80 leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>

            {/* Key Clinical Takeaway Box */}
            <div className="bg-[#FFF4EB] border border-[#FFE0C8] rounded-2xl p-4 text-xs space-y-1 text-[#6B4435]">
              <div className="font-bold flex items-center gap-1.5 text-[#FF7A24]">
                <Sparkles className="w-4 h-4" />
                <span>Evidence-Backed Core Rule</span>
              </div>
              <p className="leading-relaxed">{selectedLesson.keyTakeaway}</p>
            </div>

            {/* Interactive Knowledge Check Mini-Quiz */}
            <div className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#132A1F] font-display flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#FF7A24]" />
                  <span>Mini Knowledge Check</span>
                </h4>
                <span className="text-[10px] text-[#FF7A24] font-bold">
                  +{selectedLesson.xpReward} XP
                </span>
              </div>

              <p className="text-xs font-semibold text-[#132A1F]">
                {selectedLesson.quiz.question}
              </p>

              <div className="space-y-2">
                {selectedLesson.quiz.options.map((option, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = idx === selectedLesson.quiz.correctIndex;
                  let optionClass = 'bg-[#F8F6F0] text-[#132A1F] border-transparent hover:bg-[#E8EFE9]';

                  if (isQuizSubmitted) {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-50 text-emerald-800 border-emerald-500 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionClass = 'bg-rose-50 text-rose-800 border-rose-400 font-bold';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-[#FFF4EB] text-[#FF7A24] border-[#FF7A24] font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isQuizSubmitted}
                      onClick={() => setSelectedQuizOption(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs border transition-all flex items-center justify-between ${optionClass}`}
                    >
                      <span>{option}</span>
                      {isQuizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              {!isQuizSubmitted ? (
                <button
                  disabled={selectedQuizOption === null}
                  onClick={handleSubmitQuiz}
                  className="w-full py-2.5 rounded-full bg-[#FF7A24] hover:bg-[#E06516] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#FF7A24]/20 transition-all font-display"
                >
                  Check Answer
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#F8F6F0] text-xs space-y-1">
                  <div className="font-bold text-[#132A1F] flex items-center gap-1.5">
                    {selectedQuizOption === selectedLesson.quiz.correctIndex ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Not quite right
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#132A1F]/80 leading-relaxed">
                    {selectedLesson.quiz.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLesson(null)}
                className="px-6 py-2 rounded-full bg-[#132A1F] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
