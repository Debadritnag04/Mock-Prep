import { MockTest, UserAttempt, MistakeEntry, Question, UserResponse } from '../types';
import { PRELOADED_MOCKS } from '../data/mockData';

const STORAGE_KEYS = {
  MOCKS: 'cat_cbt_mocks_v1',
  ATTEMPTS: 'cat_cbt_attempts_v1',
  MISTAKES: 'cat_cbt_mistakes_v1',
  ACTIVE_ATTEMPT: 'cat_cbt_active_attempt_v1',
};

export const StorageService = {
  getMocks(): MockTest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MOCKS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify(PRELOADED_MOCKS));
        return PRELOADED_MOCKS;
      }
      const parsed = JSON.parse(stored) as MockTest[];
      // Merge with preloaded if missing
      const preloadedIds = new Set(parsed.map(m => m.id));
      const combined = [...parsed];
      for (const pm of PRELOADED_MOCKS) {
        if (!preloadedIds.has(pm.id)) {
          combined.push(pm);
        }
      }
      return combined;
    } catch {
      return PRELOADED_MOCKS;
    }
  },

  saveMock(mock: MockTest): void {
    const mocks = this.getMocks();
    const existingIndex = mocks.findIndex(m => m.id === mock.id);
    if (existingIndex >= 0) {
      mocks[existingIndex] = mock;
    } else {
      mocks.unshift(mock);
    }
    localStorage.setItem(STORAGE_KEYS.MOCKS, JSON.stringify(mocks));
  },

  getMockById(id: string): MockTest | undefined {
    return this.getMocks().find(m => m.id === id);
  },

  getAttempts(): UserAttempt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveAttempt(attempt: UserAttempt): void {
    const attempts = this.getAttempts();
    const existingIndex = attempts.findIndex(a => a.id === attempt.id);
    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));

    // Update Mistakes Notebook automatically if completed
    if (attempt.status === 'completed') {
      this.syncMistakesFromAttempt(attempt);
    }
  },

  getActiveAttempt(): UserAttempt | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveActiveAttempt(attempt: UserAttempt | null): void {
    if (attempt) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ATTEMPT, JSON.stringify(attempt));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ATTEMPT);
    }
  },

  getMistakes(): MistakeEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveMistakes(mistakes: MistakeEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  },

  updateMistake(updated: MistakeEntry): void {
    const mistakes = this.getMistakes();
    const index = mistakes.findIndex(m => m.id === updated.id);
    if (index >= 0) {
      mistakes[index] = updated;
      this.saveMistakes(mistakes);
    }
  },

  syncMistakesFromAttempt(attempt: UserAttempt): void {
    const mock = this.getMockById(attempt.mockId);
    if (!mock) return;

    const allQuestions: Question[] = [];
    mock.sections.forEach(sec => allQuestions.push(...sec.questions));

    const existingMistakes = this.getMistakes();
    const newMistakes: MistakeEntry[] = [...existingMistakes];

    Object.entries(attempt.answers).forEach(([qId, resp]) => {
      const q = allQuestions.find(item => item.id === qId);
      if (!q) return;

      const isAttempted = resp.answer && resp.answer.trim() !== '';
      const isCorrect = resp.isCorrect;

      // If attempted and wrong, or marked for review and not answered correctly
      if (isAttempted && !isCorrect) {
        const existingIdx = newMistakes.findIndex(m => m.questionId === qId);
        if (existingIdx >= 0) {
          newMistakes[existingIdx].retryCount += 1;
          newMistakes[existingIdx].lastRetriedAt = new Date().toISOString();
          newMistakes[existingIdx].userAnswer = resp.answer;
        } else {
          newMistakes.unshift({
            id: `mistake_${Date.now()}_${qId}`,
            questionId: q.id,
            question: q,
            mockId: mock.id,
            mockTitle: mock.title,
            attemptId: attempt.id,
            userAnswer: resp.answer,
            correctAnswer: q.correctAnswer,
            date: new Date().toISOString().split('T')[0],
            category: 'conceptual',
            mastered: false,
            retryCount: 1,
          });
        }
      }
    });

    this.saveMistakes(newMistakes);
  },
};
