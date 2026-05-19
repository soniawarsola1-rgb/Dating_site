import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Heart, Mail, Sparkles, Star, Gift, MessageCircle, Calendar as CalIcon, Volume2, VolumeX } from "lucide-react";
import coffeeImg from "@/assets/coffee-date.jpg";
import movieImg from "@/assets/movie-date.jpg";
import handsImg from "@/assets/couple-hands.jpg";
import bondImg from "@/assets/couple-bond.jpg";
import bikeImg from "@/assets/couple-bike.jpg";
import cafeImg from "@/assets/couple-cafe.jpg";
import cartoon1 from "@/assets/couple-cartoon-1.png";
import cartoon2 from "@/assets/couple-cartoon-2.png";
import perfectSong from "@/assets/perfect.mp3";
import { sendInvite } from "@/lib/send-invite.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jessika, will you be mine? 💕" },
      { name: "description", content: "A little something for Jessika." },
    ],
  }),
  component: Index,
});

type Step = 0 | 1 | 2 | 3 | 4;
type DateKind = "movie" | "coffee";
type Vibe = "cozy" | "fun" | "sweet";

const TIMES = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "Anytime"];

const STEP_MESSAGES = [
  "See you love ❤️ — let's begin our little story...",
  "Yay! You said yes 😍 — now pick our perfect date 💕",
  "Aww 💖 such a lovely choice — when shall we meet?",
  "Perfect timing my love ❤️ — just one tiny detail left ✨",
  "It's a date! 😍💖 Counting moments till I see you 💕",
];

// Cute chime using Web Audio API
function playChime() {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AC();
    const notes = [659.25, 880, 1318.5]; // E5, A5, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.45);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {}
}

function playHeartbeat() {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AC();
    [0, 0.15].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 80;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.25);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {}
}

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [kind, setKind] = useState<DateKind | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [vibe, setVibe] = useState<Vibe>("cozy");
  const [note, setNote] = useState("");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const sendInviteFn = useServerFn(sendInvite);
  const [sending, setSending] = useState(false);

  // Start music on first user interaction
  const startMusic = () => {
    const a = audioRef.current;
    if (a && a.paused) {
      a.volume = 0.55;
      a.play().catch(() => {});
    }
  };

  // Mute/unmute the song with the toggle
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Show a sweet message whenever step advances
  useEffect(() => {
    setToast(STEP_MESSAGES[step]);
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [step]);

  const sfx = (fn: () => void) => { if (!mutedRef.current) fn(); };

  const next = () => setStep((s) => Math.min(4, s + 1) as Step);
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const burst = () =>
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#ec4899", "#fb7185", "#fda4af", "#fff1f2"],
    });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[oklch(0.97_0.03_25)] via-[oklch(0.95_0.04_20)] to-[oklch(0.93_0.05_15)] px-4 py-6">
      <FloatingHearts />
      <audio ref={audioRef} src={perfectSong} loop preload="auto" />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full border border-rose-200 bg-card/95 px-5 py-2 text-center text-xs font-medium text-primary shadow-lg shadow-rose-300/40 backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="fixed right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-card/90 text-primary shadow-md backdrop-blur"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="relative z-10 mx-auto max-w-md">
        <Stepper step={step} />

        <div className="mt-6 overflow-hidden rounded-[2.5rem] border border-rose-200/60 bg-card shadow-2xl shadow-rose-300/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="min-h-[640px]"
            >
              {step === 0 && <Permission onYes={() => { startMusic(); sfx(playHeartbeat); burst(); next(); }} />}
              {step === 1 && (
                <Proposal
                  kind={kind}
                  setKind={(k) => { setKind(k); sfx(playChime); burst(); }}
                  onBack={back}
                  onNext={next}
                />
              )}
              {step === 2 && (
                <ChooseDate
                  kind={kind}
                  day={day}
                  setDay={(d) => { setDay(d); sfx(playChime); }}
                  time={time}
                  setTime={(t) => { setTime(t); sfx(playChime); }}
                  onBack={back}
                  onNext={next}
                />
              )}
              {step === 3 && (
                <Details
                  vibe={vibe}
                  setVibe={(v) => { setVibe(v); sfx(playChime); }}
                  note={note}
                  setNote={setNote}
                  onBack={back}
                  sending={sending}
                  onSend={async () => {
                    sfx(playHeartbeat); burst();
                    setSending(true);
                    try {
                      const r = await sendInviteFn({ data: { kind, day, time, vibe, note } });
                      setToast(r?.ok ? "Invite sent to both of you 💌" : "Invite saved (email failed) 💔");
                    } catch {
                      setToast("Invite saved (email failed) 💔");
                    } finally {
                      setSending(false);
                      next();
                    }
                  }}
                />
              )}
              {step === 4 && (
                <ItsADate kind={kind} day={day} time={time} onRestart={() => { setStep(0); setKind(null); setDay(null); setTime(null); setNote(""); }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <ShayariStrip />
        <MemoryGallery />
        <FeatureStrip />
        <Footer />
      </div>
    </main>
  );
}

/* ---------- Stepper ---------- */
function Stepper({ step }: { step: Step }) {
  const labels = ["Permission", "Proposal", "Choose Date", "Details", "It's a Date"];
  return (
    <div className="flex items-center justify-between gap-1 px-1">
      {labels.map((l, i) => (
        <div key={l} className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center">
            {i > 0 && <div className={`h-[2px] flex-1 ${i <= step ? "bg-primary" : "bg-rose-200"}`} />}
            <div
              className={`mx-1 h-2.5 w-2.5 rounded-full transition-all ${
                i === step ? "scale-150 bg-primary shadow-md shadow-primary/50" : i < step ? "bg-primary" : "bg-rose-200"
              }`}
            />
            {i < labels.length - 1 && <div className={`h-[2px] flex-1 ${i < step ? "bg-primary" : "bg-rose-200"}`} />}
          </div>
          <span className={`mt-2 text-[10px] font-medium tracking-wide ${i === step ? "text-primary" : "text-muted-foreground"}`}>
            {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Step 1: Permission ---------- */
function Permission({ onYes }: { onYes: () => void }) {
  return (
    <div className="flex h-full flex-col items-center px-8 py-12 text-center">
      <p className="font-serif text-3xl italic text-foreground">First, a tiny</p>
      <p className="font-serif text-3xl italic text-foreground">permission...</p>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="my-8"
      >
        <div className="relative">
          <div className="grid h-44 w-52 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-200 to-rose-300 shadow-xl">
            <img src={cartoon1} alt="Us together" className="h-full w-full object-cover object-top" />
          </div>
          <Heart className="absolute -right-3 -top-3 h-8 w-8 fill-primary text-primary animate-pulse" />
          <Heart className="absolute -bottom-2 -left-3 h-6 w-6 fill-rose-300 text-rose-300" />
        </div>
      </motion.div>

      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        Jessika, before I ask you something special, may I have permission to make your day a little happier? 🥺
      </p>

      <blockquote className="mt-5 max-w-xs border-l-2 border-primary/60 pl-3 text-left font-serif text-xs italic text-foreground/80">
        "Teri ek haan meri saari duniya badal degi…<br />
        bas itni si guzarish hai, sun lena zara."
      </blockquote>

      <div className="mt-6 w-full space-y-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onYes}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/40"
        >
          <Heart className="h-5 w-5 fill-current" /> Yes, give permission
        </motion.button>
        <button onClick={onYes} className="w-full rounded-full border border-rose-200 bg-card py-4 text-sm text-muted-foreground">
          Maybe later
        </button>
        <p className="pt-1 text-xs text-muted-foreground">I'll wait if you need time 😊</p>
      </div>
    </div>
  );
}

/* ---------- Step 2: Proposal ---------- */
function Proposal({
  kind, setKind, onBack, onNext,
}: { kind: DateKind | null; setKind: (k: DateKind) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="relative h-full bg-gradient-to-b from-[oklch(0.18_0.05_15)] via-[oklch(0.22_0.08_15)] to-[oklch(0.15_0.04_15)] px-6 py-8 text-center">
      <button onClick={onBack} className="absolute left-4 top-4 rounded-full p-2 text-rose-100/80">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <p className="mt-4 font-serif text-lg italic text-rose-100/80">I've been thinking...</p>

      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-4 font-serif text-5xl italic leading-tight text-rose-300"
        style={{ textShadow: "0 0 30px rgba(244, 114, 182, 0.6), 0 0 60px rgba(244, 114, 182, 0.4)" }}
      >
        How about<br />you & me?
      </motion.h1>

      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="my-6 flex justify-center">
        <Heart className="h-16 w-16 fill-rose-400 text-rose-400 drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]" />
      </motion.div>

      <p className="text-sm text-rose-100/70">I'd love to take you on a</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DateOption
          img={movieImg}
          emoji="🍿"
          title="Movie Date"
          desc="Popcorn, laughs and good vibes"
          active={kind === "movie"}
          onClick={() => setKind("movie")}
        />
        <DateOption
          img={coffeeImg}
          emoji="☕"
          title="Coffee Date"
          desc="Great coffee and deep talks"
          active={kind === "coffee"}
          onClick={() => setKind("coffee")}
        />
      </div>

      <p className="mt-5 text-xs italic text-rose-100/70">
        "Tum chuno jagah, main bana doonga lamhe yaadgaar…" 💫
      </p>

      {kind && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  );
}

function DateOption({
  img, emoji, title, desc, active, onClick,
}: { img: string; emoji: string; title: string; desc: string; active: boolean; onClick: () => void }) {
  const [flipKey, setFlipKey] = useState(0);
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -3 }}
      onClick={() => { setFlipKey((k) => k + 1); onClick(); }}
      style={{ perspective: 800 }}
      className={`overflow-visible rounded-2xl text-left transition-all ${
        active ? "drop-shadow-[0_10px_30px_rgba(236,72,153,0.45)]" : ""
      }`}
    >
      <motion.div
        key={flipKey}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className={`overflow-hidden rounded-2xl border bg-card ${
          active ? "border-primary ring-2 ring-primary" : "border-rose-200/30"
        }`}
      >
        <div className="relative h-24 w-full overflow-hidden">
          <img src={img} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-1 right-2 text-2xl drop-shadow">{emoji}</span>
        </div>
        <div className="p-3">
          <h4 className="font-serif text-base text-foreground">{title}</h4>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{desc}</p>
        </div>
      </motion.div>
    </motion.button>
  );
}

/* ---------- Step 3: Choose Date ---------- */
function ChooseDate({
  kind, day, setDay, time, setTime, onBack, onNext,
}: {
  kind: DateKind | null;
  day: number | null; setDay: (d: number) => void;
  time: string | null; setTime: (t: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const hero = kind === "movie" ? movieImg : kind === "coffee" ? coffeeImg : cafeImg;

  return (
    <div className="relative h-full px-6 py-8">
      <button onClick={onBack} className="absolute left-4 top-4 rounded-full p-2 text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h2 className="mt-6 text-center font-serif text-3xl italic text-foreground">
        When works best<br />for you? <Heart className="inline h-5 w-5 fill-primary text-primary" />
      </h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-auto mt-5 h-32 w-full overflow-hidden rounded-2xl shadow-lg"
      >
        <img src={hero} alt="Date preview" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="absolute bottom-2 left-3 font-serif text-sm italic text-white drop-shadow">
          {kind === "movie" ? "Tere saath har film blockbuster lagti hai 🎬" : "Coffee thandi ho jaaye, baatein khatam na ho ☕"}
        </p>
      </motion.div>

      <div className="mt-5 rounded-2xl bg-rose-50/60 p-4">
        <p className="text-center text-sm font-medium text-foreground">May 2026</p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
          {weekdays.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`aspect-square rounded-full text-xs transition-all ${
                day === d
                  ? "bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/40 scale-110"
                  : "text-foreground hover:bg-rose-100"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-medium text-foreground">Pick a time</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {TIMES.map((t) => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className={`rounded-full border px-4 py-2 text-xs transition-all ${
              time === t
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/40"
                : "border-rose-200 bg-card text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        disabled={!day || !time}
        onClick={onNext}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/40 disabled:opacity-40"
      >
        Next <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-3 text-center text-[11px] italic text-muted-foreground">
        "Waqt to bahana hai, asli baat to tum ho." 💖
      </p>
    </div>
  );
}

/* ---------- Step 4: Details ---------- */
function Details({
  vibe, setVibe, note, setNote, onBack, onSend, sending,
}: {
  vibe: Vibe; setVibe: (v: Vibe) => void;
  note: string; setNote: (n: string) => void;
  onBack: () => void; onSend: () => void; sending?: boolean;
}) {
  const vibes: { id: Vibe; title: string; desc: string; icon: string }[] = [
    { id: "cozy", title: "Cozy & Chill", desc: "Relaxed and easy", icon: "💗" },
    { id: "fun", title: "Fun & Adventurous", desc: "Something exciting", icon: "✨" },
    { id: "sweet", title: "Sweet & Simple", desc: "Keep it classic", icon: "🌸" },
  ];
  return (
    <div className="relative h-full px-6 py-8">
      <button onClick={onBack} className="absolute left-4 top-4 rounded-full p-2 text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h2 className="mt-6 text-center font-serif text-3xl italic text-foreground">
        Let's make it<br />perfect <Sparkles className="inline h-5 w-5 text-primary" />
      </h2>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <img src={bikeImg} alt="Adventure together" className="h-32 w-full object-cover" />
      </div>

      <p className="mt-5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        You choose the vibe
      </p>

      <div className="mt-3 space-y-2">
        {vibes.map((v) => (
          <motion.button
            key={v.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVibe(v.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
              vibe === v.id ? "border-primary bg-rose-50 shadow-md" : "border-rose-200 bg-card"
            }`}
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-lg">{v.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{v.title}</p>
              <p className="text-[11px] text-muted-foreground">{v.desc}</p>
            </div>
            {vibe === v.id && <Heart className="h-4 w-4 fill-primary text-primary animate-pulse" />}
          </motion.button>
        ))}
      </div>

      <p className="mt-6 text-center text-xs font-medium text-muted-foreground">
        A little note <span className="opacity-60">(optional)</span>
      </p>
      <div className="relative mt-2">
        <textarea
          maxLength={120}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything you'd love me to know to make it special? 💕"
          className="h-20 w-full resize-none rounded-2xl border border-rose-200 bg-rose-50/40 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
          {note.length}/120
        </span>
      </div>

      <p className="mt-3 text-center text-xs italic text-muted-foreground">
        "Tum saath ho to har lamha eid sa lagta hai." ✨
      </p>

      <motion.button
        whileTap={{ scale: 0.96 }}
        disabled={sending}
        onClick={onSend}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/40 disabled:opacity-60"
      >
        <Mail className="h-5 w-5" /> {sending ? "Sending..." : "Send Invite"}
      </motion.button>
    </div>
  );
}

/* ---------- Step 5: It's a Date ---------- */
function ItsADate({
  kind, day, time, onRestart,
}: { kind: DateKind | null; day: number | null; time: string | null; onRestart: () => void }) {
  const [showMailPopup, setShowMailPopup] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors: ["#ec4899", "#fb7185", "#fda4af"] });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const polaroidImg = cartoon1;

  const timeTo24 = (t: string | null): [number, number] => {
    if (!t || t === "Anytime") return [13, 0];
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return [13, 0];
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (/PM/i.test(m[3]) && h !== 12) h += 12;
    if (/AM/i.test(m[3]) && h === 12) h = 0;
    return [h, min];
  };

  const downloadICS = () => {
    const d = day ?? 18;
    const [h, mi] = timeTo24(time);
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `2026${pad(5)}${pad(d)}T${pad(h)}${pad(mi)}00`;
    const endH = (h + 2) % 24;
    const end = `2026${pad(5)}${pad(d)}T${pad(endH)}${pad(mi)}00`;
    const title = kind === "movie" ? "Movie Date with you 🎬" : "Coffee Date with you ☕";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jessika Date//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@jessica-date`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      "DESCRIPTION:Counting down the moments till I see you 💖",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "our-date.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateLabel = `May ${day ?? 18}, 2026 at ${time ?? "1:00 PM"}`;

  return (
    <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#1a0d14] via-[#2a1320] to-[#1a0d14] px-5 py-10 text-center text-rose-50">
      <AnimatePresence>
        {showMailPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => setShowMailPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs rounded-3xl bg-gradient-to-br from-rose-100 to-pink-200 p-6 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg"
              >
                <Mail className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="font-serif text-2xl italic text-rose-700">Check your mail 💌</h3>
              <p className="mt-2 text-sm text-rose-900/80">
                Jessika, ek pyaara sa {kind === "movie" ? "movie 🎬" : "coffee ☕"} invite tumhare inbox me wait kar raha hai ✨
              </p>
              <button
                onClick={() => setShowMailPopup(false)}
                className="mt-5 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-md"
              >
                Okay! 💕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* glowing string lights backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-32 h-24 opacity-60">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2 + (i % 4) * 0.3, repeat: Infinity, delay: (i % 5) * 0.2 }}
            style={{ left: `${(i / 18) * 100}%`, top: `${Math.sin(i) * 18 + 30}px` }}
            className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_4px_rgba(252,211,77,0.6)]"
          />
        ))}
      </div>
      <Confetti />

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative font-serif text-5xl italic"
        style={{
          color: "#ffd1dc",
          textShadow: "0 0 10px #ff6fa5, 0 0 20px #ff3d83, 0 0 40px #ff1f6f, 0 0 70px #ff1f6f",
        }}
      >
        It's a Date!
      </motion.h2>
      <div className="mx-auto mt-2 flex items-center justify-center gap-2 text-rose-300/80">
        <span className="h-px w-12 bg-rose-300/60" />
        <Heart className="h-3 w-3 fill-rose-300 text-rose-300" />
        <span className="h-px w-12 bg-rose-300/60" />
      </div>

      <p className="mx-auto mt-5 max-w-xs text-sm text-rose-100/90">
        I can't wait to make <br /> beautiful memories with you 💗
      </p>

      {/* Big neon heart */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
        className="relative mx-auto my-8 h-36 w-36"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="absolute inset-0 grid place-items-center"
        >
          <Heart
            className="h-32 w-32 text-rose-300"
            style={{
              filter:
                "drop-shadow(0 0 8px #ff6fa5) drop-shadow(0 0 18px #ff3d83) drop-shadow(0 0 32px #ff1f6f)",
              fill: "transparent",
              strokeWidth: 1.5,
            }}
          />
        </motion.div>
        {/* sparkle rays */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-px w-5 bg-rose-300/70"
            style={{ transform: `translate(-50%,-50%) rotate(${deg}deg) translateX(72px)` }}
          />
        ))}
      </motion.div>

      <h3
        className="font-serif text-3xl italic"
        style={{ color: "#ffe4ef", textShadow: "0 0 10px rgba(255,111,165,0.6)" }}
      >
        Bye, see u babe <span className="inline-block">💕</span>
      </h3>
      <p className="mt-2 text-xs text-rose-100/70">Counting down the moments! ✨</p>

      {/* Polaroid of us */}
      <motion.div
        initial={{ rotate: 6, y: 30, opacity: 0 }}
        animate={{ rotate: 4, y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="mx-auto mt-6 w-44 rounded-sm bg-white p-2 pb-6 shadow-2xl shadow-rose-900/60"
      >
        <img src={polaroidImg} alt="us" className="h-36 w-full rounded-sm object-cover" />
        <p className="mt-1 text-center font-serif text-[10px] italic text-neutral-700">us, soon ♡</p>
      </motion.div>

      {/* Date reminder card */}
      <div className="mx-auto mt-7 flex max-w-sm items-center gap-3 rounded-2xl border border-rose-400/30 bg-white/5 p-3 text-left backdrop-blur">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-2xl shadow-inner">
          📅
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold text-rose-100">
            Date Reminder <Heart className="h-3 w-3 fill-rose-300 text-rose-300" />
          </p>
          <p className="text-xs text-rose-100/70">{dateLabel}</p>
          <p className="mt-0.5 text-[10px] text-rose-100/50">
            {kind === "movie" ? "Movie Date 🎬" : "Coffee Date ☕"}
          </p>
        </div>
        <button
          onClick={downloadICS}
          className="rounded-full border border-rose-300/70 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-300/10"
        >
          Add to Calendar
        </button>
      </div>

      <blockquote className="mx-auto mt-5 max-w-xs font-serif text-xs italic text-rose-200/80">
        "Tum mile to lagta hai, dua qubool ho gayi…" 💞
      </blockquote>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onRestart}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 py-4 text-base font-medium text-white shadow-lg shadow-rose-700/50"
      >
        <Heart className="h-5 w-5" /> See you soon!
      </motion.button>
      <p className="mt-3 text-xs text-rose-100/70">I'll text you before we go 😉</p>
    </div>
  );
}

/* ---------- Shayari Strip ---------- */
function ShayariStrip() {
  const shayaris = [
    { text: "Teri hansi meri subah hai,\nteri baatein meri shaam.", img: cafeImg },
    { text: "Haath thaame chal padein hum,\nmanzil khud rasta ban jaaye.", img: handsImg },
    { text: "Sardi ki raat ho ya barish ki boondein,\ntu saath ho to mausam haseen.", img: bikeImg },
  ];
  return (
    <div className="mt-8 space-y-4">
      <p className="text-center font-serif text-lg italic text-foreground">A few lines, just for you ♡</p>
      {shayaris.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-rose-200/60 shadow-md"
        >
          <img src={s.img} alt="" className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <p className="absolute bottom-3 left-4 right-4 whitespace-pre-line font-serif text-sm italic leading-relaxed text-white drop-shadow-lg">
            {s.text}
          </p>
          <Heart className="absolute right-3 top-3 h-5 w-5 fill-primary text-primary drop-shadow" />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- Memory Gallery ---------- */
function MemoryGallery() {
  return (
    <div className="mt-8 rounded-3xl border border-rose-200/60 bg-card/80 p-5 backdrop-blur">
      <p className="text-center font-serif text-lg italic text-foreground">Us, in a few frames</p>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        "I hope this special bond between us will never end." 💞
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.03 }} className="relative col-span-2 overflow-hidden rounded-2xl shadow-lg">
          <img src={cartoon2} alt="Us in the park" className="h-64 w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-3 left-4 font-serif text-sm italic text-white">Bas yunhi saath chalte rehna… 💞</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="relative overflow-hidden rounded-2xl shadow-md">
          <img src={cartoon1} alt="Us smiling" className="h-40 w-full object-cover object-top" />
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} className="relative overflow-hidden rounded-2xl shadow-md">
          <img src={handsImg} alt="Hands together" className="h-40 w-full object-cover" />
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Extras ---------- */
function FeatureStrip() {
  const items = [
    { icon: <Heart className="h-5 w-5" />, label: "Thoughtful step-by-step journey", quote: "Pyaar jaldi me nahi, ehsaas me hota hai." },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Cute & romantic vibes", quote: "Tumhari baatein meri favourite playlist hain." },
    { icon: <CalIcon className="h-5 w-5" />, label: "Let her choose comfortably", quote: "Tumhari marzi, meri khushi." },
    { icon: <Star className="h-5 w-5" />, label: "Personal & memorable", quote: "Har lamha tumhare naam." },
    { icon: <Gift className="h-5 w-5" />, label: "Excitement till the last step", quote: "Surprises abhi baaki hain." },
  ];
  return (
    <div className="mt-8 rounded-3xl border border-rose-200/60 bg-card/70 p-5 backdrop-blur">
      <p className="text-center font-serif text-lg italic text-foreground">What makes this special?</p>
      <div className="mt-4 space-y-3">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 rounded-2xl bg-rose-50/60 p-3"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-primary">{it.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{it.label}</p>
              <p className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">"{it.quote}"</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-8 mb-4 text-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="inline-block"
      >
        <Heart className="h-6 w-6 fill-primary text-primary" />
      </motion.div>
      <p className="mt-2 font-serif text-sm italic text-foreground">Made with love, for Jessika</p>
      <p className="text-[10px] text-muted-foreground">हर धड़कन में तुम हो ♡</p>
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((_, i) => {
        const left = (i * 11) % 100;
        const delay = (i * 0.2) % 3;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: 600, opacity: 0, rotate: 360 }}
            transition={{ duration: 4, delay, repeat: Infinity }}
            style={{ left: `${left}%` }}
            className="absolute h-2 w-2 rounded-sm bg-primary/70"
          />
        );
      })}
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 10 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((_, i) => {
        const left = (i * 11.7) % 100;
        const delay = (i * 0.9) % 7;
        const dur = 9 + (i % 4);
        const size = 12 + (i % 3) * 5;
        return (
          <motion.div
            key={i}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.5, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
            style={{ left: `${left}%`, fontSize: size }}
            className="absolute text-primary/40"
          >
            ♥
          </motion.div>
        );
      })}
    </div>
  );
}
