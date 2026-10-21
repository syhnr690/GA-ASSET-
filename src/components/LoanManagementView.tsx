import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  ArrowLeftRight,
  User,
  Building,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { AssetLoan, OfficeAsset } from '../types/inventory';
import { formatDateIndonesian, getDaysDifference } from '../utils/maintenanceEngine';
import { exportLoansToCsv } from '../utils/exportCsv';

interface LoanManagementViewProps {
  loans: AssetLoan[];
  assets: OfficeAsset[];
  searchQuery: string;
  onOpenNewLoanModal: () => void;
  onOpenReturnModal: (loan: AssetLoan) => void;
}

export const LoanManagementView: React.FC<LoanManagementViewProps> = ({
  loans,
  assets,
  searchQuery,
  onOpenNewLoanModal,
  onOpenReturnModal
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          loan.loanCode.toLowerCase().includes(q) ||
          loan.assetCode.toLowerCase().includes(q) ||
          loan.assetName.toLowerCase().includes(q) ||
          loan.borrowerName.toLowerCase().includes(q) ||
          loan.borrowerEmployeeId.toLowerCase().includes(q) ||
          loan.borrowerDepartment.toLowerCase().includes(q) ||
          loan.purpose.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status
      if (filterStatus === 'active') {
        return loan.status === 'Dipinjam' || loan.status === 'Terlambat';
      }
      if (filterStatus === 'overdue') {
        return loan.status === 'Terlambat';
      }
      if (filterStatus === 'returned') {
        return loan.status === 'Dikembalikan';
      }
      return true;
    });
  }, [loans, searchQuery, filterStatus]);

  const activeCount = loans.filter(l => l.status === 'Dipinjam' || l.status === 'Terlambat').length;
  const overdueCount = loans.filter(l => l.status === 'Terlambat').length;
  const returnedCount = loans.filter(l => l.status === 'Dikembalikan').length;

  const handleCopyWhatsAppReminder = (loan: AssetLoan) => {
    const text = `Halo Rekan ${loan.borrowerName} (${loan.borrowerDepartment}),\n\n` +
      `Mengingatkan dari General Affairs (Bagian Umum) terkait peminjaman aset kantor:\n` +
      `• Kode Pinjam: ${loan.loanCode}\n` +
      `• Barang: ${loan.assetName} (${loan.assetCode})\n` +
      `• Tanggal Pinjam: ${loan.borrowDate}\n` +
      `• Batas Pengembalian: ${loan.expectedReturnDate}\n\n` +
      `Mohon agar dapat segera dikembalikan ke meja GA atau konfirmasi jika ada perpanjangan masa tugas.\n` +
      `Terima kasih atas kerja samanya.\n\n` +
      `Salam,\nBagian Umum (General Affairs)`;

    navigator.clipboard.writeText(text);
    setCopiedMessageId(loan.id);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Sirkulasi & Peminjaman Barang Kantor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan serah terima peralatan operasional, laptop pool, proyektor, kendaraan, dan alat meeting.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportLoansToCsv(filteredLoans)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Log CSV</span>
          </button>

          <button
            onClick={onOpenNewLoanModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStatus('active')}
          className={`border rounded-xl p-4 cursor-pointer transition-all ${
            filterStatus === 'active' 
              ? 'bg-indigo-50/50 border-indigo-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Sedang Dipinjam</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {activeCount} Unit
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Aset di luar inventaris fisik GA</div>
        </div>

        <div 
          onClick={() => setFilterStatus('overdue')}
          className={`border rounded-xl p-4 cursor-pointer transition-all ${
            filterStatus === 'overdue' 
              ? 'bg-rose-50/50 border-rose-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-medium text-rose-600">Melewati Batas (Terlambat)</div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            {overdueCount} Unit
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Perlu peringatan / follow up ke karyawan</div>
        </div>

        <div 
          onClick={() => setFilterStatus('returned')}
          className={`border rounded-xl p-4 cursor-pointer transition-all ${
            filterStatus === 'returned' 
              ? 'bg-emerald-50/50 border-emerald-300' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Telah Dikembalikan</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            {returnedCount} Riwayat
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lulus cek fisik & kembali ke rak/pool</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filterStatus === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Riwayat ({loans.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filterStatus === 'active'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Aktif Dipinjam ({activeCount})
        </button>
        <button
          onClick={() => setFilterStatus('overdue')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filterStatus === 'overdue'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terlambat ({overdueCount})
        </button>
        <button
          onClick={() => setFilterStatus('returned')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filterStatus === 'returned'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dikembalikan ({returnedCount})
        </button>
      </div>

      {/* Loans Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 select-none">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-600">ID Pinjam & Aset</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Peminjam & Departemen</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Tujuan / Keperluan</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Periode Peminjaman</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Status Sirkulasi</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-600 text-center">Tindakan GA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada catatan peminjaman dalam kategori filter ini.
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => {
                  const daysLeft = getDaysDifference(loan.expectedReturnDate);
                  const isOverdue = loan.status === 'Terlambat' || (loan.status === 'Dipinjam' && daysLeft < 0);
                  const isReturned = loan.status === 'Dikembalikan';

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Loan Code & Asset */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-500 text-[11px]">
                          {loan.loanCode}
                        </div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {loan.assetName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {loan.assetCode}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {loan.borrowerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {loan.borrowerDepartment}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {loan.borrowerContact} (NIK: {loan.borrowerEmployeeId})
                        </div>
                      </td>

                      {/* Purpose */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-700 text-xs line-clamp-2 leading-relaxed">
                          {loan.purpose}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Disetujui oleh: {loan.gaApprover}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3">
                        <div className="text-slate-600">
                          Pinjam: <span className="font-mono">{formatDateIndonesian(loan.borrowDate)}</span>
                        </div>
                        <div className="text-slate-900 font-medium">
                          Batas: <span className="font-mono">{formatDateIndonesian(loan.expectedReturnDate)}</span>
                        </div>
                        {isReturned && loan.actualReturnDate && (
                          <div className="text-emerald-700 text-[11px]">
                            Kembali: <span className="font-mono">{formatDateIndonesian(loan.actualReturnDate)}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {isReturned ? (
                          <div className="text-xs">
                            <span className="text-emerald-700 font-medium">Telah Dikembalikan</span>
                            <div className="text-[11px] text-slate-500">
                              Kondisi: {loan.returnCondition || 'Baik'}
                            </div>
                            {loan.returnNotes && (
                              <div className="text-[10px] text-slate-400 italic line-clamp-1">
                                "{loan.returnNotes}"
                              </div>
                            )}
                          </div>
                        ) : isOverdue ? (
                          <div className="text-xs">
                            <span className="text-rose-600 font-semibold">
                              Terlambat ({Math.abs(daysLeft)} Hari)
                            </span>
                            <div className="text-[11px] text-rose-500">
                              Jatuh tempo terlampaui
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="text-indigo-600 font-medium">Sedang Dipinjam</span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Sisa {daysLeft} hari
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {!isReturned ? (
                            <>
                              <button
                                onClick={() => onOpenReturnModal(loan)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors"
                              >
                                Proses Kembali
                              </button>

                              <button
                                onClick={() => handleCopyWhatsAppReminder(loan)}
                                title="Salin template pengingat WA ke clipboard"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                              >
                                {copiedMessageId === loan.id ? (
                                  <span className="text-[10px] font-medium px-1 text-emerald-700">Tersalin!</span>
                                ) : (
                                  <MessageSquare className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Selesai</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
