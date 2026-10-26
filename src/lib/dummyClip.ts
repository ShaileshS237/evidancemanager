const SAMPLE_RATE = 8000;

const cache = new Map<string, string>();

/** Builds a short placeholder WAV (soft beeps) so the media player can be tried before real files exist. */
export function dummyClipUrl(id: string, seconds = 8): string {
  const cached = cache.get(id);
  if (cached) return cached;

  const samples = SAMPLE_RATE * seconds;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples * 2, true);

  // Each clip gets its own pitch so different recordings sound distinguishable.
  const base = 330 + ([...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 5) * 55;
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    const beat = t % 1;
    const on = beat < 0.35;
    const env = on ? Math.sin((Math.PI * beat) / 0.35) : 0;
    const freq = Math.floor(t) % 2 ? base * 1.25 : base;
    const v = env * 0.25 * Math.sin(2 * Math.PI * freq * t);
    view.setInt16(44 + i * 2, v * 0x7fff, true);
  }

  const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
  cache.set(id, url);
  return url;
}
