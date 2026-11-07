import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  Zap, 
  Search, 
  HelpCircle,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { playClickSound, playTaskCompleteSound, playWrongSound } from '../utils/audio';

// Dataset provided by user
export const AERO_CONVERSION_DATA: Record<string, Record<string, number>> = {
  Distances: {
    "NM vers km": 1.852,
    "NM vers m": 1852,
    "NM vers ft": 6076.12,
    "mi vers km": 1.60934,
    "mi vers m": 1609.34,
    "mi vers ft": 5280,
    "ft vers m": 0.3048,
    "ft vers cm": 30.48,
    "ft vers in": 12,
    "in vers cm": 2.54,
    "in vers mm": 25.4,
    "yd vers m": 0.9144,
    "yd vers ft": 3,
    "fathom vers m": 1.8288
  },
  Vitesses: {
    "kt vers km/h": 1.852,
    "kt vers m/s": 0.5144,
    "mph vers km/h": 1.60934,
    "mph vers m/s": 0.44704,
    "mph vers kt": 0.868976,
    "ft/min vers m/s": 0.00508,
    "m/s vers km/h": 3.6,
    "m/s vers kt": 1.94384
  },
  Volumes: {
    "gal US vers L": 3.78541,
    "gal UK vers L": 4.54609,
    "bbl vers L": 158.987,
    "ft³ vers L": 28.3168,
    "in³ vers cm³": 16.3871,
    "m³ vers L": 1000
  },
  Masses_Forces: {
    "lb vers kg": 0.453592,
    "oz vers g": 28.3495,
    "Slug vers kg": 14.5939,
    "kgf vers N": 9.80665,
    "lbf vers N": 4.44822
  },
  Pressions: {
    "inHg vers hPa": 33.8639,
    "mmHg vers hPa": 1.33322,
    "PSI vers hPa": 68.9476,
    "PSI vers bar": 0.0689476,
    "atm vers Pa": 101325,
    "bar vers Pa": 100000
  },
  Energie_Puissance: {
    "BTU vers J": 1055.06,
    "cal vers J": 4.184,
    "kWh vers J": 3600000,
    "hp US vers W": 745.7,
    "ch vers W": 735.5
  }
};

type ViewMode = 'list' | 'exos' | 'flashcards';

interface FlatConversion {
  category: string;
  key: string;
  fromUnit: string;
  toUnit: string;
  rate: number;
}

export const AeroConversionModule: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Flattened data array for quick indexing and quizzes
  const allConversions: FlatConversion[] = useMemo(() => {
    const list: FlatConversion[] = [];
    Object.entries(AERO_CONVERSION_DATA).forEach(([category, items]) => {
      Object.entries(items).forEach(([key, rate]) => {
        const parts = key.split(' vers ');
        list.push({
          category,
          key,
          fromUnit: parts[0] || '',
          toUnit: parts[1] || '',
          rate,
        });
      });
    });
    return list;
  }, []);

  // Filtered list
  const filteredConversions = useMemo(() => {
    return allConversions.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = searchTerm === '' || 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allConversions, selectedCategory, searchTerm]);

  // =========================================================================
  // 1. LISTE CLASSIQUE - CALCULATEUR INTERACTIF EN DIRECT
  // =========================================================================
  const [customMultipliers, setCustomMultipliers] = useState<Record<string, number>>({});

  const handleMultiplierChange = (key: string, val: number) => {
    setCustomMultipliers(prev => ({ ...prev, [key]: val }));
  };

  // =========================================================================
  // 2. EXOS RAPIDES STATE
  // =========================================================================
  const [exerciseQuestion, setExerciseQuestion] = useState<{
    item: FlatConversion;
    value: number;
    expected: number;
  } | null>(null);

  const [userAnswer, setUserAnswer] = useState('');
  const [exerciseStatus, setExerciseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exerciseFeedback, setExerciseFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const generateExercise = () => {
    if (allConversions.length === 0) return;
    const item = allConversions[Math.floor(Math.random() * allConversions.length)];
    // Pick realistic numbers (e.g. 5, 10, 15, 20, 25, 50, 100 or random 2 to 60)
    const commonValues = [2, 5, 10, 12, 15, 20, 25, 30, 45, 50, 60, 80, 100, 150];
    const value = commonValues[Math.floor(Math.random() * commonValues.length)];
    const expected = Number((value * item.rate).toFixed(4));

    setExerciseQuestion({ item, value, expected });
    setUserAnswer('');
    setExerciseStatus('idle');
    setExerciseFeedback('');
  };

  useEffect(() => {
    if (activeView === 'exos' && !exerciseQuestion) {
      generateExercise();
    }
  }, [activeView]);

  const handleValidateExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!exerciseQuestion || !userAnswer.trim()) return;

    const parsed = parseFloat(userAnswer.replace(',', '.').trim());
    if (isNaN(parsed)) return;

    setTotalAttempts(prev => prev + 1);
    const expected = exerciseQuestion.expected;
    
    // Check 1% tolerance: Math.abs(parsed - expected) <= expected * 0.01
    const allowedMargin = Math.max(0.001, Math.abs(expected) * 0.01);
    const isCorrect = Math.abs(parsed - expected) <= allowedMargin;

    if (isCorrect) {
      playTaskCompleteSound();
      setExerciseStatus('success');
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setExerciseFeedback(`Exact ! ${exerciseQuestion.value} ${exerciseQuestion.item.fromUnit} = ${expected} ${exerciseQuestion.item.toUnit} (Facteur : ×${exerciseQuestion.item.rate})`);

      // Auto advance
      setTimeout(() => {
        generateExercise();
      }, 1500);
    } else {
      playWrongSound();
      setExerciseStatus('error');
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setExerciseFeedback(`Pas tout à fait ! Réponse attendue : ≈ ${expected} ${exerciseQuestion.item.toUnit} (Facteur : ×${exerciseQuestion.item.rate})`);
    }
  };

  // =========================================================================
  // 3. QUIZ FLASHCARDS STATE
  // =========================================================================
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardSampleVal, setCardSampleVal] = useState(10);

  const currentFlashcard = allConversions[flashcardIndex] || allConversions[0];

  const handleNextCard = () => {
    playClickSound();
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex(prev => (prev + 1) % allConversions.length);
      setCardSampleVal([5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)]);
    }, 150);
  };

  const handlePrevCard = () => {
    playClickSound();
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex(prev => (prev - 1 + allConversions.length) % allConversions.length);
      setCardSampleVal([5, 10, 15, 20, 25, 50][Math.floor(Math.random() * 6)]);
    }, 150);
  };

  const handleToggleFlip = () => {
    playClickSound();
    setIsFlipped(prev => !prev);
  };

  const categoriesList = ['all', 'Distances', 'Vitesses', 'Volumes', 'Masses_Forces', 'Pressions', 'Energie_Puissance'];

  const categoryLabels: Record<string, string> = {
    all: 'Toutes',
    Distances: 'Distances',
    Vitesses: 'Vitesses',
    Volumes: 'Volumes',
    Masses_Forces: 'Masses & Forces',
    Pressions: 'Pressions',
    Energie_Puissance: 'Énergie & Puiss.',
  };

  return (
    <div className="aero-conversion-module space-y-4 font-sans text-slate-100">
      {/* Mini-Navigation Interne (Tabs Pilules) */}
      <div className="bg-[#151B2B] p-1.5 rounded-2xl border border-indigo-950/60 shadow-lg flex items-center justify-between gap-1.5">
        <button
          onClick={() => {
            playClickSound();
            setActiveView('list');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeView === 'list'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Liste Classique</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveView('exos');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeView === 'exos'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Exos Rapides</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveView('flashcards');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeView === 'flashcards'
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Flashcards 3D</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* VUE 1 : LISTE CLASSIQUE D'ENSEMBLE                                 */}
      {/* =================================================================== */}
      {activeView === 'list' && (
        <div className="space-y-3.5">
          {/* Header Card & Filter Bar */}
          <div className="bg-[#151B2B] p-4 rounded-2xl border border-indigo-950/60 shadow-md space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-[#6366F1]">
                  <Compass className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">
                  Tableau Aéro & Unités Internationales
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-800/40">
                {filteredConversions.length} ratios
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une unité (ex: NM, kt, PSI, bar, gal)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0D121F] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6366F1] transition-colors"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categoriesList.map((catKey) => {
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    onClick={() => {
                      playClickSound();
                      setSelectedCategory(catKey);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#6366F1] text-white shadow-xs'
                        : 'bg-[#0D121F] text-slate-400 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {categoryLabels[catKey] || catKey}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversions Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredConversions.map((conv) => {
              const testVal = customMultipliers[conv.key] ?? 1;
              const convertedVal = (testVal * conv.rate).toFixed(testVal === 1 ? 4 : 2);

              return (
                <div
                  key={conv.key}
                  className="bg-[#151B2B] p-3.5 rounded-2xl border border-indigo-950/50 hover:border-indigo-600/60 shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] block">
                        {conv.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span className="text-indigo-200">{conv.fromUnit}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[#38BDF8]">{conv.toUnit}</span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Facteur</span>
                      <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/40">
                        × {conv.rate}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Live Converter Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#0D121F] px-2 py-1 rounded-lg border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-medium">Pour</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={testVal}
                        onChange={(e) => handleMultiplierChange(conv.key, Math.max(0, Number(e.target.value)))}
                        className="w-12 bg-transparent text-white font-mono font-bold text-center focus:outline-none"
                      />
                      <span className="text-[10px] text-indigo-400 font-semibold">{conv.fromUnit}</span>
                    </div>

                    <div className="font-mono text-xs font-bold text-emerald-400 truncate text-right">
                      = {convertedVal} <span className="text-[10px] text-emerald-300 font-sans">{conv.toUnit}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversions.length === 0 && (
              <div className="col-span-full bg-[#151B2B] p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  Aucune conversion trouvée pour cette recherche.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VUE 2 : EXOS RAPIDES AVEC TOLÉRANCE 1%                             */}
      {/* =================================================================== */}
      {activeView === 'exos' && (
        <div className="space-y-3.5">
          {/* Score Header */}
          <div className="bg-[#151B2B] p-4 rounded-2xl border border-indigo-950/60 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-[#6366F1] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Entraînement Dynamique
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tolérance automatique de 1% sur les arrondis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              {streak > 1 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{streak} Série</span>
                </div>
              )}
              <div className="font-mono text-sm font-extrabold text-white">
                <span className="text-emerald-400">{score}</span>
                <span className="text-slate-500"> / {totalAttempts}</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          {exerciseQuestion && (
            <div 
              style={{
                animation: isShaking ? 'shake 0.4s ease-in-out' : undefined
              }}
              className={`bg-[#151B2B] p-6 rounded-2xl border transition-all shadow-xl space-y-5 ${
                exerciseStatus === 'success'
                  ? 'border-emerald-500/70 shadow-emerald-500/15'
                  : exerciseStatus === 'error'
                  ? 'border-rose-500/70 shadow-rose-500/15'
                  : 'border-indigo-950/80'
              }`}
            >
              <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                  Catégorie : {exerciseQuestion.item.category.replace('_', ' ')}
                </span>

                <div className="py-2">
                  <span className="text-xs text-slate-400 font-medium block mb-1">
                    Calculez la conversion :
                  </span>
                  <div className="text-2xl font-black text-white tracking-wide">
                    Convertir <span className="text-[#38BDF8]">{exerciseQuestion.value}</span> {exerciseQuestion.item.fromUnit} en{' '}
                    <span className="text-indigo-400 underline decoration-indigo-500/60 underline-offset-4">{exerciseQuestion.item.toUnit}</span>
                  </div>
                </div>
              </div>

              {/* Saisie Utilisateur */}
              <form onSubmit={handleValidateExercise} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={`Résultat en ${exerciseQuestion.item.toUnit}...`}
                      className={`w-full bg-[#0D121F] border rounded-xl py-3 px-4 font-mono font-bold text-center text-lg text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        exerciseStatus === 'success'
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                          : exerciseStatus === 'error'
                          ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                          : 'border-slate-800 focus:border-[#6366F1]'
                      }`}
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      {exerciseQuestion.item.toUnit}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="min-h-[50px] px-5 rounded-xl bg-[#6366F1] hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all"
                  >
                    <span>Vérifier</span>
                  </button>
                </div>

                {/* Instant Feedback Message */}
                {exerciseFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      exerciseStatus === 'success'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    {exerciseStatus === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="leading-tight">{exerciseFeedback}</span>
                  </div>
                )}
              </form>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    generateExercise();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Passer à la suivante</span>
                </button>

                <div className="text-[11px] text-slate-500 font-mono">
                  Formule : × {exerciseQuestion.item.rate}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* VUE 3 : QUIZ FLASHCARDS 3D FLIP                                    */}
      {/* =================================================================== */}
      {activeView === 'flashcards' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-[#151B2B] p-3.5 rounded-2xl border border-indigo-950/60 shadow-md flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Flashcard <strong className="text-white font-mono">{flashcardIndex + 1}</strong> / {allConversions.length}
            </span>

            <span className="text-indigo-400 font-semibold px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-[11px]">
              {currentFlashcard.category.replace('_', ' ')}
            </span>
          </div>

          {/* Central 3D Flip Card Container */}
          <div
            onClick={handleToggleFlip}
            className="cursor-pointer select-none"
            style={{ perspective: '1200px' }}
          >
            <div
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '230px',
              }}
              className="relative w-full rounded-2xl shadow-xl"
            >
              {/* RECTO (Front) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="absolute inset-0 bg-[#151B2B] border-2 border-indigo-600/40 hover:border-indigo-500 rounded-2xl p-6 flex flex-col justify-between shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-[#6366F1] uppercase">
                    QUESTION FLIP
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    Touchez pour révéler
                  </span>
                </div>

                <div className="text-center py-4 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-xs font-bold text-indigo-300">
                    <span>{currentFlashcard.fromUnit}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{currentFlashcard.toUnit}</span>
                  </div>

                  <div className="text-2xl font-black text-white">
                    Convertir <span className="text-[#38BDF8]">{cardSampleVal}</span> {currentFlashcard.fromUnit} en{' '}
                    <span className="text-indigo-400">{currentFlashcard.toUnit}</span> ?
                  </div>
                  <p className="text-xs text-slate-400">
                    Quel est le multiplicateur exact ?
                  </p>
                </div>

                <div className="text-center text-[11px] text-slate-500">
                  Cliquez sur la carte pour retourner ↻
                </div>
              </div>

              {/* VERSO (Back) */}
              <div
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] to-[#151B2B] border-2 border-[#6366F1] rounded-2xl p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SOLUTION & FACTEUR
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    1 {currentFlashcard.fromUnit} = {currentFlashcard.rate} {currentFlashcard.toUnit}
                  </span>
                </div>

                <div className="text-center py-4 space-y-1.5">
                  <div className="text-xs text-slate-300 font-medium">
                    Calcul : {cardSampleVal} × {currentFlashcard.rate}
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                    = {(cardSampleVal * currentFlashcard.rate).toFixed(3)} <span className="text-lg text-emerald-200 font-sans">{currentFlashcard.toUnit}</span>
                  </div>
                  <p className="text-xs text-indigo-200 font-mono bg-indigo-950/60 py-1 px-3 rounded-lg inline-block border border-indigo-800/40">
                    Règle : Multiplier par {currentFlashcard.rate}
                  </p>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Touchez à nouveau pour masquer
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevCard}
              className="flex-1 py-3 px-4 rounded-xl bg-[#151B2B] hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <button
              onClick={handleToggleFlip}
              className="py-3 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'Masquer' : 'Révéler'}</span>
            </button>

            <button
              onClick={handleNextCard}
              className="flex-1 py-3 px-4 rounded-xl bg-[#6366F1] hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-indigo-500/25"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Shake Keyframe Injection for strictly scoped animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
