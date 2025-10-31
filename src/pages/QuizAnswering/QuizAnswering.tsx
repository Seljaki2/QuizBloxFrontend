import { useState } from "react";
import { Button, Flex, Form, Image, Card } from "antd";
import jabuka from "./apple_temp.png";
import jabuka2 from "./t1.png";
import jabuka3 from "./t2.png";
import jabuka4 from "./t3.png";
import styles from "./QuizAnswering.module.css";
import TextArea from "antd/es/input/TextArea";

export default function QuizAnswering() {
    const testSwitch = 0; 

    type Answer = {
        content: string;
        isTrue?: boolean;
    };

    type Collection = {
        answerType: number;
        answers?: Answer[];
    };

    const testing1: Collection[] = [
        {
            answerType: 1,
            answers: [{ content: "Paris", isTrue: true }],
        },
        {
            answerType: 2,
            answers: [
                { content: "Paris", isTrue: true },
                { content: "London", isTrue: false },
                { content: "Berlin", isTrue: false },
                { content: "Rome", isTrue: false },
            ],
        },
        {
            answerType: 3,
            answers: [
                { content: jabuka, isTrue: false },
                { content: jabuka2, isTrue: false },
                { content: jabuka3, isTrue: true },
                { content: jabuka4, isTrue: false },
            ],
        },
    ];

    const colorClasses = [styles.blue, styles.pink, styles.orange, styles.green];

    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [userInput, setUserInput] = useState("");
    const [waiting, setWaiting] = useState(false);
    const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

    const handleAnswer = (answer: Answer, colorClass: string) => {
        setSelectedAnswer(answer);
        setSelectedColor(colorClass);
        setWaiting(true);

        setTimeout(() => {
            setWaiting(false);
            setResult(answer.isTrue ? "correct" : "incorrect");
        }, 3000);
    };

    const handleTextSubmit = () => {
        if (!userInput.trim()) return;
        setSelectedAnswer({ content: userInput });
        setWaiting(true);

        setTimeout(() => {
            const correct = testing1[0].answers?.[0].content.toLowerCase();
            const isCorrect = correct && userInput.toLowerCase().includes(correct);
            setWaiting(false);
            setResult(isCorrect ? "correct" : "incorrect");
        }, 3000);
    };

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

            {testing1[testSwitch].answerType === 1 &&
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

            {testing1[testSwitch].answerType === 2 &&
                !waiting &&
                !result &&
                !selectedAnswer && (
                    <Form>
                        <Flex wrap="wrap" justify="center" gap="large">
                            {testing1[testSwitch].answers?.map((answer, index) => {
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
                                            {answer.content}
                                        </div>
                                    </Button>
                                );
                            })}
                        </Flex>
                    </Form>
                )}

            {testing1[testSwitch].answerType === 3 &&
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
                            {testing1[testSwitch].answers?.map((answer, index) => {
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
                    {testing1[testSwitch].answerType === 1 ? (
                        <div className={
                            result === "correct"
                                ? styles.bounce
                                : result === "incorrect"
                                    ? styles.shake
                                    : ""
                        }
                        >
                            <span className={styles.spanText}> Tvoj dgovor: <span style={{ color: "#64F55F" }}>{selectedAnswer.content} </span> </span>
                        </div>
                    ) : testing1[testSwitch].answerType === 2 ? (
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
                                {selectedAnswer.content}
                            </div>
                        </Button>
                    ) : testing1[testSwitch].answerType === 3 ? (
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
                                    src={selectedAnswer.content}
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
