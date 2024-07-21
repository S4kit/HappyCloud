import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    MenuItem,
    Select,
    Box,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ folders = [], onCreateFolder, onDeleteFolder, permissions }) => {
    const navigate = useNavigate();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [parentFolderId, setParentFolderId] = useState(null);
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setNewFolderName('');
        setParentFolderId(null);
    };

    const handleOpenDeleteDialog = (folderId) => {
        setSelectedFolderId(folderId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedFolderId(null);
    };

    const handleCreateFolder = async () => {
        await onCreateFolder(newFolderName, parentFolderId);
        handleCloseCreateDialog();
    };

    const handleDeleteFolder = async () => {
        await onDeleteFolder(selectedFolderId);
        handleCloseDeleteDialog();
    };

    const renderFolders = (folder) => {
        return (
            <Accordion key={folder.id} sx={{ mb: 1 }}>
                <AccordionSummary onClick={() => navigate(`/files/${folder.id}/${folder.folderName}`)}>
                    <Typography variant="subtitle1" sx={{ cursor: 'pointer' }}>
                        {folder.folderName}
                    </Typography>
                    {permissions.deleteFolder ? (
                        <IconButton onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(folder.id); }} size="small" color="error">
                            <ClearIcon />
                        </IconButton>
                    ):(null)}
                </AccordionSummary>
                <AccordionDetails>
                    {folder.children && folder.children.map((subfolder) => renderFolders(subfolder))}
                </AccordionDetails>
            </Accordion>
        );
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
        <Paper elevation={3} sx={{ flex: 1, height: 'calc(100vh - 150px)', overflow: 'auto', padding: 1 }}>
            <Box>
                <Typography variant="h6" gutterBottom>
                    Folders in the current path
                </Typography>
                {folders.map((folder) => renderFolders(folder))}
                {permissions.createFolder ? (
                    <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mt: 2 }}>
                        Create Folder
                    </Button>
                ):(null)}
            </Box>

            {/* Create Folder Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Folder Name"
                        type="text"
                        fullWidth
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <Select
                        fullWidth
                        value={parentFolderId}
                        onChange={(e) => setParentFolderId(e.target.value)}
                        displayEmpty
                        margin="normal"
                    >
                        <MenuItem value={null}>None</MenuItem>
                        {renderFolderOptions(folders)}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Folder Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} fullWidth maxWidth="sm">
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this folder?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteFolder} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default Sidebar;
