import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Locate, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet bundling quirk)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

function ClickHandler({ onPick }) {
    useMapEvents({
        click(e) {
            onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

function FlyTo({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo([center.lat, center.lng], 15, { duration: 0.6 });
    }, [center, map]);
    return null;
}

export default function MapPicker({ value, onChange, height = 280 }) {
    const [pos, setPos] = useState(value || DEFAULT);
    const [label, setLabel] = useState("");
    const debounceRef = useRef();

    useEffect(() => {
        if (value) setPos(value);
    }, [value]);

    const updatePos = (p) => {
        setPos(p);
        // Reverse geocode (free Nominatim, no API key)
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const r = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}&zoom=18&addressdetails=1`,
                    { headers: { "Accept-Language": "en" } }
                );
                const j = await r.json();
                const lbl = j.display_name || "";
                setLabel(lbl);
                onChange?.({ ...p, label: lbl });
            } catch {
                onChange?.(p);
            }
        }, 600);
    };

    const handleLocate = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (g) => updatePos({ lat: g.coords.latitude, lng: g.coords.longitude }),
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return (
        <div className="space-y-2" data-testid="map-picker">
            <div className="relative rounded-2xl overflow-hidden" style={{ height }}>
                <MapContainer
                    center={[pos.lat, pos.lng]}
                    zoom={14}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={[pos.lat, pos.lng]}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const ll = e.target.getLatLng();
                                updatePos({ lat: ll.lat, lng: ll.lng });
                            },
                        }}
                    />
                    <ClickHandler onPick={updatePos} />
                    <FlyTo center={pos} />
                </MapContainer>
                <button
                    type="button"
                    onClick={handleLocate}
                    className="absolute right-3 top-3 z-[1000] bg-white text-foreground px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft hover:bg-cream"
                    data-testid="use-my-location"
                >
                    <Locate className="w-3.5 h-3.5" />
                    Use my location
                </button>
            </div>
            <div className="text-xs text-muted-foreground inline-flex items-start gap-1.5" data-testid="map-label">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-brand shrink-0" />
                <span className="line-clamp-2">{label || "Click on the map or drag the pin to your address"}</span>
            </div>
        </div>
    );
}
