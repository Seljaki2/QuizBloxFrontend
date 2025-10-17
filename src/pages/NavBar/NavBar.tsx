import { Menu } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link } from "react-router";
import './NavBar.css'

export default function NavBar() {

    const centerItems = [
        { key: "home", label: "Home" }, //za navigation: <Link to="/">Home</Link>
        { key: "quizzes", label: "Quizzes" },
        { key: "report", label: "Report" },
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'flex-end',backgroundColor: "var(--BACKGROUND)", borderBottom: '1px solid var(--CONTAINER)'}}>
            <Menu className="navMenu"
                mode="horizontal"
                items={centerItems}
                
            />
            <Link className="linkMenu"
                to="/login"
            >
                Prijava / Račun {/* TODO: zamenjava med prijava in račun če je uporabnik prijavljen ali ne */}
            </Link>

        </Header>
    )
}