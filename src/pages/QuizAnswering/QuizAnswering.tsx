import { useEffect, useState } from "react";
import { Button, Flex, Form, Image, Card } from "antd";
import styles from "./QuizAnswering.module.css";
import TextArea from "antd/es/input/TextArea";
import { socket } from "../../fetch/socketio";
import { questionIndex, quiz } from "../../fetch/GAMINGSESSION";
import type { Answer } from "../../fetch/types";
import { PICTURE_URL } from "../../api";

export default function QuizAnswering() {

    const colorClasses = [styles.blue, styles.pink, styles.orange, styles.green];

    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [userInput, setUserInput] = useState("null");
    const [waiting, setWaiting] = useState(false);
    const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
    const [questionIndexState, setQuestionIndexState] = useState(questionIndex);

    const handleAnswer = (answer: Answer, colorClass: string) => {
        setSelectedAnswer(answer);
        setSelectedColor(colorClass);
        setWaiting(true);
        socket?.emit("answer-question", { questionId: quiz?.questions[questionIndexState].id, answerId: selectedAnswer?.id, userEntry: userInput });
        console.log("Submitted preset/media answer:", selectedAnswer);
        setTimeout(() => {
            setWaiting(false);
            setResult(selectedAnswer?.isCorrect ? "correct" : "incorrect");
        }, 3000);
    };

    const handleTextSubmit = () => {
        if (!userInput.trim()) return;
        setSelectedAnswer(null);
        setWaiting(true);
        socket?.emit("answer-question", { questionId: quiz?.questions[questionIndexState].id, answerId: selectedAnswer?.id, userEntry: userInput });

        setTimeout(() => {
            const correct = "test";
            const isCorrect = correct && userInput.toLowerCase().includes(correct);

            console.log("Submitted text answer:", userInput, "Correct:", isCorrect);
            setWaiting(false);
            setResult(isCorrect ? "correct" : "incorrect");
        }, 3000);
    };

    useEffect(() => {
        socket?.on("next-question", (index: number) => {
            setQuestionIndexState(index);
            setSelectedAnswer(null);
            setSelectedColor("");
            setUserInput("null");
            setWaiting(false);
            setResult(null);
        });
        return () => {
            socket?.off("next-question");
        };
    }, []);

    return (
        <Flex
            style={{ width: "100%", position: "relative" }}
            vertical
            align="center"
            justify="center"
            className={styles.container}
        >
            <Card className={styles.infoCard}>
                <div className={styles.infoTitle}>Tvoja statistika</div>
                <div>Mesto: #5</div>
                <div>Točke: 1450</div>
                <div>+25 točk da prihitiš igralca #4</div>
                <div>+80 točk pred igralcem #6</div>
            </Card>

            {!selectedAnswer && <h1 className={styles.header}>ODGOVORI:</h1>}

            {selectedAnswer && waiting && (
                <h1
                    className={styles.header}
                >
                    Čakamo, da vsi zaključijo ...
                </h1>
            )}

            {result && (
                <h1
                    className={styles.header}
                    style={{
                        marginTop: "2rem",
                        color: result === "correct" ? "#4CAF50" : "#d33434",
                    }}
                >
                    {result === "correct" ? "Pravilen odgovor!" : "Napačen odgovor!"}
                </h1>
            )}

            {quiz?.questions[questionIndexState].questionType == "CUSTOM_ANWSER" &&
                !waiting &&
                !result &&
                !selectedAnswer && (
                    <Form style={{ width: "80%" }} onFinish={handleTextSubmit}>
                        <Form.Item name={["answer"]}>
                            <TextArea
                                autoSize={{ minRows: 5, maxRows: 5 }}
                                style={{
                                    backgroundColor: "#fff",
                                    color: "#000",
                                    border: "15px solid #5FAFF5",
                                }}
                                className={styles.textField}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className={styles.commitButton}
                        >
                            Oddaj
                        </Button>
                    </Form>
                )}

            {quiz?.questions[questionIndexState].questionType == "PRESET_ANWSER" &&
                !waiting &&
                !result &&
                !selectedAnswer && (
                    <Form>
                        <Flex wrap="wrap" justify="center" gap="large">
                            {quiz?.questions[questionIndexState].answers?.map((answer: any, index: any) => {
                                const color = colorClasses[index % colorClasses.length];
                                return (
                                    <Button
                                        key={index}
                                        type="default"
                                        htmlType="button"
                                        className={`${styles.textButton} ${color}`}
                                        onClick={() => handleAnswer(answer, color)}
                                    >
                                        <div className={styles.textButtonContent}>
                                            {answer.text}
                                        </div>
                                    </Button>
                                );
                            })}
                        </Flex>
                    </Form>
                )}

            {quiz?.questions[questionIndexState].questionType == "MEDIA_ANWSER" &&
                !waiting &&
                !result &&
                !selectedAnswer && (
                    <Form>
                        <Flex
                            wrap="wrap"
                            justify="center"
                            align="center"
                            gap="large"
                            style={{ width: "100%" }}
                        >
                            {quiz?.questions[questionIndexState].answers?.map((answer: any, index: any) => {
                                const color = colorClasses[index % colorClasses.length];
                                return (
                                    <Button
                                        key={index}
                                        type="default"
                                        htmlType="button"
                                        className={`${styles.imageButton} ${color}`}
                                        onClick={() => handleAnswer(answer, color)}
                                    >
                                        <div className={styles.imageWrapper}>
                                            <Image
                                                src={answer.content}
                                                preview={false}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        </div>
                                    </Button>
                                );
                            })}
                        </Flex>
                    </Form>
                )}

            {selectedAnswer && (
                <div style={{ marginTop: "2rem" }}>
                    {quiz?.questions[questionIndexState].questionType == "CUSTOM_ANWSER" ? (
                        <div className={
                            result === "correct"
                                ? styles.bounce
                                : result === "incorrect"
                                    ? styles.shake
                                    : ""
                        }
                        >
                            <span className={styles.spanText}> Tvoj odgovor: <span style={{ color: "#64F55F" }}>{selectedAnswer.text} </span> </span>
                        </div>
                    ) : quiz?.questions[questionIndexState].questionType == "PRESET_ANWSER" ? (
                        <Button
                            type="default"
                            className={`${styles.textButton} ${selectedColor} ${result === "correct"
                                ? styles.bounce
                                : result === "incorrect"
                                    ? styles.shake
                                    : ""
                                }`}
                            disabled
                        >
                            <div className={styles.textButtonContent}>
                                {selectedAnswer.text}
                            </div>
                        </Button>
                    ) : quiz?.questions[questionIndexState].questionType == "MEDIA_ANWSER" ? (
                        <Button
                            type="default"
                            className={`${styles.imageButton} ${selectedColor} ${result === "correct"
                                ? styles.bounce
                                : result === "incorrect"
                                    ? styles.shake
                                    : ""
                                }`} disabled
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={PICTURE_URL + selectedAnswer?.media?.path}
                                    preview={false}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        </Button>
                    ) : null}
                </div>
            )}
        </Flex>
    );
}
