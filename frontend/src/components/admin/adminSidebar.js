import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, People, Folder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
    const navigate = useNavigate();

    return (
        <List>
            <ListItem button onClick={() => navigate('/dashboard/admin/overview')}>
                <ListItemIcon>
                    <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Overview" />
            </ListItem>
            <ListItem button onClick={() => navigate('/dashboard/admin/emp-list')}>
                <ListItemIcon>
                    <People />
                </ListItemIcon>
                <ListItemText primary="Employees" />
            </ListItem>
        </List>
    );
};

export default AdminSidebar;
