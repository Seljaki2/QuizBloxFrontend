import { Button, Card, Flex } from "antd";
import styles from "./PersonResult.module.css";
import { useNavigate } from "react-router-dom";

export default function PersonResult() {
    const navigate = useNavigate();
    const testUsers = [
        { username: "Alice", score: 120 },
        { username: "Bob", score: 95 },
        { username: "Charlie", score: 110 },
    ];

    const average = Math.round(
        (testUsers[0].score + testUsers[1].score + testUsers[2].score) /
        testUsers.length
    );
    const currentUser = testUsers[1];

    return (
        <Card className={styles.card}>
            <>
                {average <= currentUser.score ? (
                    <>
                        <h1 className={styles.header}>Odlično, {currentUser.username}!</h1>
                        <Flex className={styles.flexContainer} gap="medium">
                            <div className={styles.scoreGood}>
                                <span className={styles.boxTitle}>Tvoj rezultat</span>
                                <span className={styles.boxValue}>{currentUser.score} točk</span>
                            </div>
                            <div className={styles.avg}>
                                <span className={styles.boxTitle}>Povprečje</span>
                                <span className={styles.boxValue}>{average} točk</span>
                            </div>
                        </Flex>
                        <p className={styles.sentence}>Dosegli ste nadpovprečno število točk, čestitke! Le tako naprej!</p>
                    </>
                ) : (
                    <>
                        <h1 className={styles.header}>Skoraj, {currentUser.username}!</h1>
                        <Flex className={styles.flexContainer} gap="small">
                            <div className={styles.scoreBad}>
                                <span className={styles.boxTitle}>Tvoj rezultat</span>
                                <span className={styles.boxValue}>{currentUser.score} točk</span>
                            </div>
                            <div className={styles.avg}>
                                <span className={styles.boxTitle}>Povprečje</span>
                                <span className={styles.boxValue}>{average} točk</span>
                            </div>
                        </Flex>
                        <p className={styles.sentence}>Dosegli ste podpovprečno število točk, saj bo! Malo truda pa bo bolje!</p>
                    </>
                )}
            </>
            <Flex className={styles.buttonContainer} gap="small">
                <Button className={styles.button}>Poglej si poročilo</Button>
                <Button className={styles.homeButton}
                onClick={() => navigate("/")}
                >Domov</Button>
            </Flex>        
        
        </Card>
    );
}
