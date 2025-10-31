import { Button, Flex, Image } from "antd";
import styles from "./QuizHost.module.css";
import jabuka from './apple_temp.png';
import { useState, useEffect } from "react";
import Timer from "../../components/Timer/Timer";
import { questionIndex, session } from "../../fetch/GAMINGSESSION";
import { API_URL, PICTURE_URL } from "../../api";
import { socket } from "../../fetch/socketio";

export default function QuizHost() {
  const [rotation, setRotation] = useState(0);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [resetKey, setResetKey] = useState(0);
  console.log(session);

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10;
    setRotation(randomRotation);

    if (socket?.connected) {
      const callback = socket.on("next-question", ({ question, index }: { question: any, index: number }) => {
        setQuestionIndexState(index);
        setResetKey(index);
      });
    }

    return () => {
      socket?.off("next-question");
    }
  }, []);

  const handleNextQuestion = () => {
    console.log("Time's up! Moving to next question.", questionIndexState);
    socket?.emit("next-question", (response: any) => {
      if (response.error) {
        console.error("Error moving to next question:", response.error);
      } else {
        console.log("Moved to next question:", response);
      }
    });
  };
  return (
    <>
      <div className={styles.timerWrapper}>
        <Timer totalSeconds={session?.quiz.questions[questionIndexState].customTime} reset={resetKey} />
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
  );
}
