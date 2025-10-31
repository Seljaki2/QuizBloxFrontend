import { Button, Flex, Form, Image } from "antd";
import jabuka from "./apple_temp.png";
import jabuka2 from "./t1.png";
import jabuka3 from "./t2.png";
import jabuka4 from "./t3.png";
import styles from "./QuizAnswering.module.css"

import TextArea from "antd/es/input/TextArea";


export default function QuizAnswering() {
    const testSwitch = 1;

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
        },
        {
            answerType: 2,
            answers: [
                { content: "Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris Paris", isTrue: true },
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

    const colorClasses = [
        styles.blue,
        styles.pink,
        styles.orange,
        styles.green,
    ];

    return (
        <>
            <Flex style={{ width: "100%" }} vertical align="center" justify="center" className={styles.container}>
                <h1 className={styles.header}>ODGOVORI:</h1>
                {testing1[testSwitch].answerType === 1 && (
                    <Form style={{ width: "80%" }}>
                        <Form.Item
                            name={["answer"]}
                            rules={[{ required: true, message: "" }]}
                        >
                            <TextArea autoSize={{ minRows: 5, maxRows: 5 }} style={{ backgroundColor: "#fff", color: "#000", border: "15px solid #5FAFF5" }} className={styles.textField} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" className={styles.commitButton}>
                            Oddaj
                        </Button>
                    </Form>
                )}

                {testing1[testSwitch].answerType === 2 && (
                    <Form>
                        <Flex wrap="wrap" justify="center" gap="large">
                            {testing1[testSwitch].answers?.map((answer, index) => (
                                <Button
                                    key={index}
                                    type="default"
                                    htmlType="button"
                                    className={`${styles.textButton} ${colorClasses[index % colorClasses.length]}`}
                                >
                                    <div className={styles.textButtonContent}>
                                        {answer.content}
                                    </div>
                                </Button>
                            ))}
                        </Flex>
                    </Form>
                )}

                {testing1[testSwitch].answerType === 3 && (
                    <Form>
                        <Flex
                            wrap="wrap"
                            justify="center"
                            align="center"
                            gap="large"
                            style={{ width: "100%" }}
                        >
                            {testing1[testSwitch].answers?.map((answer, index) => (


                                <Button
                                    key={index}
                                    type="default"
                                    htmlType="button"
                                    className={`${styles.imageButton} ${colorClasses[index % colorClasses.length]}`}
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
                            ))}
                        </Flex>
                    </Form>
                )}


            </Flex>
        </>
    );
}
