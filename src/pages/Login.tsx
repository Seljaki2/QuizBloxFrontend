import { Card, Button, Checkbox, Form, Input, type FormProps } from 'antd';

type FieldType = {
    email?: string;
    password?: string;
    remember?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

export default function Login() {
    return (
        <Card variant='borderless'
            style={{
                width: '100%',
                maxWidth: 500,
                borderRadius: 12,
                padding: '0px 30px 30px 30px',
                backgroundColor: 'var(--CONTAINER)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
        >
            <h1
                style={{
                    color: 'var(--TEXT)',
                    textAlign: 'center',
                    marginBottom: '25px',
                    fontWeight: 600,
                }}
            >
                PRIJAVA
            </h1>
            <Form
                name="login"
                layout="vertical"
                initialValues={{ remember: false }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                requiredMark="optional"
            >
                <Form.Item label="Email" name='email' rules={[{ required: true, type: 'email', message: 'Prosim vstavite email!' }]}>
                    <Input
                        style={{
                            height: '35px',
                            fontSize: '16px',
                        }}
                    />
                </Form.Item>

                <Form.Item label="Geslo" name="password" rules={[{ required: true, message: 'Prosim vstavite geslo!' }]}>
                    <Input.Password
                        style={{
                            height: '35px',
                            fontSize: '16px',
                        }}
                    />
                </Form.Item>

                <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
                    <Checkbox >Zapomni si me</Checkbox>
                </Form.Item>
                <Form.Item label={null}>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        
                            width: '100%',
                        }}
                    >
                        <Button type="primary" htmlType="submit"
                            style={{
                                width: '45%',
                                padding: '20px 0',
                                fontSize: '16px',
                                textAlign: 'center',
                            }}
                        >
                            Prijavi se
                        </Button>

                        <Button
                            style={{
                                width: '45%',
                                padding: '20px 0',
                                fontSize: '16px',
                                backgroundColor: 'var(--CONTAINER)',
                                color: 'var(--TEXT)',
                                textAlign: 'center',
                            }}
                            onClick={() => console.log('Navigacija na registracijo')}
                        >
                            Registracija
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    )
}