import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  RotateCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Lightbulb,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Flashcard, CheatSheet, QuickNote } from '../../types';

interface ResourceHubProps {
  flashcards: Flashcard[];
  cheatSheets: CheatSheet[];
  quickNotes: QuickNote[];
  onToggleFlashcardMastered: (id: string) => void;
  onRequestCustomTopic?: (topic: string) => void;
}

export const ResourceHub: React.FC<ResourceHubProps> = ({
  flashcards,
  cheatSheets,
  quickNotes,
  onToggleFlashcardMastered,
  onRequestCustomTopic,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'cheatsheets' | 'notes'>('flashcards');
  
  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardCategoryFilter, setCardCategoryFilter] = useState('All');
  
  // CheatSheet state
  const [selectedCheatSheet, setSelectedCheatSheet] = useState<CheatSheet | null>(cheatSheets[0] || null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Search state
  const [resourceSearch, setResourceSearch] = useState('');

  // Flashcards filtering
  const categories = ['All', ...Array.from(new Set(flashcards.map(f => f.category)))];
  const filteredFlashcards = cardCategoryFilter === 'All'
    ? flashcards
    : flashcards.filter(f => f.category === cardCategoryFilter);

  const currentCard = filteredFlashcards[currentCardIndex] || filteredFlashcards[0];
  const masteredCount = flashcards.filter(f => f.mastered).length;

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % filteredFlashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + filteredFlashcards.length) % filteredFlashcards.length);
  };

  const copyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Download cheat sheet as text file
  const downloadCheatSheet = (cs: CheatSheet) => {
    const blob = new Blob([cs.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cs.title.replace(/\s+/g, '_')}_CheatSheet.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Academic Vault
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Resource &amp; Knowledge Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Reinforce learning through interactive 3D flashcards, production cheat sheets, and high-yield notes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('cheatsheets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cheatsheets'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Cheat Sheets ({cheatSheets.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Notes ({quickNotes.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive 3D Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          
          {/* Category Filters & Mastery Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCardCategoryFilter(cat);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    cardCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{masteredCount} of {flashcards.length} Cards Mastered</span>
            </div>
          </div>

          {/* Flashcard 3D Stage */}
          {currentCard && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Flip Card Container */}
              <div 
                className="perspective-1000 cursor-pointer min-h-[340px]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-lg border border-slate-200 dark:border-slate-800 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                          {currentCard.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Card {currentCardIndex + 1} of {filteredFlashcards.length}
                        </span>
                      </div>

                      <div className="py-10 text-center space-y-3">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Question / Concept</span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                          {currentCard.front}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-indigo-500" /> Click anywhere to reveal answer
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentCard.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                        currentCard.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {currentCard.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-8 rounded-3xl flex flex-col justify-between border border-indigo-500/30">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                          💡 Core Solution &amp; Answer
                        </span>
                        <span className="text-xs font-bold text-indigo-300">
                          Back of Card
                        </span>
                      </div>

                      <div className="py-6 space-y-3">
                        <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-medium">
                          {currentCard.back}
                        </p>

                        {currentCard.codeSnippet && (
                          <pre className="mt-2 p-3 bg-black/40 rounded-xl font-mono text-xs text-emerald-300 border border-white/10 overflow-x-auto text-left">
                            <code>{currentCard.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-indigo-300">
                      <span>Click card to flip back</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFlashcardMastered(currentCard.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors ${
                          currentCard.mastered
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-white/15 text-white hover:bg-white/25'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {currentCard.mastered ? 'Mastered!' : 'Mark as Mastered'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handlePrevCard}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Card
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <RotateCw className="w-4 h-4" />
                  Flip Card
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Next Card
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cheat Sheets */}
      {activeTab === 'cheatsheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of Cheat Sheets */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
              Available References ({cheatSheets.length})
            </h3>
            <div className="space-y-2">
              {cheatSheets.map((cs) => {
                const isSelected = selectedCheatSheet?.id === cs.id;
                return (
                  <button
                    key={cs.id}
                    onClick={() => setSelectedCheatSheet(cs)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        {cs.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{cs.readTime}</span>
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold ${
                      isSelected ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {cs.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {cs.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cs.tags.map(t => (
                        <span key={t} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cheat Sheet Viewer */}
          <div className="lg:col-span-2">
            {selectedCheatSheet ? (
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                
                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {selectedCheatSheet.category} • {selectedCheatSheet.readTime}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {selectedCheatSheet.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyContent(selectedCheatSheet.content, selectedCheatSheet.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Copy Markdown"
                    >
                      {copiedCodeId === selectedCheatSheet.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy
                    </button>
                    <button
                      onClick={() => downloadCheatSheet(selectedCheatSheet)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Download Markdown Sheet"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .md
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-4 prose-table:w-full prose-th:p-2 prose-td:p-2 prose-td:border prose-th:border dark:prose-td:border-slate-700 dark:prose-th:border-slate-700">
                  <ReactMarkdown>{selectedCheatSheet.content}</ReactMarkdown>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                Select a cheat sheet to view details.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Quick Notes */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    {note.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{note.readTime} read</span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {note.title}
                </h4>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High-Yield Points:</span>
                  <ul className="space-y-1.5">
                    {note.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  💡 {note.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
