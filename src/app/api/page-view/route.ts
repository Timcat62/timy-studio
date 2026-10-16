import { NextRequest, NextResponse } from "next/server";

const countryNames = new Intl.DisplayNames(["en"], {
  type: "region",
});

function toAscii(value: string | null): string | undefined {
  if (!value) return undefined;

  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || undefined;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return new NextResponse(null, { status: 415 });
  }

  let body: {
    path?: unknown;
    duration?: unknown;
    device?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (
    typeof body.path !== "string" ||
    !body.path.startsWith("/") ||
    body.path.startsWith("//") ||
    body.path.length > 500 ||
    typeof body.duration !== "number" ||
    !Number.isFinite(body.duration) ||
    body.duration < 0 ||
    body.duration > 86400 ||
    !["Mobile", "Tablet", "Desktop"].includes(String(body.device))
  ) {
    return new NextResponse(null, { status: 400 });
  }

  const city = toAscii(request.headers.get("cf-ipcity"));
  const countryCode = request.headers.get("cf-ipcountry");

  const country =
    countryCode && /^[A-Z]{2}$/.test(countryCode)
      ? toAscii(countryNames.of(countryCode) ?? null)
      : undefined;

  const location =
    [city, country].filter(Boolean).join(", ") || "Unknown location";

  const timestamp = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Paris",
    hour12: false,
  });

  const duration = Math.round(body.duration);
  const durationText =
    duration === 1 ? "1 second" : `${duration} seconds`;

  console.log(
    `[VISIT] ${timestamp} | ${body.path} | ${location} | ${body.device} | ${durationText}`
  );

  return NextResponse.json({ ok: true });
}
