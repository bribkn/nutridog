"use client";

import React, { useState } from "react";
import { Check, Heart } from "lucide-react";

export interface PetProfile {
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
  isNeutered: boolean;
  activityLevel: "sedentary" | "moderate" | "active" | "working";
  bcs: number; // 1-9 scale
  foodDensity: number; // kcal per gram (e.g. 3.5)
  mealsPerDay: number;
}

interface PetProfileFormProps {
  initialProfile: PetProfile;
  onSaveProfile: (profile: PetProfile) => void;
}

export default function PetProfileForm({ initialProfile, onSaveProfile }: PetProfileFormProps) {
  const [profile, setProfile] = useState<PetProfile>(initialProfile);
  const [isSaved, setIsSaved] = useState<boolean>(false);



  // Perform veterinary calculations dynamically during render (derived state)
  const weight = Number(profile.weight) || 1;
  const foodDensity = Number(profile.foodDensity) || 3.5;

  // 1. Resting Energy Requirement (RER) = 70 * (weight_kg)^0.75
  const rer = Math.round(70 * Math.pow(weight, 0.75));

  // 2. Determine multiplier factor based on species, reproduction, BCS, and activity
  let factor = 1.0;
  if (profile.species === "dog") {
    // Base factor by BCS
    if (profile.bcs >= 8) factor = 1.0; // Obese, restrict energy
    else if (profile.bcs >= 6) factor = 1.2; // Overweight
    else if (profile.isNeutered) factor = 1.6; // Ideal, neutered
    else factor = 1.8; // Ideal, intact

    // Modify by activity level
    if (profile.activityLevel === "sedentary") factor -= 0.25;
    else if (profile.activityLevel === "active") factor += 0.25;
    else if (profile.activityLevel === "working") factor += 0.8;
  } else {
    // Cat factor
    if (profile.bcs >= 8) factor = 0.8; // Obese
    else if (profile.bcs >= 6) factor = 1.0; // Overweight
    else if (profile.isNeutered) factor = 1.2; // Ideal, neutered
    else factor = 1.4; // Ideal, intact

    if (profile.activityLevel === "sedentary") factor -= 0.15;
    else if (profile.activityLevel === "active") factor += 0.2;
  }

  // Clamp factor to safety bounds
  const minFactor = profile.species === "cat" ? 0.6 : 0.8;
  const maxFactor = profile.species === "cat" ? 2.2 : 3.5;
  const finalFactor = Math.max(minFactor, Math.min(maxFactor, factor));

  // 3. Maintenance Energy Requirement (MER) = RER * finalFactor
  const mer = Math.round(rer * finalFactor);

  // 4. Daily food portion in grams = MER / (Kcal/g)
  const dailyGrams = Math.round(mer / foodDensity);

  const handleChange = <K extends keyof PetProfile>(key: K, value: PetProfile[K]) => {
    setIsSaved(false);
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Helper text for BCS slider
  const getBcsLabel = (bcs: number) => {
    if (bcs <= 3) return { label: "Muy Delgado", color: "text-blue-500", desc: "Costillas muy visibles, cintura marcada, sin grasa detectable." };
    if (bcs <= 5) return { label: "Condición Ideal", color: "text-emerald-600", desc: "Proporción perfecta. Costillas palpables con grasa mínima, cintura bien definida." };
    if (bcs <= 7) return { label: "Sobrepeso", color: "text-amber-500", desc: "Capa moderada de grasa sobre costillas, cintura poco visible vista desde arriba." };
    return { label: "Obesidad Clínica", color: "text-rose-500", desc: "Depósitos pesados de grasa, abdomen abultado, nula distinción de cintura." };
  };

  const bcsDetails = getBcsLabel(profile.bcs);

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
          <Heart className="w-4.5 h-4.5 text-emerald-600" />
          Perfil Nutricional de la Mascota
        </h3>
        <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-100/40">
          RER/MER Vet Calc
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Name & Species */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Nombre Mascota
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Lola"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Especie
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleChange("species", "dog")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  profile.species === "dog"
                    ? "border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-100 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                🐶 Perro
              </button>
              <button
                type="button"
                onClick={() => handleChange("species", "cat")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  profile.species === "cat"
                    ? "border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-100 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                🐱 Gato
              </button>
            </div>
          </div>
        </div>

        {/* Age, Weight & Neutered */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Edad (Años)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              step="0.5"
              required
              value={profile.age}
              onChange={(e) => handleChange("age", Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Peso (Kg)
            </label>
            <input
              type="number"
              min="0.5"
              max="100"
              step="0.1"
              required
              value={profile.weight}
              onChange={(e) => handleChange("weight", Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Reprod.
            </label>
            <button
              type="button"
              onClick={() => handleChange("isNeutered", !profile.isNeutered)}
              className={`w-full py-2 rounded-xl text-[10px] font-bold border transition-all ${
                profile.isNeutered
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-100 dark:border-zinc-800 text-zinc-500"
              }`}
            >
              {profile.isNeutered ? "Castrado" : "Entero"}
            </button>
          </div>
        </div>

        {/* Activity & Food density */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Nivel de Actividad
            </label>
            <select
              value={profile.activityLevel}
              onChange={(e) => handleChange("activityLevel", e.target.value as PetProfile["activityLevel"])}
              className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="sedentary">Bajo / Sedentario</option>
              <option value="moderate">Moderado (Paseo diario)</option>
              <option value="active">Activo (Deporte/Juego)</option>
              {profile.species === "dog" && <option value="working">Muy Activo (Trabajo/Caza)</option>}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              Calorías del Alimento
            </label>
            <select
              value={profile.foodDensity}
              onChange={(e) => handleChange("foodDensity", Number(e.target.value))}
              className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="3.1">Saciante / Light (3.1 Kcal/g)</option>
              <option value="3.5">Kibble Estándar (3.5 Kcal/g)</option>
              <option value="4.0">Premium Alto Rendim. (4.0 Kcal/g)</option>
              <option value="4.5">Kibble Cachorros (4.5 Kcal/g)</option>
            </select>
          </div>
        </div>

        {/* Body Condition Score (BCS 1-9) */}
        <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-900">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              Condición Corporal (BCS)
            </span>
            <span className={`font-bold text-xs ${bcsDetails.color}`}>
              {profile.bcs}/9 ({bcsDetails.label})
            </span>
          </div>
          
          <input
            type="range"
            min="1"
            max="9"
            step="1"
            value={profile.bcs}
            onChange={(e) => handleChange("bcs", Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
          />

          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-tight">
            {bcsDetails.desc}
          </p>
        </div>

        {/* Dynamic Calculator Feedback */}
        <div className="grid grid-cols-3 gap-2 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/10 rounded-2xl p-3.5 text-center">
          <div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Meta RER</p>
            <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{rer} <span className="text-[9px] font-medium text-zinc-400">kcal</span></p>
            <span className="text-[7px] text-zinc-400">Tasa Basal</span>
          </div>
          <div className="border-x border-zinc-100 dark:border-zinc-850">
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Objetivo MER</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{mer} <span className="text-[9px] font-medium text-zinc-400">kcal</span></p>
            <span className="text-[7px] text-zinc-400 font-semibold">Gasto Diario Target</span>
          </div>
          <div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase">Ración Total</p>
            <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{dailyGrams}g <span className="text-[9px] font-medium text-zinc-400">/ día</span></p>
            <span className="text-[7px] text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round(dailyGrams / profile.mealsPerDay)}g × {profile.mealsPerDay} tomas
            </span>
          </div>
        </div>

        {/* Meals counts selector */}
        <div className="flex items-center justify-between text-xs pt-1.5">
          <span className="text-zinc-500 font-medium">Tomas de Alimento Diarias:</span>
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
            {[2, 3, 4].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleChange("mealsPerDay", m)}
                className={`w-7 py-1 rounded text-xs font-semibold ${
                  profile.mealsPerDay === m
                    ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          className={`w-full py-3 text-white font-medium rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] ${
            isSaved
              ? "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-600/10"
              : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 shadow-zinc-950/10"
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              ¡Guardado y Sincronizado!
            </>
          ) : (
            "Actualizar y Sincronizar Dispensador"
          )}
        </button>
      </div>
    </form>
  );
}
