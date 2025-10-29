import { Flex, Image } from "antd"
import styles from "./QuizHost.module.css"
import jabuka from './apple_temp.png'
import { useState, useEffect } from "react"


export default function QuizHost(){

    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const randomRotation = Math.floor(Math.random() * 21) - 10; 
        setRotation(randomRotation);
    }, []);



    return(
    <Flex className={styles.question}>

        <Image className={styles.image} src={jabuka} preview={false} style={{ transform: `rotate(${rotation}deg)` }}> {/*TEMPORARY DOKLER NI POVEZANO*/}
        </Image>
        <h1 style={{margin: '0px', textAlign: 'center'}}>
            ADD TEXT HERE
        </h1>
    </Flex>)
}
