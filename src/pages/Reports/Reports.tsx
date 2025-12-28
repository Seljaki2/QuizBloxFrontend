import { useState, useRef, useEffect, use, useContext } from "react";
import { Table, Input, Button, Space, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import Highlighter from "react-highlight-words";
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
import { PICTURE_URL } from "../../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function Reports() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [stats, setStats] = useState<TeacherReport[] | StudentReport[]>([]);
    const { user } = useContext(UserContext);
    const [keyState, setKeyState] = useState<string[]>([]);
    const location = useLocation();

    useEffect(() => {
        fetchResults().then((data) => {
            setStats(data);
        });
    }, []);

        useEffect(() => {
            if (!user) {
                navigate('/');
            };
        }, [user, navigate]);

    useEffect(() => {
        const sessionId = location.state?.sessionId;
        if (sessionId) {
            setKeyState([sessionId]);
            console.log("Expanded row for session ID:", sessionId);
        }
    }, [location.state]);

    useEffect(() => {
        console.log("keyState updated:", keyState);
    }, [keyState]);

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
            render: (value: number) => value?.toFixed(2) + "%",
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
            render: (_, record) => record.userScore[0]?.totalScore,
        },
        {
            title: "Povprečje točk",
            dataIndex: "quizAverageScore",
            key: "avg_score",
        },
    ];

    const data = stats;
    console.log("User context:", data);
    const columns = user?.isTeacher ? columnsTeacher : columnsStudent;

    return (
        (user)?
        <Flex vertical gap="large" align="flex-end">
            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => record.session?.id}
                rowClassName={styles.tableRow}
                expandable={{
                    expandedRowRender: (record) => (
                        <div className={styles.expandedRow}>
                            <p>{record?.session?.quiz.name}</p>

                            {user?.isTeacher && "averageStatsByQuestionId" in record && (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={Object.entries(record.averageStatsByQuestionId).map(([questionId, value], i) => {
                                            const correct = Math.round((value / 100) * record.session.playerCount);
                                            return {
                                                question: `VPR ${i + 1}`,
                                                correct,
                                                percent: value,
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
                                                    `${value} od ${total} učencev (${Number(percent).toFixed(2)}%)`,
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

                            {!user?.isTeacher && "userQuestionAnswers" in record && (
                                <div className={styles.questionsContainer}>
                                    {record.userQuestionAnswers.map((qa, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={`${styles.questionCard} ${(qa.answer) ? (qa.answer.isCorrect ? styles.correct : styles.incorrect) : (qa.isUserEntryCorrect ? styles.correct : styles.incorrect)
                                                    }`}
                                            >
                                                <h4>
                                                    {index + 1}. {qa.question.text}
                                                </h4>
                                                {qa.question.media && (
                                                    <img
                                                        src={PICTURE_URL + qa.question.media.path}
                                                        alt="question"
                                                        className={styles.questionImage}
                                                    />
                                                )}

                                                <p>
                                                    <strong>Tvoj odgovor:</strong>{" "}
                                                    {qa.answer?.media ? (
                                                        <>
                                                            <br />
                                                            <img
                                                                src={PICTURE_URL + qa.answer.media.path}
                                                                alt="user answer"
                                                                className={styles.answerImage}
                                                            />
                                                        </>
                                                    ) : (
                                                        (qa.answer) ? qa.answer.text : qa.userEntry
                                                    )}
                                                </p>

                                                <p>
                                                    <strong>Pravilni odgovor(i):</strong>
                                                    <br />
                                                    {qa.question?.answers.map((ans, i) => {
                                                        if (ans.isCorrect) {
                                                            return ans.media ? (
                                                                <img
                                                                    key={i}
                                                                    src={PICTURE_URL + ans.media.path}
                                                                    alt="correct answer"
                                                                    className={styles.answerImage}
                                                                />
                                                            ) : (
                                                                <span key={i}>{ans.text + " "}</span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </p>
                                                <p className={`${styles.resultText} ${(qa.answer) ? (qa.answer.isCorrect ? styles.correctText : styles.incorrectText) : (qa.isUserEntryCorrect ? styles.correctText : styles.incorrectText)}`}>
                                                    {(qa.answer) ? (qa.answer.isCorrect ? "Pravilno Odgovorjeno" : "Nepravilno Odgovorjeno") : (qa.isUserEntryCorrect ? "Pravilno Odgovorjeno" : "Nepravilno Odgovorjeno")}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ),
                    expandedRowKeys: keyState,
                    onExpandedRowsChange: (expandedKeys) => { setKeyState(expandedKeys as string[]); console.log(expandedKeys); },
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
        </Flex> : null
    );
}
