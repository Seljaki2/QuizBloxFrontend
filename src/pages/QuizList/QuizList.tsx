import { useEffect, useRef, useState } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Flex, Input, Space, Table } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import styles from './QuizList.module.css'
import { API_URL } from '../../api';
import type { Quiz } from '../../fetch/types';
import { createSession } from '../../fetch/GAMINGSESSION';
import { useNavigate } from 'react-router-dom';

function openSessionWindow(sessionId: string) {
    const sessionWindow = window.open(`/lobby`, '_blank', 'noopener,noreferrer');
    if (sessionWindow) sessionWindow.focus();
}

type DataIndex = keyof Quiz;


export default function QuizList() {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    const [data, setData] = useState<Quiz[]>([]);
    const navigate = useNavigate();


        useEffect(() => {
            async function fetchQuizzes() {
                try {
                    const res = await fetch(`${API_URL}/quizzes`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    });

                    if (!res.ok) throw new Error("Failed to fetch quizzes");

                    const data = await res.json();
                    console.log("Fetched quizzes:", data);
                    setData(data);
                    console.log("Quizzes set in state:", data);
                } catch (error) {
                    console.error("Error fetching quizzes:", error);
                }
            }

            fetchQuizzes();
        }, []);
    

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Quiz> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8, }} className={styles.search_container} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={``}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block', }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
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
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filtriraj
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Zapri
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            (record[dataIndex] ?? '')
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns: TableColumnsType<Quiz> = [
        {
            title: 'Naslov',
            dataIndex: 'name',
            key: 'id',
            width: '50%',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Akcija',
            key: 'action',
            width: '50%',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => openSessionWindow(record.id)} style={{ color: '#34D399' }}>Začni kviz</a>
                    <a onClick={() => createSession({ quizId: record.id })}>Uredi</a> {/* TODO */}
                    <a onClick={() => console.log('Delete', record)} style={{ color: 'red' }}>
                        Izbriši
                    </a> {/* TODO */}
                </Space>
            ),
        },
    ];

    return <Flex vertical gap="large" align="flex-end">

        <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            className={styles.extraButtonStyle}
            onClick={() => navigate("/NewQuiz")}
        >
            Dodaj Kviz 
        </Button>
        <Table<Quiz> columns={columns}
            rowKey="id"
            expandable={{
                expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
                rowExpandable: (record) => record.name !== 'Not Expandable',
            }}
            dataSource={data}
            className={styles.table}
            rowClassName={styles.tableRow}
            sticky={{ offsetHeader: 0 }}
            pagination={{ pageSize: 5 }}
            locale={{
                emptyText: (
                    <div className={styles.noDataContainer}>
                        <SearchOutlined style={{ fontSize: 20, color: 'var(--HOVER_TEXT)' }} />
                        <p>Ni zadetkov za iskanje</p>
                    </div>
                ),
            }}
        />
    </Flex>
};