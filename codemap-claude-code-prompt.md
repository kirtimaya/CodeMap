# CodeMap — Claude Code Build Prompt

You are building **CodeMap**, a visual, interactive learning platform for software development concepts. It teaches Java internals, Spring Boot, and related topics through an animated memory-map interface that lets users drill from a high-level concept overview all the way down to detailed explanations with interactive visualizations. It also includes an interview preparation panel with MCQ and coding questions across 5 difficulty levels, generated dynamically by Claude.

Work through this prompt section by section in order. After completing each section, confirm what was built before moving to the next.

---

## Vision & aesthetic direction

CodeMap should feel like **an IDE met a star map**. Dark, technical, and precise — but alive with motion. Think deep-space dark backgrounds with glowing node clusters, phosphor-green and electric-cyan accents, and animations that feel like information flowing through circuits. Every animation should teach something, not just decorate.

Design rules:

- Dark theme only: near-black backgrounds (`#080c10`, `#0d1117`), with layered depth using slightly lighter panels.  
- Primary accent: electric cyan (`#00d4ff`). Secondary: phosphor green (`#39ff14`). Warning/highlight: amber (`#f59e0b`). Error: crimson (`#ff4444`).  
- Typography: **`Space Mono`** for headings and node labels (monospace, technical character), **`IBM Plex Sans`** for body and explanations, **`JetBrains Mono`** for all code. Load from Google Fonts.  
- Borders should be subtle: `1px solid rgba(255,255,255,0.06)`. Use glow effects (`box-shadow: 0 0 20px rgba(0,212,255,0.3)`) sparingly for active/hover states.  
- Animations must be purposeful: they should visually explain the concept, not just look cool. An animation showing a Java object allocated on the heap should feel like the heap is actually filling.

---

## Tech stack

### Frontend

- **React 18 \+ TypeScript \+ Vite**  
- **React Flow** (`@xyflow/react`) — for the concept map (node graph, zoom, pan, expand/collapse)  
- **Framer Motion** — all page transitions, concept detail entry/exit, node animations, test panel  
- **D3.js** — data-driven concept visualizations (JVM heap, GC simulation, thread states, Spring lifecycle)  
- **Monaco Editor** (`@monaco-editor/react`) — code editor in the test panel  
- **Tailwind CSS** — utility styling  
- **Zustand** — lightweight state management (current concept, test session, progress)  
- **React Router v6** — routing

### Backend (build after frontend UI is solid)

- **Spring Boot 3.x (Java 21\)** — the backend itself is a live teaching example  
- **Spring Data JPA \+ Postgres** — question bank, attempt history, progress  
- **Spring WebFlux** — for streaming LLM responses to the test panel (reactive)  
- **Anthropic Java SDK** — question generation and coding-answer grading

---

## Monorepo structure

codemap/

├── frontend/               \# Vite \+ React

│   ├── src/

│   │   ├── content/        \# Concept graph JSON files

│   │   │   ├── java.json

│   │   │   └── springboot.json

│   │   ├── components/

│   │   │   ├── map/        \# ConceptMap, ConceptNode, MapControls, MiniMap

│   │   │   ├── detail/     \# ConceptDetail, VisContainer, Explanation

│   │   │   ├── visualizations/  \# One file per concept animation

│   │   │   ├── testpanel/  \# TestPanel, MCQCard, CodeChallenge, DifficultySelector

│   │   │   └── ui/         \# Button, Badge, Tooltip, ProgressBar, BreadcrumbTrail

│   │   ├── store/          \# Zustand stores

│   │   ├── hooks/          \# useConceptMap, useTestSession, useProgress

│   │   ├── pages/          \# HomePage, JavaPage, SpringBootPage, InterviewHub

│   │   └── styles/         \# global.css, animations.css

│   └── package.json

└── backend/                \# Spring Boot

    ├── src/main/java/com/codemap/

    │   ├── question/       \# QuestionService, QuestionController

    │   ├── grading/        \# GradingService (LLM-based)

    │   ├── progress/       \# ProgressService, UserProgress entity

    │   └── llm/            \# AnthropicClient, QuestionGenerator

    └── pom.xml

---

## Content model — the concept graph

Every piece of content is a node in a typed graph. Store this in `src/content/java.json` and `src/content/springboot.json`.

type DifficultyLevel \= 1 | 2 | 3 | 4 | 5;

interface ConceptNode {

  id: string;                    // unique slug, e.g. "jvm-gc-g1"

  parentId: string | null;       // null \= root node

  label: string;                 // short label shown on the map node

  tagline: string;               // one-line summary shown on hover

  depth: number;                 // 0 \= root, 1 \= major concept, 2 \= sub-concept, 3 \= leaf

  visualizationType: string | null;  // which visualization component to render, or null

  content: {

    overview: string;            // 2–3 sentence plain-English overview

    sections: {

      heading: string;

      body: string;

      codeSnippet?: { language: string; code: string };

    }\[\];

    keyInsights: string\[\];       // bullet points shown in a highlight box

  };

  estimatedReadMinutes: number;

  tags: string\[\];

  interviewRelevance: DifficultyLevel;  // how likely to come up in interviews 1-5

}

### Java concept graph — full seed data (build this first)

The Java page roots with these top-level nodes (depth 0), each expanding to children. Build depth 0 and depth 1 fully; depth 2+ can be partially seeded.

java-root (virtual root, invisible)

├── jvm-internals

│   ├── jvm-classloading

│   ├── jvm-bytecode

│   ├── jvm-jit

│   └── jvm-runtime-areas (heap, stack, metaspace, PC register)

├── memory-gc

│   ├── gc-heap-structure

│   ├── gc-algorithms (serial, parallel, G1, ZGC, Shenandoah)

│   ├── gc-object-lifecycle

│   └── gc-tuning

├── concurrency

│   ├── thread-model

│   ├── synchronized-locks

│   ├── executors-threadpool

│   ├── completablefuture

│   └── virtual-threads (Java 21\)

├── collections

│   ├── list-internals (ArrayList vs LinkedList)

│   ├── map-internals (HashMap, TreeMap, LinkedHashMap)

│   ├── concurrent-collections

│   └── streams-api

├── version-evolution

│   ├── java-8 (lambdas, streams, Optional)

│   ├── java-11 (local-var, HTTP client)

│   ├── java-17 (sealed classes, records, pattern matching preview)

│   └── java-21 (virtual threads GA, pattern matching switch, sequenced collections)

└── exceptions-io

    ├── exception-hierarchy

    └── nio-channels

### Spring Boot concept graph — full seed data

springboot-root (virtual root, invisible)

├── core-spring

│   ├── ioc-container

│   ├── dependency-injection (constructor, setter, field)

│   ├── bean-lifecycle

│   └── application-context

├── auto-configuration

│   ├── how-autoconfig-works (spring.factories / AutoConfiguration.imports)

│   ├── conditional-beans (@ConditionalOnClass etc.)

│   └── custom-starter

├── web-mvc

│   ├── request-lifecycle (DispatcherServlet → HandlerMapping → Controller → View)

│   ├── rest-controllers

│   ├── exception-handling (@ControllerAdvice)

│   └── filters-interceptors

├── spring-data

│   ├── jpa-overview

│   ├── repositories (CrudRepository, JpaRepository)

│   ├── transactions (@Transactional propagation)

│   └── query-methods

├── spring-security

│   ├── security-filter-chain

│   ├── authentication-flow

│   └── authorization

├── aop

│   ├── proxy-mechanism (JDK vs CGLIB)

│   ├── advice-types

│   └── pointcut-expressions

└── observability

    ├── actuator

    └── micrometer-metrics

---

## The concept map (Build Phase 1\)

### ConceptMap component

Use React Flow with a **custom layout algorithm** — a radial tree layout where the root is centered and children orbit outward. Do NOT use React Flow's built-in layout; implement the radial positioning logic yourself with `elkjs` or a simple recursive radial calculation.

Nodes at depth 0 are invisible root anchors. Nodes at depth 1 are large, glowing cluster nodes. Nodes at depth 2 are medium satellite nodes. Nodes at depth 3 (leaves) are small terminal nodes.

Only render nodes at the currently expanded depth. When the user clicks a cluster node, animate its children blooming outward (staggered `framer-motion` scale \+ opacity from 0 at the parent position to 1 at their final positions). This is the key "drill-down" animation. It must feel organic — use spring physics, not easing curves.

// Node bloom animation — use in ConceptNode

const bloomVariants \= {

  hidden: { scale: 0, opacity: 0, x: parentX, y: parentY },

  visible: (i: number) \=\> ({

    scale: 1,

    opacity: 1,

    x: finalX,

    y: finalY,

    transition: { type: "spring", stiffness: 200, damping: 20, delay: i \* 0.06 }

  })

};

### ConceptNode component

Each node is a custom React Flow node. Design specs:

- Depth-1 nodes: hexagonal shape (use clip-path), 80px across, glowing cyan border, label in Space Mono  
- Depth-2 nodes: rounded square, 60px, faint border, subtle pulse on hover  
- Depth-3 (leaf) nodes: pill shape, 48px height, solid background  
- All nodes: hover state adds a glow (`box-shadow` with cyan), cursor pointer  
- Active (selected) node: brighter glow, scale 1.1 with a spring animation  
- Nodes with `interviewRelevance >= 4` get a small amber star icon in the top-right corner

### Map controls

- Zoom in/out buttons  
- "Reset view" re-centers to root  
- A MiniMap (React Flow built-in, styled dark)  
- A breadcrumb trail at the top showing the drill path: `Java → JVM Internals → Garbage Collection → G1 GC`. Each breadcrumb is clickable to jump back up.

---

## The concept detail view (Build Phase 2\)

When a leaf node is clicked, the detail panel slides in from the right using Framer Motion (`x: '100%' → x: 0`). The concept map remains visible on the left (on wide screens) or is replaced on narrow screens.

The detail panel structure:

1. **Header** — concept label, tagline, estimated read time, interview relevance stars  
2. **Interactive visualization** — the concept's animation (see below). This is the most important section.  
3. **Overview** — plain-English explanation  
4. **Sections** — with optional code snippets (use syntax highlighting, not Monaco — lighter weight for reading)  
5. **Key insights** — a highlight box with bullet points  
6. **Practice button** — opens the test panel for this concept

---

## Visualizations — the animations that teach (Build Phase 3\)

Build one visualization component per concept listed below. Every visualization must be **interactive**: the user can play/pause, step through, and in most cases adjust a parameter to see the effect. Use D3 for data-driven animations and CSS/Framer Motion for structural animations.

Build these in priority order:

### 1\. `JVMHeapViz` — used by `gc-heap-structure`

Animate a live Java heap divided into regions: Eden, Survivor S0/S1, Old Gen, Metaspace. Show objects being allocated (small rectangles appearing in Eden), filling Eden, triggering a Minor GC (objects in Eden either die — they fade out — or survive and move to S0). After a few GC cycles, survivors get promoted to Old Gen. Controls: "Allocate objects" button, "Run GC" button, speed slider.

### 2\. `ClassLoadingViz` — used by `jvm-classloading`

Show the class-loader hierarchy as a vertical chain: Bootstrap → Extension → Application → Custom. When the user types a class name (e.g. `java.lang.String`) and clicks "Load", animate the delegation: highlight each loader as it checks and delegates upward, then the Bootstrap loader returning the loaded class back down the chain. Show the method area / metaspace receiving the class.

### 3\. `ThreadStateViz` — used by `thread-model`

A state machine diagram showing a thread's lifecycle: NEW → RUNNABLE → BLOCKED / WAITING / TIMED\_WAITING → TERMINATED. Show multiple thread "tokens" (colored circles) moving through the states concurrently. A "synchronized block" visual shows threads queuing for a lock — one holds it (green), others are BLOCKED (amber). User can add threads with a button.

### 4\. `VirtualThreadViz` — used by `virtual-threads`

Side-by-side comparison: left panel shows 5 platform threads each mapped 1:1 to an OS thread (heavy, thick bars). Right panel shows 1000 virtual threads multiplexed onto a handful of carrier threads (thin fibers weaving through carrier lanes). When an I/O block happens, animate the virtual thread unmounting from the carrier (dotted line lifts off) and the carrier picking up another virtual thread. Show the memory usage counter update dramatically.

### 5\. `SpringBeanLifecycleViz` — used by `bean-lifecycle`

A timeline/flowchart showing a bean's lifecycle: Instantiation → Property injection → `BeanNameAware` → `BeanPostProcessor.before` → `@PostConstruct` → Ready → `@PreDestroy` → Destroy. Animate each step as a glowing pulse that travels along the timeline. User can "hover" any step to see which interface/annotation corresponds to it.

### 6\. `DispatcherServletViz` — used by `request-lifecycle`

Animate an HTTP request (a glowing packet) flowing through the Spring MVC pipeline: `HttpRequest → DispatcherServlet → HandlerMapping (finds the @Controller) → HandlerAdapter → @Controller method → ModelAndView → ViewResolver → Response`. Each component lights up as the request passes through it. User can toggle showing the filter chain before DispatcherServlet.

### 7\. `SecurityFilterChainViz` — used by `security-filter-chain`

Show the Spring Security filter chain as a vertical stack of filters. Animate a request (green) passing through each filter. At the authentication filter, show it either succeeding (continues green) or failing (turns red, short-circuits to 401). Show `SecurityContextHolder` being populated after successful auth.

### 8\. `AOPProxyViz` — used by `proxy-mechanism`

Show a target bean and a proxy bean side by side. Animate a method call arriving at the proxy first, the advice logic executing (shown as a highlighted sidebar), then the call delegating to the actual bean, returning, and the advice running again on the way back (for `@Around`). Let the user switch between JDK proxy (interface-based) and CGLIB proxy (subclass-based) to see the difference.

---

## The test panel (Build Phase 4\)

Accessible via the **Practice** button on any concept detail, or the global **Interview Hub** page.

### DifficultySelector

A horizontal 5-step selector. Each level has a label:

- L1 — Fundamentals  
- L2 — Junior  
- L3 — Mid-level  
- L4 — Senior  
- L5 — Expert

When a level is selected, a short description fades in explaining what to expect at that level. Animate selection with an underline slide.

### MCQ mode

- Question card slides in from the right (`x: 100% → 0`, spring animation)  
- 4 options rendered as clickable cards  
- On selection: immediately lock other options, animate selected option — correct gets a green glow \+ checkmark animation, incorrect gets a red flash \+ shows which was correct  
- Explanation expands below with a smooth height animation  
- "Next question" button slides the next card in from the right, previous card exits to the left  
- Score tracker in the top-right corner (animated number increment)

### Coding mode

- Split layout: left \= Monaco editor (dark theme, JetBrains Mono, language \= Java), right \= problem statement \+ test cases  
- "Run" button sends code to the backend grading endpoint (stream the response with `EventSource`)  
- Grading result streams in word by word below the editor  
- If the grade is passing, trigger a confetti burst (`canvas-confetti` or a custom particle system)  
- Show a rubric breakdown: correctness, edge cases, code quality, Java idiom

### Question generation

The test panel calls the backend `/api/questions/generate` with `{ conceptId, level, type }`. The backend calls Claude with this system prompt template:

You are an expert Java/Spring interviewer. Generate a \[type\] question for the concept "\[conceptLabel\]" 

at difficulty level \[level\]/5 (\[levelDescription\]).

For MCQ: return JSON with { question, options: \[4 strings\], correctIndex: 0-3, explanation: string }

For coding: return JSON with { 

  prompt: string, 

  starterCode: string (Java), 

  rubric: string,

  exampleSolution: string (hidden from user),

  hints: string\[\]

}

Difficulty \[level\] means: \[levelDescription\]

The question should specifically test understanding of \[conceptTagline\].

Return ONLY valid JSON, no markdown fences.

Cache generated questions in Postgres (`source = 'generated'`) to avoid regenerating identical requests.

---

## HomePage (Build Phase 5\)

The homepage (`/`) is the entry point. It should feel like an observatory — a dark canvas with two large glowing "planets" representing Java and Spring Boot. When you hover one, it subtly grows and glowing satellite moons orbit around it (representing the sub-concepts). Click to enter that planet's concept map.

Sections:

1. **Hero** — "Navigate the Universe of Software" \+ the two planet cards side by side  
2. **How it works** — 3 steps with animated icons: Explore the Map → Understand with Visuals → Test your Knowledge  
3. **Interview Hub CTA** — "Prepare for your next interview" with a 5-level difficulty diagram

---

## Interview Hub page (Build Phase 6\)

Route: `/interview`

A dedicated page where users can select any concept from either page \+ any level and start a test session without entering the concept map. Show a grid of concept cards grouped by page (Java / Spring Boot). Each card shows the concept label, a mastery indicator (% questions answered correctly), and the highest level cleared.

---

## Page transitions

All route changes use Framer Motion `AnimatePresence` with this pattern:

const pageVariants \= {

  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },

  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: \[0.22, 1, 0.36, 1\] } },

  exit:    { opacity: 0, y: \-8, filter: 'blur(2px)', transition: { duration: 0.2 } }

};

---

## Global progress tracking

Use Zustand \+ `localStorage` for progress persistence (no auth in v1).

interface ProgressStore {

  conceptProgress: Record\<string, {

    visited: boolean;

    mastery: number;       // 0–100

    levelsCleared: number; // highest level passed (1-5)

    attemptsCount: number;

  }\>;

  markVisited: (conceptId: string) \=\> void;

  recordAttempt: (conceptId: string, level: number, correct: boolean) \=\> void;

}

On the concept map, tint visited nodes slightly lighter and add a small mastery ring around them (a partial circle, like a progress indicator).

---

## Backend (Build Phase 7 — after frontend is solid)

The Spring Boot backend is intentionally kept small. It exposes four endpoints:

POST /api/questions/generate   — body: { conceptId, level, type } → Question

GET  /api/questions/curated    — query: conceptId, level, type → Question\[\]

POST /api/grade                — body: { conceptId, level, userCode, prompt, rubric } → stream GradingResult

POST /api/progress             — body: AttemptRecord → void (future: for cross-device sync)

The backend uses Spring Boot auto-configuration for the Anthropic client and database. Write the service layer first, then the controllers. The `GradingService` should stream the LLM response using Spring WebFlux `Flux<String>` and send it as Server-Sent Events.

Interesting teaching touch: add `@Timed` Micrometer metrics on every endpoint and expose them via `/actuator/prometheus`. Include a note in the codebase explaining what this does — the backend is also a live teaching example.

---

## Build order summary

Execute in this exact sequence. Do not skip ahead.

1. `[SCAFFOLD]` — Vite \+ React \+ TS \+ Tailwind \+ Router. Install all npm packages. Verify dev server runs.  
2. `[CONTENT]` — Write `java.json` and `springboot.json` with the full concept graph seeded above.  
3. `[MAP-SHELL]` — `ConceptMap` \+ `ConceptNode` \+ React Flow wired to Java concept graph. Nodes appear, radial layout works, clicking expands children. No animations yet.  
4. `[MAP-ANIMATE]` — Add bloom expansion, hover glow, node styles per depth, MiniMap, breadcrumb trail.  
5. `[DETAIL-PANEL]` — `ConceptDetail` component with slide-in animation, reading content from JSON. No visualization yet.  
6. `[VIZ-1]` — `JVMHeapViz` fully interactive. Wire into the `gc-heap-structure` concept node.  
7. `[VIZ-2]` — `ClassLoadingViz`. Wire into `jvm-classloading`.  
8. `[VIZ-3]` — `SpringBeanLifecycleViz`. Wire into `bean-lifecycle`.  
9. `[VIZ-4]` — `DispatcherServletViz`. Wire into `request-lifecycle`.  
10. `[VIZ-5]` — `ThreadStateViz`, `VirtualThreadViz`. Wire into `thread-model`, `virtual-threads`.  
11. `[VIZ-6]` — `SecurityFilterChainViz`, `AOPProxyViz`. Wire remaining Spring concepts.  
12. `[TEST-MCQ]` — `TestPanel` \+ `DifficultySelector` \+ `MCQCard` with static seed questions (no LLM yet). All animations.  
13. `[TEST-CODING]` — `CodeChallenge` \+ Monaco editor. Static seed coding questions. No grading yet.  
14. `[HOMEPAGE]` — Hero with two planet cards, how-it-works section, Interview Hub CTA.  
15. `[INTERVIEW-HUB]` — `/interview` page with concept grid.  
16. `[PROGRESS]` — Zustand store, localStorage persistence, mastery rings on map nodes.  
17. `[PAGE-TRANSITIONS]` — `AnimatePresence` wired to all routes.  
18. `[SPRING-BOOT]` — Spring Boot backend: scaffold, entities, repositories, question controller, grading endpoint.  
19. `[LLM-GENERATE]` — Wire question generation endpoint \+ update frontend to call it.  
20. `[LLM-GRADE]` — Wire grading endpoint \+ streaming response in `CodeChallenge`.  
21. `[POLISH]` — Responsive layout, accessibility (keyboard nav on the map, ARIA labels), performance (lazy-load visualizations), final animation tuning.

---

## Quality bars

Do not move to the next build step unless the current step meets all of these:

- All TypeScript types are correct (no `any`)  
- No console errors or warnings  
- Animations feel smooth (use `will-change: transform` on animated elements; keep animations under 60ms initial delay)  
- Components are genuinely interactive (buttons do things, controls change the visualization)  
- The dark theme is applied consistently — no white backgrounds anywhere  
- Code is readable with comments on non-obvious logic

---

## Do NOT do these things

- Do not use `create-react-app` — use Vite.  
- Do not use `any` in TypeScript — use proper interfaces.  
- Do not put visualization logic inside the concept data files — keep content and components separate.  
- Do not load all visualizations eagerly — lazy-load with `React.lazy` \+ `Suspense`.  
- Do not hardcode quiz questions into the UI components — they must come from the content layer or the API.  
- Do not use placeholder/Lorem Ipsum content — write real, accurate Java and Spring Boot explanations from the start.  
- Do not build the backend before the frontend concept map and at least three visualizations are working.  
- Do not use a CSS framework other than Tailwind — no Bootstrap, no Material UI.

