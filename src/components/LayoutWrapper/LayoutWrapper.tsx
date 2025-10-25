import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import NavBar from "../NavBar/NavBar";
import styles from "./LayoutWrapper.module.css";
import { Outlet } from "react-router-dom";

export default function LayoutWrapper() {
  return (
    <Layout className={styles.layout}>
      <NavBar />
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
