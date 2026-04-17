"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Bot, Gauge, ShieldAlert, ShieldCheck, Siren, Sparkles } from "lucide-react";

type VerificationStatus = "Verified" | "Mismatch" | "Not Available";

type VerificationDetails = {
    owner_count: number | null;
    registration_year: number | null;
    fuel_type: string | null;
    challan_count: number | null;
    accident_history: "Available" | "Not Available";
    source?: string;
    vehicle_number?: string | null;
    mismatch_fields?: string[];
    note?: string;
};

type AnalyzeResponse = {
    price_range: string;
    risk_score: number;
    fraud_detected: boolean;
    data_confidence: string;
    recommendation: string;
    reasons: string[];
    verification: {
        status: VerificationStatus;
        details: VerificationDetails;
    };
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
    vehicle_number: string;
};

const INITIAL_FORM: FormState = {
    model: "",
    year: "",
    mileage_kmpl: "",
    engine_cc: "",
    owner_count: "",
    fuel_type: "",
    transmission: "",
    vehicle_number: "",
};

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const ANALYSIS_STEPS = [
    "Normalizing pricing and depreciation signals",
    "Evaluating fraud patterns and risk profile",
    "Cross-checking ownership and challan records",
    "Generating AI advisor recommendation",
];

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object") {
        return null;
    }
    return value as Record<string, unknown>;
}

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

function parseOptionalNumber(value: unknown): number | null {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function normalizeAnalysisResponse(data: unknown): AnalyzeResponse {
    const root = asRecord(data);
    const rawVerification = root?.verification;
    const verificationRecord = asRecord(rawVerification);
    const detailsRecord = asRecord(verificationRecord?.details);

    const riskValue =
        typeof root?.risk_score === "number" ? root.risk_score : Number(root?.risk_score ?? 0);
    const safeRiskValue = Number.isFinite(riskValue) ? riskValue : 0;

    const reasons = Array.isArray(root?.reasons)
        ? root.reasons.map((item) => String(item))
        : [];

    const isVerificationText = typeof rawVerification === "string";
    const verificationStatus: VerificationStatus = isVerificationText
        ? "Not Available"
        : verificationRecord?.status === "Mismatch"
            ? "Mismatch"
            : verificationRecord?.status === "Verified"
                ? "Verified"
                : "Not Available";

    return {
        price_range: typeof root?.price_range === "string" ? root.price_range : "N/A",
        risk_score: safeRiskValue,
        fraud_detected: Boolean(root?.fraud_detected),
        data_confidence:
            typeof root?.data_confidence === "string" ? root.data_confidence : "Unknown",
        recommendation:
            typeof root?.recommendation === "string"
                ? root.recommendation
                : "Review manually",
        reasons,
        verification: {
            status: verificationStatus,
            details: {
                owner_count: parseOptionalNumber(detailsRecord?.owner_count),
                registration_year: parseOptionalNumber(detailsRecord?.registration_year),
                fuel_type:
                    typeof detailsRecord?.fuel_type === "string"
                        ? detailsRecord.fuel_type
                        : null,
                challan_count: parseOptionalNumber(detailsRecord?.challan_count),
                accident_history:
                    detailsRecord?.accident_history === "Available" ? "Available" : "Not Available",
                source:
                    typeof detailsRecord?.source === "string"
                        ? detailsRecord.source
                        : undefined,
                vehicle_number:
                    typeof detailsRecord?.vehicle_number === "string"
                        ? detailsRecord.vehicle_number
                        : null,
                mismatch_fields: Array.isArray(detailsRecord?.mismatch_fields)
                    ? detailsRecord.mismatch_fields.map((item) => String(item))
                    : undefined,
                note:
                    typeof detailsRecord?.note === "string"
                        ? detailsRecord.note
                        : isVerificationText
                            ? "Official verification records are not available right now."
                            : undefined,
            },
        },
        ai_advice:
            typeof root?.ai_advice === "string" && root.ai_advice.trim()
                ? root.ai_advice.trim()
                : "AI advisor is unavailable right now. Please review the analysis details.",
    };
}

export default function AnalyzePage() {
    const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            return;
        }

        setAnalysisProgress((current) => (current > 0 ? current : 8));

        const progressTimer = setInterval(() => {
            setAnalysisProgress((current) => {
                const next = current + 9;
                return next > 92 ? 92 : next;
            });
        }, 500);

        const stepTimer = setInterval(() => {
            setAnalysisStepIndex((current) => (current + 1) % ANALYSIS_STEPS.length);
        }, 900);

        return () => {
            clearInterval(progressTimer);
            clearInterval(stepTimer);
        };
    }, [isLoading]);

    const setField = (field: keyof FormState, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const onRunAnalysis = async () => {
        if (isLoading) {
            return;
        }

        setError(null);

        const requiredFields: Array<keyof FormState> = [
            "year",
            "mileage_kmpl",
            "engine_cc",
            "owner_count",
            "fuel_type",
            "transmission",
        ];

        for (const field of requiredFields) {
            if (!formData[field].trim()) {
                setError("Please fill all required fields before running analysis.");
                return;
            }
        }

        const year = Number(formData.year);
        const mileage = Number(formData.mileage_kmpl);
        const engine = Number(formData.engine_cc);
        const owners = Number(formData.owner_count);

        if (
            !Number.isFinite(year) ||
            !Number.isFinite(mileage) ||
            !Number.isFinite(engine) ||
            !Number.isFinite(owners)
        ) {
            setError("Year, mileage, engine CC, and owner count must be valid numbers.");
            return;
        }

        setAnalysisStepIndex(0);
        setAnalysisProgress(10);
        setIsLoading(true);
        setAnalysis(null);
        let isSuccess = false;

        try {
            const payload: Record<string, string | number> = {
                year,
                mileage_kmpl: mileage,
                engine_cc: engine,
                owner_count: owners,
                fuel_type: formData.fuel_type.trim(),
                transmission: formData.transmission.trim(),
            };

            if (formData.model.trim()) {
                payload.model = formData.model.trim();
            }

            if (formData.vehicle_number.trim()) {
                payload.vehicle_number = formData.vehicle_number.trim();
            }

            const response = await fetch(`${BACKEND_BASE_URL}/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const rawBody = await response.text();
            let parsedBody: unknown = {};

            if (rawBody) {
                try {
                    parsedBody = JSON.parse(rawBody);
                } catch {
                    parsedBody = { detail: rawBody };
                }
            }

            if (!response.ok) {
                const parsedError = asRecord(parsedBody);
                const message =
                    parsedError && typeof parsedError.detail === "string"
                        ? parsedError.detail
                        : "Unable to analyze this vehicle right now.";
                throw new Error(message);
            }

            setAnalysis(normalizeAnalysisResponse(parsedBody));
            setAnalysisProgress(100);
            isSuccess = true;
        } catch (requestError) {
            const message =
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to analyze this vehicle right now.";
            setError(message);
        } finally {
            setIsLoading(false);
            if (!isSuccess) {
                setAnalysisProgress(0);
            }
        }
    };

    const verificationBadgeClasses =
        analysis?.verification.status === "Mismatch"
            ? "bg-red-100 text-red-700"
            : analysis?.verification.status === "Verified"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-700";

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
                                onChange={(value) => setField("model", value)}
                            />
                            <Field
                                label="Vehicle Number (optional)"
                                placeholder="e.g. DL01AB1234"
                                value={formData.vehicle_number}
                                onChange={(value) => setField("vehicle_number", value)}
                            />
                            <Field
                                label="Year"
                                placeholder="e.g. 2019"
                                type="number"
                                value={formData.year}
                                onChange={(value) => setField("year", value)}
                                required
                                min={1980}
                            />
                            <Field
                                label="Mileage (km/l)"
                                placeholder="e.g. 18.5"
                                type="number"
                                value={formData.mileage_kmpl}
                                onChange={(value) => setField("mileage_kmpl", value)}
                                required
                                min={1}
                                step={0.1}
                            />
                            <Field
                                label="Engine CC"
                                placeholder="e.g. 1497"
                                type="number"
                                value={formData.engine_cc}
                                onChange={(value) => setField("engine_cc", value)}
                                required
                                min={500}
                            />
                            <Field
                                label="Owner Count"
                                placeholder="e.g. 2"
                                type="number"
                                value={formData.owner_count}
                                onChange={(value) => setField("owner_count", value)}
                                required
                                min={1}
                            />
                            <SelectField
                                label="Fuel Type"
                                value={formData.fuel_type}
                                onChange={(value) => setField("fuel_type", value)}
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
                                onChange={(value) => setField("transmission", value)}
                                required
                                options={[
                                    { label: "Manual", value: "Manual" },
                                    { label: "Automatic", value: "Automatic" },
                                ]}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={onRunAnalysis}
                            className="rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg transition-all active:translate-y-0 active:shadow-md"
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
                    <h2 className="section-title text-2xl font-semibold text-black">Live Analysis Status</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Realtime stream from CarSure pricing, risk, verification, and advisor engines
                    </p>

                    <div className="relative mt-6 h-72 rounded-2xl border border-black/10 bg-gray-50 p-6">
                        {isLoading ? <div className="scan-line absolute inset-0" /> : null}
                        <div className="relative z-10 h-full">
                            <div className="grid h-full content-between gap-4">
                                <motion.div
                                    animate={isLoading ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                                    transition={{ repeat: isLoading ? Infinity : 0, duration: 1.3 }}
                                >
                                    <p className="text-xl font-semibold text-black">
                                        {isLoading
                                            ? "Analyzing vehicle..."
                                            : analysis
                                                ? "Analysis complete"
                                                : "Ready for analysis"}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {isLoading
                                            ? ANALYSIS_STEPS[analysisStepIndex]
                                            : analysis
                                                ? "Review the cards below for final recommendation"
                                                : "Enter details and run AI Analysis to get started"}
                                    </p>
                                </motion.div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                                        <span>Pipeline progress</span>
                                        <span>{analysisProgress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-black to-gray-500 transition-all duration-300"
                                            style={{ width: `${analysisProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {error ? (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                ) : null}

                                {analysis ? (
                                    <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-sm">
                                        <p className="font-semibold text-black">Latest recommendation</p>
                                        <p className="mt-1 text-gray-700">{analysis.recommendation}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-black/5 px-2 py-1 text-gray-600">
                                                Confidence: {analysis.data_confidence}
                                            </span>
                                            <span className="rounded-full bg-black/5 px-2 py-1 text-gray-600">
                                                Fraud: {analysis.fraud_detected ? "Detected" : "Not Detected"}
                                            </span>
                                            <span className="rounded-full bg-black/5 px-2 py-1 text-gray-600">
                                                Risk Level: {riskLabel}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>

            {analysis ? (
                <section className="mt-6 flex flex-col gap-6">
                    <motion.article
                        className="glass rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:border-black/20 hover:bg-white/40 transition-all duration-300 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h2 className="section-title text-xl font-semibold text-black">Analysis Card</h2>
                        <div className="mt-4 space-y-3 text-sm">
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Price Range</span>
                                <span className="font-semibold text-black">{analysis.price_range}</span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Risk Score</span>
                                <span className="font-semibold text-black">{analysis.risk_score}/10</span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Recommendation</span>
                                <span className="font-semibold text-black">{analysis.recommendation}</span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Fraud Status</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-black">
                                    <Siren size={14} />
                                    {analysis.fraud_detected ? "Detected" : "Not Detected"}
                                </span>
                            </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-3">
                            <p className="text-sm font-semibold text-black">Reasons</p>
                            {analysis.reasons.length ? (
                                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                                    {analysis.reasons.map((reason, index) => (
                                        <li key={`${reason}-${index}`} className="flex gap-2">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0 text-gray-500" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">No risk reasons returned by the backend.</p>
                            )}
                        </div>
                    </motion.article>

                    <motion.article
                        className="glass rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:border-black/20 hover:bg-white/40 transition-all duration-300 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <h2 className="section-title text-xl font-semibold text-black">Verification Card</h2>

                        <div className="mt-4 flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                            <span className="text-sm text-gray-500">Status</span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${verificationBadgeClasses}`}
                            >
                                {analysis.verification.status === "Mismatch" ? (
                                    <ShieldAlert size={14} />
                                ) : analysis.verification.status === "Verified" ? (
                                    <ShieldCheck size={14} />
                                ) : (
                                    <AlertCircle size={14} />
                                )}
                                {analysis.verification.status}
                            </span>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Owner Count</span>
                                <span className="font-semibold text-black">
                                    {analysis.verification.details.owner_count ?? "Unavailable"}
                                </span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Registration Year</span>
                                <span className="font-semibold text-black">
                                    {analysis.verification.details.registration_year ?? "Unavailable"}
                                </span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Fuel Type</span>
                                <span className="font-semibold text-black">
                                    {analysis.verification.details.fuel_type ?? "Unavailable"}
                                </span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Challan Count</span>
                                <span className="font-semibold text-black">
                                    {analysis.verification.details.challan_count ?? "Unavailable"}
                                </span>
                            </p>
                            <p className="flex items-center justify-between rounded-xl border border-black/10 bg-white/80 px-3 py-2">
                                <span className="text-gray-500">Accident History</span>
                                <span className="font-semibold text-black">
                                    {analysis.verification.details.accident_history}
                                </span>
                            </p>
                        </div>

                        {analysis.verification.details.note ? (
                            <p className="mt-4 rounded-xl border border-black/10 bg-white/80 p-3 text-sm text-gray-600">
                                {analysis.verification.details.note}
                            </p>
                        ) : null}

                        {analysis.verification.details.mismatch_fields?.length ? (
                            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                Mismatch fields: {analysis.verification.details.mismatch_fields.join(", ")}
                            </p>
                        ) : null}
                    </motion.article>

                    <motion.article
                        className="glass rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:border-black/20 hover:bg-white/40 transition-all duration-300 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        <h2 className="section-title text-xl font-semibold text-black">AI Advisor Card</h2>

                        <div className="mt-4 rounded-2xl border border-black/10 bg-white/85 p-4">
                            <div className="flex items-start gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-black text-white">
                                    <Bot size={18} />
                                </div>
                                <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                                    {formatAdvice(analysis.ai_advice)}
                                </p>
                            </div>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs text-gray-600">
                                <Sparkles size={14} /> Context-aware summary from analysis + verification
                            </div>
                        </div>
                    </motion.article>
                </section>
            ) : (
                <section className="mt-6 glass rounded-3xl p-6 text-center">
                    <h2 className="section-title text-xl font-semibold text-black">Analysis Results</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Your Analysis, Verification, and AI Advisor cards will appear here after running analysis.
                    </p>
                    <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs text-gray-600">
                        <Gauge size={14} /> Interactive assistant mode is ready
                    </div>
                </section>
            )}
        </main>
    );
}

type FieldProps = {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "number";
    required?: boolean;
    min?: number;
    step?: number;
};

function Field({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    required = false,
    min,
    step,
}: FieldProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-gray-500">
                {label}
                {required ? " *" : ""}
            </span>
            <input
                value={value}
                type={type}
                min={min}
                step={step}
                required={required}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none ring-black/10 transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring placeholder:text-gray-400"
            />
        </label>
    );
}

type SelectFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
    required?: boolean;
};

function SelectField({ label, value, onChange, options, required = false }: SelectFieldProps) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-gray-500">
                {label}
                {required ? " *" : ""}
            </span>
            <select
                value={value}
                required={required}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none ring-black/10 transition-all hover:bg-white hover:border-black/30 hover:shadow-sm focus:border-black/50 focus:bg-white focus:shadow-sm focus:ring"
            >
                <option value="" disabled>
                    Select {label}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
