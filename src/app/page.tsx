"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { Station, type StationT, WeatherArray } from "@/lib/schemas";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup),        { ssr: false });

type WxRow = {
  time: string;
  temp_c: number | null;
  wind_kts: number | null;
  pressure_hpa: number | null;
};

export default function Home() {
  const [stations, setStations] = useState<StationT[]>([]);
  const [selected, setSelected] = useState<StationT | null>(null);
  const [weather, setWeather] = useState<WxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const L = await import("leaflet");
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/windborne?path=/stations");
        const raw = await r.json();
        const parsed: StationT[] = raw.map((s: any) =>
          Station.parse({
            id:  String(s.id ?? s.station_id ?? s.code),
            name: s.name ?? s.station_name,
            lat: Number(s.lat ?? s.latitude),
            lon: Number(s.lon ?? s.longitude),
          })
        );
        setStations(parsed);
      } catch {
        setErr("Failed to load station list (malformed data).");
      }
    })();
  }, []);

  const center = useMemo<LatLngExpression>(() => [20, 0], []);

  async function loadWeather(st: StationT) {
    setSelected(st);
    setErr("");
    setLoading(true);
    try {
      const url = `/api/windborne?path=/historical_weather&station=${encodeURIComponent(st.id)}`;
      const r = await fetch(url);
      const raw = await r.json();

      const candidateArrays: any[] = [];
      if (Array.isArray(raw)) candidateArrays.push(raw);
      if (raw && typeof raw === "object") {
        for (const k of ["data", "results", "items", "records", "points"]) {
          const v = (raw as any)[k];
          if (Array.isArray(v)) candidateArrays.push(v);
        }
        if (!candidateArrays.length) {
          const firstArray = Object.values(raw).find(Array.isArray);
          if (firstArray) candidateArrays.push(firstArray as any[]);
        }
      }
      const arr = candidateArrays[0] ?? [];

      if (arr.length) console.log("sample keys:", Object.keys(arr[0]));

      const parsed = WeatherArray.safeParse(arr);
      const rows = parsed.success ? parsed.data : [];

      const normalized: WxRow[] = rows.map((p: any) => {
        const tRaw = p.timestamp ?? p.time ?? Date.now();
        const tNum = Number(tRaw);
        const iso =
          Number.isFinite(tNum) && tNum > 10_000
            ? new Date(tNum).toISOString()
            : new Date(tRaw).toISOString();

        const temp =
          p.temp_c ?? p.temperature_c ?? p.temperature ??
          p.temp ?? p.air_temp_c ?? p.tmpc ?? null;

        let wind =
          p.wind_kts ?? p.sknt ?? p.wspdk ?? p.wspd ?? null;
        if (wind == null && typeof p.wind_speed === "number") wind = p.wind_speed * 1.94384;
        if (wind == null && typeof p.wind_mps   === "number") wind = p.wind_mps   * 1.94384;
        if (wind == null && typeof p.wind_x === "number" && typeof p.wind_y === "number") {
          const mag = Math.sqrt(p.wind_x ** 2 + p.wind_y ** 2);
          wind = mag * 1.94384;
        }

        let pressure =
          p.pressure_hpa ?? p.pressure ?? p.mslp ?? p.pres ??
          p.pressure_mb ?? p.sea_level_pressure_hpa ?? p.slp ?? null;
        if (pressure == null && typeof p.alti === "number") pressure = p.alti * 33.8639;

        return {
          time: iso,
          temp_c: typeof temp === "number" ? temp : null,
          wind_kts: typeof wind === "number" ? Number(wind.toFixed(2)) : null,
          pressure_hpa: typeof pressure === "number" ? Number(pressure.toFixed(1)) : null,
        };
      });

      setWeather(normalized);
    } catch (e) {
      console.error(e);
      setErr("Weather data error (upstream or format).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid h-screen grid-cols-1 md:grid-cols-[2fr_1fr]">
      <div className="relative">
        <MapContainer center={center} zoom={2} className="h-full w-full" scrollWheelZoom>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {stations.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lon]} eventHandlers={{ click: () => loadWeather(s) }}>
              <Popup>
                <b>{s.name ?? s.id}</b><br />
                <span className="text-xs opacity-70">ID: {s.id}</span><br />
                {s.lat.toFixed(2)}, {s.lon.toFixed(2)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/60 px-3 py-1 text-xs text-white">
          ASOS Explorer • API 20/min • 60s cache
        </div>
      </div>

      <aside className="flex h-full flex-col gap-3 overflow-auto border-t p-4 md:border-l md:border-t-0">
        <h2 className="text-lg font-semibold">
          {selected ? selected.name ?? selected.id : "Select a station"}
        </h2>

        {loading && <p className="text-sm text-gray-600">Loading…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && weather.length > 0 && (
          <>
            <div className="text-sm text-gray-600">Points: {weather.length}</div>
            <div className="max-h-[60vh] overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium">Time</th>
                    <th className="px-2 py-2 text-left font-medium">Temp (°C)</th>
                    <th className="px-2 py-2 text-left font-medium">Wind (kts)</th>
                    <th className="px-2 py-2 text-left font-medium">Pressure (hPa)</th>
                  </tr>
                </thead>
                <tbody>
                  {weather.slice(0, 300).map((w, i) => (
                    <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/60"}>
                      <td className="px-2 py-1 font-mono">{w.time}</td>
                      <td className="px-2 py-1">{w.temp_c ?? "-"}</td>
                      <td className="px-2 py-1">{w.wind_kts ?? "-"}</td>
                      <td className="px-2 py-1">{w.pressure_hpa ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && weather.length === 0 && selected && !err && (
          <p className="text-sm text-gray-600">No valid records to show.</p>
        )}

        <p className="mt-auto text-xs text-gray-500">
          Data validated with Zod; corrupted rows filtered. Calls go through a serverless proxy with retry + 60s cache to respect rate limits.
        </p>
      </aside>
    </main>
  );
}
