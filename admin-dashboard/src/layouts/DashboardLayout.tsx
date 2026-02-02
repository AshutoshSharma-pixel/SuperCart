import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users } from 'lucide-react';

const DashboardLayout = () => {
    return (
        <div className="layout">
            <div className="sidebar">
                <div className="brand">
                    <ShoppingBag size={24} />
                    SuperCart
                </div>
                <nav>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <ShoppingBag size={20} />
                        Products
                    </NavLink>
                    <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span>💳</span>
                        Transactions
                    </NavLink>
                    <NavLink to="/flags" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span style={{ color: '#EF4444' }}>🚩</span>
                        Flagged
                    </NavLink>
                    <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        Customers
                    </NavLink>
                </nav>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
