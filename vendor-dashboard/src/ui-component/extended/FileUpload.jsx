import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Box, Stack, Typography, IconButton } from '@mui/material';

// third-party
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

// assets
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// styles
const DropzoneWrapper = styled(Box)(({ theme, isDragActive, isError }) => {
    const isDark = theme.palette.mode === 'dark';
    const primaryMain = theme.palette?.primary?.main || '#6366f1';
    const primaryLight = isDark ? 'rgba(99, 102, 241, 0.15)' : (theme.palette?.primary?.light || 'rgba(99, 102, 241, 0.08)');
    const errorMain = theme.palette?.error?.main || '#ef4444';
    const bgNormal = isDark ? (theme.palette?.background?.default || '#0f172a') : (theme.palette?.grey?.[50] || '#f8fafc');
    const borderNormal = isDark ? (theme.palette?.divider || '#334155') : (theme.palette?.grey?.[300] || '#cbd5e1');

    return {
        width: '100%',
        padding: theme.spacing(4),
        borderRadius: '16px',
        backgroundColor: isDragActive ? primaryLight : bgNormal,
        border: '2px dashed',
        borderColor: isError ? errorMain : isDragActive ? primaryMain : borderNormal,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragActive ? `0 0 0 4px ${primaryLight}` : 'none',
        '&:hover': {
            backgroundColor: primaryLight,
            borderColor: primaryMain
        }
    };
});

const FileUpload = ({ 
    onFileSelect, 
    accept, 
    maxFiles = 1, 
    title = 'Click or drag file to this area to upload', 
    caption = 'Support for a single or bulk upload.',
    value = null
}) => {
    const theme = useTheme();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (value && typeof value === 'string' && files.length === 0) {
            setFiles([{
                name: 'Current Image',
                preview: value,
                type: 'image/jpeg',
                isExisting: true
            }]);
        }
    }, [value]);

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        
        if (maxFiles === 1) {
            setFiles([newFiles[0]]);
            onFileSelect(newFiles[0]);
        } else {
            setFiles(prev => {
                const filtered = prev.filter(f => !f.isExisting);
                const updated = [...filtered, ...newFiles].slice(0, maxFiles);
                onFileSelect(updated);
                return updated;
            });
        }
    }, [maxFiles, onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxFiles
    });

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        onFileSelect(maxFiles === 1 ? null : newFiles);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive} isError={isDragReject}>
                <input {...getInputProps()} />
                <motion.div
                    animate={{ 
                        y: isDragActive ? -8 : 0,
                        scale: isDragActive ? 1.1 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: isDragActive ? 'primary.light' : 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            color: isDragActive ? 'primary.main' : 'text.secondary'
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 32 }} />
                    </Box>
                </motion.div>
                <Typography variant="h5" fontWeight="600" gutterBottom color={isDragActive ? 'primary.main' : 'text.primary'}>
                    {isDragActive ? 'Drop file to upload' : title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {caption}
                </Typography>
            </DropzoneWrapper>

            <AnimatePresence>
                {files.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 2 }}>
                        {files.map((file, index) => (
                            <motion.div
                                key={file.name + index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: '12px', 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ overflow: 'hidden' }}>
                                        {file.type && file.type.startsWith('image/') ? (
                                            <Box 
                                                component="img"
                                                src={file.preview}
                                                sx={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
                                            />
                                        ) : (
                                            <Box sx={{ width: 48, height: 48, borderRadius: '8px', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <InsertDriveFileIcon color="primary" />
                                            </Box>
                                        )}
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220, fontWeight: 600, color: 'text.primary' }}>{file.name}</Typography>
                                            {file.size ? (
                                                <Typography variant="caption" color="text.secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                            ) : (
                                                <Typography variant="caption" color="success.main" fontWeight="500">Current active file</Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFile(index); }} color="error" title="Remove file">
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </motion.div>
                        ))}
                    </Stack>
                )}
            </AnimatePresence>
        </Box>
    );
};

FileUpload.propTypes = {
    onFileSelect: PropTypes.func.isRequired,
    accept: PropTypes.object,
    maxFiles: PropTypes.number,
    title: PropTypes.string,
    caption: PropTypes.string,
    value: PropTypes.any
};

export default FileUpload;
