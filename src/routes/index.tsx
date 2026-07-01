import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  ChevronDown,
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fleury — Supervisório Ambiental" },
      { name: "description", content: "Digital Twin ambiental com AM103, UG56, Redis e PostgreSQL." },
    ],
  }),
  component: App,
});

type Period = "today" | "week" | "month";
type Layer = "temperature" | "humidity" | "co2";
type View = "dashboard" | "plant" | "sensors" | "history" | "alarms" | "insights" | "reports" | "settings" | "network";

type Sensor = {
  dev_eui: string;
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

const N8N_BASE = (import.meta as any).env?.VITE_N8N_BASE_URL || "https://ancar-n8n.gpfgqx.easypanel.host/webhook";

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
  { dev_eui: "pendente01", sensor_id: "S01", sensor_name: "Sensor 01", area: "Recepção", floor: "Térreo", x: 6, y: 35, temperature: 23.2, humidity: 49.5, co2: 610, battery: 100, rssi: -65, snr: 12 },
  { dev_eui: "pendente02", sensor_id: "S02", sensor_name: "Sensor 02", area: "Espera", floor: "Térreo", x: 41, y: 42, temperature: 23.8, humidity: 48, co2: 640, battery: 100, rssi: -66, snr: 13 },
  { dev_eui: "pendente03", sensor_id: "S03", sensor_name: "Sensor 03", area: "Coleta 01", floor: "Térreo", x: 58, y: 42, temperature: 24.1, humidity: 47.5, co2: 680, battery: 100, rssi: -68, snr: 12 },
  { dev_eui: "pendente04", sensor_id: "S04", sensor_name: "Sensor 04", area: "Coleta 02", floor: "Térreo", x: 75, y: 42, temperature: 24.4, humidity: 46.9, co2: 700, battery: 100, rssi: -69, snr: 11 },
  { dev_eui: "pendente05", sensor_id: "S05", sensor_name: "Sensor 05", area: "Triagem", floor: "Térreo", x: 88, y: 62, temperature: 22.8, humidity: 50.1, co2: 590, battery: 100, rssi: -70, snr: 10 },
  { dev_eui: "pendente06", sensor_id: "S06", sensor_name: "Sensor 06", area: "Recepção Central", floor: "Térreo", x: 68, y: 58, temperature: 25.6, humidity: 45.2, co2: 760, battery: 100, rssi: -64, snr: 14, alarm_type: "temperature_high", alarm_severity: "warning" },
  { dev_eui: "pendente07", sensor_id: "S07", sensor_name: "Sensor 07", area: "Corredor 01", floor: "Térreo", x: 62, y: 78, temperature: 25.2, humidity: 44.8, co2: 720, battery: 100, rssi: -67, snr: 11, alarm_type: "temperature_high", alarm_severity: "warning" },
  { dev_eui: "pendente08", sensor_id: "S08", sensor_name: "Sensor 08", area: "Consultório 01", floor: "Térreo", x: 50, y: 65, temperature: 22.1, humidity: 52.2, co2: 560, battery: 100, rssi: -72, snr: 9 },
  { dev_eui: "pendente09", sensor_id: "S09", sensor_name: "Sensor 09", area: "Consultório 02", floor: "Térreo", x: 38, y: 60, temperature: 23.6, humidity: 49, co2: 610, battery: 100, rssi: -73, snr: 9 },
  { dev_eui: "pendente10", sensor_id: "S10", sensor_name: "Sensor 10", area: "Laboratório", floor: "Térreo", x: 18, y: 78, temperature: 21.2, humidity: 51.5, co2: 540, battery: 100, rssi: -74, snr: 8, alarm_type: "temperature_low", alarm_severity: "warning" },
  { dev_eui: "pendente11", sensor_id: "S11", sensor_name: "Sensor 11", area: "Sala Técnica", floor: "Térreo", x: 23, y: 42, temperature: 24.8, humidity: 43.6, co2: 690, battery: 100, rssi: -70, snr: 9 },
  { dev_eui: "pendente12", sensor_id: "S12", sensor_name: "Sensor 12", area: "Administrativo", floor: "Térreo", x: 32, y: 22, temperature: 23, humidity: 48.4, co2: 620, battery: 100, rssi: -66, snr: 12 },
  { dev_eui: "pendente13", sensor_id: "S13", sensor_name: "Sensor 13", area: "Sala de Exames 01", floor: "Térreo", x: 47, y: 16, temperature: 22.7, humidity: 47.1, co2: 585, battery: 100, rssi: -69, snr: 11 },
  { dev_eui: "pendente14", sensor_id: "S14", sensor_name: "Sensor 14", area: "Sala de Exames 02", floor: "Térreo", x: 64, y: 16, temperature: 24, humidity: 46.7, co2: 650, battery: 100, rssi: -71, snr: 10 },
  { dev_eui: "pendente15", sensor_id: "S15", sensor_name: "Sensor 15", area: "Apoio", floor: "Térreo", x: 86, y: 28, temperature: 23.4, humidity: 48.9, co2: 600, battery: 100, rssi: -67, snr: 12 },
];

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
  const records = history?.records?.length ? history.records : makeMockHistory(period).records;
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

function buildHeatmapSensors(period: Period, dashboard: DashboardPayload | null, history: HistoryPayload | null): Sensor[] {
  if (period === "today" && dashboard?.sensors?.length) return dashboard.sensors;
  const records = history?.records || [];
  if (!records.length) return makeMockDashboard(period).sensors;
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

async function fetchJSON<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return fallback;
  }
}

function Sparkline({ data, color }: { data: { x: number; y: number }[]; color: string }) {
  const gid = `g-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
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

function KpiCard({ label, value, unit, delta, deltaTone, color, seed, critical }: { label: string; value: string; unit?: string; delta?: string; deltaTone?: "up" | "down" | "warn"; color: string; seed: number; critical?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-3xl font-semibold tracking-tight truncate">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        <div className="w-24 shrink-0 -mb-1"><Sparkline data={spark(seed)} color={color} /></div>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-gradient-to-r from-primary/30 to-primary/5 text-white border border-primary/40 shadow-[0_0_20px_-6px_oklch(0.70_0.18_250/0.6)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function Pin({ id, tone, value, unit, onClick }: { id: string; tone: string; value?: string; unit?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative -translate-x-1/2 -translate-y-full group">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-b ${pinTone[tone]} flex items-center justify-center text-[11px] font-bold text-white border border-white/40 transition-transform group-hover:scale-110`}>
        {id.replace("S", "")}
      </div>
      {value && <div className="absolute left-1/2 -translate-x-1/2 top-9 whitespace-nowrap rounded-md bg-slate-950/80 border border-white/10 px-2 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">{value} {unit}</div>}
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
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function LayerSelector({ layer, onChange }: { layer: Layer; onChange: (l: Layer) => void }) {
  const ActiveIcon = layerConfig[layer].icon;
  return (
    <div className="absolute left-3 top-3 flex flex-col gap-2 w-44 z-10">
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
          <div className="w-3 rounded-full h-32" style={{ background: `linear-gradient(to top, ${layerConfig[layer].stops.join(",")})` }} />
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
  return (
    <div className="glass-strong rounded-2xl p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="glass rounded-xl px-3 py-1.5 text-sm flex items-center gap-2">
          <Box className="h-4 w-4 text-info" /> Modelo 3D Operacional
        </div>
        <div className="text-xs text-muted-foreground">Heatmap por {periodLabel[period].toLowerCase()} • {layerConfig[layer].label}</div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/9] bg-[#0a1428]">
        <img src={floorPlan} alt="Planta 3D termográfica Fleury" className="absolute inset-0 w-full h-full object-cover" width={1600} height={960} />
        <div className="absolute inset-0 mix-blend-screen opacity-55 transition-opacity duration-700" style={{ background: layer === "temperature" ? "radial-gradient(circle at 68% 58%, rgba(239,68,68,.75), transparent 18%), radial-gradient(circle at 18% 78%, rgba(37,99,235,.55), transparent 23%), radial-gradient(circle at 50% 65%, rgba(250,204,21,.45), transparent 24%), radial-gradient(circle at 58% 42%, rgba(34,197,94,.38), transparent 20%)" : layer === "humidity" ? "radial-gradient(circle at 40% 60%, rgba(56,189,248,.55), transparent 25%), radial-gradient(circle at 70% 35%, rgba(34,197,94,.50), transparent 28%), radial-gradient(circle at 88% 62%, rgba(249,115,22,.35), transparent 20%)" : "radial-gradient(circle at 68% 58%, rgba(239,68,68,.50), transparent 22%), radial-gradient(circle at 62% 78%, rgba(250,204,21,.38), transparent 22%), radial-gradient(circle at 18% 78%, rgba(34,197,94,.45), transparent 25%)" }} />
        <LayerSelector layer={layer} onChange={onLayerChange} />
        {sensors.map((s) => {
          const value = valueForLayer(s, layer);
          return (
            <div key={s.dev_eui || s.sensor_id} className="absolute" style={{ left: `${s.x ?? 50}%`, top: `${s.y ?? 50}%` }}>
              <Pin id={s.sensor_id} tone={toneForSensor(s, layer)} value={value === null ? undefined : layer === "co2" ? formatInt(value) : formatDecimal(value, 1)} unit={layerConfig[layer].unit} onClick={() => onSelectSensor(s)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SensorDetail({ sensor, series }: { sensor: Sensor | null; series: any[] }) {
  const s = sensor || sensorRegistry[5];
  const isAlert = typeof s.temperature === "number" && (s.temperature < 21.5 || s.temperature > 25);
  return (
    <div className="glass-strong rounded-2xl p-4 flex flex-col gap-2.5 min-w-0">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">{s.sensor_name || s.sensor_id}</div>
        <div className={`flex items-center gap-1.5 text-xs ${isAlert ? "text-critical" : "text-success"}`}><span className={`h-2 w-2 rounded-full ${isAlert ? "bg-critical" : "bg-success"}`} /> {isAlert ? "Alarme" : "Normal"}</div>
      </div>
      <div className="flex items-center gap-2 text-xs"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><div className="leading-tight"><div>{s.area}</div><div className="text-[10px] text-muted-foreground">{s.floor}</div></div></div>
      <div className="flex flex-col gap-1.5 pt-1">
        {[{ label: "Temperatura", value: `${formatDecimal(s.temperature)} °C`, color: "#ef4444", seed: 9 }, { label: "Umidade", value: `${formatDecimal(s.humidity)} %`, color: "#38bdf8", seed: 4 }, { label: "CO₂", value: `${formatInt(s.co2)} ppm`, color: "#22c55e", seed: 7 }].map((m) => (
          <div key={m.label} className="grid grid-cols-[1fr_auto_72px] items-center gap-2"><div className="text-[11px] text-muted-foreground">{m.label}</div><div className="text-sm font-semibold tabular-nums">{m.value}</div><div className="h-6"><Sparkline data={spark(m.seed)} color={m.color} /></div></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-2 border-t border-white/10">
        <span className="text-muted-foreground">Status</span><span className="text-success text-right">Online</span>
        <span className="text-muted-foreground">Última atualização</span><span className="text-right">{s.timestamp ? new Date(s.timestamp).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--"}</span>
        <span className="text-muted-foreground">Bateria</span><span className="text-right flex items-center justify-end gap-1.5">{formatInt(s.battery)}%<span className="inline-block w-10 h-1.5 rounded-full bg-white/10 overflow-hidden"><span className="block h-full bg-success" style={{ width: `${s.battery ?? 0}%` }} /></span></span>
        <span className="text-muted-foreground">RSSI / SNR</span><span className="text-right text-success">{formatInt(s.rssi)} / {formatInt(s.snr)}</span>
      </div>
      <div className="pt-4 mt-3 border-t border-white/10 flex-1 min-h-0 flex flex-col">
        <div className="text-[11px] text-muted-foreground mb-3">Tendência do período</div>
        <div className="flex-1 min-h-[220px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}><XAxis dataKey="t" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis yAxisId="left" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={[18, 32]} ticks={[20,25,30]} tickFormatter={(v)=>`${v}°C`} width={30} /><YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={[200, 1200]} ticks={[500,1000]} tickFormatter={(v)=>`${v} ppm`} width={42} /><Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} /><Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive /><Line yAxisId="left" type="monotone" dataKey="h" stroke="#38bdf8" strokeWidth={1.5} dot={false} isAnimationActive /><Line yAxisId="right" type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={1.5} dot={false} isAnimationActive /></LineChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}

function DashboardHome({ period, setPeriod, layer, setLayer, dashboard, history, selectedSensor, setSelectedSensor }: { period: Period; setPeriod: (p: Period) => void; layer: Layer; setLayer: (l: Layer) => void; dashboard: DashboardPayload | null; history: HistoryPayload | null; selectedSensor: Sensor | null; setSelectedSensor: (s: Sensor) => void }) {
  const data = dashboard || makeMockDashboard(period);
  const series = useMemo(() => buildChartSeries(history, period), [history, period]);
  const heatmapSensors = useMemo(() => buildHeatmapSensors(period, dashboard, history), [period, dashboard, history]);
  const comfort = Math.max(0, Math.round(((data.expectedSensors - data.kpis.activeAlarms) / data.expectedSensors) * 100));
  return (
    <>
      <Header period={period} setPeriod={setPeriod} updatedAt={data.updatedAt} alarms={data.kpis.activeAlarms} />
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Temp. média" value={formatDecimal(data.kpis.temperatureAvg)} unit="°C" delta={`${periodLabel[period]} operacional`} deltaTone="up" color="#60a5fa" seed={1} />
        <KpiCard label="Temp. mín." value={formatDecimal(data.kpis.temperatureMin)} unit="°C" delta="Limite frio 21,5 °C" deltaTone="down" color="#22d3ee" seed={2} />
        <KpiCard label="Temp. máx." value={formatDecimal(data.kpis.temperatureMax)} unit="°C" delta="Limite quente 25,0 °C" deltaTone="warn" color="#f97316" seed={3} />
        <KpiCard label="Umidade média" value={formatDecimal(data.kpis.humidityAvg, 0)} unit="%" delta="Faixa ideal 40% - 60%" deltaTone="up" color="#38bdf8" seed={4} />
        <KpiCard label="CO₂ médio" value={formatInt(data.kpis.co2Avg)} unit="ppm" delta="AM103 via LoRaWAN" deltaTone="down" color="#22c55e" seed={5} />
        <KpiCard label="Conforto ambiental" value={`${comfort}`} unit="%" delta={`${data.kpis.activeAlarms} alarmes ativos`} color="#ef4444" seed={6} critical={data.kpis.activeAlarms > 0} />
      </section>
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <DigitalTwinMap sensors={heatmapSensors} layer={layer} period={period} onLayerChange={setLayer} onSelectSensor={setSelectedSensor} />
        <SensorDetail sensor={selectedSensor || heatmapSensors[5]} series={series} />
      </section>
      <ChartsAndInsights series={series} dashboard={data} period={period} />
      <RecentAlerts alarms={data.alarms} />
    </>
  );
}

function Header({ period, setPeriod, updatedAt, alarms }: { period: Period; setPeriod: (p: Period) => void; updatedAt?: string; alarms: number }) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-3">
      <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm"><span>{new Date().toLocaleDateString("pt-BR")}</span><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>
      <div className="glass rounded-2xl px-5 py-2.5 flex items-center gap-3 justify-center"><span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" /><span className="relative rounded-full h-2.5 w-2.5 bg-success" /></span><div className="text-sm"><span className="text-muted-foreground">Status geral </span><span className="font-semibold text-success">Operacional</span><span className="text-muted-foreground ml-3">Atualizado {updatedAt ? new Date(updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--"}</span></div></div>
      <div className="flex items-center gap-3"><PeriodSelect value={period} onChange={setPeriod} /><button className="glass rounded-2xl p-2.5 relative"><Bell className="h-5 w-5" />{alarms > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-critical text-[10px] font-bold grid place-items-center">{alarms}</span>}</button></div>
    </header>
  );
}

function ChartsAndInsights({ series, dashboard, period }: { series: any[]; dashboard: DashboardPayload; period: Period }) {
  const topSensor = [...dashboard.sensors].sort((a, b) => (b.temperature || 0) - (a.temperature || 0))[0];
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title={`Temperatura (${periodLabel[period]})`} type="temp" data={series} />
        <ChartCard title={`Umidade Relativa (${periodLabel[period]})`} type="humidity" data={series} />
        <ChartCard title={`CO₂ (${periodLabel[period]})`} type="co2" data={series} />
      </div>
      <div className="glass-strong rounded-2xl p-4 flex flex-col gap-3 min-w-0"><div className="flex items-center gap-2"><Brain className="h-4 w-4 text-info" /><div className="text-sm font-semibold">Insights Inteligentes</div></div>{[
        { icon: Thermometer, color: "text-warning", text: `${topSensor?.area || "Área crítica"} está com a maior temperatura média do período.` },
        { icon: Cloud, color: "text-critical", text: `CO₂ médio atual: ${formatInt(dashboard.kpis.co2Avg)} ppm nos sensores online.` },
        { icon: Droplets, color: "text-info", text: `Umidade média em ${formatDecimal(dashboard.kpis.humidityAvg, 0)}%, usando histórico do PostgreSQL.` },
      ].map((it, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center shrink-0"><it.icon className={`h-4 w-4 ${it.color}`} /></div><div className="text-xs text-muted-foreground leading-relaxed">{it.text}</div></div>)}<button className="text-xs text-info hover:underline mt-auto self-start">Ver todas as análises →</button></div>
    </section>
  );
}

function ChartCard({ title, type, data }: { title: string; type: "temp" | "humidity" | "co2"; data: any[] }) {
  const isTemp = type === "temp", isHum = type === "humidity";
  return <div className="glass-strong rounded-2xl p-4 min-w-0"><div className="text-sm font-medium mb-2">{title}</div><div className="h-44"><ResponsiveContainer><AreaChart data={data}><defs><linearGradient id={`g-${type}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={isTemp ? "#ef4444" : isHum ? "#38bdf8" : "#22c55e"} stopOpacity={0.5} /><stop offset="100%" stopColor={isTemp ? "#ef4444" : isHum ? "#38bdf8" : "#22c55e"} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={isTemp ? [18, 30] : isHum ? [0, 100] : [0, 1500]} width={34} />{isTemp && <><ReferenceArea y1={21.5} y2={25} fill="#22c55e" fillOpacity={0.10} /><Line type="monotone" dataKey="min" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} /></>}{isHum && <ReferenceArea y1={40} y2={60} fill="#22c55e" fillOpacity={0.12} />}{type === "co2" && <ReferenceArea y1={1000} y2={1500} fill="#ef4444" fillOpacity={0.15} />}<Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} /><Area type="monotone" dataKey={isTemp ? "temp" : isHum ? "h" : "c"} stroke={isTemp ? "#ef4444" : isHum ? "#38bdf8" : "#22c55e"} strokeWidth={2} fill={`url(#g-${type})`} isAnimationActive /></AreaChart></ResponsiveContainer></div></div>;
}

function RecentAlerts({ alarms }: { alarms: any[] }) {
  const list = alarms.length ? alarms : [{ sensor_id: "S06", area: "Recepção Central", type: "temperature_high", value: 25.6, timestamp: new Date().toISOString() }, { sensor_id: "S10", area: "Laboratório", type: "temperature_low", value: 21.2, timestamp: new Date().toISOString() }];
  return <section className="glass-strong rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3"><div className="text-sm font-medium shrink-0 lg:w-40">Alertas recentes</div><div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">{list.slice(0, 3).map((a, i) => <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 min-w-0"><div className="h-9 w-9 rounded-lg grid place-items-center shrink-0 text-warning bg-warning/15"><AlertTriangle className="h-4 w-4" /></div><div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{a.sensor_id || a.sensorId}</div><div className="text-[11px] text-muted-foreground truncate">{a.type === "temperature_low" ? "Temperatura baixa" : "Temperatura alta"} • {formatDecimal(Number(a.value))} °C</div></div><div className="text-right shrink-0"><div className="text-[11px] font-medium text-warning">• Atenção</div><div className="text-[10px] text-muted-foreground">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--"}</div></div></div>)}</div><button className="text-xs text-info hover:underline shrink-0">Ver todos<br/>os alertas</button></section>;
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [period, setPeriod] = useState<Period>("today");
  const [layer, setLayer] = useState<Layer>("temperature");
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const dashUrl = period === "today" ? `${N8N_BASE}/fleury-dashboard-latest` : `${N8N_BASE}/fleury-history?period=${encodeURIComponent(periodQuery[period])}&sensor=all&limit=5000`;
      const [dash, hist] = await Promise.all([
        period === "today" ? fetchJSON<DashboardPayload>(dashUrl, makeMockDashboard(period)) : Promise.resolve(makeMockDashboard(period)),
        fetchJSON<HistoryPayload>(`${N8N_BASE}/fleury-history?period=${encodeURIComponent(periodQuery[period])}&sensor=all&limit=5000`, makeMockHistory(period)),
      ]);
      if (!mounted) return;
      setDashboard(period === "today" ? dash : makeDashboardFromHistory(hist, period));
      setHistory(hist);
    };
    load();
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(timer); };
  }, [period]);

  const activeDashboard = dashboard || makeMockDashboard(period);

  return (
    <div className="min-h-screen w-full flex text-foreground">
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col gap-6 px-4 py-5 border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl">
        <div className="px-2"><div className="text-2xl font-black tracking-tight">FLEURY</div><div className="text-[9px] tracking-[0.25em] text-muted-foreground mt-0.5">MEDICINA E SAÚDE</div></div>
        <nav className="flex flex-col gap-1"><SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} /><SidebarItem icon={Box} label="Planta Operacional" active={view === "plant"} onClick={() => setView("plant")} /><SidebarItem icon={Radio} label="Sensores" active={view === "sensors"} onClick={() => setView("sensors")} /><SidebarItem icon={History} label="Histórico" active={view === "history"} onClick={() => setView("history")} /><SidebarItem icon={Bell} label="Alarmes" active={view === "alarms"} onClick={() => setView("alarms")} /><SidebarItem icon={Brain} label="Insights" active={view === "insights"} onClick={() => setView("insights")} /><SidebarItem icon={FileText} label="Relatórios" active={view === "reports"} onClick={() => setView("reports")} /><SidebarItem icon={Wifi} label="Saúde da Rede" active={view === "network"} onClick={() => setView("network")} /><SidebarItem icon={Settings} label="Configurações" active={view === "settings"} onClick={() => setView("settings")} /></nav>
        <div className="mt-auto flex flex-col gap-3"><div className="glass rounded-2xl p-3.5"><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-success" /><span className="text-2xl font-bold">{activeDashboard.sensorsOnline}</span></div><div className="text-xs text-muted-foreground mt-1">Sensores online</div><div className="text-[11px] text-success mt-1">{activeDashboard.expectedSensors} previstos</div></div><div className="glass rounded-2xl p-3.5"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-critical" /><span className="text-2xl font-bold">{activeDashboard.kpis.activeAlarms}</span></div><div className="text-xs text-muted-foreground mt-1">Alertas ativos</div><button onClick={() => setView("alarms")} className="text-[11px] text-info mt-1 hover:underline">Ver todos</button></div><div className="glass rounded-2xl p-3 flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center shrink-0"><User className="h-4 w-4" /></div><div className="min-w-0"><div className="text-xs font-medium truncate">Administrador</div><div className="text-[10px] text-muted-foreground truncate">Fleury Unidade SP</div></div></div></div>
      </aside>
      <main className="flex-1 min-w-0 p-4 lg:p-5 flex flex-col gap-4">
        {view === "dashboard" && <DashboardHome period={period} setPeriod={setPeriod} layer={layer} setLayer={setLayer} dashboard={dashboard} history={history} selectedSensor={selectedSensor} setSelectedSensor={setSelectedSensor} />}
        {view === "plant" && <PlantView period={period} setPeriod={setPeriod} layer={layer} setLayer={setLayer} dashboard={activeDashboard} history={history} setSelectedSensor={setSelectedSensor} />}
        {view === "sensors" && <SensorsView sensors={activeDashboard.sensors} />}
        {view === "history" && <HistoryView period={period} setPeriod={setPeriod} history={history} />}
        {view === "alarms" && <AlarmsView alarms={activeDashboard.alarms} sensors={activeDashboard.sensors} />}
        {view === "insights" && <InsightsView dashboard={activeDashboard} history={history} />}
        {view === "reports" && <ReportsView />}
        {view === "network" && <NetworkView sensors={activeDashboard.sensors} />}
        {view === "settings" && <SettingsView sensors={activeDashboard.sensors} />}
      </main>
    </div>
  );
}

function makeDashboardFromHistory(history: HistoryPayload, period: Period): DashboardPayload {
  const sensors = buildHeatmapSensors(period, null, history);
  const temps = sensors.map((s) => s.temperature).filter((v): v is number => typeof v === "number");
  const hums = sensors.map((s) => s.humidity).filter((v): v is number => typeof v === "number");
  const co2s = sensors.map((s) => s.co2).filter((v): v is number => typeof v === "number");
  const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const alarms = sensors.filter((s) => typeof s.temperature === "number" && (s.temperature < 21.5 || s.temperature > 25)).map((s) => ({ sensor_id: s.sensor_id, area: s.area, value: s.temperature, type: s.temperature! < 21.5 ? "temperature_low" : "temperature_high", timestamp: s.timestamp }));
  return { ok: true, updatedAt: new Date().toISOString(), refreshSeconds: 300, expectedSensors: 15, sensorsOnline: sensors.length, kpis: { temperatureAvg: avg(temps), temperatureMin: temps.length ? Math.min(...temps) : null, temperatureMax: temps.length ? Math.max(...temps) : null, humidityAvg: avg(hums), co2Avg: avg(co2s), activeAlarms: alarms.length }, alarms, sensors };
}

function PageHeader({ title, description, children }: { title: string; description: string; children?: any }) {
  return <div className="glass-strong rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div className="text-xl font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-1">{description}</div></div>{children}</div>;
}

function PlantView({ period, setPeriod, layer, setLayer, dashboard, history, setSelectedSensor }: any) {
  return <><Header period={period} setPeriod={setPeriod} updatedAt={dashboard.updatedAt} alarms={dashboard.kpis.activeAlarms} /><DigitalTwinMap sensors={buildHeatmapSensors(period, dashboard, history)} layer={layer} period={period} onLayerChange={setLayer} onSelectSensor={setSelectedSensor} /><ChartsAndInsights series={buildChartSeries(history, period)} dashboard={dashboard} period={period} /></>;
}

function SensorsView({ sensors }: { sensors: Sensor[] }) {
  return <><PageHeader title="Sensores" description="Cadastro operacional dos 15 AM103, status de comunicação e última leitura."><div className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /> Buscar sensor</div></PageHeader><div className="glass-strong rounded-2xl overflow-hidden"><table className="w-full text-sm"><thead className="text-xs uppercase text-muted-foreground bg-white/[0.03]"><tr><th className="text-left p-3">Sensor</th><th className="text-left p-3">DevEUI</th><th className="text-left p-3">Área</th><th className="text-right p-3">Temp.</th><th className="text-right p-3">Umid.</th><th className="text-right p-3">CO₂</th><th className="text-right p-3">Bateria</th><th className="text-right p-3">RSSI/SNR</th><th className="text-right p-3">Status</th></tr></thead><tbody>{sensors.map((s) => <tr key={s.dev_eui} className="border-t border-white/5 hover:bg-white/[0.03]"><td className="p-3 font-medium">{s.sensor_name}</td><td className="p-3 text-muted-foreground">{s.dev_eui}</td><td className="p-3">{s.area}</td><td className="p-3 text-right tabular-nums">{formatDecimal(s.temperature)} °C</td><td className="p-3 text-right tabular-nums">{formatDecimal(s.humidity)}%</td><td className="p-3 text-right tabular-nums">{formatInt(s.co2)}</td><td className="p-3 text-right">{formatInt(s.battery)}%</td><td className="p-3 text-right">{formatInt(s.rssi)} / {formatInt(s.snr)}</td><td className="p-3 text-right"><span className="text-success">Online</span></td></tr>)}</tbody></table></div></>;
}

function HistoryView({ period, setPeriod, history }: { period: Period; setPeriod: (p: Period) => void; history: HistoryPayload | null }) {
  const series = buildChartSeries(history, period);
  return <><PageHeader title="Histórico" description="Séries temporais vindas do PostgreSQL por período, sensor e grandeza."><PeriodSelect value={period} onChange={setPeriod} /></PageHeader><section className="grid grid-cols-1 md:grid-cols-3 gap-4"><ChartCard title="Temperatura" type="temp" data={series} /><ChartCard title="Umidade" type="humidity" data={series} /><ChartCard title="CO₂" type="co2" data={series} /></section><div className="glass-strong rounded-2xl p-4"><div className="text-sm font-medium mb-3">Amostras recentes</div><div className="grid grid-cols-1 md:grid-cols-4 gap-3">{series.slice(-8).map((p) => <div key={p.t} className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-xs text-muted-foreground">{p.t}</div><div className="text-xl font-semibold">{formatDecimal(p.temp)} °C</div><div className="text-xs text-muted-foreground">{formatDecimal(p.h,0)}% • {formatInt(p.c)} ppm</div></div>)}</div></div></>;
}

function AlarmsView({ alarms, sensors }: { alarms: any[]; sensors: Sensor[] }) {
  const active = alarms.length ? alarms : sensors.filter((s) => typeof s.temperature === "number" && (s.temperature < 21.5 || s.temperature > 25)).map((s) => ({ sensor_id: s.sensor_id, area: s.area, value: s.temperature, type: s.temperature! < 21.5 ? "temperature_low" : "temperature_high", timestamp: s.timestamp }));
  return <><PageHeader title="Alarmes" description="Gestão de desvios: frio abaixo de 21,5 °C e quente acima de 25 °C." /><section className="grid grid-cols-1 md:grid-cols-4 gap-4"><MiniStat icon={AlertTriangle} label="Ativos" value={active.length} /><MiniStat icon={Thermometer} label="Limite frio" value="21,5 °C" /><MiniStat icon={Thermometer} label="Limite quente" value="25,0 °C" /><MiniStat icon={ShieldCheck} label="Normalização" value="Auto" /></section><RecentAlerts alarms={active} /></>;
}

function InsightsView({ dashboard }: { dashboard: DashboardPayload; history: HistoryPayload | null }) {
  const hottest = [...dashboard.sensors].sort((a,b)=>(b.temperature||0)-(a.temperature||0))[0];
  const coldest = [...dashboard.sensors].sort((a,b)=>(a.temperature||99)-(b.temperature||99))[0];
  return <><PageHeader title="Insights" description="Análises automáticas para operação, conforto e qualidade ambiental." /><section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><InsightCard icon={Thermometer} title="Área mais quente" text={`${hottest.area}: ${formatDecimal(hottest.temperature)} °C.`} /><InsightCard icon={Wind} title="Área mais fria" text={`${coldest.area}: ${formatDecimal(coldest.temperature)} °C.`} /><InsightCard icon={Cloud} title="CO₂ médio" text={`${formatInt(dashboard.kpis.co2Avg)} ppm no período selecionado.`} /><InsightCard icon={Droplets} title="Umidade média" text={`${formatDecimal(dashboard.kpis.humidityAvg, 0)}% entre os sensores online.`} /><InsightCard icon={BarChart3} title="Conforto" text={`${dashboard.kpis.activeAlarms} sensores fora da faixa térmica.`} /><InsightCard icon={Database} title="Base histórica" text="Relatórios e heatmap semana/mês usam PostgreSQL." /></section></>;
}

function ReportsView() {
  return <><PageHeader title="Relatórios" description="Base para PDFs, CSVs e relatórios executivos diário, semanal, mensal e personalizado." /><section className="grid grid-cols-1 md:grid-cols-3 gap-4">{["Relatório diário", "Relatório semanal", "Relatório mensal"].map((title) => <div key={title} className="glass-strong rounded-2xl p-5"><FileText className="h-5 w-5 text-info mb-4" /><div className="text-base font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-2">Temperatura, umidade, CO₂, alarmes, KPIs, insights e mapa térmico médio.</div><button className="mt-5 glass rounded-xl px-3 py-2 text-sm flex items-center gap-2"><Download className="h-4 w-4" /> Gerar PDF</button></div>)}</section></>;
}

function NetworkView({ sensors }: { sensors: Sensor[] }) {
  const avgRssi = sensors.reduce((a,s)=>a+(s.rssi||0),0)/Math.max(1,sensors.length);
  const avgSnr = sensors.reduce((a,s)=>a+(s.snr||0),0)/Math.max(1,sensors.length);
  return <><PageHeader title="Saúde da Rede" description="Monitoramento LoRaWAN do UG56, qualidade de sinal e comunicação dos AM103." /><section className="grid grid-cols-1 md:grid-cols-4 gap-4"><MiniStat icon={Server} label="Gateway" value="UG56-915M" /><MiniStat icon={Wifi} label="RSSI médio" value={formatInt(avgRssi)} /><MiniStat icon={Activity} label="SNR médio" value={formatDecimal(avgSnr)} /><MiniStat icon={BatteryMedium} label="Bateria média" value="100%" /></section><SensorsView sensors={sensors} /></>;
}

function SettingsView({ sensors }: { sensors: Sensor[] }) {
  return <><PageHeader title="Configurações" description="Cadastro dos sensores, coordenadas da planta, limites e integração com n8n/PostgreSQL."><SlidersHorizontal className="h-5 w-5 text-info" /></PageHeader><div className="grid grid-cols-1 xl:grid-cols-2 gap-4"><div className="glass-strong rounded-2xl p-5"><div className="text-base font-semibold mb-3">Limites ambientais</div><div className="grid grid-cols-2 gap-3"><MiniSetting label="Frio abaixo de" value="21,5 °C" /><MiniSetting label="Quente acima de" value="25,0 °C" /><MiniSetting label="Atualização tela" value="5 min" /><MiniSetting label="Histórico" value="PostgreSQL" /></div></div><div className="glass-strong rounded-2xl p-5"><div className="text-base font-semibold mb-3">Integrações</div><div className="space-y-3 text-sm text-muted-foreground"><div>Gateway: <span className="text-foreground">UG56-915M</span></div><div>Endpoint: <span className="text-foreground">/webhook/fleury-test</span></div><div>Sensor: <span className="text-foreground">Milesight AM103</span></div><div>Total previsto: <span className="text-foreground">{sensors.length} sensores</span></div></div></div></div></>;
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) { return <div className="glass-strong rounded-2xl p-4"><Icon className="h-5 w-5 text-info mb-3" /><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-semibold mt-1">{value}</div></div>; }
function InsightCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) { return <div className="glass-strong rounded-2xl p-5"><Icon className="h-5 w-5 text-info mb-4" /><div className="text-base font-semibold">{title}</div><div className="text-sm text-muted-foreground mt-2 leading-relaxed">{text}</div></div>; }
function MiniSetting({ label, value }: { label: string; value: string }) { return <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5"><div className="text-xs text-muted-foreground">{label}</div><div className="text-lg font-semibold mt-1">{value}</div></div>; }
