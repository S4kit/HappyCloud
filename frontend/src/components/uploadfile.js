import React, { useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Snackbar,
    IconButton,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloseIcon from '@mui/icons-material/Close';

const UploadFile = ({ folders, token, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [uploading, setUploading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: false,
    });

    const handleFileUpload = async () => {
        if (!selectedFile || !selectedFolder) {
            console.error('Please select a file and a folder');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder_id', selectedFolder);

        setUploading(true);

        try {
            const response = await fetch('http://localhost:8000/dashboard/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setSnackbarMessage('File uploaded successfully');
            setSnackbarOpen(true);
            setSelectedFile(null);
            setSelectedFolder('');
            onUploadSuccess(data);
        } catch (error) {
            console.error('Error uploading file:', error);
            setSnackbarMessage('Error uploading file');
            setSnackbarOpen(true);
        } finally {
            setUploading(false);
        }
    };

    const closeSnackbar = () => {
        setSnackbarOpen(false);
    };

    const renderFolderOptions = (folders, depth = 0) => {
        return folders.flatMap((folder) => {
            const options = [
                <MenuItem key={folder.id} value={folder.id}>
                    {depth > 0 ? '\u00A0'.repeat(depth * 3) : ''} {folder.folderName}
                </MenuItem>,
            ];
            if (folder.children && folder.children.length > 0) {
                options.push(...renderFolderOptions(folder.children, depth + 1));
            }
            return options;
        });
    };

    return (
        <Paper elevation={3} sx={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            <Box p={2}>
                <Typography variant="h6" gutterBottom>
                    Upload Files
                </Typography>
                <Box
                    mt={2}
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed #ccc',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <input {...getInputProps()} />
                    <Typography variant="body2" color="textSecondary">
                        Drag and drop a file here, or click to select a file
                    </Typography>
                </Box>
                <Box mt={2}>
                    <FormControl fullWidth>
                        <InputLabel>Select Folder</InputLabel>
                        <Select
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">None</MenuItem>
                            {renderFolderOptions(folders)}
                        </Select>
                    </FormControl>
                </Box>
                <Box mt={2}>
                    <Button
                        variant="contained"
                        onClick={handleFileUpload}
                        disabled={!selectedFile || !selectedFolder || uploading}
                    >
                        {uploading ? <CircularProgress size={24} /> : 'Upload File'}
                    </Button>
                </Box>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={closeSnackbar}
                message={snackbarMessage}
                action={
                    <IconButton size="small" color="inherit" onClick={closeSnackbar}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Paper>
    );
};

export default UploadFile;
