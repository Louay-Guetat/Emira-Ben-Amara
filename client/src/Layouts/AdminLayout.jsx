import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminFooter from '../components/AdminFooter';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <main className="content">
                {children}
            </main>
            <AdminFooter />
        </div>
    );
}

export default AdminLayout;
