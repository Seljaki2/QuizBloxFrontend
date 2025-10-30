import { useEffect, useState } from 'react';
import { Divider, List, Skeleton } from 'antd';
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
        { id: '11', username: 'Kevin' },
        { id: '12', username: 'Luna' },
        { id: '13', username: 'Max' },
        { id: '14', username: 'Nora' },
        { id: '15', username: 'Oscar' },
        { id: '16', username: 'Paula' },
        { id: '17', username: 'Quinn' },
        { id: '18', username: 'Riley' },
        { id: '19', username: 'Sophia' },
        { id: '20', username: 'Tom' },
        { id: '21', username: 'Uma' },
        { id: '22', username: 'Victor' },
        { id: '23', username: 'Wendy' },
        { id: '24', username: 'Xavier' },
        { id: '25', username: 'Yara' },
        { id: '26', username: 'Zane' },
    ];

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<DataType[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 10;

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

    useEffect(() => {
        loadMoreData();
    }, []);

    return (
        <>
            <InfiniteScroll
                dataLength={data.length}
                next={loadMoreData}
                hasMore={data.length < allUsers.length}
                loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                scrollableTarget="scrollableDiv"
            >
                <List
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item key={item.id}>
                            <List.Item.Meta
                                title={<a href="#">{item.username}</a>}
                            />
                        </List.Item>
                    )}
                />
            </InfiniteScroll>
        </>
    );
}
