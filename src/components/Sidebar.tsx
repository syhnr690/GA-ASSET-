import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Wrench, 
  QrCode, 
  RotateCcw, 
  Building2, 
  Settings, 
  HardDrive,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { CompanySettings } from '../types/inventory';
import { formatCurrencyIDR } from '../utils/maintenanceEngine';

interface SidebarProps {
  activeTab: 'dashboard' | 'assets' | 'loans' | 'maintenance' | 'tags';
  setActiveTab: (tab: 'dashboard' | 'assets' | 'loans' | 'maintenance' | 'tags') => void;
  settings: CompanySettings;
  totalAssetsCount: number;
  totalValuation: number;
  overdueLoansCount: number;
  overdueTasksCount: number;
  onResetData: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  totalAssetsCount,
  totalValuation,
  overdueLoansCount,
  overdueTasksCount,
  onResetData,
  onOpenSettings,
  onLogout
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const totalAlerts = overdueLoansCount + overdueTasksCount;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Zone */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white tracking-tight leading-tight truncate">
              {settings.companyName}
            </h1>
            <p className="text-xs text-slate-400 truncate">
              {settings.gaDivisionName}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          title="Ubah Profil & Nama Perusahaan"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Modul Operasional GA
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Ringkasan Dashboard</span>
          </div>
          {totalAlerts > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {totalAlerts}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'assets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Inventaris Aset Kantor</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {totalAssetsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'loans'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Peminjaman Barang</span>
          </div>
          {overdueLoansCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {overdueLoansCount} Terlambat
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'maintenance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Jadwal Perawatan Otomatis</span>
          </div>
          {overdueTasksCount > 0 && (
            <span className="px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {overdueTasksCount} Servis
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tags')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Cetak Stiker Label QR</span>
          </div>
        </button>
      </nav>

      {/* Valuation and System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs space-y-3">
        <div>
          <div className="text-slate-400 mb-0.5 text-[11px]">Total Nilai Buku Aset</div>
          <div className="text-white font-mono font-semibold text-sm tracking-tight">
            {formatCurrencyIDR(totalValuation)}
          </div>
        </div>

        {/* Reset Confirmation Safe Drawer */}
        {showResetConfirm ? (
          <div className="p-2.5 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Kosongkan seluruh data?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded"
              >
                Ya, Bersihkan
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Server Data Aktif</span>
            </span>
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Kosongkan data inventaris"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Bersih</span>
            </button>
          </div>
        )}

        {/* Sidebar Logout Button */}
        {onLogout && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={onLogout}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700/60 hover:border-rose-700/60"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
