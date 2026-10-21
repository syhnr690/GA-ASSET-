import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AssetLoan, AssetCondition } from '../types/inventory';
import { getTodayString } from '../utils/maintenanceEngine';

interface ReturnModalProps {
  loan: AssetLoan;
  onConfirmReturn: (
    loanId: string,
    assetId: string,
    returnDate: string,
    condition: AssetCondition,
    notes: string
  ) => void;
  onClose: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  loan,
  onConfirmReturn,
  onClose
}) => {
  const today = getTodayString();
  const [returnDate, setReturnDate] = useState(today);
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('Baik');
  const [notes, setNotes] = useState('Semua kelengkapan dan unit fisik diterima dalam kondisi baik.');
  const [accessoriesChecked, setAccessoriesChecked] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReturn(loan.id, loan.assetId, returnDate, returnCondition, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pemeriksaan & Pengembalian Barang
              </h3>
              <p className="text-xs text-slate-500">
                Verifikasi fisik barang sebelum dikembalikan ke rak aset kantor.
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

        {/* Loan Summary */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono">{loan.loanCode}</span>
            <span className="font-mono text-slate-700">{loan.assetCode}</span>
          </div>
          <div className="font-semibold text-slate-900 text-sm">
            {loan.assetName}
          </div>
          <div className="text-slate-600">
            Peminjam: <strong className="text-slate-800">{loan.borrowerName}</strong> ({loan.borrowerDepartment})
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Diterima Kembali
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kondisi Fisik Saat Kembali
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="Baik">Baik (Normal / Utuh / Tidak Cacat)</option>
              <option value="Rusak Ringan">Rusak Ringan (Ada goresan/kendala minor)</option>
              <option value="Dalam Perbaikan">Perlu Langsung Dikirim ke Servis / Bengkel</option>
              <option value="Rusak Berat / Afkir">Rusak Berat / Komponen Hilang</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={accessoriesChecked}
                onChange={(e) => setAccessoriesChecked(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="font-medium text-slate-800">
                Kelengkapan (kabel charger, adaptor, remote, tas) telah diperiksa & lengkap
              </span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Pengembalian / Bukti Fisik
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kebersihan, kelengkapan, baret bodi, atau kendala performa..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
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
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Pengembalian</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
