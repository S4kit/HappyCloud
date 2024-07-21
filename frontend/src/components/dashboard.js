import React, { useEffect, useState } from 'react';
import { Container, Grid, CircularProgress, Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Sidebar from './sidebar';
import UploadFile from './uploadfile';

function Dashboard() {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Unauthorized');
                }

                const data = await response.json();
                setUser(data.user);
                setPermissions(data.permissions); // Assuming `data.permissions` contains the user's permissions
                setFolders(buildFolderTree(data.folders));
                setFiles(data.files);
            } catch (error) {
                console.error('Error fetching data:', error);
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const buildFolderTree = (folders) => {
        const folderMap = {};
        const rootFolders = [];

        folders.forEach((folder) => {
            folderMap[folder.id] = { ...folder, children: [] };
        });

        folders.forEach((folder) => {
            if (folder.parent_id === null) {
                rootFolders.push(folderMap[folder.id]);
            } else {
                folderMap[folder.parent_id]?.children.push(folderMap[folder.id]);
            }
        });

        return rootFolders;
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleUploadSuccess = (data) => {
        console.log('File uploaded successfully:', data);
    };

    if (!user) {
        return (
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ padding: 4, mt: 10 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingBottom: 10 }}>
                        <Typography sx={{ paddingBottom: 10 }} variant="h4">
                            Please wait for <span style={{ color: 'red' }}>Loading</span>
                        </Typography>
                        <CircularProgress />
                    </Box>
                </Paper>
            </Container>
        );
    }

    const handleCreateFolder = async (folderName, parentFolderId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/create-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ folderName, parent_id: parentFolderId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create folder');
            }

            const newFolder = await response.json();
            // Re-fetch the folder structure after creation
            const responseFolders = await fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await responseFolders.json();
            setFolders(buildFolderTree(data.folders));
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleDeleteFolder = async (folderId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete-folder/${folderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete folder');
            }

            // Re-fetch the folder structure after deletion
            const responseFolders = await fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await responseFolders.json();
            setFolders(buildFolderTree(data.folders));
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    const token = localStorage.getItem('authToken');

    return (
        <Container maxWidth="xl" sx={{ marginTop: 4 }}>
            <Navbar onLogout={handleLogout} user={user?.username} isAdmin={user?.isAdmin} />
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Sidebar
                        folders={folders}
                        onCreateFolder={handleCreateFolder}
                        onDeleteFolder={handleDeleteFolder}
                        permissions={permissions}
                    />
                </Grid>
                <Grid item xs={8}>
                    {permissions.uploadFile ? (
                        <UploadFile folders={folders} token={token} onUploadSuccess={handleUploadSuccess} />
                    ) : (
                        <Paper elevation={3} sx={{ padding: 4 }}>
                            <Typography variant="h6" color="error">
                                You do not have permission to upload files.
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default Dashboard;
