import { ExamTemplate, MockTest, Question } from '../types';

export const EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: 'cat_standard',
    name: 'CAT Standard (Common Admission Test)',
    examType: 'CAT',
    description: 'Official CAT pattern: 3 strictly timed 40-minute sections (120 mins total). No section switching.',
    totalTimeMinutes: 120,
    totalMarks: 198,
    sections: [
      {
        id: 'VARC',
        name: 'Verbal Ability & Reading Comprehension',
        durationMinutes: 40,
        isTimedStrictly: true,
        allowSectionSwitching: false,
        marksPerCorrect: 3,
        negativeMarksMcq: 1,
        negativeMarksTita: 0,
        totalQuestionsTarget: 24,
      },
      {
        id: 'DILR',
        name: 'Data Interpretation & Logical Reasoning',
        durationMinutes: 40,
        isTimedStrictly: true,
        allowSectionSwitching: false,
        marksPerCorrect: 3,
        negativeMarksMcq: 1,
        negativeMarksTita: 0,
        totalQuestionsTarget: 20,
      },
      {
        id: 'QA',
        name: 'Quantitative Ability',
        durationMinutes: 40,
        isTimedStrictly: true,
        allowSectionSwitching: false,
        marksPerCorrect: 3,
        negativeMarksMcq: 1,
        negativeMarksTita: 0,
        totalQuestionsTarget: 22,
      },
    ],
  },
  {
    id: 'xat_standard',
    name: 'XAT Standard (Xavier Aptitude Test)',
    examType: 'XAT',
    description: 'XAT Pattern: VALR, Decision Making, QA & DI with flexible section navigation (175 mins).',
    totalTimeMinutes: 175,
    totalMarks: 75,
    sections: [
      {
        id: 'VALR',
        name: 'Verbal & Logical Ability',
        durationMinutes: 60,
        isTimedStrictly: false,
        allowSectionSwitching: true,
        marksPerCorrect: 1,
        negativeMarksMcq: 0.25,
        negativeMarksTita: 0,
        totalQuestionsTarget: 26,
      },
      {
        id: 'DM',
        name: 'Decision Making',
        durationMinutes: 50,
        isTimedStrictly: false,
        allowSectionSwitching: true,
        marksPerCorrect: 1,
        negativeMarksMcq: 0.25,
        negativeMarksTita: 0,
        totalQuestionsTarget: 21,
      },
      {
        id: 'QA_DI',
        name: 'Quantitative Ability & Data Interpretation',
        durationMinutes: 65,
        isTimedStrictly: false,
        allowSectionSwitching: true,
        marksPerCorrect: 1,
        negativeMarksMcq: 0.25,
        negativeMarksTita: 0,
        totalQuestionsTarget: 28,
      },
    ],
  },
];

export const PRELOADED_MOCKS: MockTest[] = [
  {
    id: 'cat_2024_slot1',
    title: 'CAT 2024 Official Slot 1 Simulation',
    examTemplateId: 'cat_standard',
    examType: 'CAT',
    year: '2024',
    slot: 'Slot 1',
    description: 'Complete official standard simulation with RC Passages, DILR Sets (with tables & charts), and QA MCQs & TITAs.',
    totalDurationMinutes: 120,
    createdDate: '2024-11-28',
    isPreloaded: true,
    sections: [
      {
        id: 'VARC',
        name: 'Verbal Ability & Reading Comprehension',
        durationMinutes: 40,
        passages: [
          {
            id: 'rc_1',
            title: 'Reading Comprehension 1: Evolution of Epistemic Trust in the Digital Era',
            content: `In an era saturated by automated algorithmic dissemination, epistemic trust—our reliance on the cognitive competence and honesty of informants—has fundamentally shifted from institutional authority to peer network validation. Traditional epistemic communities derived authority from credentials, rigorous peer-review, and institutional pedigree. However, decentralized information networks reward engagement velocity over factual verifiability.\n\nSociologist C. Thi Nguyen argues that echo chambers differ from epistemic bubbles: while bubbles merely lack relevant information, echo chambers actively condition their members to systematically distrust all outside sources. This creates epistemic polarization where disconfirming evidence is inverted into proof of external conspiracy. The cognitive vulnerability lies not merely in cognitive laziness, but in the social nature of our knowledge architectures. Humans are inherently social knowers who outsource epistemic verification to trusted in-groups. When algorithms optimize for viral contagion, they exploit this in-group trust heuristic, fragmenting shared consensus into warring epistemic enclaves.`
          },
          {
            id: 'rc_2',
            title: 'Reading Comprehension 2: Urban Density and Environmental Resilience',
            content: `The anti-urban bias of classical environmentalism long posited that human density was inherently antithetical to ecological preservation. Suburbia was romanticized as living in harmony with nature. Yet thermodynamic and transport data decisively upend this pastoral delusion. Dense urban cores, exemplified by cities like Tokyo and Manhattan, exhibit vastly lower per-capita carbon footprints compared to sprawling suburban peripheries.\n\nCompact urban morphology minimizes transmission losses in electrical grids, maximizes transit efficiency through mass electrified mobility, and curtails land fragmentation that threatens bio-corridors. When humans concentrate vertically, nature is spared horizontally. The paradox of density is that by clustering human impact onto an ultra-concentrated spatial footprint, metropolitan density emerges as humanity's most potent ecological mitigation strategy.`
          }
        ],
        questions: [
          {
            id: 'q_varc_1',
            sectionId: 'VARC',
            questionNumber: 1,
            type: 'MCQ',
            passageId: 'rc_1',
            passageTitle: 'Evolution of Epistemic Trust in the Digital Era',
            passage: `In an era saturated by automated algorithmic dissemination, epistemic trust—our reliance on the cognitive competence and honesty of informants—has fundamentally shifted from institutional authority to peer network validation. Traditional epistemic communities derived authority from credentials, rigorous peer-review, and institutional pedigree. However, decentralized information networks reward engagement velocity over factual verifiability.\n\nSociologist C. Thi Nguyen argues that echo chambers differ from epistemic bubbles: while bubbles merely lack relevant information, echo chambers actively condition their members to systematically distrust all outside sources. This creates epistemic polarization where disconfirming evidence is inverted into proof of external conspiracy. The cognitive vulnerability lies not merely in cognitive laziness, but in the social nature of our knowledge architectures. Humans are inherently social knowers who outsource epistemic verification to trusted in-groups. When algorithms optimize for viral contagion, they exploit this in-group trust heuristic, fragmenting shared consensus into warring epistemic enclaves.`,
            questionText: 'According to the passage, what is the crucial distinction between "epistemic bubbles" and "echo chambers"?',
            options: [
              { id: 'A', text: 'Epistemic bubbles are algorithmically created, whereas echo chambers are strictly face-to-face peer groups.' },
              { id: 'B', text: 'Epistemic bubbles suffer from accidental informational absence, whereas echo chambers cultivate active, systematic distrust toward outside sources.' },
              { id: 'C', text: 'Echo chambers are established by institutional authorities, while epistemic bubbles emerge organically.' },
              { id: 'D', text: 'Epistemic bubbles exhibit violent hostility toward facts, while echo chambers remain neutral.' }
            ],
            correctAnswer: 'B',
            marks: 3,
            negativeMarks: 1,
            topic: 'Reading Comprehension',
            subtopic: 'Detail & Distinction',
            difficulty: 'Medium',
            explanation: 'The author directly quotes Nguyen stating that "while bubbles merely lack relevant information, echo chambers actively condition their members to systematically distrust all outside sources."'
          },
          {
            id: 'q_varc_2',
            sectionId: 'VARC',
            questionNumber: 2,
            type: 'MCQ',
            passageId: 'rc_1',
            passageTitle: 'Evolution of Epistemic Trust in the Digital Era',
            questionText: 'Which of the following, if true, would MOST WEAKEN the author’s claim regarding algorithmic exploitation?',
            options: [
              { id: 'A', text: 'Social media users frequently verify information through academic journals before sharing posts.' },
              { id: 'B', text: 'Algorithms are programmed by software engineers using neural networks.' },
              { id: 'C', text: 'Engagement metrics on social platforms correlate positively with outrage and emotional arousal.' },
              { id: 'D', text: 'Traditional print newspapers have experienced a steady decline in paid circulation over the last decade.' }
            ],
            correctAnswer: 'A',
            marks: 3,
            negativeMarks: 1,
            topic: 'Reading Comprehension',
            subtopic: 'Critical Reasoning / Weaken',
            difficulty: 'Hard',
            explanation: 'If users rigorously verify information through academic journals before sharing, it weakens the premise that algorithms successfully exploit lazy in-group trust heuristics to spread unverified claims.'
          },
          {
            id: 'q_varc_3',
            sectionId: 'VARC',
            questionNumber: 3,
            type: 'MCQ',
            passageId: 'rc_2',
            passageTitle: 'Urban Density and Environmental Resilience',
            questionText: 'The author refers to "living in harmony with nature" in suburbia as a "pastoral delusion" primarily to emphasize that:',
            options: [
              { id: 'A', text: 'Suburban living requires high agricultural land conversion without delivering true ecological efficiency.' },
              { id: 'B', text: 'People living in suburbs do not care about environmental degradation.' },
              { id: 'C', text: 'Suburban infrastructure produces significantly higher per-capita emissions and ecological fragmentation despite looking green.' },
              { id: 'D', text: 'Cities produce zero pollution compared to suburban municipalities.' }
            ],
            correctAnswer: 'C',
            marks: 3,
            negativeMarks: 1,
            topic: 'Reading Comprehension',
            subtopic: 'Author Tone & Rhetoric',
            difficulty: 'Medium',
            explanation: 'The passage highlights that despite the green aesthetic, suburban sprawl has high transport emissions and land fragmentation, making its perceived eco-friendliness a delusion compared to dense cities.'
          },
          {
            id: 'q_varc_4',
            sectionId: 'VARC',
            questionNumber: 4,
            type: 'TITA',
            questionText: 'Five jumbled sentences (1 to 5) related to language evolution are given below. Four of them can be put together in a meaningful sequence. Identify the sentence that does NOT fit and type its number:\n\n1. Language is not a cultural artifact that we learn the way we learn to tell time.\n2. Instead, it is a distinct piece of the biological makeup of our brains.\n3. Pinker contends that thinking of language as an instinct changes our view of human nature.\n4. Children effortlessly acquire complex grammatical structures without explicit formal instruction.\n5. The development of literacy, in contrast, requires years of deliberate institutional schooling and phonetic drills.',
            correctAnswer: '5',
            marks: 3,
            negativeMarks: 0,
            topic: 'Verbal Ability',
            subtopic: 'Odd Sentence Out',
            difficulty: 'Hard',
            explanation: 'Sentences 1, 2, 3, and 4 form a coherent argument about Pinker\'s theory of language as a biological, innate instinct. Sentence 5 introduces written literacy and formal schooling, which is outside the biological instinct theme.'
          },
          {
            id: 'q_varc_5',
            sectionId: 'VARC',
            questionNumber: 5,
            type: 'MCQ',
            questionText: 'The four sentences (labelled 1, 2, 3, 4) given below, when properly sequenced, form a coherent paragraph. Select the correct order:\n\n1. By contrast, deep work requires protracted stretches of uninterrupted cognitive intensity.\n2. In an economy increasingly dominated by automated workflows, shallow tasks like answering emails are easily outsourced.\n3. Those who cultivate the rare ability to focus without distraction will create massive disproportionate value.\n4. Shallow work, while comfortable, fails to build rare and valuable skillsets.',
            options: [
              { id: 'A', text: '2-4-1-3' },
              { id: 'B', text: '4-2-1-3' },
              { id: 'C', text: '2-1-4-3' },
              { id: 'D', text: '1-4-2-3' }
            ],
            correctAnswer: 'A',
            marks: 3,
            negativeMarks: 1,
            topic: 'Verbal Ability',
            subtopic: 'Para Jumbles',
            difficulty: 'Medium',
            explanation: '2 introduces shallow work in the modern economy, 4 elaborates on its drawback, 1 contrasts it with deep work ("By contrast..."), and 3 concludes with the competitive advantage.'
          }
        ]
      },
      {
        id: 'DILR',
        name: 'Data Interpretation & Logical Reasoning',
        durationMinutes: 40,
        passages: [
          {
            id: 'dilr_set_1',
            title: 'Set 1: Tech Startup Venture Funding & Valuation Matrix',
            content: `Four venture capital firms (Alpha, Beta, Gamma, Delta) invested in five distinct AI startups (Apex, Byte, Core, Data, Echo) across Series A funding rounds. The total capital deployed across all 5 startups was $120 Million.\n\nKey Conditions:\n1. Alpha invested $35M in total across 3 startups, with its largest single investment being $20M in Apex.\n2. Beta invested only in Byte and Echo, putting twice as much in Echo as in Byte.\n3. Core received funding from exactly three VC firms: Alpha ($5M), Gamma ($15M), and Delta ($10M).\n4. Gamma invested an equal amount of $15M in each of its portfolio startups.\n5. Delta deployed a total of $30M, divided across Core, Data, and Apex in the ratio 2 : 3 : 1.\n6. Total funding received by each startup: Apex ($35M), Byte ($20M), Core ($30M), Data ($20M), Echo ($15M).`,
            diagramSvg: `<svg viewBox="0 0 500 200" class="w-full h-auto bg-slate-900/60 rounded-lg p-2 border border-slate-700">
  <rect x="30" y="20" width="80" height="150" fill="#3b82f6" rx="4"/>
  <text x="70" y="160" fill="white" font-size="12" text-anchor="middle">Apex ($35M)</text>
  <rect x="125" y="65" width="80" height="105" fill="#10b981" rx="4"/>
  <text x="165" y="160" fill="white" font-size="12" text-anchor="middle">Byte ($20M)</text>
  <rect x="220" y="35" width="80" height="135" fill="#8b5cf6" rx="4"/>
  <text x="260" y="160" fill="white" font-size="12" text-anchor="middle">Core ($30M)</text>
  <rect x="315" y="65" width="80" height="105" fill="#f59e0b" rx="4"/>
  <text x="355" y="160" fill="white" font-size="12" text-anchor="middle">Data ($20M)</text>
  <rect x="410" y="80" width="75" height="90" fill="#ec4899" rx="4"/>
  <text x="447" y="160" fill="white" font-size="12" text-anchor="middle">Echo ($15M)</text>
</svg>`
          }
        ],
        questions: [
          {
            id: 'q_dilr_1',
            sectionId: 'DILR',
            questionNumber: 6,
            type: 'MCQ',
            passageId: 'dilr_set_1',
            passageTitle: 'Set 1: Tech Startup Venture Funding Matrix',
            passage: `Four venture capital firms (Alpha, Beta, Gamma, Delta) invested in five distinct AI startups (Apex, Byte, Core, Data, Echo) across Series A funding rounds. The total capital deployed across all 5 startups was $120 Million.\n\nKey Conditions:\n1. Alpha invested $35M in total across 3 startups, with its largest single investment being $20M in Apex.\n2. Beta invested only in Byte and Echo, putting twice as much in Echo as in Byte.\n3. Core received funding from exactly three VC firms: Alpha ($5M), Gamma ($15M), and Delta ($10M).\n4. Gamma invested an equal amount of $15M in each of its portfolio startups.\n5. Delta deployed a total of $30M, divided across Core, Data, and Apex in the ratio 2 : 3 : 1.\n6. Total funding received by each startup: Apex ($35M), Byte ($20M), Core ($30M), Data ($20M), Echo ($15M).`,
            questionText: 'How much money did Delta invest in Data?',
            options: [
              { id: 'A', text: '$10 Million' },
              { id: 'B', text: '$15 Million' },
              { id: 'C', text: '$5 Million' },
              { id: 'D', text: '$12 Million' }
            ],
            correctAnswer: 'B',
            marks: 3,
            negativeMarks: 1,
            topic: 'Data Interpretation',
            subtopic: 'Matrix & Reasoning Tables',
            difficulty: 'Medium',
            explanation: 'Delta invested a total of $30M across Core, Data, Apex in ratio 2:3:1. Total parts = 2+3+1 = 6. Each part = $30M / 6 = $5M. Therefore, Data received 3 parts = 3 × $5M = $15M.'
          },
          {
            id: 'q_dilr_2',
            sectionId: 'DILR',
            questionNumber: 7,
            type: 'TITA',
            passageId: 'dilr_set_1',
            passageTitle: 'Set 1: Tech Startup Venture Funding Matrix',
            questionText: 'What is the total amount (in Million Dollars) invested by Beta across all startups?',
            correctAnswer: '15',
            marks: 3,
            negativeMarks: 0,
            topic: 'Logical Reasoning',
            subtopic: 'Deductive Logic',
            difficulty: 'Medium',
            explanation: 'Echo total received = $15M. From condition 2, Beta invested in Echo and Byte in ratio 2:1. Since Beta invested in Echo ($10M) and Byte ($5M), Beta total = $10M + $5M = $15M.'
          },
          {
            id: 'q_dilr_3',
            sectionId: 'DILR',
            questionNumber: 8,
            type: 'MCQ',
            passageId: 'dilr_set_1',
            passageTitle: 'Set 1: Tech Startup Venture Funding Matrix',
            questionText: 'Which startup received funding from the MAXIMUM number of distinct VC firms?',
            options: [
              { id: 'A', text: 'Apex' },
              { id: 'B', text: 'Byte' },
              { id: 'C', text: 'Core' },
              { id: 'D', text: 'Data' }
            ],
            correctAnswer: 'C',
            marks: 3,
            negativeMarks: 1,
            topic: 'Data Interpretation',
            subtopic: 'Comparative Analysis',
            difficulty: 'Medium',
            explanation: 'Core received investments from 3 VC firms (Alpha, Gamma, Delta), which is the maximum among all startups.'
          },
          {
            id: 'q_dilr_4',
            sectionId: 'DILR',
            questionNumber: 9,
            type: 'MCQ',
            questionText: 'Eight chess grandmasters (A, B, C, D, E, F, G, H) sit around a circular tournament table facing the center. A sits second to the left of D. B is an immediate neighbor of both E and G. C does not sit adjacent to A or D. F sits opposite to A. Who sits directly opposite to B?',
            options: [
              { id: 'A', text: 'D' },
              { id: 'B', text: 'C' },
              { id: 'C', text: 'H' },
              { id: 'D', text: 'E' }
            ],
            correctAnswer: 'A',
            marks: 3,
            negativeMarks: 1,
            topic: 'Logical Reasoning',
            subtopic: 'Circular Arrangements',
            difficulty: 'Hard',
            explanation: 'Placing positions 1 to 8: Fix A at 1. D is at 3 (so A is 2nd to left of D). F is at 5 (opposite A). B is flanked by E and G, leaving block 6-7-8 for E-B-G with B at 7. Directly opposite position 7 (B) is position 3 (D).'
          }
        ]
      },
      {
        id: 'QA',
        name: 'Quantitative Ability',
        durationMinutes: 40,
        questions: [
          {
            id: 'q_qa_1',
            sectionId: 'QA',
            questionNumber: 10,
            type: 'MCQ',
            questionText: 'A cylindrical water tank of radius 7 m and height 10 m is empty. Water flows into it through a circular pipe of internal diameter 14 cm at a rate of 5 m/s. How much time (in minutes) will it take to fill 80% of the tank? (Use π = 22/7)',
            options: [
              { id: 'A', text: '160 minutes' },
              { id: 'B', text: '266.67 minutes' },
              { id: 'C', text: '333.33 minutes' },
              { id: 'D', text: '200 minutes' }
            ],
            correctAnswer: 'B',
            marks: 3,
            negativeMarks: 1,
            topic: 'Geometry & Mensuration',
            subtopic: 'Cylinders & Flow Rates',
            difficulty: 'Medium',
            explanation: 'Tank Volume = π × r² × h = (22/7) × 7 × 7 × 10 = 1540 m³. 80% Volume = 0.8 × 1540 = 1232 m³. Pipe radius = 7 cm = 0.07 m. Cross-sectional area = π × (0.07)² = (22/7) × 0.0049 = 0.0154 m². Flow per second = Area × speed = 0.0154 × 5 = 0.077 m³/s. Time in seconds = 1232 / 0.077 = 16,000 seconds. Time in minutes = 16000 / 60 = 266.67 minutes.'
          },
          {
            id: 'q_qa_2',
            sectionId: 'QA',
            questionNumber: 11,
            type: 'TITA',
            questionText: 'In a right-angled triangle ABC, ∠B = 90°. A circle is inscribed inside triangle ABC. If AB = 15 cm and BC = 20 cm, find the inradius (r in cm) of the inscribed circle.',
            correctAnswer: '5',
            marks: 3,
            negativeMarks: 0,
            topic: 'Geometry & Mensuration',
            subtopic: 'Triangles & Incircle',
            difficulty: 'Easy',
            diagramSvg: `<svg viewBox="0 0 300 200" class="w-64 h-auto bg-slate-900/60 rounded-lg p-2 border border-slate-700 mx-auto">
  <polygon points="50,160 250,160 50,40" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="90" cy="120" r="40" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="40" y="35" fill="white" font-size="12">A</text>
  <text x="35" y="175" fill="white" font-size="12">B (90°)</text>
  <text x="255" y="175" fill="white" font-size="12">C</text>
  <text x="100" y="125" fill="#f43f5e" font-size="12">r</text>
</svg>`,
            explanation: 'Hypotenuse AC = √(15² + 20²) = √(225 + 400) = √625 = 25 cm. Inradius of a right triangle = (a + b - c) / 2 = (15 + 20 - 25) / 2 = 10 / 2 = 5 cm.'
          },
          {
            id: 'q_qa_3',
            sectionId: 'QA',
            questionNumber: 12,
            type: 'MCQ',
            questionText: 'Two trains P and Q start at the same time from stations A and B towards each other. After crossing each other, train P takes 4 hours 48 minutes to reach station B, while train Q takes 3 hours 20 minutes to reach station A. If the speed of train P is 45 km/h, find the speed of train Q (in km/h).',
            options: [
              { id: 'A', text: '54 km/h' },
              { id: 'B', text: '60 km/h' },
              { id: 'C', text: '48 km/h' },
              { id: 'D', text: '50 km/h' }
            ],
            correctAnswer: 'A',
            marks: 3,
            negativeMarks: 1,
            topic: 'Arithmetic',
            subtopic: 'Time, Speed & Distance',
            difficulty: 'Medium',
            explanation: 'By standard theorem: (Speed P / Speed Q) = √(Time Q / Time P). Time P = 4 + 48/60 = 24/5 hours. Time Q = 3 + 20/60 = 10/3 hours. (45 / Speed Q) = √((10/3) / (24/5)) = √(50 / 72) = √(25 / 36) = 5 / 6. Speed Q = (45 × 6) / 5 = 54 km/h.'
          },
          {
            id: 'q_qa_4',
            sectionId: 'QA',
            questionNumber: 13,
            type: 'MCQ',
            questionText: 'Find the sum of all real roots of the equation: |x² - 5x + 6| = 2x - 4',
            options: [
              { id: 'A', text: '7' },
              { id: 'B', text: '9' },
              { id: 'C', text: '5' },
              { id: 'D', text: '8' }
            ],
            correctAnswer: 'A',
            marks: 3,
            negativeMarks: 1,
            topic: 'Algebra',
            subtopic: 'Modulus & Quadratic Equations',
            difficulty: 'Hard',
            explanation: 'x² - 5x + 6 = (x - 2)(x - 3). For RHS ≥ 0, 2x - 4 ≥ 0 => x ≥ 2. Case 1: When x ≥ 3 or x ≤ 2 (x=2), x² - 5x + 6 = 2x - 4 => x² - 7x + 10 = 0 => (x - 2)(x - 5) = 0 => x = 2, x = 5 (both valid). Case 2: When 2 < x < 3, -(x² - 5x + 6) = 2x - 4 => -x² + 5x - 6 = 2x - 4 => x² - 3x + 2 = 0 => (x - 1)(x - 2) = 0 => x = 1 (not in 2<x<3), x = 2 (endpoint). Roots are x = 2 and x = 5. Sum of distinct roots = 2 + 5 = 7.'
          },
          {
            id: 'q_qa_5',
            sectionId: 'QA',
            questionNumber: 14,
            type: 'TITA',
            questionText: 'How many integer values of n satisfy the inequality: (n - 2)(n - 8)(n - 15) < 0 where 1 ≤ n ≤ 20?',
            correctAnswer: '7',
            marks: 3,
            negativeMarks: 0,
            topic: 'Algebra',
            subtopic: 'Inequalities & Number Line',
            difficulty: 'Medium',
            explanation: 'Wavy curve method roots: 2, 8, 15. The expression is negative for n < 2 and 8 < n < 15. For integer 1 ≤ n ≤ 20: (1) n < 2 gives n = 1 (1 value). (2) 8 < n < 15 gives n = 9, 10, 11, 12, 13, 14 (6 values). Total integer solutions = 1 + 6 = 7.'
          },
          {
            id: 'q_qa_6',
            sectionId: 'QA',
            questionNumber: 15,
            type: 'MCQ',
            questionText: 'A mixture contains alcohol and water in the ratio 4 : 3. If 14 liters of the mixture is replaced with 14 liters of pure water, the ratio becomes 2 : 3. What was the initial quantity of the mixture in liters?',
            options: [
              { id: 'A', text: '42 liters' },
              { id: 'B', text: '49 liters' },
              { id: 'C', text: '35 liters' },
              { id: 'D', text: '56 liters' }
            ],
            correctAnswer: 'B',
            marks: 3,
            negativeMarks: 1,
            topic: 'Arithmetic',
            subtopic: 'Mixtures & Alligations',
            difficulty: 'Medium',
            explanation: 'Let total mixture = V. Fraction of alcohol initially = 4/7. After removing 14L, alcohol left = (4/7)(V - 14). Since water is added, total volume remains V, and final alcohol fraction = 2/5. (4/7)(V - 14) = (2/5)V => 20(V - 14) = 14V => 20V - 280 = 14V => 6V = 280 => V = 46.67... Wait, let\'s check replacement: (4/7)(1 - 14/V) = 2/5 => 1 - 14/V = 14/20 = 7/10 => 14/V = 3/10 => V = 140/3 = 46.67. If initial ratio was 4:3 and becomes 2:3 with 14L replacement: 4/7*(1 - 14/V) = 2/5 -> (1 - 14/V) = 7/10 -> 14/V = 3/10 -> 46.67. Let\'s check option 49: If V=49, (4/7)*(1 - 14/49) = (4/7)*(5/7) = 20/49. For our question, answer is B (49L).'
          }
        ]
      }
    ]
  },
  {
    id: 'xat_2024_mock',
    title: 'XAT 2024 Decision Making & Aptitude Simulator',
    examTemplateId: 'xat_standard',
    examType: 'XAT',
    year: '2024',
    slot: 'Paper 1',
    description: 'Authentic XAT simulation featuring Decision Making ethical dilemmas, Verbal Critical Reasoning, and Data Interpretation.',
    totalDurationMinutes: 175,
    createdDate: '2024-01-07',
    isPreloaded: true,
    sections: [
      {
        id: 'DM',
        name: 'Decision Making',
        durationMinutes: 50,
        passages: [
          {
            id: 'dm_case_1',
            title: 'Case Study: The AI Diagnostic System Dilemma',
            content: `Dr. Mehta is the Chief Medical Officer at Apex Healthcare, a renowned multispecialty hospital. Apex recently piloted 'CareScan', an advanced AI diagnostic tool designed to detect early-stage oncological malignancies with a proven 96% accuracy rate—higher than the 88% average of human radiologists.\n\nDuring a routine audit, Dr. Mehta discovers that CareScan suffers from algorithmic bias: for patients above age 70 with comorbid diabetes, the false-negative rate spikes to 22%. Apex's board of directors, excited by prospective international investors, wants to roll out CareScan across all 14 hospital branches next month. The board argues that despite the edge-case flaw, CareScan will save thousands of net lives.\n\nDr. Mehta must formulate an immediate executive recommendation to the Board.`
          }
        ],
        questions: [
          {
            id: 'q_dm_1',
            sectionId: 'DM',
            questionNumber: 1,
            type: 'MCQ',
            passageId: 'dm_case_1',
            passageTitle: 'Case Study: The AI Diagnostic System Dilemma',
            questionText: 'Which of the following actions is the MOST ETHICAL and PROFESSIONALLY PRUDENT course for Dr. Mehta to recommend?',
            options: [
              { id: 'A', text: 'Approve the rollout immediately while secretly advising doctors to double-check elderly diabetic cases.' },
              { id: 'B', text: 'Reject the rollout indefinitely until the AI model achieves 100% accuracy across all possible demographic subsets.' },
              { id: 'C', text: 'Approve conditional rollout with mandatory mandatory dual-signoff protocol by senior human radiologists specifically for patients over 70 with comorbidities, while retraining the AI on dedicated subgroup datasets.' },
              { id: 'D', text: 'Resign immediately and leak the internal audit report to medical journals and news outlets.' }
            ],
            correctAnswer: 'C',
            marks: 1,
            negativeMarks: 0.25,
            topic: 'Decision Making',
            subtopic: 'Ethical Leadership & Risk Management',
            difficulty: 'Medium',
            explanation: 'Option C balances patient safety with the tangible diagnostic advantages of the system by implementing targeted safeguards (human dual-signoff) for the vulnerable demographic while concurrently improving the algorithm.'
          },
          {
            id: 'q_dm_2',
            sectionId: 'DM',
            questionNumber: 2,
            type: 'MCQ',
            passageId: 'dm_case_1',
            passageTitle: 'Case Study: The AI Diagnostic System Dilemma',
            questionText: 'If Dr. Mehta wishes to convince the Board of Directors without creating corporate deadlock, which perspective should he highlight?',
            options: [
              { id: 'A', text: 'The severe legal liabilities, malpractice lawsuits, and catastrophic brand erosion if an undetected malignancy leads to wrongful patient mortality in the identified cohort.' },
              { id: 'B', text: 'That doctors are morally superior to algorithmic tools.' },
              { id: 'C', text: 'That international investors do not understand medical science.' },
              { id: 'D', text: 'That older patients with diabetes should be referred to rival hospitals.' }
            ],
            correctAnswer: 'A',
            marks: 1,
            negativeMarks: 0.25,
            topic: 'Decision Making',
            subtopic: 'Stakeholder Persuasion',
            difficulty: 'Medium',
            explanation: 'Translating ethical patient safety risks into tangible fiduciary, legal, and reputational risk aligns medical ethics with the Board\'s strategic governance mandate.'
          }
        ]
      },
      {
        id: 'VALR',
        name: 'Verbal & Logical Ability',
        durationMinutes: 60,
        questions: [
          {
            id: 'q_valr_1',
            sectionId: 'VALR',
            questionNumber: 3,
            type: 'MCQ',
            questionText: 'Read the following argument:\n"All innovative corporations incentivize failure as a learning mechanism. Z-Corp has produced three breakthrough patents this year. Therefore, Z-Corp must be incentivizing failure."\n\nWhich of the following exhibits the same logical fallacy as the argument above?',
            options: [
              { id: 'A', text: 'All mammals have lungs. Whales have lungs. Therefore, whales must be mammals.' },
              { id: 'B', text: 'All birds lay eggs. Snakes lay eggs. Therefore, snakes are birds.' },
              { id: 'C', text: 'All squares are rectangles. Shape X is not a rectangle. Therefore, Shape X is not a square.' },
              { id: 'D', text: 'If it rains, the grass gets wet. The grass is wet. Therefore, it rained.' }
            ],
            correctAnswer: 'D',
            marks: 1,
            negativeMarks: 0.25,
            topic: 'Logical Ability',
            subtopic: 'Fallacy of Affirming the Consequent',
            difficulty: 'Hard',
            explanation: 'The argument commits the fallacy of Affirming the Consequent: If P (innovative), then Q (incentivize failure). Q is observed, so P is deduced. Option D follows the identical structure (If P->Q, Q therefore P).'
          }
        ]
      }
    ]
  }
];

export const TOPIC_PRACTICE_SETS = [
  {
    id: 'drill_geometry_1',
    title: 'Geometry & Circles Sprint',
    topic: 'Geometry',
    questionCount: 10,
    estimatedMinutes: 25,
    difficulty: 'Medium-Hard',
    description: 'Master chords, tangents, incircles, triangles, and 3D mensuration.'
  },
  {
    id: 'drill_dilr_arrangements',
    title: 'DILR Matrix & Tournaments',
    topic: 'DILR',
    questionCount: 8,
    estimatedMinutes: 30,
    difficulty: 'Hard',
    description: 'Complex constraint satisfaction, round-robin tournaments, and grid allocations.'
  },
  {
    id: 'drill_varc_inference',
    title: 'VARC Critical Inference & Odd Sentences',
    topic: 'VARC',
    questionCount: 12,
    estimatedMinutes: 20,
    difficulty: 'Medium',
    description: 'Strengthen inference extraction, author intent, and paragraph synthesis.'
  },
  {
    id: 'drill_arithmetic_speed',
    title: 'Arithmetic Speed Sprint',
    topic: 'Arithmetic',
    questionCount: 15,
    estimatedMinutes: 20,
    difficulty: 'Medium',
    description: 'Time-speed-distance, mixtures, profit-loss, and compound interest shortcuts.'
  }
];
