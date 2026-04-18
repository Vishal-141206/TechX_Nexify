"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Sparkles, TrendingUp, ShieldAlert, Activity, CheckCircle2, MessageSquare, AlertTriangle, XCircle, Gauge } from "lucide-react";

/* ─── Types ─── */

type Sentiment = {
    score: number;
    label: string;
};

type BestChoice = {
    car: string;
    fit_score: number;
    risk_score: number;
    price_range: string;
    sentiment: Sentiment;
    why_this_wins: string[];
    trade_offs: string[];
};

type Comparison = {
    car: string;
    fit_score: number;
    risk_score: number;
    sentiment: Sentiment;
    top_issue: string;
};

type WhyNotItem = {
    car: string;
    reasons: string[];
};

type Insight = {
    car: string;
    pros: string[];
    cons: string[];
    verdict: string;
};

type AnalyzeResponse = {
    best_choice: BestChoice;
    comparisons: Comparison[];
    why_not: WhyNotItem[];
    community_insights: Insight[];
    decision_confidence: number;
};

/* ─── Form ─── */

type FormState = {
    budget: string;
    usage: string;
    monthly_km: string;
    priority: string;
    family_size: string;
    fuel_preference: string;
    car_condition: string;
};

const INITIAL_FORM: FormState = {
    budget: "1000000",
    usage: "city",
    monthly_km: "500",
    priority: "comfort",
    family_size: "4",
    fuel_preference: "none",
    car_condition: "used",
};

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/* ─── Shared Components ─── */

function Field({ label, value, onChange, type = "text", min }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;
    min?: number | string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <input
                type={type}
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring placeholder:text-gray-400"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                required
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            <select
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* ─── Page ─── */

export default function AnalyzePage() {
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setField = (key: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const onRunAnalysis = async () => {
        setIsLoading(true);
        setAnalysis(null);
        setError(null);

        try {
            const res = await fetch(`${BACKEND_BASE_URL}/assistant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    budget: parseInt(formData.budget),
                    usage: formData.usage,
                    monthly_km: parseInt(formData.monthly_km),
                    priority: formData.priority,
                    family_size: parseInt(formData.family_size),
                    fuel_preference: formData.fuel_preference,
                    car_condition: formData.car_condition
                })
            });

            if (!res.ok) throw new Error("Failed to fetch recommendation analysis.");

            const data = await res.json();
            setAnalysis(data as AnalyzeResponse);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
            {/* ─── Input Form ─── */}
            <motion.section
                className="glass rounded-3xl p-6 md:p-10 text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-black/[0.03]">
                    <Sparkles size={28} className="text-black/50" />
                </div>
                <h1 className="section-title text-3xl md:text-4xl font-semibold text-black">Decision Dashboard</h1>
                <p className="mt-3 max-w-xl mx-auto text-sm text-gray-600">
                    Tell us your preferences. We&apos;ll score, compare, and decide — not just display.
                </p>

                <form className="mt-8 space-y-5 text-left max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField
                            label="Car Condition" value={formData.car_condition} onChange={(val: string) => setField("car_condition", val)}
                            options={[{ label: "Used Car", value: "used" }, { label: "Brand New Car", value: "new" }]}
                        />
                        <Field label="Target Budget (₹)" type="number" value={formData.budget} onChange={(val: string) => setField("budget", val)} min={100000} />
                        <Field label="Monthly Driving (km)" type="number" value={formData.monthly_km} onChange={(val: string) => setField("monthly_km", val)} min={10} />
                        <Field label="Family Size" type="number" value={formData.family_size} onChange={(val: string) => setField("family_size", val)} min={1} />
                        <SelectField
                            label="Primary Usage" value={formData.usage} onChange={(val: string) => setField("usage", val)}
                            options={[{ label: "City Commute", value: "city" }, { label: "Highway Tours", value: "highway" }, { label: "Mixed", value: "mixed" }]}
                        />
                        <SelectField
                            label="Key Priority" value={formData.priority} onChange={(val: string) => setField("priority", val)}
                            options={[{ label: "Mileage & Economy", value: "mileage" }, { label: "Power & Performance", value: "performance" }, { label: "Comfort & Space", value: "comfort" }]}
                        />
                        <SelectField
                            label="Fuel Preference" value={formData.fuel_preference} onChange={(val: string) => setField("fuel_preference", val)}
                            options={[{ label: "No Preference", value: "none" }, { label: "Petrol", value: "petrol" }, { label: "Diesel", value: "diesel" }, { label: "Electric (EV)", value: "ev" }]}
                        />
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button
                            type="button" onClick={onRunAnalysis} disabled={isLoading}
                            className="rounded-xl w-full md:w-auto bg-black px-10 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all active:translate-y-0 active:shadow-md flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                    Generating Decision...
                                </>
                            ) : (
                                "Generate Decision"
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center justify-center gap-2 max-w-2xl mx-auto">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </motion.section>

            {/* ─── Results ─── */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* ═══ SECTION 1: BEST CHOICE ═══ */}
                        <div className="glass rounded-3xl p-8 border border-white/20 relative overflow-hidden bg-gradient-to-br from-green-50/50 to-emerald-50/30">
                            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-[0.03]">
                                <TrendingUp size={180} className="text-black" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="bg-emerald-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
                                    <Sparkles size={14} /> Best Choice
                                </span>
                                <span className="bg-white border border-black/10 text-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                                    <Gauge size={13} /> {analysis.decision_confidence}% Confidence
                                </span>
                            </div>

                            <div className="grid md:grid-cols-[1fr_200px] gap-8 items-start relative z-10">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{analysis.best_choice.car}</h2>
                                    <p className="mt-2 text-lg text-emerald-800 font-medium">
                                        {formData.car_condition === "new" ? "Showroom Price" : "Estimated Market Price"}: {analysis.best_choice.price_range}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${analysis.best_choice.sentiment.score >= 70 ? "text-emerald-600" : analysis.best_choice.sentiment.score >= 40 ? "text-gray-600" : "text-red-500"}`}>
                                            {analysis.best_choice.sentiment.label}
                                        </span>
                                        <span className="text-xs text-gray-400">({analysis.best_choice.sentiment.score}/100)</span>
                                    </div>

                                    {/* Why This Wins */}
                                    <div className="mt-6 space-y-2.5">
                                        <p className="text-xs uppercase font-bold tracking-widest text-emerald-700">Why This Wins</p>
                                        {analysis.best_choice.why_this_wins.map((point, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-0.5 flex-shrink-0 bg-white shadow-sm p-0.5 rounded-full border border-emerald-100">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                </div>
                                                <p className="text-sm text-gray-800 font-medium">{point}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Trade-offs */}
                                    {analysis.best_choice.trade_offs.length > 0 && (
                                        <div className="mt-5 space-y-2">
                                            <p className="text-xs uppercase font-bold tracking-widest text-amber-600">Trade-offs</p>
                                            {analysis.best_choice.trade_offs.map((t, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-gray-600 font-medium">{t}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Fit Score Card */}
                                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-emerald-100/50 shadow-sm flex flex-col items-center justify-center text-center">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Fit Score</p>
                                    <p className="text-5xl font-black text-emerald-600 tracking-tighter">{analysis.best_choice.fit_score}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">/100</p>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${analysis.best_choice.fit_score}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ SECTION 2: COMPARISON GRID ═══ */}
                        <div className="glass rounded-3xl p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity size={20} className="text-gray-400" />
                                <h3 className="text-xl font-bold text-gray-900">Comparison Matrix</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[750px]">
                                    <thead>
                                        <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-gray-500 font-bold bg-black/5">
                                            <th className="p-4 rounded-tl-xl w-[28%]">Model</th>
                                            <th className="p-4">Fit</th>
                                            <th className="p-4">Risk</th>
                                            <th className="p-4">Sentiment</th>
                                            <th className="p-4 rounded-tr-xl">Top Issue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 bg-white/40">
                                        {analysis.comparisons.map((item, i) => (
                                            <tr key={i} className={`hover:bg-white/80 transition-colors group ${item.car === analysis.best_choice.car ? "bg-emerald-50/40" : ""}`}>
                                                <td className="p-4 font-bold text-gray-900 group-hover:text-black">
                                                    {item.car}
                                                    {item.car === analysis.best_choice.car && (
                                                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">Best</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-emerald-600">{item.fit_score}</span>
                                                        <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500" style={{ width: `${item.fit_score}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded flex w-max items-center gap-1.5 ${item.risk_score >= 6 ? "bg-red-100 text-red-700" : item.risk_score >= 4 ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                        <ShieldAlert size={12} /> {item.risk_score}/10
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-semibold ${item.sentiment.score >= 70 ? "text-emerald-600" : item.sentiment.score >= 40 ? "text-gray-600" : "text-red-500"}`}>
                                                            {item.sentiment.label}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">{item.sentiment.score}/100</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-600 max-w-[200px]">{item.top_issue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ═══ SECTION 3: WHY NOT ═══ */}
                        {analysis.why_not.length > 0 && (
                            <div className="glass rounded-3xl p-6 md:p-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <XCircle size={20} className="text-red-400" />
                                    <h3 className="text-xl font-bold text-gray-900">Why Not These?</h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {analysis.why_not.map((item, i) => (
                                        <div key={i} className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                                            <h4 className="font-bold text-gray-900 text-base mb-3">{item.car}</h4>
                                            <ul className="space-y-2">
                                                {item.reasons.map((r, ri) => (
                                                    <li key={ri} className="flex items-start gap-2 text-sm font-medium text-red-800">
                                                        <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ SECTION 4: COMMUNITY INSIGHTS ═══ */}
                        <div className="glass rounded-3xl p-6 md:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <MessageSquare size={20} className="text-blue-500" />
                                <h3 className="text-xl font-bold text-gray-900">Community Insights</h3>
                            </div>

                            <div className="grid gap-6">
                                {analysis.community_insights.map((insight, i) => (
                                    <div key={i} className="bg-white/60 border border-black/5 rounded-2xl p-6 grid md:grid-cols-[180px_1fr] gap-6 items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900">{insight.car}</h4>
                                            <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                <p className="text-xs uppercase font-bold text-blue-800 tracking-wider mb-1">Verdict</p>
                                                <p className="text-sm font-medium text-blue-900 leading-snug">{insight.verdict}</p>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-xs uppercase font-bold tracking-widest text-emerald-600">Pros</p>
                                                <ul className="space-y-1.5 text-sm font-medium text-gray-700">
                                                    {insight.pros.length > 0 ? insight.pros.map((p, idx) => <li key={idx} className="flex gap-2 items-start"><span className="text-emerald-500 mt-0.5">•</span><span>{p}</span></li>) : <li>N/A</li>}
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs uppercase font-bold tracking-widest text-red-500">Concerns</p>
                                                <ul className="space-y-1.5 text-sm font-medium text-gray-700">
                                                    {insight.cons.length > 0 ? insight.cons.map((c, idx) => <li key={idx} className="flex gap-2 items-start"><span className="text-red-400 mt-0.5">•</span><span>{c}</span></li>) : <li>N/A</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
