import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Flags from './pages/Flags';
import Stores from './pages/Stores';
import Login from './pages/Login';

// Simple Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="users" element={<Users />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="flags" element={<Flags />} />
                    <Route path="stores" element={<Stores />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
