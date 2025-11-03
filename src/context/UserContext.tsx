import React, { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../fetch/firebase";
import { API_URL } from "../api";
import type { AppUser } from "../fetch/types";



type UserContextType = {
    user: AppUser | null;
    signOut: () => Promise<void>;
    getToken: () => Promise<string>;
    refreshUser: () => Promise<void>;
};

const defaultContext: UserContextType = {
    user: null,
    signOut: async () => { },
    getToken: async (): Promise<string> => { throw new Error('No bearer token'); },
    refreshUser: async () => { },
};

export const UserContext = createContext<UserContextType>(defaultContext);


export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);

    const getToken = useCallback(async () => {
        const user = auth.currentUser
        if (user)
            return user.getIdToken()
        throw new Error('No bearer token')
    }, []);

    const getUserProfile = useCallback(async () => {
        const token = await getToken();

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
            isAdmin: data.isAdmin,
        };

        return appUser;
    }, [getToken]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(await getUserProfile())
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribe()
        };
    }, [getUserProfile]);

    const signOut = useCallback(async () => {
        const auth = getAuth();
        await firebaseSignOut(auth);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const appUser = await getUserProfile();
        setUser(appUser);
    }, [getUserProfile]);

    return <UserContext.Provider value={{ user, signOut, getToken, refreshUser }}>{children}</UserContext.Provider>;
};
