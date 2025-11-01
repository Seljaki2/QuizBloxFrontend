import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { WS_URL } from "../api";
import type { AppUser, GuestUser, Question } from "./types";

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
    "next-question": ({ question, index }: { question: Question, index: number }) => void;
};

type ClientToServerEvents = {
    message: (msg: string) => void;
    "join-session": (joinData: joinPacket, callback: (response: any) => void) => void;
    "create-session": (quizId: quizblox, callback: (response: any) => void) => void;
    "close-session": (callback: (response: any) => void) => void;
    "kick-player": (playerId: string, callback: (response: any) => void) => void;
    "start-quiz": (callback: (response: any) => void) => void;
    "next-question": (callback: (response: any) => void) => void;
    "answer-question": ({ questionId, answerId, userEntry }: { questionId: string, answerId: string | undefined, userEntry: string }, callback?: (response: any) => void) => void;
};

export let guestId: string | null = null;

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export async function initSocket(connectCallback: () => void, guestUsername?: string) {
    console.log("📡 initSocket called with url:", WS_URL);

    guestId = crypto.randomUUID();
    console.log("🔌 Socket instance state:", socket);
    if (socket) {
        console.log("⚡ Socket already initialized with id:", socket.id);
        return socket;
    }

    const serverUrl = WS_URL ?? window.location.origin;
    socket = io(serverUrl, {
        autoConnect: false,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
    });
    console.log("🔌 Socket instance created:", socket);
    if (guestUsername) {
        console.log("👤 Initializing socket for guest user:", guestUsername);
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
            console.log("⚠️ No user signed in, socket will connect without token");
        }
    }
    socket.on("connect", () => {
        console.log("✅ Socket connected! ID:", socket?.id);
    });

    socket.on("ready", () => {
        console.log("🚀 Socket is ready for communication");
        connectCallback();
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        guestId = null;
    });

    socket.on("message", (msg: string) => {
        console.log("💬 Received message from server:", msg);
    });

    return socket;
}

export function on<E extends keyof ServerToClientEvents>(
    event: E,
    handler: (...args: any[]) => void
) {
    console.log("🔔 Listening for event:", event);
    socket?.on(event as any, handler as any);
}

export function off<E extends keyof ServerToClientEvents>(
    event: E,
    handler?: (...args: any[]) => void
) {
    console.log("🚫 Removing listener for event:", event);
    if (handler) socket?.off(event as any, handler as any);
    else socket?.off(event as any);
}

export function send<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
) {
    console.log("📤 Sending event:", event, "with args:", args);
    socket?.emit(event as any, ...args as any);
}

export function closeSocket() {
    console.log("🔒 Closing socket...");
    socket?.close();
    socket = null;
}

export function getSocket() {
    console.log("🕵️ Getting socket instance:", socket);
    return socket;
}