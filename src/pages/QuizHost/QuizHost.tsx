import { Button, Flex, Image } from "antd";
import styles from "./QuizHost.module.css";
import { useState, useEffect } from "react";
import Timer from "../../components/Timer/Timer";
import Crown from "../../../src/assets/crown.svg";
import { questionIndex, session } from "../../fetch/GAMINGSESSION";
import { PICTURE_URL } from "../../api";
import { socket } from "../../fetch/socketio";

export default function QuizHost() {
  const [rotation, setRotation] = useState(0);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [resetKey, setResetKey] = useState(0);
  const [showLead, setShowLead] = useState(false);
  console.log(session);

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10;
    setRotation(randomRotation);

    if (socket?.connected) {
      socket.on("next-question", (index: number) => {
        setQuestionIndexState(index);
        setResetKey(index);
      });
    }

    return () => {
      socket?.off("next-question");
    }
  }, []);

  const handleTimerFinish = () => {
    setShowLead(true);
  };

  const handleNextQuestion = () => {
    console.log("Time's up! Moving to next question.", questionIndexState);
    socket?.emit("next-question", (response: any) => {
      if (response.error) {
        console.error("Error moving to next question:", response.error);
      } else {
        console.log("Moved to next question:", response);
        setShowLead(false);
      }
    });
  };

  const testUsers = [
    { username: "Alice", score: 120 },
    { username: "Bob", score: 95 },
    { username: "Charlie", score: 110 },
  ];

  return (
    <>
      {!showLead ? (
        <>
          <div className={styles.timerWrapper}>
            <Timer totalSeconds={session?.quiz.questions[questionIndexState].customTime} onFinish={handleTimerFinish} reset={resetKey} />
          </div>


          <Flex className={styles.question}>
            <Button onClick={handleNextQuestion}></Button>
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
          <h1 className={styles.topScores}>1. {testUsers[0].username}</h1>
          <span className={styles.scores}>{testUsers[0].score} točk</span>

          <Flex gap="middle" justify="center" style={{ width: "100vh" }}>
            <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              <h1 className={styles.topScores}>2. {testUsers[1].username}</h1>
              <span className={styles.scores}>{testUsers[1].score} točk</span>
            </Flex>
            <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "50vh",
              }}
            >
              <h1 className={styles.topScores}>3. {testUsers[2].username}</h1>
              <span className={styles.scores}>{testUsers[2].score} točk</span>
            </Flex>
            <Button onClick={handleNextQuestion}>NEXT QUESTION</Button>
          </Flex>
        </Flex>

      )}
    </>
  );
}

