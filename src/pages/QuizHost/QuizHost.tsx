import { Button, Flex, Image, List } from "antd";
import styles from "./QuizHost.module.css";
import { socket } from "../../fetch/socketio";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from 'react';
import Timer from "../../components/Timer/Timer";
import Crown from "../../../src/assets/crown.svg";
import { questionIndex, session, users } from '../../fetch/GAMINGSESSION';
import { PICTURE_URL } from "../../api";
import { socket } from "../../fetch/socketio";
import { UserContext } from '../../context/UserContext.tsx';
import type { AppUser, GuestUser } from '../../fetch/types.tsx';

export default function QuizHost() {
  const {user} = useContext(UserContext);
  const [rotation, setRotation] = useState(0);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [resetKey, setResetKey] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  const isQuizOver = true;
  const [usersState, setUsersState] = useState(users);

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10;
    setRotation(randomRotation);

    if (socket?.connected) {
      socket.on("next-question", (index: number) => {
        setQuestionIndexState(index);
        setResetKey(index);
        setShowLead(false);
      });

      socket.on("finish-question", (currentUsers: Array<AppUser|GuestUser>) => {
        console.log("finished", currentUsers)
        setUsersState(currentUsers);
        console.log("test", usersState)
        setShowLead(true);
      });
    }

    return () => {
      socket?.off("next-question");
      socket?.off("finish-question")
    }
  }, [usersState, showLead, resetKey]);

  const handleTimerFinish = () => {
    if(!showLead) {
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
      } else {
        console.log("Moved to next question:", response)
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
          {console.log("usersState.log", usersState)}
          {(usersState[0]?.guestUsername) ? <h1 className={styles.topScores}>1. {usersState[0]?.guestUsername}</h1> : <h1 className={styles.topScores}>1. {usersState[0]?.username}</h1>}
          <span className={styles.scores}>{usersState[0]?.totalScore} točk</span>

          <Flex gap="middle" justify="center" style={{ width: "100vh" }}>
            {(usersState.length>=2) ? <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              {(usersState[1]?.guestUsername) ? <h1 className={styles.topScores}>2. {usersState[1]?.guestUsername}</h1> : <h1 className={styles.topScores}>2. {usersState[1]?.username}</h1>}
                <span className={styles.scores}>{usersState[1]?.totalScore} točk</span>
            </Flex>:null}
            {(usersState.length>=3)?<Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              {(usersState[2]?.guestUsername) ? <h1 className={styles.topScores}>3. {usersState[2]?.guestUsername}</h1> : <h1 className={styles.topScores}>3. {usersState[2]?.username}</h1>}
              <span className={styles.scores}>{usersState[2]?.totalScore} točk</span>
            </Flex>:null}
          </Flex>
          <Button onClick={handleNextQuestion} style={{ marginTop: '100px' }}>
            {(questionIndexState>=session?.quiz.questions.length) ? "NEXT QUESTION":"FINISH QUIZ"}
          </Button>
        </Flex>
      )}

      {showLead && isQuizOver && (
        <Flex className={styles.container} vertical gap="middle">
          <h1>Rezultati:</h1>

          <div id="scrollableDiv" className={styles.scrollArea}>
            <InfiniteScroll
              dataLength={testUsers.length}
              next={() => {}}
              hasMore={false}
              scrollableTarget="scrollableDiv"
              loader={<div>Nalaganje...</div>}
            >
              <List
                dataSource={testUsers}
                renderItem={(item, index) => (
                  <List.Item
                    key={item.id}
                    style={{
                      padding: "5px 0px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: '"PlusJakartaSans", "sans-serif"'
                    }}
                  >
                    <span>
                      {index + 1}. {item.username}
                    </span>
                    <span>{item.score} točk</span>
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          </div>

          <Flex justify="center" style={{ width: "100%" }} gap="middle">
            <Button className={styles.button} type="primary" onClick={() => navigate("/")}>
              Poglej poročilo
            </Button>
            <Button className={styles.homeButton} type="primary" onClick={() => navigate("/")}>
              Končaj Kviz
            </Button>
          </Flex>
        </Flex >
      )
}
    </>
  );
}

