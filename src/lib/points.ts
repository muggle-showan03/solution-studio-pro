const POINTS_KEY = 'codearena_points';
const SOLVED_KEY = 'codearena_solved';

export const DIFFICULTY_POINTS: Record<string, number> = {
  easy: 2,
  medium: 4,
  hard: 6,
};

export function getPoints(): number {
  return parseInt(localStorage.getItem(POINTS_KEY) || '0', 10);
}

export function getSolvedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function awardPoints(problemId: string, difficulty: string): { awarded: boolean; pointsEarned: number; totalPoints: number } {
  const solved = getSolvedIds();
  if (solved.includes(problemId)) {
    return { awarded: false, pointsEarned: 0, totalPoints: getPoints() };
  }

  const earned = DIFFICULTY_POINTS[difficulty] || 0;
  const newTotal = getPoints() + earned;
  localStorage.setItem(POINTS_KEY, newTotal.toString());
  localStorage.setItem(SOLVED_KEY, JSON.stringify([...solved, problemId]));

  return { awarded: true, pointsEarned: earned, totalPoints: newTotal };
}
