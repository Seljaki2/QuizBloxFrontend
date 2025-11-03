import { Card, Button, Flex, Form, Input } from "antd";
import styles from "./profile.module.css"
import React from "react";

const uporabnik = {
    username: "Bobby",
    teacherStatus: false
};


export default function Profile() {
    const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const change = () => {
    setIsChangingPassword(!isChangingPassword);
  };

    return (
        <Card variant="borderless" className={styles.card}>
            {!isChangingPassword ?
                (<>
                    <h1 className={styles.header}>
                        RAČUN
                    </h1>
                    <h3 className={styles.header}>
                        <span className={styles.contentStatic}>Uporabniško ime:</span> {uporabnik.username}
                    </h3>
                    <p className={styles.header}>
                        <span className={styles.contentStatic}>Status:</span> {uporabnik.teacherStatus ? "Učitelj" : "Učenec"}
                    </p>
                    <Flex justify="flex-end">
                        <Button danger type="primary" className={styles.ChangeButton} onClick={change}>Spremeni geslo</Button>
                    </Flex>
                </>
                )
                : (
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
                                <Button type="primary" htmlType="submit" className={styles.ChangeButton} onClick={change}>Spremeni geslo</Button>
                            </Flex>
                        </Form>
                    </>
                )
            }

        </Card>
    )
}