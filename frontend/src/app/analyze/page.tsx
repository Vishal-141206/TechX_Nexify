"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

type AnalyzeResponse = {
    price_range: string;
    risk_score: number;
    fraud_detected: boolean;
    hidden_damage?: boolean;
    data_confidence: string;
    recommendation: string;
    reasons: string[];
    verification?: {
        status: "Verified" | "Mismatch";
        details: {
            owner_count?: number | null;
            registration_year?: number | null;
            fuel_type?: string | null;
        };
    };
    ai_advice?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function AnalyzePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        model: "",
        year: "",
        mileage_kmpl: "",
        engine_cc: "",
        owner_count: "",
        fuel_type: "",
        transmission: "",
        vehicle_number: "",
    });

    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    useEffect(() => {
        return () => {
            previews.forEach((src) => URL.revokeObjectURL(src));
        };
    }, [previews]);

    const onRunAnalysis = async () => {
        if (!formData.year || !formData.mileage_kmpl || !formData.engine_cc || !formData.owner_count || !formData.fuel_type || !formData.transmission) {
            setError("Please fill all required fields before running analysis.");
            return;
        }

        setError(null);
        setAnalysis(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: formData.year,
                    mileage_kmpl: formData.mileage_kmpl,
                    engine_cc: formData.engine_cc,
                    owner_count: formData.owner_count,
                    fuel_type: formData.fuel_type,
                    transmission: formData.transmission,
                    vehicle_number: formData.vehicle_number || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Backend returned an error.");
            }

            const data: AnalyzeResponse = await response.json();
            setAnalysis(data);
        } catch {
            setError("Unable to complete analysis right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="glass rounded-3xl p-6">
                    <h1 className="section-title text-3xl font-semibold text-black">Analyze Car</h1>
                    <p className="mt-1 text-sm text-gray-500">Upload details and images to run the CarSure AI pipeline.</p>

                    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Model" placeholder="e.g. Hyundai Creta SX" value={formData.model} onChange={(value) => setFormData((prev) => ({ ...prev, model: value }))} />
                            <Field label="Vehicle Number" placeholder="e.g. MH12AB1234 (optional)" value={formData.vehicle_number} onChange={(value) => setFormData((prev) => ({ ...prev, vehicle_number: value }))} />
                            <Field label="Year *" placeholder="e.g. 2019" value={formData.year} onChange={(value) => setFormData((prev) => ({ ...prev, year: value }))} />
                            <Field label="Mileage (kmpl) *" placeholder="e.g. 18.5" value={formData.mileage_kmpl} onChange={(value) => setFormData((prev) => ({ ...prev, mileage_kmpl: value }))} />
                            <Field label="Engine CC *" placeholder="e.g. 1497" value={formData.engine_cc} onChange={(value) => setFormData((prev) => ({ ...prev, engine_cc: value }))} />
                            <Field label="Owner Count *" placeholder="e.g. 2" value={formData.owner_count} onChange={(value) => setFormData((prev) => ({ ...prev, owner_count: value }))} />
                            <Field label="Fuel Type *" placeholder="Petrol / Diesel / Electric" value={formData.fuel_type} onChange={(value) => setFormData((prev) => ({ ...prev, fuel_type: value }))} />
                            <Field label="Transmission *" placeholder="Manual / Automatic" value={formData.transmission} onChange={(value) => setFormData((prev) => ({ ...prev, transmission: value }))} />
                        </div>

                        <label className="block rounded-2xl border border-dashed border-black/20 bg-black/[0.02] p-6 text-center hover:bg-black/[0.04]">
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                            />
                            <UploadCloud className="mx-auto mb-3 text-gray-500" />
                            <p className="font-semibold text-black">Drag and drop images or click to upload</p>
                            <p className="text-sm text-gray-400">Front, rear, sides, dashboard, tires, and engine bay recommended</p>
                        </label>

                        {previews.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                                {previews.map((src, index) => (
                                    <Image
                                        key={src}
                                        src={src}
                                        alt={`Upload preview ${index + 1}`}
                                        width={240}
                                        height={140}
                                        className="h-24 w-full rounded-lg object-cover"
                                        unoptimized
                                    />
                                ))}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            onClick={onRunAnalysis}
                            disabled={isLoading}
                            className="rounded-xl bg-black px-6 py-3 font-semibold text-white"
                        >
                            {isLoading ? "Running..." : "Run AI Analysis"}
                        </button>
                        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
                    </form>
                </section>

                <section className="glass relative overflow-hidden rounded-3xl p-6">
                    <h2 className="section-title text-2xl font-semibold text-black">Live Analysis Status</h2>
                    <p className="mt-1 text-sm text-gray-500">Realtime diagnostic stream from CarSure Vision + Fraud Engine</p>

                    <div className="relative mt-6 h-72 rounded-2xl border border-black/10 bg-gray-50">
                        {isLoading ? (
                            <div className="scan-line absolute inset-0" />
                        ) : null}
                        <div className="absolute inset-0 grid place-items-center text-center">
                            <motion.div
                                animate={isLoading ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                transition={{ repeat: isLoading ? Infinity : 0, duration: 1.3 }}
                            >
                                <p className="text-xl font-semibold text-black">{isLoading ? "Analyzing vehicle..." : "Ready for analysis"}</p>
                                <p className="mt-2 text-sm text-gray-400">
                                    {isLoading
                                        ? "Scanning body panel geometry, service records, and odometer patterns"
                                        : "Upload data and click Run AI Analysis to start"}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>

            {analysis ? (
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    <section className="glass rounded-3xl p-6">
                        <h3 className="section-title text-xl font-semibold text-black">📊 Analysis Card</h3>
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p><span className="font-semibold text-black">Price range:</span> {analysis.price_range}</p>
                            <p><span className="font-semibold text-black">Risk score:</span> {analysis.risk_score}/10</p>
                            <p><span className="font-semibold text-black">Recommendation:</span> {analysis.recommendation}</p>
                        </div>
                    </section>

                    <section className="glass rounded-3xl p-6">
                        <h3 className="section-title text-xl font-semibold text-black">🔍 Verification Card</h3>
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            <p><span className="font-semibold text-black">Owner info:</span> {analysis.verification?.details?.owner_count ?? "N/A"}</p>
                            <p><span className="font-semibold text-black">Registration year:</span> {analysis.verification?.details?.registration_year ?? "N/A"}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-black">Status:</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${analysis.verification?.status === "Mismatch" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                    {analysis.verification?.status ?? "Verified"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="glass rounded-3xl p-6">
                        <h3 className="section-title text-xl font-semibold text-black">🤖 AI Advisor Card</h3>
                        <div className="mt-4 rounded-2xl bg-black/5 p-4 text-sm leading-6 text-gray-700">
                            {analysis.ai_advice || "Advisor response unavailable. Please retry."}
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}

function Field({
    label,
    placeholder,
    value,
    onChange,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-gray-500">{label}</span>
            <input
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none ring-black/10 transition placeholder:text-gray-400 focus:ring"
            />
        </label>
    );
}
