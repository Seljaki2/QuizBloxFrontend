import styles from './QuizLobby.module.css'
import { useEffect, useState, useRef } from 'react';
import { Button, Flex, List, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { cancelSession, closeSession, createSession, kickPlayer, session, startQuiz, users } from '../../fetch/GAMINGSESSION';
import type { AppUser, GuestUser } from '../../fetch/types';
import { closeSocket, socket } from '../../fetch/socketio';
import { useNavigate } from 'react-router-dom';

export default function QuizLobby() {
    const navigate = useNavigate();
    const quizId = sessionStorage.getItem('quizId');
    const [sessionState, setSessionState] = useState<any>(null);
    const [usersState, setUsersState] = useState<Array<AppUser | GuestUser>>([]);


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
            closeSocket();
            navigate('/');
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
            setUsersState(users);
        };


        window.addEventListener("beforeunload", handleUnload);

        const init = async () => {
            const sessionData = await createSession({ quizId: quizId! });
            setSessionState(sessionData);
            sessionStorage.removeItem('quizId');
            if (socket) {
                socket.on("player-joined", ({ user, users }) => {
                    handlePlayerConnection(user, users);
                    if(user.guestUsername) {
                      message.info("Uporabnik pridružil igri: " + user.guestUsername)
                    }else{
                      message.info("Uporabnik pridružil igri: " + user.username)
                    }
                });

                socket.on("player-disconnected", ({ user, users }) => {
                    handlePlayerConnection(user, users);
                  if(user.guestUsername) {
                    message.info("Uporabnik zapustil igro: " + user.guestUsername)
                  }else{
                    message.info("Uporabnik zapustil igro: " + user.username)
                  }
                });

                socket.on("next-question", () => {
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
                setSessionState(session);
                setUsersState(users);

                socket.on("disconnect", () => {
                    closeSocket();
                    navigate('/');
                });

                socket.on("player-joined", ({ user, users }) => {
                    handlePlayerConnection(user, users);
                });

                socket.on("player-disconnected", ({ user, users }) => {
                    handlePlayerConnection(user, users);
                });

                socket.on("next-question", () => {
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