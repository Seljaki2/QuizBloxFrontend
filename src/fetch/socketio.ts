import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { WS_URL } from "../api";

type ServerToClientEvents = {
    message: (msg: string) => void;
    ping: (data: { id: string }) => void;
};

type ClientToServerEvents = {
    message: (msg: string) => void;
    pong: (data: { id: string }) => void;
};

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export async function initSocket(url?: string) {
    console.log("📡 initSocket called with url:", url);

    if (socket) {
        console.log("⚡ Socket already initialized with id:", socket.id);
        return socket;
    }

    const serverUrl = url ?? window.location.origin;
    socket = io(serverUrl, {
        autoConnect: true,
        transports: ["websocket", "polling"],
    });

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

        if (socket.connected) {
            console.log("🔄 Reconnecting socket with token...");
            socket.disconnect();
            socket.connect();
        }
    } else {
        console.log("⚠️ No user signed in, socket will connect without token");
    }

    socket.on("connect", () => {
        console.log("✅ Socket connected! ID:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
    });

    socket.on("ping", (data: { id: string }) => {
        console.log("📥 Received ping:", data);
        socket?.emit("pong", { id: data.id });
        console.log("📤 Sent pong:", { id: data.id });
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

initSocket(WS_URL).then(() => console.log("🚀 Socket initialization complete"));
send('message', "{ msg: 'Hello from client!' }");
