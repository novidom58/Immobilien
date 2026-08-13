// Synthetisierter Klick + Aufschluss-Chime via Web Audio API - keine externe
// Audiodatei nötig. Browser blockieren Ton ohne vorherige Nutzer-Geste; wir
// versuchen es trotzdem (funktioniert bei wiederkehrenden Besuchern meist)
// und scheitern lautlos, statt einen Fehler zu werfen.
export function playUnlockSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    // Mechanischer Klick (kurzer, gedämpfter Impuls)
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(180, now);
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    click.connect(clickGain).connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.09);

    // Heller Aufschluss-Chime, kurz danach
    const chimeStart = now + 0.42;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, chimeStart);
      gain.gain.setValueAtTime(0, chimeStart);
      gain.gain.linearRampToValueAtTime(0.12 - i * 0.03, chimeStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeStart + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(chimeStart);
      osc.stop(chimeStart + 0.65);
    });

    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Autoplay-Policy oder fehlende Web-Audio-Unterstützung - einfach kein Ton.
  }
}
