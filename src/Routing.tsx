import { Routes, Route } from 'react-router';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register'
import Home from './pages/Home/Home';

export default function Routing() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}