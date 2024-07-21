import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Box,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    Grid,
    Typography
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';

const UserForm = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [permissions, setPermissions] = useState({
        uploadFile: false,
        deleteFile: false,
        createFolder: false,
        deleteFolder: false,
    });

    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login'); // Redirect to login if no token
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:8000/get-user/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }

                    const data = await response.json();
                    setUsername(data.username);
                    setIsAdmin(data.isAdmin);
                    setPermissions({
                        uploadFile: data.permissions.uploadFile,
                        deleteFile: data.permissions.deleteFile,
                        createFolder: data.permissions.createFolder,
                        deleteFolder: data.permissions.deleteFolder,
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };

            fetchUserData();
        }
    }, [userId, navigate]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        const url = userId ? `http://localhost:8000/update-user/${userId}` : 'http://localhost:8000/create-user';
        const method = 'POST';

        const payload = {
            username,
            isAdmin,
            permissions,
        };

        if (password) {
            payload.password = password;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit user data');
            }

            navigate('/dashboard/admin/emp-list');
        } catch (error) {
            console.error('Error submitting user data:', error);
        }
    };

    return (
        <Container maxWidth="xl">
            <AdminNavbar />
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <AdminSidebar />
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={3} sx={{ flex: 1, height: 'calc(100vh - 150px)', overflow: 'auto' }}>
                        <Box p={2}>
                            <Typography variant="h4" gutterBottom>
                                {userId ? 'Edit User' : 'Create User'}
                            </Typography>
                            <form onSubmit={handleFormSubmit}>
                                <TextField
                                    label="Username"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                {!userId && (
                                    <TextField
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                )}
                                {userId && (
                                    <TextField
                                        label="Password (Optional)"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                )}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                        />
                                    }
                                    label="Is Admin"
                                />
                                <Typography variant="h6" gutterBottom>
                                    Permissions
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={permissions.uploadFile}
                                            onChange={(e) =>
                                                setPermissions({ ...permissions, uploadFile: e.target.checked })
                                            }
                                        />
                                    }
                                    label="Upload File"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={permissions.deleteFile}
                                            onChange={(e) =>
                                                setPermissions({ ...permissions, deleteFile: e.target.checked })
                                            }
                                        />
                                    }
                                    label="Delete File"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={permissions.createFolder}
                                            onChange={(e) =>
                                                setPermissions({ ...permissions, createFolder: e.target.checked })
                                            }
                                        />
                                    }
                                    label="Create Folder"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={permissions.deleteFolder}
                                            onChange={(e) =>
                                                setPermissions({ ...permissions, deleteFolder: e.target.checked })
                                            }
                                        />
                                    }
                                    label="Delete Folder"
                                />
                                <Box mt={2}>
                                    <Button variant="contained" color="primary" type="submit">
                                        {userId ? 'Update User' : 'Create User'}
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserForm;
