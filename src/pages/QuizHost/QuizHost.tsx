import { Flex, Image } from "antd";
import styles from "./QuizHost.module.css";
import jabuka from './apple_temp.png';
import { useState, useEffect } from "react";
import Timer from "../../components/Timer/Timer";

export default function QuizHost() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const randomRotation = Math.floor(Math.random() * 21) - 10; 
    setRotation(randomRotation);
  }, []);

  return (
    <>
      <div className={styles.timerWrapper}>
        <Timer totalSeconds={15} />
      </div>

      <Flex className={styles.question}>
        <Image
          className={styles.image}
          src={jabuka}
          preview={false}
          style={{ transform: `rotate(${rotation}deg)`, marginBottom: '10px' }}
        />
        <h1 style={{ margin: '0px', textAlign: 'center' }}>
          ADD TEXT HERE
        </h1>
      </Flex>
    </>
  );
}
