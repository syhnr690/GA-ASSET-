/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  OfficeAsset, 
  AssetLoan, 
  MaintenanceTask, 
  MaintenanceLog, 
  CompanySettings, 
  AssetCondition,
  AuthUser
} from './types/inventory';
import { 
  fetchServerData,
  syncDataToServer,
  resetAllData,
  getStoredAuthUser,
  setStoredAuthUser
} from './utils/storage';
import { 
  runAutomatedMaintenanceAudit, 
  formatDateIndonesian 
} from './utils/maintenanceEngine';
import { exportAssetsToCsv, exportLoansToCsv, exportMaintenanceTasksToCsv } from './utils/exportCsv';
import { sampleDemoAssets } from './data/seedData';

import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AssetRegisterView } from './components/AssetRegisterView';
import { LoanManagementView } from './components/LoanManagementView';
import { MaintenanceScheduleView } from './components/MaintenanceScheduleView';
import { AssetTagPrintModal } from './components/AssetTagPrintModal';
import { AssetFormModal } from './components/AssetFormModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { LoanModal } from './components/LoanModal';
import { ReturnModal } from './components/ReturnModal';
import { MaintenanceFormModal } from './components/MaintenanceFormModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  // Main Data States (Default clean slate for real work)
  const [assets, setAssets] = useState<OfficeAsset[]>([]);
  const [loans, setLoans] = useState<AssetLoan[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'PT Operasional Saya',
    officeLocation: 'Kantor Pusat',
    gaDivisionName: 'General Affairs & Facility Management',
    contactEmail: 's.syahnur1@gmail.com',
    contactPhone: '-',
    currency: 'IDR'
  });

  // Server Synchronization Status
  const [isServerSaving, setIsServerSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'loans' | 'maintenance' | 'tags'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Modals States
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OfficeAsset | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<OfficeAsset | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [preselectedLoanAsset, setPreselectedLoanAsset] = useState<OfficeAsset | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState<AssetLoan | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceModalMode, setMaintenanceModalMode] = useState<'create' | 'complete'>('create');
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState<MaintenanceTask | null>(null);
  const [preselectedMaintAsset, setPreselectedMaintAsset] = useState<OfficeAsset | null>(null);

  const [isTagPrintOpen, setIsTagPrintOpen] = useState(false);
  const [tagPrintAssetIds, setTagPrintAssetIds] = useState<string[]>([]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Helper toast notification
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Sync state to backend server
  const persistToServer = useCallback(async (
    newAssets = assets,
    newLoans = loans,
    newTasks = tasks,
    newLogs = logs,
    newSettings = settings
  ) => {
    setIsServerSaving(true);
    const result = await syncDataToServer({
      assets: newAssets,
      loans: newLoans,
      tasks: newTasks,
      logs: newLogs,
      settings: newSettings
    });
    setIsServerSaving(false);
    if (result.success) {
      setLastSavedAt(new Date().toLocaleTimeString('id-ID'));
    }
  }, [assets, loans, tasks, logs, settings]);

  // Load initial data from server on startup
  useEffect(() => {
    const init = async () => {
      const data = await fetchServerData();
      setAssets(data.assets);
      setLoans(data.loans);
      setTasks(data.tasks);
      setLogs(data.logs);
      setSettings(data.settings);

      if (data.fromServer) {
        setLastSavedAt(new Date().toLocaleTimeString('id-ID'));
      }

      // Check automated routine schedules if there are assets
      if (data.assets.length > 0) {
        const audit = runAutomatedMaintenanceAudit(data.assets, data.tasks);
        if (audit.newTasksGeneratedCount > 0) {
          setTasks(audit.updatedTasks);
          setAssets(audit.updatedAssets);
          persistToServer(audit.updatedAssets, data.loans, audit.updatedTasks, data.logs, data.settings);
          showToast(
            `Otomasi GA: ${audit.newTasksGeneratedCount} jadwal servis preventif baru terbit otomatis!`,
            'info'
          );
        }
      }
    };

    init();
  }, []);

  // Quantitative summaries
  const totalValuation = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const overdueLoansCount = loans.filter(l => l.status === 'Terlambat').length;
  const overdueTasksCount = tasks.filter(t => t.status === 'Terlambat' || t.status === 'Jatuh Tempo').length;

  // Handlers: Authentication
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    showToast(`Selamat datang, ${user.name}! Anda berhasil masuk.`);
  };

  const handleLogout = () => {
    setStoredAuthUser(null);
    setAuthUser(null);
    showToast('Anda telah keluar dari akun SIM-GA.', 'info');
  };

  // Handlers: Asset
  const handleSaveAsset = (assetToSave: OfficeAsset) => {
    let updated: OfficeAsset[];
    const exists = assets.some(a => a.id === assetToSave.id);
    if (exists) {
      updated = assets.map(a => (a.id === assetToSave.id ? assetToSave : a));
      showToast(`Data aset "${assetToSave.name}" berhasil disimpan di server.`);
    } else {
      updated = [assetToSave, ...assets];
      showToast(`Aset baru "${assetToSave.name}" (${assetToSave.assetCode}) tersimpan di server.`);
    }
    setAssets(updated);
    persistToServer(updated, loans, tasks, logs, settings);
    setIsAssetFormOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    const updated = assets.filter(a => a.id !== assetId);
    setAssets(updated);
    persistToServer(updated, loans, tasks, logs, settings);
    showToast(`Aset "${asset?.name || assetId}" telah dihapus.`);
  };

  // Handlers: Loan
  const handleSaveLoan = (newLoan: AssetLoan) => {
    const updatedLoans = [newLoan, ...loans];
    const updatedAssets = assets.map(a => 
      a.id === newLoan.assetId ? { ...a, status: 'Sedang Dipinjam' as const } : a
    );

    setLoans(updatedLoans);
    setAssets(updatedAssets);
    persistToServer(updatedAssets, updatedLoans, tasks, logs, settings);

    setIsLoanModalOpen(false);
    setPreselectedLoanAsset(null);
    showToast(`Peminjaman "${newLoan.assetName}" tersimpan di server.`);
  };

  const handleConfirmReturn = (
    loanId: string,
    assetId: string,
    returnDate: string,
    condition: AssetCondition,
    notes: string
  ) => {
    const updatedLoans = loans.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'Dikembalikan' as const,
          actualReturnDate: returnDate,
          returnCondition: condition,
          returnNotes: notes
        };
      }
      return l;
    });

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: condition === 'Dalam Perbaikan' ? ('Dalam Perawatan' as const) : ('Tersedia' as const),
          condition
        };
      }
      return a;
    });

    setLoans(updatedLoans);
    setAssets(updatedAssets);
    persistToServer(updatedAssets, updatedLoans, tasks, logs, settings);

    setIsReturnModalOpen(false);
    setSelectedReturnLoan(null);
    showToast(`Pengembalian barang diverifikasi dan tersimpan.`);
  };

  // Handlers: Maintenance
  const handleSaveMaintenanceTask = (newTask: MaintenanceTask) => {
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    persistToServer(assets, loans, updatedTasks, logs, settings);
    setIsMaintenanceModalOpen(false);
    setSelectedMaintenanceTask(null);
    showToast(`Work Order ${newTask.workOrderCode} tersimpan di server.`);
  };

  const handleCompleteMaintenanceTask = (
    taskId: string,
    assetId: string,
    actualCost: number,
    vendor: string,
    technician: string,
    description: string,
    nextDate: string
  ) => {
    const task = tasks.find(t => t.id === taskId);
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Update task
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Selesai' as const,
          completedDate: todayStr,
          actualCost,
          findings: description
        };
      }
      return t;
    });

    // 2. Add log
    const newLog: MaintenanceLog = {
      id: `log-${Date.now()}`,
      assetId,
      assetCode: task?.assetCode || '',
      assetName: task?.assetName || '',
      date: todayStr,
      workOrderCode: task?.workOrderCode || 'WO-MAINT',
      vendor,
      cost: actualCost,
      description,
      performedBy: technician,
      nextScheduleGenerated: nextDate
    };
    const updatedLogs = [newLog, ...logs];

    // 3. Update asset next schedule
    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Tersedia' as const,
          condition: 'Baik' as const,
          lastMaintenanceDate: todayStr,
          nextMaintenanceDate: nextDate,
          maintenanceVendor: vendor
        };
      }
      return a;
    });

    setTasks(updatedTasks);
    setLogs(updatedLogs);
    setAssets(updatedAssets);
    persistToServer(updatedAssets, loans, updatedTasks, updatedLogs, settings);

    setIsMaintenanceModalOpen(false);
    setSelectedMaintenanceTask(null);
    showToast(
      `Penyelesaian servis tersimpan di server. Jadwal berikutnya: ${formatDateIndonesian(nextDate)}.`,
      'success'
    );
  };

  // Handlers: Trigger Audit
  const handleTriggerAutoAudit = () => {
    if (assets.length === 0) {
      showToast('Belum ada aset terdaftar untuk diaudit jadwal perawatannya.', 'info');
      return;
    }
    const result = runAutomatedMaintenanceAudit(assets, tasks);
    setTasks(result.updatedTasks);
    setAssets(result.updatedAssets);
    persistToServer(result.updatedAssets, loans, result.updatedTasks, logs, settings);

    if (result.newTasksGeneratedCount > 0) {
      showToast(
        `Audit selesai: ${result.newTasksGeneratedCount} work order baru berhasil dibuat otomatis di server.`,
        'success'
      );
    } else {
      showToast('Audit selesai: Seluruh jadwal pemeliharaan up-to-date.', 'info');
    }
  };

  // Handlers: Clean Reset (Empty Database on Server and Client)
  const handleResetData = async () => {
    await resetAllData();
    setAssets([]);
    setLoans([]);
    setTasks([]);
    setLogs([]);
    showToast('Seluruh data telah dibersihkan. Server siap untuk input pekerjaan riil Anda.', 'info');
  };

  // Handlers: Save Company Settings
  const handleSaveSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    persistToServer(assets, loans, tasks, logs, newSettings);
    setIsSettingsOpen(false);
    showToast('Profil perusahaan & Bagian Umum berhasil diperbarui.');
  };

  // Handlers: Restore Database from JSON
  const handleRestoreDatabase = (restored: {
    assets: OfficeAsset[];
    loans: AssetLoan[];
    tasks: MaintenanceTask[];
    logs: MaintenanceLog[];
    settings: CompanySettings;
  }) => {
    setAssets(restored.assets);
    setLoans(restored.loans);
    setTasks(restored.tasks);
    setLogs(restored.logs);
    setSettings(restored.settings);
    showToast(`Database berhasil dipulihkan: ${restored.assets.length} aset terdata.`);
  };

  // Handlers: Export CSV
  const handleExportAll = () => {
    exportAssetsToCsv(assets);
    exportLoansToCsv(loans);
    exportMaintenanceTasksToCsv(tasks, logs);
    showToast('Laporan Inventaris, Peminjaman, dan Servis CSV berhasil diunduh.', 'success');
  };

  // Primary action button in Header
  const handlePrimaryAction = () => {
    if (activeTab === 'assets' || activeTab === 'dashboard') {
      setEditingAsset(null);
      setIsAssetFormOpen(true);
    } else if (activeTab === 'loans') {
      setPreselectedLoanAsset(null);
      setIsLoanModalOpen(true);
    } else if (activeTab === 'maintenance') {
      setMaintenanceModalMode('create');
      setSelectedMaintenanceTask(null);
      setPreselectedMaintAsset(null);
      setIsMaintenanceModalOpen(true);
    } else if (activeTab === 'tags') {
      setTagPrintAssetIds(assets.map(a => a.id));
      setIsTagPrintOpen(true);
    }
  };

  // If user is not authenticated, show the Login Page
  if (!authUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        totalAssetsCount={assets.length}
        totalValuation={totalValuation}
        overdueLoansCount={overdueLoansCount}
        overdueTasksCount={overdueTasksCount}
        onResetData={handleResetData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenScanner={() => setIsScannerOpen(true)}
          onPrimaryAction={handlePrimaryAction}
          totalAlerts={overdueLoansCount + overdueTasksCount}
          currentUser={authUser}
          isServerSaving={isServerSaving}
          lastSavedAt={lastSavedAt}
          onLogout={handleLogout}
        />

        {/* Dynamic Toast Notification */}
        {notification && (
          <div className="no-print fixed top-4 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* View Routing */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              assets={assets}
              loans={loans}
              maintenanceTasks={tasks}
              onNavigate={setActiveTab}
              onOpenNewAssetModal={() => {
                setEditingAsset(null);
                setIsAssetFormOpen(true);
              }}
              onOpenNewLoanModal={() => {
                setPreselectedLoanAsset(null);
                setIsLoanModalOpen(true);
              }}
              onOpenNewMaintenanceModal={() => {
                setMaintenanceModalMode('create');
                setSelectedMaintenanceTask(null);
                setPreselectedMaintAsset(null);
                setIsMaintenanceModalOpen(true);
              }}
              onOpenReturnModal={(loan) => {
                setSelectedReturnLoan(loan);
                setIsReturnModalOpen(true);
              }}
              onOpenCompleteTaskModal={(task) => {
                setMaintenanceModalMode('complete');
                setSelectedMaintenanceTask(task);
                setIsMaintenanceModalOpen(true);
              }}
              onTriggerAutoAudit={handleTriggerAutoAudit}
              onExportAll={handleExportAll}
            />
          )}

          {activeTab === 'assets' && (
            <AssetRegisterView
              assets={assets}
              searchQuery={searchQuery}
              onOpenNewAssetModal={() => {
                setEditingAsset(null);
                setIsAssetFormOpen(true);
              }}
              onOpenEditAssetModal={(asset) => {
                setEditingAsset(asset);
                setIsAssetFormOpen(true);
              }}
              onOpenDetailModal={(asset) => {
                setDetailAsset(asset);
                setIsDetailModalOpen(true);
              }}
              onOpenLoanModal={(asset) => {
                setPreselectedLoanAsset(asset);
                setIsLoanModalOpen(true);
              }}
              onOpenPrintTags={(ids) => {
                setTagPrintAssetIds(ids || []);
                setIsTagPrintOpen(true);
              }}
              onOpenNewMaintenanceModal={(asset) => {
                setMaintenanceModalMode('create');
                setSelectedMaintenanceTask(null);
                setPreselectedMaintAsset(asset || null);
                setIsMaintenanceModalOpen(true);
              }}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {activeTab === 'loans' && (
            <LoanManagementView
              loans={loans}
              assets={assets}
              searchQuery={searchQuery}
              onOpenNewLoanModal={() => {
                setPreselectedLoanAsset(null);
                setIsLoanModalOpen(true);
              }}
              onOpenReturnModal={(loan) => {
                setSelectedReturnLoan(loan);
                setIsReturnModalOpen(true);
              }}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceScheduleView
              tasks={tasks}
              logs={logs}
              assets={assets}
              searchQuery={searchQuery}
              onOpenNewTaskModal={(asset) => {
                setMaintenanceModalMode('create');
                setSelectedMaintenanceTask(null);
                setPreselectedMaintAsset(asset || null);
                setIsMaintenanceModalOpen(true);
              }}
              onOpenCompleteTaskModal={(task) => {
                setMaintenanceModalMode('complete');
                setSelectedMaintenanceTask(task);
                setIsMaintenanceModalOpen(true);
              }}
              onTriggerAutoAudit={handleTriggerAutoAudit}
            />
          )}

          {activeTab === 'tags' && (
            <div className="p-8 max-w-7xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Cetak Stiker Label Barcode & QR Code Aset
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Label resmi inventaris General Affairs dengan kode QR scannable untuk audit fisik.
                  </p>
                </div>
                {assets.length > 0 && (
                  <button
                    onClick={() => {
                      setTagPrintAssetIds(assets.map(a => a.id));
                      setIsTagPrintOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                  >
                    Buka Dialog Cetak Seluruh Aset ({assets.length} Unit)
                  </button>
                )}
              </div>

              {assets.length === 0 ? (
                <div className="p-12 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  Belum ada aset terdaftar. Tambahkan aset terlebih dahulu untuk membuat label stiker QR.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {assets.map(a => (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-slate-900">{a.assetCode}</div>
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">{a.name}</div>
                        <div className="text-[11px] text-slate-500">{a.location}</div>
                      </div>
                      <button
                        onClick={() => {
                          setTagPrintAssetIds([a.id]);
                          setIsTagPrintOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
                      >
                        Cetak Tag
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}

      {/* 1. Asset Form Modal (Add/Edit) */}
      {isAssetFormOpen && (
        <AssetFormModal
          initialAsset={editingAsset}
          existingCount={assets.length}
          onSave={handleSaveAsset}
          onClose={() => {
            setIsAssetFormOpen(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* 2. Asset Detail Drawer */}
      {isDetailModalOpen && detailAsset && (
        <AssetDetailModal
          asset={detailAsset}
          loans={loans}
          maintenanceTasks={tasks}
          maintenanceLogs={logs}
          settings={settings}
          onEdit={(asset) => {
            setIsDetailModalOpen(false);
            setEditingAsset(asset);
            setIsAssetFormOpen(true);
          }}
          onLoan={(asset) => {
            setIsDetailModalOpen(false);
            setPreselectedLoanAsset(asset);
            setIsLoanModalOpen(true);
          }}
          onMaintenance={(asset) => {
            setIsDetailModalOpen(false);
            setMaintenanceModalMode('create');
            setSelectedMaintenanceTask(null);
            setPreselectedMaintAsset(asset);
            setIsMaintenanceModalOpen(true);
          }}
          onPrintTag={(id) => {
            setTagPrintAssetIds([id]);
            setIsTagPrintOpen(true);
          }}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailAsset(null);
          }}
        />
      )}

      {/* 3. Loan Checkout Modal */}
      {isLoanModalOpen && (
        <LoanModal
          assets={assets}
          preselectedAsset={preselectedLoanAsset}
          existingLoansCount={loans.length}
          onSave={handleSaveLoan}
          onClose={() => {
            setIsLoanModalOpen(false);
            setPreselectedLoanAsset(null);
          }}
        />
      )}

      {/* 4. Loan Return Inspection Modal */}
      {isReturnModalOpen && selectedReturnLoan && (
        <ReturnModal
          loan={selectedReturnLoan}
          onConfirmReturn={handleConfirmReturn}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedReturnLoan(null);
          }}
        />
      )}

      {/* 5. Maintenance Form Modal (Create WO or Complete Service) */}
      {isMaintenanceModalOpen && (
        <MaintenanceFormModal
          mode={maintenanceModalMode}
          existingTask={selectedMaintenanceTask}
          preselectedAsset={preselectedMaintAsset}
          assets={assets}
          tasksCount={tasks.length}
          onSaveTask={handleSaveMaintenanceTask}
          onCompleteTask={handleCompleteMaintenanceTask}
          onClose={() => {
            setIsMaintenanceModalOpen(false);
            setSelectedMaintenanceTask(null);
            setPreselectedMaintAsset(null);
          }}
        />
      )}

      {/* 6. Tag Sticker Printer Modal */}
      {isTagPrintOpen && (
        <AssetTagPrintModal
          assets={assets}
          selectedIds={tagPrintAssetIds}
          settings={settings}
          onClose={() => {
            setIsTagPrintOpen(false);
            setTagPrintAssetIds([]);
          }}
        />
      )}

      {/* 7. Barcode Scanner Simulation Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          assets={assets}
          onSelectAsset={(asset) => {
            setDetailAsset(asset);
            setIsDetailModalOpen(true);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* 8. Company & GA Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          assets={assets}
          loans={loans}
          tasks={tasks}
          logs={logs}
          onSave={handleSaveSettings}
          onRestoreDatabase={handleRestoreDatabase}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
