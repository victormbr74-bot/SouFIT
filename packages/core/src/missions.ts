import { addDaysToDateString, getLocalDateString } from './dates';
import { POINTS_CONFIG } from './points';
import { DailyQuest, HunterLevelState } from './types';

export function generateDefaultDailyQuests(dateAssigned = getLocalDateString()): DailyQuest[] {
  return [
    {
      id: 1,
      name: 'Treino Diario',
      description: 'Complete 1 treino',
      rewardPoints: POINTS_CONFIG.dailyQuest,
      completed: false,
      type: 'workout',
      dateAssigned
    },
    {
      id: 2,
      name: 'Nutricao Perfeita',
      description: 'Registre 3 refeicoes',
      rewardPoints: POINTS_CONFIG.dailyQuest,
      completed: false,
      type: 'diet',
      dateAssigned
    },
    {
      id: 3,
      name: 'Meta de Calorias',
      description: 'Atinga 80% da meta calorica',
      rewardPoints: POINTS_CONFIG.dailyQuest,
      completed: false,
      type: 'diet',
      dateAssigned
    },
    {
      id: 4,
      name: 'Medicao',
      description: 'Registre seu peso atual',
      rewardPoints: POINTS_CONFIG.dailyQuest,
      completed: false,
      type: 'measurement',
      dateAssigned
    }
  ];
}

interface ReconcileParams {
  dailyQuests: DailyQuest[];
  hunter: HunterLevelState;
  today?: string;
  penaltyPoints?: number;
  generateMissions?: (date: string) => DailyQuest[];
}

export interface ReconcileResult {
  dailyQuests: DailyQuest[];
  hunter: HunterLevelState;
  penaltyApplied: boolean;
}

export function reconcileDailyQuests(params: ReconcileParams): ReconcileResult {
  const today = params.today || getLocalDateString();
  const generateMissions = params.generateMissions || generateDefaultDailyQuests;
  const penaltyPoints = params.penaltyPoints ?? -10;
  let { dailyQuests, hunter } = params;
  let penaltyApplied = false;

  const needsReset =
    !dailyQuests.length || dailyQuests.some(quest => quest.dateAssigned !== today);
  const lastAssigned = dailyQuests.length ? dailyQuests[0].dateAssigned : null;
  const hasPending = dailyQuests.some(quest => !quest.completed);

  if (lastAssigned && lastAssigned !== today && hasPending && hunter.dailyPenaltyAppliedDate !== today) {
    hunter = {
      ...hunter,
      dailyPenaltyAppliedDate: today
    };
    penaltyApplied = true;
  }

  const yesterday = addDaysToDateString(today, -1);
  if (hunter.lastActiveDate !== yesterday) {
    hunter = {
      ...hunter,
      currentStreak: 0
    };
  }

  if (needsReset) {
    dailyQuests = generateMissions(today);
  }

  hunter = {
    ...hunter,
    lastCheckedDate: today
  };

  return {
    dailyQuests,
    hunter,
    penaltyApplied
  };
}
