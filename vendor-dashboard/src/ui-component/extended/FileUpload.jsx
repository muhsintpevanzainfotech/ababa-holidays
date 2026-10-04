import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Box, Stack, Typography, IconButton, Chip } from '@mui/material';

// third-party
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

// assets
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// styles
const DropzoneWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'isError'
})(({ theme, isDragActive, isError }) => {
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDark = !isLightExplicit;
    const primaryMain = '#ff5252';
    const primaryLight = isDark ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255, 82, 82, 0.08)';
    const errorMain = '#ef4444';
    const bgNormal = isDark ? '#111827' : '#f8fafc';
    const borderNormal = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';

    return {
        width: '100%',
        padding: theme.spacing(3.5),
        borderRadius: '14px',
        backgroundColor: isDragActive ? primaryLight : bgNormal,
        border: '2px dashed',
        borderColor: isError ? errorMain : isDragActive ? primaryMain : borderNormal,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease-in-out',
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
    title = 'Click or drag file to upload', 
    caption = 'Supports PNG, JPG, WEBP formats up to 10MB',
    value = null,
    previewUrl = null
}) => {
    const theme = useTheme();
    const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
    const isDark = !isLightExplicit;
    const [files, setFiles] = useState([]);

    const initialPreview = previewUrl || value;

    useEffect(() => {
        if (initialPreview && typeof initialPreview === 'string' && files.length === 0) {
            setFiles([{
                name: 'Current Uploaded Image',
                preview: initialPreview,
                type: 'image/jpeg',
                isExisting: true
            }]);
        }
    }, [initialPreview]);

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

    const isImageFile = (file) => {
        if (file.isExisting) return true;
        if (file.type && file.type.startsWith('image/')) return true;
        if (typeof file.preview === 'string' && (file.preview.startsWith('http') || file.preview.startsWith('data:') || file.preview.startsWith('blob:'))) return true;
        return false;
    };

    return (
        <Box sx={{ width: '100%' }}>
            <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive} isError={isDragReject}>
                <input {...getInputProps()} />
                <motion.div
                    animate={{ 
                        y: isDragActive ? -6 : 0,
                        scale: isDragActive ? 1.08 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: isDark ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255, 82, 82, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            color: '#ff5252'
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 30 }} />
                    </Box>
                </motion.div>
                <Typography variant="subtitle1" fontWeight="700" color={isDark ? '#f9fafb' : '#0f172a'} sx={{ mb: 0.5 }}>
                    {isDragActive ? 'Drop file to upload' : title}
                </Typography>
                <Typography variant="caption" color={isDark ? '#9ca3af' : 'text.secondary'}>
                    {caption}
                </Typography>
            </DropzoneWrapper>

            <AnimatePresence>
                {files.length > 0 && (
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {files.map((file, index) => (
                            <motion.div
                                key={(file.name || 'file') + index}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box sx={{ 
                                    p: 1.75, 
                                    borderRadius: '12px', 
                                    border: '1px solid', 
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    bgcolor: isDark ? '#1f2937' : '#ffffff',
                                    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ overflow: 'hidden' }}>
                                        {isImageFile(file) ? (
                                            <Box 
                                                component="img"
                                                src={file.preview}
                                                alt="Preview"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                                sx={{ 
                                                    width: 56, 
                                                    height: 56, 
                                                    borderRadius: '8px', 
                                                    objectFit: 'cover', 
                                                    flexShrink: 0, 
                                                    border: '1px solid', 
                                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                                                    bgcolor: isDark ? '#111827' : '#f1f5f9'
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{ 
                                                width: 56, 
                                                height: 56, 
                                                borderRadius: '8px', 
                                                bgcolor: isDark ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255, 82, 82, 0.1)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                flexShrink: 0 
                                            }}>
                                                <InsertDriveFileIcon sx={{ color: '#ff5252' }} />
                                            </Box>
                                        )}
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: { xs: 180, sm: 260 }, fontWeight: 700, color: isDark ? '#f9fafb' : '#0f172a' }}>
                                                {file.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                {file.size ? (
                                                    <Typography variant="caption" color={isDark ? '#9ca3af' : 'text.secondary'} fontWeight="600">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </Typography>
                                                ) : (
                                                    <Chip label="Uploaded Image" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800 }} />
                                                )}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }} 
                                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }} 
                                            title="Remove File"
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
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
    value: PropTypes.any,
    previewUrl: PropTypes.string
};

export default FileUpload;
