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
} from 'lucide-react';

interface LearningScreenProps {
  lessons: Lesson[];
  onCompleteLesson: (lessonId: string) => void;
  onBack: () => void;
}

export const LearningScreen: React.FC<LearningScreenProps> = ({
  lessons,
  onCompleteLesson,
  onBack,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
    setReflectionAnswer('');
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
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Interactive Learning Hub</h2>
          <p className="text-xs text-[#132A1F]/60">Evidence-informed pacing, fatigue biology & doctor advocacy</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
        >
          Back
        </button>
      </div>

      {/* Hero Learning Banner */}
      <div className="bg-[#132A1F] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#B7E4C7] uppercase tracking-wider">
            Knowledge & Self-Compassion
          </span>
          <span className="text-xs text-[#B7E4C7]/80">
            {lessons.filter((l) => l.completed).length} / {lessons.length} Completed
          </span>
        </div>

        <h3 className="text-base font-bold font-display text-white">
          Small Insights for Everyday Care
        </h3>
        <p className="text-xs text-white/70 mt-1 max-w-sm">
          Bite-sized modules designed to be read easily with brain fog. Earn XP and badges with no pressure.
        </p>
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => handleOpenLesson(lesson)}
            className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#E8EFE9] text-[#132A1F] px-2 py-0.5 rounded-full font-semibold">
                  {lesson.category}
                </span>
                <span className="text-[10px] text-[#132A1F]/50">
                  {lesson.readingMinutes} min read
                </span>
                {lesson.completed && (
                  <span className="text-[10px] bg-[#D8F3DC] text-[#1B4332] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#132A1F] group-hover:text-[#2D6A4F] transition-colors font-display">
                {lesson.title}
              </h4>
              <p className="text-xs text-[#132A1F]/70 line-clamp-2">
                {lesson.keyTakeaway}
              </p>
            </div>

            <div className="text-right pl-3 shrink-0">
              <span className="text-xs font-bold text-[#E89D35] tabular-nums">
                +{lesson.xpReward} XP
              </span>
              <ChevronRight className="w-4 h-4 text-[#132A1F]/30 ml-auto mt-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#132A1F]/10">
              <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider">
                {selectedLesson.category}
              </span>
              <button
                onClick={() => setSelectedLesson(null)}
                className="w-8 h-8 rounded-full bg-[#E8EFE9] text-[#132A1F] flex items-center justify-center"
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

            {/* Key Takeaway */}
            <div className="bg-[#FFE5D9]/50 border border-[#F4A261]/30 rounded-2xl p-3.5 text-xs text-[#6B4435] leading-relaxed">
              <strong>Core Insight: </strong>
              {selectedLesson.keyTakeaway}
            </div>

            {/* Bite-sized Sections */}
            <div className="space-y-3">
              {selectedLesson.biteSizedSections.map((sec, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 space-y-1.5">
                  <h4 className="text-xs font-bold text-[#132A1F] font-display">{sec.title}</h4>
                  <p className="text-xs text-[#132A1F]/80 leading-relaxed">{sec.content}</p>
                  {sec.visualHint && (
                    <div className="text-[11px] text-[#2D6A4F] bg-[#E8EFE9]/40 p-2 rounded-xl mt-1">
                      {sec.visualHint}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Knowledge Check Quiz */}
            <div className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E89D35]" />
                <h4 className="text-xs font-bold text-[#132A1F] font-display uppercase tracking-wider">
                  Gentle Knowledge Check
                </h4>
              </div>

              <p className="text-xs font-semibold text-[#132A1F]">
                {selectedLesson.quiz.question}
              </p>

              <div className="space-y-2">
                {selectedLesson.quiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  let btnStyle = 'bg-[#F8F6F0] text-[#132A1F] border-[#132A1F]/10';

                  if (isQuizSubmitted) {
                    if (idx === selectedLesson.quiz.correctIndex) {
                      btnStyle = 'bg-[#D8F3DC] border-[#74C69D] text-[#1B4332] font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-[#FFE5D9] border-[#E76F51] text-[#6B4435]';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-[#132A1F] text-white border-[#132A1F] font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isQuizSubmitted && setSelectedQuizOption(idx)}
                      disabled={isQuizSubmitted}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!isQuizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={selectedQuizOption === null}
                  className="w-full py-2.5 rounded-xl bg-[#132A1F] hover:bg-[#2D6A4F] disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                >
                  Verify Answer
                </button>
              ) : (
                <div className="p-3 bg-[#E8EFE9] rounded-xl text-xs text-[#132A1F]/90">
                  <div className="font-bold mb-0.5">
                    {selectedQuizOption === selectedLesson.quiz.correctIndex
                      ? '✓ Well done! +30 XP Awarded'
                      : 'Reflection Note:'}
                  </div>
                  {selectedLesson.quiz.explanation}
                </div>
              )}
            </div>

            {/* Reflection Note */}
            <div className="bg-white rounded-2xl p-4 border border-[#132A1F]/10 space-y-2">
              <h4 className="text-xs font-bold text-[#132A1F] font-display">Personal Reflection</h4>
              <p className="text-xs text-[#132A1F]/70 italic">"{selectedLesson.reflectionPrompt}"</p>
              <textarea
                placeholder="Jot down a quick thought (saved for you)..."
                value={reflectionAnswer}
                onChange={(e) => setReflectionAnswer(e.target.value)}
                rows={2}
                className="w-full bg-[#F8F6F0] rounded-xl p-2.5 text-xs border border-[#132A1F]/10 focus:outline-none"
              />
            </div>

            {/* Completion Badge Notification */}
            {justCompleted && (
              <div className="bg-[#FFFDF9] border border-[#E89D35] rounded-2xl p-3.5 text-center space-y-1 animate-in zoom-in-95">
                <Sparkles className="w-6 h-6 text-[#E89D35] mx-auto" />
                <div className="text-xs font-bold text-[#132A1F]">
                  Badge Unlocked: {selectedLesson.badgeName}!
                </div>
                <p className="text-[11px] text-[#132A1F]/70">
                  Added to your profile achievements. Keep honoring your gentle pace.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
