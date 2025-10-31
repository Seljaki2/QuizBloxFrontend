import styles from './QuizLobby.module.css'
import { useEffect, useState, useRef } from 'react';
import { Button, Flex, List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { cancelSession, closeSession, createSession, kickPlayer, session, startQuiz, users } from '../../fetch/GAMINGSESSION';
import type { AppUser, GuestUser } from '../../fetch/types';
import { closeSocket, socket } from '../../fetch/socketio';
import { useNavigate } from 'react-router-dom';

export default function QuizLobby() {
    const navigate = useNavigate();
    const quizId = sessionStorage.getItem('quizId');
    const [sessionState, setSessionState] = useState<any>(null);
    const [usersState, setUsersState] = useState<Array<any>>([]);


    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const handleCancel = async () => {
        try {
            if (typeof session!.session === "string") {
                await closeSession();
                navigate('/');
            } else {
                await cancelSession();
                window.close();
            }
        } catch (error) {
            console.error("Error closing session:", error);
        }
    };

    const loadMoreData = () => {
        if (loading) return;
        setLoading(true);

        const nextItems = usersState.slice((page - 1) * pageSize, page * pageSize);

        setTimeout(() => {
            setUsersState(prev => [...prev, ...nextItems]);
            setPage(prev => prev + 1);
            setLoading(false);
        },);
    };

    const hasLoaded = useRef(false);
    useEffect(() => {
        const handleUnload = () => {
            closeSession().catch((err) => console.error("Failed to close session:", err));
        };

        const handlePlayerConnection = (user: AppUser | GuestUser, users: Array<AppUser | GuestUser>) => {
            console.log("Player connection changed:", user, users);
            setUsersState(users);
        };


        window.addEventListener("beforeunload", handleUnload);

        const init = async () => {
            const sessionData = await createSession({ quizId: quizId! });
            console.log("Session data:", sessionData);
            setSessionState(sessionData);
            sessionStorage.removeItem('quizId');
            console.log(socket);
            if (socket) {
                socket.on("player-joined", ({ user, users }) => {
                    console.log("Player joined socket:", user, users);
                    handlePlayerConnection(user, users);
                });

                socket.on("player-disconnected", ({ user, users }) => {
                    console.log("Player disconnected socket:", user, users);
                    handlePlayerConnection(user, users);
                });

                socket.on("next-question", ({ question, index }: { question: any, index: number }) => {
                    console.log("Next question received:", question, index);
                    if (session?.session == "User Session") {
                        navigate('/answering');
                    } else {
                        navigate('/quiz-host');
                    }
                });
            }
        };

        if (!hasLoaded.current) {
            hasLoaded.current = true;
            if (!socket?.connected) {
                init();
            } else {
                console.log("Socket already connected", socket);
                setSessionState(session);
                setUsersState(users);

                socket.on("disconnect", () => {
                    closeSocket();
                    navigate('/');
                });

                    socket.on("player-joined", ({ user, users }) => {
                        console.log("Player joined socket:", user, users);
                        handlePlayerConnection(user, users);
                    });

                    socket.on("player-disconnected", ({ user, users }) => {
                        console.log("Player disconnected socket:", user, users);
                        handlePlayerConnection(user, users);
                    });

                    socket.on("next-question", ({ question, index }: { question: any, index: number }) => {
                        console.log("Next question received:", question, index);
                        if (session?.session == "User Session") {
                            navigate('/answering');
                        } else {
                            navigate('/quiz-host');
                        }
                    });
                
            }
            loadMoreData();
        }

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            socket?.off("player-joined");
        };
    }, []);

    return (
        <Flex className={styles.container} vertical gap="middle">
            {!(session?.session == "User Session") ? <h1>Koda za kviz: {sessionState?.joinCode}</h1> : <h1>Čakanje na igralce...</h1>}
            <div id="scrollableDiv" className={styles.scrollArea}>
                <InfiniteScroll
                    dataLength={usersState?.length}
                    next={loadMoreData}
                    hasMore={usersState?.length < usersState?.length}
                    scrollableTarget="scrollableDiv"
                    loader={<div>Čakanje na igralce...</div>}>
                    <List
                        dataSource={usersState}
                        renderItem={(item) => (
                            <List.Item key={item.id} style={{ padding: "5px 0px" }}>
                                {(item.username) ? <List.Item.Meta title={item.username} style={{ margin: "0px" }} /> : <List.Item.Meta title={item.guestUsername} style={{ margin: "0px" }} />}
                                {!(session?.session == "User Session") ? <Button className={styles.removeButton} onClick={(item.guestId) ? () => kickPlayer(item.guestId) : () => kickPlayer(item.id)}>Odstrani</Button> : null}
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>
            </div>
            {!(session?.session == "User Session") ? <Flex justify='center' style={{ width: "100%" }} gap="middle">
                {(usersState?.length > 0) ? <Button className={styles.buttons} onClick={() => startQuiz()}>Začni</Button> : null}
                <Button className={styles.buttons} type="primary" danger onClick={handleCancel}>Prekliči</Button>
            </Flex> : <Flex justify='center' style={{ width: "100%" }} gap="middle">
                <Button className={styles.buttons} type="primary" danger onClick={handleCancel}>Prekini Povezavo</Button>
            </Flex>}
        </Flex>
    );
}