import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import styles from "./QuizLayoutWrapper.module.css";
import { Outlet } from "react-router-dom";

export default function QuizLayoutWrapper() {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
