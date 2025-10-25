import { Divider, Form, Input, Radio } from "antd";
import styles from "./NewQuestion.module.css";
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import TextArea from "antd/es/input/TextArea";

type Props = {
    index: string;
    onTitleChange: (newTitle: string) => void;
    onAnswerTypeChange: (newType: number) => void;
};

export default function NewQuestion({ index, onTitleChange,  onAnswerTypeChange }: Props) {

    const [value, setValue] = useState(1);

    const onChange = (e: RadioChangeEvent) => {
        setValue(e.target.value);
        onAnswerTypeChange(e.target.value);
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTitleChange(e.target.value);
    };

    return (
        <>
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
                    { value: 2, label: "več možnosti" },
                ]}
            />
            <Divider className={styles.divider} />

            {value === 2 && (
                <>
                    <Form.Item
                        label="1. Odgovor:"
                        name={["questions", index, "ans1"]}
                        rules={[{ required: true, message: "Podajte 1. možnost!" }]}
                        className={styles.nameItem}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="2. Odgovor:"
                        name={["questions", index, "ans2"]}
                        rules={[{ required: true, message: "Podajte 2. možnost!" }]}
                        className={styles.nameItem}
                    >
                        <Input />
                    </Form.Item>
                </>
            )}
            {value === 1 && (
                <>
                    <Form.Item
                        label="Naštejte vse možnosti:"
                        name="options"
                        rules={[{ required: true, message: "Podajte možnosti" }]}
                    >
                        <TextArea autoSize={{ minRows: 5, maxRows: 5 }} />
                    </Form.Item>
                </>
            )}
        </>
    )
}