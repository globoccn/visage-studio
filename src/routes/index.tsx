import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard, Box, Radio, History, FileText, Settings, Bell,
  Thermometer, Droplets, Cloud, Maximize2, Plus, Minus, ChevronDown,
  MapPin, Brain, AlertTriangle, Bug, Wind, Clock, CircleDot, User,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis,
  ReferenceArea, Tooltip,
} from "recharts";
import floorPlan from "@/assets/floor-plan-heatmap.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fleury — Dashboard Termográfico" },
      { name: "description", content: "Monitoramento termográfico em tempo real de ambientes clínicos." },
    ],
  }),
  component: Dashboard,
});

/* ---------- fake data ---------- */
const spark = (seed: number, n = 24) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: Math.sin(i / 2 + seed) * 1.2 + Math.cos(i / 3 + seed * 1.7) * 0.8 + seed,
  }));

const tempSeries = Array.from({ length: 25 }, (_, i) => {
  const base = 22 + Math.sin(i / 3) * 2 + (i > 10 && i < 16 ? 3 : 0);
  return {
    t: `${String(i).padStart(2, "0")}:00`,
    temp: +(base + Math.sin(i) * 0.6).toFixed(1),
    avg: +(base - 0.3).toFixed(1),
    max: +(base + 1.8).toFixed(1),
    min: +(base - 1.8).toFixed(1),
  };
});

const humSeries = Array.from({ length: 25 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  h: 45 + Math.sin(i / 2.5) * 10 + Math.cos(i / 4) * 4,
}));

const co2Series = Array.from({ length: 25 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  c: 500 + Math.sin(i / 2) * 200 + (i === 8 ? 600 : 0) + Math.cos(i) * 80,
}));

const sensor06Series = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  temp: 24 + Math.sin(i / 3) * 1.5,
  hum: 38 + Math.cos(i / 4) * 4,
  co2: 700 + Math.sin(i / 2) * 200,
}));

// Sensor pins on the floor plan (percent positions)
const sensorPins = [
  { id: "01", x: 6, y: 35, tone: "cold" },
  { id: "10", x: 18, y: 78, tone: "cold" },
  { id: "11", x: 23, y: 42, tone: "cold" },
  { id: "12", x: 32, y: 22, tone: "cool" },
  { id: "02", x: 41, y: 42, tone: "cool" },
  { id: "13", x: 47, y: 16, tone: "cool" },
  { id: "08", x: 50, y: 65, tone: "warm" },
  { id: "09", x: 38, y: 60, tone: "warm" },
  { id: "03", x: 58, y: 42, tone: "warm" },
  { id: "14", x: 64, y: 16, tone: "warm" },
  { id: "06", x: 68, y: 58, tone: "hot" },
  { id: "07", x: 62, y: 78, tone: "hot" },
  { id: "04", x: 75, y: 42, tone: "hot" },
  { id: "15", x: 86, y: 28, tone: "hot" },
  { id: "05", x: 88, y: 62, tone: "hot" },
];

const pinTone: Record<string, string> = {
  cold: "from-sky-400 to-blue-600 shadow-[0_0_18px_rgba(56,189,248,0.7)]",
  cool: "from-cyan-300 to-teal-500 shadow-[0_0_18px_rgba(45,212,191,0.7)]",
  warm: "from-yellow-300 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.7)]",
  hot:  "from-orange-400 to-red-600 shadow-[0_0_22px_rgba(239,68,68,0.85)]",
};

/* ---------- small components ---------- */
function Sparkline({ data, color }: { data: { x: number; y: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={color} strokeWidth={1.6} fill={`url(#g-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KpiCard({
  label, value, unit, delta, deltaTone, color, seed, critical,
}: {
  label: string; value: string; unit?: string;
  delta?: string; deltaTone?: "up" | "down" | "warn";
  color: string; seed: number; critical?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-3xl font-semibold tracking-tight truncate">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        <div className="w-24 shrink-0 -mb-1">
          <Sparkline data={spark(seed)} color={color} />
        </div>
      </div>
      {delta && (
        <div className={`text-[11px] flex items-center gap-1 ${
          critical ? "text-critical"
          : deltaTone === "up" ? "text-success"
          : deltaTone === "down" ? "text-info"
          : "text-warning"
        }`}>
          {critical ? <CircleDot className="h-3 w-3" /> : <span>{deltaTone === "up" ? "↑" : "↓"}</span>}
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? "bg-gradient-to-r from-primary/30 to-primary/5 text-white border border-primary/40 shadow-[0_0_20px_-6px_oklch(0.70_0.18_250/0.6)]"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function Pin({ id, tone }: { id: string; tone: string }) {
  return (
    <div className="relative -translate-x-1/2 -translate-y-full">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-b ${pinTone[tone]} flex items-center justify-center text-[11px] font-bold text-white border border-white/40`}>
        {id}
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-2 h-2 rotate-45 bg-gradient-to-br from-transparent to-black/40" />
    </div>
  );
}

/* ---------- main ---------- */
function Dashboard() {
  return (
    <div className="min-h-screen w-full flex text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col gap-6 px-4 py-5 border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl">
        <div className="px-2">
          <div className="text-2xl font-black tracking-tight">FLEURY</div>
          <div className="text-[9px] tracking-[0.25em] text-muted-foreground mt-0.5">MEDICINA E SAÚDE</div>
        </div>

        <nav className="flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Box} label="Planta 3D" />
          <SidebarItem icon={Radio} label="Sensores" />
          <SidebarItem icon={History} label="Histórico" />
          <SidebarItem icon={FileText} label="Relatórios" />
          <SidebarItem icon={Settings} label="Configurações" />
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold">15</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Sensores online</div>
            <div className="text-[11px] text-success mt-1">100% Operacionais</div>
          </div>

          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-critical" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Alertas ativos</div>
            <button className="text-[11px] text-info mt-1 hover:underline">Ver todos</button>
          </div>

          <div className="glass rounded-2xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-info grid place-items-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">Administrador</div>
              <div className="text-[10px] text-muted-foreground truncate">Fleury Unidade SP</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 lg:p-5 flex flex-col gap-4">
        {/* Header */}
        <header className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm">
            <span>24 de Maio de 2024</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">09:41</span>
          </div>

          <div className="glass rounded-2xl px-5 py-2.5 flex items-center gap-3 justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <div className="text-sm">
              <span className="text-muted-foreground">Status geral </span>
              <span className="font-semibold text-success">Tudo normal</span>
              <span className="text-muted-foreground ml-3">Ambiente saudável</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass rounded-2xl px-4 py-2 flex items-center gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Período</div>
                <div className="text-sm font-medium">Hoje</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <button className="glass rounded-2xl p-2.5 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-critical text-[10px] font-bold grid place-items-center">3</span>
            </button>
          </div>
        </header>

        {/* KPI row */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard label="Temp. média" value="23,6" unit="°C" delta="1,2 °C (vs ontem)" deltaTone="up" color="#60a5fa" seed={1} />
          <KpiCard label="Temp. mín." value="20,1" unit="°C" delta="0,4 °C (vs ontem)" deltaTone="down" color="#22d3ee" seed={2} />
          <KpiCard label="Temp. máx." value="26,8" unit="°C" delta="1,8 °C (vs ontem)" deltaTone="up" color="#60a5fa" seed={3} />
          <KpiCard label="Umidade média" value="47" unit="%" delta="3 % (vs ontem)" deltaTone="down" color="#38bdf8" seed={4} />
          <KpiCard label="CO₂ médio" value="612" unit="ppm" delta="45 ppm (vs ontem)" deltaTone="down" color="#818cf8" seed={5} />
          <KpiCard label="Alertas ativos" value="3" delta="2 críticos" color="#ef4444" seed={6} critical />
        </section>

        {/* Middle row: floor plan + sensor detail */}
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          {/* Floor plan */}
          <div className="glass-strong rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <button className="glass rounded-xl px-3 py-1.5 text-sm flex items-center gap-2">
                Planta 3D <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/9] bg-[#0a1428]">
              <img
                src={floorPlan}
                alt="Planta termográfica isométrica do ambiente clínico"
                className="absolute inset-0 w-full h-full object-cover"
                width={1600}
                height={960}
              />

              {/* Sensor pins */}
              {sensorPins.map((p) => (
                <div
                  key={p.id}
                  className="absolute"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <Pin id={p.id} tone={p.tone} />
                </div>
              ))}

              {/* Left controls overlay */}
              <div className="absolute left-3 top-3 flex flex-col gap-2 w-44">
                <div className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                  <Thermometer className="h-3.5 w-3.5 text-warning" />
                  <div className="flex-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Camada ativa</div>
                    <div className="text-sm font-medium">Temperatura</div>
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </div>

                <div className="glass rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Escala (°C)</div>
                  <div className="flex gap-2">
                    <div className="w-3 rounded-full h-32 bg-gradient-to-t from-blue-600 via-cyan-400 via-green-400 via-yellow-400 to-red-500" />
                    <div className="flex flex-col justify-between text-[10px] text-muted-foreground">
                      <span>28.0 <span className="text-critical">Quente</span></span>
                      <span>26.0</span>
                      <span>24.0</span>
                      <span>22.0</span>
                      <span>20.0</span>
                      <span>18.0 <span className="text-info">Frio</span></span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-3.5 w-3.5" /> Umidade
                </div>
                <div className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-2 text-muted-foreground">
                  <Cloud className="h-3.5 w-3.5" /> CO₂
                </div>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div className="glass rounded-xl flex overflow-hidden text-xs">
                  <button className="px-3 py-1.5 bg-primary/30 text-white border-r border-white/10">3D</button>
                  <button className="px-3 py-1.5 text-muted-foreground">2D</button>
                </div>
                <div className="glass rounded-xl flex overflow-hidden">
                  <button className="px-2.5 py-1.5"><Minus className="h-3.5 w-3.5" /></button>
                  <button className="px-2.5 py-1.5 border-l border-white/10"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button className="glass rounded-xl px-2.5 py-1.5"><Maximize2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Sensor detail */}
          <div className="glass-strong rounded-2xl p-4 flex flex-col gap-4 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Sensor 06</div>
              <div className="flex items-center gap-1.5 text-xs text-critical">
                <span className="h-2 w-2 rounded-full bg-critical" /> Crítico
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div>Recepção Central</div>
                <div className="text-xs text-muted-foreground">Térreo</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Temperatura", value: "26,4 °C", color: "#ef4444", seed: 9 },
                { label: "Umidade", value: "38 %", color: "#38bdf8", seed: 4 },
                { label: "CO₂", value: "875 ppm", color: "#ef4444", seed: 7 },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="text-xl font-semibold">{m.value}</div>
                  </div>
                  <div className="w-28 shrink-0">
                    <Sparkline data={spark(m.seed)} color={m.color} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-2 border-t border-white/10">
              <span className="text-muted-foreground">Status</span><span className="text-success text-right">Online</span>
              <span className="text-muted-foreground">Última atualização</span><span className="text-right">24/05 09:41:23</span>
              <span className="text-muted-foreground">Bateria</span>
              <span className="text-right flex items-center justify-end gap-1.5">
                85%
                <span className="inline-block w-10 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <span className="block h-full w-[85%] bg-success" />
                </span>
              </span>
              <span className="text-muted-foreground">Sinal</span>
              <span className="text-right text-success">Ótimo ▮▮▮▮</span>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Últimas 24 horas</div>
              <div className="h-32">
                <ResponsiveContainer>
                  <LineChart data={sensor06Series}>
                    <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="hum" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={1.5} dot={false} yAxisId="right" />
                    <YAxis hide /><YAxis yAxisId="right" hide />
                    <XAxis dataKey="t" hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Temperatura (°C)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" />Umidade (%)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />CO₂ (ppm)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom: 3 charts + insights */}
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temp chart */}
            <div className="glass-strong rounded-2xl p-4 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Temperatura (°C)</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Temperatura</span>
                  <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-white/40 border-t border-dashed" />Média móvel</span>
                  <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-white/20" />Máx / Mín</span>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer>
                  <AreaChart data={tempSeries}>
                    <defs>
                      <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[15, 32]} ticks={[15,20,25,30]} tickFormatter={(v)=>`${v}°C`} width={32} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} fill="url(#gTemp)" />
                    <Line type="monotone" dataKey="avg" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Humidity chart */}
            <div className="glass-strong rounded-2xl p-4 min-w-0">
              <div className="text-sm font-medium mb-2">Umidade Relativa (%)</div>
              <div className="h-44">
                <ResponsiveContainer>
                  <AreaChart data={humSeries}>
                    <defs>
                      <linearGradient id="gHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0,100]} ticks={[0,25,50,75,100]} tickFormatter={(v)=>`${v}%`} width={32} />
                    <ReferenceArea y1={40} y2={60} fill="#22c55e" fillOpacity={0.12} label={{ value: "Faixa ideal (40% - 60%)", fontSize: 10, fill: "#86efac" }} />
                    <Area type="monotone" dataKey="h" stroke="#38bdf8" strokeWidth={2} fill="url(#gHum)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CO2 chart */}
            <div className="glass-strong rounded-2xl p-4 min-w-0">
              <div className="text-sm font-medium mb-2">CO₂ (ppm)</div>
              <div className="h-44">
                <ResponsiveContainer>
                  <AreaChart data={co2Series}>
                    <defs>
                      <linearGradient id="gCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0,1500]} ticks={[0,500,1000,1500]} width={32} />
                    <ReferenceArea y1={1000} y2={1500} fill="#ef4444" fillOpacity={0.15} label={{ value: "Ruim (>1000 ppm)", fontSize: 10, fill: "#fca5a5", position: "insideTopRight" }} />
                    <ReferenceArea y1={600} y2={1000} fill="#f59e0b" fillOpacity={0.12} label={{ value: "Moderado (600 - 1000)", fontSize: 10, fill: "#fcd34d", position: "insideTopRight" }} />
                    <ReferenceArea y1={0} y2={600} fill="#22c55e" fillOpacity={0.10} label={{ value: "Bom (<600 ppm)", fontSize: 10, fill: "#86efac", position: "insideBottomRight" }} />
                    <Area type="monotone" dataKey="c" stroke="#22c55e" strokeWidth={2} fill="url(#gCO2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="glass-strong rounded-2xl p-4 flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-info" />
              <div className="text-sm font-semibold">Insights Inteligentes</div>
            </div>
            {[
              { icon: Thermometer, color: "text-warning", text: "Temperatura acima da média entre 13h e 16h em 4 ambientes." },
              { icon: Cloud, color: "text-critical", text: "Sensor 06 apresentou o maior CO₂ nas últimas 24h (875 ppm)." },
              { icon: Droplets, color: "text-info", text: "Umidade abaixo da faixa ideal em 18% do tempo total." },
            ].map((it, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center shrink-0">
                  <it.icon className={`h-4 w-4 ${it.color}`} />
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">{it.text}</div>
              </div>
            ))}
            <button className="text-xs text-info hover:underline mt-auto self-start">Ver todas as análises →</button>
          </div>
        </section>

        {/* Recent alerts */}
        <section className="glass-strong rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="text-sm font-medium shrink-0 lg:w-40">Alertas recentes</div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
            {[
              { icon: AlertTriangle, color: "text-critical bg-critical/15", id: "06", label: "CO₂ elevado", tag: "Crítico", tagColor: "text-critical", time: "09:41" },
              { icon: Bug, color: "text-warning bg-warning/15", id: "07", label: "Temperatura alta 26,1 °C", tag: "Atenção", tagColor: "text-warning", time: "09:32" },
              { icon: Wind, color: "text-warning bg-warning/15", id: "11", label: "Umidade baixa 32%", tag: "Atenção", tagColor: "text-warning", time: "09:15" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 min-w-0">
                <div className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">Sensor {a.id}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.label}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[11px] font-medium ${a.tagColor}`}>• {a.tag}</div>
                  <div className="text-[10px] text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs text-info hover:underline shrink-0">Ver todos<br/>as alertas</button>
        </section>
      </main>
    </div>
  );
}
