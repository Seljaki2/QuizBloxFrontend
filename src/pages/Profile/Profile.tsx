import { Card, Button, Flex} from "antd";
import styles from "./profile.module.css"

const uporabnik = {
    username : "Bobby",
    teacherStatus : false
}

export default function Profile() {
    return (
        <Card variant="borderless" className={styles.card}>
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
            <Button danger type="primary" className={styles.ChangeButton}>Spremeni geslo</Button>
            </Flex>
        </Card>
    )
}