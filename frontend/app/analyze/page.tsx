"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Gauge, ShieldAlert } from "lucide-react";
import { API_URL } from "@/lib/api";

type AnalyzeResponse = {
    price_range: string;
    risk_score: number;
    fraud_detected: boolean;
    data_confidence: string;
    recommendation: string;
    reasons: string[];
    ai_advice: string;
};

type FormState = {
    model: string;
    year: string;
    mileage_kmpl: string;
    engine_cc: string;
    owner_count: string;
    fuel_type: string;
    transmission: string;
};

const INITIAL_FORM: FormState = {
    model: "",
    year: "",
    mileage_kmpl: "",
    engine_cc: "",
    owner_count: "",
    fuel_type: "Petrol",
    transmission: "Manual",
};

// Removed BACKEND_BASE_URL to rely exclusively on API_URL

function formatAdvice(text: string) {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="bg-yellow-200/80 font-bold text-black px-1.5 py-0.5 rounded border border-yellow-400">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function Field({ label, value, onChange, placeholder, type = "text", min, step, required = false }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    type?: string;
    min?: number;
    step?: number;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-sm text-black outline-none transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                step={step}
                required={required}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options, required = false }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                className="w-full rounded-xl border border-black/15 bg-white/60 px-4 py-3 text-sm text-black outline-none transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
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
            const res = await fetch(`${API_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: formData.model,
                    year: parseInt(formData.year) || 0,
                    mileage_kmpl: parseFloat(formData.mileage_kmpl) || 0,
                    engine_cc: parseInt(formData.engine_cc) || 0,
                    owner_count: parseInt(formData.owner_count) || 0,
                    fuel_type: formData.fuel_type,
                    transmission: formData.transmission,
                })
            });

            if (!res.ok) {
                throw new Error("Unable to analyze this vehicle right now.");
            }

            const data = await res.json();
            setAnalysis({
                price_range: data.price_range || "N/A",
                risk_score: typeof data.risk_score === "number" ? data.risk_score : 0,
                fraud_detected: !!data.fraud_detected,
                data_confidence: data.data_confidence || "Medium",
                recommendation: data.recommendation || "Pending",
                reasons: Array.isArray(data.reasons) ? data.reasons : [],
                ai_advice: data.ai_advice || "",
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const riskLabel =
        analysis?.risk_score === undefined
            ? "Pending"
            : analysis.risk_score >= 8
                ? "High"
                : analysis.risk_score >= 5
                    ? "Medium"
                    : "Low";

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <motion.section
                    className="glass rounded-3xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="section-title text-3xl font-semibold text-black">Analyze Car</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Submit car details to run the complete CarSure AI evaluation.
                    </p>

                    <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Model (optional)"
                                placeholder="e.g. Hyundai Creta SX"
                                value={formData.model}
                                onChange={(value: string) => setField("model", value)}
                            />
                            <Field
                                label="Year"
                                placeholder="e.g. 2019"
                                type="number"
                                value={formData.year}
                                onChange={(value: string) => setField("year", value)}
                                required
                                min={1980}
                            />
                            <Field
                                label="Mileage (km/l)"
                                placeholder="e.g. 18.5"
                                type="number"
                                value={formData.mileage_kmpl}
                                onChange={(value: string) => setField("mileage_kmpl", value)}
                                required
                                min={1}
                                step={0.1}
                            />
                            <Field
                                label="Engine CC"
                                placeholder="e.g. 1497"
                                type="number"
                                value={formData.engine_cc}
                                onChange={(value: string) => setField("engine_cc", value)}
                                required
                                min={500}
                            />
                            <Field
                                label="Owner Count"
                                placeholder="e.g. 2"
                                type="number"
                                value={formData.owner_count}
                                onChange={(value: string) => setField("owner_count", value)}
                                required
                                min={1}
                            />
                            <SelectField
                                label="Fuel Type"
                                value={formData.fuel_type}
                                onChange={(value: string) => setField("fuel_type", value)}
                                required
                                options={[
                                    { label: "Petrol", value: "Petrol" },
                                    { label: "Diesel", value: "Diesel" },
                                    { label: "Electric", value: "Electric" },
                                    { label: "CNG", value: "CNG" },
                                ]}
                            />
                            <SelectField
                                label="Transmission"
                                value={formData.transmission}
                                onChange={(value: string) => setField("transmission", value)}
                                required
                                options={[
                                    { label: "Manual", value: "Manual" },
                                    { label: "Automatic", value: "Automatic" },
                                ]}
                            />
                        </div>

                        {error && (
                            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onRunAnalysis}
                            className="mt-4 rounded-xl bg-black w-full px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Running Analysis..." : "Run AI Analysis"}
                        </button>
                    </form>
                </motion.section>

                <motion.section
                    className="glass relative overflow-hidden rounded-3xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="section-title text-2xl font-semibold text-black">Analysis Stream</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Realtime stats mapped from CarSure engine models
                    </p>

                    <div className="relative mt-6 h-72 rounded-2xl border border-black/10 bg-gray-50 p-6 flex flex-col justify-between">
                        {isLoading ? <div className="scan-line absolute inset-0 glass z-50 pointer-events-none" /> : null}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Predicted Price</p>
                                <p className={`mt-1 font-semibold text-gray-900 ${analysis ? "text-2xl" : "text-xl opacity-40"}`}>
                                    {analysis ? analysis.price_range : "₹--,---"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">System Verdict</p>
                                <p className={`mt-1 font-semibold ${analysis ? "text-black text-xl" : "text-gray-900 text-xl opacity-40"}`}>
                                    {analysis ? analysis.recommendation : "Pending"}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 mt-6">
                            <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4">
                                <div className="flex items-center gap-3">
                                    <Gauge size={20} className="text-black/40" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Risk Profile ({riskLabel})</p>
                                        <p className="text-xs text-gray-500">ML structural scoring</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${analysis ? (analysis.risk_score >= 8 ? "text-red-500" : analysis.risk_score >= 5 ? "text-yellow-500" : "text-emerald-500") : "text-gray-400"}`}>
                                    {analysis ? `${analysis.risk_score}/10` : "-/10"}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={20} className="text-black/40" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Fraud Detection</p>
                                        <p className="text-xs text-gray-500">Anomaly bounds validation</p>
                                    </div>
                                </div>
                                <span className={`font-semibold ${analysis ? (analysis.fraud_detected ? "text-red-600" : "text-emerald-600") : "text-gray-400"}`}>
                                    {analysis ? (analysis.fraud_detected ? "Flagged" : "Clear") : "Pending"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <Bot size={18} className="text-blue-600" />
                            <h3 className="font-semibold text-gray-900">AI Advisor Response</h3>
                        </div>
                        {analysis?.ai_advice ? (
                            <div className="text-sm text-gray-700 leading-relaxed space-y-2 relative z-10 font-medium">
                                {formatAdvice(analysis.ai_advice)}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No advice populated yet.</p>
                        )}
                    </div>
                </motion.section>
            </div>
        </main>
    );
}
