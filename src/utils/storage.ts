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

// Fetch data from server with smart local cache reconciliation
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

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn('Failed parsing server JSON:', jsonErr);
      }

      if (data) {
        let assets: OfficeAsset[] = Array.isArray(data.assets) ? data.assets : [];
        let loans: AssetLoan[] = Array.isArray(data.loans) ? data.loans : [];
        let tasks: MaintenanceTask[] = Array.isArray(data.tasks) ? data.tasks : [];
        let logs: MaintenanceLog[] = Array.isArray(data.logs) ? data.logs : [];
        let settings: CompanySettings = data.settings || initialCompanySettings;

        // Vercel serverless safeguard:
        // If server instance is empty (cold start / fresh deployment) but browser has stored work,
        // preserve local data and automatically sync it back to the server!
        const local = loadLocalData();
        if (assets.length === 0 && local.assets.length > 0) {
          assets = local.assets;
          loans = local.loans;
          tasks = local.tasks;
          logs = local.logs;
          settings = local.settings;
          syncDataToServer({ assets, loans, tasks, logs, settings }).catch(() => {});
        } else {
          // Update local storage cache
          try {
            localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
            localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
          } catch (e) {
            // quota or private mode
          }
        }

        return { assets, loans, tasks, logs, settings, fromServer: true };
      }
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
    assets = rawAssets ? JSON.parse(rawAssets) : [];

    const rawLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
    loans = rawLoans ? JSON.parse(rawLoans) : [];

    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    tasks = rawTasks ? JSON.parse(rawTasks) : [];

    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    logs = rawLogs ? JSON.parse(rawLogs) : [];

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

  // Send to Server API (Vercel Serverless Function or Express)
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return res.ok;
  } catch (e) {
    console.error('Reset request error:', e);
    return false;
  }
};

// Export entire database to downloadable JSON file
export const exportDatabaseToJson = (payload: {
  assets: OfficeAsset[];
  loans: AssetLoan[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: CompanySettings;
}) => {
  const exportPayload = {
    app: 'SIM-GA',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    ...payload
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `sim-ga-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import database from JSON file and sync to server
export const importDatabaseFromJson = async (file: File): Promise<{
  success: boolean;
  data?: {
    assets: OfficeAsset[];
    loans: AssetLoan[];
    tasks: MaintenanceTask[];
    logs: MaintenanceLog[];
    settings: CompanySettings;
  };
  error?: string;
}> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Format berkas JSON tidak valid.' };
    }

    const assets = Array.isArray(parsed.assets) ? parsed.assets : [];
    const loans = Array.isArray(parsed.loans) ? parsed.loans : [];
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    const settings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : initialCompanySettings;

    const restoredData = { assets, loans, tasks, logs, settings };
    await syncDataToServer(restoredData);

    return { success: true, data: restoredData };
  } catch (err: any) {
    return { success: false, error: 'Gagal membaca berkas JSON: ' + (err?.message || 'Error tidak diketahui') };
  }
};

// Check server storage info (Vercel KV vs local)
export const getServerStorageInfo = async (): Promise<{
  platform: string;
  storageType: string;
  isKvConnected: boolean;
}> => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return {
        platform: data.platform || 'node-express',
        storageType: data.storageType || 'Local Filesystem / Serverless Cache',
        isKvConnected: Boolean(data.isKvConnected)
      };
    }
  } catch {}
  return {
    platform: 'web-client',
    storageType: 'Penyimpanan Browser (LocalStorage)',
    isKvConnected: false
  };
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
      localStorage.removeItem('ga_inventory_auth_user');
      localStorage.removeItem('ga_inventory_auth_user_v2');
      localStorage.removeItem('ga_auth_user');
      sessionStorage.clear();
    }
  } catch {}
};
