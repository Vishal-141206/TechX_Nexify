"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

const comparison = [
    { metric: "Risk Score", carA: "63 / 100", carB: "39 / 100" },
    { metric: "Fraud Flags", carA: "2 warnings", carB: "No critical flags" },
    { metric: "Damage Severity", carA: "Moderate", carB: "Low" },
    { metric: "Maintenance Range", carA: "INR 20k - 60k", carB: "INR 12k - 28k" },
];

export default function ComparePage() {
    const router = useRouter();
    
    return (
        <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
            <button 
                onClick={() => router.back()}
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2 text-sm text-black transition hover:bg-black/5"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <h1 className="section-title text-3xl font-semibold text-black">Compare Cars</h1>
            <p className="mt-2 text-sm text-gray-500">Evaluate multiple used-car options with side-by-side AI insights.</p>

            <section className="mt-6 grid gap-5 md:grid-cols-2">
                <article className="glass rounded-2xl p-5">
                    <h2 className="text-xl font-semibold text-black">Car A • Hyundai Creta 2019</h2>
                    <p className="mt-2 text-sm text-gray-500">High utility, moderate risk profile, suspicious odometer jump.</p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-amber-700">
                        <XCircle size={16} /> Not recommended without negotiated price and inspection.
                    </p>
                </article>

                <article className="glass rounded-2xl p-5">
                    <h2 className="text-xl font-semibold text-black">Car B • Kia Seltos 2020</h2>
                    <p className="mt-2 text-sm text-gray-500">Balanced history and lower projected cost burden.</p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 size={16} /> Recommended shortlist candidate.
                    </p>
                </article>
            </section>

            {/* <section className="glass mt-6 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-black">Comparison Matrix</h3>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-sm">
                        <thead className="text-gray-400">
                            <tr>
                                <th className="py-2">Metric</th>
                                <th className="py-2">Car A</th>
                                <th className="py-2">Car B</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((row) => (
                                <tr key={row.metric} className="border-t border-black/10">
                                    <td className="py-3 text-black">{row.metric}</td>
                                    <td className="py-3 text-gray-500">{row.carA}</td>
                                    <td className="py-3 text-gray-700">{row.carB}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section> */}
        </main>
    );
}
