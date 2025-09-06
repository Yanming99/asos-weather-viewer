import { z } from "zod";

/** Station schema */
export const Station = z.object({
  id: z.string(),
  name: z.string().optional(),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});
export type StationT = z.infer<typeof Station>;

/** WeatherPoint */
export const WeatherPoint = z.object({
  // time
  time: z.union([z.string(), z.number()]).or(z.null()).optional(),
  timestamp: z.union([z.string(), z.number()]).or(z.null()).optional(),

  // temperature (°C)
  temp_c: z.coerce.number().optional(),
  temperature_c: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
  temp: z.coerce.number().optional(),
  air_temp_c: z.coerce.number().optional(),
  tmpc: z.coerce.number().optional(),

  // wind
  wind_kts: z.coerce.number().optional(),
  wind_speed: z.coerce.number().optional(), // m/s
  wind_mps: z.coerce.number().optional(),   // m/s
  sknt: z.coerce.number().optional(),       // kts
  wspd: z.coerce.number().optional(),       // kts
  wspdk: z.coerce.number().optional(),      // kts
  wind_x: z.coerce.number().optional(),     // m/s
  wind_y: z.coerce.number().optional(),     // m/s

  // pressure (hPa)
  pressure_hpa: z.coerce.number().optional(),
  pressure_mb: z.coerce.number().optional(),
  pressure: z.coerce.number().optional(),
  sea_level_pressure_hpa: z.coerce.number().optional(),
  slp: z.coerce.number().optional(),
  mslp: z.coerce.number().optional(),
  pres: z.coerce.number().optional(),
  alti: z.coerce.number().optional(),       // inHg
});


export const WeatherArray = z.array(WeatherPoint).transform((arr) =>
  arr.filter((p) => {
    const hasTemp =
      p.temp_c !== undefined || p.temperature_c !== undefined ||
      p.temperature !== undefined || p.temp !== undefined ||
      p.air_temp_c !== undefined || p.tmpc !== undefined;

    const hasWind =
      p.wind_kts !== undefined || p.wind_speed !== undefined ||
      p.wind_mps !== undefined || p.sknt !== undefined ||
      p.wspd !== undefined || p.wspdk !== undefined ||
      (p.wind_x !== undefined && p.wind_y !== undefined);

    const hasPressure =
      p.pressure_hpa !== undefined || p.pressure_mb !== undefined ||
      p.pressure !== undefined || p.sea_level_pressure_hpa !== undefined ||
      p.slp !== undefined || p.mslp !== undefined ||
      p.pres !== undefined || p.alti !== undefined;

    return hasTemp || hasWind || hasPressure;
  })
);
