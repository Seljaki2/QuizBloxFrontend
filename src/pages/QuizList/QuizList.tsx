import React, { useRef, useState } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Flex, Input, Space, Table } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import styles from './QuizList.module.css'
import { Link } from 'react-router-dom';

interface QuizType {
    key: React.Key;
    title: string;
    description: string;
    subject: string;
    questions?: {
        question: string;
        answerType: number;
        answers?: string[];
    }[];
}


type DataIndex = keyof QuizType;

const data: QuizType[] = [
    {
        key: 1,
        title: 'Kviz iz Matematike',
        description: 'Kviz s 5 vprašanji o osnovah matematike.',
        subject: 'Matematika',
        questions: [
            {
                question: 'Koliko je 2 + 2?',
                answerType: 2,
                answers: ['3', '4', '5'],
            },
        ],
    },
    {
        key: 2,
        title: 'Splošni kviz znanja',
        description: 'Kviz o splošnem znanju z različnimi vrstami vprašanj.',
        subject: 'Splošno',
        questions: [
            {
                question: 'Katero je glavno mesto Slovenije?',
                answerType: 2,
                answers: ['Ljubljana', 'Maribor', 'Celje'],
            },
        ],
    },
    {
        key: 3,
        title: 'Zgodovina Evrope',
        description: 'Kviz o pomembnih dogodkih evropske zgodovine.',
        subject: 'Zgodovina',
        questions: [
            {
                question: 'Kdaj se je začela 2. svetovna vojna?',
                answerType: 1,
                answers: ['1939'],
            },
        ],
    },
    {
        key: 4,
        title: 'Naravoslovni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 5,
        title: 'Preverjanje poštevanke',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 6,
        title: 'Preverjanje deljenja',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 7,
        title: 'Glasbeni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 8,
        title: 'Naravoslovni kviz 2',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },

    {
        key: 9,
        title: 'Naravoslovni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 10,
        title: 'Naravoslovni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 11,
        title: 'Naravoslovni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
    {
        key: 12,
        title: 'Naravoslovni kviz',
        description: 'Kviz s slikovnimi vprašanji o naravi.',
        subject: 'Znanost',
        questions: [
            {
                question: 'Prepoznajte to rastlino po sliki.',
                answerType: 3,
            },
        ],
    },
];

export default function QuizList() {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

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

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<QuizType> => ({
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

    const columns: TableColumnsType<QuizType> = [
        {
            title: 'Naslov',
            dataIndex: 'title',
            key: 'title',
            width: '50%',
            ...getColumnSearchProps('title'),
        },
        {
            title: 'Akcija',
            key: 'action',
            width: '50%',
            render: (_, record) => (
                <Space size="middle">
                    <Link to="/lobby" style={{ color: '#34D399' }}>Začni kviz</Link> {/* TODO */}
                    <a onClick={() => console.log('Edit', record)}>Uredi</a> {/* TODO */}
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
        >{/*TODO*/}
            Dodaj Kviz 
        </Button>
        <Table<QuizType> columns={columns}
            expandable={{
                expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
                rowExpandable: (record) => record.title !== 'Not Expandable',
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
        />;
    </Flex>
};