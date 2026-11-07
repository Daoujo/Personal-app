# Trading Mindmap 3D - Univers Constellation & Apple Watch Springboard

Refonte complète de la section **Trading** d'Automatisme & Systèmes en remplaçant l'ancienne interface par un univers 3D immersif développé avec Three.js. L'architecture spatiale s'inspire de la grille d'applications Apple Watch (où les éléments au centre grossissent et ressortent vers l'avant par effet de loupe dynamique) et modélise fidèlement le schéma de **Technical Analysis** fourni par l'utilisateur.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Décisions confirmées suite aux réponses de l'utilisateur :
> - **Style d'interaction spatiale** : Constellation 3D spatiale en orbite avec Three.js, intégrant la physique de grossissement central style Apple Watch.
> - **Action au clic** : Zoom caméra 3D direct et fluide vers la bulle sélectionnée, déployant ses sous-chapitres et concepts clés.
> - **Ambiance visuelle** : Sombre Apple Watch avec bulles en verre liquide translucide (*liquid glass*), halos néon (cyan, indigo, émeraude) et anneaux orbitaux.
> - **Périmètre du remaniement** : Suppression intégrale de l'ancien contenu de Trading pour repartir sur une base 100% neuve et épurée.

---

## 1. Overview & Core Concept

- **Expérience utilisateur** : L'utilisateur accède à la section Trading et découvre un univers 3D interactif sombre et élégant où flottent les 7 modules du mindmap de trading reliés par des flux d'énergie orientés.
- **Principe Apple Watch Springboard en 3D** :
  - Lorsque l'utilisateur fait glisser (pan / drag) l'univers 3D ou tourne autour, les bulles situées proches du centre de l'écran s'agrandissent automatiquement et s'avancent sur l'axe Z (effet loupe 3D et bombement sphérique).
  - Les bulles en périphérie rétrécissent légèrement et s'estompent avec un fondeur de champ subtil.
- **Zoom & Exploration des sous-chapitres** :
  - Cliquer sur une bulle déclenche une transition de caméra fluide (interpolation cinématique) qui plonge sur le module sélectionné.
  - Le module déploie ses sous-chapitres structurés, ses définitions fondamentales, des illustrations graphiques et des fiches d'exercices pratiques.
  - Un bouton épuré *« Retour à l'orbite »* permet de dézoomer et reprendre la navigation globale.

---

## 2. Structure du Mindmap Technique

L'univers 3D modélise fidèlement les 7 blocs et la hiérarchie du schéma :

```
                        ┌──────────────────────────────────────────────┐
                        │              Technical Analysis              │
                        │                (Centre / Hub)                │
                        └──────────────────────┬───────────────────────┘
                                               │
     ┌──────────────────┬──────────────────────┼───────────────────────┬──────────────────┐
     ▼                  ▼                      ▼                       ▼                  ▼
┌──────────────┐ ┌──────────────┐     ┌──────────────────┐    ┌─────────────────┐  ┌──────────────┐
│Before You    │ │Section 1     │     │Section 2         │    │Section 3        │  │Section 4     │
│Start (p. 3)  │─▶Introduction  │────▶│Chart Types       │───▶│Classical Chart  │─▶│Indicators    │
│Price/Time/   │ │Trend & Volume│     │Candles/Bars/P&F  │    │Head & Shoulders │  │RSI, MACD, MA │
│Place         │ └──────────────┘     └──────────────────┘    └─────────────────┘  └──────┬───────┘
└──────────────┘                                                                          │
                                                                                          ▼
                        ┌──────────────────────────────────────────────┐           ┌──────────────┐
                        │Section 6                                     │◀──────────│Section 5     │
                        │A Day in the Life of a Technical Analyst      │           │Waves, Numbers│
                        │Routine, Trading Plan & Risk Execution (p.139)│           │& Cycles      │
                        └──────────────────────────────────────────────┘           │Elliott/Fibo  │
                                                                                   └──────────────┘
```

### Contenu des 7 Stations :
1. **Centre (Hub) : Technical Analysis** : Vue synthétique de l'analyse technique, postulats de Dow (les cours intègrent tout, les cours suivent des tendances, l'histoire se répète).
2. **Before You Start (Page 3)** : Le triangle fondamental *Price*, *Time*, *Place*. Psychologie de marché, gestion du risque et mise en place du cadre d'analyse.
3. **Section 1 : Introduction (Page 7)** : Supports, résistances, lignes de tendance (trendlines), volumes de négociation et cassures de niveaux (*breakouts*).
4. **Section 2 : Chart Types (Page 29)** : Bougies japonaises (*Candlesticks* : marubozu, doji, marteau), graphiques en barres OHLC, graphiques en ligne et Point & Figure.
5. **Section 3 : Classical Chart Analysis (Page 59)** : Figures de retournement (Tête et Épaules, Double Top/Bottom) et figures de continuation (Triangles symétriques, Drapeaux/Pennants, Biseaux).
6. **Section 4 : Indicators (Page 95)** : Indicateurs de tendance (Moyennes mobiles SMA/EMA), oscillateurs de momentum (RSI, Stochastique), indicateurs de convergence/divergence (MACD) et volatilité (Bandes de Bollinger).
7. **Section 5 : Waves, Numbers and Cycles (Page 117)** : Théorie des vagues d'Elliott (5 vagues d'impulsion + 3 vagues de correction A-B-C), ratios de Fibonacci (0.382, 0.50, 0.618, 1.618) et cycles de marché.
8. **Section 6 : A Day in the Life of a Technical Analyst (Page 139)** : Routine pré-marché, sélection des actifs (*top-down analysis*), exécution méthodique, calcul de taille de position (*position sizing*) et journal de trading.

---

## 3. User Experience & Visual Design

- **Ambiance Visuelle Apple Watch Dark** :
  - Toile de fond profonde `#070A11` avec poussières d'étoiles/particules stellaires en suspension.
  - Bulles translucides en matériau physique Three.js (`MeshPhysicalMaterial`) avec réfraction, brillance spéculaire, bordures irisées et effet verre dépoli (*liquid glass*).
  - Halos lumineux néon dynamiques (indigo `#6366F1`, cyan `#38BDF8`, émeraude `#10B981`) projetés sous chaque bulle.
  - Connecteurs orbilaux (liens énergétiques courbés reliant les modules selon l'ordre d'apprentissage du livre).
- **Spatial Math (Effet Loupe Apple Watch)** :
  - Distance radiale calculée à chaque frame : $d = \sqrt{x^2 + y^2}$.
  - Facteur d'échelle : $\text{scale} = 1 + 0.55 \cdot \max(0, 1 - \frac{d}{R_{\max}})$.
  - Déplacement Z : $z = z_0 + 1.2 \cdot \max(0, 1 - \frac{d}{R_{\max}})$.
  - Résultat : dès qu'une bulle arrive au centre de la vue, elle s'élargit et jaillit au premier plan de façon organique.
- **Transition Cinématique au Clic** :
  - Clic détecté par `THREE.Raycaster`.
  - La caméra effectue un zoom lissé vers la bulle sélectionnée.
  - La station s'ouvre avec un panneau vitré ergonomique présentant les concepts, les graphiques schématiques et un quiz rapide d'assimilation.

---

## 4. Technical Architecture & Implementation Steps

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AutomatismeView.tsx                             │
│       ┌──────────────────┬──────────────────┬──────────────────┐       │
│       │   Option Math    │  Définition Aéro │  Trading (NOUVEAU│       │
│       └──────────────────┴──────────────────┴────────┬─────────┘       │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       │
                                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TradingMindmap3D.tsx                            │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Three.js Canvas Engine          │  │ Controls & Interaction      │  │
│  │ - Scene, Camera, WebGLRenderer  │  │ - Orbit/Pan touch controls  │  │
│  │ - MeshPhysicalMaterial (Glass)  │  │ - Apple Watch center-scale  │  │
│  │ - Spline Curve Connectors       │  │ - Raycaster click detection │  │
│  │ - Particle Background Starfield │  │ - Smooth camera zoom lerp   │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
│                                                       │                │
│  ┌────────────────────────────────────────────────────▼─────────────┐  │
│  │ ChapterDetailSheet.tsx (Liquid Glass Slide Sheet)                │  │
│  │ - Titre, Numéro de Section, Pagination originale du livre        │  │
│  │ - Résumé des principes et règles d'or de trading                 │  │
│  │ - Mini-simulateur ou schéma visuel interactif                    │  │
│  │ - Bouton "Retour à l'orbite"                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Plan d'Exécution :
1. **Installation des Dépendances** :
   - Installer `three` et `@types/three` via `install_applet_package`.
2. **Création du module `src/components/TradingMindmap3D.tsx`** :
   - Initialisation du renderer WebGL avec gestion de redimensionnement et cleanup mémoire rigoureux (`dispose()`).
   - Génération des bulles 3D procédurales en verre translucide avec icônes texturées et étiquettes typographiques nettes.
   - Tracé des liens orbilaux avec flèches d'orientation lumineuses.
   - Boucle d'animation avec grossissement Apple Watch basé sur la distance au centre.
   - Animation de caméra au clic (zoom in / zoom out).
3. **Création du panneau de contenu `src/components/TradingChapterSheet.tsx`** :
   - Affichage immersif du chapitre sélectionné (Before You Start, Chart Types, Indicators, etc.).
   - Synthèse pédagogique, concepts clés, astuces de pro et schémas graphiques.
4. **Intégration dans `AutomatismeView.tsx`** :
   - Remplacement complet de l'ancien contenu de Trading par le nouveau composant 3D.
5. **Vérification & Validation** :
   - Compilation TypeScript sans erreur (`compile_applet` et `lint_applet`).
   - Test des interactions tactiles, du drag, du centrage Apple Watch et du zoom.
