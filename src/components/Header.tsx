import React from 'react';
import { Search, ScanLine, Plus, Cloud, Check, LogOut, Loader2 } from 'lucide-react';
import { AuthUser } from '../types/inventory';

interface HeaderProps {
  activeTab: 'dashboard' | 'assets' | 'loans' | 'maintenance' | 'tags';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenScanner: () => void;
  onPrimaryAction: () => void;
  totalAlerts: number;
  currentUser?: AuthUser | null;
  isServerSaving?: boolean;
  lastSavedAt?: string | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  onOpenScanner,
  onPrimaryAction,
  totalAlerts,
  currentUser,
  isServerSaving,
  lastSavedAt,
  onLogout
}) => {
  const getTabBreadcrumbs = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Ringkasan Eksekutif & Status Operasional';
      case 'assets':
        return 'Inventaris & Registrasi Aset Kantor';
      case 'loans':
        return 'Sirkulasi & Pengembalian Peminjaman Barang';
      case 'maintenance':
        return 'Otomasi Jadwal Perawatan & Servis Rutin';
      case 'tags':
        return 'Generator & Pencetakan Label Stiker QR';
      default:
        return 'Dashboard';
    }
  };

  const getPrimaryButtonLabel = () => {
    switch (activeTab) {
      case 'assets':
        return 'Tambah Aset';
      case 'loans':
        return 'Catat Pinjam';
      case 'maintenance':
        return 'Work Order Baru';
      case 'tags':
        return 'Cetak Label';
      default:
        return 'Tambah Aset';
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'GA';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 select-none">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-sm whitespace-nowrap shrink-0">
        <span className="font-semibold text-slate-900 tracking-tight">SIM-GA</span>
        <span className="text-slate-400 font-light">/</span>
        <span className="text-slate-600">{getTabBreadcrumbs()}</span>
      </div>

      {/* Zone 2: Search input & Scanner trigger */}
      <div className="flex items-center gap-3 max-w-md w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aset, nomor seri, peminjam, atau kode..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={onOpenScanner}
          title="Scan atau cari cepat dengan Barcode / QR Code"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200"
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Scan Barcode</span>
        </button>
      </div>

      {/* Zone 3: Server Status + Primary CTA + User Profile + Logout */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Server Sync Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          {isServerSaving ? (
            <span className="flex items-center gap-1 text-amber-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyimpan ke Server...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600" title="Data tersimpan di server">
              <Cloud className="w-3.5 h-3.5" />
              <span>Sinkron Server</span>
            </span>
          )}
        </div>

        <button
          onClick={onPrimaryAction}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{getPrimaryButtonLabel()}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-none">
                {currentUser?.name || currentUser?.username || 'Admin GA'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                @{currentUser?.username || 'admin'} · {currentUser?.role || 'GA'}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              title="Keluar dari akun (Logout)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
