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
  Sparkles,
  Clock,
  Trash2,
  Edit2,
  Check,
  ShieldAlert
} from "lucide-react";

import LoginScreen from "@/components/LoginScreen";
import PetProfileForm, { PetProfile } from "@/components/PetProfileForm";
import HistoryCharts, { WeightRecord } from "@/components/HistoryCharts";
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

interface MealScheduleItem {
  id: string;
  time: string; // e.g. "08:00 AM"
  grams: number;
  enabled: boolean;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"inicio" | "calc" | "registro" | "vet" | "simulator">("inicio");
  
  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Seeding multiple pets with weight histories, pathologies, and meals schedules
  const [pets, setPets] = useState<PetProfile[]>([
    {
      name: "Lola",
      species: "dog",
      breed: "Golden Retriever",
      age: 6,
      weight: 12.1,
      isNeutered: true,
      activityLevel: "moderate",
      bcs: 6,
      foodDensity: 3.1,
      mealsPerDay: 3,
      pathologies: ["obesidad"],
      foodType: "seca",
      foodBrand: "Royal Canin",
      foodProduct: "Satiety Support Weight Management (Perro)",
      weightHistory: [
        { date: "2026-03-01", weight: 14.5, bcs: 8 },
        { date: "2026-03-20", weight: 13.8, bcs: 8 },
        { date: "2026-04-10", weight: 13.2, bcs: 7 },
        { date: "2026-05-01", weight: 12.5, bcs: 6 },
        { date: "2026-05-25", weight: 12.1, bcs: 6 }
      ],
      mealsSchedule: [
        { id: "lola-m1", time: "08:00 AM", grams: 45, enabled: true },
        { id: "lola-m2", time: "02:00 PM", grams: 45, enabled: true },
        { id: "lola-m3", time: "08:00 PM", grams: 50, enabled: true }
      ]
    },
    {
      name: "Felix",
      species: "cat",
      breed: "Siamés",
      age: 4,
      weight: 5.5,
      isNeutered: true,
      activityLevel: "moderate",
      bcs: 8,
      foodDensity: 3.8,
      mealsPerDay: 2,
      pathologies: ["obesidad", "estomago"],
      foodType: "seca",
      foodBrand: "Royal Canin",
      foodProduct: "Fit 32 Active Cat (Gato)",
      weightHistory: [
        { date: "2026-03-01", weight: 4.8, bcs: 6 },
        { date: "2026-04-15", weight: 5.2, bcs: 7 },
        { date: "2026-05-10", weight: 5.5, bcs: 8 } // Significant weight gain detected here!
      ],
      mealsSchedule: [
        { id: "felix-m1", time: "09:00 AM", grams: 25, enabled: true },
        { id: "felix-m2", time: "09:00 PM", grams: 25, enabled: true }
      ]
    },
    {
      name: "Rocky",
      species: "dog",
      breed: "Beagle",
      age: 3,
      weight: 9.8,
      isNeutered: false,
      activityLevel: "active",
      bcs: 5,
      foodDensity: 4.1,
      mealsPerDay: 3,
      pathologies: [],
      foodType: "seca",
      foodBrand: "Purina Pro Plan",
      foodProduct: "Active Mind Senior 7+ (Perro)",
      weightHistory: [
        { date: "2026-05-01", weight: 9.8, bcs: 5 }
      ],
      mealsSchedule: [
        { id: "rocky-m1", time: "07:30 AM", grams: 50, enabled: true },
        { id: "rocky-m2", time: "01:30 PM", grams: 50, enabled: true },
        { id: "rocky-m3", time: "07:30 PM", grams: 50, enabled: true }
      ]
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

  // Editable Schedule state
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState("");
  const [editingGrams, setEditingGrams] = useState(25);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4500);
  };

  // PWA detection hook
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);

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
      triggerNotification("¡Gracias por instalar Feedly Pet!");
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Fetch active pet and active dispenser
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

  // Sync pet profile updates
  const updatePetProfile = (updatedProfile: PetProfile) => {
    setPets((prev) =>
      prev.map((p) => (p.name === selectedPetId ? updatedProfile : p))
    );
    triggerNotification(`Perfil de ${updatedProfile.name} actualizado y sincronizado.`);
  };

  // Add weight record helper
  const handleAddWeightRecord = (record: WeightRecord) => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const newHistory = [...(p.weightHistory || []), record];
          const sorted = [...newHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const latestWeight = sorted[sorted.length - 1]?.weight || p.weight;
          const latestBcs = sorted[sorted.length - 1]?.bcs || p.bcs;
          return {
            ...p,
            weightHistory: newHistory,
            weight: latestWeight,
            bcs: latestBcs
          };
        }
        return p;
      })
    );
    triggerNotification(`Nuevo registro de peso guardado para ${selectedPetId}.`);
  };

  // Delete weight record helper
  const handleDeleteWeightRecord = (idxToDelete: number) => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const history = p.weightHistory || [];
          const newHistory = history.filter((_, i) => i !== idxToDelete);
          let latestWeight = p.weight;
          let latestBcs = p.bcs;
          if (newHistory.length > 0) {
            const sorted = [...newHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            latestWeight = sorted[sorted.length - 1].weight;
            latestBcs = sorted[sorted.length - 1].bcs;
          }
          return {
            ...p,
            weightHistory: newHistory,
            weight: latestWeight,
            bcs: latestBcs
          };
        }
        return p;
      })
    );
    triggerNotification("Registro de peso eliminado.");
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

    if (profile.pathologies?.includes("obesidad") || profile.bcs >= 7) {
      factor = Math.min(factor, profile.species === "dog" ? 1.0 : 0.8);
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
      pathologies: [],
      foodType: "seca",
      foodBrand: "custom",
      foodProduct: "custom",
      weightHistory: [
        { date: new Date().toISOString().split("T")[0], weight: 10, bcs: 5 }
      ],
      mealsSchedule: [
        { id: `${nameInput}-m1`, time: "08:00 AM", grams: 35, enabled: true },
        { id: `${nameInput}-m2`, time: "08:00 PM", grams: 35, enabled: true }
      ]
    };

    setPets((prev) => [...prev, newPetObj]);
    setKcalProgress((prev) => ({ ...prev, [nameInput]: 0 }));
    setSelectedPetId(nameInput);
    triggerNotification(`Mascota "${nameInput}" añadida con éxito.`);
  };

  // Meals schedule logic helpers
  const handleAddNewMeal = () => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const list = p.mealsSchedule || [];
          const newMeal: MealScheduleItem = {
            id: `meal-${Date.now()}`,
            time: "12:00 PM",
            grams: 25,
            enabled: true
          };
          return { ...p, mealsSchedule: [...list, newMeal] };
        }
        return p;
      })
    );
    triggerNotification("Nueva ración programada agregada. Haz clic en editar para configurarla.");
  };

  const handleDeleteMeal = (mealId: string) => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const list = p.mealsSchedule || [];
          return { ...p, mealsSchedule: list.filter((m) => m.id !== mealId) };
        }
        return p;
      })
    );
    triggerNotification("Toma de alimento eliminada.");
  };

  const handleToggleMeal = (mealId: string) => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const list = p.mealsSchedule || [];
          const updated = list.map((m) => (m.id === mealId ? { ...m, enabled: !m.enabled } : m));
          return { ...p, mealsSchedule: updated };
        }
        return p;
      })
    );
    triggerNotification("Estado de la ración modificado.");
  };

  const startEditingMeal = (meal: MealScheduleItem) => {
    setEditingMealId(meal.id);
    setEditingGrams(meal.grams);
    // Parse time string to HTML time format "HH:MM"
    let clean = meal.time;
    const isPm = clean.toLowerCase().includes("pm");
    const isAm = clean.toLowerCase().includes("am");
    let t = clean.replace(/(am|pm)/i, "").trim();
    const parts = t.split(":");
    let h = Number(parts[0]) || 0;
    let m = Number(parts[1]) || 0;
    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;
    setEditingTime(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  };

  const saveMealScheduleEdit = () => {
    if (!editingMealId) return;

    // Convert time "15:30" to "03:30 PM"
    const parseTo12h = (t24: string) => {
      const parts = t24.split(":");
      let h = Number(parts[0]) || 0;
      const m = parts[1] || "00";
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12;
      if (h === 0) h = 12;
      return `${h.toString().padStart(2, "0")}:${m} ${ampm}`;
    };

    const newTimeLabel = parseTo12h(editingTime);

    setPets((prev) =>
      prev.map((p) => {
        if (p.name === selectedPetId) {
          const list = p.mealsSchedule || [];
          const updated = list.map((m) =>
            m.id === editingMealId ? { ...m, time: newTimeLabel, grams: Number(editingGrams) } : m
          );
          return { ...p, mealsSchedule: updated };
        }
        return p;
      })
    );

    setEditingMealId(null);
    triggerNotification("Horario e ingesta de ración programada guardados.");
  };

  // Helper function to find the next active meal schedule
  const getNextScheduledMeal = (pet: PetProfile) => {
    const list = pet.mealsSchedule || [];
    const enabledMeals = list.filter((m) => m.enabled);
    if (enabledMeals.length === 0) return { time: "--:--", grams: 0 };

    const getMinutes = (timeStr: string) => {
      const isPm = timeStr.toLowerCase().includes("pm");
      const isAm = timeStr.toLowerCase().includes("am");
      const clean = timeStr.replace(/(am|pm)/i, "").trim();
      const parts = clean.split(":");
      let h = Number(parts[0]) || 0;
      const m = Number(parts[1]) || 0;
      if (isPm && h < 12) h += 12;
      if (isAm && h === 12) h = 0;
      return h * 60 + m;
    };

    const sorted = [...enabledMeals].sort((a, b) => getMinutes(a.time) - getMinutes(b.time));

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = sorted.find((m) => getMinutes(m.time) > nowMinutes);
    return upcoming || sorted[0]; // wraps around to first meal tomorrow
  };

  // Health verification: Weight gain alert checks
  const checkWeightGainAlert = (history: WeightRecord[]) => {
    if (!history || history.length < 2) return null;
    // Sort history by date first
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    if (latest.weight > previous.weight) {
      const diff = latest.weight - previous.weight;
      const pct = (diff / previous.weight) * 100;
      if (pct >= 5) {
        return {
          pct: pct.toFixed(1),
          diff: diff.toFixed(1),
          previous: previous.weight,
          latest: latest.weight,
          date: latest.date
        };
      }
    }
    return null;
  };

  const weightAlert = checkWeightGainAlert(activePet.weightHistory || []);
  const nextScheduledMeal = getNextScheduledMeal(activePet);

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Filter logs for selected pet
  const activePetLogs = feedingLogs.filter((log) => log.petId === activePet.name);

  return (
    <div className="flex flex-col md:flex-row flex-1 items-center justify-center md:p-8 bg-stone-50 dark:bg-stone-950 font-sans md:gap-8 max-w-6xl mx-auto w-full min-h-screen md:min-h-0">
      
      {/* PWA iOS Install popup instructions overlay */}
      {showIosPrompt && (
        <div className="fixed top-4 inset-x-4 bg-stone-900 text-white rounded-3xl p-5 border border-stone-850 shadow-2xl z-50 animate-slide-up flex items-start gap-4 text-xs leading-relaxed max-w-md mx-auto">
          <Smartphone className="w-8 h-8 text-orange-400 shrink-0 mt-1" />
          <div className="flex-1 space-y-1">
            <h4 className="font-extrabold text-orange-400 text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Instala Feedly Pet en tu iPhone
            </h4>
            <p className="text-stone-300">
              Para una experiencia mobile nativa, abre este menú en Safari, pulsa el botón{" "}
              <span className="font-extrabold text-white flex items-center gap-0.5 inline-flex bg-stone-800 px-1 rounded"><Share className="w-3 h-3 text-orange-400" /> Compartir</span> de tu navegador y selecciona 
              <span className="font-extrabold text-white"> &quot;Agregar al inicio&quot;</span>.
            </p>
          </div>
          <button
            onClick={() => setShowIosPrompt(false)}
            className="text-stone-500 hover:text-stone-300 font-extrabold text-sm px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. SMARTPHONE SIMULATOR CONTAINER (Left Viewport) */}
      <div className="w-full md:max-w-[370px] md:shrink-0 h-screen md:h-auto">
        
        {/* Smartphone Shell with Bezel, Notch, and Status Bar */}
        <div className="relative mx-auto bg-white dark:bg-stone-900 h-screen md:h-[680px] w-full overflow-hidden flex flex-col shadow-none md:shadow-2xl md:border-[11px] md:border-stone-950 md:dark:border-stone-850 md:rounded-[48px]">
          
          {/* Speaker Notch - ONLY ON DESKTOP */}
          <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 h-[22px] w-[110px] bg-stone-950 rounded-b-2xl z-50 items-center justify-center">
            <div className="w-8 h-1 bg-stone-750 rounded-full"></div>
          </div>

          {/* Smartphone Status Bar - ONLY ON DESKTOP */}
          <div className="hidden md:flex h-10 bg-orange-500 text-white justify-between items-center px-6 pt-3 text-[10px] font-bold z-40 select-none">
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
            <div className="absolute top-4 md:top-11 inset-x-3.5 bg-stone-900/95 dark:bg-stone-950/95 border border-stone-800 text-white rounded-2xl p-2.5 flex items-start gap-2.5 shadow-lg z-50 animate-slide-up text-[10px] leading-snug">
              <Bell className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-orange-400">Feedly Pet Smart</span>
                <p className="text-stone-300">{notification}</p>
              </div>
            </div>
          )}

          {/* Smartphone Mobile App Inner Content Router */}
          <div className="flex-1 overflow-y-auto bg-stone-50/70 dark:bg-stone-950/50 pb-20 scrollbar-none relative">
            
            {/* PWA Chrome/Android Install Banner */}
            {isInstallable && activeTab === "inicio" && (
              <div className="mx-4 mt-4 p-3 bg-orange-500 text-white rounded-2xl flex items-center justify-between shadow-md shadow-orange-500/10 text-xs animate-fade-in relative z-20">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-100" />
                  <div>
                    <h4 className="font-bold">¿Instalar Aplicación?</h4>
                    <p className="text-[9px] text-orange-100">Disfruta de Feedly Pet sin barras de navegación.</p>
                  </div>
                </div>
                <button
                  onClick={handleInstallPwa}
                  className="bg-white text-orange-700 px-3 py-1.5 rounded-xl font-bold hover:bg-orange-50 text-[10px] active:scale-95 transition-all cursor-pointer"
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
                  <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    <span>Mascotas</span>
                    <button
                      type="button"
                      onClick={addNewPet}
                      className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 text-[9px] cursor-pointer"
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
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/20 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                              : "border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-stone-500"
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
                  <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
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
                          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-stone-500 hover:bg-stone-50"
                          }`}
                        >
                          <span className={isSelected ? "text-orange-200" : "text-orange-500"}>🔌</span>
                          <span>{d.name.split(" ")[0] + " " + d.name.split(" ")[1]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Pet Header Card */}
                <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-orange-50 dark:bg-orange-950/30 p-2 rounded-xl border border-orange-100 dark:border-orange-900/40">
                      {activePet.species === "dog" ? "🐶" : "🐱"}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-1">
                        {activePet.name}
                        <span className="text-[9px] font-bold text-stone-500 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                          {activePet.weight} Kg
                        </span>
                      </h3>
                      <p className="text-[9px] text-stone-400 font-semibold uppercase">
                        {activePet.breed} • {activePet.age} años
                      </p>
                    </div>
                  </div>
                  
                  {/* Linked status tag */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border border-orange-100/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                      En línea
                    </span>
                    <span className="text-[7px] text-stone-400 font-semibold mt-1">
                      {dispensers.find((d) => d.linkedPetId === activePet.name)?.name.split(" ")[0] || "Sin Dispenser"}
                    </span>
                  </div>
                </div>

                {/* Significant Weight Gain Warning Alert */}
                {weightAlert && (
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-3.5 text-xs text-orange-850 dark:text-orange-400 flex items-start gap-2.5 shadow-sm animate-pulse">
                    <span className="text-base shrink-0 mt-0.5">🚨</span>
                    <div>
                      <h4 className="font-extrabold text-orange-600 dark:text-orange-400">¡Alerta: Aumento de Peso!</h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
                        <strong>{activePet.name}</strong> ha subido <strong>+{weightAlert.diff} Kg (+{weightAlert.pct}%)</strong> en su último control. Se recomienda moderar su racionamiento.
                      </p>
                    </div>
                  </div>
                )}

                {/* Calorie Ring Progress Card */}
                <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 rounded-2xl p-5 text-center flex flex-col items-center shadow-sm">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Calorías consumidas
                  </span>
                  
                  <div className="relative flex items-center justify-center mb-2">
                    <svg width="120" height="120">
                      <circle
                        stroke="#e7e5e4"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx="60"
                        cy="60"
                        className="dark:stroke-stone-850"
                      />
                      <circle
                        stroke="#f97316"
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
                      <span className="text-xl font-black text-stone-800 dark:text-stone-100">
                        {activeConsumed}
                      </span>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                        / {activeMerTarget} Kcal
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-2">
                    {percentConsumed}% del consumo diario objetivo
                  </p>
                </div>

                {/* Device Quick Status Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-3.5 rounded-2xl shadow-sm text-center">
                    <p className="text-[8px] text-stone-450 dark:text-stone-400 font-bold uppercase tracking-wider">Tolva ({activeDispenser.name.split(" ")[0]})</p>
                    <p className="text-base font-extrabold text-orange-500 dark:text-orange-400 mt-1">
                      {activeDispenser.hopperLevel}%
                    </p>
                    <span className="text-[8px] text-stone-400">~{((3.5 * activeDispenser.hopperLevel) / 100).toFixed(1)} Kg restantes</span>
                  </div>
                  <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-3.5 rounded-2xl shadow-sm text-center flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] text-stone-455 dark:text-stone-400 font-bold uppercase tracking-wider">Próxima Toma</p>
                      <p className="text-sm font-extrabold text-stone-850 dark:text-stone-100 mt-1">
                        {nextScheduledMeal.time}
                      </p>
                    </div>
                    <span className="text-[8px] text-stone-450 dark:text-stone-400 font-semibold text-orange-600 dark:text-orange-400">
                      Ración: {nextScheduledMeal.grams}g
                    </span>
                  </div>
                </div>

                {/* Raciones / Horario editable list card */}
                <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-2">
                    <h4 className="text-[10px] font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Horarios Programados
                    </h4>
                    <button
                      onClick={handleAddNewMeal}
                      className="text-[8px] bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-bold py-1.5 px-2 rounded-lg border border-orange-100 dark:border-orange-900/50 cursor-pointer"
                    >
                      + Nueva
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                    {(activePet.mealsSchedule || []).map((meal) => {
                      const isEditing = editingMealId === meal.id;
                      return (
                        <div key={meal.id} className="flex flex-col gap-2 p-2 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-850">
                          {isEditing ? (
                            <div className="space-y-2 text-[10px]">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-stone-400 text-[8px] mb-0.5">Hora</label>
                                  <input
                                    type="time"
                                    value={editingTime}
                                    onChange={(e) => setEditingTime(e.target.value)}
                                    className="w-full p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-[10px] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-400 text-[8px] mb-0.5">Ración (g)</label>
                                  <input
                                    type="number"
                                    min="5"
                                    max="200"
                                    value={editingGrams}
                                    onChange={(e) => setEditingGrams(Number(e.target.value))}
                                    className="w-full p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-[10px] focus:outline-none"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={saveMealScheduleEdit}
                                className="w-full bg-orange-500 hover:bg-orange-655 text-white font-bold py-1 rounded text-[9px] cursor-pointer"
                              >
                                Guardar Ración
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={meal.enabled}
                                  onChange={() => handleToggleMeal(meal.id)}
                                  className="accent-orange-500 cursor-pointer h-3.5 w-3.5 border-stone-300 rounded"
                                />
                                <span className={`text-[11px] font-bold ${meal.enabled ? "text-stone-700 dark:text-stone-200" : "text-stone-400 line-through"}`}>
                                  {meal.time}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${meal.enabled ? "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400" : "bg-stone-100 text-stone-400"}`}>
                                  {meal.grams}g
                                </span>
                                <button
                                  onClick={() => startEditingMeal(meal)}
                                  className="text-stone-400 hover:text-orange-650 cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  className="text-stone-400 hover:text-rose-500 cursor-pointer"
                                  title="Borrar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Medical Obesity Alert */}
                {activePet.bcs >= 7 && (
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-3.5 text-xs text-rose-800 dark:text-rose-400 flex items-start gap-2.5 shadow-sm">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <h4 className="font-bold">Plan Clínico de Reducción Activo</h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
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
                {/* Weight Alert check in progress tab */}
                {weightAlert && (
                  <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-3.5 text-xs text-orange-850 dark:text-orange-400 flex items-start gap-2 shadow-sm animate-pulse">
                    <span className="text-base shrink-0 mt-0.5">🚨</span>
                    <div>
                      <h4 className="font-extrabold text-orange-600 dark:text-orange-400">¡Alerta: Aumento importante de peso!</h4>
                      <p className="text-[10px] text-stone-550 dark:text-stone-400 leading-snug mt-0.5">
                        Se detectó un incremento de peso significativo de <strong>+{weightAlert.diff} Kg (+{weightAlert.pct}%)</strong> en la última fecha ({weightAlert.date}).
                      </p>
                    </div>
                  </div>
                )}

                <HistoryCharts
                  weightHistory={activePet.weightHistory || []}
                  onAddWeightRecord={handleAddWeightRecord}
                  onDeleteWeightRecord={handleDeleteWeightRecord}
                  targetWeight={activePet.species === "dog" ? 11.0 : 4.5}
                  petName={activePet.name}
                />

                {/* Feeding Logs list for active pet */}
                <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-200 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-orange-500" /> Registro de {activePet.name}
                  </h4>
                  
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                    {activePetLogs.length === 0 ? (
                      <p className="text-xs text-stone-450 dark:text-stone-500 text-center py-6">
                        No hay tomas registradas hoy para {activePet.name}.
                      </p>
                    ) : (
                      activePetLogs.map((log) => (
                        <div key={log.id} className="flex justify-between items-start text-[10px]">
                          <div className="space-y-0.5 text-left">
                            <p className="font-bold text-stone-700 dark:text-stone-300">
                              {log.text}
                            </p>
                            <span className="text-stone-400 font-mono">{log.time}</span>
                          </div>
                          {log.calories && (
                            <span className="bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-mono font-bold px-1.5 py-0.5 rounded text-[8px] shrink-0 ml-2">
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
          <div className="absolute bottom-0 inset-x-0 h-[66px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-100 dark:border-stone-850 flex items-center justify-around px-2 z-40">
            <button
              onClick={() => setActiveTab("inicio")}
              className={`flex flex-col items-center gap-1 select-none transition-all cursor-pointer ${
                activeTab === "inicio" ? "text-orange-500 dark:text-orange-400" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Home className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Inicio</span>
            </button>
            <button
              onClick={() => setActiveTab("calc")}
              className={`flex flex-col items-center gap-1 select-none transition-all cursor-pointer ${
                activeTab === "calc" ? "text-orange-500 dark:text-orange-400" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Heart className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Calcular</span>
            </button>
            <button
              onClick={() => setActiveTab("registro")}
              className={`flex flex-col items-center gap-1 select-none transition-all cursor-pointer ${
                activeTab === "registro" ? "text-orange-500 dark:text-orange-400" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <TrendingDown className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Progreso</span>
            </button>
            <button
              onClick={() => setActiveTab("vet")}
              className={`flex flex-col items-center gap-1 select-none transition-all cursor-pointer ${
                activeTab === "vet" ? "text-orange-500 dark:text-orange-400" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Video className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Vet</span>
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex flex-col items-center gap-1 select-none transition-all md:hidden cursor-pointer ${
                activeTab === "simulator" ? "text-orange-500 dark:text-orange-400" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Cpu className="w-5.5 h-5.5" />
              <span className="text-[9px] font-bold">Simulador</span>
            </button>
          </div>

          {/* iOS-like Home Indicator bar - ONLY ON DESKTOP */}
          <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-400/60 rounded-full z-50"></div>
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
