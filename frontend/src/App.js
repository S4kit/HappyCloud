import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard';
import FileDisplay from './components/filedisplay';
import AdminDashboard from './components/admin/adminDashboard';
import EmployeeList from './components/admin/Employmentlist';
import UserForm from './components/admin/userForm';
import AdminOverview from './components/admin/adminOverview';

function App() {
return (

<Router>
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} /> {/* Redirect to login */}
        <Route path="/files/:folderId/:folderName" element={<FileDisplay />} />



        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/admin/emp-list" element={<EmployeeList />} />
        <Route path="/dashboard/admin/emp-list/create" element={<UserForm />} />
        <Route path="/dashboard/admin/emp-list/:userId/edit" element={<UserForm />} />
        <Route path="/dashboard/admin/overview" element={<AdminOverview />} />



    </Routes>
</Router>

);
}

export default App;
