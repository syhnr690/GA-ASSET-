import React, { useState } from 'react';
import { X, ScanLine, Search, CheckCircle2, AlertCircle, ArrowLeftRight, Eye } from 'lucide-react';
import { OfficeAsset } from '../types/inventory';

interface BarcodeScannerModalProps {
  assets: OfficeAsset[];
  onSelectAsset: (asset: OfficeAsset) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  assets,
  onSelectAsset,
  onClose
}) => {
  const [inputCode, setInputCode] = useState('');
  const [matchedAsset, setMatchedAsset] = useState<OfficeAsset | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (codeToSearch: string) => {
    const cleaned = codeToSearch.trim().toLowerCase();
    if (!cleaned) {
      setMatchedAsset(null);
      setSearched(false);
      return;
    }

    const found = assets.find(a => 
      a.assetCode.toLowerCase() === cleaned ||
      a.serialNumber.toLowerCase() === cleaned ||
      a.name.toLowerCase().includes(cleaned)
    );

    setMatchedAsset(found || null);
    setSearched(true);
  };

  const handleSimulateScan = (code: string) => {
    setInputCode(code);
    handleSearch(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pemindai Barcode / QR Code Aset GA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Scanner Simulation Window */}
          <div className="relative border-2 border-dashed border-indigo-300 rounded-xl p-6 bg-slate-950 text-center text-white flex flex-col items-center justify-center overflow-hidden">
            <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 left-0 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <ScanLine className="w-12 h-12 text-slate-600 mb-2" />
            <p className="text-[11px] text-slate-400">
              Arahkan alat barcode scanner fisik atau ketik kode tag aset di bawah ini.
            </p>
          </div>

          {/* Input field */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              Input Barcode / Nomor Seri / Kode Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Contoh: AST-FAC-2024-001..."
                autoFocus
                className="flex-1 font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
              />
              <button
                onClick={() => handleSearch(inputCode)}
                className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick presets for testing */}
          <div>
            <div className="text-[11px] text-slate-400 mb-1.5">
              Simulasi Cepat Kode Tag Contoh:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assets.slice(0, 4).map(a => (
                <button
                  key={a.id}
                  onClick={() => handleSimulateScan(a.assetCode)}
                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded text-[10px] font-mono transition-colors"
                >
                  {a.assetCode}
                </button>
              ))}
            </div>
          </div>

          {/* Match Result */}
          {searched && (
            <div className="pt-2">
              {matchedAsset ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aset Ditemukan!</span>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] text-emerald-800 font-semibold">{matchedAsset.assetCode}</div>
                    <div className="font-semibold text-slate-900 text-xs">{matchedAsset.name}</div>
                    <div className="text-[11px] text-slate-600">
                      Lokasi: {matchedAsset.location} · Status: <strong>{matchedAsset.status}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectAsset(matchedAsset);
                      onClose();
                    }}
                    className="w-full mt-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Lembar Detail Aset</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Tidak ada aset yang cocok dengan kode "{inputCode}".</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
