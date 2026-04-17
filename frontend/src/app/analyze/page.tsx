"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function AnalyzePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    useEffect(() => {
        return () => {
            previews.forEach((src) => URL.revokeObjectURL(src));
        };
    }, [previews]);

    const onRunAnalysis = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2600);
    };

    return (
        <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="glass rounded-3xl p-6">
                    <h1 className="section-title text-3xl font-semibold text-black">Analyze Car</h1>
                    <p className="mt-1 text-sm text-gray-500">Upload details and images to run the CarSure AI pipeline.</p>

                    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Model" placeholder="e.g. Hyundai Creta SX" />
                            <Field label="Year" placeholder="e.g. 2019" />
                            <Field label="Kilometers Driven" placeholder="e.g. 68200" />
                            <Field label="Fuel Type" placeholder="Diesel / Petrol / EV" />
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
                            className="rounded-xl bg-black px-6 py-3 font-semibold text-white"
                        >
                            Run AI Analysis
                        </button>
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
        </main>
    );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm text-gray-500">{label}</span>
            <input
                placeholder={placeholder}
                className="w-full rounded-xl border border-black/15 bg-gray-50 px-4 py-3 text-sm text-black outline-none ring-black/10 transition placeholder:text-gray-400 focus:ring"
            />
        </label>
    );
}
