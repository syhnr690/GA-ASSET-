import { OfficeAsset, MaintenanceTask, AssetCategory, MaintenanceFrequency } from '../types/inventory';

export const formatCurrencyIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDateIndonesian = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getTodayString = (): string => {
  // Use ISO string representation YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysDifference = (targetDateStr: string, fromDateStr = getTodayString()): number => {
  try {
    const [y1, m1, d1] = targetDateStr.split('-').map(Number);
    const [y2, m2, d2] = fromDateStr.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date1.getTime() - date2.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const calculateNextDate = (baseDateStr: string, monthsToAdd: number): string => {
  try {
    const [year, month, day] = baseDateStr.split('-').map(Number);
    const date = new Date(year, month - 1 + monthsToAdd, day);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return getTodayString();
  }
};

export const getFrequencyMonths = (freq: MaintenanceFrequency): number => {
  switch (freq) {
    case 'Bulanan': return 1;
    case 'Triwulan (3 Bulan)': return 3;
    case 'Semesteran (6 Bulan)': return 6;
    case 'Tahunan (12 Bulan)': return 12;
    default: return 3;
  }
};

export const generateAssetCode = (category: AssetCategory, seqNumber: number): string => {
  const year = new Date().getFullYear();
  let prefix = 'AST-GEN';
  switch (category) {
    case 'IT & Komputer': prefix = 'AST-IT'; break;
    case 'Elektronik & Meeting': prefix = 'AST-ELK'; break;
    case 'Fasilitas & Gedung': prefix = 'AST-FAC'; break;
    case 'Mebel & Perabot': prefix = 'AST-MBL'; break;
    case 'Kendaraan Operasional': prefix = 'AST-KDR'; break;
    case 'Pantry & Kebersihan': prefix = 'AST-PNT'; break;
    case 'Peralatan Keamanan / K3': prefix = 'AST-K3'; break;
  }
  const padded = String(seqNumber).padStart(3, '0');
  return `${prefix}-${year}-${padded}`;
};

export const generateWorkOrderCode = (seq: number): string => {
  const year = new Date().getFullYear();
  return `WO-MAINT-${year}-${String(seq).padStart(3, '0')}`;
};

export const generateLoanCode = (seq: number): string => {
  const year = new Date().getFullYear();
  return `PINJ-${year}-${String(seq).padStart(3, '0')}`;
};

/**
 * Core GA Automation Engine:
 * Evaluates asset routine maintenance schedules against today's date.
 * Automatically spawns or updates Work Orders for assets needing routine servicing.
 */
export const runAutomatedMaintenanceAudit = (
  assets: OfficeAsset[],
  existingTasks: MaintenanceTask[]
): {
  updatedTasks: MaintenanceTask[];
  updatedAssets: OfficeAsset[];
  newTasksGeneratedCount: number;
} => {
  const today = getTodayString();
  const updatedTasks = [...existingTasks];
  const updatedAssets = [...assets];
  let newTasksGeneratedCount = 0;

  // 1. Audit existing pending tasks to update status (e.g. Terjadwal -> Jatuh Tempo -> Terlambat)
  for (let i = 0; i < updatedTasks.length; i++) {
    const task = updatedTasks[i];
    if (task.status !== 'Selesai' && task.status !== 'Sedang Dikerjakan') {
      const daysLeft = getDaysDifference(task.scheduledDate, today);
      if (daysLeft < 0) {
        task.status = 'Terlambat';
      } else if (daysLeft === 0) {
        task.status = 'Jatuh Tempo';
      } else if (daysLeft <= 7) {
        task.status = 'Mendekati Waktu';
      } else {
        task.status = 'Terjadwal';
      }
    }
  }

  // 2. Scan assets with automated maintenance enabled
  updatedAssets.forEach((asset, idx) => {
    if (!asset.hasRoutineMaintenance) return;

    // If nextMaintenanceDate is missing, calculate it
    if (!asset.nextMaintenanceDate) {
      const base = asset.lastMaintenanceDate || asset.purchaseDate || today;
      asset.nextMaintenanceDate = calculateNextDate(base, asset.maintenanceIntervalMonths || 3);
      updatedAssets[idx] = { ...asset };
    }

    const daysUntilDue = getDaysDifference(asset.nextMaintenanceDate, today);

    // Look for an existing pending work order for this asset
    const hasOpenWorkOrder = updatedTasks.some(
      (t) => t.assetId === asset.id && t.status !== 'Selesai'
    );

    // Auto-create work order if due within 14 days (or already overdue) and no open work order exists
    if (daysUntilDue <= 14 && !hasOpenWorkOrder) {
      const newSeq = updatedTasks.length + 1;
      let initialStatus: MaintenanceTask['status'] = 'Mendekati Waktu';
      if (daysUntilDue < 0) initialStatus = 'Terlambat';
      else if (daysUntilDue === 0) initialStatus = 'Jatuh Tempo';

      const defaultActions: Record<AssetCategory, string[]> = {
        'Fasilitas & Gedung': [
          'Pemeriksaan fisik unit dan panel kelistrikan',
          'Pembersihan filter udara / jalur sirkulasi',
          'Pengecekan kebocoran & tegangan arus listrik',
          'Uji fungsi performa operasional normal'
        ],
        'Kendaraan Operasional': [
          'Penggantian oli mesin & filter berkala',
          'Cek ketebalan kampas rem & minyak rem',
          'Pemeriksaan sistem kelistrikan & aki',
          'Pengecekan tekanan angin & kondisi alur ban'
        ],
        'IT & Komputer': [
          'Pembersihan debu kipas & repasting thermal pasta',
          'Pemeriksaan kesehatan baterai & adaptor',
          'Pembersihan keyboard & port I/O',
          'Update patch keamanan OS & scan hardware'
        ],
        'Elektronik & Meeting': [
          'Pembersihan lensa optik & sensor',
          'Kalibrasi warna / audio display',
          'Pengecekan kabel HDMI/USB-C dan kelonggaran port',
          'Uji konektivitas konferensi video'
        ],
        'Peralatan Keamanan / K3': [
          'Pemeriksaan pressure gauge penunjuk tekanan',
          'Pengecekan segel pengaman & safety pin',
          'Inspeksi selang nozzle dan kelayakan tabung',
          'Pengisian kartu kendali inspeksi berkala'
        ],
        'Pantry & Kebersihan': [
          'Descaling kerak mineral pemanas air',
          'Pembersihan deep cleaning saluran internal',
          'Pengecekan pompa & sensor debit air',
          'Sanitasi higienis sesuai standar food-grade'
        ],
        'Mebel & Perabot': [
          'Pengecekan hidrolik dan mekanisme reclining',
          'Pengencangan baut struktur rangka',
          'Pembersihan pelapis bahan kain / jaring',
          'Pelumasan roda kastor kursi'
        ]
      };

      const newTask: MaintenanceTask = {
        id: `maint-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        workOrderCode: generateWorkOrderCode(newSeq),
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        category: asset.category,
        location: asset.location,
        taskType: asset.category === 'Peralatan Keamanan / K3' ? 'Pemeriksaan Berkala' : 'Servis Rutin',
        scheduledDate: asset.nextMaintenanceDate,
        frequency: asset.maintenanceFrequency,
        priority: daysUntilDue <= 3 ? 'Tinggi' : 'Normal',
        status: initialStatus,
        technicianOrVendor: asset.maintenanceVendor || 'Vendor Rekanan GA / In-House Team',
        estimatedCost: asset.category === 'Kendaraan Operasional' ? 1500000 : 350000,
        actionItems: defaultActions[asset.category] || ['Pemeriksaan menyeluruh dan pembersihan'],
        isAutoGenerated: true
      };

      updatedTasks.unshift(newTask);
      newTasksGeneratedCount++;
    }
  });

  return { updatedTasks, updatedAssets, newTasksGeneratedCount };
};
