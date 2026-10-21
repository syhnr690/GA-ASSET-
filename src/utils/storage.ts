import {
  OfficeAsset,
  AssetLoan,
  MaintenanceTask,
  MaintenanceLog,
  CompanySettings
} from '../types/inventory';
import {
  initialAssets,
  initialLoans,
  initialMaintenanceTasks,
  initialMaintenanceLogs,
  initialCompanySettings
} from '../data/seedData';
import { runAutomatedMaintenanceAudit } from './maintenanceEngine';

const STORAGE_KEYS = {
  ASSETS: 'ga_inventory_assets_v2',
  LOANS: 'ga_inventory_loans_v2',
  TASKS: 'ga_inventory_tasks_v2',
  LOGS: 'ga_inventory_logs_v2',
  SETTINGS: 'ga_inventory_settings_v2',
  AUTH: 'ga_inventory_auth_user_v2'
};

// Fetch data from server with local cache fallback
export const fetchServerData = async (): Promise<{
  assets: OfficeAsset[];
  loans: AssetLoan[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: CompanySettings;
  fromServer: boolean;
}> => {
  try {
    const res = await fetch('/api/data', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const assets: OfficeAsset[] = Array.isArray(data.assets) ? data.assets : [];
      const loans: AssetLoan[] = Array.isArray(data.loans) ? data.loans : [];
      const tasks: MaintenanceTask[] = Array.isArray(data.tasks) ? data.tasks : [];
      const logs: MaintenanceLog[] = Array.isArray(data.logs) ? data.logs : [];
      const settings: CompanySettings = data.settings || initialCompanySettings;

      // Update local storage cache
      try {
        localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
        localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (e) {
        // local storage quota or private mode
      }

      return { assets, loans, tasks, logs, settings, fromServer: true };
    }
  } catch (err) {
    console.warn('Cannot reach server API directly, using local storage cache:', err);
  }

  // Fallback to local storage
  return { ...loadLocalData(), fromServer: false };
};

export const loadLocalData = () => {
  let assets: OfficeAsset[] = [];
  let loans: AssetLoan[] = [];
  let tasks: MaintenanceTask[] = [];
  let logs: MaintenanceLog[] = [];
  let settings: CompanySettings = initialCompanySettings;

  try {
    const rawAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    assets = rawAssets ? JSON.parse(rawAssets) : initialAssets;

    const rawLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
    loans = rawLoans ? JSON.parse(rawLoans) : initialLoans;

    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    tasks = rawTasks ? JSON.parse(rawTasks) : initialMaintenanceTasks;

    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    logs = rawLogs ? JSON.parse(rawLogs) : initialMaintenanceLogs;

    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    settings = rawSettings ? JSON.parse(rawSettings) : initialCompanySettings;
  } catch (err) {
    console.error('Error parsing local GA data:', err);
  }

  return { assets, loans, tasks, logs, settings };
};

// Post full state to server and save to local storage
export const syncDataToServer = async (payload: {
  assets: OfficeAsset[];
  loans: AssetLoan[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: CompanySettings;
}): Promise<{ success: boolean; savedAt?: string }> => {
  // Always update local cache immediately
  try {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(payload.assets));
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(payload.loans));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(payload.tasks));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(payload.logs));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(payload.settings));
  } catch (e) {
    console.error('Local storage write failed', e);
  }

  // Send to Express Server API
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, savedAt: data.savedAt };
    }
  } catch (err) {
    console.error('Failed to sync data to server:', err);
  }

  return { success: false };
};

// Reset all data on server and locally
export const resetAllData = async (): Promise<boolean> => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    const res = await fetch('/api/data/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    return res.ok;
  } catch (e) {
    console.error('Reset request error:', e);
    return false;
  }
};

// Auth session helpers
export const getStoredAuthUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user: any) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  } catch {}
};
