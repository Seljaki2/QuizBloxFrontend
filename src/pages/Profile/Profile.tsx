import { Card, Button, Flex, Form, Input, message } from "antd";
import styles from "./profile.module.css"
import React, { use, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user } = React.useContext(UserContext);
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);
    const navigate = useNavigate();

    const handlePasswordChange = async (values) => {
        const { oldPassword, newPassword } = values;
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            const credential = EmailAuthProvider.credential(currentUser!.email, oldPassword);
            await reauthenticateWithCredential(currentUser!, credential);
            await updatePassword(currentUser!, newPassword);
            message.success('Geslo uspešno spremenjeno!');
            setIsChangingPassword(false);
        } catch (error) {
            message.error('Napaka pri posodabljanju gesla: ');
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
        };
    }, [user, navigate]);

    const toggleChangePassword = () => {
        setIsChangingPassword(!isChangingPassword);
    };

    return (
        <Card variant="borderless" className={styles.card}>
            {!isChangingPassword ? (
                <>
                    <h1 className={styles.header}>
                        RAČUN
                    </h1>
                    <h3 className={styles.header}>
                        <span className={styles.contentStatic}>Uporabniško ime:</span> {user?.username}
                    </h3>
                    <p className={styles.header}>
                        <span className={styles.contentStatic}>Status:</span> {user?.isTeacher ? "Učitelj" : "Učenec"}
                    </p>
                    <Flex justify="flex-end">
                        <Button danger type="primary" className={styles.ChangeButton} onClick={toggleChangePassword}>Spremeni geslo</Button>
                    </Flex>
                </>
            ) : (
                <>
                    <h1 className={styles.header}>
                        SPREMEMBA GESLA
                    </h1>
                    <Form
                        name="changePassword"
                        layout="vertical"
                        initialValues={{ remember: false }}
                        autoComplete="off"
                        requiredMark="optional"
                        onFinish={handlePasswordChange}
                    >
                        <Form.Item label="Prvotno geslo" name="oldPassword" rules={[{ required: true, message: "Prosim vstavite geslo" }]}>
                            <Input.Password className={styles.input} />
                        </Form.Item>

                        <Form.Item label="Novo geslo" name="newPassword" rules={[{ required: true, message: "Prosim vstavite novo geslo!" },
                        { min: 6, message: "Geslo mora biti vsaj 6 znakov dolgo!" }
                        ]}>
                            <Input.Password className={styles.input} />
                        </Form.Item>
                        <Flex justify="flex-end">
                            <Button type="primary" htmlType="submit" className={styles.ChangeButton}>Spremeni geslo</Button>
                        </Flex>
                    </Form>
                </>
            )}
        </Card>
    );
}
