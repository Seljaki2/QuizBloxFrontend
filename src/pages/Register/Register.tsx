import { Card, Button, Checkbox, Form, Input, type FormProps, Flex } from "antd";
import styles from "./Register.module.css"
import { useNavigate } from "react-router-dom";

type FieldType = {
    firsName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    password?: string;
    isTeacher?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
};

export default function Register() {
    const navigate = useNavigate();
    return (
        <Flex
            justify="center" align="center"
            className={styles.container}
        >
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
                    <Form.Item label="Ime" name="firstName" rules={[{ required: true, message: "Prosim vstavite vaše ime!" }]}>
                        <Input
                            className={styles.input}
                        />
                    </Form.Item>

                    <Form.Item label="Priimek" name="lastName" rules={[{ required: true, message: "Prosim vstavite vaš priimek!" }]}>
                        <Input
                            className={styles.input}
                        />
                    </Form.Item>

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
                        <Checkbox >Ste učitelj?</Checkbox>
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
        </Flex>
    )
}
