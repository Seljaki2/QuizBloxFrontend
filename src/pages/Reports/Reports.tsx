import { useState, useRef, useEffect, use, useContext } from "react";
import { Table, Input, Button, Space, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import Highlighter from "react-highlight-words";
import jabuka from "./jabuka.png"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import styles from "./Reports.module.css";
import type { StudentReport, TeacherReport } from "../../fetch/types";
import { fetchResults } from "../../fetch/results";
import { UserContext } from "../../context/UserContext";

export default function Reports() {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [stats, setStats] = useState<TeacherReport[] | StudentReport[]>([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        fetchResults().then((data) => {
            console.log(data)
            setStats(data);
        });
    }, []);

    const handleSearch = (
        selectedKeys: string[],
        confirm: () => void,
        dataIndex: keyof TeacherReport | keyof StudentReport
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex as string);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex: keyof T): TableColumnType<T> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{ padding: 8 }}
                className={styles.search_container}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder="Išči"
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys as string[], confirm, dataIndex)
                    }
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys as string[], confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                        className={styles.extraButtonStyle}
                    >
                        Išči
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                        className={styles.extraButtonStyle}
                    >
                        Resetiraj
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex as string);
                        }}
                    >
                        Filtriraj
                    </Button>
                    <Button type="link" size="small" onClick={close}>
                        Zapri
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]!
                    .toString()
                    .toLowerCase()
                    .includes((value as string).toLowerCase())
                : false,
        render: (text: any) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });


    const columnsTeacher: TableColumnType<TeacherReport>[] = [
        {
            title: "Naziv",
            dataIndex: ["session", "quiz", "name"],
            key: "quizName",
            ...getColumnSearchProps("session"),
            render: (_, record) => record.session.quiz.name,
        },
        {
            title: "Povprečje točk",
            dataIndex: "quizAverageScore",
            key: "avg_score",
        },
        {
            title: "Pravilni odgovori (%)",
            dataIndex: "quizAveragePercentage",
            key: "quiz_correct_percentage",
        },
    ];


    const columnsStudent: TableColumnType<StudentReport>[] = [
        {
            title: "Naziv",
            dataIndex: ["session", "quiz", "name"],
            key: "quizName",
            ...getColumnSearchProps("session"),
            render: (_, record) => record.session.quiz.name,
        },
        {
            title: "Skupne točke",
            dataIndex: ["userScore", "totalScore"],
            key: "totalScore",
            render: (_, record) => record.userScore.totalScore,
        },
        {
            title: "Povprečje točk",
            dataIndex: "quizAverageScore",
            key: "avg_score",
        },
    ];

    const data = stats;
    const columns = user?.isTeacher ? columnsTeacher : columnsStudent;
    console.log(data)
    console.log(columns)

    return (
        <Flex vertical gap="large" align="flex-end">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                rowClassName={styles.tableRow}
                expandable={{
                    expandedRowRender: (record) => (
                        <div className={styles.expandedRow}>
                            {user?.isTeacher && "averageStatsByQuestionId" in record && (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={Object.entries(record.averageStatsByQuestionId).map(([questionId, percent], i) => {
                                            const correct = Math.round((percent / 100) * record.session.playerCount);
                                            return {
                                                question: `VPR ${i + 1}`,
                                                correct,
                                                percent,
                                            };
                                        })}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                        className={styles.chart}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="question" tick={{ fill: "#9CA3AF" }} />
                                        <YAxis tick={{ fill: "#9CA3AF" }} />
                                        <Tooltip
                                            formatter={(value: number, name: string, props: any) => {
                                                const percent = props.payload.percent;
                                                const total = record.session.playerCount;
                                                return [
                                                    `${value} od ${total} učencev (${percent}%)`,
                                                    "Pravilni odgovori",
                                                ];
                                            }}
                                            contentStyle={{
                                                backgroundColor: "#2d3444",
                                                borderRadius: "12px",
                                                border: "none",
                                                color: "#fff",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                            }}
                                            itemStyle={{
                                                color: "#93C5FD",
                                                fontWeight: 500,
                                            }}
                                            labelStyle={{
                                                fontWeight: 600,
                                            }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="correct" fill="#34D399" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {!user?.isTeacher && "questionsAndAnswers" in record && (
                                <div className={styles.questionsContainer}>
                                    {record.questionsAndAnswers.map((qa, index) => {
                                        const isCorrect =
                                            qa.correct_answer.includes(qa.user_answer) ||
                                            (qa.is_user_answer_img &&
                                                qa.correct_answer.some((ans) => ans === qa.user_answer));

                                        return (
                                            <div
                                                key={index}
                                                className={`${styles.questionCard} ${isCorrect ? styles.correct : styles.incorrect
                                                    }`}
                                            >
                                                <h4>
                                                    {index + 1}. {qa.question}
                                                </h4>
                                                {qa.question_img_path && (
                                                    <img
                                                        src={qa.question_img_path}
                                                        alt="question"
                                                        className={styles.questionImage}
                                                    />
                                                )}

                                                <p>
                                                    <strong>Tvoj odgovor:</strong>{" "}
                                                    {qa.is_user_answer_img ? (
                                                        <>
                                                            <br />
                                                            <img
                                                                src={qa.user_answer}
                                                                alt="user answer"
                                                                className={styles.answerImage}
                                                            />
                                                        </>
                                                    ) : (
                                                        qa.user_answer
                                                    )}
                                                </p>

                                                <p>
                                                    <strong>Pravilni odgovor(i):</strong>
                                                    <br />
                                                    {qa.correct_answer.map((ans, i) =>
                                                        ans.includes("/") || ans.includes(".png") ? (
                                                            <img
                                                                key={i}
                                                                src={ans}
                                                                alt="correct answer"
                                                                className={styles.answerImage}
                                                            />
                                                        ) : (
                                                            <span key={i}>{ans}{i < qa.correct_answer.length - 1 && ", "}</span>
                                                        )
                                                    )}
                                                </p>
                                                <p className={`${styles.resultText} ${isCorrect ? styles.correctText : styles.incorrectText}`}>
                                                    {isCorrect ? "Pravilno odgovorjeno" : "napačno odgovorjeno"}
                                                    l
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ),
                    defaultExpandedRowKeys: ['2'] /* CHANGE THIS SHIET FOR DEFAULT OPEN, LOOKS BY TABLES rowKey*/
                }}
                pagination={{ pageSize: 5 }}
                className={styles.table}
                locale={{
                    emptyText: (
                        <div className={styles.noDataContainer}>
                            <SearchOutlined style={{ fontSize: 20 }} />
                            <p>Nič najdenih poročil</p>
                        </div>
                    ),
                }}
            />
        </Flex>
    );
}
