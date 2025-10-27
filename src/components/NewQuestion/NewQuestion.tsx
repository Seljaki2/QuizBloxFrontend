import { Divider, Form, Input, Radio, Button, Checkbox } from "antd";
import styles from "./NewQuestion.module.css";
import type { RadioChangeEvent, UploadFile } from 'antd';
import { useState } from 'react';
import TextArea from "antd/es/input/TextArea";
import QuizImageUpload from "../QuizImageUpload/QuizImageUpload";

type Props = {
    index: string;
    onTitleChange: (newTitle: string) => void;
    onAnswerTypeChange: (newType: number) => void;
};

export default function NewQuestion({ index, onTitleChange, onAnswerTypeChange }: Props) {
    const [value, setValue] = useState(1);
    const [answerCount, setAnswerCount] = useState(2);

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
        onAnswerTypeChange(e.target.value);
        setAnswerCount(2);
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange(e.target.value);
    };

    const addAnswer = () => {
        if (answerCount < 4) setAnswerCount(answerCount + 1);
    };

    const removeAnswer = () => {
        if (answerCount > 2) setAnswerCount(answerCount - 1);
    };

    return (
        <>
            <div className={styles.centerQuestionImg}>
                <Form.Item
                    name={["questions", index, "questionImage"]}
                    valuePropName="value"
                    getValueFromEvent={(fileList: UploadFile[]) => fileList}
                >
                    <QuizImageUpload buttonText="Poljubno dodaj sliko za vprašanje" />
                </Form.Item>
            </div>

            <Form.Item
                label="Vprašanje:"
                name={["questions", index, "question"]}
                rules={[{ required: true, message: "Podajte vprašanje!" }]}
                className={styles.nameItem}
            >
                <Input onChange={handleQuestionChange} />
            </Form.Item>

            <Radio.Group
                onChange={onChange}
                value={value}
                options={[
                    { value: 1, label: "vnos odgovora" },
                    { value: 2, label: "več možnosti tekst" },
                    { value: 3, label: "več možnosti slike" },
                ]}
            />

            <Divider className={styles.divider} />

            {value === 1 && (
                <Form.Item
                    label="Naštejte vse možnosti:"
                    name={["questions", index, "keywords"]}
                    rules={[{ required: true, message: "Podajte možnosti" }]}
                >
                    <TextArea autoSize={{ minRows: 5, maxRows: 5 }} />
                </Form.Item>
            )}

            {value === 2 && (
                <>
                    {[...Array(answerCount)].map((_, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "end", marginBottom: 12 }}>
                            <Form.Item
                                label={`${i + 1}. Odgovor:`}
                                name={["questions", index, `ans${i + 1}`]}
                                rules={[{ required: true, message: `Podajte ${i + 1}. možnost!` }]}
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={["questions", index, `correctAns${i + 1}`]}
                                valuePropName="checked"
                                style={{ marginLeft: 10, marginBottom: 0 }}
                            >
                                <Checkbox>Pravilno</Checkbox>
                            </Form.Item>
                        </div>
                    ))}

                    <div className={styles.addRemoveButtons}>
                        <Button type="primary" className={styles.buttons} onClick={addAnswer} disabled={answerCount >= 4}>
                            Dodaj možnost
                        </Button>
                        <Button type="primary" className={styles.buttons} onClick={removeAnswer} disabled={answerCount <= 2}>
                            Odstrani možnost
                        </Button>
                    </div>
                </>
            )}

            {value === 3 && (
    <>
        <div className={styles.imageAnswersRow}>
            {[...Array(answerCount)].map((_, i) => (
                <div key={i} className={styles.imageAnswerItem}>
                    <Form.Item
                        name={["questions", index, `questionImage${i + 1}`]}
                        valuePropName="value"
                        getValueFromEvent={(fileList: UploadFile[]) => fileList}
                        style={{ width: "100%", display:"flex",   justifyContent: "center", margin:"0px"}}
                        rules={[{ required: true, message: "Podajte Sliko!" }]}
                    >
                        <QuizImageUpload buttonText={`Dodaj sliko za ${i + 1}. odgovor`} />
                    </Form.Item>
                    <Form.Item
                        name={["questions", index, `correctImage${i + 1}`]}
                        valuePropName="checked"
                        style={{ marginTop: 4 }}
                    >
                        <Checkbox>Pravilno</Checkbox>
                    </Form.Item>
                </div>
            ))}
        </div>

        <div className={styles.addRemoveButtons}>
            <Button type="primary" className={styles.buttons} onClick={addAnswer} disabled={answerCount >= 4}>
                Dodaj možnost
            </Button>
            <Button type="primary" className={styles.buttons} onClick={removeAnswer} disabled={answerCount <= 2}>
                Odstrani možnost
            </Button>
        </div>
    </>
)}

        </>
    );
}
