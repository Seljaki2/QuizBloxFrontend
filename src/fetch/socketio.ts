import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { WS_URL } from "../api";
import type { AppUser, GuestUser } from "./types";

export type clientType = "PLAYER" | "SPECTATOR";

export type quizblox = {
    quizId: string;
}

export type joinPacket = {
    joinCode: string;
    clientType: clientType;
}

type ServerToClientEvents = {
    message: (msg: string) => void;
    "player-joined": (user: AppUser | GuestUser, users: Array<AppUser | GuestUser>) => void;
    "player-disconnected": (user: AppUser | GuestUser, users: Array<AppUser | GuestUser>) => void;
    "ready": () => void;
    "next-question": (index: number) => void;
    "finish-question": (users: Array<AppUser | GuestUser>) => void;
};

type ClientToServerEvents = {
    message: (msg: string) => void;
    "join-session": (joinData: joinPacket, callback: (response: any) => void) => void;
    "create-session": (quizId: quizblox, callback: (response: any) => void) => void;
    "close-session": (callback: (response: any) => void) => void;
    "kick-player": (playerId: string, callback: (response: any) => void) => void;
    "start-quiz": (callback: (response: any) => void) => void;
    "next-question": (callback: (response: any) => void) => void;
    "answer-question": ({ questionId, answerId, userEntry, answerTime, isCustomCorrect, bonus }: { questionId: string, answerId: string | null, userEntry: string | undefined, answerTime: number, isCustomCorrect: string | undefined, bonus?: number }, callback?: (response: any) => void) => void;
    "time-elapsed-question": (hostId: string | undefined, callback?: (response: any) => void) => void;
};

export let guestId: string | null = null;

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export async function initSocket(connectCallback: () => void, guestUsername?: string) {
    guestId = crypto.randomUUID();
    if (socket) {
        return socket;
    }

    const serverUrl = WS_URL ?? window.location.origin;
    socket = io(serverUrl, {
        autoConnect: false,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });
    if (guestUsername) {
        console.log("👤 Initializing socket for guest user");
        socket.auth = { guestUsername: `${guestUsername}`, guestId: `${guestId}` };
        socket.connect();

        if (socket.connected) {
            console.log("🔄 Reconnecting socket with guest credentials...");
            socket.disconnect();
            socket.auth = { guestUsername: `${guestUsername}`, guestId: `${guestId}` };
            socket.connect();
        }
    } else {
        console.log("👤 Initializing socket for authenticated user");
        const user = await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });

        let token: string | null = null;
        if (user) {
            token = await (user as any).getIdToken();
            socket.auth = { token: `${token}` };
            socket.connect();

            if (socket.connected) {
                console.log("🔄 Reconnecting socket with token...");
                socket.disconnect();
                socket.auth = { token: `${token}` };
                socket.connect();
            }
        } else {
        }
    }

    socket.on("ready", () => {
        connectCallback();
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        guestId = null;
    });

    socket.on("message", (msg: string) => {
        console.log("💬 Received message from server:", msg);
    });

    return socket;
}


export function closeSocket() {
    console.log("🔒 Closing socket...");
    socket?.close();
    socket = null;
}

export function getSocket() {
    return socket;
}