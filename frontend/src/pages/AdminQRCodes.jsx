import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

const TABLES = Array.from({ length: 20 }, (_, i) => i + 1);

export default function AdminQRCodes() {
    const baseUrl = window.location.origin;

    const handlePrint = () => window.print();

    return (
        <div className="space-y-6" data-testid="admin-qrcodes-page">
            <div className="flex items-end justify-between flex-wrap gap-4 no-print">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl">QR Code Manager</h1>
                    <p className="text-sm text-muted-foreground">Printable QR codes for Tables 1–20 and Home Delivery.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full font-medium hover:bg-brand-700 transition-all"
                    data-testid="print-all-qr"
                >
                    <Printer className="w-4 h-4" />
                    Print All
                </button>
            </div>

            <div className="text-xs text-muted-foreground no-print">
                Base URL: <code className="bg-white px-2 py-0.5 rounded border border-warmBeige">{baseUrl}</code>
            </div>

            <div id="qr-print-area" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <QRCard label="Home Delivery" url={`${baseUrl}/menu?mode=delivery`} testid="qr-delivery" highlight />
                {TABLES.map((n) => (
                    <QRCard
                        key={n}
                        label={`Table ${n}`}
                        url={`${baseUrl}/menu?table=${n}`}
                        testid={`qr-table-${n}`}
                    />
                ))}
            </div>
        </div>
    );
}

function QRCard({ label, url, testid, highlight }) {
    return (
        <div
            className={`bg-white rounded-2xl p-4 border border-warmBeige shadow-soft text-center break-inside-avoid ${
                highlight ? "ring-2 ring-brand/30" : ""
            }`}
            data-testid={testid}
        >
            <div className="flex items-center justify-center bg-cream rounded-xl p-3">
                <QRCodeSVG value={url} size={140} level="M" includeMargin />
            </div>
            <p className={`mt-3 font-display text-lg ${highlight ? "text-brand" : ""}`}>{label}</p>
            <p className="text-[10px] text-muted-foreground break-all mt-1">{url}</p>
        </div>
    );
}
