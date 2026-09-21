import { SRSState, WordEntry } from '../types';

export class SRSService {
  // Generate initial SRS state for newly added word
  static createInitialSRSState(): SRSState {
    return {
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(), // Due immediately for initial learning
      gradeHistory: [],
      masteryStage: 'new'
    };
  }

  // Calculate new SRS state based on SM-2 algorithm
  // grade: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  static calculateNextReview(current: SRSState, grade: 1 | 2 | 3 | 4): SRSState {
    const now = new Date();
    let { repetition, interval, easeFactor, gradeHistory } = current;

    // Update grade history
    const updatedHistory = [...gradeHistory, grade];

    if (grade < 3) {
      // Failed or very hard recall (Again / Hard reset)
      repetition = 0;
      interval = 1;
      // Decrease ease factor slightly
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      // Successful recall (Good / Easy)
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }

      // Bonus for Easy
      if (grade === 4) {
        interval = Math.round(interval * 1.3);
      }

      // SM-2 Ease Factor calculation: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      const quality = grade + 1; // map 1-4 to SM-2 quality 2-5
      const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
      easeFactor = Math.max(1.3, Number((easeFactor + delta).toFixed(2)));

      repetition += 1;
    }

    // Determine mastery stage
    let masteryStage: 'new' | 'learning' | 'review' | 'mastered' = 'learning';
    if (interval >= 21) {
      masteryStage = 'mastered';
    } else if (interval >= 6) {
      masteryStage = 'review';
    } else if (repetition > 0) {
      masteryStage = 'learning';
    }

    // Calculate next review timestamp
    const nextReviewTime = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

    return {
      repetition,
      interval,
      easeFactor,
      nextReviewDate: nextReviewTime.toISOString(),
      lastReviewedDate: now.toISOString(),
      gradeHistory: updatedHistory,
      masteryStage
    };
  }

  // Check if a word is due for review today
  static isDue(word: WordEntry): boolean {
    if (!word.srs || !word.srs.nextReviewDate) return true;
    const reviewDate = new Date(word.srs.nextReviewDate).getTime();
    const now = Date.now();
    return reviewDate <= now;
  }

  // Filter words that are due right now
  static getDueWords(words: WordEntry[]): WordEntry[] {
    return words.filter(word => this.isDue(word));
  }

  // Projected interval label to display on rating buttons
  static getProjectedInterval(current: SRSState, grade: 1 | 2 | 3 | 4): string {
    const projected = this.calculateNextReview(current, grade);
    if (projected.interval <= 1) return '1 day';
    if (projected.interval < 30) return `${projected.interval} days`;
    const months = Math.round(projected.interval / 30);
    return `${months} mo`;
  }

  // Summary statistics for SRS dashboard
  static getSRSStats(words: WordEntry[]) {
    let due = 0;
    let newCount = 0;
    let learning = 0;
    let review = 0;
    let mastered = 0;

    const now = Date.now();

    for (const word of words) {
      const isCardDue = !word.srs?.nextReviewDate || new Date(word.srs.nextReviewDate).getTime() <= now;
      if (isCardDue) due++;

      const stage = word.srs?.masteryStage || 'new';
      if (stage === 'new') newCount++;
      else if (stage === 'learning') learning++;
      else if (stage === 'review') review++;
      else if (stage === 'mastered') mastered++;
    }

    return {
      total: words.length,
      due,
      newCount,
      learning,
      review,
      mastered
    };
  }
}
