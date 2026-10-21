import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  FileSpreadsheet, 
  Calendar, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  Info
} from 'lucide-react';
import { MaintenanceTask, MaintenanceLog, OfficeAsset } from '../types/inventory';
import { formatCurrencyIDR, formatDateIndonesian, getDaysDifference } from '../utils/maintenanceEngine';
import { exportMaintenanceTasksToCsv } from '../utils/exportCsv';

interface MaintenanceScheduleViewProps {
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  assets: OfficeAsset[];
  searchQuery: string;
  onOpenNewTaskModal: (preselectedAsset?: OfficeAsset) => void;
  onOpenCompleteTaskModal: (task: MaintenanceTask) => void;
  onTriggerAutoAudit: () => void;
}

export const MaintenanceScheduleView: React.FC<MaintenanceScheduleViewProps> = ({
  tasks,
  logs,
  assets,
  searchQuery,
  onOpenNewTaskModal,
  onOpenCompleteTaskModal,
  onTriggerAutoAudit
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'rules'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const pendingTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'Selesai');
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'Selesai');
  }, [tasks]);

  const filteredPending = useMemo(() => {
    return pendingTasks.filter(task => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          task.workOrderCode.toLowerCase().includes(q) ||
          task.assetCode.toLowerCase().includes(q) ||
          task.assetName.toLowerCase().includes(q) ||
          task.location.toLowerCase().includes(q) ||
          task.technicianOrVendor.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [pendingTasks, searchQuery, priorityFilter]);

  const overdueCount = pendingTasks.filter(t => t.status === 'Terlambat').length;
  const dueTodayCount = pendingTasks.filter(t => t.status === 'Jatuh Tempo').length;
  const routineAssetsCount = assets.filter(a => a.hasRoutineMaintenance).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Otomasi Jadwal & Pemeliharaan Rutin GA
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem penjadwalan preventif otomatis untuk fasilitas gedung, genset, AC, armada mobil, dan alat K3.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTriggerAutoAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded-lg border border-indigo-200 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audit & Sinkronisasi Jadwal</span>
          </button>

          <button
            onClick={() => exportMaintenanceTasksToCsv(tasks, logs)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh Jadwal CSV</span>
          </button>

          <button
            onClick={() => onOpenNewTaskModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Perintah Kerja (WO)</span>
          </button>
        </div>
      </div>

      {/* Engine Status Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Engine Otomasi Perawatan GA Aktif
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-[11px] text-indigo-300">
                {routineAssetsCount} Aset Terhubung Siklus Rutin
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Setiap kali pengerjaan servis diselesaikan, sistem menghitung otomatis tanggal servis berikutnya (Next Due Date) tanpa perlu input manual berulang.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0 font-mono">
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase">Terlambat</div>
            <div className="text-rose-400 font-bold text-sm">{overdueCount}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase">Jatuh Tempo</div>
            <div className="text-amber-400 font-bold text-sm">{dueTodayCount}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase">Total Antrian</div>
            <div className="text-white font-bold text-sm">{pendingTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrian Work Orders ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Servis & Log Vendor ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'rules'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriks Standar Siklus Servis GA
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Prioritas:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Semua Prioritas</option>
              <option value="Tinggi">Tinggi / Mendesak</option>
              <option value="Normal">Normal</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: PENDING WORK ORDERS */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {filteredPending.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">Tidak ada antrian perintah kerja</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Semua fasilitas dan aset kantor dalam status pemeliharaan terkini. Sistem akan otomatis memunculkan jadwal saat siklus mendekati tempo.
              </p>
            </div>
          ) : (
            filteredPending.map(task => {
              const daysDiff = getDaysDifference(task.scheduledDate);
              const isOverdue = task.status === 'Terlambat' || daysDiff < 0;
              const isDueToday = task.status === 'Jatuh Tempo' || daysDiff === 0;

              return (
                <div 
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Task Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-medium text-slate-500">{task.workOrderCode}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-700 font-medium">{task.taskType}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500">{task.frequency}</span>
                        {task.isAutoGenerated && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="text-indigo-600 font-medium">Otomatisasi Sistem</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {task.assetName}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">({task.assetCode})</span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>Lokasi: {task.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>Vendor/Teknisi: <strong className="text-slate-700">{task.technicianOrVendor}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Est. Biaya: <strong className="font-mono text-slate-700">{formatCurrencyIDR(task.estimatedCost)}</strong></span>
                      </div>

                      {/* Checklist items */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                          Item Pekerjaan / Checklist SOP:
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                          {task.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Date Status & Action */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="text-xs font-mono font-medium">
                          {formatDateIndonesian(task.scheduledDate)}
                        </div>
                        <div className="text-xs font-medium mt-0.5">
                          {isOverdue ? (
                            <span className="text-rose-600">
                              Terlambat ({Math.abs(daysDiff)} hari)
                            </span>
                          ) : isDueToday ? (
                            <span className="text-amber-600">Jatuh Tempo Hari Ini</span>
                          ) : (
                            <span className="text-slate-500">
                              Dalam {daysDiff} hari ke depan
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCompleteTaskModal(task)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        Catat Servis Selesai
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED LOGS & VENDOR HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 select-none">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Tanggal & Kode WO</th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Aset Kantor</th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Vendor & Pelaksana</th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Rincian Pengerjaan</th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-slate-600 text-right">Biaya (IDR)</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-slate-600">Siklus Berikutnya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Belum ada riwayat pengerjaan pemeliharaan yang tercatat.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-900 font-medium">
                          {formatDateIndonesian(log.date)}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {log.workOrderCode}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {log.assetName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {log.assetCode}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{log.vendor}</div>
                        <div className="text-[11px] text-slate-400">PIC: {log.performedBy}</div>
                      </td>

                      <td className="py-3 px-3 max-w-sm">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {log.description}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        {formatCurrencyIDR(log.cost)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-emerald-700 font-medium">Terjadwal Otomatis</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {formatDateIndonesian(log.nextScheduleGenerated)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GA SOP & ROUTINE FREQUENCY RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Standar Operasional Prosedur (SOP) Perawatan Berkala GA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameter siklus perawatan pencegahan (Preventive Maintenance) yang dijalankan otomatis oleh sistem:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">AC & Pendingin Ruangan</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 3 Bulan (Triwulan)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pencucian evaporator indoor, pembersihan kondensor outdoor, pengecekan tekanan freon R32/R410A, serta pembersihan saluran pembuangan air kondensat.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Genset & Catu Daya Darurat</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 1 Bulan (Bulanan)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pemanasan mesin tanpa beban (running test), pengujian tegangan aki starter 24V, pengecekan volume bahan bakar Solar Dex dan level oli mesin 15W-40.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Kendaraan Operasional & Dinas</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 3 Bulan / 5.000 KM</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Penggantian oli mesin sintetis dan filter oli, pemeriksaan kampas rem & minyak rem, rotasi ban, serta pemeriksaan kelistrikan dan lampu sinyal.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Tabung APAR & Peralatan K3</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 6 Bulan (Semesteran)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Inspeksi jarum penunjuk tekanan pada zona hijau, pengocokan tabung agar serbuk kimia tidak membeku, pengecekan segel pin pengaman dan pembaruan kartu kontrol.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Peralatan Pantry & Dispenser Air</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 1 - 2 Bulan</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Descaling kerak kapur elemen pemanas dengan asam sitrat food grade, sanitasi tangki air minum, pembersihan tray penampung tetesan, dan penggantian filter galon.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">IT Hardware & Laptop Pool</span>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Tiap 6 Bulan (Semesteran)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pembersihan debu heatsink dan kipas pendingin, pembaruan thermal paste prosesor, uji kapasitas baterai, pembersihan keyboard dan sterilisasi unit.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
