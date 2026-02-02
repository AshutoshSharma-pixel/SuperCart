import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Flags from './pages/Flags';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="users" element={<Users />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="flags" element={<Flags />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
