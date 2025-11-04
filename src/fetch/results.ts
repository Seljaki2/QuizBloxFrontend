import { API_URL } from "../api";
import { auth } from "./firebase";

export async function fetchResults() {
    const token = await auth.currentUser?.getIdToken();
    
    const res = await fetch(`${API_URL}/sessions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });
    if (!res.ok) throw new Error("Failed to fetch results");
    const data = await res.json();
    return data;
}