import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  Wrench,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OfficeAsset, AssetCategory, AssetCondition, AssetStatus } from '../types/inventory';
import { formatCurrencyIDR, formatDateIndonesian } from '../utils/maintenanceEngine';
import { exportAssetsToCsv } from '../utils/exportCsv';

interface AssetRegisterViewProps {
  assets: OfficeAsset[];
  searchQuery: string;
  onOpenNewAssetModal: () => void;
  onOpenEditAssetModal: (asset: OfficeAsset) => void;
  onOpenDetailModal: (asset: OfficeAsset) => void;
  onOpenLoanModal: (asset: OfficeAsset) => void;
  onOpenPrintTags: (selectedAssetIds?: string[]) => void;
  onOpenNewMaintenanceModal: (preselectedAsset?: OfficeAsset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetRegisterView: React.FC<AssetRegisterViewProps> = ({
  assets,
  searchQuery,
  onOpenNewAssetModal,
  onOpenEditAssetModal,
  onOpenDetailModal,
  onOpenLoanModal,
  onOpenPrintTags,
  onOpenNewMaintenanceModal,
  onDeleteAsset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetToDelete, setAssetToDelete] = useState<OfficeAsset | null>(null);

  // Filter logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          asset.name.toLowerCase().includes(q) ||
          asset.assetCode.toLowerCase().includes(q) ||
          asset.serialNumber.toLowerCase().includes(q) ||
          asset.brand.toLowerCase().includes(q) ||
          asset.location.toLowerCase().includes(q) ||
          asset.picName.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'all' && asset.condition !== selectedCondition) {
        return false;
      }

      return true;
    });
  }, [assets, searchQuery, selectedCategory, selectedStatus, selectedCondition]);

  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map(a => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories: AssetCategory[] = [
    'IT & Komputer',
    'Elektronik & Meeting',
    'Fasilitas & Gedung',
    'Mebel & Perabot',
    'Kendaraan Operasional',
    'Pantry & Kebersihan',
    'Peralatan Keamanan / K3'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Daftar Inventaris Aset Kantor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database lengkap aset operasional, spesifikasi, lokasi fisik ruangan, dan PIC penanggung jawab.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedAssetIds.length > 0 && (
            <button
              onClick={() => onOpenPrintTags(selectedAssetIds)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak {selectedAssetIds.length} Label Stiker</span>
            </button>
          )}

          <button
            onClick={() => exportAssetsToCsv(filteredAssets)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          <button
            onClick={onOpenNewAssetModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Aset Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Segmented Controls & Dropdowns) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Semua Kategori ({assets.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({assets.filter(a => a.category === cat).length})
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Semua Status Ketersediaan</option>
            <option value="Tersedia">Tersedia di Lokasi</option>
            <option value="Sedang Dipinjam">Sedang Dipinjam</option>
            <option value="Dalam Perawatan">Dalam Perawatan</option>
            <option value="Dihapusbukukan">Dihapusbukukan</option>
          </select>

          {/* Condition Selector */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Semua Kondisi Fisik</option>
            <option value="Baik">Baik (Layak)</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Dalam Perbaikan">Dalam Perbaikan</option>
            <option value="Rusak Berat / Afkir">Rusak Berat / Afkir</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Menampilkan {filteredAssets.length} dari {assets.length} unit
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 select-none">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Kode & Nama Aset</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Kategori & Merk</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Lokasi & PIC Ruangan</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Kondisi & Status</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Perawatan Rutin</th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600 text-right">Nilai Perolehan</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-600 text-center">Aksi GA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ditemukan aset dengan kriteria pencarian / filter ini.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  const isAvailable = asset.status === 'Tersedia';

                  return (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(asset.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Code & Name */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-medium text-slate-500 text-[11px]">
                          {asset.assetCode}
                        </div>
                        <div 
                          onClick={() => onOpenDetailModal(asset)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer text-xs leading-snug line-clamp-1"
                        >
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          S/N: {asset.serialNumber || 'N/A'}
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-medium text-slate-800">{asset.category}</div>
                        <div className="text-[11px] text-slate-400">
                          {asset.brand} {asset.model}
                        </div>
                      </td>

                      {/* Location & PIC */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="text-slate-800 font-medium truncate max-w-[180px]">
                          {asset.location}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          PIC: {asset.picName}
                        </div>
                      </td>

                      {/* Condition & Status */}
                      <td className="py-3 px-3">
                        {/* Clean unboxed metadata with dot separators */}
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span className={
                            asset.condition === 'Baik' ? 'text-emerald-700' :
                            asset.condition === 'Rusak Ringan' ? 'text-amber-700' :
                            'text-rose-700'
                          }>
                            {asset.condition}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className={
                            asset.status === 'Tersedia' ? 'text-emerald-600' :
                            asset.status === 'Sedang Dipinjam' ? 'text-blue-600' :
                            asset.status === 'Dalam Perawatan' ? 'text-amber-600' :
                            'text-slate-400'
                          }>
                            {asset.status}
                          </span>
                        </div>
                      </td>

                      {/* Maintenance Automation */}
                      <td className="py-3 px-3 text-slate-600">
                        {asset.hasRoutineMaintenance ? (
                          <div>
                            <div className="text-slate-800 font-medium flex items-center gap-1">
                              <span>{asset.maintenanceFrequency}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Jatuh tempo: {formatDateIndonesian(asset.nextMaintenanceDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Non-rutin (Korektif)</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        {formatCurrencyIDR(asset.purchasePrice)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isAvailable && (
                            <button
                              onClick={() => onOpenLoanModal(asset)}
                              title="Pinjamkan Aset ini"
                              className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenNewMaintenanceModal(asset)}
                            title="Jadwalkan Servis / WO"
                            className="p-1 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenDetailModal(asset)}
                            title="Detail Lengkap"
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenEditAssetModal(asset)}
                            title="Ubah Aset"
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setAssetToDelete(asset)}
                            title="Hapus Aset"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* In-App Safe Deletion Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Hapus Aset Kantor</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data aset <strong className="text-slate-900">{assetToDelete.name}</strong> ({assetToDelete.assetCode})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Hapus Aset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
