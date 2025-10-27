import { useState } from "react";
import { Card, Collapse, Divider, Form, Input, Select, Button, type FormProps, Popconfirm } from "antd";
import { CaretRightOutlined, MenuOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactElement } from "react";


import styles from "./AddNewQuiz.module.css";
import NewQuestion from "../../components/NewQuestion/NewQuestion";

const { TextArea } = Input;

type FieldType = {
    title?: string;
    description?: string;
    subject?: string;
};

type QuestionItem = {
    key: string;
    label: string;
    content: ReactElement;
    answerType?: number;
};


const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
};

function SortableQuestion({ id, item, onDelete }: { id: string; item: QuestionItem; onDelete: (key: string) => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: 12,
    };

    const customLabel = (
        <div className={styles.customLabelContainer}>
            <div className={styles.customLabelText}>
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                    }}
                >
                    {item.label}
                </span>
                <span className={styles.customLabelMinorT}>
                    {item.answerType === 1 ? "(vnos odgovora)" : item.answerType === 2 ? "(več možnosti tekst)" : item.answerType === 3 ? "(več možnosti slike)" : ""}
                </span>
            </div>

            <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <Popconfirm
                    title="Izbriši vprašanje?"
                    okText="Da"
                    cancelText="Ne"
                    onConfirm={(e) => {
                        e?.stopPropagation?.();
                        onDelete(item.key);
                    }}
                    onCancel={(e) => e?.stopPropagation?.()}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className={styles.deleteButton}
                    />
                </Popconfirm>
            </div>
        </div>
    );


    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div className={styles.sortableGrab}>
                <div
                    {...listeners}
                    className={styles.sortable}
                >
                    <MenuOutlined />
                </div>

                <div style={{ flex: 1 }}>
                    <Collapse
                        bordered={false}
                        expandIcon={({ isActive }) => (
                            <CaretRightOutlined rotate={isActive ? 90 : 0} />
                        )}
                        items={[
                            {
                                key: item.key,
                                label: customLabel,
                                children: item.content,
                                className: styles.panelStyle,
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

export default function AddNewQuiz() {

    const handleQuestionTitleChange = (key: string, newTitle: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.key === key ? { ...q, label: newTitle || "Novo vprašanje" } : q
            )
        );
    };


    const handleQuestionAnswerTypeChange = (key: string, newType: number) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.key === key ? { ...q, answerType: newType } : q
            )
        );
    };


    const handleDeleteQuestion = (key: string) => {
        setQuestions((prev) => prev.filter((q) => q.key !== key));
    };

    const [questions, setQuestions] = useState<QuestionItem[]>([
    ]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = questions.findIndex((i) => i.key === active.id);
            const newIndex = questions.findIndex((i) => i.key === over?.id);
            setQuestions((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleAddQuestion = () => {
        const newKey = (questions.length + 1).toString();
        const newItem: QuestionItem = {
            key: newKey,
            label: "Novo vprašanje",
            answerType: 1,
            content: (
                <NewQuestion
                    index={newKey}
                    onTitleChange={(newTitle) => handleQuestionTitleChange(newKey, newTitle)}
                    onAnswerTypeChange={(newType) => handleQuestionAnswerTypeChange(newKey, newType)}
                />
            ),
        };
        setQuestions((prev) => [...prev, newItem]);
    };

    const [form] = Form.useForm();

    return (
        <>
            <Card className={styles.card}>
                <h1 className={styles.header}>
                DODAJ KVIZ
                </h1>
                <Form
                    form={form}
                    name="newQuiz"
                    layout="vertical"
                    initialValues={{ remember: false }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    requiredMark={false}
                    className={styles.form}
                >
                    <div className={styles.nameRow}>
                        <div className={styles.leftColumn}>
                            <Form.Item
                                label="Naziv"
                                name="title"
                                rules={[{ required: true, message: "Podajte Naziv!" }]}
                                className={styles.nameItem}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Predmet"
                                name="subject"
                                rules={[{ required: true, message: "Izaberite predmet!" }]}
                                className={styles.dropdownItem}
                            >
                                <Select
                                    className={styles.customSelect}
                                    placeholder="Izberite predmet"
                                >
                                    <Select.Option value="math">Matematika</Select.Option>
                                    <Select.Option value="science">Znanost</Select.Option>
                                    <Select.Option value="history">Zgodovina</Select.Option>
                                    <Select.Option value="general">Splošno</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Opis"
                            name="description"
                            className={styles.descriptionItem}
                        >
                            <TextArea autoSize={{ minRows: 5, maxRows: 5 }} />
                        </Form.Item>
                    </div>

                    <Divider className={styles.divider} />

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={questions.map((q) => q.key)}
                            strategy={verticalListSortingStrategy}
                        >
                            {questions.map((item) => (
                                <SortableQuestion
                                    key={item.key}
                                    id={item.key}
                                    item={{
                                        ...item,
                                        content: (
                                            <NewQuestion
                                                index={item.key}
                                                onTitleChange={(newTitle) => handleQuestionTitleChange(item.key, newTitle)}
                                                onAnswerTypeChange={(newType) => handleQuestionAnswerTypeChange(item.key, newType)}
                                            />
                                        ),
                                    }}
                                    onDelete={handleDeleteQuestion}
                                />
                            ))}
                        </SortableContext>

                    </DndContext>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                            type="default"
                            onClick={handleAddQuestion}
                            icon={<PlusOutlined />}
                            className={styles.extraButtonStyle}
                        >
                            Dodaj
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className={styles.extraButtonStyle}
                        >
                            Shrani kviz
                        </Button>
                    </div>
                </Form>
            </Card>
        </>
    );
}
