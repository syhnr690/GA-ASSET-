import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Package, 
  ArrowLeftRight, 
  Wrench, 
  Calendar, 
  Tag, 
  Clock, 
  Printer, 
  Building2, 
  ShieldCheck, 
  Edit3
} from 'lucide-react';
import { OfficeAsset, AssetLoan, MaintenanceTask, MaintenanceLog, CompanySettings } from '../types/inventory';
import { formatCurrencyIDR, formatDateIndonesian, getDaysDifference } from '../utils/maintenanceEngine';

interface AssetDetailModalProps {
  asset: OfficeAsset;
  loans: AssetLoan[];
  maintenanceTasks: MaintenanceTask[];
  maintenanceLogs: MaintenanceLog[];
  settings: CompanySettings;
  onEdit: (asset: OfficeAsset) => void;
  onLoan: (asset: OfficeAsset) => void;
  onMaintenance: (asset: OfficeAsset) => void;
  onPrintTag: (assetId: string) => void;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  loans,
  maintenanceTasks,
  maintenanceLogs,
  settings,
  onEdit,
  onLoan,
  onMaintenance,
  onPrintTag,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'maintenance' | 'loans'>('specs');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const assetLoans = loans.filter(l => l.assetId === asset.id);
  const assetTasks = maintenanceTasks.filter(t => t.assetId === asset.id);
  const assetLogs = maintenanceLogs.filter(l => l.assetId === asset.id);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const payload = JSON.stringify({
          code: asset.assetCode,
          name: asset.name,
          sn: asset.serialNumber,
          loc: asset.location,
          co: settings.companyName
        });
        const url = await QRCode.toDataURL(payload, {
          width: 160,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' }
        });
        setQrDataUrl(url);
      } catch (e) {
        console.error(e);
      }
    };
    generateQr();
  }, [asset, settings.companyName]);

  const daysToNextMaint = asset.nextMaintenanceDate ? getDaysDifference(asset.nextMaintenanceDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {asset.assetCode}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-medium">{asset.category}</span>
              <span className="text-slate-400">·</span>
              <span className={`font-semibold ${
                asset.status === 'Tersedia' ? 'text-emerald-700' :
                asset.status === 'Sedang Dipinjam' ? 'text-blue-700' : 'text-amber-700'
              }`}>
                {asset.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {asset.name}
            </h2>
            <div className="text-xs text-slate-500">
              Lokasi: <span className="text-slate-700 font-medium">{asset.location}</span> · PIC: <span className="text-slate-700">{asset.picName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPrintTag(asset.id)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="Cetak Stiker Label QR"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              title="Edit Data Aset"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Spesifikasi & Informasi Aset
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Jadwal & Log Perawatan Rutin</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
              {assetTasks.length + assetLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'loans'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Riwayat Peminjaman</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
              {assetLoans.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-5">
          {/* TAB 1: SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-5">
              {/* Top row: Specifications & QR preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Spesifikasi Teknis
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Merk / Brand</span>
                      <span className="font-semibold text-slate-900">{asset.brand}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Model / Tipe</span>
                      <span className="font-semibold text-slate-900">{asset.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nomor Seri Fisik</span>
                      <span className="font-mono font-semibold text-slate-900">{asset.serialNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Kondisi Fisik</span>
                      <span className={`font-semibold ${
                        asset.condition === 'Baik' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {asset.condition}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-1">
                    Administrasi & Keuangan
                  </h4>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tanggal Pembelian</span>
                      <span className="font-mono font-medium text-slate-900">{formatDateIndonesian(asset.purchaseDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Harga Perolehan</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrencyIDR(asset.purchasePrice)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Garansi Berlaku Hingga</span>
                      <span className="font-mono font-medium text-slate-900">{formatDateIndonesian(asset.warrantyExpiry)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Departemen Pemegang</span>
                      <span className="font-medium text-slate-900">{asset.department}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Tag Card */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Stiker Barcode Resmi GA
                  </div>
                  <div className="w-28 h-28 bg-white border border-slate-300 p-1 rounded-lg flex items-center justify-center shadow-xs">
                    {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />}
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-2">
                    {asset.assetCode}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Scan via Smartphone Camera
                  </div>
                  <button
                    onClick={() => onPrintTag(asset.id)}
                    className="mt-3 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Label</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              {asset.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-900">
                  <strong className="font-semibold block mb-0.5">Catatan GA:</strong>
                  <p className="leading-relaxed">{asset.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              {/* Automation Status Banner for this asset */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Siklus Pemeliharaan: {asset.hasRoutineMaintenance ? asset.maintenanceFrequency : 'Non-Rutin'}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Vendor Rekanan: <strong className="text-slate-800">{asset.maintenanceVendor || 'Vendor Rekanan GA'}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Servis Terakhir: <span className="font-mono">{formatDateIndonesian(asset.lastMaintenanceDate)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500 uppercase">Jadwal Servis Berikutnya</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {formatDateIndonesian(asset.nextMaintenanceDate)}
                  </div>
                  {daysToNextMaint !== null && (
                    <div className="text-[11px] font-medium mt-0.5">
                      {daysToNextMaint < 0 ? (
                        <span className="text-rose-600">Lewat {Math.abs(daysToNextMaint)} hari!</span>
                      ) : daysToNextMaint === 0 ? (
                        <span className="text-amber-600">Hari ini!</span>
                      ) : (
                        <span className="text-emerald-700">Dalam {daysToNextMaint} hari</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Active / Pending Tasks */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Perintah Kerja Terjadwal / Aktif
                </h4>
                {assetTasks.length === 0 ? (
                  <div className="p-4 border border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                    Tidak ada work order terbuka untuk aset ini saat ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assetTasks.map(task => (
                      <div key={task.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-white">
                        <div>
                          <div className="font-mono text-slate-500 text-[11px]">{task.workOrderCode}</div>
                          <div className="font-semibold text-slate-900 text-xs">{task.taskType}</div>
                          <div className="text-slate-500 text-[11px]">Vendor: {task.technicianOrVendor}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium text-slate-800 text-xs">{formatDateIndonesian(task.scheduledDate)}</div>
                          <div className="text-[11px] font-semibold text-amber-600">{task.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Maintenance Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Riwayat Penyelesaian Servis Terdahulu
                </h4>
                {assetLogs.length === 0 ? (
                  <div className="p-4 border border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                    Belum ada catatan servis masa lalu untuk unit ini.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {assetLogs.map(log => (
                      <div key={log.id} className="p-3 bg-white space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span className="font-mono font-medium text-slate-800">{formatDateIndonesian(log.date)}</span>
                          <span className="font-mono font-bold text-slate-900">{formatCurrencyIDR(log.cost)}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-xs">{log.description}</p>
                        <div className="text-[10px] text-slate-400">
                          Pelaksana: {log.performedBy} ({log.vendor})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LOANS */}
          {activeTab === 'loans' && (
            <div className="space-y-3">
              {assetLoans.length === 0 ? (
                <div className="p-8 border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  Aset ini belum pernah dipinjamkan kepada staf / karyawan.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {assetLoans.map(loan => (
                    <div key={loan.id} className="p-4 bg-white space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-500">{loan.loanCode}</span>
                        <span className={`font-semibold ${
                          loan.status === 'Dikembalikan' ? 'text-emerald-700' :
                          loan.status === 'Terlambat' ? 'text-rose-600' : 'text-blue-600'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                      <div className="text-slate-900 font-semibold text-xs">
                        Peminjam: {loan.borrowerName} ({loan.borrowerDepartment})
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        Keperluan: {loan.purpose}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Pinjam: {formatDateIndonesian(loan.borrowDate)}</span>
                        <span>·</span>
                        <span>Batas: {formatDateIndonesian(loan.expectedReturnDate)}</span>
                        {loan.actualReturnDate && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700">Kembali: {formatDateIndonesian(loan.actualReturnDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {asset.status === 'Tersedia' && (
              <button
                onClick={() => {
                  onClose();
                  onLoan(asset);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Pinjamkan Aset Ini</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onMaintenance(asset);
              }}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Jadwalkan Servis</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
