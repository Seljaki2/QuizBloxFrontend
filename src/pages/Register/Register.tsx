import { Card, Button, Checkbox, Form, Input, type FormProps } from "antd";
import styles from "./Register.module.css"
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../fetch/user";
import React from "react";

type FieldType = {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    isTeacher?: boolean;
};


export default function Register() {
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        try {
            setLoading(true);
            const requiredFields = ['email', 'password', 'firstName', 'lastName', 'username'];

            for (const field of requiredFields) {
                const value = values[field as keyof typeof values];
                if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                    console.error(`Validation Error: Required field "${field}" is missing.`);
                    throw new Error(`Please fill out the required field: ${field}.`);
                }
            }

            const { user, backendData } = await registerUser(
                values.email!,
                values.password!,
                values.firstName!,
                values.lastName!,
                values.username!,
                values.isTeacher!,
            );

            console.log("Firebase user:", user);
            console.log("Backend response:", backendData);

            navigate("/");
        } catch (error: any) {
            console.error("Registration failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
        console.log("Form validation failed:", errorInfo);
    };

    return (
        <Card variant="borderless"
            className={styles.card}
        >
            <h1
                className={styles.header}
            >
                REGISTRACIJA
            </h1>
            <Form
                name="login"
                layout="vertical"
                initialValues={{ isTeacher: false }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                requiredMark="optional"
            >
                <div className={styles.nameRow}>
                    <Form.Item
                        label="Ime"
                        name="firstName"
                        rules={[{ required: true, message: "Prosim vstavite vaše ime!" }]}
                        className={styles.nameItem}
                    >
                        <Input className={styles.input} />
                    </Form.Item>

                    <Form.Item
                        label="Priimek"
                        name="lastName"
                        rules={[{ required: true, message: "Prosim vstavite vaš priimek!" }]}
                        className={styles.nameItem}
                    >
                        <Input className={styles.input} />
                    </Form.Item>
                </div>

                <Form.Item label="Uporabniško ime" name="username" rules={[{ required: true, message: "Prosim vstavite vašo uporabniško ime!" }]}>
                    <Input
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Prosim vstavite email!" }]}>
                    <Input
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item label="Geslo" name="password" rules={[{ required: true, message: "Prosim vstavite geslo!" }]}>
                    <Input.Password
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item<FieldType> name="isTeacher" valuePropName="checked" label={null}>
                    <Checkbox className={styles.checkbox}>Ste učitelj?</Checkbox>
                </Form.Item>
                <Form.Item label={null}>

                    <div className={styles.buttonFlex}>
                        <Button type="primary" htmlType="submit" className={styles.buttonRegister}>
                            Registriraj se
                        </Button>

                        <Button
                            className={styles.buttonLogin}
                            onClick={() => navigate("/login")}>
                            Prijava
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    )
}
