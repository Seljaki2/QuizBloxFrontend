import type { Session } from "react-router-dom";
import { closeSocket, initSocket, socket, type quizblox } from "./socketio";
import type { AppUser, GuestUser } from "./types";
import { message } from "antd";

export let session: session | null = null;
export let users: Array<AppUser | GuestUser> = [];
export let status: sessionStatus = "closed";
export let questionIndex: number = -1;

export type sessionStatus = "waiting" | "in-progress" | "finished" | "closed";

export type session = {
    session: Session | string;
    joinCode: string | null;
    quiz: any;
}

export async function connectToSession(joinCode: string, username?: string): Promise<session> {
    return new Promise(async (resolve, reject) => {
        await initSocket(() => {
            if (!socket) {
                return reject("Socket not initialized");
            }
            socket.on("player-joined", (user: AppUser | GuestUser, currentUsers: Array<AppUser | GuestUser>) => {
                const displayName = 'guestUsername' in user ? user.guestUsername : user.username;
                message.success(`${displayName} se je pridružil/a kvizu.`);
                users = currentUsers;
            });
            socket.on("player-disconnected", (user: AppUser | GuestUser, currentUsers: Array<AppUser | GuestUser>) => {
                const displayName = 'guestUsername' in user ? user.guestUsername : user.username;
                message.warning(`${displayName} se je odjavil/a iz kviza.`);
                users = currentUsers;
            });
            socket.on("disconnect", (reason) => {
                console.warn("⚠️ Disconnected from server:", reason);
                status = "closed";
                session = null;
                users = [];
            });
            socket.on("next-question", (index: number) => {
                questionIndex = index;
            });

            socket.emit("join-session", { joinCode, clientType: "PLAYER" }, (response: any) => {
                if (response.joined == false) {
                    return reject(new Error("Failed to join session: "));
                }

                const sessionData: session = {
                    session: "User Session",
                    joinCode: null,
                    quiz: response.quiz,
                };
                session = sessionData;
                users = response.players;
                status = "waiting";
                console.log("Connected to session:", sessionData);
                resolve(sessionData);
            });
        }, username);
    });
}

export async function createSession(quizId: quizblox): Promise<session> {
    if (session) {
        return new Promise(async (resolve) => {
            resolve(session!);
        });
    }

    return new Promise(async (resolve, reject) => {
        await initSocket(() => {
            if (!socket) {
                return reject("Socket not initialized");
            }

            socket.on("player-joined", (user: AppUser | GuestUser, currentUsers: Array<AppUser | GuestUser>) => {
                const displayName = 'guestUsername' in user ? user.guestUsername : user.username;
                message.success(`${displayName} se je pridružil/a kvizu.`);
                users = currentUsers;
            });
            socket.on("player-disconnected", (user: AppUser | GuestUser, currentUsers: Array<AppUser | GuestUser>) => {
                const displayName = 'guestUsername' in user ? user.guestUsername : user.username;
                message.warning(`${displayName} se je odjavil/a iz kviza.`);
                users = currentUsers;
            });
            socket.on("next-question", (index: number) => {
                questionIndex = index;
            });

            socket.emit("create-session", quizId, (response: any) => {
                console.log("Creating session");
                if (response.error) {
                    return reject(response.error);
                }

                const sessionData: session = {
                    session: response.session,
                    joinCode: response.joinCode,
                    quiz: response.quiz,
                };
                console.log("Session created:", sessionData);
                session = sessionData;
                status = "waiting";
                resolve(sessionData);
            });
        });
    });
}

export async function closeSession() {
    if (!session) return;
    session = null;
    users = [];
    status = "closed";
    closeSocket();
}

export async function cancelSession() {
    if (!session) return;
    socket?.emit("close-session", ((response: any) => {
        if (response.error) {
            console.error("Error closing session:", response.error);
        }
    }));
    session = null;
    users = [];
    status = "closed";
    closeSocket();
}

export async function kickPlayer(playerId: string) {
    if (!session) return;
    socket?.emit("kick-player", playerId, (response: any) => {
        if (response.error) {
            console.error("Error kicking player:", response.error);
        }
    });
}

export async function startQuiz() {
    if (!session) return;
    socket?.emit("start-quiz", (response: any) => {
        if (response.error) {
            console.error("Error starting quiz:", response.error);
        }
    });
}