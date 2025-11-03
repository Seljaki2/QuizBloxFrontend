import { closeSocket, initSocket, socket, type quizblox } from "./socketio";
import type { AppUser, GuestUser, Quiz, Session } from "./types";
export let session: sessionType | null = null;
export let users: Array<AppUser | GuestUser> = [];
export let status: sessionStatus = "closed";
export let questionIndex: number = -1;
export let guestUsername: string | null = null;

export type sessionStatus = "waiting" | "in-progress" | "finished" | "closed";

export type sessionType = {
    session: Session | string;
    joinCode: string | null;
    quiz: Quiz;
}

export async function connectToSession(joinCode: string, username?: string): Promise<sessionType> {
    if (username) guestUsername = username;
    return new Promise(async (resolve, reject) => {
        await initSocket(() => {
            if (!socket) {
                return reject("Socket not initialized");
            }
            socket.on("player-joined", ({ user, currentUsers }) => {
                users = currentUsers;
            });
            socket.on("player-disconnected", ({ user, currentUsers }) => {
                users = currentUsers;
            });
            socket.on("disconnect", (reason) => {
                console.warn("⚠️ Disconnected from server:", reason);
                guestUsername = null;
                status = "closed";
                session = null;
                users = [];
            });
            socket.on("next-question", (index: number) => {
                questionIndex = index;
            });
            socket.on("finish-question", (currentUsers: Array<AppUser | GuestUser>) => {
                users = currentUsers;
            });

            socket.emit("join-session", { joinCode, clientType: "PLAYER" }, (response: any) => {
                if (response.joined == false) {
                    return reject(new Error("Failed to join session: "));
                }

                const sessionData: sessionType = {
                    session: "User Session",
                    joinCode: null,
                    quiz: response.quiz,
                };
                session = sessionData;
                users = response.players;
                status = "waiting";
                resolve(sessionData);
            });
        }, username);
    });
}

export async function createSession(quizId: quizblox): Promise<sessionType> {
    if (session) {
        return new Promise(async (resolve, reject) => {
            resolve(session!);
        });
    }

    return new Promise(async (resolve, reject) => {
        await initSocket(() => {
            if (!socket) {
                return reject("Socket not initialized");
            }

            socket.on("player-joined", (user, currentUsers) => {
                users = currentUsers;
            });
            socket.on("player-disconnected", (user, currentUsers) => {
                users = currentUsers;
            });
            socket.on("next-question", (index: number) => {
                questionIndex = index;
            });

            socket.emit("create-session", quizId, (response: any) => {
                if (response.error) {
                    return reject(response.error);
                }

                const sessionData: sessionType = {
                    session: response.session,
                    joinCode: response.joinCode,
                    quiz: response.quiz,
                };
                session = sessionData;
                status = "waiting";
                resolve(sessionData);
            });
        });
    });
}

export async function closeSession() {
    if (!session) return;
    socket?.emit("close-session", ((response: any) => {
        if (response.error) {
            console.error("Error closing session:", response.error);
        }
        clearSession();
        closeSocket();
    }));
}

export async function clearSession() {
    session = null;
    users = [];
    status = "closed";
    questionIndex = -1;
    guestUsername = null;
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
    guestUsername = null;
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
        status = "in-progress"
    });
}

export async function finishQuiz() {
    if (!session) return;
    closeSocket();
    session = null;
    users = [];
    questionIndex = -1;
    status = "finished";
}