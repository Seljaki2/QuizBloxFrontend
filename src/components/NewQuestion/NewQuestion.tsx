import { Divider, Form, Input, Radio } from "antd";
import styles from "./NewQuestion.module.css";
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';

type Props = {
    index: string;
    onTitleChange: (newTitle: string) => void;
};

export default function NewQuestion({ index, onTitleChange }: Props) {

    const [value, setValue] = useState(2);

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange(e.target.value);
    };

    return (
        <>
            <Form.Item
                label="Vprašanje"
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
                    { value: 2, label: "več možnosti" },
                ]}
            />

            {value === 2 && (
                <>
                    <Divider className={styles.divider} />
                    <Form.Item
                        label="answer1"
                        name={["questions", index, "ans1"]}
                        rules={[{ required: true, message: "Podajte 1. možnost!" }]}
                        className={styles.nameItem}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="answer2"
                        name={["questions", index, "ans2"]}
                        rules={[{ required: true, message: "Podajte 2. možnost!" }]}
                        className={styles.nameItem}
                    >
                        <Input />
                    </Form.Item>
                </>
            )}
        </>
    )
}