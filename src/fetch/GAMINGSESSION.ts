import { initSocket, type quizblox } from "./socketio";

export type sessionStatus = "waiting" | "in-progress" | "finished";

export type session ={
    session: any;
    joinCode: string;
    quiz: any;
}




export async function connectToSession(joinCode: string): Promise<session> {
    initSocket();

    return new Promise(async (resolve, reject) => {
        const socket = await initSocket();

        if (!socket) {
            return reject("Socket not initialized");
        }

        socket.emit("join-session",  joinCode , "PLAYER", (response: any) => {
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
});
}

export async function createSession(quizId: quizblox): Promise<session> {
    initSocket();

    return new Promise(async (resolve, reject) => {
        const socket = await initSocket();

        if (!socket) {
            return reject("Socket not initialized");
        }

        socket.emit("create-session",  quizId , (response: any) => {
            if (response.error) {
                return reject(response.error);
            }

            const sessionData: session = {
                session: response.session,
                joinCode: response.joinCode,
                quiz: response.quiz,
            };

            resolve(sessionData);
            console.log("Session created:", sessionData);
    });
});
}