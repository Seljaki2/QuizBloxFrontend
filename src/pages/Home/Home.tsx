import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { connectToSession } from '../../fetch/GAMINGSESSION';
import { useNavigate } from 'react-router-dom';
import { closeSocket, socket } from '../../fetch/socketio';
import styles from "./Home.module.css";

const QuizJoin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  const [form] = Form.useForm();

  const handleJoin = async (values: { joinCode: string; username: string }) => {
    try {
      setLoading(true);
      const data = await connectToSession(values.joinCode, values.username);
      console.log('Joining quiz with:', data);

      setSessionData(data);
      navigate('/lobby');
      message.success(`Joined successfully as ${values.username}!`);
    } catch (error) {
      console.error(error);
      message.error('Failed to join. Please try again.');
      if (socket) {
        closeSocket();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.card}>
    <h1 className={styles.header}>PRIDRUŽI SE KVIZU</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleJoin}
        requiredMark="optional"
      >
        <Form.Item
          label="Koda"
          name="joinCode"
          rules={[{ required: true, message: '' }]}
        >
          <Input placeholder="Vnesi kodo" />
        </Form.Item>

        <Form.Item
          label="Uporabniško ime"
          name="username"
          rules={[{ required: true, message: 'Niste prijavljeni, rabite uporabniško ime' }]}
        >
          <Input placeholder="izberite uporabniško ime" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Pridruži se
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default QuizJoin;
