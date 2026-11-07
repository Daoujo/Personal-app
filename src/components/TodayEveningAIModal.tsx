import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import {
  Sparkles,
  X,
  BookOpen,
  Clock,
  Check,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ListTodo,
  RefreshCw,
  Mic,
  Square,
  Send,
} from 'lucide-react';
import {
  CategoryType,
  EveningQuestion,
  EveningScheduleItem,
  Task,
  TimeBlock,
} from '../types';
import { playClickSound, playTaskCompleteSound, playWrongSound } from '../utils/audio';

interface TodayEveningAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  existingBlocks: TimeBlock[];
  onApplySchedule: (items: EveningScheduleItem[]) => void;
}

type ModalStep = 'choice' | 'subjects' | 'questions' | 'schedule' | 'applied';

const PRESET_SUBJECTS = [
  'Math : Équation différentielle',
  'Aéro : Avionique binaire',
  'Aéro : Mécanique',
  'Mathématiques',
  'Physique / Aéro',
  'Informatique',
  'Anglais',
  'Économie / Trading',
];

const SKETCH_PREVIEW_ITEMS = [
  { time: '18:00', label: 'Math : Équation différentielle' },
  { time: '19:00', label: 'Aéro : Avionique binaire' },
  { time: '20:00', label: 'Aéro : Mécanique' },
];

const VOICE_PROMPT_PRESETS = [
  'Maths 1h équations diff à 18h, puis Aéro avionique et méca avec pauses',
  '1h d Aéro mécanique d abord à 18h, puis révision maths et pause',
  'Avionique binaire 45 min, puis finir mes tâches du jour et 15 min de pause',
];

const WAVEFORM_BAR_HEIGHTS = [
  'h-2',
  'h-4',
  'h-2.5',
  'h-5',
  'h-3',
  'h-1.5',
  'h-4.5',
  'h-6',
  'h-2.5',
  'h-4',
  'h-3',
  'h-5.5',
  'h-2',
  'h-4.5',
  'h-6',
  'h-3.5',
  'h-5',
  'h-2.5',
  'h-4',
  'h-5.5',
  'h-3',
  'h-2',
  'h-4.5',
  'h-3.5',
  'h-5',
  'h-2.5',
];

const SPARKLE_PARTICLES = [
  { cx: 6, cy: 7, r: 1.1 },
  { cx: 12, cy: 4.5, r: 0.9 },
  { cx: 18, cy: 4, r: 1.2 },
  { cx: 24, cy: 4.5, r: 0.9 },
  { cx: 30, cy: 7, r: 1.1 },
  { cx: 4.5, cy: 14, r: 0.95 },
  { cx: 31.5, cy: 14, r: 0.95 },
  { cx: 4.5, cy: 22, r: 1.1 },
  { cx: 31.5, cy: 22, r: 1.1 },
  { cx: 6, cy: 29, r: 1.0 },
  { cx: 12, cy: 31.5, r: 1.15 },
  { cx: 18, cy: 32, r: 0.9 },
  { cx: 24, cy: 31.5, r: 1.15 },
  { cx: 30, cy: 29, r: 1.0 },
];

function recalculateTimes(
  items: EveningScheduleItem[],
  startTimeStr: string
): EveningScheduleItem[] {
  const [hRaw, mRaw] = startTimeStr.split(':').map(Number);
  let cursor =
    (Number.isFinite(hRaw) ? hRaw : 18) * 60 +
    (Number.isFinite(mRaw) ? mRaw : 0);

  return items.map((item) => {
    const startH = Math.floor((cursor % (24 * 60)) / 60)
      .toString()
      .padStart(2, '0');
    const startM = (cursor % 60).toString().padStart(2, '0');
    const startTime = `${startH}:${startM}`;

    cursor += item.durationMinutes;

    const endH = Math.floor((cursor % (24 * 60)) / 60)
      .toString()
      .padStart(2, '0');
    const endM = (cursor % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    return {
      ...item,
      startTime,
      endTime,
    };
  });
}

function formatSketchBlockTitle(item: EveningScheduleItem): string {
  const subj = item.subject.trim();
  const title = item.title.trim();
  if (!subj || title.toLowerCase().startsWith(subj.toLowerCase()) || title.includes(': ')) {
    return title;
  }
  if (item.itemType === 'break') {
    return title;
  }
  return `${subj} : ${title}`;
}

interface DraggableTimelineRowProps {
  item: EveningScheduleItem;
  index: number;
  totalCount: number;
  isReorderMode: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
}

const DraggableTimelineRow: React.FC<DraggableTimelineRowProps> = ({
  item,
  index,
  totalCount,
  isReorderMode,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const dragControls = useDragControls();
  const displayTitle = formatSketchBlockTitle(item);

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={isReorderMode}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.02,
        zIndex: 30,
      }}
      className="flex items-stretch select-none group"
    >
      {/* Left Time Column matching the sketch's 18:00 / 19:00 / 20:00 */}
      <div className="w-12 shrink-0 pr-2.5 pt-2.5 text-right">
        <span className="text-xs font-bold font-mono-numbers text-slate-800 dark:text-slate-100 tracking-tight">
          {item.startTime}
        </span>
      </div>

      {/* Vertical Timeline Axis + Translucent Liquid Glass Schedule Block */}
      <div className="flex-1 min-w-0 border-l-[1.5px] border-slate-700/35 dark:border-white/25 pl-3 pb-2.5">
        <div
          className={`rounded-2xl px-3 py-2 backdrop-blur-md transition-all flex items-center gap-2 ${
            isReorderMode
              ? 'bg-white/80 dark:bg-white/18 border border-indigo-500/70 dark:border-indigo-400/70 border-dashed shadow-md touch-none cursor-grab active:cursor-grabbing'
              : 'bg-white/65 dark:bg-white/10 border border-white/80 dark:border-white/20 shadow-[0_4px_16px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
          }`}
        >
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => {
              playClickSound();
              dragControls.start(e);
            }}
            className="min-w-[28px] min-h-[36px] flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 touch-none cursor-grab active:cursor-grabbing shrink-0"
            title="Glisser pour déplacer"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Course / Task Title & Quiet Metadata */}
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {displayTitle}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              <span className="font-mono-numbers">
                {item.startTime}–{item.endTime}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-numbers">{item.durationMinutes}m</span>
              <span aria-hidden="true">·</span>
              <span>
                {item.itemType === 'task'
                  ? 'Tâche'
                  : item.itemType === 'break'
                  ? 'Pause'
                  : 'Cours'}
              </span>
            </div>
          </div>

          {/* Reorder Arrows & Remove Control */}
          <div className="flex items-center gap-0.5 shrink-0">
            {isReorderMode && (
              <>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onMoveUp(index)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/15 disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === totalCount - 1}
                  onClick={() => onMoveDown(index)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/15 disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Retirer ce bloc"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

export const TodayEveningAIModal: React.FC<TodayEveningAIModalProps> = ({
  isOpen,
  onClose,
  tasks,
  existingBlocks,
  onApplySchedule,
}) => {
  const [step, setStep] = useState<ModalStep>('choice');

  // Step 1: Subjects & daily tasks selection
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Math : Équation différentielle',
    'Aéro : Avionique binaire',
    'Aéro : Mécanique',
  ]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [includedTaskIds, setIncludedTaskIds] = useState<string[]>([]);

  // Step 2: AI Questions
  const [aiGreeting, setAiGreeting] = useState('');
  const [questions, setQuestions] = useState<EveningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 3: Generated Mini-Schedule & Drag-and-drop state
  const [summaryTitle, setSummaryTitle] = useState('');
  const [aiRationale, setAiRationale] = useState('');
  const [eveningStartTime, setEveningStartTime] = useState('18:00');
  const [scheduleItems, setScheduleItems] = useState<EveningScheduleItem[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [showAddBlockDrawer, setShowAddBlockDrawer] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddDuration, setQuickAddDuration] = useState(30);

  // Interactive Voice Recording & AI interpretation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceTranscribedText, setVoiceTranscribedText] = useState<string | null>(null);
  const [textVoicePrompt, setTextVoicePrompt] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);

  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const existingEveningBlocks = existingBlocks.filter((b) => b.tag === 'IA Soirée');

  // Cleanup on unmount or close
  const cleanupRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  useEffect(() => {
    if (isOpen) {
      setStep('choice');
      setErrorMessage(null);
      setIsLoading(false);
      setIsReorderMode(false);
      setShowAddBlockDrawer(false);
      setLiveTranscript('');
      setVoiceTranscribedText(null);
    } else {
      cleanupRecording();
    }
    return () => {
      cleanupRecording();
    };
  }, [isOpen]);

  const toggleSubject = (subject: string) => {
    playClickSound();
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    playClickSound();
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const toggleTaskInclusion = (taskId: string) => {
    playClickSound();
    setIncludedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const getCurrentTimeHHMM = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  // Execute Voice Schedule Interpretation
  const handleVoiceToSchedule = async (spokenText: string, audioBlob?: Blob) => {
    playClickSound();
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage("L'IA interprète ta commande vocale et génère ton planning...");

    try {
      let audioBase64: string | undefined;
      if (audioBlob && audioBlob.size > 200) {
        audioBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = String(reader.result || '');
            resolve(res.split(',')[1] || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });
      }

      const selectedTaskTitles = pendingTasks
        .filter((t) => includedTaskIds.includes(t.id))
        .map((t) => ({
          title: t.title,
          estimatedMinutes: t.estimatedMinutes,
        }));

      const res = await fetch('/api/ai/voice-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob?.type || 'audio/webm',
          voiceText: spokenText.trim(),
          currentTime: getCurrentTimeHHMM(),
          pendingTasks: selectedTaskTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'interprétation vocale.");
      }

      const startStr = data.eveningStartTime || '18:00';
      const rawItems: EveningScheduleItem[] = Array.isArray(data.schedule) ? data.schedule : [];
      const recalculated = recalculateTimes(rawItems, startStr);

      setVoiceTranscribedText(data.transcribedText || spokenText);
      setSummaryTitle(data.summaryTitle || 'Planning de soirée interprété');
      setAiRationale(
        data.aiRationale ||
          `J'ai interprété ta demande vocale. Vérifie si l'ordre te convient ou glisse les blocs !`
      );
      setEveningStartTime(startStr);
      setScheduleItems(recalculated);
      setIsReorderMode(false);
      playTaskCompleteSound();
      setStep('schedule');
    } catch (err) {
      playWrongSound();
      setErrorMessage(
        err instanceof Error ? err.message : "Erreur lors de l'interprétation vocale de l'IA."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice recording on capsule tap
  const startRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    audioChunksRef.current = [];

    // Optional real-time speech recognition if supported
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = 0; i < event.results.length; i++) {
            interim += event.results[i][0].transcript + ' ';
          }
          setLiveTranscript(interim.trim());
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch {
      // speech recognition fallback handled gracefully
    }

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      // If microphone API is unavailable, prompt fallback
      setErrorMessage('Microphone non disponible dans ce navigateur. Tu peux cliquer sur un exemple ci-dessous.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const finalSpoken = liveTranscript.trim();
        handleVoiceToSchedule(finalSpoken, audioBlob);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 45) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setErrorMessage('Accès au micro refusé ou indisponible. Tu peux cliquer sur un exemple de commande vocale ci-dessous.');
    }
  };

  // Stop voice recording and launch generation
  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Master handler when the capsule is clicked
  const handleCapsuleClick = () => {
    playClickSound();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Call backend Gemini route 1: Get tailored questions
  const handleFetchQuestions = async () => {
    if (selectedSubjects.length === 0 && !customNote.trim()) {
      setErrorMessage('Sélectionne ou écris au moins une matière à bosser ce soir.');
      return;
    }

    playClickSound();
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage("L'IA analyse tes matières et prépare ses questions...");

    try {
      const selectedTaskTitles = pendingTasks
        .filter((t) => includedTaskIds.includes(t.id))
        .map((t) => `${t.title} (${t.estimatedMinutes}m)`);

      const res = await fetch('/api/ai/evening-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          customNote: customNote.trim(),
          pendingTasks: selectedTaskTitles,
          currentTime: getCurrentTimeHHMM(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la communication avec l'IA.");
      }

      const fetchedQuestions: EveningQuestion[] = Array.isArray(data.questions)
        ? data.questions
        : [];
      setAiGreeting(data.greeting || 'Super programme ! Réponds à ces questions rapides :');
      setQuestions(fetchedQuestions);

      const initialAnswers: Record<string, string> = {};
      fetchedQuestions.forEach((q) => {
        if (q.suggestedOptions && q.suggestedOptions.length > 0) {
          initialAnswers[q.id] = q.suggestedOptions[0];
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
      setStep('questions');
    } catch (err) {
      playWrongSound();
      setErrorMessage(
        err instanceof Error ? err.message : "Impossible de joindre l'IA pour le moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Call backend Gemini route 2: Generate evening mini-schedule
  const handleGenerateSchedule = async () => {
    playClickSound();
    setErrorMessage(null);
    setIsLoading(true);
    setLoadingMessage("L'IA génère ton mini emploi du temps de la soirée...");

    try {
      const formattedAnswers = questions.map((q) => ({
        question: q.question,
        answer: answers[q.id] || q.suggestedOptions?.[0] || 'Standard',
      }));

      const chosenTasks = pendingTasks
        .filter((t) => includedTaskIds.includes(t.id))
        .map((t) => ({
          id: t.id,
          title: t.title,
          estimatedMinutes: t.estimatedMinutes,
          category: t.category,
        }));

      const res = await fetch('/api/ai/generate-evening-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          customNote: customNote.trim(),
          answers: formattedAnswers,
          pendingTasks: chosenTasks,
          currentTime: getCurrentTimeHHMM(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la génération de l'emploi du temps.");
      }

      const startStr = data.eveningStartTime || '18:00';
      const rawItems: EveningScheduleItem[] = Array.isArray(data.schedule) ? data.schedule : [];
      const recalculated = recalculateTimes(rawItems, startStr);

      setSummaryTitle(data.summaryTitle || 'Programme de ta Soirée');
      setAiRationale(
        data.aiRationale ||
          "Voici l'ordre optimal pour ta soirée. Vérifie si cet ordre te convient ou glisse les blocs !"
      );
      setEveningStartTime(startStr);
      setScheduleItems(recalculated);
      setIsReorderMode(false);
      playTaskCompleteSound();
      setStep('schedule');
    } catch (err) {
      playWrongSound();
      setErrorMessage(
        err instanceof Error ? err.message : 'Erreur lors de la génération du planning.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Drag-and-drop reorder handler with automatic cascading time update
  const handleReorder = (newOrder: EveningScheduleItem[]) => {
    const updated = recalculateTimes(newOrder, eveningStartTime);
    setScheduleItems(updated);
  };

  const handleStartTimeChange = (newStart: string) => {
    setEveningStartTime(newStart);
    setScheduleItems((prev) => recalculateTimes(prev, newStart));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    playClickSound();
    const copy = [...scheduleItems];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    handleReorder(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index >= scheduleItems.length - 1) return;
    playClickSound();
    const copy = [...scheduleItems];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    handleReorder(copy);
  };

  const handleRemoveItem = (id: string) => {
    playClickSound();
    const filtered = scheduleItems.filter((item) => item.id !== id);
    handleReorder(filtered);
  };

  const handleInjectTaskOrSubject = (
    title: string,
    durationMinutes: number,
    category: CategoryType,
    itemType: 'course' | 'task' | 'break'
  ) => {
    playClickSound();
    const newItem: EveningScheduleItem = {
      id: `custom_ev_${Date.now()}`,
      title,
      subject: itemType === 'task' ? 'Tâche' : 'Cours',
      startTime: '18:00',
      endTime: '18:30',
      durationMinutes,
      category,
      itemType,
      tip: 'Ajouté manuellement — glisse pour choisir sa place.',
    };
    handleReorder([...scheduleItems, newItem]);
    setShowAddBlockDrawer(false);
  };

  const handleConfirmAndApply = () => {
    playTaskCompleteSound();
    onApplySchedule(scheduleItems);
    setStep('applied');
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const totalEveningMinutes = scheduleItems.reduce((sum, i) => sum + i.durationMinutes, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Translucent Ambient Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/18 dark:bg-slate-950/45 backdrop-blur-[3px]"
          />

          {/* Anchored Liquid Glass Micro-Window emerging directly beneath the Today 04 pill */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative z-50 mt-2.5 w-full rounded-[26px] bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/80 dark:border-white/20 shadow-[0_24px_48px_rgba(15,23,42,0.22),inset_0_1px_1px_rgba(255,255,255,0.92)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.22)] flex flex-col max-h-[70vh]"
          >
            {/* Upward Speech-Bubble Pointer (^) aligned under Today 04 */}
            <div
              aria-hidden="true"
              className="absolute -top-2 left-6 w-4 h-4 rotate-45 bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl border-l border-t border-white/85 dark:border-white/25 rounded-tl-[4px]"
            />

            {/* Subtle Liquid Glass Specular Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/45 via-transparent to-sky-200/20 dark:from-white/10 dark:via-transparent dark:to-indigo-500/15"
            />

            {/* Top Interactive Waveform Capsule Header matching the sketch [ :::□:::  | || ||| | || | ] */}
            <div className="relative z-10 px-3.5 pt-3.5 pb-2 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCapsuleClick}
                title={
                  isRecording
                    ? 'Arrêter la commande vocale et interpréter avec l’IA'
                    : 'Activer la commande vocale IA · Parle pour générer ton planning'
                }
                className={`flex-1 min-w-0 rounded-2xl backdrop-blur-md px-3 py-2 flex items-center gap-2.5 transition-all text-left group cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/15 dark:bg-rose-500/20 border-2 border-rose-500/70 shadow-[0_0_24px_rgba(244,63,94,0.3),inset_0_1px_0_rgba(255,255,255,0.6)] animate-pulse'
                    : 'bg-white/65 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/18 border border-white/80 dark:border-white/20 shadow-[0_4px_14px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.98]'
                }`}
              >
                {/* Sparkle-dotted Square Button (:::□:::) */}
                <div
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-white/80 dark:bg-white/15 text-slate-900 dark:text-white border border-white/80 dark:border-white/20'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                  ) : (
                    <svg
                      viewBox="0 0 36 36"
                      className="w-7 h-7 overflow-visible"
                      aria-hidden="true"
                    >
                      {SPARKLE_PARTICLES.map((dot, idx) => (
                        <circle
                          key={idx}
                          cx={dot.cx}
                          cy={dot.cy}
                          r={dot.r}
                          className="fill-slate-700/80 dark:fill-white/85"
                        />
                      ))}
                      <rect
                        x="11.5"
                        y="11.5"
                        width="13"
                        height="13"
                        rx="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>

                {/* Horizontal Audio / AI Waveform Bars */}
                <div
                  className="flex-1 flex items-center justify-between gap-[2px] h-7 px-1 overflow-hidden"
                  aria-hidden="true"
                >
                  {WAVEFORM_BAR_HEIGHTS.map((heightClass, idx) => (
                    <motion.span
                      key={idx}
                      animate={
                        isRecording || isLoading
                          ? {
                              scaleY: [0.35, 1.45, 0.55, 1.25, 0.4],
                            }
                          : {
                              scaleY: 1,
                            }
                      }
                      transition={
                        isRecording || isLoading
                          ? {
                              repeat: Infinity,
                              duration: 0.5 + (idx % 6) * 0.12,
                              ease: 'easeInOut',
                            }
                          : { duration: 0.2 }
                      }
                      className={`w-[2.5px] rounded-full transition-colors ${heightClass} ${
                        isRecording
                          ? 'bg-rose-600 dark:bg-rose-400'
                          : 'bg-slate-800/80 dark:bg-white/85 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400'
                      }`}
                    />
                  ))}
                </div>

                {/* Live Mic / Status Indicator */}
                <div className="shrink-0 flex items-center gap-1.5 pl-1">
                  {isRecording ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold font-mono-numbers text-rose-600 dark:text-rose-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{String(recordingSeconds).padStart(2, '0')}s</span>
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Parler</span>
                    </span>
                  )}
                </div>
              </button>

              {/* Close Glass Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/55 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 border border-white/75 dark:border-white/20 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live speech feedback pill while recording */}
            {isRecording && (
              <div className="px-4 pb-2">
                <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-[11px] text-rose-900 dark:text-rose-200 flex items-center justify-between gap-2">
                  <span className="truncate">
                    {liveTranscript ? `« ${liveTranscript} »` : 'Parle maintenant (ex: "Maths équations diff à 18h puis aéro mécanique")...'}
                  </span>
                  <span className="font-bold underline text-[10px] shrink-0">
                    Cliquer pour générer
                  </span>
                </div>
              </div>
            )}

            {/* Adaptive Scrollable Glass Body */}
            <div className="relative z-10 px-4 pb-4 pt-1 overflow-y-auto flex-1 space-y-3.5">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-500/15 backdrop-blur-md border border-rose-400/40 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <p className="font-semibold flex-1">{errorMessage}</p>
                </div>
              )}

              {/* Loading Overlay State */}
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/15 border border-white/80 dark:border-white/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-sm">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {loadingMessage}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Interprétation vocale Gemini AI
                  </span>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* ======================================================== */}
                  {/* STEP 0: SKETCH TIMELINE PREVIEW + VOICE INTERACTION       */}
                  {/* ======================================================== */}
                  {step === 'choice' && (
                    <motion.div
                      key="step-choice"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3"
                    >
                      {/* Voice Command Guidance & One-Tap Test Presets */}
                      <div className="p-3 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Commande Vocale Interactive</span>
                          </span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            Interprétation IA
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Appuie sur la capsule ci-dessus et dis ce que tu as à faire ce soir, ou teste un exemple vocal :
                        </p>

                        <div className="flex flex-col gap-1.5 pt-1">
                          {VOICE_PROMPT_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleVoiceToSchedule(preset)}
                              className="text-left px-3 py-1.5 rounded-xl bg-white/70 dark:bg-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-white/80 dark:border-white/20 text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-2 transition-all"
                            >
                              <span className="shrink-0 text-indigo-500 font-mono-numbers">🎙️</span>
                              <span className="truncate flex-1">« {preset} »</span>
                            </button>
                          ))}
                        </div>

                        {/* Optional text input for voice command if mic isn't used */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (textVoicePrompt.trim()) {
                              handleVoiceToSchedule(textVoicePrompt.trim());
                            }
                          }}
                          className="flex items-center gap-1.5 pt-1"
                        >
                          <input
                            type="text"
                            value={textVoicePrompt}
                            onChange={(e) => setTextVoicePrompt(e.target.value)}
                            placeholder="Ou écris ce que tu aurais dit à la voix..."
                            className="flex-1 bg-white/75 dark:bg-slate-900/60 border border-white/80 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                          />
                          <button
                            type="submit"
                            disabled={!textVoicePrompt.trim()}
                            className="min-h-[36px] px-3 rounded-xl bg-indigo-600 text-white disabled:opacity-40 text-xs font-bold flex items-center justify-center shadow-xs"
                            title="Envoyer la commande vocale"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>

                      {/* Sketch Vertical Timeline (18:00 / 19:00 / 20:00) */}
                      <div className="pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 px-1 mb-1 block">
                          Aperçu de la soirée
                        </span>
                        {existingEveningBlocks.length > 0 ? (
                          existingEveningBlocks.slice(0, 4).map((block) => (
                            <div key={block.id} className="flex items-stretch">
                              <div className="w-12 shrink-0 pr-2.5 pt-2.5 text-right">
                                <span className="text-xs font-bold font-mono-numbers text-slate-800 dark:text-slate-100">
                                  {block.startTime}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 border-l-[1.5px] border-slate-700/35 dark:border-white/25 pl-3 pb-2.5">
                                <div className="rounded-2xl px-3.5 py-2 bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_4px_14px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {block.title}
                                  </p>
                                  <span className="text-[10px] font-medium font-mono-numbers text-slate-600 dark:text-slate-300">
                                    {block.startTime}–{block.endTime} · {block.durationMinutes}m
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          SKETCH_PREVIEW_ITEMS.map((slot) => (
                            <div key={slot.time} className="flex items-stretch">
                              <div className="w-12 shrink-0 pr-2.5 pt-2.5 text-right">
                                <span className="text-xs font-bold font-mono-numbers text-slate-800 dark:text-slate-100">
                                  {slot.time}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 border-l-[1.5px] border-slate-700/35 dark:border-white/25 pl-3 pb-2.5">
                                <div className="rounded-2xl px-3.5 py-2 bg-white/55 dark:bg-white/10 backdrop-blur-md border border-white/75 dark:border-white/20 shadow-[0_4px_14px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {slot.label}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Secondary manual question-based option */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setStep('subjects');
                          }}
                          className="w-full py-2.5 rounded-2xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/18 border border-white/80 dark:border-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Préférer le formulaire avec questions de l'IA</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 1: SUBJECTS & DAILY TASKS SELECTION                 */}
                  {/* ======================================================== */}
                  {step === 'subjects' && (
                    <motion.div
                      key="step-subjects"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Étape 1/2 · Tes cours de ce soir</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          Quelles sont les matières sur lesquelles tu dois bosser ce soir pour tes cours ?
                        </p>
                      </div>

                      {/* Frosted Glass Subject Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          ...PRESET_SUBJECTS,
                          ...selectedSubjects.filter((s) => !PRESET_SUBJECTS.includes(s)),
                        ].map((subj) => {
                          const active = selectedSubjects.includes(subj);
                          return (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => toggleSubject(subj)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold backdrop-blur-md transition-all flex items-center gap-1 border ${
                                active
                                  ? 'bg-indigo-600/90 text-white border-indigo-400/60 shadow-xs'
                                  : 'bg-white/60 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-white/75 dark:border-white/20 hover:bg-white/85 dark:hover:bg-white/20'
                              }`}
                            >
                              {active && <Check className="w-3 h-3 shrink-0" />}
                              <span>{subj}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Add Custom Subject Input */}
                      <form onSubmit={handleAddCustomSubject} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value)}
                          placeholder="Autre matière (ex: Math : Algèbre linéaire)..."
                          className="flex-1 bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                        />
                        <button
                          type="submit"
                          className="min-h-[38px] px-3 rounded-xl bg-white/75 dark:bg-white/15 border border-white/80 dark:border-white/20 text-slate-900 dark:text-white text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Ajouter la matière"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </form>

                      {/* Optional Precision */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Précisions sur ton programme (optionnel)
                        </label>
                        <input
                          type="text"
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          placeholder="Ex: Commencer à 18h00, DS demain matin..."
                          className="w-full bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                        />
                      </div>

                      {/* Include Pending Tasks from Today */}
                      {pendingTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <ListTodo className="w-3.5 h-3.5" />
                            <span>Inclure aussi des tâches d'aujourd'hui ?</span>
                          </span>
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {pendingTasks.map((task) => {
                              const checked = includedTaskIds.includes(task.id);
                              return (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => toggleTaskInclusion(task.id)}
                                  className={`w-full px-3 py-1.5 rounded-xl text-left text-xs flex items-center justify-between border backdrop-blur-md transition-colors ${
                                    checked
                                      ? 'bg-indigo-600/85 border-indigo-400/60 text-white font-semibold'
                                      : 'bg-white/55 dark:bg-white/10 border-white/75 dark:border-white/20 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <span className="truncate flex-1">{task.title}</span>
                                  <span className="text-[10px] font-mono-numbers ml-2 shrink-0">
                                    {task.estimatedMinutes}m {checked ? '✓' : '+'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setStep('choice')}
                          className="px-4 min-h-[42px] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/65 dark:bg-white/10 border border-white/80 dark:border-white/20 hover:bg-white/90"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          onClick={handleFetchQuestions}
                          className="flex-1 min-h-[42px] px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-400/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                        >
                          <span>Continuer</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 2: AI FOLLOW-UP QUESTIONS                           */}
                  {/* ======================================================== */}
                  {step === 'questions' && (
                    <motion.div
                      key="step-questions"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3.5"
                    >
                      <div className="p-3 rounded-2xl bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 text-xs text-slate-900 dark:text-slate-100 font-semibold">
                        {aiGreeting}
                      </div>

                      <div className="space-y-3">
                        {questions.map((q, idx) => (
                          <div key={q.id || idx} className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900 dark:text-white block">
                              {idx + 1}. {q.question}
                            </label>

                            {q.suggestedOptions && q.suggestedOptions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {q.suggestedOptions.map((opt) => {
                                  const isSelected = answers[q.id] === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        playClickSound();
                                        setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold backdrop-blur-md transition-all border ${
                                        isSelected
                                          ? 'bg-indigo-600/90 text-white border-indigo-400/60 shadow-xs'
                                          : 'bg-white/60 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-white/75 dark:border-white/20 hover:bg-white/85'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder={q.placeholder || 'Ta réponse...'}
                              className="w-full bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setStep('subjects')}
                          className="px-4 min-h-[42px] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/65 dark:bg-white/10 border border-white/80 dark:border-white/20 hover:bg-white/90"
                        >
                          Retour
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateSchedule}
                          className="flex-1 min-h-[42px] px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-400/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Générer mon emploi du temps</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 3: SKETCH TIMELINE + ORDER VERIFICATION + DRAG      */}
                  {/* ======================================================== */}
                  {step === 'schedule' && (
                    <motion.div
                      key="step-schedule"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3"
                    >
                      {/* Voice transcript badge if generated via voice */}
                      {voiceTranscribedText && (
                        <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/35 flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200">
                          <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <p className="truncate flex-1">
                            <span className="font-semibold">Commande vocale reçue : </span>
                            « {voiceTranscribedText} »
                          </p>
                        </div>
                      )}

                      {/* Liquid Glass Verification Prompt Box */}
                      <div className="p-3 rounded-2xl bg-white/65 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 space-y-2 shadow-[0_4px_14px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.85)]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {summaryTitle}
                          </span>
                          <span className="text-[11px] font-mono-numbers text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                            {Math.floor(totalEveningMinutes / 60)}h {totalEveningMinutes % 60}m
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                          {aiRationale}
                        </p>

                        <div className="pt-1.5 border-t border-slate-900/10 dark:border-white/15 space-y-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Est-ce que cet ordre te convient ?
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={handleConfirmAndApply}
                              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-400/50 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Oui, ça me convient</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                playClickSound();
                                setIsReorderMode((prev) => !prev);
                              }}
                              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all border backdrop-blur-md ${
                                isReorderMode
                                  ? 'bg-indigo-600/90 text-white border-indigo-400/60 shadow-xs'
                                  : 'bg-white/75 dark:bg-white/10 text-slate-900 dark:text-white border-white/85 dark:border-white/25 hover:bg-white'
                              }`}
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                              <span>{isReorderMode ? 'Mode Drag Actif' : "Modifier l'ordre"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Start Time Control & Drag Hint */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Glisse les blocs pour réorganiser
                        </span>

                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                          <input
                            type="time"
                            value={eveningStartTime}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/20 rounded-lg px-1.5 py-0.5 text-[11px] font-mono-numbers font-bold text-slate-900 dark:text-white"
                            title="Heure de début de soirée"
                          />
                        </div>
                      </div>

                      {/* Draggable Sketch Timeline List (18:00 | [ Math : Équation différentielle ]) */}
                      <Reorder.Group
                        axis="y"
                        values={scheduleItems}
                        onReorder={handleReorder}
                        className="overflow-x-hidden pt-0.5"
                      >
                        {scheduleItems.map((item, idx) => (
                          <DraggableTimelineRow
                            key={item.id}
                            item={item}
                            index={idx}
                            totalCount={scheduleItems.length}
                            isReorderMode={isReorderMode}
                            onMoveUp={handleMoveUp}
                            onMoveDown={handleMoveDown}
                            onRemove={handleRemoveItem}
                          />
                        ))}
                      </Reorder.Group>

                      {/* Add another task/subject into the draggable mini-schedule */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setShowAddBlockDrawer((prev) => !prev);
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700/35 dark:border-white/30 bg-white/40 dark:bg-white/5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter une tâche du jour ou matière</span>
                        </button>

                        {showAddBlockDrawer && (
                          <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 space-y-2.5">
                            {pendingTasks.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block">
                                  Tâches d'aujourd'hui disponibles
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {pendingTasks.map((t) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() =>
                                        handleInjectTaskOrSubject(
                                          t.title,
                                          t.estimatedMinutes,
                                          t.category,
                                          'task'
                                        )
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-white dark:border-white/20 text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:border-indigo-500 truncate max-w-full"
                                    >
                                      + {t.title} ({t.estimatedMinutes}m)
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={quickAddTitle}
                                onChange={(e) => setQuickAddTitle(e.target.value)}
                                placeholder="Ex: Aéro : Mécanique..."
                                className="flex-1 bg-white/85 dark:bg-slate-900/70 border border-white dark:border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                              />
                              <input
                                type="number"
                                min="5"
                                max="120"
                                value={quickAddDuration}
                                onChange={(e) =>
                                  setQuickAddDuration(Math.max(5, Number(e.target.value) || 30))
                                }
                                className="w-12 bg-white/85 dark:bg-slate-900/70 border border-white dark:border-white/20 rounded-lg px-1.5 py-1.5 text-xs font-mono-numbers text-center text-slate-900 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!quickAddTitle.trim()) return;
                                  handleInjectTaskOrSubject(
                                    quickAddTitle.trim(),
                                    quickAddDuration,
                                    'study',
                                    'course'
                                  );
                                  setQuickAddTitle('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                              >
                                Ajouter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setStep('choice');
                          }}
                          className="px-3.5 min-h-[42px] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/20 hover:bg-white flex items-center gap-1"
                          title="Nouvelle commande vocale ou options"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Autre consigne</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmAndApply}
                          disabled={scheduleItems.length === 0}
                          className="flex-1 min-h-[42px] px-4 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-40 border border-indigo-400/50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider cet emploi du temps</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 4: APPLIED CONFIRMATION                             */}
                  {/* ======================================================== */}
                  {step === 'applied' && (
                    <motion.div
                      key="step-applied"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-8 text-center space-y-2.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Emploi du temps de la soirée enregistré !
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        Tes {scheduleItems.length} blocs ont été ajoutés au planning d'Aujourd'hui.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
