"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Car,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Gauge,
    History,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    ShieldAlert,
    Sparkles,
    MessageSquare,
    AlertTriangle,
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
    const [activeMenu, setActiveMenu] = useState<"analyze" | "dashboard" | "history" | "settings">("dashboard");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 1024px)");
        const handleMedia = (event: MediaQueryListEvent) => {
            setIsSidebarCollapsed(event.matches);
        };

        setIsSidebarCollapsed(media.matches);
        media.addEventListener("change", handleMedia);
        return () => media.removeEventListener("change", handleMedia);
    }, []);

    const menuItems: Array<{ key: "analyze" | "dashboard" | "history" | "settings"; label: string; Icon: LucideIcon }> = [
        { key: "analyze", label: "Analyze Car", Icon: WandSparkles },
        { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { key: "history", label: "History", Icon: History },
        { key: "settings", label: "Settings", Icon: Settings },
    ];

    return (
        <section className="h-screen w-full px-3 py-4 md:px-6 md:py-6">
            <div className="mx-auto flex h-full max-w-[1300px] rounded-3xl glass p-3 md:p-4">
                <aside
                    className={`relative flex h-full flex-col rounded-2xl glass p-3 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-[70px]" : "w-[250px]"
                        }`}
                >
                    <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed((previous) => !previous)}
                        className="absolute right-0 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-black/10 bg-white text-gray-700 shadow-md transition-all duration-300 hover:bg-black hover:text-white"
                        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    <div className={`mb-5 flex h-11 items-center ${isSidebarCollapsed ? "justify-center" : "gap-2.5"}`}>
                        <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/5 bg-black/[0.04] text-sm font-semibold text-[#2c3435]">
                            CS
                        </div>
                        <h2
                            className={`orbitron-brand overflow-hidden whitespace-nowrap text-xl font-semibold tracking-[0.05em] text-[#2c3435] transition-all duration-300 ${isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
                                }`}
                        >
                            CarSure
                        </h2>
                    </div>

                    <nav className="space-y-2 text-sm text-gray-700">
                        {menuItems.map(({ key, label, Icon }) => {
                            const isActive = activeMenu === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveMenu(key)}
                                    className={`relative flex h-11 w-full items-center rounded-xl border transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
                                        } ${isActive
                                            ? "border-black/15 bg-black/[0.06] font-semibold text-black shadow-sm"
                                            : "border-transparent bg-transparent text-gray-600 hover:border-black/10 hover:bg-black/[0.03] hover:text-black"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span
                                        className={`overflow-hidden whitespace-nowrap pl-2.5 text-left transition-all duration-300 ${isSidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col gap-4 pl-3 transition-all duration-300 ease-in-out md:pl-4">
                    <div className="glass flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-2xl p-6 text-center md:p-8">
                        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-black/5 bg-black/[0.03]">
                            {activeMenu === "analyze" ? <WandSparkles size={28} className="text-[#4c616c]" /> : activeMenu === "dashboard" ? <LayoutDashboard size={28} className="text-[#4c616c]" /> : <Gauge size={28} className="text-[#4c616c]" />}
                        </div>
                        <h3 className="section-title text-3xl font-semibold text-[#2c3435]">
                            {activeMenu === "analyze" ? "Analyze Car" : activeMenu === "dashboard" ? "Decision Dashboard" : "Dashboard"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-[#586162]">
                            {activeMenu === "analyze"
                                ? "Enter full vehicle details and run a technical analysis for pricing, risk, fraud classification, and AI buying recommendation."
                                : activeMenu === "dashboard"
                                    ? "Tell us your budget and lifestyle. We recommend the best cars, score them on Fit/Risk/Sentiment, explain why the best wins and why others lose."
                                    : "Run an analysis to see your results here."}
                        </p>
                        <Link
                            href={activeMenu === "dashboard" ? "/assistant" : "/analyze"}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-gray-800"
                        >
                            {activeMenu === "dashboard" ? <LayoutDashboard size={16} /> : <WandSparkles size={16} />}
                            {activeMenu === "analyze" ? "Start Full Analysis" : activeMenu === "dashboard" ? "Open Decision Dashboard" : "Go to Analysis"}
                        </Link>
                    </div>

                    {activeMenu === "analyze" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <Sparkles size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">AI Advisor</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Context-aware buying recommendation from Groq LLM with rule-based fallback
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <ShieldAlert size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">3-Level Fraud</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Cumulative signal classification: Clean, Suspicious, or High Risk
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <Gauge size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">Risk Scoring</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    0-10 ML risk score evaluating age, usage, ownership, and mechanical patterns
                                </p>
                            </div>
                        </div>
                    ) : activeMenu === "dashboard" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <ShieldCheck size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">Fit Score Matrix</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Each car scored 0-100 on profile match with side-by-side comparison grid
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <MessageSquare size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">Community Sentiment</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    HuggingFace RoBERTa sentiment from Reddit mapped to Positive / Neutral / Risk
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <AlertTriangle size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">Why-Not Engine</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    LLM-generated rejection reasons for every non-winning car recommendation
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <Sparkles size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">AI Powered</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Groq LLM + HuggingFace Transformers driving all analysis pipelines
                                </p>
                            </div>
                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <Gauge size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">ML Models</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Trained scikit-learn models for price prediction and risk scoring
                                </p>
                            </div>
                            <div className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-black/[0.03]">
                                    <Car size={18} className="text-[#4c616c]" />
                                </div>
                                <p className="text-2xl font-semibold text-[#2c3435]">Data Driven</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#586162]">
                                    Structured JSON outputs — no paragraphs, just comparable metrics
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}

/* ─────────────────────── Scroll Progress Bar ─────────────────────── */

function ScrollProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
    return (
        <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-1.5">
            {Array.from({ length: totalSteps + 1 }, (_, i) => (
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
            <motion.p className="mt-2 text-[10px] font-medium tracking-wider text-gray-400" animate={{ opacity: step < totalSteps ? 1 : 0 }}>
                {step}/{totalSteps}
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
        <div className="pointer-events-none relative flex h-full min-h-[300px] items-center md:min-h-[330px]" style={{ perspective: "1200px" }}>
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={frame.title}
                    className="glass pointer-events-auto w-full max-w-3xl rounded-2xl p-5 md:p-7"
                    initial={{ opacity: 0, scale: 0.85, rotateX: 10, y: 40 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, rotateX: -5, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-black/[0.03]">
                            <IconComponent size={20} className="text-[#4c616c]" />
                        </div>
                        <p className="inline-flex rounded-full border border-black/5 bg-white/40 px-4 py-1 text-xs uppercase tracking-[0.16em] text-[#586162]">
                            {frame.badge}
                        </p>
                    </div>
                    <h1 className="section-title text-balance text-3xl font-semibold leading-tight text-[#2c3435] sm:text-4xl md:text-5xl">
                        {frame.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-[#586162] sm:text-base md:text-lg">{frame.subtitle}</p>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#747c7d] sm:text-sm">{frame.detail}</p>
                    {isLast && (
                        <p className="mt-4 text-xs tracking-widest text-[#747c7d]">↓ KEEP SCROLLING TO START ANALYSIS</p>
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
            <ul className="grid h-[72vh] gap-3" style={{ gridTemplateRows: `repeat(${storyFrames.length}, minmax(0, 1fr))` }}>
                {storyFrames.map((frame, index) => (
                    <motion.li
                        key={frame.badge}
                        className="flex h-full flex-col justify-center overflow-hidden rounded-2xl glass px-4 py-3.5"
                        animate={{
                            opacity: currentFrame === index ? 1 : 0.4,
                            scale: currentFrame === index ? 1 : 0.95
                        }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-sm uppercase tracking-[0.16em] text-[#586162]">{frame.badge}</p>
                        <p className="mt-1.5 text-sm leading-snug text-[#2c3435]">{frame.subtitle}</p>
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
    const totalSteps = storyFrames.length;

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
            nextStep = totalSteps;
        } else {
            const scrolled = Math.max(0, scrollY - sectionTop);
            nextStep = Math.floor(scrolled / viewportHeight);
            nextStep = Math.min(totalSteps, Math.max(0, nextStep));
        }

        if (stepRef.current !== nextStep) {
            stepRef.current = nextStep;
            setStep(nextStep);
        }
    }, [totalSteps]);

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
    const showApp = step >= totalSteps;

    const scrollToApp = () => {
        const section = heroSectionRef.current;
        if (section) {
            window.scrollTo({ top: section.offsetTop + section.offsetHeight, behavior: "smooth" });
        }
    };

    return (
        <div className="relative">
            <ScrollProgressBar step={step} totalSteps={totalSteps} />

            {/* ── Cinematic Scroll Section (700vh scroll trap) ── */}
            <section ref={heroSectionRef} className="relative" style={{ height: "700vh" }}>
                <div className="sticky top-0 h-screen overflow-hidden">
                    {/* ── CarSure branding (top-left) ── */}
                    <p
                        className="orbitron-brand absolute left-12 top-10 z-20"
                        style={{ fontSize: "2.9rem", letterSpacing: "0.08em", color: "#111" }}
                    >
                        CarSure
                    </p>

                    {/* ── ANALYSE shortcut (top-right) ── */}
                    <button
                        className="group absolute right-14 top-12 z-20 inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 bg-white/70 px-5 py-2 text-s font-semibold text-black backdrop-blur transition hover:bg-black hover:text-white"
                        onClick={scrollToApp}
                    >
                        <span>Get Started</span>
                        <img
                            src="/black-arrow.png"
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 object-contain group-hover:hidden"
                        />
                        <img
                            src="/white-arrow.png"
                            alt=""
                            aria-hidden="true"
                            className="hidden h-5 w-5 object-contain group-hover:block"
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
                                    <div className="mx-auto grid h-full w-[min(1180px,94vw)] grid-cols-1 items-center gap-4 px-3 md:grid-cols-[1.15fr_0.85fr]">
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
                                <div className="text-center absolute inset-0 flex flex-col items-center justify-center" style={{ perspective: "1000px" }}>
                                    <p className="mb-3 inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#2c3435] glass">
                                        Analysis Ready
                                    </p>
                                    <h2 className="section-title text-3xl font-bold text-[#2c3435] sm:text-4xl md:text-5xl">
                                        Let&apos;s Analyze Your Car
                                    </h2>
                                    <p className="mx-auto mt-3 max-w-md text-sm text-[#586162] sm:text-base">
                                        Scroll down to start the AI analysis
                                    </p>
                                    <motion.div
                                        className="mx-auto mt-6 h-8 w-[1px] bg-gradient-to-b from-[#4c616c]/60 to-transparent"
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
