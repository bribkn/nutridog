"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Heart,
  TrendingDown,
  Video,
  Cpu,
  Wifi,
  Battery,
  Bell,
  Utensils,
  Plus,
  Smartphone,
  Share,
  Sparkles
} from "lucide-react";

import LoginScreen from "@/components/LoginScreen";
import PetProfileForm, { PetProfile } from "@/components/PetProfileForm";
import HistoryCharts from "@/components/HistoryCharts";
import VetBooking from "@/components/VetBooking";
import FeederSimulator from "@/components/FeederSimulator";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Dispenser {
  id: string;
  name: string;
  hopperLevel: number;
  bowlWeight: number;
  linkedPetId: string;
}

interface FeedingLog {
  id: string;
  petId: string;
  dispenserId: string;
  time: string;
  text: string;
  calories?: number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"inicio" | "calc" | "registro" | "vet" | "simulator">("inicio");
  
  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Seeding multiple pets (Dogs & Cats)
  const [pets, setPets] = useState<PetProfile[]>([
    {
      name: "Lola",
      species: "dog",
      breed: "Golden Retriever",
      age: 6,
      weight: 14.5,
      isNeutered: true,
      activityLevel: "moderate",
      bcs: 8, // Overweight
      foodDensity: 3.5,
      mealsPerDay: 3,
    },
    {
      name: "Felix",
      species: "cat",
      breed: "Siamés",
      age: 4,
      weight: 5.2,
      isNeutered: true,
      activityLevel: "moderate",
      bcs: 7, // Heavy cat
      foodDensity: 3.1,
      mealsPerDay: 2,
    },
    {
      name: "Rocky",
      species: "dog",
      breed: "Beagle",
      age: 3,
      weight: 9.8,
      isNeutered: false,
      activityLevel: "active",
      bcs: 5, // Ideal Condition
      foodDensity: 4.0,
      mealsPerDay: 3,
    }
  ]);

  const [selectedPetId, setSelectedPetId] = useState<string>("Lola");

  // Seeding multiple physical dispensers
  const [dispensers, setDispensers] = useState<Dispenser[]>([
    {
      id: "dispenser-1",
      name: "Comedor Principal (Cocina)",
      hopperLevel: 78,
      bowlWeight: 0,
      linkedPetId: "Lola",
    },
    {
      id: "dispenser-2",
      name: "Comedor Terraza (Galería)",
      hopperLevel: 92,
      bowlWeight: 0,
      linkedPetId: "Felix",
    }
  ]);

  const [selectedDispenserId, setSelectedDispenserId] = useState<string>("dispenser-1");

  // Seeding individual calorie consumed logs
  const [kcalProgress, setKcalProgress] = useState<Record<string, number>>({
    Lola: 280,
    Felix: 140,
    Rocky: 0,
  });

  // Feeding logs grouped
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([
    {
      id: "log-1",
      petId: "Lola",
      dispenserId: "dispenser-1",
      time: "08:00 AM",
      text: "Ración programada desayuno (45g dispensados en Comedor Cocina)",
    },
    {
      id: "log-2",
      petId: "Lola",
      dispenserId: "dispenser-1",
      time: "08:15 AM",
      text: "Lola comió ración completa de desayuno (45g)",
      calories: 158,
    },
    {
      id: "log-3",
      petId: "Felix",
      dispenserId: "dispenser-2",
      time: "09:00 AM",
      text: "Ración programada desayuno (25g dispensados en Comedor Terraza)",
    },
    {
      id: "log-4",
      petId: "Felix",
      dispenserId: "dispenser-2",
      time: "09:12 AM",
      text: "Felix comió ración parcial de desayuno (25g)",
      calories: 78,
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Detect PWA Installation status and systems
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);

    // Detect iOS devices that are not already launched in PWA standalone window mode
    const isIosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = (navigator as Navigator & { standalone?: boolean }).standalone || window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIosDevice && !isStandalone) {
      setTimeout(() => setShowIosPrompt(true), 150);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      triggerNotification("¡Gracias por instalar NutriDog!");
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Switcher configurations
  const activePet = pets.find((p) => p.name === selectedPetId) || pets[0];
  const activeDispenser = dispensers.find((d) => d.id === selectedDispenserId) || dispensers[0];

  // Helper setter to update bowlWeight of the selected dispenser directly from simulator actions
  const setBowlWeight = (weightOrFn: React.SetStateAction<number>) => {
    setDispensers((prev) =>
      prev.map((disp) => {
        if (disp.id === selectedDispenserId) {
          const nextWeight = typeof weightOrFn === "function" ? weightOrFn(disp.bowlWeight) : weightOrFn;
          return { ...disp, bowlWeight: nextWeight };
        }
        return disp;
      })
    );
  };

  // Sync pet profile formula updates
  const updatePetProfile = (updatedProfile: PetProfile) => {
    setPets((prev) =>
      prev.map((p) => (p.name === selectedPetId ? updatedProfile : p))
    );
    triggerNotification(`Perfil de ${updatedProfile.name} actualizado y sincronizado.`);
  };

  // RER / MER calculations for active pet ring progress
  const getMerTarget = (profile: PetProfile) => {
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
    return Math.round(computedRer * finalFactor);
  };

  const activeMerTarget = getMerTarget(activePet);
  const activeConsumed = kcalProgress[activePet.name] || 0;
  const percentConsumed = Math.min(100, Math.round((activeConsumed / activeMerTarget) * 100));

  // Circle drawing calculations
  const radius = 52;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentConsumed / 100) * circumference;

  // Simulator dispense triggers
  const handlePhysicalDispense = (grams: number) => {
    const nowStr = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Reduce Hopper Level of active dispenser
    setDispensers((prev) =>
      prev.map((d) => {
        if (d.id === selectedDispenserId) {
          return {
            ...d,
            hopperLevel: Math.max(0, Math.round(d.hopperLevel - (grams / 3500) * 100)),
          };
        }
        return d;
      })
    );

    // Find linked pet name of dispenser
    const linkedPetName = activeDispenser.linkedPetId;

    // Log the dispense trigger
    setFeedingLogs((prev) => [
      {
        id: Date.now().toString(),
        petId: linkedPetName,
        dispenserId: selectedDispenserId,
        time: nowStr,
        text: `Alimento dispensado (${grams}g) en ${activeDispenser.name}`,
      },
      ...prev,
    ]);

    triggerNotification(`Dispensador: ${grams}g de ración servidos en ${activeDispenser.name}.`);
  };

  // Simulator eat triggers
  const handlePhysicalEat = (grams: number) => {
    const nowStr = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const linkedPetName = activeDispenser.linkedPetId;
    const petDetail = pets.find((p) => p.name === linkedPetName) || activePet;
    const caloriesAdded = Math.round(grams * petDetail.foodDensity);

    // Increase consumed calories of linked pet
    setKcalProgress((prev) => ({
      ...prev,
      [linkedPetName]: (prev[linkedPetName] || 0) + caloriesAdded,
    }));

    // Log the consumption
    setFeedingLogs((prev) => [
      {
        id: Date.now().toString(),
        petId: linkedPetName,
        dispenserId: selectedDispenserId,
        time: nowStr,
        text: `${linkedPetName} comió ración de ${grams}g en ${activeDispenser.name}`,
        calories: caloriesAdded,
      },
      ...prev,
    ]);

    triggerNotification(`Sensores: ${linkedPetName} consumió ${grams}g (+${caloriesAdded} Kcal).`);
  };

  const addNewPet = () => {
    const nameInput = prompt("Introduce el nombre de la nueva mascota:");
    if (!nameInput) return;
    
    if (pets.some((p) => p.name.toLowerCase() === nameInput.toLowerCase())) {
      alert("Ya existe una mascota con ese nombre.");
      return;
    }

    const newPetObj: PetProfile = {
      name: nameInput,
      species: "dog",
      breed: "Mestizo",
      age: 2,
      weight: 10,
      isNeutered: true,
      activityLevel: "moderate",
      bcs: 5,
      foodDensity: 3.5,
      mealsPerDay: 3,
    };

    setPets((prev) => [...prev, newPetObj]);
    setKcalProgress((prev) => ({ ...prev, [nameInput]: 0 }));
    setSelectedPetId(nameInput);
    triggerNotification(`Mascota "${nameInput}" añadida con éxito.`);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Filter logs for selected pet
  const activePetLogs = feedingLogs.filter((log) => log.petId === activePet.name);

  return (
    <div className="flex flex-col md:flex-row flex-1 items-center justify-center md:p-8 bg-zinc-50 dark:bg-zinc-950 font-sans md:gap-8 max-w-6xl mx-auto w-full min-h-screen md:min-h-0">
      
      {/* PWA iOS Install popup instructions overlay */}
      {showIosPrompt && (
        <div className="fixed top-4 inset-x-4 bg-zinc-900 text-white rounded-3xl p-5 border border-zinc-800 shadow-2xl z-50 animate-slide-up flex items-start gap-4 text-xs leading-relaxed max-w-md mx-auto">
          <Smartphone className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
          <div className="flex-1 space-y-1">
            <h4 className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Instala NutriDog en tu iPhone
            </h4>
            <p className="text-zinc-300">
              Para una experiencia mobile nativa, abre este menú en Safari, pulsa el botón{" "}
              <span className="font-extrabold text-white flex items-center gap-0.5 inline-flex bg-zinc-800 px-1 rounded"><Share className="w-3 h-3 text-emerald-400" /> Compartir</span> de tu navegador y selecciona 
              <span className="font-extrabold text-white"> &quot;Agregar al inicio&quot;</span>.
            </p>
          </div>
          <button
            onClick={() => setShowIosPrompt(false)}
            className="text-zinc-500 hover:text-zinc-300 font-extrabold text-sm px-1"
          >
            ✕
          </button>
        </div>
      )}

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
            <div className="absolute top-4 md:top-11 inset-x-3.5 bg-zinc-900/95 dark:bg-zinc-950/95 border border-zinc-800 text-white rounded-2xl p-2.5 flex items-start gap-2.5 shadow-lg z-50 animate-slide-up text-[10px] leading-snug">
              <Bell className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-emerald-400">NutriDog Smart</span>
                <p className="text-zinc-300">{notification}</p>
              </div>
            </div>
          )}

          {/* Smartphone Mobile App Inner Content Router */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-zinc-950/50 pb-20 scrollbar-none relative">
            
            {/* PWA Chrome/Android Install Banner (Visible in Inicio tab if install prompt available) */}
            {isInstallable && activeTab === "inicio" && (
              <div className="mx-4 mt-4 p-3 bg-emerald-600 text-white rounded-2xl flex items-center justify-between shadow-md shadow-emerald-600/10 text-xs animate-fade-in relative z-20">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-100" />
                  <div>
                    <h4 className="font-bold">¿Instalar Aplicación?</h4>
                    <p className="text-[9px] text-emerald-100">Disfruta de NutriDog sin barras de navegación.</p>
                  </div>
                </div>
                <button
                  onClick={handleInstallPwa}
                  className="bg-white text-emerald-700 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-50 text-[10px] active:scale-95 transition-all"
                >
                  Instalar
                </button>
              </div>
            )}

            {/* INICIO TAB CONTENT */}
            {activeTab === "inicio" && (
              <div className="p-5 space-y-4 animate-fade-in">
                
                {/* 1. Multi-Pet Horizontal Switcher */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span>Mascotas</span>
                    <button
                      type="button"
                      onClick={addNewPet}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[9px]"
                    >
                      <Plus className="w-3 h-3" /> Añadir
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {pets.map((p) => {
                      const isSelected = p.name === selectedPetId;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setSelectedPetId(p.name)}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border text-xs font-bold transition-all shrink-0 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500"
                          }`}
                        >
                          <span>{p.species === "dog" ? "🐶" : "🐱"}</span>
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Multi-Dispenser Selector */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Dispensador Activo
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {dispensers.map((d) => {
                      const isSelected = d.id === selectedDispenserId;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDispenserId(d.id)}
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-600 text-white"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50"
                          }`}
                        >
                          <span className={isSelected ? "text-emerald-200" : "text-emerald-600"}>🔌</span>
                          <span>{d.name.split(" ")[0] + " " + d.name.split(" ")[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Pet Header Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-emerald-100 dark:bg-emerald-950/30 p-2 rounded-xl">
                      {activePet.species === "dog" ? "🐶" : "🐱"}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-1">
                        {activePet.name}
                        <span className="text-[9px] font-bold text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                          {activePet.weight} Kg
                        </span>
                      </h3>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase">
                        {activePet.breed} • {activePet.age} años
                      </p>
                    </div>
                  </div>
                  
                  {/* Linked status tag */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                      Vinculado
                    </span>
                    <span className="text-[7px] text-zinc-400 font-semibold mt-1">
                      {dispensers.find((d) => d.linkedPetId === activePet.name)?.name.split(" ")[0] || "Sin Dispenser"}
                    </span>
                  </div>
                </div>

                {/* Calorie Ring Progress Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 rounded-2xl p-5 text-center flex flex-col items-center shadow-sm">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Calorías de {activePet.name}
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
                        {activeConsumed}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        / {activeMerTarget} Kcal
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
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Tolva ({activeDispenser.name.split(" ")[0]})</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {activeDispenser.hopperLevel}%
                    </p>
                    <span className="text-[8px] text-zinc-400">~{((3.5 * activeDispenser.hopperLevel) / 100).toFixed(1)} Kg restantes</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-3.5 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Próxima Toma</p>
                    <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
                      08:00 PM
                    </p>
                    <span className="text-[8px] text-zinc-400 font-semibold text-emerald-600">
                      Ración: {Math.round(activeMerTarget / activePet.foodDensity / activePet.mealsPerDay)}g
                    </span>
                  </div>
                </div>

                {/* Obesity Alert */}
                {activePet.bcs >= 7 && (
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3.5 text-xs text-rose-800 dark:text-rose-400 flex items-start gap-2.5">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <h4 className="font-bold">Plan de Reducción de Peso Activo</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                        El dispensador limitará las porciones de {activePet.name} para lograr una baja del 1% semanal.
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
                  key={activePet.name}
                  initialProfile={activePet}
                  onSaveProfile={updatePetProfile}
                />
              </div>
            )}

            {/* CHARTS / LOGS TAB */}
            {activeTab === "registro" && (
              <div className="p-4 space-y-4 animate-fade-in">
                <HistoryCharts />

                {/* Feeding Logs list for active pet */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Registro de {activePet.name}
                  </h4>
                  
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                    {activePetLogs.length === 0 ? (
                      <p className="text-xs text-zinc-450 dark:text-zinc-500 text-center py-6">
                        No hay tomas registradas hoy para {activePet.name}.
                      </p>
                    ) : (
                      activePetLogs.map((log) => (
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
                      ))
                    )}
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
                  petName={pets.find((p) => p.name === activeDispenser.linkedPetId)?.name || "Mascota"}
                  hopperLevel={activeDispenser.hopperLevel}
                  bowlWeight={activeDispenser.bowlWeight}
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
          petName={pets.find((p) => p.name === activeDispenser.linkedPetId)?.name || "Mascota"}
          hopperLevel={activeDispenser.hopperLevel}
          bowlWeight={activeDispenser.bowlWeight}
          setBowlWeight={setBowlWeight}
          onDispense={handlePhysicalDispense}
          onEat={handlePhysicalEat}
        />
      </div>
    </div>
  );
}
