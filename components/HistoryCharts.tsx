"use client";

import React, { useState } from "react";
import { TrendingDown, Calendar, Plus, Check, Trash2 } from "lucide-react";

export interface WeightRecord {
  date: string; // "YYYY-MM-DD"
  weight: number;
  bcs: number;
}

interface CaloriePoint {
  day: string;
  consumed: number;
  target: number;
}

interface HistoryChartsProps {
  weightHistory: WeightRecord[];
  onAddWeightRecord: (record: WeightRecord) => void;
  onDeleteWeightRecord?: (index: number) => void;
  targetWeight: number;
  petName: string;
}

export default function HistoryCharts({
  weightHistory,
  onAddWeightRecord,
  onDeleteWeightRecord,
  targetWeight = 11.0,
  petName = "Mascota"
}: HistoryChartsProps) {
  const [activeTab, setActiveTab] = useState<"weight" | "calories">("weight");
  const [hoveredWeightIndex, setHoveredWeightIndex] = useState<number | null>(null);
  const [hoveredCalorieIndex, setHoveredCalorieIndex] = useState<number | null>(null);

  // Form states for adding new weight record
  const [showForm, setShowForm] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split("T")[0]);
  const [bcsInput, setBcsInput] = useState(5);
  const [formSuccess, setFormSuccess] = useState(false);

  // Sort weight history chronologically by date
  const sortedWeightData = [...weightHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Mock Calorie Consumption Data (Last 7 days)
  const calorieData: CaloriePoint[] = [
    { day: "Lun", consumed: 420, target: 450 },
    { day: "Mar", consumed: 450, target: 450 },
    { day: "Mié", consumed: 440, target: 450 },
    { day: "Jue", consumed: 510, target: 450 }, // Overfed a bit (extra treat)
    { day: "Vie", consumed: 450, target: 450 },
    { day: "Sáb", consumed: 430, target: 450 },
    { day: "Dom", consumed: 450, target: 450 },
  ];

  // SVG dimensions
  const width = 320;
  const height = 180;
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  // Weight chart dynamic auto-scaling calculations
  const weights = sortedWeightData.map((d) => d.weight);
  const maxWeight = Math.max(...weights, targetWeight, 12) + 1;
  const minWeight = Math.max(0, Math.min(...weights, targetWeight, 4) - 1);

  const getWeightY = (w: number) => {
    const scale = (height - paddingTop - paddingBottom) / (maxWeight - minWeight);
    return height - paddingBottom - (w - minWeight) * scale;
  };
  const getWeightX = (index: number) => {
    if (sortedWeightData.length <= 1) return paddingLeft + (width - paddingLeft - paddingRight) / 2;
    const scale = (width - paddingLeft - paddingRight) / (sortedWeightData.length - 1);
    return paddingLeft + index * scale;
  };

  // Build SVG Path for Weight line
  const weightPathPoints = sortedWeightData
    .map((d, i) => `${getWeightX(i)},${getWeightY(d.weight)}`)
    .join(" ");

  // Build SVG Path for Weight area gradient fill
  const weightAreaPoints =
    sortedWeightData.length > 0
      ? `${getWeightX(0)},${height - paddingBottom} ${weightPathPoints} ${getWeightX(
          sortedWeightData.length - 1
        )},${height - paddingBottom}`
      : "";

  // Calorie chart calculations
  const maxCalorie = 600;
  const getCalorieY = (cal: number) => {
    const scale = (height - paddingTop - paddingBottom) / maxCalorie;
    return height - paddingBottom - cal * scale;
  };
  const getCalorieX = (index: number) => {
    const innerWidth = width - paddingLeft - paddingRight;
    const barWidth = innerWidth / calorieData.length;
    return paddingLeft + index * barWidth + barWidth / 2;
  };

  // Format date display for chart label: e.g. "2026-05-12" -> "12/05"
  const formatDateLabel = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = Number(weightInput);
    if (isNaN(weightNum) || weightNum <= 0) return;

    onAddWeightRecord({
      date: dateInput,
      weight: weightNum,
      bcs: Number(bcsInput)
    });

    setWeightInput("");
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowForm(false);
    }, 1500);
  };

  // Calculate stats based on history
  const initialWeight = sortedWeightData[0]?.weight || 0;
  const currentWeight = sortedWeightData[sortedWeightData.length - 1]?.weight || 0;
  const weightDiff = currentWeight - initialWeight;
  const weightDiffPct = initialWeight > 0 ? (weightDiff / initialWeight) * 100 : 0;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-orange-500" />
          Monitoreo de Progreso
        </h3>
        <div className="bg-stone-100 dark:bg-stone-850 p-0.5 rounded-xl flex">
          <button
            onClick={() => setActiveTab("weight")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "weight"
                ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-stone-50 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Peso
          </button>
          <button
            onClick={() => setActiveTab("calories")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "calories"
                ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-stone-50 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            Calorías
          </button>
        </div>
      </div>

      {activeTab === "weight" ? (
        <div className="space-y-4">
          {/* Weight loss micro metrics */}
          <div className="grid grid-cols-3 gap-2 bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/30 dark:border-orange-900/20 rounded-2xl p-2.5 text-center">
            <div>
              <p className="text-[9px] text-stone-400 font-semibold uppercase">Inicial</p>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-200">{initialWeight ? `${initialWeight} kg` : "--"}</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 font-semibold uppercase">Actual</p>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{currentWeight ? `${currentWeight} kg` : "--"}</p>
            </div>
            <div>
              <p className="text-[9px] text-stone-400 font-semibold uppercase">Diferencia</p>
              <p className={`text-xs font-bold ${weightDiff > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg ({weightDiffPct > 0 ? "+" : ""}{weightDiffPct.toFixed(0)}%)
              </p>
            </div>
          </div>

          {/* Interactive Weight SVG Chart */}
          {sortedWeightData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-xs text-stone-400 bg-stone-50 dark:bg-stone-950 border border-dashed border-stone-200 dark:border-stone-850 rounded-2xl">
              No hay registros de peso disponibles.
            </div>
          ) : (
            <div className="relative h-[180px] w-full flex items-center justify-center">
              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line
                  x1={paddingLeft}
                  y1={getWeightY(maxWeight - 1)}
                  x2={width - paddingRight}
                  y2={getWeightY(maxWeight - 1)}
                  stroke="#e7e5e4"
                  strokeWidth="0.5"
                  className="dark:stroke-stone-800"
                />
                <line
                  x1={paddingLeft}
                  y1={getWeightY((maxWeight + minWeight) / 2)}
                  x2={width - paddingRight}
                  y2={getWeightY((maxWeight + minWeight) / 2)}
                  stroke="#e7e5e4"
                  strokeWidth="0.5"
                  className="dark:stroke-stone-800"
                />
                <line
                  x1={paddingLeft}
                  y1={getWeightY(minWeight + 1)}
                  x2={width - paddingRight}
                  y2={getWeightY(minWeight + 1)}
                  stroke="#e7e5e4"
                  strokeWidth="0.5"
                  className="dark:stroke-stone-800"
                />

                {/* Y Axis Labels */}
                <text x={paddingLeft - 8} y={getWeightY(maxWeight - 1) + 4} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                  {Math.round(maxWeight - 1)}k
                </text>
                <text x={paddingLeft - 8} y={getWeightY((maxWeight + minWeight) / 2) + 4} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                  {Math.round((maxWeight + minWeight) / 2)}k
                </text>
                <text x={paddingLeft - 8} y={getWeightY(minWeight + 1) + 4} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                  {Math.round(minWeight + 1)}k
                </text>

                {/* Target Weight Reference Line (Dashed) */}
                {targetWeight && (
                  <>
                    <line
                      x1={paddingLeft}
                      y1={getWeightY(targetWeight)}
                      x2={width - paddingRight}
                      y2={getWeightY(targetWeight)}
                      stroke="#f97316"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.8"
                    />
                    <text
                      x={width - paddingRight - 2}
                      y={getWeightY(targetWeight) - 4}
                      fontSize="7"
                      textAnchor="end"
                      className="fill-orange-600 dark:fill-orange-400 font-bold"
                    >
                      Meta: {targetWeight}kg
                    </text>
                  </>
                )}

                {/* Weight Area Fill */}
                {sortedWeightData.length > 1 && (
                  <polygon points={weightAreaPoints} fill="url(#weightGrad)" />
                )}

                {/* Weight Path Line */}
                {sortedWeightData.length > 1 ? (
                  <polyline points={weightPathPoints} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <circle cx={getWeightX(0)} cy={getWeightY(sortedWeightData[0].weight)} r="4" fill="#f97316" />
                )}

                {/* Interactive Dots & Tooltip trigger areas */}
                {sortedWeightData.map((d, i) => {
                  const cx = getWeightX(i);
                  const cy = getWeightY(d.weight);
                  const isHovered = hoveredWeightIndex === i;

                  return (
                    <g key={i}>
                      {/* Visual dot */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke="#f97316"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredWeightIndex(i)}
                        onMouseLeave={() => setHoveredWeightIndex(null)}
                      />

                      {/* X Axis labels */}
                      <text
                        x={cx}
                        y={height - 10}
                        fontSize="7"
                        textAnchor="middle"
                        className="fill-stone-400 dark:fill-stone-500 font-medium"
                      >
                        {formatDateLabel(d.date)}
                      </text>

                      {/* Invisible larger hover trigger */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={18}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredWeightIndex(i)}
                        onMouseLeave={() => setHoveredWeightIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Custom Tooltip */}
              {hoveredWeightIndex !== null && sortedWeightData[hoveredWeightIndex] && (
                <div
                  className="absolute bg-stone-950 text-white rounded-xl p-2.5 shadow-xl border border-stone-800 text-[10px] space-y-0.5 pointer-events-none transition-all duration-200 z-10"
                  style={{
                    left: `${Math.max(5, Math.min(width - 100, getWeightX(hoveredWeightIndex) - 45))}px`,
                    top: `${Math.max(0, getWeightY(sortedWeightData[hoveredWeightIndex].weight) - 62)}px`,
                  }}
                >
                  <p className="font-bold text-orange-400">{sortedWeightData[hoveredWeightIndex].date}</p>
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-450">Peso:</span>
                    <span className="font-bold">{sortedWeightData[hoveredWeightIndex].weight} kg</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-450">Cond. Corp:</span>
                    <span className="font-bold text-amber-400">{sortedWeightData[hoveredWeightIndex].bcs}/9</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Trigger and List Toggle */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center">
            <span className="text-[10px] text-stone-450 font-bold uppercase">Historial ({sortedWeightData.length})</span>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-[10px] bg-orange-50 text-orange-650 dark:bg-orange-950/30 dark:text-orange-400 font-bold py-1.5 px-3 rounded-xl border border-orange-100/50 hover:bg-orange-100/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Registrar Peso
            </button>
          </div>

          {/* Add Weight Form Overlay / Inline Drawer */}
          {showForm && (
            <form onSubmit={handleFormSubmit} className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-3.5 rounded-2xl space-y-2.5 animate-slide-up">
              <div className="flex justify-between items-center border-b border-stone-200/50 dark:border-stone-800/40 pb-1.5">
                <h4 className="text-[10px] font-bold text-stone-750 dark:text-stone-300 uppercase tracking-wide">
                  Nuevo Registro de Peso
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-[10px] text-stone-400 hover:text-stone-600"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <label className="block text-stone-400 mb-0.5">Peso (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="120"
                    required
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Ej: 11.5"
                    className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-0.5">Fecha</label>
                  <input
                    type="date"
                    required
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 mb-1 flex justify-between">
                  <span>Condición Corporal (BCS):</span>
                  <span className="font-bold text-orange-600">{bcsInput}/9</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={bcsInput}
                  onChange={(e) => setBcsInput(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-1 bg-stone-200 dark:bg-stone-800 rounded-lg"
                />
              </div>

              {formSuccess ? (
                <div className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 py-2 rounded-xl text-center font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ¡Peso registrado con éxito!
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer"
                >
                  Registrar Peso
                </button>
              )}
            </form>
          )}

          {/* Weight history entries manager */}
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
            {sortedWeightData.slice().reverse().map((rec, idx) => {
              // Map sorted index back to original index in weightHistory to support delete
              const origIdx = weightHistory.findIndex(w => w.date === rec.date && w.weight === rec.weight);
              
              return (
                <div key={rec.date + "-" + rec.weight} className="flex justify-between items-center text-[10px] bg-stone-50/50 dark:bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-100/40 dark:border-stone-850">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400">{rec.date}</span>
                    <span className="font-extrabold text-stone-700 dark:text-stone-300">{rec.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold">BCS {rec.bcs}</span>
                    {onDeleteWeightRecord && weightHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteWeightRecord(origIdx)}
                        className="text-stone-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                        title="Borrar registro"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // 2. CALORIE CHART VIEW
        <div>
          {/* Calorie target check */}
          <div className="flex items-center justify-between mb-4 bg-stone-50 dark:bg-stone-850/40 px-3.5 py-2 rounded-2xl border border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Consumo Promedio:
            </span>
            <span className="font-bold text-stone-800 dark:text-stone-200">
              447 Kcal / día <span className="text-orange-500 font-medium">(Meta: 450)</span>
            </span>
          </div>

          {/* Calorie SVG Bar Chart */}
          <div className="relative h-[180px] w-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              {/* Grid Lines */}
              <line
                x1={paddingLeft}
                y1={getCalorieY(450)}
                x2={width - paddingRight}
                y2={getCalorieY(450)}
                stroke="#f97316"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.8"
              />
              <line
                x1={paddingLeft}
                y1={getCalorieY(300)}
                x2={width - paddingRight}
                y2={getCalorieY(300)}
                stroke="#e7e5e4"
                strokeWidth="0.5"
                className="dark:stroke-stone-800"
              />
              <line
                x1={paddingLeft}
                y1={getCalorieY(150)}
                x2={width - paddingRight}
                y2={getCalorieY(150)}
                stroke="#e7e5e4"
                strokeWidth="0.5"
                className="dark:stroke-stone-800"
              />

              {/* Y Axis Labels */}
              <text x={paddingLeft - 8} y={getCalorieY(450) + 3} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                450
              </text>
              <text x={paddingLeft - 8} y={getCalorieY(300) + 3} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                300
              </text>
              <text x={paddingLeft - 8} y={getCalorieY(150) + 3} fontSize="8" textAnchor="end" className="fill-stone-400 font-mono">
                150
              </text>

              {/* Target Calorie Text */}
              <text
                x={width - paddingRight - 2}
                y={getCalorieY(450) - 4}
                fontSize="7"
                textAnchor="end"
                className="fill-orange-600 dark:fill-orange-400 font-bold"
              >
                Límite Diario (450 Kcal)
              </text>

              {/* Bars */}
              {calorieData.map((d, i) => {
                const x = getCalorieX(i);
                const y = getCalorieY(d.consumed);
                const bottomY = height - paddingBottom;
                const barHeight = bottomY - y;
                const barWidth = 14;

                const isOver = d.consumed > d.target;
                const barColor = isOver ? "#f59e0b" : "#f97316"; // Amber or Orange accent
                const isHovered = hoveredCalorieIndex === i;

                return (
                  <g key={i}>
                    {/* Background track (subtle) */}
                    <rect
                      x={x - barWidth / 2}
                      y={paddingTop}
                      width={barWidth}
                      height={bottomY - paddingTop}
                      fill="#000000"
                      opacity="0.02"
                      rx="4"
                    />

                    {/* Calorie value bar */}
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      fill={barColor}
                      opacity={isHovered ? "1" : "0.75"}
                      rx="4"
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredCalorieIndex(i)}
                      onMouseLeave={() => setHoveredCalorieIndex(null)}
                    />

                    {/* X Axis Labels */}
                    <text
                      x={x}
                      y={height - 10}
                      fontSize="8"
                      textAnchor="middle"
                      className="fill-stone-400 dark:fill-stone-500 font-medium"
                    >
                      {d.day}
                    </text>

                    {/* Invisible larger hover area */}
                    <rect
                      x={x - barWidth}
                      y={paddingTop}
                      width={barWidth * 2}
                      height={bottomY - paddingTop}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCalorieIndex(i)}
                      onMouseLeave={() => setHoveredCalorieIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Calorie Tooltip */}
            {hoveredCalorieIndex !== null && (
              <div
                className="absolute bg-stone-950 text-white rounded-xl p-2 shadow-xl border border-stone-800 text-[10px] space-y-0.5 pointer-events-none transition-all duration-200 z-10"
                style={{
                  left: `${getCalorieX(hoveredCalorieIndex) - 40}px`,
                  top: `${getCalorieY(calorieData[hoveredCalorieIndex].consumed) - 50}px`,
                }}
              >
                <p className="font-bold text-stone-300">{calorieData[hoveredCalorieIndex].day}</p>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-400">Consumido:</span>
                  <span
                    className={`font-bold ${
                      calorieData[hoveredCalorieIndex].consumed > calorieData[hoveredCalorieIndex].target
                        ? "text-amber-400"
                        : "text-orange-400"
                    }`}
                  >
                    {calorieData[hoveredCalorieIndex].consumed} Kcal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
