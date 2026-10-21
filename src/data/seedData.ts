import { OfficeAsset, AssetLoan, MaintenanceTask, MaintenanceLog, CompanySettings } from '../types/inventory';

// Clean slate settings for real enterprise work
export const initialCompanySettings: CompanySettings = {
  companyName: 'PT Operasional Saya',
  officeLocation: 'Kantor Pusat',
  gaDivisionName: 'General Affairs & Facility Management',
  contactEmail: 's.syahnur1@gmail.com',
  contactPhone: '-',
  currency: 'IDR'
};

// CLEAN SLATE: Start empty for real work as requested
export const initialAssets: OfficeAsset[] = [];
export const initialLoans: AssetLoan[] = [];
export const initialMaintenanceTasks: MaintenanceTask[] = [];
export const initialMaintenanceLogs: MaintenanceLog[] = [];

// Optional sample templates if user wants to inspect standard examples
export const sampleDemoAssets: OfficeAsset[] = [
  {
    id: 'demo-001',
    assetCode: 'AST-FAC-2026-001',
    name: 'AC Daikin Multi Split Inverter 2 PK',
    category: 'Fasilitas & Gedung',
    brand: 'Daikin',
    model: 'FTKC50TVM4',
    serialNumber: 'DKN-2024-99812A',
    location: 'Lantai 2 - Ruang Kerja Terbuka (Open Space)',
    department: 'GA & Operasional',
    picName: 'Staff GA',
    purchaseDate: '2024-02-15',
    purchasePrice: 14500000,
    warrantyExpiry: '2027-02-15',
    condition: 'Baik',
    status: 'Tersedia',
    hasRoutineMaintenance: true,
    maintenanceFrequency: 'Triwulan (3 Bulan)',
    maintenanceIntervalMonths: 3,
    lastMaintenanceDate: '2026-07-20',
    nextMaintenanceDate: '2026-10-20',
    maintenanceVendor: 'CV Sejuk Dinamika Mandiri',
    notes: 'Unit pendingin utama area kantor.',
  },
  {
    id: 'demo-002',
    assetCode: 'AST-IT-2026-002',
    name: 'Laptop Lenovo ThinkPad T14 Gen 4',
    category: 'IT & Komputer',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 4 Core i7 32GB',
    serialNumber: 'LNV-TP-8841029',
    location: 'Lantai 2 - Pool Laptop GA/IT',
    department: 'Teknologi Informasi',
    picName: 'Helpdesk IT',
    purchaseDate: '2025-04-10',
    purchasePrice: 21800000,
    warrantyExpiry: '2028-04-10',
    condition: 'Baik',
    status: 'Tersedia',
    hasRoutineMaintenance: true,
    maintenanceFrequency: 'Semesteran (6 Bulan)',
    maintenanceIntervalMonths: 6,
    lastMaintenanceDate: '2026-05-15',
    nextMaintenanceDate: '2026-11-15',
    maintenanceVendor: 'In-House IT & GA Support',
    notes: 'Unit pool laptop operasional untuk penugasan luar kota.',
  }
];
