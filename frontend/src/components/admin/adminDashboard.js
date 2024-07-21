import React from 'react';
import { Container, Grid, Typography, Paper, Box } from '@mui/material';
import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';

const AdminDashboard = ({ user }) => {
    return (
        <Container maxWidth="xl">
            <AdminNavbar user={user}  />
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <AdminSidebar />
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Welcome to the Admin Dashboard
                        </Typography>
                        <Typography variant="body1">
                            Here you can manage all employees and their permissions, create new employee accounts, and view a comprehensive overview of all uploaded files and folders.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
