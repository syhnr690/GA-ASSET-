import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, X, Check, Building2, Tag } from 'lucide-react';
import { OfficeAsset, CompanySettings } from '../types/inventory';

interface AssetTagPrintModalProps {
  assets: OfficeAsset[];
  selectedIds?: string[];
  settings: CompanySettings;
  onClose: () => void;
}

export const AssetTagPrintModal: React.FC<AssetTagPrintModalProps> = ({
  assets,
  selectedIds = [],
  settings,
  onClose
}) => {
  const [activeSelection, setActiveSelection] = useState<string[]>(
    selectedIds.length > 0 ? selectedIds : assets.slice(0, 6).map(a => a.id)
  );
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  const printableAssets = assets.filter(a => activeSelection.includes(a.id));

  // Generate QR codes using qrcode package
  useEffect(() => {
    const generateCodes = async () => {
      const urls: Record<string, string> = {};
      for (const asset of printableAssets) {
        try {
          const payload = JSON.stringify({
            code: asset.assetCode,
            name: asset.name,
            serial: asset.serialNumber,
            loc: asset.location,
            dept: asset.department,
            co: settings.companyName
          });
          const url = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 140,
            errorCorrectionLevel: 'M',
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          urls[asset.id] = url;
        } catch (e) {
          console.error('Failed generating QR code for', asset.assetCode, e);
        }
      }
      setQrCodeUrls(urls);
    };

    generateCodes();
  }, [printableAssets, settings.companyName]);

  const handlePrint = () => {
    window.print();
  };

  const handleToggleSelect = (id: string) => {
    setActiveSelection(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (activeSelection.length === assets.length) {
      setActiveSelection([]);
    } else {
      setActiveSelection(assets.map(a => a.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar (hidden on print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencetakan Label Stiker Aset & QR Code GA
              </h3>
              <p className="text-xs text-slate-500">
                Format standar stiker barcode inventaris untuk ditempelkan pada fisik barang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang ({printableAssets.length} Stiker)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Bar (hidden on print) */}
        <div className="no-print p-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4 flex-wrap text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-indigo-600 hover:underline font-medium"
            >
              {activeSelection.length === assets.length ? 'Batal Pilih Semua' : 'Pilih Semua Aset'}
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-mono">
              {activeSelection.length} dari {assets.length} aset terpilih
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Kompatibel dengan kertas stiker A4 (Tom & Jerry 108/121) atau printer barcode thermal
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70">
          {printableAssets.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Tidak ada aset yang dipilih. Silakan centang aset yang ingin dicetak labelnya.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto print:max-w-none print:grid-cols-2 print:gap-3">
              {printableAssets.map(asset => {
                const year = asset.purchaseDate ? asset.purchaseDate.split('-')[0] : '2024';
                const qrUrl = qrCodeUrls[asset.id];

                return (
                  <div
                    key={asset.id}
                    className="bg-white border-2 border-slate-900 rounded-lg p-3 text-slate-900 shadow-sm print:shadow-none print:border-black flex flex-col justify-between select-none"
                    style={{ minHeight: '140px' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-900" />
                        <span className="text-[10px] font-bold tracking-tight uppercase line-clamp-1">
                          {settings.companyName}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                        INVENTARIS GA
                      </span>
                    </div>

                    {/* Middle: QR Code + Details */}
                    <div className="flex items-center gap-3">
                      {/* Left: Real QR Code */}
                      <div className="w-20 h-20 shrink-0 border border-slate-300 rounded p-0.5 bg-white flex items-center justify-center">
                        {qrUrl ? (
                          <img 
                            src={qrUrl} 
                            alt={`QR ${asset.assetCode}`} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-[9px] text-slate-400 font-mono">Loading QR...</div>
                        )}
                      </div>

                      {/* Right: Asset metadata */}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-xs font-mono font-bold tracking-tight text-slate-900 leading-none">
                          {asset.assetCode}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 line-clamp-1 leading-tight mt-1">
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-600 line-clamp-1">
                          {asset.brand} {asset.model}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono line-clamp-1">
                          S/N: {asset.serialNumber || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-1.5 pt-0.5">
                          <span className="line-clamp-1">Lok: {asset.location}</span>
                          <span>·</span>
                          <span className="font-mono">{year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="border-t border-slate-900 mt-2 pt-1 flex items-center justify-between text-[8px] text-slate-600 font-medium">
                      <span>PROPERTI RESMI KANTOR</span>
                      <span className="uppercase">DILARANG MEMINDAHKAN TANPA IZIN GA</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
