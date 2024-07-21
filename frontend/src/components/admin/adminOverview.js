import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';

const AdminOverview = () => {
    const [overviewData, setOverviewData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOverviewData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login'); // Redirect to login if no token
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/get-overview', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch overview data');
                }

                const data = await response.json();
                setOverviewData(data);
            } catch (error) {
                console.error('Error fetching overview data:', error);
            }
        };

        fetchOverviewData();
    }, []);

    const truncateName = (fileName, maxLength) => {
        if (fileName.length > maxLength) {
            return `${fileName.substring(0, maxLength)}...`;
        }
        return fileName;
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
                                Overview of Uploaded Files and Folders
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Username</TableCell>
                                            <TableCell>File Name</TableCell>
                                            <TableCell>File Type</TableCell>
                                            <TableCell>File Size</TableCell>
                                            <TableCell>Folder Name</TableCell>
                                            <TableCell>Upload Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {overviewData.map((data) => (
                                            <TableRow key={data.fileId}>
                                                <TableCell>{data.username}</TableCell>
                                                <TableCell title={data.fileNAme}>{truncateName(data.fileName,15)}</TableCell>
                                                <TableCell>{data.fileType}</TableCell>
                                                <TableCell>{data.fileSize}</TableCell>
                                                <TableCell title={data.folderName}>{truncateName(data.folderName,20)}</TableCell>
                                                <TableCell>{new Date(data.uploadDate).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminOverview;
