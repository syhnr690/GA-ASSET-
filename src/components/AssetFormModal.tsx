import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Building2, Wrench } from 'lucide-react';
import { OfficeAsset, AssetCategory, AssetCondition, AssetStatus, MaintenanceFrequency } from '../types/inventory';
import { generateAssetCode, calculateNextDate, getFrequencyMonths, getTodayString } from '../utils/maintenanceEngine';

interface AssetFormModalProps {
  initialAsset?: OfficeAsset | null;
  existingCount: number;
  onSave: (asset: OfficeAsset) => void;
  onClose: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  initialAsset,
  existingCount,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialAsset);
  const today = getTodayString();
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<OfficeAsset>>({
    name: '',
    category: 'IT & Komputer',
    assetCode: '',
    brand: '',
    model: '',
    serialNumber: '',
    location: 'Lantai 2 - Ruang Kerja Terbuka',
    department: 'GA & Operasional',
    picName: 'Bambang Supriyanto',
    purchaseDate: today,
    purchasePrice: 5000000,
    warrantyExpiry: calculateNextDate(today, 12),
    condition: 'Baik',
    status: 'Tersedia',
    hasRoutineMaintenance: true,
    maintenanceFrequency: 'Triwulan (3 Bulan)',
    maintenanceIntervalMonths: 3,
    lastMaintenanceDate: today,
    nextMaintenanceDate: calculateNextDate(today, 3),
    maintenanceVendor: 'Vendor Rekanan GA',
    notes: ''
  });

  useEffect(() => {
    if (initialAsset) {
      setFormData(initialAsset);
    } else {
      const generatedCode = generateAssetCode('IT & Komputer', existingCount + 1);
      setFormData(prev => ({ ...prev, assetCode: generatedCode }));
    }
  }, [initialAsset, existingCount]);

  const handleCategoryChange = (cat: AssetCategory) => {
    let defaultFreq: MaintenanceFrequency = 'Triwulan (3 Bulan)';
    let defaultMonths = 3;
    let defaultVendor = 'Vendor Rekanan GA';

    if (cat === 'Fasilitas & Gedung') {
      defaultFreq = 'Triwulan (3 Bulan)';
      defaultMonths = 3;
      defaultVendor = 'CV Sejuk Dinamika Mandiri';
    } else if (cat === 'Kendaraan Operasional') {
      defaultFreq = 'Triwulan (3 Bulan)';
      defaultMonths = 3;
      defaultVendor = 'Bengkel Resmi Rekanan GA';
    } else if (cat === 'Peralatan Keamanan / K3') {
      defaultFreq = 'Semesteran (6 Bulan)';
      defaultMonths = 6;
      defaultVendor = 'PT Fireindo Safety System';
    } else if (cat === 'Pantry & Kebersihan') {
      defaultFreq = 'Bulanan';
      defaultMonths = 1;
      defaultVendor = 'In-House GA Hospitality';
    } else if (cat === 'IT & Komputer') {
      defaultFreq = 'Semesteran (6 Bulan)';
      defaultMonths = 6;
      defaultVendor = 'In-House IT & GA Support';
    }

    const nextDate = calculateNextDate(formData.lastMaintenanceDate || today, defaultMonths);

    setFormData(prev => ({
      ...prev,
      category: cat,
      assetCode: isEditing ? prev.assetCode : generateAssetCode(cat, existingCount + 1),
      maintenanceFrequency: defaultFreq,
      maintenanceIntervalMonths: defaultMonths,
      maintenanceVendor: defaultVendor,
      nextMaintenanceDate: nextDate
    }));
  };

  const handleFrequencyChange = (freq: MaintenanceFrequency) => {
    const months = getFrequencyMonths(freq);
    const nextDate = calculateNextDate(formData.lastMaintenanceDate || today, months);
    setFormData(prev => ({
      ...prev,
      maintenanceFrequency: freq,
      maintenanceIntervalMonths: months,
      nextMaintenanceDate: nextDate
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name?.trim() || !formData.assetCode?.trim()) {
      setFormError('Nama aset dan kode aset wajib diisi!');
      return;
    }

    const assetToSave: OfficeAsset = {
      id: initialAsset?.id || `ast-${Date.now()}`,
      assetCode: formData.assetCode || 'AST-GEN',
      name: formData.name || 'Aset Kantor',
      category: (formData.category as AssetCategory) || 'IT & Komputer',
      brand: formData.brand || '-',
      model: formData.model || '-',
      serialNumber: formData.serialNumber || '-',
      location: formData.location || 'Kantor Pusat',
      department: formData.department || 'GA & Operasional',
      picName: formData.picName || 'Staff GA',
      purchaseDate: formData.purchaseDate || today,
      purchasePrice: Number(formData.purchasePrice) || 0,
      warrantyExpiry: formData.warrantyExpiry || today,
      condition: (formData.condition as AssetCondition) || 'Baik',
      status: (formData.status as AssetStatus) || 'Tersedia',
      hasRoutineMaintenance: Boolean(formData.hasRoutineMaintenance),
      maintenanceFrequency: (formData.maintenanceFrequency as MaintenanceFrequency) || 'Triwulan (3 Bulan)',
      maintenanceIntervalMonths: formData.maintenanceIntervalMonths || 3,
      lastMaintenanceDate: formData.lastMaintenanceDate,
      nextMaintenanceDate: formData.nextMaintenanceDate,
      maintenanceVendor: formData.maintenanceVendor,
      notes: formData.notes
    };

    onSave(assetToSave);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEditing ? 'Ubah Data Aset Kantor' : 'Registrasi Aset Kantor Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Lengkapi spesifikasi, penempatan fisik ruangan, dan siklus pemeliharaan rutin.
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Row 1: Category & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Aset <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value as AssetCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kode Tag Aset (Otomatis/Kustom) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.assetCode}
                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                required
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Name & Brand/Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Barang / Aset <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: AC Daikin Multi Split Inverter 2 PK"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Merk / Pabrikan
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Daikin, Lenovo, Toyota"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 3: Model & S/N */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipe / Seri Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="FTKC50TVM4, ThinkPad T14"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Seri Fisik (Serial Number)
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Nomor barcode pabrik / chassis"
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 4: Location & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lokasi Fisik Ruangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lantai 2 - Ruang IT, Meeting Room A"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Departemen Pemegang
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="GA & Fasilitas, IT, Finance"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                PIC Penanggung Jawab
              </label>
              <input
                type="text"
                value={formData.picName}
                onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                placeholder="Nama staf penanggung jawab"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 5: Purchase Date, Price, Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pembelian / Perolehan
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harga Perolehan (IDR)
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Akhir Garansi
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 6: Condition & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kondisi Fisik Saat Ini
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                <option value="Baik">Baik (Layak Pakai Penuh)</option>
                <option value="Rusak Ringan">Rusak Ringan (Perlu Tindakan Minor)</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan (Sedang di Bengkel/Teknisi)</option>
                <option value="Rusak Berat / Afkir">Rusak Berat / Afkir (Usul Dihapus)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Ketersediaan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                <option value="Tersedia">Tersedia di Lokasi</option>
                <option value="Sedang Dipinjam">Sedang Dipinjam</option>
                <option value="Dalam Perawatan">Dalam Perawatan</option>
                <option value="Dihapusbukukan">Dihapusbukukan</option>
              </select>
            </div>
          </div>

          {/* Section: Otomasi Jadwal Perawatan Rutin */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-slate-900">
                  Konfigurasi Pemeliharaan Rutin Otomatis (Preventive Maintenance)
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasRoutineMaintenance}
                  onChange={(e) => setFormData({ ...formData, hasRoutineMaintenance: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-indigo-900">Aktifkan Otomasi</span>
              </label>
            </div>

            {formData.hasRoutineMaintenance && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Frekuensi Siklus Servis
                  </label>
                  <select
                    value={formData.maintenanceFrequency}
                    onChange={(e) => handleFrequencyChange(e.target.value as MaintenanceFrequency)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                  >
                    <option value="Bulanan">Bulanan (Tiap 1 Bulan)</option>
                    <option value="Triwulan (3 Bulan)">Triwulan (Tiap 3 Bulan)</option>
                    <option value="Semesteran (6 Bulan)">Semesteran (Tiap 6 Bulan)</option>
                    <option value="Tahunan (12 Bulan)">Tahunan (Tiap 12 Bulan)</option>
                    <option value="Khusus / Kustom">Kustom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vendor Rekanan / Teknisi
                  </label>
                  <input
                    type="text"
                    value={formData.maintenanceVendor}
                    onChange={(e) => setFormData({ ...formData, maintenanceVendor: e.target.value })}
                    placeholder="Nama bengkel / teknisi rekanan"
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jadwal Servis Berikutnya (Auto)
                  </label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className="w-full font-mono bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus GA
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Keterangan kelengkapan aksesoris, riwayat pergantian part, kondisi khusus..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Footer Submit */}
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
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Aset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
