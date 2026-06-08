"use client";

import React, { useState, useRef, useEffect } from "react";
import { Cpu, Wifi, RotateCw, Play } from "lucide-react";

interface FeederSimulatorProps {
  petName: string;
  hopperLevel: number;
  bowlWeight: number;
  setBowlWeight: React.Dispatch<React.SetStateAction<number>>;
  onDispense: (grams: number) => void;
  onEat: (grams: number) => void;
}

interface KibbleParticle {
  id: number;
  left: number; // percentage left offset
  delay: number; // ms delay
}

export default function FeederSimulator({
  petName,
  hopperLevel,
  bowlWeight,
  setBowlWeight,
  onDispense,
  onEat,
}: FeederSimulatorProps) {
  const [isDispensing, setIsDispensing] = useState(false);
  const [particles, setParticles] = useState<KibbleParticle[]>([]);
  const [petNear, setPetNear] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const eatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (eatTimerRef.current) clearInterval(eatTimerRef.current);
    };
  }, []);

  // Trigger manual portion dispensing (e.g., 25 grams)
  const handleManualDispense = () => {
    if (isDispensing || isEating || hopperLevel <= 5) return;
    
    setIsDispensing(true);
    
    // Generate a set of falling particles for animation
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      left: 35 + Math.random() * 30, // scatter around the center 35%-65%
      delay: i * 80, // cascade trigger times
    }));
    setParticles(newParticles);

    // Dynamic scale reading counting up during dispense
    const startWeight = bowlWeight;
    const targetGrams = 25;
    let currentStep = 0;
    const steps = 15;
    const intervalTime = 120; // total duration ~1.8s

    const timer = setInterval(() => {
      currentStep++;
      const added = Math.round((targetGrams / steps) * currentStep);
      setBowlWeight(startWeight + added);

      if (currentStep >= steps) {
        clearInterval(timer);
        setIsDispensing(false);
        setParticles([]);
        onDispense(targetGrams);
      }
    }, intervalTime);
  };

  // Simulate pet approaching the bowl and eating the food
  const handlePetSimulate = () => {
    if (bowlWeight === 0 || isDispensing || isEating) return;

    setIsEating(true);
    setPetNear(true);
    const startingFood = bowlWeight;
    let currentFood = startingFood;
    
    const timer = setInterval(() => {
      currentFood -= 5;
      if (currentFood <= 0) {
        currentFood = 0;
        if (eatTimerRef.current) clearInterval(eatTimerRef.current);
        setIsEating(false);
        setPetNear(false);
        setBowlWeight(0);
        onEat(startingFood); // Log the calorie consumption in parent dashboard
      } else {
        setBowlWeight(currentFood);
      }
    }, 400); // eat 5g every 400ms

    eatTimerRef.current = timer;
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Simulator branding header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50 flex items-center gap-1.5">
          <Cpu className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
          Simulador Físico del Dispensador
        </h3>
        <span className="text-[9px] bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold px-2 py-0.5 rounded-full">
          Hardware Live V1
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Physical Dispenser Viewport */}
        <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-2xl p-4 flex flex-col items-center justify-between min-h-[260px] relative overflow-hidden">
          {/* LED Status Bar */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 dark:bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-100 dark:border-stone-800 text-[8px] font-bold text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
              POWER
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              WIFI
            </span>
            {hopperLevel <= 15 && (
              <span className="flex items-center gap-1 text-rose-500 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                LOW FOOD
              </span>
            )}
          </div>

          {/* Feeder Body rendering */}
          <div className="w-full max-w-[130px] flex flex-col items-center mt-6">
            {/* Hopper / Cylinder */}
            <div className="w-24 h-24 bg-stone-100 dark:bg-stone-850 rounded-t-3xl border-2 border-stone-300 dark:border-stone-700 relative overflow-hidden flex items-end">
              {/* Back Glass Texture */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>

              {/* Food beads simulation container */}
              <div
                className="w-full bg-gradient-to-t from-orange-500/30 to-orange-400/20 border-t border-orange-400/50 transition-all duration-700 flex items-center justify-center relative"
                style={{ height: `${hopperLevel}%` }}
              >
                {/* Texture dots inside food level */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ea580c_1.5px,transparent_1.5px)] [background-size:6px_6px]"></div>
                <span className="text-[10px] font-extrabold text-orange-800 dark:text-orange-400 select-none z-10">
                  {hopperLevel}%
                </span>
              </div>
            </div>

            {/* Feeder Nozzle / Control Area */}
            <div className="w-24 h-10 bg-stone-100 dark:bg-stone-850 border-x-2 border-stone-300 dark:border-stone-700 relative flex items-center justify-center">
              {/* Chute opening */}
              <div className="w-6 h-3 bg-stone-800 rounded-b-lg border-t border-stone-950 relative z-20"></div>

              {/* Particles falling animation container */}
              {isDispensing && (
                <div className="absolute inset-x-0 top-3 h-10 overflow-visible z-10 pointer-events-none">
                  {particles.map((p) => (
                    <div
                      key={p.id}
                      className="absolute w-2.5 h-2.5 bg-amber-800 border border-amber-900 rounded-full animate-kibble-drop"
                      style={{
                        left: `${p.left}%`,
                        animationDelay: `${p.delay}ms`,
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Bowl Container */}
            <div className="w-28 h-10 bg-stone-300 dark:bg-stone-800 rounded-t-xl border-x-2 border-stone-400 dark:border-stone-700 relative flex items-center justify-center shadow-md">
              <div className="absolute inset-0 bg-gradient-to-b from-stone-300 to-stone-400 dark:from-stone-800 dark:to-stone-900 rounded-t-lg"></div>
              
              {/* Food in bowl visual representation */}
              {bowlWeight > 0 && (
                <div
                  className="absolute bottom-1 w-20 bg-amber-800 border border-amber-950 rounded-full transition-all duration-300"
                  style={{
                    height: `${Math.min(6 + bowlWeight * 0.18, 26)}px`,
                    opacity: 0.9,
                  }}
                >
                  <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#451a03_2px,transparent_2px)] [background-size:5px_5px] rounded-full"></div>
                </div>
              )}

              {/* Bowl Scale Sensor tag */}
              <div className="absolute -bottom-2.5 bg-stone-900 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full border border-stone-700 z-10">
                {bowlWeight}g en plato
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Control panel */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Acciones de Pruebas
            </h4>
            
            <div className="space-y-2 text-xs">
              <button
                onClick={handleManualDispense}
                disabled={isDispensing || isEating || hopperLevel <= 5}
                className="w-full p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-100 disabled:text-stone-450 dark:disabled:bg-stone-850 dark:disabled:text-stone-500 text-white rounded-2xl transition-all font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Dispensar Ración (25g)
              </button>

              <button
                onClick={handlePetSimulate}
                disabled={isDispensing || bowlWeight === 0 || isEating}
                className={`w-full p-3 rounded-2xl border transition-all font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  petNear
                    ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                    : "border-stone-200 dark:border-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                {petNear ? `Simulando que ${petName} come...` : `Simular que ${petName} come`}
              </button>
            </div>
          </div>

          {/* Status logs */}
          <div className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-2xl p-3 text-[10px] space-y-1.5 font-mono text-stone-500 dark:text-stone-400">
            <p className="font-bold text-stone-700 dark:text-stone-300 border-b border-stone-200/50 dark:border-stone-900/40 pb-1 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-orange-500" /> Registro Sensores
            </p>
            {isDispensing && (
              <p className="text-orange-500 dark:text-orange-400 flex items-center gap-1 animate-pulse">
                • [MOT] Motor activado, dispensando...
              </p>
            )}
            {isEating && (
              <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                • [PESO] {petName} comiendo. Sensor: -5g/seg.
              </p>
            )}
            {!isDispensing && !isEating && (
              <p>• [SIST] Dispensador en línea. Sensor tolva listo.</p>
            )}
            <p>• [WIFI] Ping: 12ms. Señal: -42dBm (Excelente).</p>
            <p>
              • [INFO] Capacidad tolva: 3.5 Kg. Restan:{" "}
              {((3500 * hopperLevel) / 100).toFixed(0)} gramos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
