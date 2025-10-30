import styles from './QuizLobby.module.css'
import { useEffect, useState, useRef } from 'react';
import { Button, Flex, List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function QuizLobby() {

    interface DataType {
        username: string;
        id: string;
    }

    const allUsers: DataType[] = [
        { id: '1', username: 'Alice' },
        { id: '2', username: 'Bob' },
        { id: '3', username: 'Charlie' },
        { id: '4', username: 'Diana' },
        { id: '5', username: 'Ethan' },
        { id: '6', username: 'Fiona' },
        { id: '7', username: 'George' },
        { id: '8', username: 'Hannah' },
        { id: '9', username: 'Ian' },
        { id: '10', username: 'Jasmine' },
        { id: '11', username: 'Jasmine' },
        { id: '12', username: 'Jasmine' },

    ];

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DataType[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const loadMoreData = () => {
        if (loading) return;
        setLoading(true);

        const nextItems = allUsers.slice((page - 1) * pageSize, page * pageSize);

        setTimeout(() => {
            setData(prev => [...prev, ...nextItems]);
            setPage(prev => prev + 1);
            setLoading(false);
        },);
    };

    const hasLoaded = useRef(false);
    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;
        loadMoreData();
    }, []);

    return (
        <Flex className={styles.container} vertical gap="middle">
            <h1>KODA: 123456</h1>
            <div id="scrollableDiv" className={styles.scrollArea}>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMoreData}
                    hasMore={data.length < allUsers.length}
                    scrollableTarget="scrollableDiv" 
                    loader={<div>Nalaga...</div>}>
                    <List
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item key={item.id} style={{padding: "5px 0px"}}>
                                <List.Item.Meta title={item.username} style={{margin: "0px"}}/>
                                <Button className={styles.removeButton}>Odstrani</Button>
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>
            </div>
            <Flex justify='center' style={{width: "100%"}} gap="middle">
            <Button className={styles.buttons}>Začni</Button>
            <Button className={styles.buttons} type="primary" danger>Prekliči</Button>
            </Flex>
        </Flex>
    );
}