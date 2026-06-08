"use client";

import React, { useState, useEffect } from "react";
import { Check, Heart, ShieldAlert, Award, FileText } from "lucide-react";

export interface WeightRecord {
  date: string;
  weight: number;
  bcs: number;
}

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
  pathologies?: string[];
  foodType?: "seca" | "humeda" | "natural" | "mixta";
  foodBrand?: string;
  foodProduct?: string;
  weightHistory?: WeightRecord[];
  mealsSchedule?: { id: string; time: string; grams: number; enabled: boolean }[];
}

interface PetProfileFormProps {
  initialProfile: PetProfile;
  onSaveProfile: (profile: PetProfile) => void;
}

interface FoodProduct {
  brand: string;
  name: string;
  species: "dog" | "cat" | "both";
  density: number; // kcal/g
  protein: number; // %
  fat: number; // %
  fiber: number; // %
  ingredients: string;
}

// Preset food product database
const FOOD_DATABASE: FoodProduct[] = [
  // Royal Canin
  {
    brand: "Royal Canin",
    name: "Satiety Support Weight Management (Perro)",
    species: "dog",
    density: 3.1,
    protein: 30,
    fat: 9.5,
    fiber: 15.5,
    ingredients: "Proteína de ave deshidratada, fibras vegetales, tapioca, trigo, gluten de maíz, grasas animales."
  },
  {
    brand: "Royal Canin",
    name: "Medium Adult Formula (Perro)",
    species: "dog",
    density: 3.8,
    protein: 25,
    fat: 14,
    fiber: 1.3,
    ingredients: "Maíz, harina de subproductos de pollo, grasas animales, trigo, harina de gluten de maíz, pulpa de remolacha."
  },
  {
    brand: "Royal Canin",
    name: "Fit 32 Active Cat (Gato)",
    species: "cat",
    density: 3.8,
    protein: 32,
    fat: 15,
    fiber: 4.6,
    ingredients: "Harina de subproductos de pollo, arroz, maíz, gluten de trigo, grasas animales, fibras vegetales."
  },
  {
    brand: "Royal Canin",
    name: "Renal Special Care (Gato)",
    species: "cat",
    density: 3.9,
    protein: 26,
    fat: 17,
    fiber: 4.8,
    ingredients: "Harina de arroz, grasa de pollo, subproductos de cerdo, gluten de trigo, fibras vegetales, minerales."
  },
  // Hill's Science Diet
  {
    brand: "Hill's Science Diet",
    name: "Adult Light Weight Management (Perro)",
    species: "dog",
    density: 3.1,
    protein: 20,
    fat: 7,
    fiber: 14,
    ingredients: "Harina de pollo, fibra de avena, trigo entero, maíz entero, harina de gluten de maíz, cebada perlada."
  },
  {
    brand: "Hill's Science Diet",
    name: "Perfect Weight Healthy Mobility (Perro)",
    species: "dog",
    density: 3.2,
    protein: 24,
    fat: 10,
    fiber: 13,
    ingredients: "Pollo, cebada perlada, arroz de cervecería, fibra de avena, trigo entero, harina de gluten de maíz, linaza."
  },
  {
    brand: "Hill's Science Diet",
    name: "Urinary & Hairball Control (Gato)",
    species: "cat",
    density: 3.7,
    protein: 31,
    fat: 16,
    fiber: 8,
    ingredients: "Pollo, trigo entero, harina de gluten de maíz, grasa de cerdo, celulosa en polvo, gluten de trigo, linaza."
  },
  // Purina Pro Plan
  {
    brand: "Purina Pro Plan",
    name: "Active Mind Senior 7+ (Perro)",
    species: "dog",
    density: 4.1,
    protein: 29,
    fat: 14,
    fiber: 3,
    ingredients: "Pollo, arroz, harina de subproductos de aves, maíz entero, harina de gluten de maíz, trigo entero."
  },
  {
    brand: "Purina Pro Plan",
    name: "OptiStart Puppy Healthy Start (Cachorros)",
    species: "dog",
    density: 4.3,
    protein: 30,
    fat: 19,
    fiber: 3,
    ingredients: "Carne de pollo, gluten de maíz, harina de subproductos de pollo, arroz, trigo entero, grasa de res."
  },
  {
    brand: "Purina Pro Plan",
    name: "Veterinary Diets OM Obesity Management (Perro)",
    species: "dog",
    density: 3.0,
    protein: 29,
    fat: 6,
    fiber: 16,
    ingredients: "Harina de soya, harina de gluten de maíz, salvado de trigo, cáscara de avena, pulpa de remolacha deshidratada."
  },
  {
    brand: "Purina Pro Plan",
    name: "Sterilised Salmón Adult (Gato)",
    species: "cat",
    density: 3.6,
    protein: 37,
    fat: 10,
    fiber: 3,
    ingredients: "Carne de salmón, harina de subproductos de pollo, gluten de maíz, arroz, harina de soya, grasa de cerdo."
  }
];

export default function PetProfileForm({ initialProfile, onSaveProfile }: PetProfileFormProps) {
  // Enforce array initialization for pathologies
  const [profile, setProfile] = useState<PetProfile>({
    ...initialProfile,
    pathologies: initialProfile.pathologies || [],
    foodType: initialProfile.foodType || "seca",
    foodBrand: initialProfile.foodBrand || "Royal Canin",
    foodProduct: initialProfile.foodProduct || ""
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Filter products by brand and species
  const filteredProducts = FOOD_DATABASE.filter(
    (f) =>
      f.brand === profile.foodBrand &&
      (f.species === "both" || f.species === profile.species)
  );

  // Sync food density automatically if a pre-configured product is chosen
  useEffect(() => {
    if (profile.foodProduct && profile.foodProduct !== "custom") {
      const selectedProduct = FOOD_DATABASE.find(
        (f) => f.name === profile.foodProduct
      );
      if (selectedProduct) {
        setProfile((prev) => ({ ...prev, foodDensity: selectedProduct.density }));
      }
    }
  }, [profile.foodProduct]);

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

  // Override factor slightly if specific pathologies are present
  const petPathologies = profile.pathologies || [];
  if (petPathologies.includes("obesidad") || profile.bcs >= 7) {
    factor = Math.min(factor, profile.species === "dog" ? 1.0 : 0.8);
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

  // Switch species handler to reset food product to avoid species-mismatched selection
  const handleSpeciesChange = (species: "dog" | "cat") => {
    setIsSaved(false);
    setProfile((prev) => ({
      ...prev,
      species,
      foodProduct: "" // reset selected product
    }));
  };

  const handlePathologyToggle = (pathologyKey: string) => {
    setIsSaved(false);
    setProfile((prev) => {
      const active = prev.pathologies || [];
      const updated = active.includes(pathologyKey)
        ? active.filter((p) => p !== pathologyKey)
        : [...active, pathologyKey];
      return { ...prev, pathologies: updated };
    });
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
    if (bcs <= 5) return { label: "Condición Ideal", color: "text-orange-600 dark:text-orange-450", desc: "Proporción perfecta. Costillas palpables con grasa mínima, cintura bien definida." };
    if (bcs <= 7) return { label: "Sobrepeso", color: "text-amber-500", desc: "Capa moderada de grasa sobre costillas, cintura poco visible vista desde arriba." };
    return { label: "Obesidad Clínica", color: "text-rose-500", desc: "Depósitos pesados de grasa, abdomen abultado, nula distinción de cintura." };
  };

  const bcsDetails = getBcsLabel(profile.bcs);

  // Selected food product info card helper
  const activeProductInfo = FOOD_DATABASE.find(
    (f) => f.name === profile.foodProduct
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50 flex items-center gap-1.5">
          <Heart className="w-4.5 h-4.5 text-orange-500" />
          Perfil Nutricional de la Mascota
        </h3>
        <span className="text-[9px] bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 font-semibold px-2 py-0.5 rounded-full border border-orange-100/40">
          RER/MER Vet Calc
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Name & Species */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Nombre Mascota
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Lola"
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-205 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Especie
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSpeciesChange("dog")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.species === "dog"
                    ? "border-orange-500 bg-orange-50/20 text-orange-600 dark:text-orange-400"
                    : "border-stone-100 dark:border-stone-800 text-stone-500"
                }`}
              >
                🐶 Perro
              </button>
              <button
                type="button"
                onClick={() => handleSpeciesChange("cat")}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  profile.species === "cat"
                    ? "border-orange-500 bg-orange-50/20 text-orange-600 dark:text-orange-400"
                    : "border-stone-100 dark:border-stone-800 text-stone-500"
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
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
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
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
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
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
              Reprod.
            </label>
            <button
              type="button"
              onClick={() => handleChange("isNeutered", !profile.isNeutered)}
              className={`w-full py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                profile.isNeutered
                  ? "border-orange-500 bg-orange-50/20 text-orange-600 dark:text-orange-400"
                  : "border-stone-100 dark:border-stone-800 text-stone-500"
              }`}
            >
              {profile.isNeutered ? "Castrado" : "Entero"}
            </button>
          </div>
        </div>

        {/* Activity & Pathologies Dropdown toggle triggers */}
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
            Nivel de Actividad
          </label>
          <select
            value={profile.activityLevel}
            onChange={(e) => handleChange("activityLevel", e.target.value as PetProfile["activityLevel"])}
            className="w-full px-2 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-900 dark:text-stone-100"
          >
            <option value="sedentary">Bajo / Sedentario</option>
            <option value="moderate">Moderado (Paseo diario)</option>
            <option value="active">Activo (Deporte/Juego)</option>
            {profile.species === "dog" && <option value="working">Muy Activo (Trabajo/Caza)</option>}
          </select>
        </div>

        {/* Pathology Selector Section */}
        <div className="space-y-1.5 p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-2xl">
          <label className="block text-[10px] font-bold text-stone-450 dark:text-stone-400 uppercase tracking-wider mb-1">
            Patologías / Condiciones Médicas
          </label>
          
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {[
              { key: "obesidad", label: "⚖️ Obesidad" },
              { key: "alergia", label: "🌾 Alergia Alim." },
              { key: "renal", label: "🩺 Insuf. Renal" },
              { key: "diabetes", label: "💉 Diabetes" },
              { key: "artrosis", label: "🦴 Artrosis" },
              { key: "estomago", label: "🧪 Estóm. Sensible" }
            ].map((p) => {
              const isChecked = petPathologies.includes(p.key);
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePathologyToggle(p.key)}
                  className={`py-1.5 px-2.5 rounded-lg border text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? "border-orange-500 bg-orange-500/10 text-orange-650 dark:text-orange-400 font-bold"
                      : "border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 text-stone-500"
                  }`}
                >
                  <span>{p.label}</span>
                  {isChecked && <Check className="w-3 h-3 text-orange-500" />}
                </button>
              );
            })}
          </div>

          {/* Pathology Vet Warning Alerts */}
          {petPathologies.length > 0 && (
            <div className="space-y-1.5 mt-2.5 pt-2.5 border-t border-stone-200/50 dark:border-stone-900/40">
              {petPathologies.map((pathKey) => {
                let text = "";
                if (pathKey === "obesidad") text = "Plan Obesidad: Factor MER limitado para estimular la pérdida de grasa.";
                else if (pathKey === "renal") text = "Alerta Renal: Dieta terapéutica baja en fósforo y sodio obligatoria. Asegura agua fresca.";
                else if (pathKey === "alergia") text = "Alerta Alergias: Proteína hidrolizada o novel recomendada. Revisa los ingredientes.";
                else if (pathKey === "diabetes") text = "Diabetes: Alimentación estricta y raciones ricas en fibra lenta para evitar picos de glucosa.";
                else if (pathKey === "artrosis") text = "Dolor Articular: El peso bajo es crucial para reducir impacto en articulaciones.";
                else if (pathKey === "estomago") text = "Estómago Sensible: Prefiere repartir la ración diaria en 3 o 4 tomas pequeñas.";

                return (
                  <div key={pathKey} className="text-[9px] leading-snug text-amber-800 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-950/10 p-1.5 rounded-lg border border-amber-500/10 flex items-start gap-1">
                    <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Food Selection Database */}
        <div className="space-y-2 p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-900 rounded-2xl">
          <label className="block text-[10px] font-bold text-stone-450 dark:text-stone-400 uppercase tracking-wider">
            Alimentación y Ficha Nutricional
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Tipo</label>
              <select
                value={profile.foodType}
                onChange={(e) => handleChange("foodType", e.target.value as PetProfile["foodType"])}
                className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg text-[10px] text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="seca">Seco (Croquetas)</option>
                <option value="humeda">Húmedo (Sobres/Lata)</option>
                <option value="natural">Natural (BARF/Cocinado)</option>
                <option value="mixta">Alimentación Mixta</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Marca</label>
              <select
                value={profile.foodBrand}
                onChange={(e) => {
                  handleChange("foodBrand", e.target.value);
                  handleChange("foodProduct", ""); // reset product when brand changes
                }}
                className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg text-[10px] text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="Royal Canin">Royal Canin</option>
                <option value="Hill's Science Diet">Hill's Science Diet</option>
                <option value="Purina Pro Plan">Purina Pro Plan</option>
                <option value="custom">Otro / Personalizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Alimento Específico</label>
            {profile.foodBrand === "custom" ? (
              <input
                type="text"
                placeholder="Nombre de la comida"
                value={profile.foodProduct || ""}
                onChange={(e) => handleChange("foodProduct", e.target.value)}
                className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg text-[10px] text-stone-800 dark:text-stone-200 focus:outline-none"
              />
            ) : (
              <select
                value={profile.foodProduct}
                onChange={(e) => handleChange("foodProduct", e.target.value)}
                className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg text-[10px] text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="">-- Selecciona Producto --</option>
                {filteredProducts.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name.split(" (")[0]}
                  </option>
                ))}
                <option value="custom">Otro producto (Manual)</option>
              </select>
            )}
          </div>

          {/* Calorie input (Editable only when 'custom' is active) */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[9px] text-stone-500 font-medium">Densidad Calórica:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1.0"
                max="6.0"
                step="0.1"
                disabled={profile.foodBrand !== "custom" && profile.foodProduct !== "custom"}
                value={profile.foodDensity}
                onChange={(e) => handleChange("foodDensity", Number(e.target.value))}
                className="w-14 px-1.5 py-1 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-lg text-[10px] text-stone-850 dark:text-stone-200 disabled:bg-stone-100/50 disabled:text-stone-400"
              />
              <span className="text-[9px] text-stone-400 font-bold">Kcal/g</span>
            </div>
          </div>

          {/* Nutritional Breakdown Ficha */}
          {activeProductInfo && (
            <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 p-2.5 rounded-xl text-[9px] space-y-1.5 shadow-inner">
              <div className="flex justify-between items-center text-stone-400 border-b border-stone-100 dark:border-stone-850 pb-1 font-bold uppercase text-[7px] tracking-wider">
                <span>Ficha Nutricional</span>
                <span className="text-orange-500 flex items-center gap-0.5"><Award className="w-2.5 h-2.5" /> Premium</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center font-bold">
                <div className="bg-orange-50/30 dark:bg-stone-850 py-1 rounded-md">
                  <p className="text-stone-400 text-[6px] uppercase">Proteína</p>
                  <p className="text-stone-800 dark:text-stone-200">{activeProductInfo.protein}%</p>
                </div>
                <div className="bg-orange-50/30 dark:bg-stone-850 py-1 rounded-md">
                  <p className="text-stone-400 text-[6px] uppercase">Grasa</p>
                  <p className="text-stone-800 dark:text-stone-200">{activeProductInfo.fat}%</p>
                </div>
                <div className="bg-orange-50/30 dark:bg-stone-850 py-1 rounded-md">
                  <p className="text-stone-400 text-[6px] uppercase">Fibra</p>
                  <p className="text-stone-800 dark:text-stone-200">{activeProductInfo.fiber}%</p>
                </div>
              </div>
              <div className="text-[8px] leading-tight text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-950 p-1.5 rounded border border-stone-100/40">
                <span className="font-bold text-[7px] text-stone-400 flex items-center gap-0.5 uppercase mb-0.5"><FileText className="w-2.5 h-2.5" /> Ingredientes Clave</span>
                {activeProductInfo.ingredients}
              </div>
            </div>
          )}
        </div>

        {/* Body Condition Score (BCS 1-9) */}
        <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-100 dark:border-stone-900">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
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
            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg"
          />

          <p className="text-[9px] text-stone-500 dark:text-stone-400 leading-tight">
            {bcsDetails.desc}
          </p>
        </div>

        {/* Dynamic Calculator Feedback */}
        <div className="grid grid-cols-3 gap-2 bg-orange-50/10 dark:bg-orange-950/5 border border-orange-500/10 rounded-2xl p-3.5 text-center">
          <div>
            <p className="text-[8px] text-stone-450 dark:text-stone-400 font-bold uppercase">Meta RER</p>
            <p className="text-sm font-black text-stone-800 dark:text-stone-100">{rer} <span className="text-[9px] font-medium text-stone-400">kcal</span></p>
            <span className="text-[7px] text-stone-450 dark:text-stone-400">Tasa Basal</span>
          </div>
          <div className="border-x border-stone-100 dark:border-stone-850">
            <p className="text-[8px] text-stone-450 dark:text-stone-400 font-bold uppercase">Objetivo MER</p>
            <p className="text-sm font-black text-orange-600 dark:text-orange-400">{mer} <span className="text-[9px] font-medium text-stone-400">kcal</span></p>
            <span className="text-[7px] text-stone-450 dark:text-stone-400 font-semibold">Gasto Diario Target</span>
          </div>
          <div>
            <p className="text-[8px] text-stone-450 dark:text-stone-400 font-bold uppercase">Ración Total</p>
            <p className="text-sm font-black text-stone-800 dark:text-stone-100">{dailyGrams}g <span className="text-[9px] font-medium text-stone-400">/ día</span></p>
            <span className="text-[7px] text-orange-600 dark:text-orange-400 font-bold">
              {Math.round(dailyGrams / profile.mealsPerDay)}g × {profile.mealsPerDay} tomas
            </span>
          </div>
        </div>

        {/* Meals counts selector */}
        <div className="flex items-center justify-between text-xs pt-1.5">
          <span className="text-stone-500 font-medium">Tomas de Alimento Diarias:</span>
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg">
            {[2, 3, 4].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleChange("mealsPerDay", m)}
                className={`w-7 py-1 rounded text-xs font-semibold cursor-pointer ${
                  profile.mealsPerDay === m
                    ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-stone-50 shadow-sm"
                    : "text-stone-400"
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
          className={`w-full py-3 text-white font-medium rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer ${
            isSaved
              ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/10"
              : "bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-750 shadow-stone-950/10"
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
