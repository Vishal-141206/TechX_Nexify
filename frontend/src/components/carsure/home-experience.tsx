"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Car,
    ChevronDown,
    Eye,
    History,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    TrendingUp,
    UploadCloud,
    WandSparkles,
    type LucideIcon,
} from "lucide-react";

/* ─────────────────────── Story Frames ─────────────────────── */

type StoryFrame = {
    title: string;
    subtitle: string;
    detail: string;
    badge: string;
    Icon: LucideIcon;
    step: string;
};

const storyFrames: StoryFrame[] = [
    {
        title: "Know Your Car Before You Buy",
        subtitle: "Cinematic AI intelligence for smarter used-car decisions.",
        detail: "CarSure uses advanced machine learning to analyze every aspect of a used car — from mechanical health to ownership history.",
        badge: "Intro",
        Icon: Car,
        step: "01",
    },
    {
        title: "AI-powered Risk Analysis",
        subtitle: "Engine, drivetrain, and hidden reliability risks surfaced in seconds.",
        detail: "Our risk scoring engine evaluates 40+ parameters across mechanical, electrical, and structural systems.",
        badge: "Risk Assessment",
        Icon: ShieldAlert,
        step: "02",
    },
    {
        title: "Detect Hidden Fraud Instantly",
        subtitle: "Spot mileage tampering and ownership inconsistencies with confidence.",
        detail: "Cross-referencing service records, odometer readings, and registration history to detect anomalies.",
        badge: "Fraud Detection",
        Icon: AlertTriangle,
        step: "03",
    },
    {
        title: "Visual Damage Detection using AI",
        subtitle: "Computer vision maps dents, scratches, and severity hotspots.",
        detail: "Upload photos from any angle — our vision model identifies body damage with pixel-level accuracy.",
        badge: "Condition Analysis",
        Icon: Eye,
        step: "04",
    },
    {
        title: "Predict Future Maintenance Cost",
        subtitle: "Get projected service ranges and category-level breakdowns.",
        detail: "Based on the vehicle's age, mileage, and condition data, CarSure projects upcoming maintenance costs.",
        badge: "Cost Prediction",
        Icon: TrendingUp,
        step: "05",
    },
    {
        title: "Analyze Your Car Now",
        subtitle: "Upload photos, run deep analysis, and compare with market signals.",
        detail: "Ready to make a smarter decision? Start your AI-powered analysis in under 60 seconds.",
        badge: "Final Frame",
        Icon: WandSparkles,
        step: "06",
    },
];

/* ─────────────────────── Risk Ring ─────────────────────── */

function RiskRing({ value }: { value: number }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (value / 100) * circumference;
    const status = value < 40 ? "Safe" : value < 70 ? "Risky" : "Avoid";
    const color = value < 40 ? "#38b000" : value < 70 ? "#f5b700" : "#ff4d4d";

    return (
        <div className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-black">Risk Score</h3>
            <div className="mt-3 flex items-center gap-5">
                <svg width="124" height="124" viewBox="0 0 124 124" className="-rotate-90">
                    <circle cx="62" cy="62" r={radius} stroke="rgba(0,0,0,0.1)" strokeWidth="12" fill="none" />
                    <circle cx="62" cy="62" r={radius} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                </svg>
                <div>
                    <div className="text-4xl font-bold text-black">{value}</div>
                    <div className="text-sm text-gray-500">{status}</div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────── Dashboard Section ─────────────────────── */

/* ─────────────────────── Combined App Section ─────────────────────── */

function AnalysisField({ label, placeholder }: { label: string; placeholder: string }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-gray-500">{label}</span>
            <input placeholder={placeholder} className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none ring-black/10 transition placeholder:text-gray-400 focus:ring" />
        </label>
    );
}

function AppSection() {
    const [activeTab, setActiveTab] = useState<"analyze" | "dashboard">("analyze");
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

    useEffect(() => {
        return () => { previews.forEach((src) => URL.revokeObjectURL(src)); };
    }, [previews]);

    const onRunAnalysis = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2600);
    };

    const hotspots = useMemo(
        () => [
            { id: "Front Bumper", x: "22%", y: "48%", severity: "Medium" },
            { id: "Rear Door", x: "62%", y: "38%", severity: "High" },
            { id: "Wheel Arch", x: "72%", y: "67%", severity: "Low" },
        ],
        [],
    );

    return (
        <section id="app-section" className="mx-auto mt-20 max-w-7xl px-5 pb-20">
            <div className="grid gap-4 rounded-3xl border border-black/10 bg-gray-50/80 p-4 backdrop-blur md:grid-cols-[240px_1fr]">
                <aside className="glass rounded-2xl p-4 self-start sticky top-4">
                    <h2 className="section-title mb-4 text-xl font-semibold text-black">CarSure AI</h2>
                    <nav className="space-y-2 text-sm text-gray-700">
                        <button onClick={() => setActiveTab("analyze")} className={`w-full flex items-center justify-start gap-2 rounded-lg px-3 py-2 transition-colors ${activeTab === "analyze" ? "bg-black/5 font-medium text-black" : "hover:bg-black/5"}`}>
                            <WandSparkles size={16} /> Analyze Car
                        </button>
                        <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center justify-start gap-2 rounded-lg px-3 py-2 transition-colors ${activeTab === "dashboard" ? "bg-black/5 font-medium text-black" : "hover:bg-black/5"}`}>
                            <LayoutDashboard size={16} /> Dashboard
                        </button>
                        {/* <Link href="/compare" scroll={false} className="flex items-center justify-start gap-2 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors">
                            <Car size={16} /> Compare Cars
                        </Link> */}
                        <a className="flex items-center justify-start gap-2 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" href="#history">
                            <History size={16} /> History
                        </a>
                        <a className="flex items-center justify-start gap-2 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" href="#settings">
                            <Settings size={16} /> Settings
                        </a>
                    </nav>
                </aside>

                <main className="space-y-4">
                    {activeTab === "analyze" ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            <div className="glass rounded-2xl p-5">
                                <h3 className="section-title text-2xl font-semibold text-black">Analyze Car</h3>
                                <p className="mt-1 text-sm text-gray-500">Upload details and images to run the CarSure AI pipeline.</p>

                                <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <AnalysisField label="Model" placeholder="e.g. Hyundai Creta SX" />
                                        <AnalysisField label="Year" placeholder="e.g. 2019" />
                                        <AnalysisField label="Kilometers Driven" placeholder="e.g. 68200" />
                                        <AnalysisField label="Fuel Type" placeholder="Diesel / Petrol / EV" />
                                    </div>

                                    <label className="block cursor-pointer rounded-2xl border border-dashed border-black/20 bg-black/[0.02] p-6 text-center hover:bg-black/[0.04]">
                                        <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
                                        <UploadCloud className="mx-auto mb-3 text-gray-500" />
                                        <p className="font-semibold text-black">Drag and drop images or click to upload</p>
                                        <p className="text-sm text-gray-400">Front, rear, sides, dashboard, tires, and engine bay</p>
                                    </label>

                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                                            {previews.map((src, i) => (
                                                <Image key={src} src={src} alt={`Preview ${i + 1}`} width={240} height={140} className="h-24 w-full rounded-lg object-cover" unoptimized />
                                            ))}
                                        </div>
                                    )}

                                    <button type="button" onClick={onRunAnalysis} className="ml-auto mr-0 block rounded-xl bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800">
                                        Run AI Analysis
                                    </button>
                                </form>
                            </div>

                            <div className="glass relative overflow-hidden rounded-2xl p-5">
                                <h3 className="section-title text-xl font-semibold text-black">Live Analysis Status</h3>
                                <p className="mt-1 text-sm text-gray-500">Realtime diagnostic stream from CarSure AI</p>
                                <div className="relative mt-4 h-48 rounded-2xl border border-black/10 bg-gray-50">
                                    {isLoading && <div className="scan-line absolute inset-0" />}
                                    <div className="absolute inset-0 grid place-items-center text-center">
                                        <motion.div
                                            animate={isLoading ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                            transition={{ repeat: isLoading ? Infinity : 0, duration: 1.3 }}
                                        >
                                            <p className="text-xl font-semibold text-black">{isLoading ? "Analyzing vehicle..." : "Ready for analysis"}</p>
                                            <p className="mt-2 text-sm text-gray-400">{isLoading ? "Scanning body panel geometry and odometer patterns" : "Upload data and click Run AI Analysis to start"}</p>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            <div className="glass flex flex-col gap-3 rounded-2xl p-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Current Vehicle</p>
                                    <h3 className="section-title mt-1 text-2xl font-semibold text-black">2019 Hyundai Creta SX(O)</h3>
                                    <p className="text-sm text-gray-500">Diesel • 68,200 km • 2nd Owner • DL Registration</p>
                                </div>
                                <button className="rounded-xl bg-black px-5 py-3 font-semibold text-white">
                                    Export Report
                                </button>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-2">
                                <RiskRing value={63} />
                                <div className="glass rounded-2xl p-5">
                                    <h3 className="text-lg font-semibold text-black">Fraud Detection</h3>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="rounded-xl border border-red-300/50 bg-red-50 p-3">
                                            <p className="flex items-center gap-2 font-semibold text-red-700">
                                                <ShieldAlert size={16} /> Mileage inconsistency detected
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-3">
                                            <p className="flex items-center gap-2 font-semibold text-amber-700">
                                                <AlertTriangle size={16} /> Suspicious ownership history
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-2xl p-5">
                                    <h3 className="text-lg font-semibold text-black">Condition Analysis</h3>
                                    <div className="relative mt-3 h-56 rounded-xl border border-black/10 bg-gray-100">
                                        <div className="absolute inset-0 bg-mesh-gradient opacity-70" />
                                        {hotspots.map((spot) => (
                                            <button
                                                key={spot.id}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/20 bg-black/5 px-2 py-1 text-xs text-black"
                                                style={{ left: spot.x, top: spot.y }}
                                            >
                                                {spot.id} ({spot.severity})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass rounded-2xl p-5">
                                    <h3 className="text-lg font-semibold text-black">Cost Prediction</h3>
                                    <p className="mt-2 text-sm text-gray-500">Estimated maintenance range: INR 20,000 - INR 60,000</p>
                                    <div className="mt-4 h-3 rounded-full bg-black/5">
                                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-gray-800 to-black" />
                                    </div>
                                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                        <li className="flex justify-between">
                                            <span>Engine</span>
                                            <span>INR 18,000</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Tires &amp; Brakes</span>
                                            <span>INR 14,000</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Routine Service</span>
                                            <span>INR 9,500</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div id="history" className="glass rounded-2xl p-5">
                                <h3 className="text-lg font-semibold text-black">Analysis Timeline</h3>
                                <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                                    <div className="rounded-xl border border-black/10 p-3">Mar 28 • Seller photos uploaded • 8 images</div>
                                    <div className="rounded-xl border border-black/10 p-3">Apr 03 • Risk score shifted 57 to 63</div>
                                    <div className="rounded-xl border border-black/10 p-3">Apr 11 • Odometer anomaly confidence +12%</div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}

/* ─────────────────────── Scroll Progress Bar ─────────────────────── */

function ScrollProgressBar({ step }: { step: number }) {
    return (
        <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
                <motion.div
                    key={i}
                    className="rounded-full"
                    animate={{
                        width: step === i ? 10 : 6,
                        height: step === i ? 10 : 6,
                        backgroundColor: i <= step ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.15)",
                        boxShadow: step === i ? "0 0 8px rgba(0, 0, 0, 0.25)" : "none",
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            ))}
            <motion.p className="mt-2 text-[10px] font-medium tracking-wider text-gray-400" animate={{ opacity: step < 6 ? 1 : 0 }}>
                {step}/6
            </motion.p>
        </div>
    );
}

/* ─────────────────────── Frame Overlay (glass card) ─────────────────────── */

function FrameOverlay({ currentFrame }: { currentFrame: number }) {
    const frame = storyFrames[currentFrame];
    const IconComponent = frame.Icon;
    const isLast = currentFrame === storyFrames.length - 1;

    return (
        <div className="pointer-events-none relative min-h-[300px] md:min-h-[330px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={frame.title}
                    className="glass pointer-events-auto absolute inset-x-0 bottom-0 max-w-3xl rounded-2xl p-5 md:p-7"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-black/[0.03]">
                            <IconComponent size={20} className="text-black/60" />
                        </div>
                        <p className="inline-flex rounded-full border border-black/15 bg-white/60 px-4 py-1 text-xs uppercase tracking-[0.16em] text-gray-600">
                            {frame.badge}
                        </p>
                    </div>
                    <h1 className="section-title text-balance text-3xl font-semibold leading-tight text-black sm:text-4xl md:text-5xl">
                        {frame.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base md:text-lg">{frame.subtitle}</p>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-gray-400 sm:text-sm">{frame.detail}</p>
                    {isLast && (
                        <p className="mt-4 text-xs tracking-widest text-gray-400">↓ KEEP SCROLLING TO START ANALYSIS</p>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* ─────────────────────── Narrative Rail (sidebar) ─────────────────────── */

function NarrativeRail({ currentFrame }: { currentFrame: number }) {
    return (
        <aside className="pointer-events-none hidden justify-self-end md:block md:self-center md:translate-y-[2vh]">
            {/* <div className="glass rounded-2xl p-4"> */}
            {/* <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-400">Scroll Narrative</p> */}
            <ul className="grid h-[72vh] grid-rows-6 gap-3">
                {storyFrames.map((frame, index) => (
                    <motion.li
                        key={frame.badge}
                        className="flex h-full flex-col justify-center overflow-hidden rounded-2xl border px-4 py-3.5"
                        animate={{
                            borderColor: currentFrame === index ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.08)",
                            backgroundColor: currentFrame === index ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.02)",
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-sm uppercase tracking-[0.16em] text-gray-500">{frame.badge}</p>
                        <p className="mt-1.5 text-sm leading-snug text-gray-700">{frame.subtitle}</p>
                    </motion.li>
                ))}
            </ul>
            {/* </div> */}
        </aside>
    );
}

/* ─────────────────────── Main Experience ─────────────────────── */

export function HomeExperience() {
    const heroSectionRef = useRef<HTMLElement>(null);
    const [step, setStep] = useState(0);
    const stepRef = useRef(0);

    const updateStep = useCallback(() => {
        const section = heroSectionRef.current;
        if (!section) return;

        const scrollY = window.scrollY;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight || 1;

        let nextStep: number;
        if (scrollY < sectionTop) {
            nextStep = 0;
        } else if (scrollY >= sectionTop + sectionHeight - viewportHeight) {
            nextStep = 6;
        } else {
            const scrolled = Math.max(0, scrollY - sectionTop);
            nextStep = Math.floor(scrolled / viewportHeight);
            nextStep = Math.min(6, Math.max(0, nextStep));
        }

        if (stepRef.current !== nextStep) {
            stepRef.current = nextStep;
            setStep(nextStep);
        }
    }, []);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => { updateStep(); ticking = false; });
        };
        updateStep();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateStep);
        return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", updateStep); };
    }, [updateStep]);

    const currentFrame = Math.min(step, storyFrames.length - 1);
    const showApp = step >= 6;

    const scrollToApp = () => {
        const section = heroSectionRef.current;
        if (section) {
            window.scrollTo({ top: section.offsetTop + section.offsetHeight, behavior: "smooth" });
        }
    };

    return (
        <div className="relative">
            <ScrollProgressBar step={step} />

            {/* ── Cinematic Scroll Section (700vh scroll trap) ── */}
            <section ref={heroSectionRef} className="relative" style={{ height: "700vh" }}>
                <div className="sticky top-0 h-screen overflow-hidden">
                    {/* ── CarSure branding (top-left) ── */}
                    <p
                        className="absolute left-12 top-10 z-20"
                        style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "2.9rem", letterSpacing: "0.08em", color: "#111" }}
                    >
                        CarSure
                    </p>

                    {/* ── ANALYSE shortcut (top-right) ── */}
                    <button
                        className="absolute right-14 top-12 z-20 inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 bg-white/70 px-5 py-2 text-s font-semibold text-black backdrop-blur transition hover:bg-black hover:text-white"
                        onClick={scrollToApp}
                    >
                        <span>Get Started</span>
                        <img
                            src="/arrow-right.png"
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 object-contain"
                        />
                    </button>

                    <AnimatePresence mode="wait" initial={false}>
                        {!showApp ? (
                            <motion.div
                                key="scroll-narrative"
                                className="absolute inset-0"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <div className="pointer-events-none absolute inset-0">
                                    <div className="mx-auto grid h-full w-[min(1180px,94vw)] grid-cols-1 items-end gap-4 px-3 pb-7 md:grid-cols-[1.15fr_0.85fr] md:pb-10">
                                        <FrameOverlay currentFrame={currentFrame} />
                                        <NarrativeRail currentFrame={currentFrame} />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="app-transition"
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <div className="text-center">
                                    <p className="mb-3 inline-flex rounded-full border border-black/15 bg-black/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-black">
                                        Analysis Ready
                                    </p>
                                    <h2 className="section-title text-3xl font-bold text-black sm:text-4xl md:text-5xl">
                                        Let&apos;s Analyze Your Car
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-md text-sm text-gray-500 sm:text-base">
                                        Scroll down to start the AI analysis
                                    </p>
                                    <motion.div
                                        className="mx-auto mt-6 h-8 w-[1px] bg-gradient-to-b from-black/40 to-transparent"
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scroll hint on first step */}
                    <AnimatePresence>
                        {step === 0 && (
                            <motion.div
                                className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <span className="text-xs tracking-widest text-gray-400">SCROLL TO EXPLORE</span>
                                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                                    <ChevronDown size={18} className="text-gray-400" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ── App Section (outside scroll trap) ── */}
            <AnimatePresence>
                {showApp && (
                    <motion.div
                        key="app-content"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <AppSection />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
