import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  Save, 
  Cloud, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ExternalLink,
  ShieldCheck,
  Database
} from 'lucide-react';
import { 
  CompanySettings, 
  OfficeAsset, 
  AssetLoan, 
  MaintenanceTask, 
  MaintenanceLog 
} from '../types/inventory';
import { 
  exportDatabaseToJson, 
  importDatabaseFromJson, 
  getServerStorageInfo 
} from '../utils/storage';

interface SettingsModalProps {
  settings: CompanySettings;
  assets: OfficeAsset[];
  loans: AssetLoan[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  onSave: (newSettings: CompanySettings) => void;
  onRestoreDatabase: (restored: {
    assets: OfficeAsset[];
    loans: AssetLoan[];
    tasks: MaintenanceTask[];
    logs: MaintenanceLog[];
    settings: CompanySettings;
  }) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  assets,
  loans,
  tasks,
  logs,
  onSave,
  onRestoreDatabase,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'storage'>('profile');
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [formError, setFormError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [storageInfo, setStorageInfo] = useState<{
    platform: string;
    storageType: string;
    isKvConnected: boolean;
  }>({
    platform: 'Memuat...',
    storageType: 'Memeriksa...',
    isKvConnected: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getServerStorageInfo().then(setStorageInfo);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.companyName.trim()) {
      setFormError('Nama perusahaan wajib diisi.');
      return;
    }
    onSave(formData);
  };

  const handleExportJson = () => {
    exportDatabaseToJson({ assets, loans, tasks, logs, settings: formData });
    setImportStatus({ message: 'Berkas cadangan JSON berhasil diunduh ke perangkat Anda.' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ message: 'Memproses pemulihan data...' });
    const result = await importDatabaseFromJson(file);

    if (result.success && result.data) {
      onRestoreDatabase(result.data);
      setFormData(result.data.settings);
      setImportStatus({ message: `Berhasil memulihkan ${result.data.assets.length} aset dari berkas backup!` });
    } else {
      setImportStatus({ message: result.error || 'Gagal memulihkan database.', isError: true });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengaturan Sistem & Penyimpanan
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi profil GA, status database Vercel, dan manajemen cadangan data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/50 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Perusahaan & GA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'storage'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Penyimpanan Vercel & Backup</span>
            {storageInfo.isKvConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / Organisasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Contoh: PT Sumber Mandiri Perkasa"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Divisi / Bagian
                </label>
                <input
                  type="text"
                  value={formData.gaDivisionName}
                  onChange={(e) => setFormData({ ...formData, gaDivisionName: e.target.value })}
                  placeholder="General Affairs & Facility Management"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Gedung / Kantor
                </label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  placeholder="Gedung Wisma Antara Lt. 5, Jakarta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Kontak GA
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="ga@perusahaan.co.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Telepon / Extension
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="(021) 1234-5678"
                    className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              {/* Storage Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>Status Backend & Penyimpanan Vercel</span>
                  </div>
                  {storageInfo.isKvConnected ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Cloud KV Aktif</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Dual-Sync (Browser + Server)</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Platform Runtime</div>
                    <div className="font-semibold text-slate-800 capitalize">{storageInfo.platform}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="text-slate-400">Penyimpanan Aktif</div>
                    <div className="font-semibold text-slate-800 truncate">{storageInfo.storageType}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Struktur aplikasi SIM-GA telah dipersiapkan dengan arsitektur <strong>Dual-Sync</strong>:
                  data Anda disimpan secara aman di peramban (LocalStorage) dan dikirim ke serverless endpoint Vercel (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded">/api/data</code>).
                </p>
              </div>

              {/* Vercel KV Setup Guide */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  <span>Cara Mengaktifkan Database Cloud Vercel KV (Permanen)</span>
                </div>
                <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                  Jika Anda ingin data inventaris dapat diakses bersamaan oleh banyak staf dari berbagai perangkat via Vercel:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-indigo-900/80 space-y-1 pl-1">
                  <li>Buka proyek Anda di <strong>Vercel Dashboard</strong>.</li>
                  <li>Buka tab <strong>Storage</strong> → klik <strong>Create Database</strong> → pilih <strong>KV (Serverless Redis)</strong>.</li>
                  <li>Klik <strong>Connect to Project</strong>. Vercel akan otomatis menyuntikkan variabel <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">KV_REST_API_URL</code>.</li>
                  <li>Redeploy di Vercel — aplikasi akan otomatis beralih ke penyimpanan cloud permanen tanpa perlu merubah kode!</li>
                </ol>
              </div>

              {/* Backup & Restore Section */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Cadangan & Pemulihan Data (Backup & Restore JSON)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {assets.length} aset terdata
                  </span>
                </div>

                {importStatus && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    importStatus.isError 
                      ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    {importStatus.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{importStatus.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center justify-center gap-2 p-3 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl font-semibold text-slate-800 transition-all text-xs cursor-pointer group"
                  >
                    <Download className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div>Unduh Backup JSON</div>
                      <div className="text-[10px] text-slate-400 font-normal">Simpan berkas offline</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl font-semibold text-slate-800 transition-all text-xs cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div>Pulihkan dari JSON</div>
                      <div className="text-[10px] text-slate-400 font-normal">Import berkas cadangan</div>
                    </div>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
