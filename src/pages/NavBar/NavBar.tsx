import { Menu } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link } from "react-router";
import './NavBar.css'
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { Button, Flex } from 'antd';

export default function NavBar() {
    const { user, signOut } = useContext(UserContext);
    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <Link className="linkMenu" to="/profile">
                    Račun
                </Link>
            ),
        },
        {
            key: '2',
            label: (
                <a rel="noopener noreferrer" onClick={signOut} href="/">
                    Logout
                </a>
            ),
            danger: true,
        },

    ];

    const centerItems = [
        { key: "home", label: "Home" },
        { key: "quizzes", label: "Quizzes" },
        { key: "report", label: "Report" },
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'flex-end', backgroundColor: "var(--BACKGROUND)", borderBottom: '1px solid var(--CONTAINER)' }}>
            <Menu className="navMenu"
                mode="horizontal"
                items={centerItems}

            />
            {(() => {
                return user ? (
                    <Dropdown menu={{ items }}>
                        <Link className="linkMenu" to="">
                            user.username
                        </Link>
                    </Dropdown>
                ) : (
                    <Link className="linkMenu" to="/login">
                        Prijava / Račun
                    </Link>
                );
            })()}

        </Header>
    )
}