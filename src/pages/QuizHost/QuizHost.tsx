import { Button, Flex, Image, List } from "antd";
import styles from "./QuizHost.module.css";
import jabuka from "./apple_temp.png";
import { useState, useEffect } from "react";
import Timer from "../../components/Timer/Timer";
import Crown from "../../../src/assets/crown.svg";
import { questionIndex, session } from "../../fetch/GAMINGSESSION";
import { socket } from "../../fetch/socketio";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";

export default function QuizHost() {
  const [rotation, setRotation] = useState(0);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [resetKey, setResetKey] = useState(0);
  const [showLead, setShowLead] = useState(false);
  const navigate = useNavigate();

  const isQuizOver = true;

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10;
    setRotation(randomRotation);

    if (socket?.connected) {
      socket.on("next-question", ({ question, index }: { question: any; index: number }) => {
        setQuestionIndexState(index);
        setResetKey(index);
      });
    }

    return () => {
      socket?.off("next-question");
    };
  }, []);

  const handleTimerFinish = () => {
    setShowLead(true);
  };

  // Sort users by score descending
  const testUsers = [
    { username: "Alice", score: 120, id: 1 },
    { username: "Bob", score: 95, id: 2 },
    { username: "Charlie", score: 110, id: 3 },
  ].sort((a, b) => b.score - a.score);

  return (
    <>
      {!showLead ? (
        <>
          <div className={styles.timerWrapper}>
            <Timer totalSeconds={5} onFinish={handleTimerFinish} />
          </div>

          <Flex className={styles.question} align="center">
            <Image
              className={styles.image}
              src={jabuka}
              preview={false}
              style={{ transform: `rotate(${rotation}deg)`, marginBottom: "10px" }}
            />
            <h1 style={{ margin: 0, textAlign: "center" }}>ADD TEXT HERE</h1>
          </Flex>
        </>
      ) : (
        <Flex vertical align="center" style={{ width: "100vh" }}>
          <img src={Crown} alt="Crown" />
          <h1 className={styles.topScores}>1. {testUsers[0].username}</h1>
          <span className={styles.scores}>{testUsers[0].score} točk</span>

          <Flex gap="middle" justify="center" style={{ width: "100vh" }}>
            {testUsers[1] && (
              <Flex vertical justify="center" align="center" style={{ width: "50vh" }}>
                <h1 className={styles.topScores}>2. {testUsers[1].username}</h1>
                <span className={styles.scores}>{testUsers[1].score} točk</span>
              </Flex>
            )}
            {testUsers[2] && (
              <Flex vertical justify="center" align="center" style={{ width: "50vh" }}>
                <h1 className={styles.topScores}>3. {testUsers[2].username}</h1>
                <span className={styles.scores}>{testUsers[2].score} točk</span>
              </Flex>
            )}
          </Flex>
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
