import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  TrendingUp, 
  Plane, 
  Calculator, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  ArrowRight, 
  HelpCircle,
  Activity,
  ChevronRight,
  Zap,
  Check
} from 'lucide-react';
import { playClickSound, playTaskCompleteSound, playWrongSound } from '../utils/audio';
import { AeroConversionModule } from './AeroConversionModule';
import { TradingMindmap3D } from './TradingMindmap3D';

type AutomatismeSubSection = 'math' | 'aero' | 'trading';
type MathSubTab = 'test' | 'tips';

export const AutomatismeView: React.FC = () => {
  // Main sub-ensemble switcher
  const [activeSubSection, setActiveSubSection] = useState<AutomatismeSubSection>('math');

  // Math sub-ensemble tabs: Mini-test & Tips du monde
  const [activeMathTab, setActiveMathTab] = useState<MathSubTab>('test');

  // =========================================================================
  // 1. MINI-TEST CALCUL MENTAL (Multiplications 1 à 10 & Divisions Rapides)
  // =========================================================================
  const [testMode, setTestMode] = useState<'mult' | 'div' | 'mix'>('mult');
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(8);
  const [operation, setOperation] = useState<'×' | '÷'>('×');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [correctAnswer, setCorrectAnswer] = useState(56);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [explanation, setExplanation] = useState('');

  // Generate a new question
  const generateQuestion = (mode = testMode) => {
    setUserAnswer('');
    setFeedback('idle');

    if (mode === 'mult') {
      // Basic 1 to 10 multiplications (easy level)
      const a = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const b = Math.floor(Math.random() * 10) + 1; // 1 to 10
      setNumA(a);
      setNumB(b);
      setOperation('×');
      setCorrectAnswer(a * b);
    } else if (mode === 'div') {
      // Rapid division: ensure integer division from 1 to 10 tables!
      const divisor = Math.floor(Math.random() * 9) + 2; // 2 to 10
      const quotient = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const dividend = divisor * quotient;
      setNumA(dividend);
      setNumB(divisor);
      setOperation('÷');
      setCorrectAnswer(quotient);
    } else {
      // Mix
      if (Math.random() > 0.5) {
        generateQuestion('mult');
      } else {
        generateQuestion('div');
      }
    }
  };

  useEffect(() => {
    generateQuestion(testMode);
  }, [testMode]);

  const handleValidateAnswer = (answerValue = userAnswer) => {
    if (!answerValue.trim()) return;
    const parsed = parseInt(answerValue.trim(), 10);
    setTotalAnswered((prev) => prev + 1);

    if (parsed === correctAnswer) {
      playTaskCompleteSound();
      setFeedback('correct');
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setExplanation(`Excellent ! ${numA} ${operation} ${numB} = ${correctAnswer}`);

      // Auto advance to next question after 800ms
      setTimeout(() => {
        generateQuestion();
      }, 900);
    } else {
      playWrongSound();
      setFeedback('wrong');
      setStreak(0);
      setExplanation(`Faux ! La bonne réponse était : ${numA} ${operation} ${numB} = ${correctAnswer}`);
    }
  };

  const handleKeypadPress = (val: string) => {
    playClickSound();
    if (val === 'C') {
      setUserAnswer('');
      setFeedback('idle');
    } else if (val === 'ENTER') {
      handleValidateAnswer();
    } else {
      if (userAnswer.length < 4) {
        const nextVal = userAnswer + val;
        setUserAnswer(nextVal);
        // Optional instant auto-validation if length matches expected answer length
        if (parseInt(nextVal, 10) === correctAnswer) {
          handleValidateAnswer(nextVal);
        }
      }
    }
  };

  const resetTestStats = () => {
    playClickSound();
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    generateQuestion();
  };

  // =========================================================================
  // 2. TIPS & METHODOLOGIES DU MONDE ENTIER
  // =========================================================================
  const [selectedTipCategory, setSelectedTipCategory] = useState<'division' | 'vedique' | 'japonaise' | 'carres'>('division');

  // Interactive demonstrator state
  const [demoInput, setDemoInput] = useState(145);





  return (
    <div className="flex-1 p-4 pb-20 space-y-4 animate-fade-in">
      {/* Top Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Automatisme & Systèmes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calcul mental accéléré, méthodologies mondiales & trading
            </p>
          </div>
        </div>
      </div>

      {/* Main Sub-Ensemble Switcher: Math vs Définition Aéro vs Trading */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubSection('math');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubSection === 'math'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Option Math</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubSection('aero');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubSection === 'aero'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Plane className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Définition Aéro</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            setActiveSubSection('trading');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubSection === 'trading'
              ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Trading</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. SOUS-ENSEMBLE: OPTION MATH & CALCUL                         */}
      {/* ============================================================== */}
      {activeSubSection === 'math' && (
        <div className="space-y-4">
          {/* Inner Navigation inside Math: Mini-test & Tips du monde */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                playClickSound();
                setActiveMathTab('test');
              }}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeMathTab === 'test'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Mini-Test (1 à 10)</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveMathTab('tips');
              }}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeMathTab === 'tips'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Tips & Méthodes Monde</span>
            </button>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* MATH TAB 1: MINI-TEST MULTIPLICATIONS 1 À 10 & DIVISIONS    */}
          {/* ------------------------------------------------------------ */}
          {activeMathTab === 'test' && (
            <div className="space-y-4">
              {/* Mode Selector & Stats Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Entraînement Calcul Mental
                  </span>

                  <div className="flex items-center gap-1.5 font-mono-numbers text-xs">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{streak} Série</span>
                    </span>
                    <button
                      onClick={resetTestStats}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Réinitialiser le score"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-mode selector */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
                  <button
                    onClick={() => {
                      playClickSound();
                      setTestMode('mult');
                    }}
                    className={`py-1.5 rounded-xl text-center transition-all ${
                      testMode === 'mult'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Multiplications (1-10)
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setTestMode('div');
                    }}
                    className={`py-1.5 rounded-xl text-center transition-all ${
                      testMode === 'div'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Divisions Rapides
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setTestMode('mix');
                    }}
                    className={`py-1.5 rounded-xl text-center transition-all ${
                      testMode === 'mix'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Mix Rapide
                  </button>
                </div>

                {/* Accuracy progress */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-numbers pt-1">
                  <span>Score: {score} / {totalAnswered} ({totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 100}%)</span>
                  <span>Niveau: Facile & Réactif</span>
                </div>
              </div>

              {/* Main Flashcard Exercise Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
                <span className="text-xs font-medium text-slate-400">
                  {operation === '×' ? 'Multiplication de base (1 à 10)' : 'Division mentale rapide'}
                </span>

                {/* Big Formula Display */}
                <div className="py-2 flex items-center justify-center gap-3">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white font-mono-numbers">
                    {numA} {operation} {numB}
                  </span>
                  <span className="text-4xl font-extrabold text-slate-400">=</span>
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono-numbers min-w-[70px] border-b-2 border-indigo-500 pb-1">
                    {userAnswer || '?'}
                  </span>
                </div>

                {/* Instant Feedback Banner: VRAI ou FAUX */}
                {feedback === 'correct' && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    <span>VRAI ! ✅ Excellent résultat</span>
                  </div>
                )}

                {feedback === 'wrong' && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm font-bold space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-600 fill-rose-100" />
                      <span>FAUX ! ❌</span>
                    </div>
                    <p className="text-xs font-normal text-rose-700 dark:text-rose-300">
                      {explanation}
                    </p>
                    <button
                      onClick={() => generateQuestion()}
                      className="mt-2 px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                    >
                      Question Suivante →
                    </button>
                  </div>
                )}

                {/* Touch Keypad (Android Style for rapid thumb entry) */}
                <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleKeypadPress(digit.toString())}
                      className="min-h-[46px] rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-lg font-bold font-mono-numbers text-slate-800 dark:text-white active:scale-90 transition-transform shadow-xs"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeypadPress('C')}
                    className="min-h-[46px] rounded-2xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-sm font-bold text-rose-700 dark:text-rose-300 active:scale-90 transition-transform"
                    title="Effacer"
                  >
                    Effacer
                  </button>
                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="min-h-[46px] rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-lg font-bold font-mono-numbers text-slate-800 dark:text-white active:scale-90 transition-transform shadow-xs"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleValidateAnswer()}
                    className="min-h-[46px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center active:scale-90 transition-transform shadow-md"
                    title="Valider la réponse"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* MATH TAB 2: TIPS & METHODOLOGIES DU MONDE ENTIER             */}
          {/* ------------------------------------------------------------ */}
          {activeMathTab === 'tips' && (
            <div className="space-y-4">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedTipCategory('division');
                  }}
                  className={`py-2 rounded-xl text-center transition-all ${
                    selectedTipCategory === 'division'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ⚡ Divisions Express
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedTipCategory('vedique');
                  }}
                  className={`py-2 rounded-xl text-center transition-all ${
                    selectedTipCategory === 'vedique'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🇮🇳 Méthode Védique
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedTipCategory('japonaise');
                  }}
                  className={`py-2 rounded-xl text-center transition-all ${
                    selectedTipCategory === 'japonaise'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🇯🇵 Soroban & Gauche-Droite
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedTipCategory('carres');
                  }}
                  className={`py-2 rounded-xl text-center transition-all ${
                    selectedTipCategory === 'carres'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🎯 Carrés & Tables Magiques
                </button>
              </div>

              {/* Interactive Demo Box */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Démonstrateur Interactif
                  </span>
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] text-slate-500">Nombre :</label>
                    <input
                      type="number"
                      value={demoInput}
                      onChange={(e) => setDemoInput(Number(e.target.value) || 0)}
                      className="w-16 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-0.5 text-xs font-mono-numbers text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono-numbers">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-slate-400 block font-sans">Diviser par 5 (×2 puis ÷10)</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">
                      {demoInput} ÷ 5 = {(demoInput / 5).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({demoInput} × 2 = {demoInput * 2} → {((demoInput * 2) / 10).toFixed(1)})</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-slate-400 block font-sans">Multiplier par 11</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">
                      {demoInput} × 11 = {demoInput * 11}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">({demoInput} × 10 + {demoInput})</span>
                  </div>
                </div>
              </div>

              {/* Content 1: DIVISIONS RAPIDES */}
              {selectedTipCategory === 'division' && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>1. La Règle d'Or : Diviser par 5 en 1 seconde</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">× 2 puis ÷ 10</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Comme $5 = 10 / 2$, diviser par $5$ revient exactement à <strong>multiplier par 2 puis décaler la virgule d'un cran vers la gauche</strong>.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 165 ÷ 5<br/>
                      1) Doubler : 165 × 2 = 330<br/>
                      2) Diviser par 10 : 330 → 33 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>2. Diviser par 4 sans calculatrice</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">÷ 2 puis ÷ 2</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Prenez la moitié, puis reprenez immédiatement la moitié de ce résultat.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 196 ÷ 4<br/>
                      1) Première moitié : 196 ÷ 2 = 98<br/>
                      2) Deuxième moitié : 98 ÷ 2 = 49 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>3. Diviser par 25 instantanément</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">× 4 puis ÷ 100</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Comme $25 = 100 / 4$, multipliez le nombre par 4 et déplacez la virgule de 2 crans vers la gauche.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 350 ÷ 25<br/>
                      1) Multiplier par 4 : 350 × 4 = 1400<br/>
                      2) Diviser par 100 : 1400 → 14 !
                    </div>
                  </div>
                </div>
              )}

              {/* Content 2: METHODE VEDIQUE */}
              {selectedTipCategory === 'vedique' && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>1. La Règle Védique du × 11 (Écartement)</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">Sutra Indien</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Écartez les deux chiffres et insérez leur somme au milieu !
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 43 × 11<br/>
                      Écarter 4 et 3 : 4 [ 4 + 3 ] 3 = 473 !<br/>
                      Avec retenue (75 × 11) : 7 [ 7 + 5 = 12 ] 5 → 825.
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>2. Nombres proches de 100 (Yavadunam)</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">Écarts à la base 100</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Multipliez des nombres comme 96 × 97 en 2 secondes :
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      96 est à (-4) de 100, et 97 est à (-3).<br/>
                      Partie gauche : 96 - 3 = 93 (ou 97 - 4 = 93).<br/>
                      Partie droite : (-4) × (-3) = 12.<br/>
                      Résultat fusionné : 9312 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>3. Dizaines identiques & unités sommant à 10</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">Ex: 43 × 47</span>
                    </h4>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      43 × 47 :<br/>
                      Partie 1 : 4 × (4 + 1) = 4 × 5 = 20.<br/>
                      Partie 2 : 3 × 7 = 21.<br/>
                      Résultat : 2021 !
                    </div>
                  </div>
                </div>
              )}

              {/* Content 3: METHODE JAPONAISE & SOROBAN */}
              {selectedTipCategory === 'japonaise' && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>1. Calcul Gauche-à-Droite (Méthode Anzan)</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">Soroban Mental</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      À l'école, on nous apprend à calculer de droite à gauche. Les calculateurs prodiges font l'inverse : traiter les centaines, puis les dizaines, puis les unités !
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 64 × 7<br/>
                      1) 60 × 7 = 420<br/>
                      2) 4 × 7 = 28<br/>
                      3) 420 + 28 = 448 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>2. Les Compléments à 10 et 100</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">Pairs magiques</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Toujours chercher à arrondir à la dizaine supérieure et soustraire l'excédent :
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 58 + 87<br/>
                      Pensez : 60 + 87 - 2 = 147 - 2 = 145 !
                    </div>
                  </div>
                </div>
              )}

              {/* Content 4: CARRES & TABLES MAGIQUES */}
              {selectedTipCategory === 'carres' && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>1. Carré d'un nombre finissant par 5</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">n × (n+1) et 25</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Pour tout nombre $n5$, multipliez $n$ par son successeur $n+1$, et collez $25$ à la fin !
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      35² = (3 × 4) suivi de 25 = 1225 !<br/>
                      65² = (6 × 7) suivi de 25 = 4225 !<br/>
                      85² = (8 × 9) suivi de 25 = 7225 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>2. Multiplication par 9 express</span>
                      <span className="text-indigo-600 font-mono-numbers text-xs">× 10 puis - x</span>
                    </h4>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-numbers text-xs text-indigo-700 dark:text-indigo-300">
                      Exemple : 47 × 9<br/>
                      47 × 10 = 470<br/>
                      470 - 47 = 423 !
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      3. Critères Clés de Divisibilité
                    </h4>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div>• <strong>Par 3</strong> : La somme des chiffres est divisible par 3.</div>
                      <div>• <strong>Par 4</strong> : Les 2 derniers chiffres forment un multiple de 4 (ex: 524 → 24 divisible par 4).</div>
                      <div>• <strong>Par 6</strong> : Divisible à la fois par 2 (pair) et par 3.</div>
                      <div>• <strong>Par 8</strong> : Les 3 derniers chiffres forment un multiple de 8.</div>
                      <div>• <strong>Par 9</strong> : La somme de tous les chiffres est divisible par 9.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SOUS-ENSEMBLE DÉDIÉ: DÉFINITIONS AÉRO                      */}
      {/* ============================================================== */}
      {activeSubSection === 'aero' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sous-composant Isolé: Mémorisation & Apprentissage des Conversions Aéro */}
          <AeroConversionModule />

          {/* Lexique & Définitions Aéronautiques Fondamentales */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Définition Aéro : Variables & Lois de Commande
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>1. Équations de Portance & Traînée</span>
                      <span className="font-mono-numbers text-[11px] text-indigo-600">L = ½ ρ S V² Cl</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      La <strong>portance (L)</strong> est la force perpendiculaire à l'écoulement de l'air équilibrant le poids. La <strong>traînée (D)</strong> est la résistance au mouvement. La <strong>finesse (f = Cl/Cd)</strong> mesure l'efficacité.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>2. Incidence (α) & Dérapage (β)</span>
                      <span className="font-mono-numbers text-[11px] text-indigo-600">Angle of Attack</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      L'<strong>incidence (α)</strong> est l'angle entre la corde du profil et le vent relatif. Décrochage si α dépasse l'incidence critique. Le <strong>dérapage (β)</strong> est l'angle latéral par rapport à l'axe longitudinal.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>3. Nombre de Mach (M = V / a)</span>
                      <span className="font-mono-numbers text-[11px] text-indigo-600">a = √(γRT)</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Rapport entre la vitesse de vol et la vitesse du son. À Mach transsonique (0.8 - 1.2), des ondes de choc se forment à l'extrados.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>4. Automatismes Fly-By-Wire & Pilote Automatique</span>
                      <span className="font-mono-numbers text-[11px] text-indigo-600">Loi Normale</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Calculateurs de vol avec protections de facteur de charge (+2.5g/-1g), protection incidence critique (α_prot / α_max), assiette et automanette.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* ============================================================== */}
      {/* 3. SOUS-ENSEMBLE: TRADING (UNIVERS 3D APPLE WATCH)             */}
      {/* ============================================================== */}
      {activeSubSection === 'trading' && (
        <div className="space-y-4 animate-fade-in">
          <TradingMindmap3D />
        </div>
      )}

    </div>
  );
};
