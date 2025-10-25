import React, { createContext, useEffect, useState, type ReactNode } from "react";
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../fetch/firebase";
import { API_URL } from "../api";

export type AppUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    isTeacher: boolean;
};

type UserContextType = {
    user: AppUser | null;
    signOut: () => Promise<void>;
    getToken: () => Promise<string>;
};

const defaultContext: UserContextType = {
    user: null,
    signOut: async () => { },
    getToken: async (): Promise<string> => { throw new Error('No bearer token'); },
};

export const UserContext = createContext<UserContextType>(defaultContext);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);

    async function getUserProfile() {
        const token = await getToken();
        console.log("Fetched token:", token);

        const res = await fetch(`${API_URL}/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Backend registration failed");
        const data = await res.json();
        const appUser: AppUser = {
            id: String(data.id),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            isTeacher: data.isTeacher,
        };

        return appUser;
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log(firebaseUser, "stuff")
            if (firebaseUser) {
                setUser(await getUserProfile())
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribe()
        };
    }, []);

    const signOut = async () => {
        const auth = getAuth();
        await firebaseSignOut(auth);
        setUser(null);
    };

    async function getToken() {
        const user = auth.currentUser
        if (user)
            return user.getIdToken()
        throw new Error('No bearer token')
    }

    return <UserContext.Provider value={{ user, signOut, getToken }}>{children}</UserContext.Provider>;
};
