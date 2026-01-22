import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@snakr_cache:';
const PENDING_ACTIONS_KEY = '@snakr_pending_actions';

export interface PendingAction {
  id: string;
  type: 'used' | 'restocked' | 'ran_out' | 'create_item' | 'update_item';
  itemId?: string;
  data?: any;
  timestamp: number;
}

// Cache management
export async function cacheData(key: string, data: any, ttl?: number) {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cacheEntry = {
    data,
    timestamp: Date.now(),
    ttl: ttl || 3600000, // Default 1 hour
  };
  await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  
  if (!cached) return null;

  const cacheEntry = JSON.parse(cached);
  const age = Date.now() - cacheEntry.timestamp;

  if (age > cacheEntry.ttl) {
    await AsyncStorage.removeItem(cacheKey);
    return null;
  }

  return cacheEntry.data as T;
}

export async function clearCache(pattern?: string) {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter(key => 
    key.startsWith(CACHE_PREFIX) && (!pattern || key.includes(pattern))
  );
  await AsyncStorage.multiRemove(cacheKeys);
}

// Pending actions queue
export async function addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>) {
  const pendingActions = await getPendingActions();
  const newAction: PendingAction = {
    ...action,
    id: `${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
  };
  pendingActions.push(newAction);
  await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  return newAction;
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const stored = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function removePendingAction(actionId: string) {
  const pendingActions = await getPendingActions();
  const filtered = pendingActions.filter(a => a.id !== actionId);
  await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(filtered));
}

export async function clearPendingActions() {
  await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
}

// Sync pending actions when online
export async function syncPendingActions(apiClient: any) {
  const pendingActions = await getPendingActions();
  const results = [];

  for (const action of pendingActions) {
    try {
      let result;
      switch (action.type) {
        case 'used':
          result = await apiClient.markItemUsed(action.itemId);
          break;
        case 'restocked':
          result = await apiClient.markItemRestocked(action.itemId);
          break;
        case 'ran_out':
          result = await apiClient.markItemRanOut(action.itemId);
          break;
        case 'create_item':
          result = await apiClient.createItem(action.data.householdId, action.data.item);
          break;
        case 'update_item':
          result = await apiClient.updateItem(action.itemId, action.data);
          break;
      }
      await removePendingAction(action.id);
      results.push({ action, success: true, result });
    } catch (error) {
      results.push({ action, success: false, error });
    }
  }

  return results;
}

// Network status helpers
export function isOnline(): boolean {
  // In a real app, use NetInfo from @react-native-community/netinfo
  return true;
}
