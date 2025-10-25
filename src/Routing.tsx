import { Routes, Route } from 'react-router';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register'
import Home from './pages/Home/Home';
import LayoutWrapper from './components/LayoutWrapper/LayoutWrapper';
import AddNewQuiz from './pages/AddNewQuiz/AddNewQuiz';

export default function Routing() {
    return (
        <Routes>
            <Route element={<LayoutWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/testing" element={<AddNewQuiz />} />{/*temporary za izdelavo na frontende*/}
            </Route>
        </Routes>
    );
}