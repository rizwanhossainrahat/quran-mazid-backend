const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

/**
 * Returns the CDN audio URL for a given global ayah ID.
 */
export function getAudioUrl(globalAyahId: number): string {
  return `${AUDIO_BASE}/${globalAyahId}.mp3`;
}
