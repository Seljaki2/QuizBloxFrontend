import { Header } from "antd/es/layout/layout";
import { Link } from "react-router";
import styles from "./NavBar.module.css";
import { Menu } from "antd";


export default function NavBar() {
  const centerItems = [
    { key: "home", label: "Domov", to: "/" },
    { key: "quizzes", label: "Kvizi", to: "/quizzes" },
    { key: "report", label: "Poročila", to: "/reports" },
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.sideSpacer}></div>

      <Menu
        className={styles.navMenu}
        mode="horizontal"
        items={centerItems}
      />

      <Link className={styles.linkMenu} to="/login">
        Prijava / Račun
      </Link>
    </Header>
  );
}
