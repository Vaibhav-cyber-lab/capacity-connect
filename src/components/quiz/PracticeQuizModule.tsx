import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lightbulb, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  Check
} from 'lucide-react';
import { Assessment, Question } from '../../types';

interface PracticeQuizModuleProps {
  assessment: Assessment;
  onComplete: (score: number, maxScore: number, xpEarned: number) => void;
  onExit: () => void;
  onAskAITutor?: (questionContext: string) => void;
}

export const PracticeQuizModule: React.FC<PracticeQuizModuleProps> = ({
  assessment,
  onComplete,
  onExit,
  onAskAITutor,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Timer state
  const totalDurationSeconds = (assessment.durationMinutes || 5) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || isTimerPaused) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, isTimerPaused]);

  const questions = assessment.questions || [];
  const currentQuestion = questions[currentIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const toggleHint = (questionId: string) => {
    setRevealedHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Submit and calculate results
  const handleSubmitQuiz = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setIsTimerPaused(true);

    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    const xpEarned = percent >= (assessment.passingScorePercent || 70) 
      ? (assessment.xpReward || 50) 
      : Math.round((assessment.xpReward || 50) * 0.5);

    onComplete(correctCount, questions.length, xpEarned);
  };

  // Retake quiz
  const handleRetake = () => {
    setSelectedAnswers({});
    setRevealedHints({});
    setIsSubmitted(false);
    setSecondsRemaining(totalDurationSeconds);
    setIsTimerPaused(false);
    setCurrentIndex(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctOptionId).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const isTimeLow = secondsRemaining <= 60 && !isSubmitted;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Bar / Progress & Timer Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onExit}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-1 inline-flex items-center gap-1"
          >
            &larr; Exit Assessment
          </button>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate max-w-md">
            {assessment.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Answered Counter */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            {answeredCount} of {questions.length} Answered
          </div>

          {/* Countdown Timer */}
          <div 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              isTimeLow 
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse' 
                : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isSubmitted ? 'Completed' : formatTime(secondsRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Results Summary Card when Submitted */}
      {isSubmitted && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-500/30 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/30">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                Assessment Results
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">
                {scorePercent >= (assessment.passingScorePercent || 70) ? '🎉 Mastery Achieved!' : '💪 Keep Practicing!'}
              </h3>
              <p className="text-indigo-200 text-sm mt-1">
                You scored <span className="font-bold text-white">{correctCount}</span> out of{' '}
                <span className="font-bold text-white">{questions.length}</span> ({scorePercent}%)
              </p>
            </div>

            {/* Score & XP breakdown pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-indigo-300 uppercase block font-semibold">XP Reward</span>
                <span className="text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  +{scorePercent >= 70 ? (assessment.xpReward || 50) : Math.round((assessment.xpReward || 50) * 0.5)} XP
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-[11px] text-indigo-300 uppercase block font-semibold">Status</span>
                <span className={`text-base font-extrabold mt-1 block ${scorePercent >= 70 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {scorePercent >= 70 ? 'Passed' : 'Needs Review'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Practice Test
              </button>
              <button
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                Back to Dashboard &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Stepper Indicator */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {questions.map((q, idx) => {
          const isSelected = selectedAnswers[q.id] !== undefined;
          const isCurrent = idx === currentIndex;
          let statusColor = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
          
          if (isSubmitted) {
            if (selectedAnswers[q.id] === q.correctOptionId) {
              statusColor = 'bg-emerald-500 text-white';
            } else {
              statusColor = 'bg-rose-500 text-white';
            }
          } else if (isSelected) {
            statusColor = 'bg-indigo-600 text-white';
          }

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${statusColor} ${
                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'hover:opacity-80'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Question Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Step-by-Step Hint Toggle Button */}
            {currentQuestion.hint && (
              <button
                onClick={() => toggleHint(currentQuestion.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-xs font-bold"
                title="Get a helpful step-by-step hint without spoiling answer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{revealedHints[currentQuestion.id] ? 'Hide Hint' : '💡 Need a Hint?'}</span>
              </button>
            )}
          </div>

          {/* Hint Expander Box */}
          {revealedHints[currentQuestion.id] && currentQuestion.hint && (
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in duration-150">
              <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 uppercase tracking-wide text-[10px]">
                <Lightbulb className="w-3.5 h-3.5" />
                Step-by-Step Hint:
              </span>
              <p className="leading-relaxed">{currentQuestion.hint}</p>
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;
              const isCorrect = option.id === currentQuestion.correctOptionId;

              let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';

              if (isSubmitted) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100 font-semibold ring-1 ring-indigo-600 dark:ring-indigo-400';
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  disabled={isSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${optionStyle} ${
                    !isSubmitted ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                      {option.id.replace('o', '')}
                    </span>
                    <span>{option.text}</span>
                  </div>

                  {isSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Submission */}
          {isSubmitted && currentQuestion.explanation && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Step-by-Step Explanation &amp; Key Concept
                </h4>
                {onAskAITutor && (
                  <button
                    onClick={() => onAskAITutor(`Explain why this answer is correct: Question: "${currentQuestion.text}", Answer: "${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text}"`)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Deep Dive with AI
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Navigation & Submit Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                !isSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={answeredCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Submit &amp; View Feedback
                  </button>
                )
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
