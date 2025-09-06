// src/app/api/windborne/route.ts
// Next.js App Router (Node runtime)
export const dynamic = "force-dynamic"
export const revalidate = 0;

const BASE = "https://sfc.windbornesystems.com";


const cache = new Map<string, { t: number; data: any }>();
const TTL_MS = 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url: string) {

  let lastErr: any;
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, {

        cache: "no-store",
        headers: { accept: "application/json" },
        // @ts-ignore next config hint
        next: { revalidate: 0 },
      });


      if (!res.ok) {
        lastErr = new Error(`Upstream ${res.status} ${res.statusText}`);

        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          await sleep(400 * (i + 1));
          continue;
        }

        throw lastErr;
      }


      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (_) {

        return text;
      }
    } catch (e) {
      lastErr = e;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "/stations";
    const station = url.searchParams.get("station") || "";


    let target = `${BASE}/stations`;
    if (path === "/historical_weather") {
      target = `${BASE}/historical_weather?station=${encodeURIComponent(station)}`;
    }

    const key = `${path}|${station}`;
    const now = Date.now();


    const hit = cache.get(key);
    if (hit && now - hit.t < TTL_MS) {
      return new Response(JSON.stringify(hit.data), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }


    const data = await fetchJSON(target);

    cache.set(key, { t: now, data });


    const body = typeof data === "string" ? { raw: data } : data;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err: any) {

    return new Response(
      JSON.stringify({ error: "proxy_upstream_error", detail: String(err) }),
      {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }
}
