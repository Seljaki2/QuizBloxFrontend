import { Header } from "antd/es/layout/layout";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function NavBar() {
  const { user, signOut } = useContext(UserContext);
  const navigate = useNavigate();

  const centerItems = [
    { key: "home", label: <Link to="/">Domov</Link> },
    { key: "quizzes", label: <Link to="/quizzes">Kvizi</Link> },
    { key: "report", label: <Link to="/reports">Poročila</Link> },
  ];

  const dropdownItems = [
    {
      key: "0",
      label: (
        <Button type="text" onClick={() => navigate("/profile")} style={{ padding: 0, color: "#ffffff" }}>
          Račun
        </Button>
      ),
    },
    {
      key: "1",
      danger: true,
      label: (
        <Button type="text" onClick={signOut} style={{ padding: 0, color: "#ffffff" }}>
          Odjava
        </Button>
      ),
    }
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.sideSpacer}></div>

      <Menu className={styles.navMenu} mode="horizontal" items={centerItems} />

      {user ? (
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" >
          <Button type="text" style={{ color: 'white' }}>
            {user.username} <DownOutlined />
          </Button>
        </Dropdown>


      ) : (
        <Link className={styles.linkMenu} to="/login">
          Prijavi se!
        </Link>
      )}
    </Header>
  );
}
