import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { connectToSession } from '../../fetch/GAMINGSESSION';

const QuizJoin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const handleJoin = async (values: { joinCode: string; username: string }) => {
    try {
      setLoading(true);
      const data = await connectToSession(values.joinCode, values.username);
      console.log('Joining quiz with:', data);

      // simulate success message
      message.success(`Joined successfully as ${values.username}!`);
    } catch (error) {
      console.error(error);
      message.error('Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card title="Join Quiz" style={{ width: 350 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleJoin}
        >
          <Form.Item
            label="Join Code"
            name="joinCode"
            rules={[{ required: true, message: 'Please enter the join code' }]}
          >
            <Input placeholder="Enter join code" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: false, message: 'Please enter your username' }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Join
            </Button>
          </Form.Item>
        </Form>
      </Card>
  );
};

export default QuizJoin;
