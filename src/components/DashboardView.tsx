import React from 'react';
import { 
  Package, 
  ArrowLeftRight, 
  Wrench, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  Printer,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { OfficeAsset, AssetLoan, MaintenanceTask } from '../types/inventory';
import { formatCurrencyIDR, formatDateIndonesian, getDaysDifference } from '../utils/maintenanceEngine';

interface DashboardViewProps {
  assets: OfficeAsset[];
  loans: AssetLoan[];
  maintenanceTasks: MaintenanceTask[];
  onNavigate: (tab: 'dashboard' | 'assets' | 'loans' | 'maintenance' | 'tags') => void;
  onOpenNewAssetModal: () => void;
  onOpenNewLoanModal: () => void;
  onOpenNewMaintenanceModal: () => void;
  onOpenReturnModal: (loan: AssetLoan) => void;
  onOpenCompleteTaskModal: (task: MaintenanceTask) => void;
  onTriggerAutoAudit: () => void;
  onExportAll: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  loans,
  maintenanceTasks,
  onNavigate,
  onOpenNewAssetModal,
  onOpenNewLoanModal,
  onOpenNewMaintenanceModal,
  onOpenReturnModal,
  onOpenCompleteTaskModal,
  onTriggerAutoAudit,
  onExportAll
}) => {
  // Quantitative calculations
  const totalValuation = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const activeLoans = loans.filter(l => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter(l => l.status === 'Terlambat');
  
  const pendingTasks = maintenanceTasks.filter(t => t.status !== 'Selesai');
  const urgentTasks = maintenanceTasks.filter(t => t.status === 'Terlambat' || t.status === 'Jatuh Tempo');

  // Breakdown by category
  const categoriesCount = assets.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Breakdown by condition
  const conditionsCount = {
    Baik: assets.filter(a => a.condition === 'Baik').length,
    'Rusak Ringan': assets.filter(a => a.condition === 'Rusak Ringan').length,
    'Dalam Perbaikan': assets.filter(a => a.condition === 'Dalam Perbaikan').length,
    'Rusak Berat / Afkir': assets.filter(a => a.condition === 'Rusak Berat / Afkir').length,
  };

  const hasUrgentIssues = overdueLoans.length > 0 || urgentTasks.length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pusat Kendali General Affairs & Inventaris
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring aset kantor, sirkulasi peminjaman karyawan, dan penjadwalan pemeliharaan preventif.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTriggerAutoAudit}
            title="Periksa dan sinkronisasi otomatis jadwal servis rutin semua aset"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded-lg border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audit Jadwal Rutin</span>
          </button>
          <button
            onClick={() => onNavigate('tags')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Stiker Tag</span>
          </button>
          <button
            onClick={onExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Aset Kantor</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {assets.length}
            </span>
            <span className="text-xs text-slate-500">Unit Fisik</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <span>Tersedia: {assets.filter(a => a.status === 'Tersedia').length}</span>
            <span aria-hidden="true">·</span>
            <span>Dipinjam: {assets.filter(a => a.status === 'Sedang Dipinjam').length}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Nilai Perolehan</span>
            <Coins className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
              {formatCurrencyIDR(totalValuation)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <span>{assets.filter(a => a.condition === 'Baik').length} Kondisi Prima</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-600 font-medium">{assets.filter(a => a.condition === 'Rusak Ringan').length} Butuh Servis</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Peminjaman Aktif</span>
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {activeLoans.length}
            </span>
            <span className="text-xs text-slate-500">Barang</span>
          </div>
          <div className="mt-3 text-xs flex items-center gap-2 border-t border-slate-100 pt-2.5">
            {overdueLoans.length > 0 ? (
              <span className="text-rose-600 font-medium">
                {overdueLoans.length} Peminjaman Terlambat
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">Semua Tepat Waktu</span>
            )}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Servis Rutin Butuh Tindakan</span>
            <Wrench className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {urgentTasks.length}
            </span>
            <span className="text-xs text-slate-500">Work Orders</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <span>{pendingTasks.length} Total Antrian Servis</span>
            <span aria-hidden="true">·</span>
            <button 
              onClick={() => onNavigate('maintenance')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Kelola
            </button>
          </div>
        </div>
      </div>

      {/* Attention / Alert Panel */}
      {hasUrgentIssues && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-900">
                Perhatian GA: Terdapat barang pinjaman terlambat atau jadwal perawatan jatuh tempo!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {overdueLoans.length > 0 && `${overdueLoans.length} peminjaman melewati batas waktu pengembalian. `}
                {urgentTasks.length > 0 && `${urgentTasks.length} unit fasilitas kantor memerlukan pengerjaan pemeliharaan rutin segera.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {overdueLoans.length > 0 && (
              <button
                onClick={() => onNavigate('loans')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Cek Peminjaman
              </button>
            )}
            {urgentTasks.length > 0 && (
              <button
                onClick={() => onNavigate('maintenance')}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Cek Jadwal Servis
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sirkulasi Peminjaman Terkini */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Sirkulasi Peminjaman Aktif
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Barang yang sedang dibawa atau digunakan karyawan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewLoanModal}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pinjam Baru</span>
              </button>
              <button
                onClick={() => onNavigate('loans')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Lihat Semua
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {activeLoans.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada peminjaman aktif saat ini. Semua aset kantor tersedia di tempat.
              </div>
            ) : (
              activeLoans.slice(0, 4).map((loan) => {
                const daysLeft = getDaysDifference(loan.expectedReturnDate);
                const isOverdue = loan.status === 'Terlambat' || daysLeft < 0;

                return (
                  <div key={loan.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-medium text-slate-500">{loan.assetCode}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-700 font-medium">{loan.borrowerName}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500">{loan.borrowerDepartment}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          {loan.assetName}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Keperluan: {loan.purpose}
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <div className="text-xs">
                          {isOverdue ? (
                            <span className="text-rose-600 font-medium">
                              Terlambat ({Math.abs(daysLeft)} hari)
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              Kembali: <span className="font-mono">{formatDateIndonesian(loan.expectedReturnDate)}</span>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onOpenReturnModal(loan)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors"
                        >
                          Proses Kembali
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Otomasi Jadwal Servis Rutin */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Jadwal Servis Rutin (Preventive)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Antrian perintah kerja pemeliharaan preventif fasilitas kantor
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewMaintenanceModal}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat WO</span>
              </button>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Lihat Semua
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Semua pemeliharaan rutin up-to-date! Tidak ada servis yang jatuh tempo.
              </div>
            ) : (
              pendingTasks.slice(0, 4).map((task) => {
                const daysDiff = getDaysDifference(task.scheduledDate);
                const isOverdue = task.status === 'Terlambat' || daysDiff < 0;

                return (
                  <div key={task.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-slate-500">{task.workOrderCode}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-700">{task.taskType}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-500">{task.frequency}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          {task.assetName}
                        </h4>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{task.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>Teknisi: {task.technicianOrVendor}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <div className="text-xs font-mono">
                          {isOverdue ? (
                            <span className="text-rose-600 font-semibold">
                              Lewat {Math.abs(daysDiff)} Hari
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {formatDateIndonesian(task.scheduledDate)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onOpenCompleteTaskModal(task)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                        >
                          Catat Selesai
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Condition Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category List */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Distribusi Inventaris per Kategori
          </h3>
          <div className="space-y-2.5">
            {assets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada data aset. Klik <strong>Tambah Aset Baru</strong> di atas untuk mulai input data pekerjaan riil Anda.
              </div>
            ) : (
              Object.entries(categoriesCount).map(([category, count]) => {
                const percentage = assets.length > 0 ? Math.round((count / assets.length) * 100) : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{category}</span>
                      <span className="font-mono text-slate-500">{count} unit ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Condition Status Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Kondisi Fisik & Kesiapan Aset
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs text-slate-500">Kondisi Baik (Siap Pakai)</div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-600">
                {conditionsCount.Baik} Unit
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Layak pakai operasional kantor
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs text-slate-500">Rusak Ringan</div>
              <div className="mt-1 text-lg font-bold font-mono text-amber-600">
                {conditionsCount['Rusak Ringan']} Unit
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Fungsi minor perlu perbaikan
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs text-slate-500">Dalam Perbaikan</div>
              <div className="mt-1 text-lg font-bold font-mono text-blue-600">
                {conditionsCount['Dalam Perbaikan']} Unit
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Sedang ditangani vendor/GA
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="text-xs text-slate-500">Rusak Berat / Afkir</div>
              <div className="mt-1 text-lg font-bold font-mono text-rose-600">
                {conditionsCount['Rusak Berat / Afkir']} Unit
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Usul penghapusan aset
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
