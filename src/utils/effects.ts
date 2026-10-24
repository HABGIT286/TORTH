import confetti from 'canvas-confetti';

// Web Audio API synthesized tactile sounds with rich audio haptics
export const playHapticSound = (type: 'tap' | 'success' | 'send' | 'switch' | 'toggle' = 'tap') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success' || type === 'send') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.22); // C6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.32);
    } else if (type === 'switch' || type === 'toggle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch {
    // Audio Context handled
  }
};

// Luxury celebration burst
export const triggerLuxuryCelebration = () => {
  playHapticSound('success');
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#a855f7', '#06b6d4', '#ec4899', '#eab308', '#ffffff'],
      disableForReducedMotion: true
    });
  } catch {
    // Fallback
  }
};

// Interactive click particle & ripple creator
export const createClickRipple = (e: React.MouseEvent<HTMLElement>) => {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('luxury-ripple-particle');

  const existingRipple = target.getElementsByClassName('luxury-ripple-particle')[0];
  if (existingRipple) {
    existingRipple.remove();
  }

  target.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
};
