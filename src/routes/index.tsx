import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Box,
  Radio,
  History,
  FileText,
  Settings,
  Bell,
  Thermometer,
  Droplets,
  Cloud,
  MapPin,
  Brain,
  AlertTriangle,
  Wind,
  Clock,
  CircleDot,
  User,
  Activity,
  Database,
  Server,
  ShieldCheck,
  BarChart3,
  Download,
  SlidersHorizontal,
  Wifi,
  BatteryMedium,
  Search,
  CalendarDays,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceArea,
  Tooltip,
  CartesianGrid,
} from "recharts";
import floorPlan from "@/assets/floor-plan-heatmap.jpg";
import ccnLogo from "@/assets/ccn-logo-branco.png";
import sensorEm300Image from "@/assets/em300-th.webp";
import sensorAm103Image from "@/assets/amc103l.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fleury — Supervisório Ambiental" },
      { name: "description", content: "Supervisório ambiental para monitoramento de temperatura, umidade e CO₂." },
    ],
  }),
  component: App,
});

type Period = "today" | "week" | "month";
type Layer = "temperature" | "humidity" | "co2";
type View = "dashboard" | "plant" | "sensors" | "history" | "alarms" | "insights" | "reports" | "settings" | "network";

type Sensor = {
  dev_eui: string;
  model?: string;
  sensor_id: string;
  sensor_name: string;
  area: string;
  floor: string;
  x: number | null;
  y: number | null;
  temperature: number | null;
  humidity: number | null;
  co2: number | null;
  battery: number | null;
  rssi: number | null;
  snr: number | null;
  temperature_status?: string;
  timestamp?: string;
  alarm_type?: string | null;
  alarm_severity?: string | null;
};

type DashboardPayload = {
  ok: boolean;
  updatedAt: string;
  refreshSeconds: number;
  expectedSensors: number;
  sensorsOnline: number;
  kpis: {
    temperatureAvg: number | null;
    temperatureMin: number | null;
    temperatureMax: number | null;
    humidityAvg: number | null;
    co2Avg: number | null;
    activeAlarms: number;
  };
  alarms: any[];
  sensors: Sensor[];
};

type HistoryRecord = Sensor & {
  reading_time?: string;
  humidity?: number | null;
  co2?: number | null;
};

type HistoryPayload = {
  ok: boolean;
  count: number;
  summary?: any;
  insights?: string[];
  records: HistoryRecord[];
};

type AlarmSettings = {
  temperature_low: number;
  temperature_high: number;
  humidity_low: number;
  humidity_high: number;
  co2_low: number;
  co2_high: number;
};

type ApiState = {
  loading: boolean;
  error: string | null;
};

const N8N_BASE = (import.meta as any).env?.VITE_N8N_BASE_URL || "https://fleury-bh-n8n.gpfgqx.easypanel.host/webhook";
const ENABLE_MOCKS = (import.meta as any).env?.VITE_ENABLE_MOCKS === "true";

const DEFAULT_ALARM_SETTINGS: AlarmSettings = {
  temperature_low: 21.5,
  temperature_high: 25,
  humidity_low: 35,
  humidity_high: 65,
  co2_low: 400,
  co2_high: 1000,
};

const periodLabel: Record<Period, string> = {
  today: "Hoje",
  week: "Semana",
  month: "Mês",
};

const periodQuery: Record<Period, string> = {
  today: "24 hours",
  week: "7 days",
  month: "30 days",
};

const layerConfig: Record<Layer, { label: string; unit: string; icon: any; stops: string[]; ticks: { value: number; label: string; tone?: string }[] }> = {
  temperature: {
    label: "Temperatura",
    unit: "°C",
    icon: Thermometer,
    stops: ["#2563eb", "#06b6d4", "#22c55e", "#facc15", "#f97316", "#ef4444"],
    ticks: [
      { value: 28, label: "28.0", tone: "Quente" },
      { value: 26, label: "26.0" },
      { value: 24, label: "24.0" },
      { value: 22, label: "22.0" },
      { value: 20, label: "20.0" },
      { value: 18, label: "18.0", tone: "Frio" },
    ],
  },
  humidity: {
    label: "Umidade",
    unit: "%",
    icon: Droplets,
    stops: ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#2563eb"],
    ticks: [
      { value: 75, label: "75", tone: "Alta" },
      { value: 65, label: "65" },
      { value: 55, label: "55" },
      { value: 45, label: "45" },
      { value: 35, label: "35" },
      { value: 25, label: "25", tone: "Baixa" },
    ],
  },
  co2: {
    label: "CO₂",
    unit: "ppm",
    icon: Cloud,
    stops: ["#22c55e", "#84cc16", "#facc15", "#f97316", "#ef4444"],
    ticks: [
      { value: 1400, label: "1400", tone: "Ruim" },
      { value: 1200, label: "1200" },
      { value: 1000, label: "1000" },
      { value: 800, label: "800" },
      { value: 600, label: "600" },
      { value: 400, label: "400", tone: "Bom" },
    ],
  },
};

const sensorRegistry: Sensor[] = [
  { dev_eui: "24E124136E312780", sensor_id: "EM300-01", sensor_name: "EM300-01", area: "Recepção", floor: "Térreo", x: 6, y: 35, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124136E314787", sensor_id: "EM300-02", sensor_name: "EM300-02", area: "Espera", floor: "Térreo", x: 41, y: 42, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124136E314516", sensor_id: "EM300-03", sensor_name: "EM300-03", area: "Coleta 01", floor: "Térreo", x: 58, y: 42, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124136E314466", sensor_id: "EM300-04", sensor_name: "EM300-04", area: "Coleta 02", floor: "Térreo", x: 75, y: 42, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124136E311869", sensor_id: "EM300-05", sensor_name: "EM300-05", area: "Triagem", floor: "Térreo", x: 88, y: 62, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124136E312236", sensor_id: "EM300-06", sensor_name: "EM300-06", area: "Recepção Central", floor: "Térreo", x: 68, y: 58, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F471011", sensor_id: "AM103L-07", sensor_name: "AM 103 L - 07", area: "Corredor 01", floor: "Térreo", x: 62, y: 78, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F478289", sensor_id: "AM103L-08", sensor_name: "AM 103 L - 08", area: "Consultório 01", floor: "Térreo", x: 50, y: 65, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F454786", sensor_id: "AM103L-09", sensor_name: "AM 103 L - 09", area: "Consultório 02", floor: "Térreo", x: 38, y: 60, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F454815", sensor_id: "AM103L-10", sensor_name: "AM 103 L - 10", area: "Laboratório", floor: "Térreo", x: 18, y: 78, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F478878", sensor_id: "AM103L-11", sensor_name: "AM 103 L - 11", area: "Sala Técnica", floor: "Térreo", x: 23, y: 42, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F457456", sensor_id: "AM103L-12", sensor_name: "AM 103 L - 12", area: "Administrativo", floor: "Térreo", x: 32, y: 22, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F478841", sensor_id: "AM103L-13", sensor_name: "AM 103 L - 13", area: "Sala de Exames 01", floor: "Térreo", x: 47, y: 16, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F478688", sensor_id: "AM103L-14", sensor_name: "AM 103 L - 14", area: "Sala de Exames 02", floor: "Térreo", x: 64, y: 16, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
  { dev_eui: "24E124725F458532", sensor_id: "AM103L-15", sensor_name: "AM 103 L - 15", area: "Apoio", floor: "Térreo", x: 86, y: 28, temperature: null, humidity: null, co2: null, battery: null, rssi: null, snr: null },
];

function isEm300Sensor(sensor: Sensor | null | undefined) {
  const id = `${sensor?.model || ""} ${sensor?.sensor_id || ""} ${sensor?.sensor_name || ""}`.toUpperCase();
  return id.includes("EM300");
}

function isAm103Sensor(sensor: Sensor | null | undefined) {
  return !isEm300Sensor(sensor);
}

function sensorDisplayImage(sensor: Sensor) {
  return isEm300Sensor(sensor) ? sensorEm300Image : sensorAm103Image;
}

function valueForLayer(sensor: Sensor, layer: Layer) {
  const value = sensor[layer];
  return typeof value === "number" ? value : null;
}

function toneForSensor(sensor: Sensor, layer: Layer) {
  const value = valueForLayer(sensor, layer);
  if (value === null) return "neutral";
  if (layer === "temperature") {
    if (value < 21.5) return "cold";
    if (value > 25) return "hot";
    if (value > 24.3) return "warm";
    return "cool";
  }
  if (layer === "humidity") {
    if (value < 35) return "hot";
    if (value > 65) return "cold";
    if (value >= 40 && value <= 60) return "cool";
    return "warm";
  }
  if (value < 600) return "cool";
  if (value < 900) return "warm";
  return "hot";
}

const pinTone: Record<string, string> = {
  neutral: "from-slate-400 to-slate-600 shadow-[0_0_16px_rgba(148,163,184,0.5)]",
  cold: "from-sky-400 to-blue-600 shadow-[0_0_18px_rgba(56,189,248,0.7)]",
  cool: "from-cyan-300 to-teal-500 shadow-[0_0_18px_rgba(45,212,191,0.7)]",
  warm: "from-yellow-300 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.7)]",
  hot: "from-orange-400 to-red-600 shadow-[0_0_22px_rgba(239,68,68,0.85)]",
};


const layerRanges: Record<Layer, { min: number; max: number }> = {
  temperature: { min: 18, max: 28 },
  humidity: { min: 25, max: 75 },
  co2: { min: 400, max: 1400 },
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function layerRatio(layer: Layer, value: number) {
  const range = layerRanges[layer];
  return clamp((value - range.min) / (range.max - range.min));
}

function heatColor(layer: Layer, value: number, opacity = 0.58) {
  const ratio = layerRatio(layer, value);
  if (layer === "humidity") {
    if (ratio < 0.28) return `rgba(249,115,22,${opacity})`;
    if (ratio < 0.48) return `rgba(250,204,21,${opacity})`;
    if (ratio < 0.72) return `rgba(34,197,94,${opacity})`;
    return `rgba(56,189,248,${opacity})`;
  }
  if (layer === "co2") {
    if (ratio < 0.25) return `rgba(34,197,94,${opacity})`;
    if (ratio < 0.55) return `rgba(250,204,21,${opacity})`;
    if (ratio < 0.75) return `rgba(249,115,22,${opacity})`;
    return `rgba(239,68,68,${opacity})`;
  }
  if (ratio < 0.22) return `rgba(37,99,235,${opacity})`;
  if (ratio < 0.42) return `rgba(6,182,212,${opacity})`;
  if (ratio < 0.62) return `rgba(34,197,94,${opacity})`;
  if (ratio < 0.80) return `rgba(250,204,21,${opacity})`;
  return `rgba(239,68,68,${opacity})`;
}

function layerValueText(sensor: Sensor, layer: Layer) {
  const value = valueForLayer(sensor, layer);
  if (value === null) return "--";
  return layer === "co2" ? `${formatInt(value)} ppm` : `${formatDecimal(value, 1)} ${layerConfig[layer].unit}`;
}

function heatmapBackground(sensors: Sensor[], layer: Layer) {
  const withValues = sensors
    .filter((sensor) => !(layer === "co2" && isEm300Sensor(sensor)))
    .map((sensor) => ({ sensor, value: valueForLayer(sensor, layer) }))
    .filter((item): item is { sensor: Sensor; value: number } => typeof item.value === "number");

  if (!withValues.length) {
    return "radial-gradient(circle at 50% 50%, rgba(14,165,233,.25), transparent 36%)";
  }

  return withValues
    .map(({ sensor, value }) => {
      const x = sensor.x ?? 50;
      const y = sensor.y ?? 50;
      return `radial-gradient(circle at ${x}% ${y}%, ${heatColor(layer, value, 0.72)} 0%, ${heatColor(layer, value, 0.40)} 9%, transparent 23%)`;
    })
    .join(",");
}

function formatDecimal(value: number | null | undefined, digits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatInt(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return Math.round(value).toLocaleString("pt-BR");
}

function makeMockDashboard(period: Period): DashboardPayload {
  const factor = period === "today" ? 0 : period === "week" ? -0.2 : -0.4;
  const sensors = sensorRegistry.map((s, i) => ({
    ...s,
    timestamp: new Date(Date.now() - (i % 4) * 60_000).toISOString(),
    temperature: typeof s.temperature === "number" ? +(s.temperature + factor + Math.sin(i) * 0.12).toFixed(1) : null,
    humidity: typeof s.humidity === "number" ? +(s.humidity + Math.cos(i) * 0.4).toFixed(1) : null,
    co2: typeof s.co2 === "number" ? Math.round(s.co2 + Math.sin(i / 2) * 20) : null,
  }));
  const temps = sensors.map((s) => s.temperature).filter((v): v is number => typeof v === "number");
  const hums = sensors.map((s) => s.humidity).filter((v): v is number => typeof v === "number");
  const co2s = sensors.map((s) => s.co2).filter((v): v is number => typeof v === "number");
  const alarms = sensors.filter((s) => typeof s.temperature === "number" && (s.temperature < 21.5 || s.temperature > 25)).map((s) => ({
    sensor_id: s.sensor_id,
    sensor_name: s.sensor_name,
    area: s.area,
    type: s.temperature! < 21.5 ? "temperature_low" : "temperature_high",
    severity: "warning",
    value: s.temperature,
    timestamp: s.timestamp,
  }));
  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    refreshSeconds: 300,
    expectedSensors: 15,
    sensorsOnline: sensors.length,
    kpis: {
      temperatureAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
      temperatureMin: Math.min(...temps),
      temperatureMax: Math.max(...temps),
      humidityAvg: hums.reduce((a, b) => a + b, 0) / hums.length,
      co2Avg: co2s.reduce((a, b) => a + b, 0) / co2s.length,
      activeAlarms: alarms.length,
    },
    alarms,
    sensors,
  };
}

function makeMockHistory(period: Period): HistoryPayload {
  const points = period === "today" ? 24 : period === "week" ? 7 : 30;
  const records: HistoryRecord[] = [];
  for (let i = 0; i < points; i++) {
    sensorRegistry.forEach((s, idx) => {
      const d = new Date();
      if (period === "today") d.setHours(i, 0, 0, 0);
      else d.setDate(d.getDate() - (points - 1 - i));
      records.push({
        ...s,
        reading_time: d.toISOString(),
        temperature: +(22.8 + Math.sin(i / 2 + idx / 3) * 1.2 + (idx === 5 ? 1.5 : 0)).toFixed(1),
        humidity: +(48 + Math.cos(i / 3 + idx / 5) * 4).toFixed(1),
        co2: Math.round(610 + Math.sin(i / 2.5 + idx / 4) * 90 + (idx === 5 ? 120 : 0)),
      });
    });
  }
  return { ok: true, count: records.length, records };
}

function buildChartSeries(history: HistoryPayload | null, period: Period) {
  const records = history?.records || [];
  const groups = new Map<string, HistoryRecord[]>();
  records.forEach((r) => {
    const dt = new Date(r.reading_time || r.timestamp || Date.now());
    const key = period === "today" ? `${String(dt.getHours()).padStart(2, "0")}:00` : `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
    groups.set(key, [...(groups.get(key) || []), r]);
  });
  return Array.from(groups.entries()).map(([t, items]) => {
    const avg = (field: Layer) => {
      const values = items.map((i) => i[field]).filter((v): v is number => typeof v === "number");
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };
    const temps = items.map((i) => i.temperature).filter((v): v is number => typeof v === "number");
    return {
      t,
      temp: +avg("temperature").toFixed(1),
      h: +avg("humidity").toFixed(1),
      c: Math.round(avg("co2")),
      min: temps.length ? Math.min(...temps) : 0,
      max: temps.length ? Math.max(...temps) : 0,
    };
  });
}


function buildSensorTrendFromHistory(history: HistoryPayload | null, sensor: Sensor, field: Layer, fallbackSpread: number, seed: number) {
  const records = (history?.records || [])
    .filter((r) => r.dev_eui === sensor.dev_eui || r.sensor_id === sensor.sensor_id)
    .slice(-24);

  if (!records.length) return [];

  return records.map((r, i) => {
    const dt = new Date(r.reading_time || r.timestamp || Date.now());
    const value = r[field];
    return {
      x: `${String(dt.getHours()).padStart(2, "0")}h`,
      y: Number((typeof value === "number" ? value : sensor[field] ?? 0).toFixed(field === "co2" ? 0 : 1)),
    };
  });
}


function buildSensorDetailSeries(history: HistoryPayload | null, sensor: Sensor, period: Period) {
  const records = (history?.records || [])
    .filter((r) => r.dev_eui === sensor.dev_eui || r.sensor_id === sensor.sensor_id)
    .sort((a, b) => new Date(a.reading_time || a.timestamp || 0).getTime() - new Date(b.reading_time || b.timestamp || 0).getTime())
    .slice(period === "today" ? -48 : -80);

  const source = records.length
    ? records
    : [{ ...sensor, reading_time: sensor.timestamp || new Date().toISOString() } as HistoryRecord];

  return source.map((r) => {
    const dt = new Date(r.reading_time || r.timestamp || Date.now());
    return {
      t: period === "today" ? formatTimePt(dt) : formatDatePt(dt),
      temp: typeof r.temperature === "number" ? Number(r.temperature.toFixed(1)) : null,
      h: typeof r.humidity === "number" ? Number(r.humidity.toFixed(1)) : null,
      c: typeof r.co2 === "number" ? Math.round(r.co2) : null,
    };
  });
}

function calculateDailySensorStats(sensors: Sensor[], history: HistoryPayload | null) {
  const baseRecords = history?.records || [];
  const today = new Date().toISOString().slice(0, 10);
  const records = baseRecords.filter((r) => {
    const t = r.reading_time || r.timestamp;
    return !t || t.slice(0, 10) === today;
  });
  const source = records.length ? records : sensors;
  const nums = (field: Layer) => source.map((s) => s[field]).filter((v): v is number => typeof v === "number");
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const temps = nums("temperature");
  const hums = nums("humidity");
  const co2s = nums("co2");
  return {
    temperatureAvg: avg(temps),
    temperatureMin: temps.length ? Math.min(...temps) : null,
    temperatureMax: temps.length ? Math.max(...temps) : null,
    humidityAvg: avg(hums),
    co2Avg: avg(co2s),
  };
}

function buildHeatmapSensors(period: Period, dashboard: DashboardPayload | null, history: HistoryPayload | null): Sensor[] {
  if (period === "today" && dashboard?.sensors?.length) return dashboard.sensors;
  const records = history?.records || [];
  if (!records.length) return sensorRegistry;
  const grouped = new Map<string, HistoryRecord[]>();
  records.forEach((r) => grouped.set(r.dev_eui, [...(grouped.get(r.dev_eui) || []), r]));
  return Array.from(grouped.entries()).map(([dev, items]) => {
    const base = sensorRegistry.find((s) => s.dev_eui === dev) || (items[0] as Sensor);
    const avg = (field: Layer) => {
      const values = items.map((i) => i[field]).filter((v): v is number => typeof v === "number");
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    };
    return {
      ...base,
      temperature: avg("temperature"),
      humidity: avg("humidity"),
      co2: avg("co2"),
      timestamp: items.at(-1)?.reading_time || items.at(-1)?.timestamp,
    };
  });
}

function isValidDate(date: Date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function formatDatePt(value: Date | string | null | undefined) {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValidDate(date)) return "--";
  return date.toLocaleDateString("pt-BR");
}

function formatTimePt(value: Date | string | null | undefined) {
  if (!value) return "--";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValidDate(date)) return "--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function parseResponseJSON<T>(res: Response, context: string): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (context.includes("/fleury-history")) return { ok: true, count: 0, records: [] } as T;
    if (context.includes("/fleury-dashboard-latest")) return { ok: true, sensors: [], alarms: [], kpis: {}, expectedSensors: sensorRegistry.length, sensorsOnline: 0 } as T;
    if (context.includes("/fleury-settings")) return { ok: true, settings: DEFAULT_ALARM_SETTINGS } as T;
    throw new Error(`${context}: resposta vazia`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${context}: resposta não é JSON válido`);
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await parseResponseJSON<T>(res, url);
}


function numberOrNull(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeSensor(raw: any): Sensor {
  const devEui = String(raw?.dev_eui || raw?.devEUI || raw?.deviceEUI || "").toUpperCase();
  const base = sensorRegistry.find((sensor) => sensor.dev_eui === devEui || sensor.sensor_id === raw?.sensor_id) || sensorRegistry.find((sensor) => sensor.sensor_id === raw?.sensor_id);
  return {
    ...(base || sensorRegistry[0]),
    ...raw,
    dev_eui: devEui || raw?.dev_eui || base?.dev_eui || "",
    sensor_id: raw?.sensor_id || base?.sensor_id || devEui,
    sensor_name: raw?.sensor_name || base?.sensor_name || raw?.sensor_id || devEui,
    model: raw?.model || base?.model || (String(raw?.sensor_id || base?.sensor_id || raw?.sensor_name || "").toUpperCase().includes("EM300") ? "EM300-TH" : "AM103L"),
    area: raw?.area || base?.area || "Sem cadastro",
    floor: raw?.floor || base?.floor || "Térreo",
    x: numberOrNull(raw?.x ?? base?.x),
    y: numberOrNull(raw?.y ?? base?.y),
    temperature: numberOrNull(raw?.temperature),
    humidity: numberOrNull(raw?.humidity),
    co2: numberOrNull(raw?.co2),
    battery: numberOrNull(raw?.battery),
    rssi: numberOrNull(raw?.rssi),
    snr: numberOrNull(raw?.snr),
    timestamp: raw?.timestamp || raw?.reading_time || raw?.received_at || base?.timestamp,
  };
}

function normalizeDashboard(payload: any): DashboardPayload {
  const source = payload && typeof payload === "object" ? payload : {};
  const sensors = Array.isArray(source.sensors) ? source.sensors.map(normalizeSensor) : sensorRegistry;
  const online = sensors.filter((sensor) => !!sensor.timestamp || typeof sensor.temperature === "number" || typeof sensor.humidity === "number" || typeof sensor.co2 === "number").length;
  const kpis = source.kpis || {};
  return {
    ok: source.ok !== false,
    updatedAt: source.updatedAt || source.updated_at || "",
    refreshSeconds: Number(source.refreshSeconds || source.refresh_seconds || 300),
    expectedSensors: Number(source.expectedSensors || source.expected_sensors || sensorRegistry.length),
    sensorsOnline: Number(source.sensorsOnline ?? source.sensors_online ?? online),
    sensors,
    alarms: Array.isArray(source.alarms) ? source.alarms : [],
    kpis: {
      temperatureAvg: numberOrNull(kpis.temperatureAvg ?? kpis.temperature_avg),
      temperatureMin: numberOrNull(kpis.temperatureMin ?? kpis.temperature_min),
      temperatureMax: numberOrNull(kpis.temperatureMax ?? kpis.temperature_max),
      humidityAvg: numberOrNull(kpis.humidityAvg ?? kpis.humidity_avg),
      co2Avg: numberOrNull(kpis.co2Avg ?? kpis.co2_avg),
      activeAlarms: Number(kpis.activeAlarms ?? kpis.active_alarms ?? 0),
    },
  };
}

function periodStart(period: Period) {
  const start = new Date();
  if (period === "today") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(start.getDate() - 7);
  else start.setDate(start.getDate() - 30);
  return start;
}

function normalizeHistory(payload: any, period: Period): HistoryPayload {
  const source = payload && typeof payload === "object" ? payload : {};
  const rawRecords = Array.isArray(payload) ? payload : Array.isArray(source.records) ? source.records : Array.isArray(source.data) ? source.data : Array.isArray(source.history) ? source.history : [];
  const start = periodStart(period).getTime();
  const records = rawRecords
    .map((record: any) => ({ ...normalizeSensor(record), reading_time: record?.reading_time || record?.timestamp }))
    .filter((record: HistoryRecord) => {
      const time = record.reading_time || record.timestamp;
      if (!time) return false;
      const t = new Date(time).getTime();
      return Number.isFinite(t) && t >= start;
    });
  return { ok: source.ok !== false, count: records.length, records };
}

function emptyDashboard(): DashboardPayload {
  return {
    ok: false,
    updatedAt: "",
    refreshSeconds: 300,
    expectedSensors: sensorRegistry.length,
    sensorsOnline: 0,
    kpis: { temperatureAvg: null, temperatureMin: null, temperatureMax: null, humidityAvg: null, co2Avg: null, activeAlarms: 0 },
    alarms: [],
    sensors: sensorRegistry,
  };
}

function emptyHistory(): HistoryPayload {
  return { ok: false, count: 0, records: [] };
}

function normalizeSettings(payload: any): AlarmSettings {
  const source = payload?.settings || payload || {};
  return {
    temperature_low: Number(source.temperature_low ?? DEFAULT_ALARM_SETTINGS.temperature_low),
    temperature_high: Number(source.temperature_high ?? DEFAULT_ALARM_SETTINGS.temperature_high),
    humidity_low: Number(source.humidity_low ?? DEFAULT_ALARM_SETTINGS.humidity_low),
    humidity_high: Number(source.humidity_high ?? DEFAULT_ALARM_SETTINGS.humidity_high),
    co2_low: Number(source.co2_low ?? DEFAULT_ALARM_SETTINGS.co2_low),
    co2_high: Number(source.co2_high ?? DEFAULT_ALARM_SETTINGS.co2_high),
  };
}

function buildAlarmsFromSensors(sensors: Sensor[], settings: AlarmSettings) {
  const alarms: any[] = [];
  sensors.forEach((s) => {
    const push = (type: string, value: number | null, unit: string, limit: number) => {
      if (typeof value !== "number") return;
      alarms.push({ sensor_id: s.sensor_id, sensor_name: s.sensor_name, area: s.area, type, severity: "warning", value, unit, limit, timestamp: s.timestamp });
    };
    if (typeof s.temperature === "number") {
      if (s.temperature < settings.temperature_low) push("temperature_low", s.temperature, "°C", settings.temperature_low);
      if (s.temperature > settings.temperature_high) push("temperature_high", s.temperature, "°C", settings.temperature_high);
    }
    if (typeof s.humidity === "number") {
      if (s.humidity < settings.humidity_low) push("humidity_low", s.humidity, "%", settings.humidity_low);
      if (s.humidity > settings.humidity_high) push("humidity_high", s.humidity, "%", settings.humidity_high);
    }
    if (typeof s.co2 === "number") {
      if (s.co2 < settings.co2_low) push("co2_low", s.co2, "ppm", settings.co2_low);
      if (s.co2 > settings.co2_high) push("co2_high", s.co2, "ppm", settings.co2_high);
    }
  });
  return alarms;
}

function applyAlarmSettings(dashboard: DashboardPayload, settings: AlarmSettings): DashboardPayload {
  const baseSensors = dashboard.sensors?.length ? dashboard.sensors : sensorRegistry;
  const alarms = buildAlarmsFromSensors(baseSensors, settings);
  const sensors = baseSensors.map((sensor) => {
    const alarm = alarms.find((a) => a.sensor_id === sensor.sensor_id || a.dev_eui === sensor.dev_eui);
    return { ...sensor, alarm_type: alarm?.type || null, alarm_severity: alarm?.severity || null };
  });
  return {
    ...dashboard,
    sensors,
    expectedSensors: dashboard.expectedSensors || sensorRegistry.length,
    sensorsOnline: dashboard.sensorsOnline ?? sensors.filter((s) => !!s.timestamp).length,
    alarms,
    kpis: { ...dashboard.kpis, activeAlarms: alarms.length },
  };
}

function Sparkline({ data, color, unit = "", label = "Valor", showTooltip = true }: { data: { x: number | string; y: number }[]; color: string; unit?: string; label?: string; showTooltip?: boolean }) {
  const reactId = useId().replace(/:/g, "");
  const gid = `g-${color.replace(/[^a-zA-Z0-9]/g, "")}-${reactId}`;
  return (
    <ResponsiveContainer width="100%" height={34}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showTooltip && data.length > 1 && (
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, opacity: 0.35 }}
            contentStyle={{ background: "#020817", border: "1px solid rgba(148,163,184,.28)", borderRadius: 10, fontSize: 11, boxShadow: "0 14px 40px rgba(0,0,0,.35)" }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value: any) => [`${Number(value).toFixed(unit === "ppm" || unit === "%" ? 0 : 1)}${unit ? ` ${unit}` : ""}`, label]}
            labelFormatter={(value) => String(value)}
          />
        )}
        <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.6} fill={`url(#${gid})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.sin(i / 2 + seed) * 1.2 + Math.cos(i / 3 + seed * 1.7) * 0.8 + seed,
  }));

const sensorTrend = (base: number | undefined | null, seed: number, spread: number, n = 18) =>
  Array.from({ length: n }, (_, i) => ({
    x: `${String(i).padStart(2, "0")}h`,
    y: Number(((base ?? seed) + Math.sin(i / 2 + seed) * spread + Math.cos(i / 3 + seed * 1.7) * spread * 0.45).toFixed(1)),
  }));

function KpiCard({ label, value, unit, delta, deltaTone, color, seed, critical }: { label: string; value: string; unit?: string; delta?: string; deltaTone?: "up" | "down" | "warn"; color: string; seed: number; critical?: boolean }) {
  return (
    <div className="glass rounded-2xl p-2.5 flex flex-col gap-1 min-w-0 h-[82px]">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-xl font-semibold tracking-tight truncate">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        <div className="w-20 shrink-0 -mb-1 text-[10px] text-muted-foreground text-right">tempo real</div>
      </div>
      {delta && (
        <div className={`text-[11px] flex items-center gap-1 ${critical ? "text-critical" : deltaTone === "up" ? "text-success" : deltaTone === "down" ? "text-info" : "text-warning"}`}>
          {critical ? <CircleDot className="h-3 w-3" /> : <span>{deltaTone === "up" ? "↑" : "↓"}</span>}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm transition-all ${active ? "bg-gradient-to-r from-primary/30 to-primary/5 text-white border border-primary/40 shadow-[0_0_20px_-6px_oklch(0.70_0.18_250/0.6)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SensorMapBadge({ sensor, layer, onClick }: { sensor: Sensor; layer: Layer; onClick?: () => void }) {
  const disabledLayer = layer === "co2" && isEm300Sensor(sensor);
  const mainValue = disabledLayer ? null : valueForLayer(sensor, layer);
  const secondary = layer === "temperature" ? sensor.humidity : layer === "humidity" ? sensor.temperature : sensor.humidity;
  const tone = disabledLayer || mainValue === null ? "neutral" : toneForSensor(sensor, layer);
  const shortId = sensor.sensor_id.replace("AM103L-", "AM103L-").replace("EM300-", "EM300-");

  return (
    <button onClick={onClick} className="relative -translate-x-1/2 -translate-y-1/2 group text-left">
      <div className={`min-w-[58px] rounded-lg bg-gradient-to-b ${pinTone[tone]} border border-white/35 px-2 py-1 text-white shadow-lg transition-transform group-hover:scale-105 group-hover:z-20`}>
        <div className="text-[10px] font-bold leading-tight text-center drop-shadow-sm">{shortId}</div>
        <div className="text-[12px] font-semibold leading-tight text-center tabular-nums">{mainValue === null ? "--" : layerValueText(sensor, layer)}</div>
        {typeof secondary === "number" && <div className="text-[10px] leading-tight text-center text-white/90 tabular-nums">{layer === "humidity" ? `${formatDecimal(secondary, 1)} °C` : `${formatDecimal(secondary, 0)}%`}</div>}
      </div>
    </button>
  );
}

function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="glass rounded-2xl px-4 py-2 flex items-center gap-3">
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Período</div>
        <select value={value} onChange={(e) => onChange(e.target.value as Period)} className="bg-transparent text-sm font-medium outline-none cursor-pointer">
          <option value="today" className="bg-slate-900">Hoje</option>
          <option value="week" className="bg-slate-900">Semana</option>
          <option value="month" className="bg-slate-900">Mês</option>
        </select>
      </div>
    </div>
  );
}

function LayerSelector({ layer, onChange }: { layer: Layer; onChange: (l: Layer) => void }) {
  const ActiveIcon = layerConfig[layer].icon;
  return (
    <div className="absolute left-3 top-3 flex flex-col gap-2 w-40 z-10">
      <div className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-2">
        <ActiveIcon className="h-3.5 w-3.5 text-warning" />
        <div className="flex-1">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Camada ativa</div>
          <select value={layer} onChange={(e) => onChange(e.target.value as Layer)} className="text-sm font-medium bg-transparent outline-none cursor-pointer w-full">
            <option value="temperature" className="bg-slate-900">Temperatura</option>
            <option value="humidity" className="bg-slate-900">Umidade</option>
            <option value="co2" className="bg-slate-900">CO₂</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Escala ({layerConfig[layer].unit})</div>
        <div className="flex gap-2">
          <div className="w-3 rounded-full h-24 2xl:h-28" style={{ background: `linear-gradient(to top, ${layerConfig[layer].stops.join(",")})` }} />
          <div className="flex flex-col justify-between text-[10px] text-muted-foreground">
            {layerConfig[layer].ticks.map((tick) => (
              <span key={tick.label}>{tick.label} {tick.tone && <span className={tick.tone === "Quente" || tick.tone === "Ruim" || tick.tone === "Baixa" ? "text-critical" : "text-info"}>{tick.tone}</span>}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DigitalTwinMap({ sensors, layer, period, onLayerChange, onSelectSensor }: { sensors: Sensor[]; layer: Layer; period: Period; onLayerChange: (l: Layer) => void; onSelectSensor: (s: Sensor) => void }) {
  const activeSensors = sensors.length ? sensors : sensorRegistry;
  const heatBackground = heatmapBackground(activeSensors, layer);
  return (
    <div className="dashboard-map glass-strong rounded-2xl p-2 relative overflow-hidden h-full min-h-0">
      <div className="absolute right-4 top-3 z-10 text-xs text-muted-foreground glass rounded-xl px-3 py-1.5">Heatmap por {periodLabel[period].toLowerCase()} • {layerConfig[layer].label}</div>
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#061126] h-full min-h-0">
        <img src={floorPlan} alt="Planta 3D termográfica Fleury" className="absolute inset-0 w-full h-full object-cover object-center" width={1600} height={960} />
        <div className="absolute inset-0 mix-blend-screen opacity-65 transition-opacity duration-700" style={{ background: heatBackground }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,.08),transparent_62%)]" />
        <LayerSelector layer={layer} onChange={onLayerChange} />
        {activeSensors.map((s) => (
          <div key={s.dev_eui || s.sensor_id} className="absolute z-10" style={{ left: `${s.x ?? 50}%`, top: `${s.y ?? 50}%` }}>
            <SensorMapBadge sensor={s} layer={layer} onClick={() => onSelectSensor(s)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SensorDetail({ sensor, history, period }: { sensor: Sensor | null; history: HistoryPayload | null; period: Period }) {
  const s = sensor || sensorRegistry[5];
  const isAlert = !!s.alarm_type;
  const em300 = isEm300Sensor(s);
  const series = buildSensorDetailSeries(history, s, period);
  const metrics = [
    { label: "Temperatura", value: `${formatDecimal(s.temperature)} °C`, color: "#ef4444", dataKey: "temp", unit: "°C" },
    { label: "Umidade", value: `${formatDecimal(s.humidity)} %`, color: "#38bdf8", dataKey: "h", unit: "%" },
    ...(em300 ? [] : [{ label: "CO₂", value: `${formatInt(s.co2)} ppm`, color: "#22c55e", dataKey: "c", unit: "ppm" }]),
  ];

  return (
    <div className="dashboard-sensor-detail glass-strong rounded-2xl p-2.5 flex flex-col gap-1.5 min-w-0 h-full min-h-0">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">{s.sensor_name || s.sensor_id}</div>
        <div className={`flex items-center gap-1.5 text-xs ${isAlert ? "text-critical" : "text-success"}`}><span className={`h-2 w-2 rounded-full ${isAlert ? "bg-critical" : "bg-success"}`} /> {isAlert ? "Alarme" : "Normal"}</div>
      </div>
      <div className="flex items-center gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><div className="leading-tight"><div>{s.area}</div><div className="text-[10px] text-muted-foreground">{s.floor}</div></div></div>
      <div className="flex flex-col gap-1.5 pt-1">
        {metrics.map((m) => {
          const miniData = series
            .map((row) => ({ x: row.t, y: Number((row as any)[m.dataKey]) }))
            .filter((row) => Number.isFinite(row.y));
          return (
            <div key={m.label} className="grid grid-cols-[1fr_auto_72px] items-center gap-2">
              <div className="text-[11px] text-muted-foreground">{m.label}</div>
              <div className="text-sm font-semibold tabular-nums">{m.value}</div>
              <div className="h-6"><Sparkline data={miniData} color={m.color} label={m.label} unit={m.unit} showTooltip={false} /></div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-2 border-t border-white/10">
        <span className="text-muted-foreground">Status</span><span className="text-success text-right">Online</span>
        <span className="text-muted-foreground">Última atualização</span><span className="text-right">{formatTimePt(s.timestamp)}</span>
        <span className="text-muted-foreground">Bateria</span><span className="text-right flex items-center justify-end gap-1.5">{formatInt(s.battery)}%<span className="inline-block w-10 h-1.5 rounded-full bg-white/10 overflow-hidden"><span className="block h-full bg-success" style={{ width: `${s.battery ?? 0}%` }} /></span></span>
        <span className="text-muted-foreground">RSSI / SNR</span><span className="text-right text-success">{formatInt(s.rssi)} / {formatInt(s.snr)}</span>
      </div>
      <div className="pt-2 mt-1.5 border-t border-white/10 flex-1 min-h-0 flex flex-col">
        <div className="text-[11px] text-muted-foreground mb-1.5">Tendência do período</div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="t" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v)=>`${v}°C`} width={30} />
              {!em300 && <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={["dataMin - 80", "dataMax + 80"]} tickFormatter={(v)=>`${v} ppm`} width={42} />}
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} formatter={(value: any, name: any) => {
                const labels: Record<string, string> = { temp: "Temperatura", h: "Umidade", c: "CO₂" };
                const units: Record<string, string> = { temp: "°C", h: "%", c: "ppm" };
                return [`${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: name === "c" ? 0 : 1 })} ${units[name] || ""}`, labels[name] || name];
              }} />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="h" stroke="#38bdf8" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              {!em300 && <Line yAxisId="right" type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ period, setPeriod, layer, setLayer, dashboard, history, selectedSensor, setSelectedSensor, onNavigate, settings }: { period: Period; setPeriod: (p: Period) => void; layer: Layer; setLayer: (l: Layer) => void; dashboard: DashboardPayload | null; history: HistoryPayload | null; selectedSensor: Sensor | null; setSelectedSensor: (s: Sensor) => void; onNavigate: (view: View) => void; settings: AlarmSettings }) {
  const data = dashboard || emptyDashboard();
  const series = useMemo(() => buildChartSeries(history, period), [history, period]);
  const heatmapSensors = useMemo(() => buildHeatmapSensors(period, dashboard, history), [period, dashboard, history]);
  const comfort = Math.max(0, Math.round(((data.expectedSensors - data.kpis.activeAlarms) / data.expectedSensors) * 100));
  return (
    <>
      <Header period={period} setPeriod={setPeriod} updatedAt={data.updatedAt} alarms={data.kpis.activeAlarms} onNavigate={onNavigate} />
      <section className="dashboard-kpis grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 shrink-0 relative z-10">
        <KpiCard label="Temp. média" value={formatDecimal(data.kpis.temperatureAvg)} unit="°C" delta={`${periodLabel[period]} operacional`} deltaTone="up" color="#60a5fa" seed={1} />
        <KpiCard label="Temp. mín." value={formatDecimal(data.kpis.temperatureMin)} unit="°C" delta="Limite frio 21,5 °C" deltaTone="down" color="#22d3ee" seed={2} />
        <KpiCard label="Temp. máx." value={formatDecimal(data.kpis.temperatureMax)} unit="°C" delta="Limite quente 25,0 °C" deltaTone="warn" color="#f97316" seed={3} />
        <KpiCard label="Umidade média" value={formatDecimal(data.kpis.humidityAvg, 0)} unit="%" delta="Faixa ideal 40% - 60%" deltaTone="up" color="#38bdf8" seed={4} />
        <KpiCard label="CO₂ médio" value={formatInt(data.kpis.co2Avg)} unit="ppm" delta={`Faixa ideal ${formatInt(settings.co2_low)} - ${formatInt(settings.co2_high)} ppm`} deltaTone="up" color="#22c55e" seed={5} />
        <KpiCard label="Conforto ambiental" value={`${comfort}`} unit="%" delta={`${data.kpis.activeAlarms} alarmes ativos`} color="#ef4444" seed={6} critical={data.kpis.activeAlarms > 0} />
      </section>
      <section className="dashboard-main-grid grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px] gap-2.5 flex-1 min-h-0">
        <DigitalTwinMap sensors={heatmapSensors} layer={layer} period={period} onLayerChange={setLayer} onSelectSensor={setSelectedSensor} />
        <SensorDetail sensor={selectedSensor || heatmapSensors[5]} history={history} period={period} />
      </section>
      <ChartsAndInsights series={series} dashboard={data} period={period} onNavigate={onNavigate} />
      <RecentAlerts alarms={data.alarms} onNavigate={onNavigate} />
    </>
  );
}

function useClientClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function Header({ period, setPeriod, updatedAt, alarms, onNavigate }: { period: Period; setPeriod: (p: Period) => void; updatedAt?: string; alarms: number; onNavigate?: (view: View) => void }) {
  const now = useClientClock();

  return (
    <header className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-2.5 shrink-0 relative z-20">
      <div className="glass rounded-2xl px-3 py-2 flex items-center gap-2.5 text-sm"><span>{formatDatePt(now)}</span><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{formatTimePt(now)}</span></div>
      <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2.5 justify-center"><span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" /><span className="relative rounded-full h-2.5 w-2.5 bg-success" /></span><div className="text-sm"><span className="text-muted-foreground">Status geral </span><span className="font-semibold text-success">Operacional</span><span className="text-muted-foreground ml-3">Atualizado {formatTimePt(updatedAt)}</span></div></div>
      <div className="flex items-center gap-3"><PeriodSelect value={period} onChange={setPeriod} /><button onClick={() => onNavigate?.("alarms")} title="Ver alarmes" className="glass rounded-2xl p-2 relative hover:border-critical/50 transition-colors"><Bell className="h-5 w-5" />{alarms > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-critical text-[10px] font-bold grid place-items-center">{alarms}</span>}</button></div>
    </header>
  );
}

function ChartsAndInsights({ series, dashboard, period, onNavigate }: { series: any[]; dashboard: DashboardPayload; period: Period; onNavigate?: (view: View) => void }) {
  const topSensor = [...dashboard.sensors].sort((a, b) => (b.temperature || 0) - (a.temperature || 0))[0];
  const principalInsight = {
    icon: Thermometer,
    color: "text-warning",
    text: `${topSensor?.area || "Área crítica"} está com a maior temperatura média do período.`,
  };
  const InsightIcon = principalInsight.icon;

  return (
    <section className="dashboard-charts grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px] gap-2.5 h-[146px] shrink-0 min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 min-h-0">
        <ChartCard title={`Temperatura (${periodLabel[period]})`} type="temp" data={series} />
        <ChartCard title={`Umidade Relativa (${periodLabel[period]})`} type="humidity" data={series} />
        <ChartCard title={`CO₂ (${periodLabel[period]})`} type="co2" data={series} />
      </div>

      <div className="glass-strong rounded-2xl p-2.5 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <Brain className="h-4 w-4 text-info" />
          <div className="text-sm font-semibold">Insights Inteligentes</div>
        </div>

        <div className="mt-2 flex-1 min-h-0 flex items-start gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="h-7 w-7 rounded-lg bg-white/5 grid place-items-center shrink-0">
            <InsightIcon className={`h-4 w-4 ${principalInsight.color}`} />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {principalInsight.text}
          </div>
        </div>

        <button onClick={() => onNavigate?.("insights")} className="text-xs text-info hover:underline mt-2 self-start shrink-0">
          Ver todas as análises →
        </button>
      </div>
    </section>
  );
}

function ChartCard({ title, type, data }: { title: string; type: "temp" | "humidity" | "co2"; data: any[] }) {
  const isTemp = type === "temp", isHum = type === "humidity";
  const Icon = isTemp ? Thermometer : isHum ? Droplets : Cloud;
  const color = isTemp ? "#ef4444" : isHum ? "#38bdf8" : "#22c55e";
  const labelColor = isTemp ? "text-critical" : isHum ? "text-info" : "text-success";
  return <div className="glass-strong rounded-2xl p-2.5 min-w-0 h-full min-h-0 flex flex-col"><div className="flex items-center gap-2 text-xs font-medium mb-1 shrink-0"><span className="h-6 w-6 rounded-lg bg-white/5 grid place-items-center"><Icon className={`h-3.5 w-3.5 ${labelColor}`} /></span><span>{title}</span></div><div className="flex-1 min-h-0"><ResponsiveContainer><AreaChart data={data} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}><defs><linearGradient id={`g-${type}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.5} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="t" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={isTemp ? [18, 30] : isHum ? [0, 100] : [0, 1500]} width={28} />{isTemp && <><ReferenceArea y1={21.5} y2={25} fill="#22c55e" fillOpacity={0.10} /><Line type="monotone" dataKey="min" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} /></>}{isHum && <ReferenceArea y1={40} y2={60} fill="#22c55e" fillOpacity={0.12} />}{type === "co2" && <ReferenceArea y1={1000} y2={1500} fill="#ef4444" fillOpacity={0.15} />}<Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} /><Area type="monotone" dataKey={isTemp ? "temp" : isHum ? "h" : "c"} stroke={color} strokeWidth={2} fill={`url(#g-${type})`} isAnimationActive /></AreaChart></ResponsiveContainer></div></div>;
}

function alarmLabel(type: string) {
  const labels: Record<string, string> = {
    temperature_low: "Temperatura baixa",
    temperature_high: "Temperatura alta",
    humidity_low: "Umidade baixa",
    humidity_high: "Umidade alta",
    co2_low: "CO₂ baixo",
    co2_high: "CO₂ alto",
  };
  return labels[type] || type || "Alarme";
}

function RecentAlerts({ alarms, onNavigate }: { alarms: any[]; onNavigate?: (view: View) => void }) {
  const list = alarms || [];
  return <section className="dashboard-alerts glass-strong rounded-2xl p-2 flex flex-col lg:flex-row lg:items-center gap-2 h-[58px] shrink-0 overflow-hidden"><div className="text-sm font-medium shrink-0 lg:w-36">Alertas recentes</div>{list.length === 0 ? <div className="flex-1 text-xs text-muted-foreground">Nenhum alerta ativo com os limites configurados.</div> : <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">{list.slice(0, 3).map((a, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 min-w-0"><div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 text-warning bg-warning/15"><AlertTriangle className="h-4 w-4" /></div><div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{a.sensor_id || a.sensorId}</div><div className="text-[11px] text-muted-foreground truncate">{alarmLabel(a.type)} • {formatDecimal(Number(a.value), a.unit === "ppm" ? 0 : 1)} {a.unit || ""}</div></div><div className="text-right shrink-0"><div className="text-[11px] font-medium text-warning">• Atenção</div><div className="text-[10px] text-muted-foreground">{formatTimePt(a.timestamp)}</div></div></div>)}</div>}<button onClick={() => onNavigate?.("alarms")} className="text-xs text-info hover:underline shrink-0">Ver todos<br/>os alertas</button></section>;
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [period, setPeriod] = useState<Period>("today");
  const [layer, setLayer] = useState<Layer>("temperature");
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [settings, setSettings] = useState<AlarmSettings>(DEFAULT_ALARM_SETTINGS);
  const [apiState, setApiState] = useState<ApiState>({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setApiState((prev) => ({ ...prev, loading: true }));
      const errors: string[] = [];
      const historyUrl = `${N8N_BASE}/fleury-history?period=${encodeURIComponent(periodQuery[period])}&sensor=all&limit=20000`;

      const settingsPayload = await fetchJSON<any>(`${N8N_BASE}/fleury-settings`).catch((error) => {
        errors.push(error?.message || "Falha ao carregar configurações");
        return null;
      });
      const nextSettings = settingsPayload ? normalizeSettings(settingsPayload) : settings;

      let hist = emptyHistory();
      const historyPayload = await fetchJSON<any>(historyUrl).catch((error) => {
        errors.push(error?.message || "Falha ao carregar histórico");
        return null;
      });
      if (historyPayload) hist = normalizeHistory(historyPayload, period);

      let dash: DashboardPayload | null = null;
      if (period === "today") {
        const dashboardPayload = await fetchJSON<any>(`${N8N_BASE}/fleury-dashboard-latest`).catch((error) => {
          errors.push(error?.message || "Falha ao carregar dados atuais");
          return null;
        });
        dash = dashboardPayload ? normalizeDashboard(dashboardPayload) : null;
      }

      if (!dash) {
        dash = hist.records.length ? makeDashboardFromHistory(hist, period, nextSettings) : emptyDashboard();
      }

      if (!mounted) return;
      if (ENABLE_MOCKS && errors.length && !hist.records.length && !dash.sensors.some((sensor) => typeof sensor.temperature === "number" || typeof sensor.humidity === "number" || typeof sensor.co2 === "number")) {
        const mockHist = makeMockHistory(period);
        const mockDash = period === "today" ? makeMockDashboard(period) : makeDashboardFromHistory(mockHist, period, nextSettings);
        setSettings(nextSettings);
        setHistory(mockHist);
        setDashboard(applyAlarmSettings(mockDash, nextSettings));
        setApiState({ loading: false, error: "Dados temporariamente indisponíveis; exibindo modo de demonstração." });
        return;
      }

      setSettings(nextSettings);
      setHistory(hist);
      setDashboard(applyAlarmSettings(dash, nextSettings));
      setApiState({ loading: false, error: errors.length ? `Dados parcialmente indisponíveis: ${errors.join(" | ")}` : null });
    };
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(timer); };
  }, [period]);

  useEffect(() => {
    if (!selectedSensor || !dashboard?.sensors?.length) return;
    const refreshed = dashboard.sensors.find((sensor) => sensor.dev_eui === selectedSensor.dev_eui || sensor.sensor_id === selectedSensor.sensor_id);
    if (refreshed && refreshed !== selectedSensor) setSelectedSensor(refreshed);
  }, [dashboard, selectedSensor]);

  const activeDashboard = dashboard || emptyDashboard();

  return (
    <div className="h-screen w-full flex overflow-hidden text-foreground">
      <aside className="hidden lg:flex h-screen w-[220px] shrink-0 flex-col gap-4 px-4 py-4 border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl overflow-hidden">
        <div className="px-2"><div className="text-2xl font-black tracking-tight">FLEURY</div><div className="text-[9px] tracking-[0.25em] text-muted-foreground mt-0.5">MEDICINA E SAÚDE</div></div>
        <nav className="flex flex-col gap-0.5"><SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} /><SidebarItem icon={Box} label="Planta Operacional" active={view === "plant"} onClick={() => setView("plant")} /><SidebarItem icon={Radio} label="Sensores" active={view === "sensors"} onClick={() => setView("sensors")} /><SidebarItem icon={History} label="Histórico" active={view === "history"} onClick={() => setView("history")} /><SidebarItem icon={Bell} label="Alarmes" active={view === "alarms"} onClick={() => setView("alarms")} /><SidebarItem icon={Brain} label="Insights" active={view === "insights"} onClick={() => setView("insights")} /><SidebarItem icon={FileText} label="Relatórios" active={view === "reports"} onClick={() => setView("reports")} /><SidebarItem icon={Wifi} label="Saúde da Rede" active={view === "network"} onClick={() => setView("network")} /><SidebarItem icon={Settings} label="Configurações" active={view === "settings"} onClick={() => setView("settings")} /></nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="px-2 pb-1"><img src={ccnLogo} alt="CCN Automação" className="w-36 max-w-full opacity-95" /></div>
          <div className="glass rounded-2xl p-3.5"><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-success" /><span className="text-2xl font-bold">{activeDashboard.sensorsOnline}</span></div><div className="text-xs text-muted-foreground mt-1">Sensores online</div></div>
          <div className="glass rounded-2xl p-3.5"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-critical" /><span className="text-2xl font-bold">{activeDashboard.kpis.activeAlarms}</span></div><div className="text-xs text-muted-foreground mt-1">Alertas ativos</div><button onClick={() => setView("alarms")} className="text-[11px] text-info mt-1 hover:underline">Ver todos</button></div>
          <div className="glass rounded-2xl p-3 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center shrink-0"><User className="h-4 w-4" /></div><div className="min-w-0"><div className="text-xs font-medium truncate">Administrador</div><div className="text-[10px] text-muted-foreground truncate">Fleury Unidade SP</div></div></div>
        </div>
      </aside>
      <main className="supervisor-main flex-1 min-w-0 h-screen overflow-hidden p-3 2xl:p-4 flex flex-col gap-3">
        {apiState.error && <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">{apiState.error}</div>}
        {view === "dashboard" && <DashboardHome period={period} setPeriod={setPeriod} layer={layer} setLayer={setLayer} dashboard={dashboard} history={history} selectedSensor={selectedSensor} setSelectedSensor={setSelectedSensor} onNavigate={setView} settings={settings} />}
        {view === "plant" && <PlantView period={period} setPeriod={setPeriod} layer={layer} setLayer={setLayer} dashboard={activeDashboard} history={history} setSelectedSensor={setSelectedSensor} />}
        {view === "sensors" && <SensorsView sensors={activeDashboard.sensors} history={history} />}
        {view === "history" && <HistoryView period={period} setPeriod={setPeriod} history={history} />}
        {view === "alarms" && <AlarmsView alarms={activeDashboard.alarms} sensors={activeDashboard.sensors} settings={settings} />}
        {view === "insights" && <InsightsView dashboard={activeDashboard} history={history} />}
        {view === "reports" && <ReportsView />}
        {view === "network" && <NetworkView sensors={activeDashboard.sensors} />}
        {view === "settings" && <SettingsView sensors={activeDashboard.sensors} initialSettings={settings} onSettingsSaved={setSettings} />}
      </main>
    </div>
  );
}

function makeDashboardFromHistory(history: HistoryPayload, period: Period, settings: AlarmSettings = DEFAULT_ALARM_SETTINGS): DashboardPayload {
  const sensors = buildHeatmapSensors(period, null, history);
  const temps = sensors.map((s) => s.temperature).filter((v): v is number => typeof v === "number");
  const hums = sensors.map((s) => s.humidity).filter((v): v is number => typeof v === "number");
  const co2s = sensors.map((s) => s.co2).filter((v): v is number => typeof v === "number");
  const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const alarms = buildAlarmsFromSensors(sensors, settings);
  return { ok: true, updatedAt: new Date().toISOString(), refreshSeconds: 300, expectedSensors: sensorRegistry.length, sensorsOnline: sensors.filter((sensor) => !!sensor.timestamp || typeof sensor.temperature === "number" || typeof sensor.humidity === "number" || typeof sensor.co2 === "number").length, kpis: { temperatureAvg: avg(temps), temperatureMin: temps.length ? Math.min(...temps) : null, temperatureMax: temps.length ? Math.max(...temps) : null, humidityAvg: avg(hums), co2Avg: avg(co2s), activeAlarms: alarms.length }, alarms, sensors };
}

function PageHeader({ title, description, children }: { title: string; description: string; children?: any }) {
  return <div className="glass-strong rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0"><div><div className="text-xl font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-1">{description}</div></div>{children}</div>;
}

function PlantView({ period, setPeriod, layer, setLayer, dashboard, history, setSelectedSensor }: any) {
  return (
    <>
      <Header period={period} setPeriod={setPeriod} updatedAt={dashboard.updatedAt} alarms={dashboard.kpis.activeAlarms} />
      <section className="plant-full-frame h-[62vh] min-h-[600px] max-h-[720px] shrink-0">
        <DigitalTwinMap sensors={buildHeatmapSensors(period, dashboard, history)} layer={layer} period={period} onLayerChange={setLayer} onSelectSensor={setSelectedSensor} />
      </section>
      <ChartsAndInsights series={buildChartSeries(history, period)} dashboard={dashboard} period={period} />
    </>
  );
}

function MetricBlock({ icon: Icon, label, value, unit, color }: { icon: any; label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="min-w-0">
      <div className="h-6 flex items-center justify-center mb-1">
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="text-lg font-semibold tabular-nums leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{unit}</div>
    </div>
  );
}

function SensorCard({ sensor, index, history }: { sensor: Sensor; index: number; history: HistoryPayload | null }) {
  const isAlert = !!sensor.alarm_type;
  const statusTone = isAlert ? "text-warning" : "text-success";
  const statusLabel = isAlert ? "Atenção" : "Online";
  const em300 = isEm300Sensor(sensor);
  const imageSrc = sensorDisplayImage(sensor);
  const metricColumns = em300 ? "grid-cols-3" : "grid-cols-4";
  const trendColumns = em300 ? "grid-cols-2" : "grid-cols-3";

  return (
    <article className="sensor-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/55 to-slate-950/55 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_16px_40px_-28px_rgba(0,0,0,.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/35 hover:shadow-[0_0_34px_-20px_rgba(56,189,248,.9)]">
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,.14),transparent_45%)]" />
      <div className="relative flex items-start gap-2.5">
        <div className={`h-7 w-7 rounded-lg grid place-items-center text-xs font-bold shrink-0 border ${isAlert ? "bg-warning/15 border-warning/25 text-warning" : "bg-success/15 border-success/25 text-success"}`}>{String(index + 1).padStart(2, "0")}</div>
        <div className="relative h-14 w-20 shrink-0 grid place-items-center overflow-visible -mt-1">
          <img src={imageSrc} alt={em300 ? "Sensor Milesight EM300-TH" : "Sensor Milesight AM103L"} className="max-h-14 max-w-20 object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,.62)] transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-sm truncate">{sensor.sensor_name}</div>
            <div className={`flex items-center gap-1.5 text-xs shrink-0 ${statusTone}`}><span className={`h-2 w-2 rounded-full ${isAlert ? "bg-warning" : "bg-success"}`} />{statusLabel}</div>
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">{sensor.area}</div>
        </div>
      </div>

      <div className={`relative mt-2.5 grid ${metricColumns} gap-2 text-center`}>
        <MetricBlock icon={Thermometer} label="Temp." value={formatDecimal(sensor.temperature)} unit="°C" color="#fb923c" />
        <MetricBlock icon={Droplets} label="Umid." value={formatDecimal(sensor.humidity)} unit="%" color="#38bdf8" />
        {!em300 && <MetricBlock icon={Cloud} label="CO₂" value={formatInt(sensor.co2)} unit="ppm" color="#9db7d7" />}
        <MetricBlock icon={BatteryMedium} label="Bat." value={formatInt(sensor.battery)} unit="%" color="#22c55e" />
      </div>

      <div className="relative mt-2.5 border-t border-white/10 pt-2">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-warning font-medium">Temp.</span>
          <span className="text-info font-medium">Umid.</span>
          {!em300 && <span className="text-success font-medium">CO₂</span>}
          <span className="text-muted-foreground">24h</span>
        </div>
        <div className={`grid ${trendColumns} gap-2 h-7`}>
          <Sparkline data={buildSensorTrendFromHistory(history, sensor, "temperature", 0.35, index + 1)} color="#f59e0b" label="Temperatura" unit="°C" />
          <Sparkline data={buildSensorTrendFromHistory(history, sensor, "humidity", 0.8, index + 3)} color="#38bdf8" label="Umidade" unit="%" />
          {!em300 && <Sparkline data={buildSensorTrendFromHistory(history, sensor, "co2", 18, index + 6)} color="#22c55e" label="CO₂" unit="ppm" />}
        </div>
      </div>
    </article>
  );
}

function SensorsView({ sensors, history }: { sensors: Sensor[]; history: HistoryPayload | null }) {
  const values = sensors.length ? sensors : sensorRegistry;
  const stats = calculateDailySensorStats(values, history);
  const activeAlarms = values.filter((s) => !!s.alarm_type).length;

  return (
    <>
      <section className="sensors-kpis grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 shrink-0">
        <MiniStat icon={Wifi} label="Sensores online" value={values.length} />
        <MiniStat icon={Thermometer} label="Temperatura média" value={`${formatDecimal(stats.temperatureAvg)} °C`} />
        <MiniStat icon={Thermometer} label="Temp. mínima" value={`${formatDecimal(stats.temperatureMin)} °C`} />
        <MiniStat icon={Thermometer} label="Temp. máxima" value={`${formatDecimal(stats.temperatureMax)} °C`} />
        <MiniStat icon={Droplets} label="Umidade média" value={`${formatDecimal(stats.humidityAvg)} %`} />
        <MiniStat icon={Cloud} label="CO₂ médio" value={`${formatInt(stats.co2Avg)} ppm`} />
        <MiniStat icon={Bell} label="Alertas ativos" value={activeAlarms} />
      </section>

      <section className="sensors-grid-panel glass-strong rounded-2xl p-3 flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-2 auto-rows-fr">
          {values.map((sensor, index) => <SensorCard key={sensor.dev_eui || sensor.sensor_id} sensor={sensor} index={index} history={history} />)}
        </div>
      </section>

      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pb-1">
        <span>Cards calculados com as leituras do dia</span>
        <Activity className="h-3.5 w-3.5" />
        <span>Mini gráficos com registros das últimas 24h</span>
      </div>
    </>
  );
}

function HistoryView({ period, setPeriod, history }: { period: Period; setPeriod: (p: Period) => void; history: HistoryPayload | null }) {
  const series = buildChartSeries(history, period);
  return <><PageHeader title="Histórico" description="Séries temporais por período, sensor e grandeza."><PeriodSelect value={period} onChange={setPeriod} /></PageHeader><section className="grid grid-cols-1 md:grid-cols-3 gap-4"><ChartCard title="Temperatura" type="temp" data={series} /><ChartCard title="Umidade" type="humidity" data={series} /><ChartCard title="CO₂" type="co2" data={series} /></section><div className="glass-strong rounded-2xl p-4"><div className="text-sm font-medium mb-3">Amostras recentes</div><div className="grid grid-cols-1 md:grid-cols-4 gap-3">{series.slice(-8).map((p) => <div key={p.t} className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-xs text-muted-foreground">{p.t}</div><div className="text-xl font-semibold">{formatDecimal(p.temp)} °C</div><div className="text-xs text-muted-foreground">{formatDecimal(p.h,0)}% • {formatInt(p.c)} ppm</div></div>)}</div></div></>;
}

function AlarmsView({ alarms, sensors, settings }: { alarms: any[]; sensors: Sensor[]; settings: AlarmSettings }) {
  const active = alarms.length ? alarms : buildAlarmsFromSensors(sensors, settings);
  return <><PageHeader title="Alarmes" description="Gestão de desvios conforme limites configurados para temperatura, umidade e CO₂." /><section className="grid grid-cols-1 md:grid-cols-4 gap-4"><MiniStat icon={AlertTriangle} label="Ativos" value={active.length} /><MiniStat icon={Thermometer} label="Temp. baixa/alta" value={`${formatDecimal(settings.temperature_low)} / ${formatDecimal(settings.temperature_high)} °C`} /><MiniStat icon={Droplets} label="Umid. baixa/alta" value={`${formatDecimal(settings.humidity_low, 0)} / ${formatDecimal(settings.humidity_high, 0)} %`} /><MiniStat icon={Cloud} label="CO₂ baixo/alto" value={`${formatInt(settings.co2_low)} / ${formatInt(settings.co2_high)} ppm`} /></section><RecentAlerts alarms={active} /></>;
}

function InsightsView({ dashboard }: { dashboard: DashboardPayload; history: HistoryPayload | null }) {
  const hottest = [...dashboard.sensors].sort((a,b)=>(b.temperature||0)-(a.temperature||0))[0];
  const coldest = [...dashboard.sensors].sort((a,b)=>(a.temperature||99)-(b.temperature||99))[0];
  return <><PageHeader title="Insights" description="Análises automáticas para operação, conforto e qualidade ambiental." /><section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><InsightCard icon={Thermometer} title="Área mais quente" text={`${hottest.area}: ${formatDecimal(hottest.temperature)} °C.`} /><InsightCard icon={Wind} title="Área mais fria" text={`${coldest.area}: ${formatDecimal(coldest.temperature)} °C.`} /><InsightCard icon={Cloud} title="CO₂ médio" text={`${formatInt(dashboard.kpis.co2Avg)} ppm no período selecionado.`} /><InsightCard icon={Droplets} title="Umidade média" text={`${formatDecimal(dashboard.kpis.humidityAvg, 0)}% entre os sensores online.`} /><InsightCard icon={BarChart3} title="Conforto" text={`${dashboard.kpis.activeAlarms} sensores fora da faixa térmica.`} /><InsightCard icon={Database} title="Base histórica" text="Relatórios e mapa térmico usam a base histórica." /></section></>;
}

function ReportsView() {
  return <><PageHeader title="Relatórios" description="Base para PDFs, CSVs e relatórios executivos diário, semanal, mensal e personalizado." /><section className="grid grid-cols-1 md:grid-cols-3 gap-4">{["Relatório diário", "Relatório semanal", "Relatório mensal"].map((title) => <div key={title} className="glass-strong rounded-2xl p-5"><FileText className="h-5 w-5 text-info mb-4" /><div className="text-base font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-2">Temperatura, umidade, CO₂, alarmes, KPIs, insights e mapa térmico médio.</div><button className="mt-5 glass rounded-xl px-3 py-2 text-sm flex items-center gap-2"><Download className="h-4 w-4" /> Gerar PDF</button></div>)}</section></>;
}

function NetworkView({ sensors }: { sensors: Sensor[] }) {
  const rssiValues = sensors.map((s)=>s.rssi).filter((v): v is number => typeof v === "number");
  const snrValues = sensors.map((s)=>s.snr).filter((v): v is number => typeof v === "number");
  const batteryValues = sensors.map((s)=>s.battery).filter((v): v is number => typeof v === "number");
  const avgRssi = rssiValues.length ? rssiValues.reduce((a,s)=>a+s,0)/rssiValues.length : null;
  const avgSnr = snrValues.length ? snrValues.reduce((a,s)=>a+s,0)/snrValues.length : null;
  const avgBattery = batteryValues.length ? batteryValues.reduce((a,s)=>a+s,0)/batteryValues.length : null;
  return <><PageHeader title="Saúde da Rede" description="Monitoramento da qualidade de sinal e comunicação dos sensores ambientais." /><section className="grid grid-cols-1 md:grid-cols-4 gap-4"><MiniStat icon={Radio} label="Sensores online" value={sensors.filter((s)=>!!s.timestamp).length} /><MiniStat icon={Wifi} label="RSSI médio" value={formatInt(avgRssi)} /><MiniStat icon={Activity} label="SNR médio" value={formatDecimal(avgSnr)} /><MiniStat icon={BatteryMedium} label="Bateria média" value={`${formatInt(avgBattery)}%`} /></section><SensorsView sensors={sensors} history={null} /></>;
}

function SettingsView({ sensors, initialSettings, onSettingsSaved }: { sensors: Sensor[]; initialSettings: AlarmSettings; onSettingsSaved: (settings: AlarmSettings) => void }) {
  const [settings, setSettings] = useState<AlarmSettings>(initialSettings);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchJSON<any>(`${N8N_BASE}/fleury-settings`)
      .then((payload) => setSettings(normalizeSettings(payload)))
      .catch(() => setStatus("Não foi possível carregar os limites atuais."));
  }, []);

  const update = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const save = async () => {
    setStatus("Salvando...");
    try {
      const res = await fetch(`${N8N_BASE}/fleury-settings`, {
        method: "POST",
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await parseResponseJSON<any>(res, "Salvar configurações").catch(() => null);
      const savedSettings = payload ? normalizeSettings(payload) : settings;
      onSettingsSaved(savedSettings);
      setSettings(savedSettings);
      setStatus("Limites ambientais salvos com sucesso.");
    } catch {
      setStatus("Não foi possível salvar agora. Tente novamente em instantes.");
    }
  };

  const Field = ({ label, k, unit }: { label: string; k: keyof typeof settings; unit: string }) => (
    <label className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input className="w-full bg-transparent border border-white/10 rounded-lg px-2 py-1 text-lg font-semibold outline-none" type="number" step="0.1" value={settings[k]} onChange={(e) => update(k, e.target.value)} />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </label>
  );

  return <><PageHeader title="Configurações" description="Limites de alarmes associados às medidas ambientais."><SlidersHorizontal className="h-5 w-5 text-info" /></PageHeader><div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><div className="glass-strong rounded-2xl p-5"><div className="text-base font-semibold mb-3">Limites ambientais</div><div className="grid grid-cols-2 gap-3"><Field label="Temperatura baixa" k="temperature_low" unit="°C" /><Field label="Temperatura alta" k="temperature_high" unit="°C" /><Field label="Umidade baixa" k="humidity_low" unit="%" /><Field label="Umidade alta" k="humidity_high" unit="%" /><Field label="CO₂ baixo" k="co2_low" unit="ppm" /><Field label="CO₂ alto" k="co2_high" unit="ppm" /></div><button onClick={save} className="mt-4 glass rounded-xl px-4 py-2 text-sm font-medium hover:border-info/50 transition-colors">Salvar limites</button>{status && <div className="mt-3 text-xs text-muted-foreground">{status}</div>}</div><div className="glass-strong rounded-2xl p-5"><div className="text-base font-semibold mb-3">Monitoramento ambiental</div><div className="space-y-3 text-sm text-muted-foreground"><div>Sensores ativos: <span className="text-foreground">6 EM300-TH + 9 AM103L</span></div><div>Atualização dos indicadores: <span className="text-foreground">a cada 5 minutos</span></div><div>Histórico operacional: <span className="text-foreground">temperatura, umidade, CO₂ e bateria</span></div><div>Total monitorado: <span className="text-foreground">{sensors.length} sensores</span></div></div></div></div></>;
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) { return <div className="glass-strong rounded-2xl p-3"><Icon className="h-4 w-4 text-info mb-2" /><div className="text-[11px] text-muted-foreground">{label}</div><div className="text-xl 2xl:text-2xl font-semibold mt-0.5">{value}</div></div>; }
function InsightCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) { return <div className="glass-strong rounded-2xl p-5"><Icon className="h-5 w-5 text-info mb-4" /><div className="text-base font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-2 leading-relaxed">{text}</div></div>; }
function MiniSetting({ label, value }: { label: string; value: string }) { return <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-semibold mt-1">{value}</div></div>; }
