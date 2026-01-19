import { ActivityFeedItem } from './types';

export const ACTIVITY_FEED_LIMIT = 50;

export function createActivityItem(input: Partial<ActivityFeedItem>): ActivityFeedItem {
  return {
    id: input.id || `activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: input.type || 'generic',
    description: input.description || '',
    deltaPoints: typeof input.deltaPoints === 'number' ? input.deltaPoints : 0,
    metaInfo: input.metaInfo || null,
    dateTimeISO: input.dateTimeISO || new Date().toISOString()
  };
}

export function addActivityItemToFeed(
  feed: ActivityFeedItem[],
  item: Partial<ActivityFeedItem>
): ActivityFeedItem[] {
  const nextItem = createActivityItem(item);
  return [nextItem, ...feed].slice(0, ACTIVITY_FEED_LIMIT);
}
