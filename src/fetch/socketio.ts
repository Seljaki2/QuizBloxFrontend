import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { WS_URL } from "../api";

export type clientType="PLAYER" | "SPECTATOR";

export type quizblox={
    quizId: string;
}

export type joinPacket={
    joinCode: string;
    clientType: clientType;
}

type ServerToClientEvents = {
    message: (msg: string) => void;
};

type ClientToServerEvents = {
    message: (msg: string) => void;
    "join-session": (joinData: joinPacket, callback: (response: any) => void) => void;
    "create-session": (quizId: quizblox, callback: (response: any) => void) => void;
};

export let guestId: string | null = null;

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export async function initSocket(callback: () => void, guestUsername?: string) {
    console.log("📡 initSocket called with url:", WS_URL);

    guestId = crypto.randomUUID();

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

    if (guestUsername) {
        console.log("👤 Initializing socket for guest user:", guestUsername);
        socket.auth = { guestUsername: `${guestUsername}`, guestId: `${guestId}` };
        socket.connect();
        
        if (socket.connected) {
            console.log("🔄 Reconnecting socket with guest credentials...");
            socket.disconnect();
            socket.connect();
        }
    }else{
    console.log("⏳ Waiting for Firebase auth...");
    const user = await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });

    let token: string | null = null;
    if (user) {
        token = await (user as any).getIdToken();
        console.log("🔑 Firebase token obtained:", token);
        socket.auth = { token: `${token}` };
        socket.connect();

        if (socket.connected) {
            console.log("🔄 Reconnecting socket with token...");
            socket.disconnect();
            socket.connect();
        }
    } else {
        console.log("⚠️ No user signed in, socket will connect without token");
    }
}
    socket.on("connect", () => {
        console.log("✅ Socket connected! ID:", socket?.id);
        callback();
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
    handler: ServerToClientEvents[E]
) {
    console.log("🔔 Listening for event:", event);
    socket?.on(event, handler);
}

export function off<E extends keyof ServerToClientEvents>(
    event: E,
    handler?: ServerToClientEvents[E]
) {
    console.log("🚫 Removing listener for event:", event);
    if (handler) socket?.off(event, handler);
    else socket?.off(event);
}

export function send<E extends keyof ClientToServerEvents>(
    event: E,
    payload?: Parameters<ClientToServerEvents[E]>[0]
) {
    console.log("📤 Sending event:", event, "with payload:", payload);
    socket?.emit(event, payload);
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