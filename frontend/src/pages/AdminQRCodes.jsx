import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function AdminQRCodes() {
    const { settings } = useSettings();
    const numTables = settings?.num_tables || 20;
    const tables = Array.from({ length: numTables }, (_, i) => i + 1);
    const baseUrl = window.location.origin;

    const handlePrintAll = () => window.print();

    const handlePrintOne = (label, url) => {
        const w = window.open("", "_blank", "width=400,height=600");
        if (!w) return;
        w.document.write(`
            <html><head><title>${label} — QR</title>
            <style>body{font-family:system-ui,sans-serif;margin:40px;text-align:center}
            .card{border:1px dashed #999;padding:24px;border-radius:16px;display:inline-block}
            .label{font-size:24px;font-weight:800;margin-top:16px}
            .url{font-size:10px;color:#666;margin-top:6px;word-break:break-all}</style>
            </head><body>
            <div class="card">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}" />
                <div class="label">${label}</div>
                <div class="url">${url}</div>
            </div>
            <script>window.onload=()=>{setTimeout(()=>{window.print();window.close()},300)}</script>
            </body></html>`);
        w.document.close();
    };

    return (
        <div className="space-y-6" data-testid="admin-qrcodes-page">
            <div className="flex items-end justify-between flex-wrap gap-4 no-print">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold">QR Code Manager</h1>
                    <p className="text-sm text-muted-foreground">{numTables} tables · Adjust count in Settings.</p>
                </div>
                <button onClick={handlePrintAll} className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full font-semibold hover:bg-brand-700" data-testid="print-all-qr">
                    <Printer className="w-4 h-4" /> Print All
                </button>
            </div>

            <div className="text-xs text-muted-foreground no-print">
                Base URL: <code className="bg-white px-2 py-0.5 rounded border border-warmBeige">{baseUrl}</code>
            </div>

            <div id="qr-print-area" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <QRCard label="Home Delivery" url={`${baseUrl}/menu?mode=delivery`} testid="qr-delivery" highlight onPrint={handlePrintOne} />
                {tables.map((n) => (
                    <QRCard key={n} label={`Table ${n}`} url={`${baseUrl}/menu?table=${n}`} testid={`qr-table-${n}`} onPrint={handlePrintOne} />
                ))}
            </div>
        </div>
    );
}

function QRCard({ label, url, testid, highlight, onPrint }) {
    return (
        <div className={`bg-white rounded-2xl p-4 shadow-soft text-center break-inside-avoid ${highlight ? "ring-2 ring-brand/30" : ""}`} data-testid={testid}>
            <div className="flex items-center justify-center bg-cream rounded-xl p-3">
                <QRCodeSVG value={url} size={140} level="M" includeMargin />
            </div>
            <p className={`mt-3 font-display text-lg font-extrabold ${highlight ? "text-brand" : ""}`}>{label}</p>
            <p className="text-[10px] text-muted-foreground break-all mt-1">{url}</p>
            <button onClick={() => onPrint(label, url)} className="mt-3 inline-flex items-center gap-1.5 bg-cream text-foreground px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-warmBeige no-print" data-testid={`${testid}-print`}>
                <Printer className="w-3.5 h-3.5" /> Print
            </button>
        </div>
    );
}
