import { getLocalDateString } from './dates';
import { WeightEntry } from './types';

export interface WeightChartPoint {
  label: string;
  weight: number;
  delta?: number;
}

export function prepareWeightChartData(results: WeightEntry[]): WeightChartPoint[] {
  const parseValue = (value: unknown) => {
    if (value === null || value === undefined) return null;
    const cleaned = String(value).trim().replace(',', '.');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parsed = results
    .map(entry => {
      const dateKey =
        entry.dateKey ||
        (entry.date ? getLocalDateString(new Date(entry.date)) : getLocalDateString());
      const dateObj = entry.dateISO ? new Date(entry.dateISO) : new Date(`${dateKey}T00:00:00`);
      const weight = parseValue(entry.weight);
      if (!weight) return null;
      return {
        dateKey,
        dateObj,
        weight
      };
    })
    .filter((item): item is { dateKey: string; dateObj: Date; weight: number } => Boolean(item))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  if (!parsed.length) return [];

  const useWeekly = parsed.length > 10;
  let chartData: WeightChartPoint[] = [];

  if (useWeekly) {
    const weekly: Record<string, { total: number; count: number; dateObj: Date }> = {};
    parsed.forEach(entry => {
      const date = entry.dateObj;
      const day = date.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() + diff);
      const weekKey = getLocalDateString(weekStart);
      if (!weekly[weekKey]) {
        weekly[weekKey] = { total: 0, count: 0, dateObj: weekStart };
      }
      weekly[weekKey].total += entry.weight;
      weekly[weekKey].count += 1;
    });

    chartData = Object.entries(weekly)
      .map(([weekKey, data]) => ({
        label: `Sem ${new Date(`${weekKey}T00:00:00`).toLocaleDateString('pt-BR')}`,
        weight: Number((data.total / data.count).toFixed(1))
      }))
      .sort((a, b) => {
        const dateA = parseWeekLabel(a.label);
        const dateB = parseWeekLabel(b.label);
        return dateA.getTime() - dateB.getTime();
      });
  } else {
    chartData = parsed.map(entry => ({
      label: entry.dateObj.toLocaleDateString('pt-BR'),
      weight: entry.weight
    }));
  }

  return chartData;
}

function parseWeekLabel(label: string) {
  const datePart = label.replace('Sem ', '');
  const [day, month, year] = datePart.split('/').map(Number);
  return new Date(year, month - 1, day);
}
