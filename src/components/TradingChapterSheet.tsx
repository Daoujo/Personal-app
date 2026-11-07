import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Calculator, 
  Compass, 
  Layers, 
  BarChart2, 
  Activity, 
  Check, 
  RotateCcw 
} from 'lucide-react';
import { MindmapNodeData } from '../data/tradingMindmapData';
import { playClickSound } from '../utils/audio';

interface TradingChapterSheetProps {
  node: MindmapNodeData;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  allNodes: MindmapNodeData[];
}

export const TradingChapterSheet: React.FC<TradingChapterSheetProps> = ({
  node,
  onClose,
  onSelectNode,
  allNodes,
}) => {
  const [activeSubTab, setActiveSubTab] = useState(0);

  // Mini-simulator state for specific sections
  const [simCapital, setSimCapital] = useState(10000);
  const [simRiskPct, setSimRiskPct] = useState(1.5);
  const [simEntryPrice, setSimEntryPrice] = useState(150);
  const [simStopPrice, setSimStopPrice] = useState(144);
  const [simTargetPrice, setSimTargetPrice] = useState(165);

  // Fibonacci simulator state
  const [fiboHigh, setFiboHigh] = useState(200);
  const [fiboLow, setFiboLow] = useState(120);

  // Pre-market checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: false,
    c4: false,
    c5: false,
  });

  const currentIndex = allNodes.findIndex((n) => n.id === node.id);
  const prevNode = allNodes[(currentIndex - 1 + allNodes.length) % allNodes.length];
  const nextNode = allNodes[(currentIndex + 1) % allNodes.length];

  // Risk / Reward calculations
  const riskAmount = simCapital * (simRiskPct / 100);
  const riskPerShare = Math.max(0.01, Math.abs(simEntryPrice - simStopPrice));
  const sharesCount = Math.floor(riskAmount / riskPerShare);
  const totalCost = sharesCount * simEntryPrice;
  const rewardPerShare = Math.max(0, simTargetPrice - simEntryPrice);
  const rrRatio = (rewardPerShare / riskPerShare).toFixed(2);
  const potentialProfit = Math.round(sharesCount * rewardPerShare);

  // Fibonacci calculations
  const fiboDiff = fiboHigh - fiboLow;
  const fiboLevels = [
    { label: '0.0% (Sommet)', value: fiboHigh.toFixed(2), color: 'text-slate-300' },
    { label: '23.6%', value: (fiboHigh - fiboDiff * 0.236).toFixed(2), color: 'text-indigo-300' },
    { label: '38.2%', value: (fiboHigh - fiboDiff * 0.382).toFixed(2), color: 'text-cyan-300' },
    { label: '50.0% (Équilibre)', value: (fiboHigh - fiboDiff * 0.5).toFixed(2), color: 'text-amber-300' },
    { label: '61.8% (Golden Pocket)', value: (fiboHigh - fiboDiff * 0.618).toFixed(2), color: 'text-emerald-400 font-bold' },
    { label: '78.6%', value: (fiboHigh - fiboDiff * 0.786).toFixed(2), color: 'text-rose-300' },
    { label: '100.0% (Base)', value: fiboLow.toFixed(2), color: 'text-slate-300' },
  ];

  const currentSub = node.subChapters[activeSubTab] || node.subChapters[0];

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-hidden flex flex-col bg-slate-950/85 backdrop-blur-xl border-t border-indigo-900/60 animate-fade-in text-slate-100">
      {/* Top Header Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border-b border-indigo-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Retour Orbite 3D</span>
          </button>

          <div className="hidden xs:flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${node.color}25`,
                color: node.accentColor,
                border: `1px solid ${node.color}60`,
              }}
            >
              {node.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">{node.page}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playClickSound();
              onSelectNode(prevNode.id);
            }}
            title={`Précédent : ${prevNode.label}`}
            className="min-h-[38px] px-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 text-xs flex items-center gap-1 border border-slate-700/70 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onSelectNode(nextNode.id);
            }}
            title={`Suivant : ${nextNode.label}`}
            className="min-h-[38px] px-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 text-xs flex items-center gap-1 border border-slate-700/70 transition-colors"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="min-h-[38px] min-w-[38px] ml-1 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Module Title Card */}
        <div className="bg-[#151B2B] p-5 rounded-3xl border border-indigo-950/60 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
                {node.page} · {node.badge}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {node.label}
              </h1>
              <p className="text-sm text-indigo-200/90 font-medium mt-0.5">
                {node.subTitle}
              </p>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg"
              style={{
                backgroundColor: `${node.color}20`,
                color: node.accentColor,
                border: `2px solid ${node.color}80`,
              }}
            >
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            {node.description}
          </p>

          {/* Pro Tip Callout */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-200">
              <strong className="text-amber-300 font-semibold block mb-0.5">Règle d’Or du Trader :</strong>
              {node.proTip}
            </div>
          </div>
        </div>

        {/* Sub-Chapters Navigation Tabs */}
        {node.subChapters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
              {node.subChapters.map((sub, idx) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    playClickSound();
                    setActiveSubTab(idx);
                  }}
                  className={`min-h-[38px] px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeSubTab === idx
                      ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                      : 'bg-[#151B2B] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>Partie {idx + 1} : {sub.title}</span>
                </button>
              ))}
            </div>

            {/* Active Sub-Chapter Detail */}
            {currentSub && (
              <div className="bg-[#151B2B] p-5 rounded-3xl border border-indigo-950/60 shadow-lg space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {currentSub.title}
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium">
                    {currentSub.subtitle}
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-[#0D121F] p-4 rounded-2xl border border-slate-800/80">
                  {currentSub.summary}
                </div>

                {/* Key Points */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Points Clés & Exigences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentSub.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formula or Rule Banner */}
                {currentSub.formulaOrRule && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-700/60 text-xs font-mono font-bold text-indigo-300 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{currentSub.formulaOrRule}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* INTERACTIVE WORKBENCH WIDGETS DEDICATED TO THIS SECTION            */}
        {/* =================================================================== */}

        {/* 1. Risk / Reward & Position Sizing Simulator for 'hub', 'sec-before' or 'sec-6' */}
        {(node.id === 'hub' || node.id === 'sec-before' || node.id === 'sec-6') && (
          <div className="bg-[#151B2B] p-5 rounded-3xl border border-indigo-950/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Simulateur Interactif de Risk Management (R:R)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                Ratio R:R {rrRatio}:1
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-3 rounded-2xl bg-[#0D121F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Risque Max ($)</span>
                <span className="text-sm font-extrabold text-rose-400">{riskAmount.toFixed(0)} $</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0D121F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Taille Position</span>
                <span className="text-sm font-extrabold text-indigo-300">{sharesCount} actions</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0D121F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Coût Total</span>
                <span className="text-sm font-extrabold text-slate-200">{totalCost.toFixed(0)} $</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0D121F] border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Profit Visé</span>
                <span className="text-sm font-extrabold text-emerald-400">+{potentialProfit} $</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Capital de Trading</span>
                  <span className="font-mono font-bold text-indigo-400">{simCapital.toLocaleString()} $</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={simCapital}
                  onChange={(e) => setSimCapital(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Risque par Trade (%)</span>
                  <span className="font-mono font-bold text-rose-400">{simRiskPct}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={simRiskPct}
                  onChange={(e) => setSimRiskPct(Number(e.target.value))}
                  className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Fibonacci Retracements Calculator for 'sec-5' */}
        {node.id === 'sec-5' && (
          <div className="bg-[#151B2B] p-5 rounded-3xl border border-indigo-950/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Calculateur de Riveaux de Fibonacci & Golden Pocket
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0D121F] p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Prix du Sommet (High)</span>
                <input
                  type="number"
                  value={fiboHigh}
                  onChange={(e) => setFiboHigh(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div className="bg-[#0D121F] p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Prix du Creux (Low)</span>
                <input
                  type="number"
                  value={fiboLow}
                  onChange={(e) => setFiboLow(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Levels Table */}
            <div className="space-y-1.5 pt-1">
              {fiboLevels.map((lvl) => (
                <div
                  key={lvl.label}
                  className="p-2.5 rounded-xl bg-[#0D121F] border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-slate-400">{lvl.label}</span>
                  <span className={lvl.color}>{lvl.value} $</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Daily Checklist for Section 6 */}
        {node.id === 'sec-6' && (
          <div className="bg-[#151B2B] p-5 rounded-3xl border border-indigo-950/60 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Check-List Quotidienne Pré-Session</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { id: 'c1', text: 'Consulter le calendrier macroéconomique (taux Fed, CPI, NFP)' },
                { id: 'c2', text: 'Identifier la tendance primaire sur le graphique Hebdo / Daily' },
                { id: 'c3', text: 'Tracer les niveaux clés de support / résistance horizontaux' },
                { id: 'c4', text: 'Définir le Stop-Loss technique AVANT de passer l’ordre' },
                { id: 'c5', text: 'Vérifier que le ratio Gain/Risque est supérieur à 2:1' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#0D121F] border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id] || false}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span className={`flex-1 ${checklist[item.id] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
