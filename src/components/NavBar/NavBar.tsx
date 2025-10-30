import { Header } from "antd/es/layout/layout";
import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { createSession } from "../../fetch/GAMINGSESSION";

export default function NavBar() {
  const { user, signOut } = useContext(UserContext);

  const centerItems = [
    { key: "home", label: <Link to="/">Domov</Link> },
    { key: "quizzes", label: <Link to="/quizzes">Kvizi</Link> },
    { key: "report", label: <Link to="/reports">Poročila</Link> },
  ];

  const dropdownItems = [
    {
      key: "1",
      label: <Link to="/profile">Profil</Link>,
    },
    {
      key: "2",
      danger: true,
      label: (
        <Button type="text" onClick={signOut} style={{ padding: 0, color: "#ffffff" }}>
          Odjava
        </Button>
      ),
    },
    {
      key: "3",
      label: <Button type="text" onClick={() => {console.log(createSession({quizId:"c06cef94-56c2-449a-a693-9f39ad91d987"}));}} style={{ padding: 0 }}>Begin Session</Button>,
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
