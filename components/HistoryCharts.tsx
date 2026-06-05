"use client";

import React, { useState } from "react";
import { TrendingDown, Calendar } from "lucide-react";

interface WeightPoint {
  label: string;
  weight: number;
  bcs: number; // Body Condition Score
}

interface CaloriePoint {
  day: string;
  consumed: number;
  target: number;
}

export default function HistoryCharts() {
  const [activeTab, setActiveTab] = useState<"weight" | "calories">("weight");
  const [hoveredWeightIndex, setHoveredWeightIndex] = useState<number | null>(null);
  const [hoveredCalorieIndex, setHoveredCalorieIndex] = useState<number | null>(null);

  // Mock Weight Loss Data (12 weeks progress)
  const weightData: WeightPoint[] = [
    { label: "Semana 1", weight: 14.5, bcs: 8 },
    { label: "Semana 3", weight: 14.1, bcs: 8 },
    { label: "Semana 5", weight: 13.6, bcs: 7 },
    { label: "Semana 7", weight: 13.0, bcs: 7 },
    { label: "Semana 9", weight: 12.5, bcs: 6 },
    { label: "Semana 11", weight: 12.1, bcs: 6 },
  ];

  const targetWeight = 11.0;

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

  // Weight chart calculations
  const maxWeight = 15.0;
  const minWeight = 10.0;
  const getWeightY = (w: number) => {
    const scale = (height - paddingTop - paddingBottom) / (maxWeight - minWeight);
    return height - paddingBottom - (w - minWeight) * scale;
  };
  const getWeightX = (index: number) => {
    const scale = (width - paddingLeft - paddingRight) / (weightData.length - 1);
    return paddingLeft + index * scale;
  };

  // Build SVG Path for Weight line
  const weightPathPoints = weightData
    .map((d, i) => `${getWeightX(i)},${getWeightY(d.weight)}`)
    .join(" ");

  // Build SVG Path for Weight area gradient fill
  const weightAreaPoints = `${getWeightX(0)},${height - paddingBottom} ${weightPathPoints} ${getWeightX(
    weightData.length - 1
  )},${height - paddingBottom}`;

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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          Monitoreo de Progreso
        </h3>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl flex">
          <button
            onClick={() => setActiveTab("weight")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "weight"
                ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Peso
          </button>
          <button
            onClick={() => setActiveTab("calories")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "calories"
                ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Calorías
          </button>
        </div>
      </div>

      {activeTab === "weight" ? (
        <div>
          {/* Weight loss micro metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/20 rounded-2xl p-2.5 text-center">
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Peso Inicial</p>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">14.5 kg</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Peso Actual</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">12.1 kg</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Baja de Peso</p>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">-2.4 kg (-16%)</p>
            </div>
          </div>

          {/* Interactive Weight SVG Chart */}
          <div className="relative h-[180px] w-full flex items-center justify-center">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingLeft}
                y1={getWeightY(15)}
                x2={width - paddingRight}
                y2={getWeightY(15)}
                stroke="#e4e4e7"
                strokeWidth="0.5"
                className="dark:stroke-zinc-800"
              />
              <line
                x1={paddingLeft}
                y1={getWeightY(13)}
                x2={width - paddingRight}
                y2={getWeightY(13)}
                stroke="#e4e4e7"
                strokeWidth="0.5"
                className="dark:stroke-zinc-800"
              />
              <line
                x1={paddingLeft}
                y1={getWeightY(11)}
                x2={width - paddingRight}
                y2={getWeightY(11)}
                stroke="#e4e4e7"
                strokeWidth="0.5"
                className="dark:stroke-zinc-800"
              />

              {/* Y Axis Labels */}
              <text x={paddingLeft - 8} y={getWeightY(15) + 4} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                15k
              </text>
              <text x={paddingLeft - 8} y={getWeightY(13) + 4} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                13k
              </text>
              <text x={paddingLeft - 8} y={getWeightY(11) + 4} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                11k
              </text>

              {/* Target Weight Reference Line (Dashed) */}
              <line
                x1={paddingLeft}
                y1={getWeightY(targetWeight)}
                x2={width - paddingRight}
                y2={getWeightY(targetWeight)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.8"
              />
              <text
                x={width - paddingRight - 2}
                y={getWeightY(targetWeight) - 4}
                fontSize="7"
                textAnchor="end"
                className="fill-emerald-600 dark:fill-emerald-400 font-bold"
              >
                Meta: 11kg
              </text>

              {/* Weight Area Fill */}
              <polygon points={weightAreaPoints} fill="url(#weightGrad)" />

              {/* Weight Path Line */}
              <polyline points={weightPathPoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Interactive Dots & Tooltip trigger areas */}
              {weightData.map((d, i) => {
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
                      stroke="#10b981"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredWeightIndex(i)}
                      onMouseLeave={() => setHoveredWeightIndex(null)}
                    />

                    {/* X Axis labels */}
                    <text
                      x={cx}
                      y={height - 10}
                      fontSize="8"
                      textAnchor="middle"
                      className="fill-zinc-400 dark:fill-zinc-500 font-medium"
                    >
                      {d.label.split(" ")[1]}
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
            {hoveredWeightIndex !== null && (
              <div
                className="absolute bg-zinc-950 text-white rounded-xl p-2.5 shadow-xl border border-zinc-800 text-[10px] space-y-0.5 pointer-events-none transition-all duration-200 z-10"
                style={{
                  left: `${getWeightX(hoveredWeightIndex) - 45}px`,
                  top: `${getWeightY(weightData[hoveredWeightIndex].weight) - 62}px`,
                }}
              >
                <p className="font-bold text-emerald-400">{weightData[hoveredWeightIndex].label}</p>
                <div className="flex justify-between gap-3">
                  <span className="text-zinc-400">Peso:</span>
                  <span className="font-bold">{weightData[hoveredWeightIndex].weight} kg</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-zinc-400">Cond. Corporal:</span>
                  <span className="font-bold text-amber-400">{weightData[hoveredWeightIndex].bcs}/9</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Calorie target check */}
          <div className="flex items-center justify-between mb-4 bg-zinc-50 dark:bg-zinc-800/40 px-3.5 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Consumo Promedio:
            </span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              447 Kcal / día <span className="text-emerald-500 font-medium">(Meta: 450)</span>
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
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.8"
              />
              <line
                x1={paddingLeft}
                y1={getCalorieY(300)}
                x2={width - paddingRight}
                y2={getCalorieY(300)}
                stroke="#e4e4e7"
                strokeWidth="0.5"
                className="dark:stroke-zinc-800"
              />
              <line
                x1={paddingLeft}
                y1={getCalorieY(150)}
                x2={width - paddingRight}
                y2={getCalorieY(150)}
                stroke="#e4e4e7"
                strokeWidth="0.5"
                className="dark:stroke-zinc-800"
              />

              {/* Y Axis Labels */}
              <text x={paddingLeft - 8} y={getCalorieY(450) + 3} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                450
              </text>
              <text x={paddingLeft - 8} y={getCalorieY(300) + 3} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                300
              </text>
              <text x={paddingLeft - 8} y={getCalorieY(150) + 3} fontSize="8" textAnchor="end" className="fill-zinc-400 font-mono">
                150
              </text>

              {/* Target Calorie Text */}
              <text
                x={width - paddingRight - 2}
                y={getCalorieY(450) - 4}
                fontSize="7"
                textAnchor="end"
                className="fill-emerald-600 dark:fill-emerald-400 font-bold"
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
                const barColor = isOver ? "#f59e0b" : "#10b981"; // Amber or Emerald
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
                      className="fill-zinc-400 dark:fill-zinc-500 font-medium"
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
                className="absolute bg-zinc-950 text-white rounded-xl p-2 shadow-xl border border-zinc-800 text-[10px] space-y-0.5 pointer-events-none transition-all duration-200 z-10"
                style={{
                  left: `${getCalorieX(hoveredCalorieIndex) - 40}px`,
                  top: `${getCalorieY(calorieData[hoveredCalorieIndex].consumed) - 50}px`,
                }}
              >
                <p className="font-bold text-zinc-300">{calorieData[hoveredCalorieIndex].day}</p>
                <div className="flex justify-between gap-2">
                  <span className="text-zinc-400">Consumido:</span>
                  <span
                    className={`font-bold ${
                      calorieData[hoveredCalorieIndex].consumed > calorieData[hoveredCalorieIndex].target
                        ? "text-amber-400"
                        : "text-emerald-400"
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
