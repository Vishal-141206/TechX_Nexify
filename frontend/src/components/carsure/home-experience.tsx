"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    Car,
    ChevronDown,
    Gauge,
    History,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    MessageSquare,
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
        title: "Dual Architecture Engine",
        subtitle: "Choose between rigorous diagnostics or structured buying matrices.",
        detail: "CarSure offers two separate execution flows: Analyze a singular vehicle technically, or request a Dashboard of recommendations tailored to your profile.",
        badge: "Architecture",
        Icon: LayoutDashboard,
        step: "01",
    },
    {
        title: "ML Rigorous Diagnostic",
        subtitle: "Analyze specific vehicle parameters with predictive thresholds.",
        detail: "Provide Year, Engine CC, and Mileage. The ML models calculate Price Bounds and surface mechanical Risk Scores directly for the vehicle.",
        badge: "Analyze Car",
        Icon: Gauge,
        step: "02",
    },
    {
        title: "AI Buying Assistant",
        subtitle: "Questionnaire-powered multi-vehicle market generation.",
        detail: "Instead of specifying specs, provide your Lifestyle profile. An LLM dynamically constructs an active market catalog tailored to your Needs and Budget.",
        badge: "Assistant",
        Icon: WandSparkles,
        step: "03",
    },
    {
        title: "Decision Dashboard Matrix",
        subtitle: "Compare AI recommendations using strict structured data.",
        detail: "No conversational chatbots. Your recommendations render visually as a Dashboard matrix mapping exact Fit Scores, Risk Ratings, and Target Prices side-by-side.",
        badge: "Features",
        Icon: ShieldCheck,
        step: "04",
    },
    {
        title: "HuggingFace Community Tracking",
        subtitle: "Real-time semantic insight compilation from the community.",
        detail: "CarSure scrapes Reddit discussions, scores absolute quantified Sentiment through roberta-base Transformers, and strictly extracts critical Top Issues.",
        badge: "Reddit Integrations",
        Icon: MessageSquare,
        step: "05",
    },
];

/* ─────────────────────── Combined App Section ─────────────────────── */

function AppSection() {
    const [activeTab, setActiveTab] = useState<"analyze" | "assistant">("analyze");

    return (
        <section id="app-section" className="mx-auto mt-20 max-w-7xl px-5 pb-20">
            <div className="grid gap-4 rounded-3xl border border-black/10 bg-gray-50/80 p-4 backdrop-blur md:grid-cols-[240px_1fr]">
                <aside className="glass rounded-2xl p-4 self-start sticky top-4">
                    <h2 className="section-title mb-4 text-xl font-semibold text-black">CarSure AI</h2>
                    <nav className="space-y-2 text-sm text-gray-700">
                        <button onClick={() => setActiveTab("analyze")} className={`w-full flex items-center justify-start gap-2 rounded-lg px-3 py-2 transition-colors ${activeTab === "analyze" ? "bg-black/5 font-medium text-black" : "hover:bg-black/5"}`}>
                            <WandSparkles size={16} /> Analyze Car
                        </button>
                        <button onClick={() => setActiveTab("assistant")} className={`w-full flex items-center justify-start gap-2 rounded-lg px-3 py-2 transition-colors ${activeTab === "assistant" ? "bg-black/5 font-medium text-black" : "hover:bg-black/5"}`}>
                            <Sparkles size={16} /> AI Buying Assistant
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
                            <div className="glass rounded-2xl p-6 text-center">
                                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-black/[0.03]">
                                    <WandSparkles size={28} className="text-black/50" />
                                </div>
                                <h3 className="section-title text-2xl font-semibold text-black">Analyze Car</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                                    Enter full vehicle details — year, mileage, engine CC, owner count, fuel type,
                                    transmission, and vehicle number — to get AI-powered pricing, risk scoring,
                                    fraud detection, verification, and a buying recommendation.
                                </p>
                                <Link
                                    href="/analyze"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                                >
                                    <WandSparkles size={16} />
                                    Start Full Analysis
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Step 1</p>
                                    <p className="mt-2 text-sm font-semibold text-black">Enter Vehicle Details</p>
                                    <p className="mt-1 text-xs text-gray-500">Year, mileage, engine CC, owners, fuel type, transmission</p>
                                </div>
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Step 2</p>
                                    <p className="mt-2 text-sm font-semibold text-black">AI Runs Analysis</p>
                                    <p className="mt-1 text-xs text-gray-500">Price prediction, risk scoring, and fraud detection</p>
                                </div>
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Step 3</p>
                                    <p className="mt-2 text-sm font-semibold text-black">Get AI Recommendation</p>
                                    <p className="mt-1 text-xs text-gray-500">Clear buying advice based on all analysis data</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            <div className="glass rounded-2xl p-6 text-center">
                                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-black/[0.03]">
                                    <Sparkles size={28} className="text-black/50" />
                                </div>
                                <h3 className="section-title text-2xl font-semibold text-black">AI Buying Assistant</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                                    Not sure which car to buy? Just tell us your budget, family size, usage, and priority. Our AI will scan the market and evaluate the best fit utilizing reddit insights and ML pricing bounds.
                                </p>
                                <Link
                                    href="/assistant"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                                >
                                    <Sparkles size={16} />
                                    Launch AI Assistant
                                </Link>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Phase 1</p>
                                    <p className="mt-2 text-sm font-semibold text-black">Tell us your needs</p>
                                    <p className="mt-1 text-xs text-gray-500">Set budget, family size, and driving preferences</p>
                                </div>
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Phase 2</p>
                                    <p className="mt-2 text-sm font-semibold text-black">Recommendation</p>
                                    <p className="mt-1 text-xs text-gray-500">LLM evaluates the dynamic active market catalog</p>
                                </div>
                                <div className="glass rounded-2xl p-5">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Phase 3</p>
                                    <p className="mt-2 text-sm font-semibold text-black">Insights Engine</p>
                                    <p className="mt-1 text-xs text-gray-500">Reviews and extracts community verdict on top picks</p>
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
            <AnimatePresence>
                <motion.div
                    key={frame.title}
                    className="glass pointer-events-auto absolute inset-x-0 bottom-0 max-w-3xl rounded-2xl p-5 md:p-7"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
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
        window.requestAnimationFrame(updateStep);
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
                        <Image
                            src="/arrow-right.png"
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            className="h-5 w-5 object-contain"
                            unoptimized
                        />
                    </button>

                    <AnimatePresence initial={false}>
                        {!showApp ? (
                            <motion.div
                                key="scroll-narrative"
                                className="absolute inset-0"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
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

            <div id="app-section">
                    <AppSection />
            </div>
        </div>
    );
}
