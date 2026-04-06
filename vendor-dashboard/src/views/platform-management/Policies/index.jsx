import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Typography, Button, Stack, Box, Tabs, Tab, TextField, CircularProgress, Alert, IconButton, Divider } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import PasskeyModal from 'ui-component/PasskeyModal';

// assets
import SaveIcon from '@mui/icons-material/Save';
import GavelIcon from '@mui/icons-material/Gavel';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';

const RichTextEditor = ({ editorRef, placeholder }) => {
// ... existing RichTextEditor logic (unchanged) ...
    return (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
            <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                    p: 1, 
                    bgcolor: 'grey.50', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    flexWrap: 'wrap' 
                }}
            >
                <IconButton size="small" onClick={() => document.execCommand('bold', false)}><FormatBoldIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('italic', false)}><FormatItalicIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('underline', false)}><FormatUnderlinedIcon fontSize="small" /></IconButton>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <IconButton size="small" onClick={() => document.execCommand('insertUnorderedList', false)}><FormatListBulletedIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('justifyLeft', false)}><FormatAlignLeftIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => document.execCommand('justifyCenter', false)}><FormatAlignCenterIcon fontSize="small" /></IconButton>
            </Stack>
            
            <Box 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                sx={{
                    p: 3,
                    minHeight: '400px',
                    fontSize: '15px',
                    lineHeight: 1.8,
                    outline: 'none',
                    bgcolor: 'background.paper',
                    '&:empty:before': {
                        content: `"${placeholder}"`,
                        color: 'text.disabled',
                    }
                }}
            />
        </Box>
    );
};

const PoliciesManagement = () => {
    const { token, isUnlocked, unlockedUntil } = useSelector((state) => state.auth);
    const editorRef = useRef(null);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const policyTypes = ['Terms & Conditions', 'Refund & Cancellation'];

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const fetchPolicy = async () => {
        setFetching(true);
        setMessage({ type: '', text: '' });
        try {
            const type = policyTypes[tab];
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/policies?type=${encodeURIComponent(type)}&target=User&isGlobal=false`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const policy = result.data[0];
                setTitle(policy.title);
                setContent(policy.content);
                if (editorRef.current) {
                    editorRef.current.innerHTML = policy.content || '';
                }
            } else {
                setTitle(type);
                setContent('');
                if (editorRef.current) {
                    editorRef.current.innerHTML = '';
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Failed to load policy data.' });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (token) fetchPolicy();
    }, [tab, token]);

    const handleSave = async () => {
        // Check if session is still validly unlocked
        const isSessionValid = isUnlocked && unlockedUntil && new Date() < new Date(unlockedUntil);

        if (!isSessionValid) {
            setShowPasskeyModal(true);
            return;
        }

        const finalContent = editorRef.current ? editorRef.current.innerHTML : content;
        if (!title || !finalContent || finalContent === '<br>') {
            setMessage({ type: 'error', text: 'Title and content are required.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const type = policyTypes[tab];
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type,
                    target: 'User',
                    title,
                    content: finalContent
                })
            });
            const result = await response.json();
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Policy updated successfully!' });
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save policy.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h3">Service Policies Editor</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Define the terms and refund rules for your booking customers.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={loading || fetching}
                    >
                        {loading ? 'Publishing...' : 'Publish Changes'}
                    </Button>
                </Stack>
            </Grid>

            {message.text && (
                <Grid item xs={12}>
                    <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12}>
                <MainCard content={false}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                        <Tabs value={tab} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                            <Tab icon={<GavelIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Terms & Conditions" />
                            <Tab icon={<CurrencyExchangeIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" label="Refund & Cancellation" />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        {fetching ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
                                <CircularProgress size={40} color="secondary" />
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Policy Document Title"
                                    variant="outlined"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Booking Terms & Conditions"
                                />
                                <RichTextEditor 
                                    editorRef={editorRef} 
                                    placeholder="Enter your detailed policy content here..." 
                                />
                                <Alert severity="info" variant="outlined">
                                    <Typography variant="caption">
                                        Note: These policies are shown to users during the checkout process for your services. Ensure they are accurate and legally compliant.
                                    </Typography>
                                </Alert>
                            </Stack>
                        )}
                    </Box>
                </MainCard>
            </Grid>
            <PasskeyModal 
                isOpen={showPasskeyModal}
                onClose={() => setShowPasskeyModal(false)}
                onVerified={() => {
                    setShowPasskeyModal(false);
                    handleSave();
                }}
                title="Authenticate Policy Revision"
            />
        </Grid>
    );
};

export default PoliciesManagement;
