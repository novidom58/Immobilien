// Synthetisierte Sounds via Web Audio API - keine externe Audiodatei nötig.
// Browser blockieren Ton ohne vorherige Nutzer-Geste; wir versuchen es
// trotzdem (funktioniert bei wiederkehrenden Besuchern meist) und scheitern
// lautlos, statt einen Fehler zu werfen.
function getAudioContext(): AudioContext | null {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new Ctx();
  } catch {
    return null;
  }
}

// Mechanischer Klick (kurzer, gedämpfter Impuls) - fürs Einführen des Schlüssels.
export function playKeyClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(180, now);
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    click.connect(clickGain).connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.09);
    setTimeout(() => ctx.close(), 300);
  } catch {
    // Autoplay-Policy oder fehlende Web-Audio-Unterstützung - einfach kein Ton.
  }
}

// Heller Aufschluss-Chime - für den Moment, in dem sich die Tür öffnet.
export function playDoorChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12 - i * 0.03, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    // Autoplay-Policy oder fehlende Web-Audio-Unterstützung - einfach kein Ton.
  }
}
