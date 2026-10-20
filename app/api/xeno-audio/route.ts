import { XENO_CANTO_AUDIO_DOWNLOAD_ENDPOINT } from "@/constants/api";

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0)
    return new Response("Invalid recording", { status: 400 });

  try {
    const upstream = await fetch(
      `${XENO_CANTO_AUDIO_DOWNLOAD_ENDPOINT}/${id}/download`,
      {
        next: { revalidate: 60 * 60 * 24 * 30 },
      },
    );
    if (!upstream.ok) throw new Error("Xeno-canto request failed");

    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Recording unavailable", { status: 502 });
  }
}
