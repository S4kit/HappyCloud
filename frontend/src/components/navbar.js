import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Popover,
    Box,
    MenuItem,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Navbar = ({ user, onLogout, isAdmin }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    HappyCloud, share your files safely
                </Typography>
                {isAdmin ? (
                    <Button
                        color="inherit"
                        startIcon={<AdminPanelSettingsIcon />}
                        onClick={() => navigate('/dashboard/admin')}
                    >
                        Admin Dashboard
                    </Button>
                ):(null)}
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="user-menu"
                    aria-haspopup="true"
                    onClick={handlePopoverOpen}
                    color="inherit"
                >
                    <Avatar />
                </IconButton>
                <Popover
                    id="user-menu"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Box p={2}>
                        <MenuItem onClick={null}>{user}</MenuItem>
                        <MenuItem onClick={onLogout}>Logout</MenuItem>
                    </Box>
                </Popover>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
