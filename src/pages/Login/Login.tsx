import { Card, Button, Checkbox, Form, Input, type FormProps } from "antd";
import styles from "./Login.module.css"
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../fetch/user";

type FieldType = {
    email?: string;
    password?: string;
    remember?: string;
};

export default function Login() {
    const navigate = useNavigate();

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        try {
            const requiredFields = ['email', 'password'];

            for (const field of requiredFields) {
                const value = values[field as keyof typeof values];
                if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                    console.error(`Validation Error: Required field "${field}" is missing.`);
                    throw new Error(`Please fill out the required field: ${field}.`);
                }
            }

            const { user } = await loginUser(
                values.email!,
                values.password!,
                Boolean(values.remember)
            );

            console.log("Firebase user:", user);

            navigate("/");
        } catch (error: any) {
            console.error("Registration failed:", error);
        }
    };

    const onFinishFailed = () => {
    };

    return (
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
                    <Checkbox className={styles.checkbox}>Zapomni si me</Checkbox>
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
    )
}