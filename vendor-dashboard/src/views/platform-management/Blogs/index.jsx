import { Grid, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Box } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const BlogManagement = () => {
    return (
        <Grid container spacing={gridSpacing}>
            <Grid size={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3">Platform Blogs & News</Typography>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                        Write New Article
                    </Button>
                </Stack>
            </Grid>

            <Grid size={12}>
                <MainCard title="Published Content Library">
                    <TableContainer component={Paper} elevation={0}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell>Preview</TableCell>
                                    <TableCell>Title / Headline</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Author</TableCell>
                                    <TableCell>Views</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[
                                    { title: 'Choosing the best Kerala Tour Package', category: 'Kerala Travel Guide', author: 'Muhsin TP', views: '1,245' },
                                    { title: 'Top 10 Monsoon Destinations 2026', category: 'Monsoon Guide', author: 'Sub-Admin Zafar', views: '890' }
                                ].map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Box sx={{ width: 60, height: 60, bgcolor: 'grey.100', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" noWrap sx={{ maxWidth: 250 }}>{row.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">Published: 05 Apr 2026</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={row.category} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                                        </TableCell>
                                        <TableCell>{row.author}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{row.views}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                                                 <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                                                 <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                                                 <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
};

export default BlogManagement;
