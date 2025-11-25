import { NextResponse } from "next/server";
import { SAAVN_API_BASE } from "@/config/saavn";

// Simple AutoMix: map mood/activity to search keywords and return tracks
export async function POST(request) {
  try {
    const body = await request.json();
    const { mood = "chill", activity = "study" } = body || {};

    // Map mood/activity to simple keyword queries
    const presets = {
      chill: "chill mix",
      focus: "lofi focus",
      workout: "workout hits",
      party: "party mix",
      happy: "happy hits",
      sad: "sad songs",
    };

    const baseQuery = presets[mood] || presets.chill;
    const finalQuery = `${baseQuery} ${activity}`.trim();

    const apiUrl = `${SAAVN_API_BASE}/api/search?query=${encodeURIComponent(
      finalQuery
    )}`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error("Saavn search failed");
    }

    const json = await res.json();
    const data = json?.data || {};

    // Prefer songs from search results; fall back to top results from albums/playlists if needed
    const songs =
      data?.songs?.results?.length
        ? data.songs.results
        : data?.top_query?.results?.filter((item) => item.type === "song") || [];

    if (!songs || songs.length === 0) {
      return NextResponse.json(
        { success: false, message: "No songs found for AutoMix" },
        { status: 200 }
      );
    }

    // Normalize to the structure expected by the existing player (id, name, image, primaryArtists etc.)
    const normalized = songs.slice(0, 30).map((song) => ({
      id: song.id,
      name: song.name || song.title,
      image: song.image,
      primaryArtists: song.primaryArtists || song.primary_artists,
      duration: song.duration,
      url: song.downloadUrl || song.download_url,
      type: "automix",
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          query: finalQuery,
          tracks: normalized,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AutoMix API error", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
