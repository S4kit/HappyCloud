import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Paper,
    Box,
    Typography,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Breadcrumbs,
    Link as MuiLink,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Snackbar,
    CircularProgress
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Navbar from './navbar';
import Sidebar from './sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const FileDisplay = () => {
    const { folderId, folderName } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState([]);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [parentFolderId, setParentFolderId] = useState(null);
    const [downloadLink, setDownloadLink] = useState('');
    const [openLinkDialog, setOpenLinkDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [deleteFileId, setDeleteFileId] = useState(null);
    const [hasDeletePermission, setHasDeletePermission] = useState(false);
    const [permissions, setPermissions] = useState({});

    useEffect(() => {
        const fetchFilesAndFolders = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login'); // Redirect to login if no token
                return;
            }

            try {
                // Fetch folders
                const foldersResponse = await fetch('http://localhost:8000/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!foldersResponse.ok) {
                    throw new Error('Failed to fetch folders');
                }
                const foldersData = await foldersResponse.json();
                setFolders(foldersData.folders);
                setPermissions(foldersData.permissions); 
                // Fetch files for the current folder
                const filesResponse = await fetch(`http://localhost:8000/folder/${folderId}/files`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!filesResponse.ok) {
                    throw new Error('Failed to fetch files');
                }
                const filesData = await filesResponse.json();
                setFiles(filesData.files);
                setCurrentFolder(filesData.folders);
            } catch (error) {
                console.error('Error fetching files and folders:', error);
            }
        };

        fetchFilesAndFolders();
    }, [folderId, navigate]);

    useEffect(() => {
        const checkPermissions = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login'); // Redirect to login if no token
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
                    throw new Error('Failed to check permissions');
                }
                const data = await response.json();
                setHasDeletePermission(data.permissions.deleteFolder);
            } catch (error) {
                console.error('Error checking permissions:', error);
            }
        };

        checkPermissions();
    }, [navigate]);

    const handleReturn = () => {
        if (folders.length > 0) {
            const currentFolder = folders.find(folder => folder.id === parseInt(folderId));
            if (currentFolder && currentFolder.parent_id !== null && currentFolder.parent_id !== undefined) {
                const parentFolder = folders.find(folder => folder.id === currentFolder.parent_id);
                if (parentFolder) {
                    navigate(`/files/${parentFolder.id}/${parentFolder.folderName}`);
                } else {
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    const truncateFileName = (fileName, maxLength) => {
        if (fileName.length > maxLength) {
            return `${fileName.substring(0, maxLength)}...`;
        }
        return fileName;
    };

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

            // Update the folder list after creation
            setFolders((prevFolders) => {
                const updateFolderTree = (folders, newFolder) => {
                    return folders.map((folder) => {
                        if (folder.id === newFolder.parent_id) {
                            return {
                                ...folder,
                                children: [...folder.children, newFolder]
                            };
                        } else if (folder.children) {
                            return {
                                ...folder,
                                children: updateFolderTree(folder.children, newFolder)
                            };
                        }
                        return folder;
                    });
                };

                if (parentFolderId === null) {
                    return [...prevFolders, newFolder];
                } else {
                    return updateFolderTree(prevFolders, newFolder);
                }
            });

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

            // Update the folder list after deletion
            setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== folderId));
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    const handleDeleteFile = async () => {
        if (!hasDeletePermission) {
            setSnackbarMessage('Unauthorized: You do not have permission to delete files');
            setSnackbarOpen(true);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete-file/${deleteFileId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // Update the files list after deletion
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== deleteFileId));
            setDeleteFileId(null); // Clear the file ID after deletion
            setSnackbarMessage('File deleted successfully');
            setSnackbarOpen(true);
            return;
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleOpenLinkDialog = async (fileId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/generate-download-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ fileId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate download link');
            }

            const data = await response.json();
            setDownloadLink(data.link);
            setOpenLinkDialog(true);
        } catch (error) {
            console.error('Error generating download link:', error);
            setSnackbarMessage('Error generating download link');
            setSnackbarOpen(true);
        }
    };

    const handleCloseLinkDialog = () => {
        setOpenLinkDialog(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(downloadLink);
        setSnackbarMessage('Link copied to clipboard');
        setSnackbarOpen(true);
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: 4 }}>
            <Navbar />
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Sidebar
                        folders={currentFolder}
                        onCreateFolder={handleCreateFolder}
                        onDeleteFolder={handleDeleteFolder}
                        permissions={permissions}
                    />
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={3} sx={{ flex: 1, height: 'calc(100vh - 150px)', overflow: 'auto', padding: 1 }}>
                        <Box p={2}>
                            <Breadcrumbs aria-label="breadcrumb" sx={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                                <MuiLink color="inherit" onClick={handleReturn} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ArrowBackIcon />
                                    <Typography variant="h6" gutterBottom>
                                        Files in {folderName}
                                    </Typography>
                                </MuiLink>
                            </Breadcrumbs>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Icon</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Size</TableCell>
                                            <TableCell>Upload Date</TableCell>
                                            <TableCell>Number of Downloads</TableCell>
                                            <TableCell>Deletion</TableCell>
                                            <TableCell>Generate Download Link</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {files.map((file, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <InsertDriveFileIcon />
                                                </TableCell>
                                                <TableCell>{truncateFileName(file.fileName, 20)}</TableCell>
                                                <TableCell>{file.fileSize} KB</TableCell>
                                                <TableCell>{new Date(file.uploadDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{file.downloads}</TableCell>
                                                <TableCell>
                                                    <DeleteForeverIcon
                                                        onClick={() => {
                                                            setDeleteFileId(file.id);
                                                            handleDeleteFile();
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleOpenLinkDialog(file.id)}>
                                                        Generate Link
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={openLinkDialog} onClose={handleCloseLinkDialog}>
                <DialogTitle>Download Link</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">This link will expire in 10 minutes.</Typography>
                    <TextField
                        fullWidth
                        margin="dense"
                        value={downloadLink}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <IconButton onClick={handleCopyLink} edge="end">
                                    <ContentCopyIcon />
                                </IconButton>
                            ),
                        }}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLinkDialog} color="primary">
                        Close
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

export default FileDisplay;
