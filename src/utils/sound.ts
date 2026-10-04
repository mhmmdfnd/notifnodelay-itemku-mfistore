// Web Audio API Synthesizer for instant, zero-dependency sound notifications

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Pleasant Multi-tone Cash Register / Coin Chime for New Orders
 */
export function playOrderSound(volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    // High note 1 (E6 - 1318 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1318.5, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Higher note 2 (B6 - 1975 Hz) after 80ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.5, now + 0.08);
    gain2.gain.setValueAtTime(0.5, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Final sparkle chime note (E7 - 2637 Hz) after 160ms
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(2637.0, now + 0.16);
    gain3.gain.setValueAtTime(0.6, now + 0.16);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.4);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.6);

    osc3.start(now + 0.16);
    osc3.stop(now + 0.75);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

/**
 * Crisp Double Ding for Buyer Chat
 */
export function playChatSound(volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    // Note 1 (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Note 2 (1174 Hz - D6) after 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.6, now + 0.12);
    gain2.gain.setValueAtTime(0.45, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Chat audio play failed:', e);
  }
}

/**
 * Urgent Alarm Tone for Disputes / Kendala Pesanan
 */
export function playDisputeAlarm(volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    // 3 alternating warning pulses (Sawtooth/Square sharp siren)
    const times = [0, 0.18, 0.36];
    times.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now + t);
      osc.frequency.exponentialRampToValueAtTime(650, now + t + 0.15);

      gain.gain.setValueAtTime(0.5, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.16);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + t);
      osc.stop(now + t + 0.17);
    });
  } catch (e) {
    console.warn('Dispute audio play failed:', e);
  }
}

/**
 * Request Desktop Push Notification permission
 */
export async function requestDesktopNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Send a desktop notification
 */
export function triggerDesktopNotification(title: string, body: string, icon?: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/bell.svg',
      });
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  }
}
