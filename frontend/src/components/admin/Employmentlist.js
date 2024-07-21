import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography as MuiTypography,
    IconButton,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';

const EmployeeList = () => {
    const [usersData, setUsersData] = useState([]);
    const [permissionsData, setPermissionsData] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployeeData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login'); // Redirect to login if no token
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/get-emplist', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch employee data');
                }

                const data = await response.json();
                setUsersData(data.usersData);
                setPermissionsData(data.permissionsData);
            } catch (error) {
                console.error('Error fetching employee data:', error);
                // Handle error fetching data (e.g., redirect to error page)
            }
        };

        fetchEmployeeData();
    }, [navigate]);

    const getPermissionsForUser = (userId) => {
        return permissionsData.find(permission => permission.user_id === userId);
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('authToken');
        if (!token || deleteUserId === null) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete-user/${deleteUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Remove the deleted user from the state
            setUsersData((prevEmployees) => prevEmployees.filter((employee) => employee.id !== deleteUserId));
            setSnackbarMessage('User deleted successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error deleting user:', error);
            setSnackbarMessage('Error deleting user');
            setSnackbarOpen(true);
        } finally {
            setOpenDeleteDialog(false); // Close the dialog after handling the deletion
        }
    };

    const openConfirmationDialog = (userId) => {
        setDeleteUserId(userId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteUserId(null);
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h4" gutterBottom>
                                    Employee List
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate('/dashboard/admin/emp-list/create')}
                                    sx={{ mb: 2 }}
                                >
                                    Create User
                                </Button>
                            </Box>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Username</TableCell>
                                            <TableCell>Is Admin</TableCell>
                                            <TableCell>Upload File</TableCell>
                                            <TableCell>Delete File</TableCell>
                                            <TableCell>Create Folder</TableCell>
                                            <TableCell>Delete Folder</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usersData.map(user => {
                                            const permissions = getPermissionsForUser(user.id);
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.id}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>{permissions?.uploadFile ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>{permissions?.deleteFile ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>{permissions?.createFolder ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>{permissions?.deleteFolder ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            onClick={() => navigate(`/dashboard/admin/emp-list/${user.id}/edit`)}
                                                        >
                                                            <EditIcon/>
                                                        </Button>
                                                        <Button 
                                                            onClick={() => openConfirmationDialog(user.id)}
                                                        >
                                                            <DeleteForeverIcon/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <MuiTypography>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </MuiTypography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={closeSnackbar}
                message={snackbarMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={closeSnackbar}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Container>
    );
};

export default EmployeeList;
