import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { API_URL } from "../api";
import { auth } from "./firebase";


export async function registerUser(email: string, password: string, firstName: string, lastName: string, username: string, isTeacher: boolean) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, firstName, lastName, username, isTeacher }),
    });

    if (!res.ok) throw new Error("Backend registration failed");
    const data = await res.json();
    return { user: userCredential.user, backendData: data };
}

export async function loginUser(email: string, password: string, remember: boolean = false) {
    if (remember) {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
}
