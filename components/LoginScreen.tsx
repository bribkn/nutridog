"use client";

import React, { useState } from "react";
import { Shield, Key, Eye, EyeOff, Sparkles, Smartphone, Settings } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    
    // Simulate a brief hardware/network auth verification
    setTimeout(() => {
      setIsLoading(false);
      const isCorrectPassword = password === "feedlypet2026" || password === "nutridog2026";
      if (username.toLowerCase() === "admin" && isCorrectPassword) {
        onLoginSuccess();
      } else {
        setError("Credenciales incorrectas. Revisa el sticker de tu dispensador.");
      }
    }, 800);
  };

  const handleAutofill = () => {
    setUsername("admin");
    setPassword("feedlypet2026");
    setError("");
    setIsStickerOpen(false);
  };

  return (
    <div className="flex flex-col flex-1 justify-between p-6 bg-gradient-to-b from-orange-50/50 via-white to-orange-50/10 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900 h-full w-full">
      {/* Top Header branding */}
      <div className="flex flex-col items-center pt-8 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 animate-bounce-subtle">
          <Settings className="w-8 h-8 text-white stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Feedly<span className="text-orange-500"> Pet</span>
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest font-semibold">
          Smart Dispenser Control
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm mx-auto my-auto bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-100 dark:border-stone-850 rounded-3xl p-6 shadow-xl shadow-stone-100/30 dark:shadow-none">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Ingresa las credenciales de fábrica de tu dispositivo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Usuario de Fábrica
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <Shield className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 transition-all text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 transition-all text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 dark:text-rose-450 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-medium rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sincronizar Dispositivo"
            )}
          </button>
        </form>

        {/* Virtual sticker drawer trigger */}
        <div className="mt-6 pt-5 border-t border-stone-150 dark:border-stone-800 text-center relative z-10">
          <button
            type="button"
            onClick={() => setIsStickerOpen(!isStickerOpen)}
            className="inline-flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-bold hover:underline bg-orange-50 dark:bg-orange-950/30 px-6 py-3 rounded-2xl border border-orange-100 dark:border-orange-900/50 transition-all w-full active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            ¿Dónde encuentro las credenciales?
          </button>
        </div>
      </div>

      {/* Simulated sticker overlay drawer */}
      {isStickerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setIsStickerOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-semibold"
            >
              Cerrar
            </button>

            <h3 className="text-base font-bold text-stone-900 dark:text-stone-50 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Sticker de Fábrica
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
              Las credenciales por defecto se encuentran en un sticker adhesivo pegado en la base física del dispensador.
            </p>

            {/* Sticker graphic representation */}
            <div className="bg-amber-50 dark:bg-amber-950/15 border-2 border-dashed border-amber-300 dark:border-amber-800/40 rounded-2xl p-4 font-mono text-stone-800 dark:text-stone-300 text-xs shadow-inner">
              <div className="text-center font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest text-[10px] mb-2 border-b border-amber-200 dark:border-amber-800/40 pb-1.5">
                ✦ FEEDLY PET DISPENSER TECH ✦
              </div>
              <div className="space-y-1">
                <p><span className="text-stone-400">MODELO:</span> FP-2000-SMART</p>
                <p><span className="text-stone-400">S/N:</span> 482910-CH</p>
                <p><span className="text-stone-400">WIFI:</span> FeedlyPet_Dispenser_4829</p>
                <div className="h-px bg-amber-200 dark:bg-amber-800/40 my-2"></div>
                <p className="font-bold text-orange-800 dark:text-orange-400 flex justify-between">
                  <span>USER:</span> <span className="bg-orange-100 dark:bg-orange-950 px-1 rounded">admin</span>
                </p>
                <p className="font-bold text-orange-800 dark:text-orange-400 flex justify-between">
                  <span>PASSWORD:</span> <span className="bg-orange-100 dark:bg-orange-950 px-1 rounded">feedlypet2026</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleAutofill}
              className="w-full mt-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Autorellenar Credenciales
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
