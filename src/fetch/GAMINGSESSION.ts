import { initSocket, type quizblox } from "./socketio";

export type sessionStatus = "waiting" | "in-progress" | "finished";

export type session = {
    session: any;
    joinCode: string;
    quiz: any;
}




export async function connectToSession(joinCode: string, username?: string): Promise<session> {
    return new Promise(async (resolve, reject) => {
        const socket = await initSocket( () => {
            if (!socket) {
                return reject("Socket not initialized");
            }

        socket.emit("join-session", { joinCode, clientType: "PLAYER" }, (response: any) => {
            if (response.error) {
                return reject(response.error);
            }

            const sessionData: session = {
                session: response.session,
                joinCode: response.joinCode,
                quiz: response.quiz,
            };

            resolve(sessionData);
        });
    }, username);
});
}

export async function createSession(quizId: quizblox): Promise<session> {
    return new Promise(async (resolve, reject) => {
        const socket = await initSocket(() => {
            if (!socket) {
                return reject("Socket not initialized");
            }

            socket.emit("create-session", quizId, (response: any) => {
                if (response.error) {
                    return reject(response.error);
                }

                const sessionData: session = {
                    session: response.session,
                    joinCode: response.joinCode,
                    quiz: response.quiz,
                };
                console.log("Session created:", sessionData);
                resolve(sessionData);
            });
        });
    });
}