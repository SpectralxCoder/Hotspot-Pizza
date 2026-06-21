import axios from "axios";

export const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}

export async function adminLogin(username, password) {
    const res = await api.post("/admin/login", { username, password });
    return res.data;
}

export async function verifyAdmin(token) {
    const res = await api.get("/admin/verify", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
