import { Card, Button, Checkbox, Form, Input, type FormProps, Flex } from 'antd';

type FieldType = {
    firsName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    isTeacher?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

export default function Register() {
    return (
        <Flex 
        justify='center' align='center'
        style={{
            height: '100vh',
            width: '100%',
            boxSizing: 'border-box',
        }}
        >
            <Card variant='borderless'
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    minWidth: '320px',
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
                    REGISTRACIJA
                </h1>
                <Form
                    style={{ width: '100%' }}
                    name="login"
                    layout="vertical"
                    initialValues={{ isTeacher: false }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    requiredMark="optional"
                >
                    <Form.Item label="Ime" name='firstName' rules={[{ required: true, message: 'Prosim vstavite vaše ime!' }]}>
                        <Input
                            style={{
                                height: '35px',
                                fontSize: '16px',
                            }}
                        />
                    </Form.Item>

                    <Form.Item label="Priimek" name='lastName' rules={[{ required: true, message: 'Prosim vstavite vaš priimek!' }]}>
                        <Input
                            style={{
                                height: '35px',
                                fontSize: '16px',
                            }}
                        />
                    </Form.Item>

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

                    <Form.Item<FieldType> name="isTeacher" valuePropName="checked" label={null}>
                        <Checkbox >Ste učitelj?</Checkbox>
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
                                    width: '50%',
                                    padding: '20px 0',
                                    fontSize: '16px',
                                    textAlign: 'center',
                                }}
                            >
                                Registriraj se
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
                                onClick={() => console.log('Navigacija na prijavo')}
                            >
                                Prijava
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    )
}
/*
style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '400px',
                height: '100vh',
                boxSizing:'border-box'
            }}*/