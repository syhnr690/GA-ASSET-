import React, { useState } from 'react';
import { Building2, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { AuthUser } from '../types/inventory';
import { setStoredAuthUser } from '../utils/storage';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [name, setName] = useState('');
  const [role, setRole] = useState('General Affairs Officer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const body = isRegisterMode
      ? { username: username.trim(), password, name: name.trim(), role: role.trim() }
      : { username: username.trim(), password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kendala saat memproses autentikasi.');
      }

      const user: AuthUser = {
        ...data.user,
        token: data.token
      };

      setStoredAuthUser(user);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setIsRegisterMode(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Card */}
        <div className="p-8 bg-slate-950 text-white border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            SIM-GA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sistem Informasi Manajemen Inventaris & Operasional General Affairs
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Database Server Aktif</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {isRegisterMode ? <UserPlus className="w-4 h-4 text-indigo-600" /> : <LogIn className="w-4 h-4 text-indigo-600" />}
              <span>{isRegisterMode ? 'Buat Akun Staf Baru' : 'Masuk dengan Username & Password'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegisterMode
                ? 'Daftarkan username dan nama untuk mengelola inventaris kantor.'
                : 'Silakan masukkan username dan kata sandi Anda.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau syahnur"
                  required
                  autoFocus
                  className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                />
              </div>
            </div>

            {/* Extra fields for Register mode */}
            {isRegisterMode && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: S. Syahnur"
                    required={isRegisterMode}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan / Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Koordinator General Affairs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs"
                  />
                </div>
              </>
            )}

            {/* Password Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi (Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 text-xs cursor-pointer"
            >
              <span>{isLoading ? 'Memproses...' : isRegisterMode ? 'Daftarkan Username & Mulai' : 'Masuk ke SIM-GA'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Click Login Buttons */}
          {!isRegisterMode && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">
                Pilih Akun Cepat (Langsung Masuk):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin')}
                  className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-left transition-all group"
                >
                  <div className="font-mono font-bold text-slate-900 group-hover:text-indigo-700 text-xs">admin</div>
                  <div className="text-[10px] text-slate-400">Pass: admin</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('syahnur', 'password123')}
                  className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-left transition-all group"
                >
                  <div className="font-mono font-bold text-slate-900 group-hover:text-indigo-700 text-xs">syahnur</div>
                  <div className="text-[10px] text-slate-400">Pass: password123</div>
                </button>
              </div>
            </div>
          )}

          {/* Switch Login / Register */}
          <div className="text-center text-xs text-slate-500 pt-1">
            {isRegisterMode ? (
              <span>
                Sudah punya username?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMessage(null);
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Masuk di sini
                </button>
              </span>
            ) : (
              <span>
                Mau buat username baru?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMessage(null);
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Daftar di sini
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
