import { Button, Flex, Image, List } from "antd";
import styles from "./QuizHost.module.css";
import { socket } from "../../fetch/socketio";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from 'react';
import Timer from "../../components/Timer/Timer";
import Crown from "../../../src/assets/crown.svg";
import { closeSession, questionIndex, session, users } from '../../fetch/GAMINGSESSION';
import { PICTURE_URL } from "../../api";
import { UserContext } from '../../context/UserContext.tsx';
import type { AppUser, GuestUser } from '../../fetch/types.tsx';

export default function QuizHost() {
  const { user } = useContext(UserContext);
  const [rotation, setRotation] = useState(0);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [resetKey, setResetKey] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [usersState, setUsersState] = useState(users);

  const openReport = () => {
    const sessionId = session?.session.id;
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ sessionIdQuizBlox: sessionId }, "*");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    };
  }, [user, navigate]);

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10;
    setRotation(randomRotation);

    if (socket?.connected) {
      socket.on("next-question", (index: number) => {
        setQuestionIndexState(index);
        setResetKey(index);
        setShowLead(false);
      });

      socket.on("finish-question", (currentUsers: Array<AppUser | GuestUser>) => {
        setUsersState(currentUsers);
        setShowLead(true);
        if (questionIndexState >= session?.quiz.questions.length - 1)
          setIsQuizOver(true);
      });
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      closeSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);


    return () => {
      socket?.off("next-question");
      socket?.off("finish-question");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [usersState, showLead, resetKey]);

  const handleTimerFinish = () => {
    if (!showLead) {
      socket?.emit("time-elapsed-question", user?.id, (response: any) => {
        if (response.error) {
          console.error("Error finishing question", response.error);
        } else {
          setShowLead(true);
        }
      });
    }
  };

  const handleNextQuestion = () => {
    socket?.emit("next-question", (response: any) => {
      if (response.error) {
        console.error("Error moving to next question:", response.error);
      }
    });
  };

  return (
    <>
      {!showLead ? (
        <>
          <div className={styles.timerWrapper}>
            <Timer totalSeconds={session?.quiz.questions[questionIndexState].customTime} onFinish={handleTimerFinish} reset={resetKey} />
          </div>


          <Flex className={styles.question}>
            {(session?.quiz.questions[questionIndexState].media) ? <Image
              className={styles.image}
              src={PICTURE_URL + session?.quiz.questions[questionIndexState].media.path}
              preview={false}
              style={{ transform: `rotate(${rotation}deg)`, marginBottom: '10px', maxHeight: '50vh' }}
            /> : null}
            <h1 style={{ margin: '0px', textAlign: 'center' }}>
              {session?.quiz.questions[questionIndexState].text}
            </h1>
          </Flex>
        </>
      ) : (
        <Flex vertical align="center" style={{ width: "100vh" }}>
          <img src={Crown} alt="Crown" />
          {(usersState[0]?.guestUsername) ? <h1 className={styles.score1}>1. {usersState[0]?.guestUsername}</h1> : <h1 className={styles.score1}>1. {usersState[0]?.username}</h1>}
          <span className={styles.scores}>{usersState[0]?.totalScore} točk</span>

          <Flex gap="middle" justify="center" style={{ width: "100vh" }}>
            {(usersState.length >= 2) ? <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              {(usersState[1]?.guestUsername) ? <h1 className={styles.score2}>2. {usersState[1]?.guestUsername}</h1> : <h1 className={styles.score2}>2. {usersState[1]?.username}</h1>}
              <span className={styles.scores}>{usersState[1]?.totalScore} točk</span>
            </Flex> : null}
            {(usersState.length >= 3) ? <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              {(usersState[2]?.guestUsername) ? <h1 className={styles.score3}>3. {usersState[2]?.guestUsername}</h1> : <h1 className={styles.score3}>3. {usersState[2]?.username}</h1>}
              <span className={styles.scores}>{usersState[2]?.totalScore} točk</span>
            </Flex> : null}
          </Flex>
          {(questionIndexState < session?.quiz.questions.length - 1) ? <Button onClick={handleNextQuestion} style={{ marginTop: '100px' }} className={styles.homeButton} type="primary">
            Naslednje Vprašanje
          </Button> : null}
        </Flex>
      )}

      {showLead && isQuizOver && (
        <Flex className={styles.container} vertical gap="middle">
          <h1>Rezultati:</h1>

          <div id="scrollableDiv" className={styles.scrollArea}>
            <InfiniteScroll
              dataLength={usersState?.length}
              next={() => { }}
              hasMore={false}
              scrollableTarget="scrollableDiv"
              loader={<div>Nalaganje...</div>}
            >
              <List
                dataSource={usersState}
                renderItem={(item, index) => (
                  <List.Item
                    key={item.totalScore}
                    style={{
                      padding: "5px 0px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: '"PlusJakartaSans", "sans-serif"'
                    }}
                  >
                    <span>
                      {index + 1}. {(item.guestUsername) ? item.guestUsername : item.username}
                    </span>
                    <span>{item.totalScore} točk</span>
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </div>

          <Flex justify="center" style={{ width: "100%" }} gap="middle">
            <Button className={styles.button} type="primary" onClick={() => { openReport(); closeSession(); window.close(); }}>
              Poglej poročilo
            </Button>
            <Button className={styles.homeButton} type="primary" onClick={() => { closeSession(); window.close(); }}>
              Končaj Kviz
            </Button>
          </Flex>
        </Flex >
      )
      }
    </>
  );
}

