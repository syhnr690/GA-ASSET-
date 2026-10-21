import React, { useState } from 'react';
import { X, ArrowLeftRight, Calendar, User, Clock } from 'lucide-react';
import { OfficeAsset, AssetLoan } from '../types/inventory';
import { calculateNextDate, generateLoanCode, getTodayString } from '../utils/maintenanceEngine';

interface LoanModalProps {
  assets: OfficeAsset[];
  preselectedAsset?: OfficeAsset | null;
  existingLoansCount: number;
  onSave: (loan: AssetLoan) => void;
  onClose: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  assets,
  preselectedAsset,
  existingLoansCount,
  onSave,
  onClose
}) => {
  const today = getTodayString();
  const availableAssets = assets.filter(a => a.status === 'Tersedia' || a.id === preselectedAsset?.id);

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    preselectedAsset?.id || (availableAssets[0]?.id || '')
  );

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerEmployeeId, setBorrowerEmployeeId] = useState('');
  const [borrowerDepartment, setBorrowerDepartment] = useState('Divisi Operasional & Bisnis');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [purpose, setPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState(today);
  const [expectedReturnDate, setExpectedReturnDate] = useState(calculateNextDate(today, 0)); // will set to +7 days
  const [gaApprover, setGaApprover] = useState('Bambang Supriyanto (GA Officer)');
  const [formError, setFormError] = useState<string | null>(null);

  // Preset return days
  const handleSetQuickDuration = (days: number) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() + days);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      setExpectedReturnDate(`${y}-${m}-${d}`);
    } catch {
      // fallback
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedAsset) {
      setFormError('Pilih aset yang akan dipinjam!');
      return;
    }
    if (!borrowerName.trim() || !purpose.trim()) {
      setFormError('Nama peminjam dan keperluan pinjam wajib diisi!');
      return;
    }

    const newLoan: AssetLoan = {
      id: `loan-${Date.now()}`,
      loanCode: generateLoanCode(existingLoansCount + 1),
      assetId: selectedAsset.id,
      assetCode: selectedAsset.assetCode,
      assetName: selectedAsset.name,
      borrowerName: borrowerName.trim(),
      borrowerEmployeeId: borrowerEmployeeId.trim() || 'EMP-GA',
      borrowerDepartment,
      borrowerContact: borrowerContact.trim() || '-',
      purpose: purpose.trim(),
      borrowDate,
      expectedReturnDate,
      status: 'Dipinjam',
      gaApprover
    };

    onSave(newLoan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencatatan Peminjaman Barang / Aset Kantor
              </h3>
              <p className="text-xs text-slate-500">
                Form serah terima inventaris untuk keperluan dinas karyawan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Asset Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Aset yang Akan Dipinjam <span className="text-rose-500">*</span>
            </label>
            {availableAssets.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                Tidak ada aset kantor yang saat ini dalam status 'Tersedia' untuk dipinjamkan.
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
              >
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.assetCode}] {a.name} - {a.location} ({a.category})
                  </option>
                ))}
              </select>
            )}
            {selectedAsset && (
              <div className="mt-1 text-[11px] text-slate-500">
                Merk: {selectedAsset.brand} · Lokasi Asal: {selectedAsset.location} · Kondisi: {selectedAsset.condition}
              </div>
            )}
          </div>

          {/* Borrower Name & NIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Peminjam <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="Contoh: Fajar Pratama"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIK / ID Karyawan
              </label>
              <input
                type="text"
                value={borrowerEmployeeId}
                onChange={(e) => setBorrowerEmployeeId(e.target.value)}
                placeholder="EMP-2024-001"
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Department & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Departemen / Divisi
              </label>
              <input
                type="text"
                value={borrowerDepartment}
                onChange={(e) => setBorrowerDepartment(e.target.value)}
                placeholder="Finance, Marketing, IT, Operasional"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. WhatsApp / Kontak
              </label>
              <input
                type="text"
                value={borrowerContact}
                onChange={(e) => setBorrowerContact(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Borrow Date & Return Date with Quick Durations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Mulai Pinjam
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Pengembalian (Janji Kembali) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Durasi Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSetQuickDuration(3)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDuration(7)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700"
                >
                  +1 Minggu
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDuration(14)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700"
                >
                  +2 Minggu
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDuration(30)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700"
                >
                  +1 Bulan
                </button>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Keperluan Peminjaman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Kunjungan tugas audit lapangan ke kantor cabang, presentasi klien luar kantor..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* GA Approver */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Petugas GA yang Menyerahkan
            </label>
            <input
              type="text"
              value={gaApprover}
              onChange={(e) => setGaApprover(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!selectedAsset}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Simpan & Serahkan Barang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
