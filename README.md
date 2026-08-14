# CBT Exam Engine & Mock Setup Studio

A professional, full-featured Computer-Based Test (CBT) simulator and mock exam engine designed for competitive management exams (CAT, XAT, CMAT, SNAP, NMAT, GMAT). It features a declarative Exam Rules Engine, smart PDF structure detection, and a robust, offline-capable exam-taking environment.

## Key Features

- **Dynamic Exam Rules Engine:** Built-in official rules for CAT, XAT, CMAT, SNAP, NMAT, and GMAT. Handles strict sectional locks, shared time pools, negative marking schemes, and calculator permissions.
- **Smart Setup & Validation Studio:** Upload question papers (simulated PDF parsing) and automatically map their structure to official exam templates. The Validation Studio flags configuration mismatches before you start.
- **Dual Execution Modes:**
  - **Real Exam Mode:** Enforces official exam governance strictly (locked timings, exact section counts).
  - **Custom Mock Mode:** Allows customized section durations, varied question counts, and flexible scoring schemes.
- **Authentic Exam Interface:** Features on-screen scientific calculators (where permitted), color-coded question palettes, responsive split-screen reading comprehension views, and keyboard shortcuts.
- **Robust Auto-Save:** Exam progress (timers, answers, section states) is serialized to LocalStorage every 30 seconds and on tab-switch/visibility changes, preventing data loss during accidental refreshes.
- **Analytics & Mistake Notebook:** Post-exam deterministic scoring, accuracy tracking, percentile estimations, and a dedicated notebook for reviewing mistakes.

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

1. **Clone or Download the Repository**
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will typically be available at `http://localhost:3000` (or the port specified by Vite).
4. **Build for Production:**
   ```bash
   npm run build
   ```

## How to Use the Application

### 1. Creating a Mock (Setup Studio)
- Open the application; the default screen is the **Setup Mock View**.
- **Select an Exam Template:** Choose your target exam (e.g., CAT, XAT). The active rules blueprint will dynamically update on the right side.
- **Choose Mode:** Select either *Real Exam Mode* or *Custom Mock Mode*.
- **Upload / Load Preset:** Either simulate uploading a PDF question paper or click one of the quick presets (e.g., "CAT 2024 Slot 1").
- **Validate & Finalize:** Review the structure comparison matrix. If there are critical mismatches (e.g., missing sections), the system will warn you. Click "Continue to Ready Screen".

### 2. Pre-Exam Briefing (Ready Screen)
- Review the exam rules, sectional timings, and scoring scheme.
- Note the warnings about strict timing and unattempted question penalties (if applicable).
- Click **Start Exam** to launch the CBT environment.

### 3. Taking the Exam
- **Navigation:** Use the question palette on the right to jump between questions, mark for review, or clear responses.
- **Sections:** If the exam allows section switching (e.g., XAT), you can navigate freely. If it utilizes strict locks (e.g., CAT), you must wait for the section timer to expire or explicitly submit the section early.
- **Tools:** Access the built-in instructions or calculator using the header buttons or keyboard shortcuts (e.g., `K` for calculator).
- **Auto-Save:** Your progress is saved automatically. If you close the tab, you can resume the active attempt from the Mock Library dashboard.

### 4. Post-Exam Analytics
- Upon submission, view your detailed score report, sectional accuracy, and percentile estimate.
- Use the **Mistake Notebook** to review incorrect answers and practice weak areas.
- Consult the **AI Study Coach** for targeted topic drills based on your performance.

## Project Architecture

- `/src/rules/`: Contains the core `ExamRulesEngine`, template definitions, and validation logic. This declarative approach means no hardcoded `if (exam === 'CAT')` blocks in the UI components.
- `/src/components/setup/`: The Mock Setup and Configuration Validation interfaces.
- `/src/components/exam/`: The core CBT interface, including the Timer, Question Palette, and Auto-save orchestration.
- `/src/components/dashboard/`: Analytics, Mistake Notebook, and AI Coach views.
- `/src/utils/`: Deterministic scoring logic and LocalStorage wrappers.

## Technologies Used

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Icons)
