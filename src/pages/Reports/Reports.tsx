import { useState, useRef } from "react";
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

type TeacherReport = {
  title: string;
  predmet: string;
  description: string;
  avg_score: number;
  questiong_percentages: number[];
  quiz_correct_percentage: number;
  total_students: number;
};

type StudentReport = {
  title: string;
  predmet: string;
  description: string;
  totalScore: number;
  avg_score: number;
};

export default function Reports() {
  const ifteacher = false;

  const quizReportsTeacher: TeacherReport[] = [
    {
      title: "Matematika - Test 1",
      predmet: "Matematika",
      description: "Test iz osnovnih računskih operacij.",
      avg_score: 130,
      questiong_percentages: [44, 65, 12, 76],
      quiz_correct_percentage: 50,
      total_students: 50,
    },
    {
      title: "Fizika - Test 2",
      predmet: "Fizika",
      description: "Osnovni pojmi o energiji in gibanju.",
      avg_score: 1308,
      questiong_percentages: [30, 85, 27, 67, 45, 12, 64],
      quiz_correct_percentage: 55,
      total_students: 40,
    },
  ];

  const quizReportsStudent: StudentReport[] = [
    {
      title: "Matematika - Test 1",
      predmet: "Matematika",
      description: "Test iz osnovnih računskih operacij.",
      totalScore: 106,
      avg_score: 130,
    },
    {
      title: "Fizika - Test 2",
      predmet: "Fizika",
      description: "Osnovni pojmi o energiji in gibanju.",
      totalScore: 1603,
      avg_score: 1308,
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

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

  const getColumnSearchProps = <
    T extends TeacherReport | StudentReport
  >(
    dataIndex: keyof T
  ): TableColumnType<T> => ({
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
          placeholder={`Išči`}
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
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
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
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps<TeacherReport>("title"),
    },
    {
      title: "Predmet",
      dataIndex: "predmet",
      key: "predmet",
      ...getColumnSearchProps<TeacherReport>("predmet"),
    },
    {
      title: "Povprečje točk",
      dataIndex: "avg_score",
      key: "avg_score",
    },
    {
      title: "Pravilni odgovori (%)",
      dataIndex: "quiz_correct_percentage",
      key: "quiz_correct_percentage",
    },
  ];

  const columnsStudent: TableColumnType<StudentReport>[] = [
    {
      title: "Naziv",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps<StudentReport>("title"),
    },
    {
      title: "Predmet",
      dataIndex: "predmet",
      key: "predmet",
      ...getColumnSearchProps<StudentReport>("predmet"),
    },
    {
      title: "Skupne točke",
      dataIndex: "totalScore",
      key: "totalScore",
    },
    {
      title: "Povprečje točk",
      dataIndex: "avg_score",
      key: "avg_score",
    },
  ];

  const data = ifteacher ? quizReportsTeacher : quizReportsStudent;
  const columns = ifteacher ? columnsTeacher : columnsStudent;

  return (
    <Flex vertical gap="large" align="flex-end">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="title"
        rowClassName={styles.tableRow}
        expandable={{
          expandedRowRender: (record) => (
            <div className={styles.expandedRow}>
              <p>{record.description}</p>

              {ifteacher && "questiong_percentages" in record && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={record.questiong_percentages.map((p, i) => {
                      const correct = Math.round(
                        (p / 100) * record.total_students
                      );
                      return {
                        question: `VPR ${i + 1}`,
                        correct,
                        percent: p,
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        const percent = props.payload.percent;
                        const total = record.total_students;
                        return [
                          `${value} od ${total} učencev (${percent}%)`,
                          "Pravilni odgovori",
                        ];
                      }}
                      labelFormatter={(label: string) => `Vprašanje: ${label}`}
                    />
                    <Bar dataKey="correct" fill="#34D399" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ),
        }}
        pagination={{ pageSize: 5 }}
        className={styles.table}
        locale={{
          emptyText: (
            <div className={styles.noDataContainer}>
              <SearchOutlined style={{ fontSize: 20 }} />
              <p>nič najdenih podatkov</p>
            </div>
          ),
        }}
      />
    </Flex>
  );
}
