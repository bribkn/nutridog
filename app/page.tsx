"use client";

import React, { useState } from "react";
import {
  Home,
  Heart,
  TrendingDown,
  Video,
  Cpu,
  Wifi,
  Battery,
  LogOut,
  Bell,
  Utensils
} from "lucide-react";

import LoginScreen from "@/components/LoginScreen";
import PetProfileForm, { PetProfile } from "@/components/PetProfileForm";
import HistoryCharts from "@/components/HistoryCharts";
import VetBooking from "@/components/VetBooking";
import FeederSimulator from "@/components/FeederSimulator";

interface FeedingLog {
  id: string;
  time: string;
  type: "scheduled" | "manual" | "eating";
  text: string;
  calories?: number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"inicio" | "calc" | "registro" | "vet" | "simulator">("inicio");
  
  // App States synced between Smartphone App and Physical Feeder Simulator
  const [hopperLevel, setHopperLevel] = useState(78); // percentage
  const [bowlWeight, setBowlWeight] = useState(0); // grams of food currently in bowl
  
  // Pet profile state initialized with default values from PDF context
  const [petProfile, setPetProfile] = useState<PetProfile>({
    name: "Lola",
    species: "dog",
    breed: "Golden Retriever",
    age: 6,
    weight: 14.5,
    isNeutered: true,
    activityLevel: "moderate",
    bcs: 8, // Overweight / Obese prone
    foodDensity: 3.5, // Kcal per gram
    mealsPerDay: 3,
  });

  const [merTarget, setMerTarget] = useState(512); // Daily Kcal Target
  const [kcalConsumed, setKcalConsumed] = useState(280); // Seeding breakfast and lunch
  
  // Feeding records list
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([
    {
      id: "log-1",
      time: "08:00 AM",
      type: "scheduled",
      text: "Ración programada desayuno (45g dispensados)",
    },
    {
      id: "log-2",
      time: "08:15 AM",
      type: "eating",
      text: "Lola comió ración completa de desayuno (45g)",
      calories: 158,
    },
    {
      id: "log-3",
      time: "02:00 PM",
      type: "scheduled",
      text: "Ración programada almuerzo (45g dispensados)",
    },
    {
      id: "log-4",
      time: "02:10 PM",
      type: "eating",
      text: "Lola comió ración parcial de almuerzo (35g)",
      calories: 122,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Trigger brief push-notification toast on mobile screen
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  // Keep target calories synced when pet profile changes
  const updateCalorieTarget = (profile: PetProfile) => {
    setPetProfile(profile);
    
    // Recalculate RER & MER inside dashboard
    const computedRer = 70 * Math.pow(profile.weight, 0.75);
    let factor = 1.0;
    if (profile.species === "dog") {
      if (profile.bcs >= 8) factor = 1.0;
      else if (profile.bcs >= 6) factor = 1.2;
      else if (profile.isNeutered) factor = 1.6;
      else factor = 1.8;
      
      if (profile.activityLevel === "sedentary") factor -= 0.25;
      else if (profile.activityLevel === "active") factor += 0.25;
      else if (profile.activityLevel === "working") factor += 0.8;
    } else {
      if (profile.bcs >= 8) factor = 0.8;
      else if (profile.bcs >= 6) factor = 1.0;
      else if (profile.isNeutered) factor = 1.2;
      else factor = 1.4;
      
      if (profile.activityLevel === "sedentary") factor -= 0.15;
      else if (profile.activityLevel === "active") factor += 0.2;
    }
    const finalFactor = Math.max(profile.species === "cat" ? 0.6 : 0.8, factor);
    const computedMer = Math.round(computedRer * finalFactor);
    
    setMerTarget(computedMer);
    triggerNotification(`Perfil de ${profile.name} sincronizado. Nueva meta: ${computedMer} Kcal.`);
  };

  // Callback from physical simulator when motor dispenses kibble
  const handlePhysicalDispense = (grams: number) => {
    const newLogId = Date.now().toString();
    const nowStr = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Reduce Hopper Level (assuming 3.5kg capacity, 25g is roughly 0.7%)
    setHopperLevel((prev) => Math.max(0, Math.round(prev - (grams / 3500) * 100)));

    setFeedingLogs((prev) => [
      {
        id: newLogId,
        time: nowStr,
        type: "manual",
        text: `Alimento dispensado manualmente (${grams}g)`,
      },
      ...prev,
    ]);

    triggerNotification(`Dispensador: Ración de ${grams}g entregada exitosamente.`);
  };

  // Callback from physical simulator when scale detects pet ate
  const handlePhysicalEat = (grams: number) => {
    const newLogId = Date.now().toString();
    const nowStr = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const caloriesAdded = Math.round(grams * petProfile.foodDensity);
    setKcalConsumed((prev) => prev + caloriesAdded);

    setFeedingLogs((prev) => [
      {
        id: newLogId,
        time: nowStr,
        type: "eating",
        text: `${petProfile.name} comió ración de ${grams}g`,
        calories: caloriesAdded,
      },
      ...prev,
    ]);

    triggerNotification(`Sensores: ${petProfile.name} consumió ${grams}g (+${caloriesAdded} Kcal).`);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Ring progress percent
  const percentConsumed = Math.min(100, Math.round((kcalConsumed / merTarget) * 100));
  // Circle coordinates
  const radius = 52;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentConsumed / 100) * circumference;

  return (
    <div className="flex flex-col md:flex-row flex-1 items-center justify-center md:p-8 bg-zinc-50 dark:bg-zinc-950 font-sans md:gap-8 max-w-6xl mx-auto w-full min-h-screen md:min-h-0">
      {/* 1. SMARTPHONE SIMULATOR CONTAINER (Left Viewport) */}
      <div className="w-full md:max-w-[370px] md:shrink-0 h-screen md:h-auto">
        {/* Smartphone Shell with Bezel, Notch, and Status Bar (Bezel and height applied only on MD+ desktop) */}
        <div className="relative mx-auto bg-white dark:bg-zinc-900 h-screen md:h-[680px] w-full overflow-hidden flex flex-col shadow-none md:shadow-2xl md:border-[11px] md:border-zinc-900 md:dark:border-zinc-800 md:rounded-[48px]">
          {/* Speaker Notch - ONLY ON DESKTOP */}
          <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 h-[22px] w-[110px] bg-zinc-900 rounded-b-2xl z-50 items-center justify-center">
            <div className="w-8 h-1 bg-zinc-700 rounded-full"></div>
          </div>

          {/* Smartphone Status Bar - ONLY ON DESKTOP */}
          <div className="hidden md:flex h-10 bg-emerald-600 text-white justify-between items-center px-6 pt-3 text-[10px] font-bold z-40 select-none">
            <span>00:58 AM</span>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-white" />
              <span>5G</span>
              <Battery className="w-3.5 h-3.5 ml-1" />
              <span>92%</span>
            </div>
          </div>

          {/* Push Notification Banner */}
          {notification && (
            <div className="absolute top-11 inset-x-3.5 bg-zinc-900/95 dark:bg-zinc-950/95 border border-zinc-800 text-white rounded-2xl p-2.5 flex items-start gap-2.5 shadow-lg z-50 animate-slide-up text-[10px] leading-snug">
              <Bell className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-emerald-400">NutriDog Smart</span>
                <p className="text-zinc-300">{notification}</p>
              </div>
            </div>
          )}

          {/* Smartphone Mobile App Inner Content Router */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-zinc-950/50 pb-20 scrollbar-none relative">
            {/* INICIO TAB CONTENT */}
            {activeTab === "inicio" && (
              <div className="p-5 space-y-4 animate-fade-in">
                {/* Pet Header Badge */}
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-emerald-100 dark:bg-emerald-950/30 p-2 rounded-xl">
                      {petProfile.species === "dog" ? "🐶" : "🐱"}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                        {petProfile.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase">
                        {petProfile.breed}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="p-2 text-zinc-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title="Desconectar dispensador"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Calorie Ring Progress Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-2xl p-5 text-center flex flex-col items-center shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Calorías de Hoy
                  </span>
                  
                  <div className="relative flex items-center justify-center mb-2">
                    <svg width="120" height="120">
                      <circle
                        stroke="#e2e8f0"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        className="dark:stroke-zinc-800"
                      />
                      <circle
                        stroke="#10b981"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + " " + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        className="transition-all duration-500 -rotate-90 origin-[60px_60px]"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
                        {kcalConsumed}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        / {merTarget} Kcal
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-2">
                    {percentConsumed}% del objetivo de baja de peso
                  </p>
                </div>

                {/* Device Quick Status Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3.5 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Contenedor Tolva</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {hopperLevel}%
                    </p>
                    <span className="text-[8px] text-zinc-400">~{((3.5 * hopperLevel) / 100).toFixed(1)} Kg restantes</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3.5 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Próxima Toma</p>
                    <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                      08:00 PM
                    </p>
                    <span className="text-[8px] text-zinc-400">
                      Ración: {Math.round(merTarget / petProfile.foodDensity / petProfile.mealsPerDay)}g
                    </span>
                  </div>
                </div>

                {/* Obesity Alert */}
                {petProfile.bcs >= 7 && (
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3.5 text-xs text-rose-800 dark:text-rose-400 flex items-start gap-2.5">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <h4 className="font-bold">Plan de Reducción de Peso Activo</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                        El dispensador limitará las porciones según el cálculo MER ajustado para una baja de peso del 1-2% semanal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CALCULATOR TAB */}
            {activeTab === "calc" && (
              <div className="p-4 animate-fade-in">
                <PetProfileForm
                  initialProfile={petProfile}
                  onSaveProfile={updateCalorieTarget}
                />
              </div>
            )}

            {/* CHARTS / LOGS TAB */}
            {activeTab === "registro" && (
              <div className="p-4 space-y-4 animate-fade-in">
                <HistoryCharts />

                {/* Feeding Logs list */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Registro de Alimentación
                  </h4>
                  
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                    {feedingLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-start text-[10px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300">
                            {log.text}
                          </p>
                          <span className="text-zinc-400 font-mono">{log.time}</span>
                        </div>
                        {log.calories && (
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded text-[8px] shrink-0 ml-2">
                            +{log.calories} Kcal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VET BOOKING TAB */}
            {activeTab === "vet" && (
              <div className="p-4 animate-fade-in">
                <VetBooking />
              </div>
            )}

            {/* SIMULATOR SCREEN MOBILE ROUTE (for pure mobile viewports) */}
            {activeTab === "simulator" && (
              <div className="p-4 animate-fade-in md:hidden">
                <FeederSimulator
                  petName={petProfile.name}
                  hopperLevel={hopperLevel}
                  bowlWeight={bowlWeight}
                  setBowlWeight={setBowlWeight}
                  onDispense={handlePhysicalDispense}
                  onEat={handlePhysicalEat}
                />
              </div>
            )}
          </div>

          {/* Smartphone Bottom Navigation Bar */}
          <div className="absolute bottom-0 inset-x-0 h-[66px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-around px-2 z-40">
            <button
              onClick={() => setActiveTab("inicio")}
              className={`flex flex-col items-center gap-1 select-none transition-all ${
                activeTab === "inicio" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Home className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Inicio</span>
            </button>
            <button
              onClick={() => setActiveTab("calc")}
              className={`flex flex-col items-center gap-1 select-none transition-all ${
                activeTab === "calc" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Heart className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Calcular</span>
            </button>
            <button
              onClick={() => setActiveTab("registro")}
              className={`flex flex-col items-center gap-1 select-none transition-all ${
                activeTab === "registro" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <TrendingDown className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Progreso</span>
            </button>
            <button
              onClick={() => setActiveTab("vet")}
              className={`flex flex-col items-center gap-1 select-none transition-all ${
                activeTab === "vet" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Video className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Vet</span>
            </button>
            {/* Only displays Feeder Simulator icon on smaller screens to toggle the simulator view */}
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex flex-col items-center gap-1 select-none transition-all md:hidden ${
                activeTab === "simulator" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Cpu className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Simulador</span>
            </button>
          </div>

          {/* iOS-like Home Indicator bar - ONLY ON DESKTOP */}
          <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-400/60 rounded-full z-50"></div>
        </div>
      </div>

      {/* 2. PHYSICAL FEEDER SIMULATOR CONTAINER (Right Viewport, hidden on mobile layouts unless toggled) */}
      <div className="hidden md:block w-full max-w-[460px]">
        <FeederSimulator
          petName={petProfile.name}
          hopperLevel={hopperLevel}
          bowlWeight={bowlWeight}
          setBowlWeight={setBowlWeight}
          onDispense={handlePhysicalDispense}
          onEat={handlePhysicalEat}
        />
      </div>
    </div>
  );
}
