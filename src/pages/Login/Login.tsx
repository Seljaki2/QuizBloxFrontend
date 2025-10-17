import { Card, Button, Checkbox, Form, Input, type FormProps, Flex } from "antd";
import styles from "./Login.module.css"
import { useNavigate } from "react-router-dom";

type FieldType = {
    email?: string;
    password?: string;
    remember?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
};

export default function Login() {
    const navigate = useNavigate();

    return (
        <Flex
            justify="center" align="center"
            className={styles.container}
        >
            <Card variant="borderless" className={styles.card}>
                <h1 className={styles.header}>
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
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Prosim vstavite email!" }]}>
                        <Input className={styles.input} />
                    </Form.Item>

                    <Form.Item label="Geslo" name="password" rules={[{ required: true, message: "Prosim vstavite geslo!" }]}>
                        <Input.Password className={styles.input} />
                    </Form.Item>

                    <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
                        <Checkbox >Zapomni si me</Checkbox>
                    </Form.Item>
                    <Form.Item label={null}>

                        <div className={styles.buttonFlex}>
                            <Button type="primary" htmlType="submit" className={styles.buttonLogin}>
                                Prijavi se
                            </Button>

                            <Button className={styles.buttonRegister}
                                onClick={() => navigate("/register")}
                            >
                                Registracija
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    )
}