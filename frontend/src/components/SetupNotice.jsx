import React from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { AlertTriangle } from "lucide-react";

export default function SetupNotice() {
    if (isSupabaseConfigured) return null;
    return (
        <div
            className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-start gap-3"
            data-testid="setup-notice"
        >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
                <p className="font-semibold">Supabase is not configured</p>
                <p className="text-amber-800">
                    Set <code className="bg-amber-100 px-1 rounded">REACT_APP_SUPABASE_URL</code> and{" "}
                    <code className="bg-amber-100 px-1 rounded">REACT_APP_SUPABASE_ANON_KEY</code> in frontend/.env, then run the SQL in <code>/app/database/schema.sql</code>.
                </p>
            </div>
        </div>
    );
}
