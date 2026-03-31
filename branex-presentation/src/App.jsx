import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ─── THEME ─── */
const T = {
  void:'#060B18', deep:'#0F1B35', card:'rgba(255,255,255,0.03)',
  signal:'#00D4AA', neural:'#6C5CE7', data:'#0984E3', pulse:'#00CEFF',
  white:'#FFFFFF', muted:'rgba(255,255,255,0.6)', faint:'rgba(255,255,255,0.35)',
  border:'rgba(255,255,255,0.07)', mono:"'JetBrains Mono',monospace",
  gradHero:'linear-gradient(135deg,#00D4AA,#0984E3)',
  gradAI:'linear-gradient(135deg,#6C5CE7,#00D4AA)',
  gradFull:'linear-gradient(90deg,#00D4AA,#6C5CE7,#0984E3,#00CEFF)',
  error:'#FF6B6B', warn:'#FECA57',
};

/* ─── RESPONSIVE HOOK ─── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1024, isDesktop: w >= 1024, w };
}

/* ─── NEURAL CANVAS (optimized) ─── */
function NeuralCanvas({ paused }) {
  const ref = useRef(null);
  const aid = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    const N = Math.min(55, Math.floor(innerWidth / 25));
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1 + Math.random() * 2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > c.width) n.vx *= -1;
        if (n.y < 0 || n.y > c.height) n.vy *= -1;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,170,0.3)'; ctx.fill();
      });
      const maxD = 140;
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,170,${(1 - d / maxD) * 0.09})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
      aid.current = requestAnimationFrame(draw);
    };
    if (!paused) draw();
    return () => { cancelAnimationFrame(aid.current); removeEventListener('resize', resize); };
  }, [paused]);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── UTILITIES ─── */
const st = (v, d = 0) => ({
  opacity: v ? 1 : 0,
  transform: v ? 'translateY(0)' : 'translateY(22px)',
  transition: `opacity .65s ease ${d}ms, transform .65s cubic-bezier(.4,0,.2,1) ${d}ms`,
});

const Label = ({ t }) => (
  <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 3, color: T.signal, textTransform: 'uppercase', marginBottom: 12 }} role="heading" aria-level="3">
    // {t}
  </div>
);

const AccentLine = () => <div style={{ height: 1, background: T.gradFull, opacity: .5, width: 300, maxWidth: '80%', margin: '0 auto' }} />;

/* ─── BRANEX LOGO ─── */
function BranexLogo({ size = 22 }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: size, letterSpacing: size * 0.4, fontWeight: 600, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: T.white }}>BRAN</span>
      <span style={{ background: T.gradHero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EX</span>
    </span>
  );
}

/* ─── TYPEWRITER ─── */
function Typewriter({ texts, speed = 60 }) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = texts[idx];
    const id = setTimeout(() => {
      if (!del && chars < cur.length) setChars(c => c + 1);
      else if (!del && chars === cur.length) setTimeout(() => setDel(true), 2200);
      else if (del && chars > 0) setChars(c => c - 1);
      else { setDel(false); setIdx(i => (i + 1) % texts.length); }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(id);
  }, [chars, del, idx, texts, speed]);
  return <span>{texts[idx].slice(0, chars)}<span style={{ animation: 'blink 1s infinite', color: T.signal }}>|</span></span>;
}

/* ─── COUNTER ─── */
function Counter({ target, suf = '', dur = 1800, v }) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!v || done.current) return; done.current = true;
    let cur = 0; const steps = 60; const step = target / steps;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); } else setVal(Math.floor(cur));
    }, dur / steps);
    return () => clearInterval(id);
  }, [v, target, dur]);
  return <span>{val}{suf}</span>;
}

/* ─── SVG ICONS ─── */
const Icons = {
  dashboard: (c = T.signal, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="4" rx="1" /><rect x="14" y="10" width="7" height="11" rx="1" /><rect x="3" y="13" width="7" height="8" rx="1" />
    </svg>
  ),
  connector: (c = T.data, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  target: (c = T.neural, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" fill={c} />
    </svg>
  ),
  brain: (c = T.pulse, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 4.5 7.2A5 5 0 0 1 19 14a5 5 0 0 1-3.5 4.8A5 5 0 0 1 12 22a5 5 0 0 1-3.5-3.2A5 5 0 0 1 5 14a5 5 0 0 1 2.5-4.8A5 5 0 0 1 12 2z" /><path d="M12 2v20" />
    </svg>
  ),
  finance: (c = T.signal, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  globe: (c = T.data, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  search: (c = T.signal, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  doc: (c = T.data, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  zap: (c = T.neural, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  rocket: (c = T.pulse, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  check: (c = T.signal, s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  whatsapp: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  ),
  close: (c = T.white, s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  expand: (c = T.white, s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  ),
  // Sector icons
  store: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-4h16l1 4" /><path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" /><path d="M3 9h18" /><path d="M9 21V13h6v8" /></svg>,
  megaphone: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
  ship: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  cow: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2c1 1 2 3 2 5h2l1-3M9 2C8 3 7 5 7 7H5L4 4" /><ellipse cx="12" cy="14" rx="7" ry="7" /><circle cx="10" cy="13" r="1" fill={c} /><circle cx="14" cy="13" r="1" fill={c} /><path d="M9 17c1 1 2.5 1.5 3 1.5s2-.5 3-1.5" /></svg>,
  health: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  creditCard: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  graduation: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  coffee: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
  building: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" /></svg>,
  bolt: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  cart: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
  briefcase: (c, s = 28) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
};

/* ─── LIGHTBOX ─── */
function Lightbox({ project, onClose }) {
  if (!project) return null;
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,11,24,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .3s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '100%', background: T.deep, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.6)', animation: 'scaleIn .35s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ position: 'relative' }}>
          <img src={project.img} alt={project.title} loading="lazy" style={{ width: '100%', height: 'auto', maxHeight: '55vh', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 60%,rgba(15,27,53,.95) 100%)' }} />
          <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 5 }}>
            {['#FF5F57', '#FFBD2E', '#28CA41'].map((c, j) => <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
            {Icons.close()}
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: project.c, background: `${project.c}15`, border: `1px solid ${project.c}33`, borderRadius: 10, padding: '3px 10px', textTransform: 'uppercase' }}>{project.tag}</span>
          <h3 style={{ fontSize: 22, fontWeight: 600, color: T.white, margin: '10px 0 4px' }}>{project.title}</h3>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 1, marginBottom: 12 }}>{project.client}</div>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7, marginBottom: 16 }}>{project.desc}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {project.stack.map((s, j) => <span key={j} style={{ fontFamily: T.mono, fontSize: 10, color: T.signal, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, padding: '3px 10px' }}>{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FLOATING WHATSAPP ─── */
function FloatingWA({ currentSlide }) {
  if (currentSlide === 0 || currentSlide === 7) return null;
  return (
    <a href="https://wa.me/573008074984?text=Hola%20Branex,%20quiero%20conocer%20sus%20servicios" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"
      style={{ position: 'fixed', bottom: 20, right: 60, zIndex: 150, width: 48, height: 48, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(37,211,102,0.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)'; }}>
      {Icons.whatsapp(22)}
    </a>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 1 — HERO
   ═══════════════════════════════════════════════ */
function SlideHero({ visible: v }) {
  const { isMobile } = useBreakpoint();
  const stats = [
    { val: '21%', label: 'de empresas en LatAm usa analytics', c: T.signal },
    { val: '<5%', label: 'de sus datos son realmente analizados', c: T.neural },
    { val: '+7%', label: 'más ingresos con decisiones data-driven', c: T.data },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0 24px' : '0 60px' }}>
      <div style={{ ...st(v, 0), marginBottom: 28 }}><BranexLogo size={isMobile ? 20 : 26} /></div>
      <h1 style={{ ...st(v, 100), fontSize: 'clamp(24px,4.2vw,54px)', fontWeight: 600, textAlign: 'center', color: T.white, lineHeight: 1.2, maxWidth: 820, marginBottom: 14 }}>
        <Typewriter texts={['Donde los datos se convierten en decisiones.', 'Inteligencia visual para empresas que crecen.', 'Tus datos tienen historia. Nosotros la hacemos visible.']} />
      </h1>
      <p style={{ ...st(v, 220), fontSize: 'clamp(13px,1.5vw,17px)', color: T.muted, textAlign: 'center', maxWidth: 560, marginBottom: 10, lineHeight: 1.7 }}>
        Dashboards con IA · Entrega en 1–2 semanas · Soluciones a medida para cualquier industria
      </p>
      <div style={{ ...st(v, 280), margin: '14px 0 28px' }}><AccentLine /></div>
      <div style={{ ...st(v, 380), display: 'flex', gap: isMobile ? 10 : 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: isMobile ? '10px 14px' : '12px 20px', display: 'flex', alignItems: 'center', gap: 12, minWidth: isMobile ? 'auto' : 210, flex: isMobile ? '1 1 100%' : 'none' }}>
            <span style={{ fontFamily: T.mono, fontSize: isMobile ? 18 : 22, fontWeight: 600, color: s.c }}>{s.val}</span>
            <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.4, maxWidth: 160 }}>{s.label}</span>
          </div>
        ))}
      </div>
      <p style={{ ...st(v, 480), marginTop: 14, fontFamily: T.mono, fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: 2 }}>FUENTE: ERNST & YOUNG (EY) · REPORTE ANALÍTICA LATAM</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 2 — PROBLEMA (Before/After Visual)
   ═══════════════════════════════════════════════ */
function SlideProblem({ visible: v }) {
  const { isMobile } = useBreakpoint();
  const [showAfter, setShowAfter] = useState(false);
  useEffect(() => {
    if (v) {
      const t = setTimeout(() => setShowAfter(true), 1800);
      return () => clearTimeout(t);
    } else { setShowAfter(false); }
  }, [v]);

  const chaosItems = [
    { label: 'Excel', x: 10, y: 15, rot: -12 },
    { label: 'WhatsApp', x: 55, y: 8, rot: 8 },
    { label: 'Cuadernos', x: 25, y: 60, rot: -5 },
    { label: 'PDFs', x: 65, y: 55, rot: 15 },
    { label: 'Emails', x: 40, y: 35, rot: -8 },
    { label: 'Facturas', x: 75, y: 30, rot: 10 },
  ];

  const orderItems = [
    { label: 'Shopify', angle: 0 },
    { label: 'Google Ads', angle: 60 },
    { label: 'ERP / CRM', angle: 120 },
    { label: 'Redes', angle: 180 },
    { label: 'Contabilidad', angle: 240 },
    { label: 'Inventario', angle: 300 },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0 20px' : '0 50px' }}>
      <div style={st(v, 0)}><Label t="EL.PROBLEMA" /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,3vw,40px)', fontWeight: 600, color: T.white, textAlign: 'center', maxWidth: 700, lineHeight: 1.25, marginBottom: 8 }}>
        El <span style={{ color: T.signal }}>79% de las empresas</span> toma decisiones a ciegas
      </h2>
      <p style={{ ...st(v, 140), fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 500, marginBottom: 28, lineHeight: 1.7 }}>
        Tienen los datos. Los generan cada día. Pero no los convierten en ventaja competitiva.
      </p>

      {/* Before / After Visual */}
      <div style={{ ...st(v, 220), display: 'flex', gap: isMobile ? 12 : 28, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 820, marginBottom: 20 }}>
        {/* BEFORE - Chaos */}
        <div style={{ flex: '1 1 320px', maxWidth: 380, background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 16, padding: '18px', position: 'relative', minHeight: isMobile ? 180 : 200, overflow: 'hidden' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.error, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.error, animation: 'pulse-glow 2s infinite' }} /> ANTES — Sin estructura
          </div>
          <div style={{ position: 'relative', height: isMobile ? 130 : 150 }}>
            {chaosItems.map((item, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${item.x}%`, top: `${item.y}%`,
                transform: `rotate(${item.rot}deg)`,
                fontFamily: T.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.18)',
                borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap',
                animation: `float-chaos ${2 + i * 0.3}s ease-in-out infinite alternate`,
              }}>
                {item.label}
              </div>
            ))}
            {/* Scattered lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
              <line x1="20%" y1="25%" x2="55%" y2="45%" stroke={T.error} strokeWidth="1" strokeDasharray="4,4" />
              <line x1="60%" y1="20%" x2="30%" y2="70%" stroke={T.error} strokeWidth="1" strokeDasharray="4,4" />
              <line x1="75%" y1="40%" x2="45%" y2="60%" stroke={T.error} strokeWidth="1" strokeDasharray="4,4" />
            </svg>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: showAfter ? T.signal : T.faint, fontSize: isMobile ? 20 : 28, transition: 'color .8s', flexShrink: 0 }}>
          {isMobile ? '↓' : '→'}
        </div>

        {/* AFTER - Order */}
        <div style={{ flex: '1 1 320px', maxWidth: 380, background: showAfter ? 'rgba(0,212,170,0.04)' : T.card, border: `1px solid ${showAfter ? 'rgba(0,212,170,0.2)' : T.border}`, borderRadius: 16, padding: '18px', position: 'relative', minHeight: isMobile ? 180 : 200, overflow: 'hidden', transition: 'all 1s' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: showAfter ? T.signal : T.faint, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, transition: 'color .8s' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: showAfter ? T.signal : T.faint, transition: 'background .8s' }} /> DESPUÉS — Con Branex
          </div>
          <div style={{ position: 'relative', height: isMobile ? 130 : 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Central hub */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: showAfter ? T.gradHero : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 1s', position: 'relative', zIndex: 2,
              boxShadow: showAfter ? `0 0 30px rgba(0,212,170,0.3)` : 'none',
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 8, color: showAfter ? '#060B18' : T.faint, fontWeight: 700, letterSpacing: 1, transition: 'color 1s' }}>BX</span>
            </div>
            {/* Orbiting items */}
            {orderItems.map((item, i) => {
              const r = isMobile ? 58 : 65;
              const rad = (item.angle * Math.PI) / 180;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - 30px)`, top: `calc(50% + ${y}px - 10px)`,
                  fontFamily: T.mono, fontSize: 9, color: showAfter ? T.white : 'rgba(255,255,255,0.2)',
                  background: showAfter ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${showAfter ? 'rgba(0,212,170,0.25)' : T.border}`,
                  borderRadius: 6, padding: '3px 7px', whiteSpace: 'nowrap', textAlign: 'center',
                  transition: `all 1s ease ${i * 100}ms`, zIndex: 2,
                  opacity: showAfter ? 1 : 0.3,
                }}>
                  {item.label}
                </div>
              );
            })}
            {/* Connection lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {orderItems.map((item, i) => {
                const r = isMobile ? 58 : 65;
                const rad = (item.angle * Math.PI) / 180;
                return (
                  <line key={i} x1="50%" y1="50%"
                    x2={`calc(50% + ${Math.cos(rad) * r * 0.6}px)`} y2={`calc(50% + ${Math.sin(rad) * r * 0.6}px)`}
                    stroke={showAfter ? T.signal : 'transparent'} strokeWidth="1" opacity="0.3"
                    style={{ transition: `stroke 1s ease ${i * 100}ms` }} />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ ...st(v, 400), display: 'flex', gap: isMobile ? 8 : 16, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 720 }}>
        {[
          { num: 21, suf: '%', title: 'Usan analytics', c: T.signal },
          { num: 5, suf: '%', title: 'Datos analizados', c: T.neural },
          { num: 7, suf: '%+', title: 'Más ingresos', c: T.data },
        ].map((s, i) => (
          <div key={i} style={{ flex: '1 1 150px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px', textAlign: 'center', transition: 'border-color .3s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = s.c + '44'}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ fontFamily: T.mono, fontSize: 'clamp(24px,3vw,38px)', fontWeight: 600, color: s.c, lineHeight: 1 }}>
              <Counter target={s.num} suf={s.suf} v={v} dur={1600 + i * 200} />
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{s.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 3 — SERVICIOS (SVG Icons, Interactive)
   ═══════════════════════════════════════════════ */
const SVCS = [
  { icon: () => Icons.dashboard(T.signal, 28), name: 'Panel de Mando', desc: 'Dashboard ejecutivo con los KPIs críticos de tu negocio en tiempo real. Decisiones informadas cada mañana.', c: T.signal },
  { icon: () => Icons.connector(T.data, 28), name: 'Conector Inteligente', desc: 'Integración de Shopify, ERPs, CRMs y hojas de cálculo en un sistema unificado de datos.', c: T.data },
  { icon: () => Icons.target(T.neural, 28), name: 'Radar Comercial', desc: 'Análisis de ventas y tendencias para retail, moda, bebidas y agencias de marketing.', c: T.neural },
  { icon: () => Icons.brain(T.pulse, 28), name: 'Motor de Decisiones', desc: 'Modelos con IA que generan recomendaciones automáticas a partir de tus datos.', c: T.pulse },
  { icon: () => Icons.finance(T.signal, 28), name: 'Radiografía Financiera', desc: 'Análisis de costos, márgenes y rentabilidad por producto o línea de negocio.', c: T.signal },
  { icon: () => Icons.globe(T.data, 28), name: 'Plataforma Custom', desc: 'Apps web a medida con chatbots, LLMs e integraciones de datos desde cero.', c: T.data },
];

function SlideServices({ visible: v }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [active, setActive] = useState(null);
  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px 20px' : '20px 50px', overflowY: isMobile ? 'auto' : 'hidden' }}>
      <div style={st(v, 0)}><Label t="SERVICIOS.BRANEX" /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,2.8vw,34px)', fontWeight: 600, color: T.white, textAlign: 'center', marginBottom: 6 }}>Lo que construimos para tu empresa</h2>
      <p style={{ ...st(v, 140), fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 480, marginBottom: 24, lineHeight: 1.6 }}>
        Si puedes imaginarlo con datos, nosotros lo hacemos realidad.
      </p>
      <div style={{ ...st(v, 200), display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12, width: '100%', maxWidth: 920 }}>
        {SVCS.map((s, i) => {
          const isActive = active === i;
          return (
            <div key={i}
              onClick={() => setActive(isActive ? null : i)}
              onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.borderColor = s.c + '44'; e.currentTarget.style.transform = 'translateY(-4px)'; } }}
              onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.borderColor = isActive ? s.c + '44' : T.border; e.currentTarget.style.transform = 'translateY(0)'; } }}
              style={{
                background: isActive ? `${s.c}08` : T.card,
                border: `1px solid ${isActive ? s.c + '44' : T.border}`,
                borderRadius: 14, padding: '18px', cursor: 'pointer',
                transition: 'all .3s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.c}10`, border: `1px solid ${s.c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, marginLeft: isMobile ? 0 : 56 }}>{s.desc}</div>
              <div style={{ marginTop: 12, height: 2, width: isActive ? '100%' : 36, background: s.c, borderRadius: 2, opacity: .7, transition: 'width .4s ease' }} />
            </div>
          );
        })}
      </div>
      <div style={{ ...st(v, 400), marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Power BI', 'React / Next.js', 'Supabase', 'Shopify API', 'Claude / GPT', 'Python', 'Vercel'].map((t, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 20, padding: '3px 10px' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 4 — PORTAFOLIO (Bigger, Lightbox)
   ═══════════════════════════════════════════════ */
const PROJS = [
  { img: '/p-warroom.jpg', tag: 'Dashboard Estratégico', c: T.signal, title: 'War Room del Importador', client: 'Analdex · XVI Foro Nacional', desc: 'Centro de comando para 200+ importadores. KPIs macro, análisis de coyuntura Colombia-Ecuador y calculadora de solvencia DIAN integrados en tiempo real. Incluye Índice de Dolor del Importador (IDI) — métrica propietaria Branex.', stack: ['React', 'Vite', 'Vercel', 'API TRM'] },
  { img: '/p-esumer.jpg', tag: 'Business Intelligence', c: T.neural, title: 'Dashboard Grados ESUMER', client: 'Institución Universitaria ESUMER', desc: 'Panel en vivo para seguimiento de 624 candidatos a grado por programa académico. Distribución por estado, género y programa con actualización automática desde Google Sheets.', stack: ['React', 'Google Sheets API'] },
  { img: '/p-platform.jpg', tag: 'Fintech App', c: T.data, title: 'BRANEX Investment Platform', client: 'Plataforma propia · Bloomberg-style', desc: 'Terminal para gestión de portafolios de inversión con datos en tiempo real vía Finnhub. Autenticación Supabase, gráficos avanzados y análisis de posiciones.', stack: ['Next.js', 'Supabase', 'Finnhub'] },
  { img: '/p-essa.jpg', tag: 'Calculadora Financiera', c: T.signal, title: 'ESSA — Bonos Deuda Pública', client: 'Electrificadora de Santander', desc: 'Prospecto interactivo para bonos BDPI ($200MM COP) con proyección dinámica de IPC, IBR, UVR y TRM. 5 series, hasta 50 años de plazo. Fórmulas oficiales BVC.', stack: ['React', 'Vite', 'Finanzas'] },
  { img: '/p-atratus.jpg', tag: 'Estrategia Digital', c: T.neural, title: 'Atratus — Ropa Outdoor', client: 'Marca colombiana de avistamiento', desc: 'Web completa con catálogo, blog editorial SEO-optimizado (keyword "senderismo" como Blue Ocean) y experiencia de compra premium para marca de nicho outdoor.', stack: ['Next.js', 'Vercel', 'SEO'] },
  { img: '/p-ganadero.jpg', tag: 'Landing & Conversión', c: T.data, title: 'José Correa Ganadero', client: 'Metodología rentabilidad ganadera', desc: 'Landing de alta conversión con copy persuasivo, testimonios reales UGC de YouTube/TikTok, y pasarela Wompi para +200 ganaderos colombianos. Integración Meta Pixel + CAPI.', stack: ['React', 'Vercel', 'Meta CAPI'] },
];

function SlidePortfolio({ visible: v }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [lightbox, setLightbox] = useState(null);
  const [hov, setHov] = useState(null);
  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', padding: isMobile ? '50px 16px 20px' : '16px 40px', overflowY: isMobile ? 'auto' : 'hidden' }}>
        <div style={st(v, 0)}><Label t="PROYECTOS.REALES" /></div>
        <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,2.6vw,32px)', fontWeight: 600, color: T.white, textAlign: 'center', marginBottom: 4 }}>Resultados que hablan por sí solos</h2>
        <p style={{ ...st(v, 120), fontSize: 13, color: T.muted, textAlign: 'center', marginBottom: 16, lineHeight: 1.6, maxWidth: 460 }}>
          Proyectos reales entregados en 1–2 semanas. Haz clic para ver en detalle.
        </p>
        <div style={{ ...st(v, 180), display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: isMobile ? 14 : 12, width: '100%', maxWidth: 1020 }}>
          {PROJS.map((p, i) => (
            <div key={i}
              onClick={() => setLightbox(p)}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              role="button" tabIndex={0} aria-label={`Ver proyecto: ${p.title}`}
              onKeyDown={e => e.key === 'Enter' && setLightbox(p)}
              style={{
                borderRadius: 14, overflow: 'hidden',
                border: `1px solid ${hov === i ? p.c + '55' : T.border}`,
                cursor: 'pointer', transition: 'all .35s',
                transform: hov === i ? 'translateY(-5px) scale(1.01)' : 'none',
                boxShadow: hov === i ? `0 18px 45px rgba(0,0,0,.5), 0 0 25px ${p.c}22` : 'none',
                background: T.deep,
              }}>
              <div style={{ height: isMobile ? 160 : hov === i ? 135 : 120, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'top center', transition: 'height .35s', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(6,11,24,.15) 0%,rgba(6,11,24,.85) 100%)' }} />
                <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 4 }}>
                  {['#FF5F57', '#FFBD2E', '#28CA41'].map((c, j) => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
                </div>
                {/* Expand icon on hover */}
                <div style={{ position: 'absolute', top: 8, right: 10, opacity: hov === i ? 1 : 0, transition: 'opacity .3s', background: 'rgba(0,0,0,.4)', borderRadius: 6, padding: 4 }}>
                  {Icons.expand(T.white, 14)}
                </div>
                <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, color: p.c, background: `${p.c}15`, border: `1px solid ${p.c}33`, borderRadius: 8, padding: '2px 8px', textTransform: 'uppercase' }}>{p.tag}</span>
                </div>
              </div>
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.white, marginBottom: 3, lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.faint, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>{p.client}</div>
                {/* Always show description on mobile, hover on desktop */}
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.55, marginBottom: 6, display: isMobile || hov === i ? 'block' : 'none', overflow: 'hidden', maxHeight: isMobile ? 'none' : 44 }}>{p.desc.slice(0, isMobile ? 120 : 90)}...</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.stack.map((s, j) => <span key={j} style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 6, padding: '1px 6px' }}>{s}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Lightbox project={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 5 — SECTORES (Hybrid: Icons + Featured)
   ═══════════════════════════════════════════════ */
const SECTORS = [
  { icon: Icons.store, n: 'Retail & Moda', c: T.signal, featured: true, desc: 'Dashboards de ventas, inventario y análisis de tendencias' },
  { icon: Icons.megaphone, n: 'Agencias de Marketing', c: T.data, featured: false, desc: 'Reportes de campañas y ROI en tiempo real' },
  { icon: Icons.ship, n: 'Comercio Internacional', c: T.neural, featured: true, desc: 'Análisis de importaciones, TRM y clasificación arancelaria' },
  { icon: Icons.cow, n: 'Agroindustria & Ganadería', c: T.signal, featured: true, desc: 'Costos por cabeza, rendimiento y proyecciones de mercado' },
  { icon: Icons.health, n: 'Salud & Clínicas', c: T.error, featured: true, desc: 'Gestión de citas, ocupación y métricas operativas' },
  { icon: Icons.creditCard, n: 'Fintech & Financiero', c: T.warn, featured: true, desc: 'Portafolios, bonos, análisis de riesgo y rentabilidad' },
  { icon: Icons.graduation, n: 'Educación', c: T.neural, featured: false, desc: 'Seguimiento de matrículas y rendimiento académico' },
  { icon: Icons.coffee, n: 'Bebidas & Restaurantes', c: T.signal, featured: false, desc: 'Ventas por producto, hora pico y análisis de costos' },
  { icon: Icons.building, n: 'Construcción', c: T.data, featured: false, desc: 'Avance de obra, presupuesto y cumplimiento' },
  { icon: Icons.bolt, n: 'Energía & Utilities', c: T.pulse, featured: false, desc: 'Consumo, facturación y eficiencia operativa' },
  { icon: Icons.cart, n: 'E-commerce', c: T.signal, featured: false, desc: 'Funnels, conversión y lifetime value de clientes' },
  { icon: Icons.briefcase, n: 'Consultoría', c: T.data, featured: false, desc: 'Productividad por proyecto y rentabilidad de clientes' },
];

function SlideSectors({ visible: v }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [expanded, setExpanded] = useState(null);
  const cols = isMobile ? 2 : isTablet ? 3 : 4;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', padding: isMobile ? '50px 16px 20px' : '20px 50px', overflowY: isMobile ? 'auto' : 'hidden' }}>
      <div style={st(v, 0)}><Label t="SECTORES.ATENDIDOS" /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,2.8vw,36px)', fontWeight: 600, color: T.white, textAlign: 'center', marginBottom: 6 }}>Somos funcionales en todos los sectores</h2>
      <p style={{ ...st(v, 140), fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 520, marginBottom: 24, lineHeight: 1.7 }}>
        Evaluamos tu negocio y construimos exactamente lo que necesitas. Sin importar la industria.
      </p>
      <div style={{ ...st(v, 200), display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10, width: '100%', maxWidth: 900 }}>
        {SECTORS.map((s, i) => {
          const isExp = expanded === i;
          return (
            <div key={i}
              onClick={() => setExpanded(isExp ? null : i)}
              style={{
                background: isExp ? `${s.c}08` : T.card,
                border: `1px solid ${isExp ? s.c + '33' : T.border}`,
                borderRadius: 12, padding: isMobile ? '12px' : '14px 16px',
                cursor: 'pointer', transition: 'all .3s',
                gridColumn: s.featured && !isMobile && isExp ? 'span 2' : 'span 1',
              }}
              onMouseEnter={e => { if (!isMobile) { e.currentTarget.style.borderColor = s.c + '33'; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
              onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.borderColor = isExp ? s.c + '33' : T.border; e.currentTarget.style.transform = 'none'; } }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.c}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon(s.c, 20)}
                </div>
                <span style={{ fontSize: isMobile ? 12 : 13, color: T.white, fontWeight: 500, lineHeight: 1.3 }}>{s.n}</span>
              </div>
              {isExp && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                  {s.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ ...st(v, 400), marginTop: 20, padding: '12px 22px', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.18)', borderRadius: 12, maxWidth: 550 }}>
        <p style={{ fontFamily: T.mono, fontSize: 12, color: 'rgba(108,92,231,0.9)', textAlign: 'center', lineHeight: 1.6 }}>
          Diagnóstico gratuito de 30 min · Evaluamos viabilidad antes de proponer · Sin compromiso
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 6 — EQUIPO (Bigger photos)
   ═══════════════════════════════════════════════ */
const TEAM = [
  {
    photo: '/brayan.jpg', name: 'Brayan Urrego', role: 'CEO & Data Intelligence Lead',
    bio: 'Administrador financiero, analista de datos y desarrollador frontend. Especialista en implementar IA en apps web y construir dashboards de alto impacto para cualquier industria.',
    skills: [{ l: 'Implementación de LLMs', c: T.neural }, { l: 'IA Avanzada', c: T.neural }, { l: 'Creación Web con APIs', c: T.data }, { l: 'Power BI & Analytics', c: T.signal }, { l: 'Prompt Engineering', c: T.neural }, { l: 'Análisis Financiero', c: T.signal }, { l: 'React / Next.js', c: T.data }, { l: 'Value Investing', c: T.signal }],
    certs: ['Claude AI · Platzi', 'Ser CEO · Platzi', 'Intro a IA · Platzi', 'Prompt Engineering · Platzi', 'Creación Web con V0 · Platzi'],
    projects: ['War Room Analdex', 'ESSA Bonos BDPI', 'Dashboard ESUMER', 'BRANEX Platform'],
  },
  {
    photo: '/alex.jpg', name: 'Alex Pérez Montoya', role: 'Strategy & Data Operations Lead',
    bio: 'Tecnólogo en Comercio Internacional y analista de datos. Experto en estrategia digital, marketing experiencial y webs orientadas a conversión y negocio.',
    skills: [{ l: 'Análisis de Datos Avanzado', c: T.signal }, { l: 'Power BI', c: T.signal }, { l: 'Investigación de Mercados', c: T.data }, { l: 'Diseño & Desarrollo Web', c: T.data }, { l: 'Marketing Digital', c: T.neural }, { l: 'Copywriting', c: T.neural }, { l: 'Marketing Experiencial', c: T.neural }, { l: 'Comercio Internacional', c: T.signal }],
    certs: ['Tecnólogo en Comercio Internacional · ESUMER', 'Espacio BIO: Construcción Sostenible · Alianza 4U'],
    projects: ['Atratus Ropa Outdoor', 'José Correa Ganadero', 'Estrategia digital ganadera'],
  },
];

function SlideTeam({ visible: v }) {
  const { isMobile } = useBreakpoint();
  const [exp, setExp] = useState(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', padding: isMobile ? '50px 16px 20px' : '16px 50px', overflowY: 'auto' }}>
      <div style={st(v, 0)}><Label t="NUESTRO.EQUIPO" /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,2.8vw,34px)', fontWeight: 600, color: T.white, textAlign: 'center', marginBottom: 6 }}>Las personas detrás de Branex</h2>
      <p style={{ ...st(v, 140), fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 500, marginBottom: 24, lineHeight: 1.6 }}>
        Un equipo que combina datos, tecnología y estrategia de negocio.
      </p>
      <div style={{ ...st(v, 200), display: 'flex', gap: isMobile ? 16 : 24, width: '100%', maxWidth: 900, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
        {TEAM.map((m, i) => (
          <div key={i} style={{
            flex: '1 1 380px', maxWidth: isMobile ? '100%' : 440,
            background: T.card, border: `1px solid ${exp === i ? T.signal + '44' : T.border}`,
            borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
            transition: 'all .35s',
            boxShadow: exp === i ? `0 20px 50px rgba(0,0,0,.4), 0 0 25px rgba(0,212,170,.12)` : '',
          }} onClick={() => setExp(exp === i ? null : i)}>
            {/* Photo area - BIGGER */}
            <div style={{
              display: 'flex', gap: 16, padding: '20px 20px 16px', alignItems: 'center',
              background: exp === i ? 'rgba(0,212,170,0.04)' : 'transparent', transition: 'background .3s',
            }}>
              <div style={{
                width: isMobile ? 80 : 90, height: isMobile ? 80 : 90,
                borderRadius: 16, overflow: 'hidden',
                border: `2px solid ${exp === i ? T.signal : T.border}`,
                flexShrink: 0, transition: 'border-color .3s',
              }}>
                <img src={m.photo} alt={`${m.name} — ${m.role}`} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: T.white, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.signal, letterSpacing: 1, marginBottom: 8 }}>{m.role}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{m.bio.slice(0, isMobile ? 80 : 100)}...</div>
              </div>
              <div style={{ color: T.faint, fontSize: 20, transform: exp === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s', flexShrink: 0 }}>▾</div>
            </div>
            {/* Expanded section */}
            {exp === i && (
              <div style={{ padding: '0 20px 18px', animation: 'float-up .3s ease' }}>
                <div style={{ height: 1, background: T.border, marginBottom: 14 }} />
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.signal, textTransform: 'uppercase', marginBottom: 8 }}>// Habilidades</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {m.skills.map((s, j) => <span key={j} style={{ fontFamily: T.mono, fontSize: 9.5, color: s.c, background: `${s.c}15`, border: `1px solid ${s.c}33`, borderRadius: 10, padding: '3px 9px' }}>{s.l}</span>)}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.neural, textTransform: 'uppercase', marginBottom: 8 }}>// Certificaciones</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                  {m.certs.map((c, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.neural, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: T.muted }}>{c}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.data, textTransform: 'uppercase', marginBottom: 8 }}>// Proyectos clave</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {m.projects.map((p, j) => <span key={j} style={{ fontFamily: T.mono, fontSize: 9.5, color: T.data, background: `${T.data}12`, border: `1px solid ${T.data}30`, borderRadius: 8, padding: '2px 8px' }}>{p}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ ...st(v, 400), marginTop: 16, fontFamily: T.mono, fontSize: 11, color: T.faint, display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icons.expand(T.faint, 14)} Haz clic en cada perfil para ver más
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 7 — PROCESO (Interactive Timeline)
   ═══════════════════════════════════════════════ */
const STEPS = [
  { n: '01', icon: () => Icons.search(T.signal, 28), title: 'Diagnóstico Gratuito', desc: '30 minutos para entender tu negocio, tus datos y tu problema real. Sin compromiso ni costo.', c: T.signal },
  { n: '02', icon: () => Icons.doc(T.data, 28), title: 'Propuesta a Medida', desc: 'En 48 horas: alcance claro, precio fijo y timeline. Sin sorpresas ni costos ocultos.', c: T.data },
  { n: '03', icon: () => Icons.zap(T.neural, 28), title: 'Construcción Ágil', desc: 'Tu solución lista en 1–2 semanas. Iteramos contigo para garantizar el resultado exacto.', c: T.neural },
  { n: '04', icon: () => Icons.rocket(T.pulse, 28), title: 'Activación & Soporte', desc: 'Lanzamos juntos. No pagas el último 30% hasta estar 100% conforme con el resultado.', c: T.pulse },
];

function SlideProcess({ visible: v }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [activeStep, setActiveStep] = useState(null);
  const [autoStep, setAutoStep] = useState(0);

  useEffect(() => {
    if (!v) { setAutoStep(0); return; }
    const id = setInterval(() => setAutoStep(s => (s + 1) % 4), 3000);
    return () => clearInterval(id);
  }, [v]);

  const currentStep = activeStep !== null ? activeStep : autoStep;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0 20px' : '20px 60px' }}>
      <div style={st(v, 0)}><Label t="CÓMO.TRABAJAMOS" /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(18px,2.8vw,36px)', fontWeight: 600, color: T.white, textAlign: 'center', marginBottom: 6 }}>De la idea a los resultados en 2 semanas</h2>
      <p style={{ ...st(v, 140), fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 500, marginBottom: 28, lineHeight: 1.7 }}>
        Un proceso limpio, transparente y sin fricciones.
      </p>

      {/* Timeline connector */}
      <div style={{ ...st(v, 200), width: '100%', maxWidth: 920, position: 'relative' }}>
        {/* Progress bar */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: 30, left: '5%', right: '5%', height: 2, background: T.border, zIndex: 0 }}>
            <div style={{ height: '100%', background: T.gradFull, width: `${(currentStep / 3) * 100}%`, transition: 'width .6s ease', borderRadius: 2 }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(4,1fr)`, gap: isMobile ? 12 : 14, position: 'relative', zIndex: 1 }}>
          {STEPS.map((s, i) => {
            const isActive = currentStep === i;
            return (
              <div key={i}
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
                style={{
                  background: isActive ? `${s.c}08` : T.card,
                  border: `1px solid ${isActive ? s.c + '44' : T.border}`,
                  borderRadius: 16, padding: isMobile ? '16px' : '20px 18px',
                  cursor: 'pointer', transition: 'all .35s',
                  transform: isActive ? 'translateY(-4px)' : 'none',
                  boxShadow: isActive ? `0 12px 30px rgba(0,0,0,.3), 0 0 20px ${s.c}15` : 'none',
                }}>
                {/* Step number circle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: isActive ? `${s.c}18` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isActive ? s.c : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .35s', flexShrink: 0,
                  }}>
                    {s.icon()}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: isActive ? s.c : T.faint, letterSpacing: 2, transition: 'color .3s' }}>{s.n}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.white, marginBottom: 8, lineHeight: 1.3 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.65 }}>{s.desc}</div>
                <div style={{ marginTop: 14, height: 2, background: isActive ? s.c : T.border, borderRadius: 2, transition: 'background .3s', width: isActive ? '100%' : '30%' }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...st(v, 420), marginTop: 22, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Precio fijo, sin sorpresas', 'Entrega en 1–2 semanas', 'Garantía total', 'Diagnóstico gratuito'].map((f, i) => (
          <span key={i} style={{ fontFamily: T.mono, fontSize: 11, color: T.signal, display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.check(T.signal, 13)} {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SLIDE 8 — CONTACTO
   ═══════════════════════════════════════════════ */
function SlideClosing({ visible: v }) {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0 20px' : '0 60px' }}>
      <div style={{ ...st(v, 0), marginBottom: 28 }}><BranexLogo size={isMobile ? 18 : 22} /></div>
      <h2 style={{ ...st(v, 80), fontSize: 'clamp(22px,3.8vw,48px)', fontWeight: 600, color: T.white, textAlign: 'center', lineHeight: 1.2, maxWidth: 700, marginBottom: 10 }}>
        ¿Qué necesita <span style={{ background: T.gradHero, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>tu empresa?</span>
      </h2>
      <p style={{ ...st(v, 160), fontSize: 'clamp(14px,1.5vw,17px)', color: T.muted, textAlign: 'center', maxWidth: 500, marginBottom: 10, lineHeight: 1.7 }}>
        Cuéntanos qué quieres construir. En 48 horas tenemos una propuesta a medida para tu negocio.
      </p>
      <div style={{ ...st(v, 220), margin: '14px 0 28px' }}><AccentLine /></div>
      <div style={{ ...st(v, 300), display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="https://wa.me/573008074984?text=Hola%20Branex,%20quiero%20conocer%20sus%20servicios" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.gradHero, color: '#060B18', fontWeight: 600, fontSize: 15, borderRadius: 10, padding: '14px 28px', textDecoration: 'none', letterSpacing: .5, transition: 'transform .2s,box-shadow .2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 35px rgba(0,212,170,.4)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
          {Icons.whatsapp(20)} Escríbenos por WhatsApp
        </a>
        <a href="https://branex.space" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', color: T.signal, border: `1px solid rgba(0,212,170,0.3)`, fontWeight: 500, fontSize: 15, borderRadius: 10, padding: '14px 28px', textDecoration: 'none', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'; }}>
          {Icons.globe(T.signal, 18)} branex.space
        </a>
      </div>
      <div style={{ ...st(v, 420), marginTop: 28, display: 'flex', gap: isMobile ? 14 : 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ label: '+57 300 807 4984', icon: () => Icons.whatsapp(14) }, { label: 'Medellín, Colombia', icon: () => Icons.globe(T.faint, 14) }, { label: 'Respuesta en 48h', icon: () => Icons.zap(T.faint, 14) }].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{c.icon()}<span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint }}>{c.label}</span></div>
        ))}
      </div>
      <p style={{ ...st(v, 500), marginTop: 22, fontFamily: T.mono, fontSize: 11, color: T.faint, textAlign: 'center', lineHeight: 1.6, maxWidth: 480 }}>
        "Mientras otros te entregan un PDF, nosotros te entregamos un sistema que piensa."
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════ */
const SLIDES_DEF = [
  { label: 'Inicio', Component: SlideHero },
  { label: 'El Problema', Component: SlideProblem },
  { label: 'Servicios', Component: SlideServices },
  { label: 'Portafolio', Component: SlidePortfolio },
  { label: 'Sectores', Component: SlideSectors },
  { label: 'Equipo', Component: SlideTeam },
  { label: 'Proceso', Component: SlideProcess },
  { label: 'Contacto', Component: SlideClosing },
];

export default function App() {
  const [cur, setCur] = useState(0);
  const [vis, setVis] = useState(true);
  const [dir, setDir] = useState(1);
  const [menu, setMenu] = useState(false);
  const { isMobile } = useBreakpoint();
  const total = SLIDES_DEF.length;

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= total || idx === cur) return;
    setDir(idx > cur ? 1 : -1);
    setVis(false);
    setTimeout(() => { setCur(idx); setVis(true); }, 340);
  }, [cur, total]);

  const next = useCallback(() => goTo(cur + 1), [goTo, cur]);
  const prev = useCallback(() => goTo(cur - 1), [goTo, cur]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    };
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [next, prev]);

  const tx = useRef(null);
  const tStart = (e) => { tx.current = e.touches[0].clientX; };
  const tEnd = (e) => {
    if (tx.current === null) return;
    const dx = e.changedTouches[0].clientX - tx.current;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    tx.current = null;
  };

  const { Component } = SLIDES_DEF[cur];
  const sStyle = {
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0) scale(1)' : `translateY(${dir * 18}px) scale(0.98)`,
    filter: vis ? 'blur(0px)' : 'blur(3px)',
    transition: 'opacity .5s ease, transform .5s cubic-bezier(.4,0,.2,1), filter .4s ease',
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: T.void, overflow: 'hidden', position: 'relative' }}
      onTouchStart={tStart} onTouchEnd={tEnd}>
      <NeuralCanvas paused={false} />

      {/* Global animations */}
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes float-chaos { 0%{transform:translate(0,0) rotate(var(--rot,0deg))} 100%{transform:translate(3px,-5px) rotate(calc(var(--rot,0deg) + 3deg))} }
      `}</style>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', background: T.gradFull, width: `${((cur + 1) / total) * 100}%`, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
      </div>

      {/* Slide label */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 100, fontFamily: T.mono, fontSize: 10, color: T.faint, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(6,11,24,0.7)', backdropFilter: 'blur(8px)', padding: '4px 14px', borderRadius: 20, border: `1px solid ${T.border}` }}>
        {SLIDES_DEF[cur].label}
      </div>

      {/* Counter */}
      <div style={{ position: 'fixed', bottom: 20, left: isMobile ? 16 : 26, zIndex: 100, fontFamily: T.mono, fontSize: 11, color: T.faint, letterSpacing: 2 }}>
        {String(cur + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Watermark */}
      <div style={{ position: 'fixed', bottom: 18, right: isMobile ? 16 : 26, zIndex: 100 }}>
        <BranexLogo size={9} />
      </div>

      {/* Dots nav */}
      {!isMobile && (
        <nav style={{ position: 'fixed', right: 18, top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Navegación de slides">
          {SLIDES_DEF.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} title={SLIDES_DEF[i].label} role="button" tabIndex={0} aria-label={`Ir a ${SLIDES_DEF[i].label}`}
              onKeyDown={e => e.key === 'Enter' && goTo(i)}
              style={{ width: i === cur ? 10 : 6, height: i === cur ? 10 : 6, borderRadius: '50%', background: i === cur ? T.signal : 'rgba(255,255,255,0.22)', cursor: 'pointer', transition: 'all .3s', boxShadow: i === cur ? `0 0 10px ${T.signal}` : 'none', margin: '0 auto' }} />
          ))}
        </nav>
      )}

      {/* Arrows */}
      {cur > 0 && !isMobile && (
        <button onClick={prev} aria-label="Slide anterior"
          style={{ position: 'fixed', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.faint, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.1)'; e.currentTarget.style.color = T.signal; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.faint; }}>
          ←
        </button>
      )}
      {cur < total - 1 && !isMobile && (
        <button onClick={next} aria-label="Siguiente slide"
          style={{ position: 'fixed', right: 44, top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.faint, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.1)'; e.currentTarget.style.color = T.signal; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.faint; }}>
          →
        </button>
      )}

      {/* Menu */}
      <button onClick={() => setMenu(m => !m)} aria-label="Menú de navegación"
        style={{ position: 'fixed', top: 8, right: isMobile ? 16 : 52, zIndex: 200, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.faint, width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.1)'; e.currentTarget.style.color = T.signal; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.faint; }}>
        ☰
      </button>
      {menu && <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setMenu(false)} />
        <div style={{ position: 'fixed', top: 44, right: isMobile ? 12 : 48, zIndex: 200, background: 'rgba(15,27,53,0.97)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '8px 0', minWidth: 190, backdropFilter: 'blur(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          {SLIDES_DEF.map((s, i) => (
            <div key={i} onClick={() => { goTo(i); setMenu(false); }}
              style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .2s', background: i === cur ? 'rgba(0,212,170,0.08)' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = i === cur ? 'rgba(0,212,170,0.08)' : 'transparent'}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 13, color: i === cur ? T.signal : T.white, fontWeight: i === cur ? 500 : 400 }}>{s.label}</span>
              {i === cur && <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.signal, marginLeft: 'auto' }} />}
            </div>
          ))}
        </div>
      </>}

      {/* Slide content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, ...sStyle }}>
        <Component visible={vis} />
      </div>

      {/* Floating WhatsApp */}
      <FloatingWA currentSlide={cur} />
    </div>
  );
}
