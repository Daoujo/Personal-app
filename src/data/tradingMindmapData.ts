export interface SubChapter {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  keyPoints: string[];
  formulaOrRule?: string;
}

export interface MindmapNodeData {
  id: string;
  sectionNumber?: number;
  label: string;
  subTitle: string;
  page: string;
  position: [number, number, number]; // 3D coordinates in space
  color: string; // Hex color for glow
  accentColor: string;
  badge: string;
  iconType: 'hub' | 'triad' | 'trend' | 'candles' | 'patterns' | 'indicators' | 'waves' | 'analyst';
  description: string;
  subChapters: SubChapter[];
  proTip: string;
}

export const TRADING_MINDMAP_DATA: MindmapNodeData[] = [
  {
    id: 'hub',
    label: 'Technical Analysis',
    subTitle: 'Le Noyau Fondamental',
    page: 'Centre',
    position: [0, 0, 0],
    color: '#6366F1', // Indigo
    accentColor: '#818CF8',
    badge: 'CORE HUB',
    iconType: 'hub',
    description: "L'analyse technique repose sur l'étude des cours historiques et des volumes pour anticiper les mouvements futurs. Elle repose sur trois postulats de Charles Dow : le marché intègre tout, les cours évoluent en tendances, et l'histoire se répète.",
    proTip: "Le prix est la seule vérité instantanée du marché. Les indicateurs et oscillateurs ne sont que des dérivés du prix.",
    subChapters: [
      {
        id: 'dow-theory',
        title: 'Les 3 Postulats de la Théorie de Dow',
        subtitle: 'Base conceptuelle de toute analyse graphique',
        summary: "1. Le marché escompte toutes les informations connues (bilans, psychologie, rumeurs).\n2. Les prix se déplacent selon 3 tendances : primaire (> 1 an), secondaire (3 sem à 3 mois) et mineure (< 3 sem).\n3. Une tendance est confirmée tant que les sommets et creux sont croissants (tendance haussière) ou décroissants (tendance baissière).",
        keyPoints: [
          'Les volumes doivent impérativement confirmer la tendance principale',
          'Une tendance reste valide jusqu’à un signal net et non ambigu de retournement',
          'Ne jamais trader contre la tendance primaire'
        ],
        formulaOrRule: 'Tendance Haussière = Higher Highs (HH) + Higher Lows (HL)'
      },
      {
        id: 'market-psychology',
        title: 'Psychologie des Foules & Biais Émotionnels',
        subtitle: 'Peur, Avidité, Espoir et Regret',
        summary: "Les figures chartistes et les retournements de prix ne sont que la matérialisation graphique des émotions collectives. Les phases d'accumulation précèdent l'euphorie, suivie par la panique et la capitulation.",
        keyPoints: [
          'Phase 1 : Accumulation institutionnelle discrète',
          'Phase 2 : Participation publique et expansion rapide',
          'Phase 3 : Distribution au sommet et vente aux traders tardifs'
        ],
        formulaOrRule: 'Acheter quand le sang coule dans les rues, vendre dans l’euphorie'
      }
    ]
  },
  {
    id: 'sec-before',
    label: 'Before You Start',
    subTitle: 'Le Triptyque Price / Time / Place',
    page: 'Page 3',
    position: [2.5, 1.2, 0.4],
    color: '#38BDF8', // Sky Blue
    accentColor: '#7DD3FC',
    badge: 'PRÉREQUIS',
    iconType: 'triad',
    description: "Avant de tracer la moindre ligne, tout analyste technique doit cadrer sa réflexion autour de trois dimensions indissociables : le Prix (combien), le Temps (quand) et le Lieu (sur quel niveau clé).",
    proTip: "Un bon trade n'est pas seulement le bon prix, c'est le bon prix au bon moment et sur le bon support/résistance.",
    subChapters: [
      {
        id: 'triad-dimensions',
        title: 'La Triade Price - Time - Place',
        subtitle: 'Les coordonnées fondamentales de chaque opportunité',
        summary: "Le Prix définit le potentiel de gain et le risque (Risk/Reward). Le Temps mesure la durée du cycle et la vélocité du mouvement. Le Lieu correspond aux zones de liquidité majeures (Order Blocks, niveaux horizontaux historiques).",
        keyPoints: [
          'Price : Combien le marché est-il prêt à payer ?',
          'Time : À quel moment de la session / cycle économique ?',
          'Place : Sur quelle structure de marché (support, VWAP, confluence) ?'
        ],
        formulaOrRule: 'Opportunité Haute Probabilité = Confluence(Price + Time + Place)'
      },
      {
        id: 'capital-preservation',
        title: 'Règle d’Or : Préservation du Capital',
        subtitle: 'La survie avant la rentabilité',
        summary: "Le premier travail du trader n'est pas de faire des profits, mais de protéger son capital. Ne risquez jamais plus de 1% à 2% de votre capital total sur une seule opération.",
        keyPoints: [
          'Risque maximum par trade : 1% à 2%',
          'Ratio Gain/Risque minimal exigé : 2:1',
          'Un trader ayant 40% de réussite avec un R:R de 2.5:1 reste largement gagnant'
        ],
        formulaOrRule: 'Taille Position = (Capital × Risque %) / Distance du Stop-Loss'
      }
    ]
  },
  {
    id: 'sec-1',
    label: 'Section 1 : Introduction',
    subTitle: 'Lignes de Tendance, Niveaux & Volumes',
    page: 'Page 7',
    position: [1.8, -1.8, 0.3],
    color: '#10B981', // Emerald
    accentColor: '#34D399',
    badge: 'FONDATIONS',
    iconType: 'trend',
    description: "Apprenez à cartographier le champ de bataille : tracer des lignes de tendance rigoureuses, identifier les supports et résistances majeurs, et interpréter les volumes comme validation de la conviction des acheteurs ou vendeurs.",
    proTip: "Une ligne de tendance touchée 3 fois est confirmée. À la 4e ou 5e touche, la probabilité de cassure augmente considérablement.",
    subChapters: [
      {
        id: 'support-resistance',
        title: 'Supports & Résistances Horizontaux',
        subtitle: 'Zones de mémoire du marché et polarité',
        summary: "Un support est un niveau où la demande surpasse l'offre. Une résistance est un niveau où l'offre surpasse la demande. Principe de polarité : une résistance brisée devient un support futur lors du pullback.",
        keyPoints: [
          'Toujours tracer des zones (bandes) plutôt que des lignes parfaites au centime',
          'Les chiffres ronds psychologiques (ex: 100$, 50000$) attirent des ordres massifs',
          'Plus un niveau a rejeté le prix dans le passé, plus il est lourd de signification'
        ],
        formulaOrRule: 'Principe de Polarité : Résistance Dépassée ➔ Support de Pullback'
      },
      {
        id: 'trendlines-volume',
        title: 'Lignes de Tendance & Volumes de Rupture',
        subtitle: 'Distinguer les vraies cassures des fausses sorties (Bull/Bear Traps)',
        summary: "Une cassure de résistance accompagnée d'un volume 2 à 3 fois supérieur à la moyenne signale une injection de capitaux institutionnels. Une cassure sur faible volume est suspecte et annonce souvent un piège.",
        keyPoints: [
          'Le volume valide le prix : hausse saine = volume croissant lors des impulsions',
          'Divergence volume/prix : nouveau sommet avec faible volume = épuisement imminent',
          'Attendre la clôture de la bougie hors du niveau avant d’entrer'
        ],
        formulaOrRule: 'Breakout Valide = Clôture Franche + Volume Spike > 2× Moyenne 20 jours'
      }
    ]
  },
  {
    id: 'sec-2',
    label: 'Section 2 : Chart Types',
    subTitle: 'Bougies Japonaises, Barres & P&F',
    page: 'Page 29',
    position: [-0.6, -2.4, 0.1],
    color: '#F59E0B', // Amber
    accentColor: '#FBBF24',
    badge: 'REPRÉSENTATION',
    iconType: 'candles',
    description: "Explorez les modes de représentation graphique du marché : les chandeliers japonais inventés par Munehisa Homma au 18e siècle, les bar charts OHLC classiques et les graphiques Point & Figure filtrant le bruit temporel.",
    proTip: "La mèche supérieure d'une bougie représente le rejet des prix hauts par les vendeurs. La mèche inférieure représente la défense des acheteurs.",
    subChapters: [
      {
        id: 'candlestick-anatomy',
        title: 'Anatomie du Chandelier Japonais',
        subtitle: 'Open, High, Low, Close et lecture de pression',
        summary: "Chaque bougie synthétise la lutte entre taureaux et ours. Le corps représente le consensus réel de clôture, tandis que les mèches indiquent les incursions rejetées au cours de la session.",
        keyPoints: [
          'Marubozu : Corps plein sans mèche = Domination sans partage',
          'Doji : Ouverture = Clôture = Indécision et équilibre fragile',
          'Marteau (Hammer) : Longue mèche basse rejetant le support = Signal de retournement haussier'
        ],
        formulaOrRule: 'Ratio Mèche/Corps > 2 = Forte pression de rejet'
      },
      {
        id: 'point-and-figure',
        title: 'Graphiques Point & Figure (P&F)',
        subtitle: 'Éliminer le facteur temps pour ne capter que l’offre et la demande',
        summary: "Les graphiques P&F n'enregistrent que les colonnes de X (hausses) et de O (baisses) selon une taille de boîte fixe. Le temps est totalement ignoré, ce qui élimine les faux signaux de consolidation latérale.",
        keyPoints: [
          'Colonne de X = Contrôle des acheteurs',
          'Colonne de O = Contrôle des vendeurs',
          'Reversal de 3 boîtes requis pour changer de colonne'
        ]
      }
    ]
  },
  {
    id: 'sec-3',
    label: 'Section 3 : Classical Chart Analysis',
    subTitle: 'Figures de Retournement & Continuation',
    page: 'Page 59',
    position: [-2.4, -0.8, -0.2],
    color: '#EC4899', // Pink
    accentColor: '#F472B6',
    badge: 'CHARTISME',
    iconType: 'patterns',
    description: "L'art du chartisme : décrypter les structures géométriques formées par l'action des prix pour anticiper des retournements de tendance majeurs ou des accélérations explosives.",
    proTip: "L'objectif théorique d'une figure (comme un double creux) est égal à la hauteur de la figure projetée à partir de la ligne de cou.",
    subChapters: [
      {
        id: 'reversal-patterns',
        title: 'Figures Majeures de Retournement',
        subtitle: 'Tête et Épaules, Double Sommet, Double Creux',
        summary: "La figure en Tête et Épaules (Head & Shoulders) est la plus célèbre : l'épaule gauche et la tête forment des sommets plus hauts, mais l'épaule droite échoue à faire un nouveau plus haut, trahissant l'épuisement acheteur.",
        keyPoints: [
          'La ligne de cou (Neckline) déclenche le trade lors de sa rupture franche',
          'Double Bottom en W : deux rejets sur le même support = double plancher solide',
          'Objectif théorique : Hauteur (Tête - Cou) reportée sous la ligne de cou'
        ],
        formulaOrRule: 'Objectif H&S = Ligne de Cou - Hauteur de la Tête'
      },
      {
        id: 'continuation-patterns',
        title: 'Figures de Continuation de Tendance',
        subtitle: 'Drapeaux (Flags), Pennants et Triangles de compression',
        summary: "Ces figures représentent des pauses respiratoires du marché avant la reprise de la tendance dominante. Les drapeaux forment un canal de contre-tendance compact soutenu par de faibles volumes avant une violente reprise.",
        keyPoints: [
          'Drapeau haussier (Bull Flag) : Mât d’impulsion verticale + canal descendant étroit',
          'Triangle symétrique : Convergence des sommets et des creux = compression de volatilité',
          'Attendre l’explosion directionnelle avec volume avant de se positionner'
        ],
        formulaOrRule: 'Objectif Drapeau = Hauteur du Mât d’impulsion initial'
      }
    ]
  },
  {
    id: 'sec-4',
    label: 'Section 4 : Indicators',
    subTitle: 'Moyennes Mobiles, Oscillateurs & MACD',
    page: 'Page 95',
    position: [-2.1, 1.4, -0.3],
    color: '#8B5CF6', // Purple
    accentColor: '#A78BFA',
    badge: 'INDICATEURS',
    iconType: 'indicators',
    description: "Les indicateurs techniques mathématiques appliquent des formules au prix et au volume pour lisser les fluctuations, mesurer la vitesse du mouvement (momentum) et repérer les extrêmes de surachat et survente.",
    proTip: "Les divergences entre le prix et un oscillateur (comme le RSI) sont parmi les signaux de retournement les plus puissants du trading.",
    subChapters: [
      {
        id: 'moving-averages',
        title: 'Moyennes Mobiles : SMA vs EMA',
        subtitle: 'Filtrer le bruit et repérer les croisements dorés',
        summary: "La SMA 200 jours représente la frontière institutionnelle entre marché haussier et baissier. L'EMA 20 réagit plus vite et sert de support dynamique en tendance rapide. Le Golden Cross (EMA 50 coupant à la hausse la SMA 200) annonce des cycles d'expansion séculaires.",
        keyPoints: [
          'Prix au-dessus de la SMA 200 = Biais exclusivement acheteur',
          'Golden Cross = EMA 50 > SMA 200 (Signal haussier majeur)',
          'Death Cross = EMA 50 < SMA 200 (Signal baissier défensif)'
        ],
        formulaOrRule: 'EMA = [Prix × Multiplicateur] + [EMA_précédente × (1 - Multiplicateur)]'
      },
      {
        id: 'oscillators-macd',
        title: 'RSI, Stochastique & MACD',
        subtitle: 'Divergences haussières et baissières',
        summary: "Le RSI (14 périodes) mesure la force relative entre 0 et 100. > 70 indique un surachat temporaire, < 30 une survente. Une divergence haussière se produit lorsque le prix fait un creux plus bas alors que le RSI fait un creux plus haut.",
        keyPoints: [
          'Divergence Haussière : Prix ↘ (Lower Low) alors que RSI ↗ (Higher Low)',
          'Divergence Baissière : Prix ↗ (Higher High) alors que RSI ↘ (Lower High)',
          'MACD : Croisement de la ligne MACD au-dessus de la ligne de signal'
        ],
        formulaOrRule: 'Divergence RSI = Alerte de rupture imminente de tendance'
      }
    ]
  },
  {
    id: 'sec-5',
    label: 'Section 5 : Waves, Numbers and Cycles',
    subTitle: 'Vagues d’Elliott & Ratios de Fibonacci',
    page: 'Page 117',
    position: [-0.4, 2.3, 0.2],
    color: '#E11D48', // Rose
    accentColor: '#FB7185',
    badge: 'HARMONIE',
    iconType: 'waves',
    description: "Plongez dans l'harmonie mathématique des marchés : la théorie des vagues de Ralph Nelson Elliott et les fractions sacrées de Fibonacci (1, 1, 2, 3, 5, 8, 13...). Le marché respire selon des cycles fractals universels.",
    proTip: "La vague 3 d'Elliott n'est JAMAIS la plus courte des 3 vagues motrices. C'est souvent la plus explosive et la plus profitable.",
    subChapters: [
      {
        id: 'elliott-waves',
        title: 'Structure en 8 Vagues d’Elliott',
        subtitle: '5 vagues d’impulsion (1-2-3-4-5) + 3 vagues de correction (A-B-C)',
        summary: "La foule avance en 5 temps et corrige en 3 temps. La vague 1 démarre dans le doute, la vague 2 corrige profondément sans casser le début de 1, la vague 3 est l'explosion directionnelle principale, la vague 4 consolide sans entrer dans le territoire de 1, et la vague 5 clôture l'euphorie.",
        keyPoints: [
          'Règle 1 : La vague 2 ne retrace jamais plus de 100% de la vague 1',
          'Règle 2 : La vague 3 n’est jamais la plus courte',
          'Règle 3 : La vague 4 ne chevauche jamais le sommet de la vague 1 (marché au comptant)'
        ],
        formulaOrRule: 'Cycle Fractal = Impulsion (1-2-3-4-5) + Correction (A-B-C)'
      },
      {
        id: 'fibonacci-retracements',
        title: 'Retrancements & Extensions de Fibonacci',
        subtitle: 'Niveaux d’or : 38.2%, 50%, 61.8% et Golden Pocket',
        summary: "Issus de la suite mathématique de Fibonacci (chaque nombre étant la somme des deux précédents). Le ratio d'or $\\Phi = 1.618$ et son inverse $0.618$ dictent les zones où les vagues correctives s'épuisent avec une précision troublante.",
        keyPoints: [
          'Golden Pocket : Zone comprise entre 61.8% et 65% de retracement',
          'La vague 2 retrace généralement 50% ou 61.8% de la vague 1',
          'L’extension 1.618 de la vague 1 sert d’objectif standard pour la vague 3'
        ],
        formulaOrRule: 'Ratio d’Or $\\Phi$ = 1.6180339887... | Zone Clé = 61.8% Retracement'
      }
    ]
  },
  {
    id: 'sec-6',
    label: 'Section 6 : A Day in the Life',
    subTitle: 'Routine, Discipline & Plan de Trading',
    page: 'Page 139',
    position: [2.1, -0.3, -0.1],
    color: '#06B6D4', // Cyan
    accentColor: '#22D3EE',
    badge: 'PRATIQUE RÉELLE',
    iconType: 'analyst',
    description: "Une journée type dans la peau d'un analyste technique professionnel : de la préparation matinale multi-timeframe à la tenue rigoureuse du journal de trading et au débriefing émotionnel du soir.",
    proTip: "Planifiez votre trade, et tradez votre plan. Un trader professionnel sait exactement où il sort avant même d'entrer en position.",
    subChapters: [
      {
        id: 'daily-routine',
        title: 'Routine Matinale & Top-Down Analysis',
        subtitle: 'Du mensuel au 15 minutes avant l’ouverture',
        summary: "L'analyste commence toujours par la vue d'ensemble macro : graphique Mensuel et Hebdomadaire pour identifier la tendance mère, Journalier pour les niveaux d'intervention majeurs, et 1h / 15m pour synchroniser l'entrée.",
        keyPoints: [
          '08h00 : Calendrier économique et annonces de taux / inflation',
          '08h30 : Cartographie des niveaux clés sur les indices et devises',
          '09h00 : Clôture de la première bougie et validation des setups'
        ],
        formulaOrRule: 'Top-Down Analysis : Mensuel ➔ Hebdo ➔ Quotidien ➔ 1 Heure'
      },
      {
        id: 'trade-journal',
        title: 'Le Journal de Trading & Psychologie d’Exécution',
        subtitle: 'Mesurer ce qui compte pour progresser chaque mois',
        summary: "Chaque position doit être consignée avec une capture d'écran de l'entrée, de la sortie, la raison technique du setup, le ratio risque/rendement visé, et l'état émotionnel au moment du clic.",
        keyPoints: [
          'Ne jamais déplacer son Stop-Loss pour espérer un rebond',
          'Accepter la perte comme un simple coût opérationnel d’entreprise',
          'Prendre des profits partiels aux paliers de résistance'
        ],
        formulaOrRule: 'Règle Absolue : Stop-Loss inamovible dès la prise d’ordre'
      }
    ]
  }
];

export const MINDMAP_EDGES: [string, string][] = [
  ['hub', 'sec-before'],
  ['sec-before', 'sec-1'],
  ['sec-1', 'sec-2'],
  ['sec-2', 'sec-3'],
  ['sec-3', 'sec-4'],
  ['sec-4', 'sec-5'],
  ['sec-5', 'sec-6'],
  ['sec-6', 'hub'],
];
