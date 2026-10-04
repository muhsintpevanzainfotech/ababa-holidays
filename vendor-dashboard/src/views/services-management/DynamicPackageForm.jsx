import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  Button,
  Chip,
  Stack,
  Paper,
  Alert,
  Rating,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FolderIcon from '@mui/icons-material/Folder';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const DEFAULT_PACKAGE_FIELDS = [
  {
    _id: 'default_title',
    fieldName: 'title',
    label: 'Package Title',
    fieldType: 'text',
    isRequired: true,
    colSpan: 6,
    order: 1,
    setTitle: 'Standard Package Details'
  },
  {
    _id: 'default_price',
    fieldName: 'price',
    label: 'Price (₹)',
    fieldType: 'number',
    isRequired: true,
    colSpan: 3,
    order: 2,
    setTitle: 'Standard Package Details'
  },
  {
    _id: 'default_priceType',
    fieldName: 'priceType',
    label: 'Pricing Basis',
    fieldType: 'select',
    isRequired: false,
    colSpan: 3,
    order: 3,
    setTitle: 'Standard Package Details',
    config: {
      options: ['Per Person', 'Per Couple', 'Per Group', 'Per Night', 'Fixed Price']
    }
  },
  {
    _id: 'default_duration',
    fieldName: 'duration',
    label: 'Duration',
    fieldType: 'text',
    isRequired: false,
    colSpan: 6,
    order: 4,
    setTitle: 'Standard Package Details',
    config: { placeholder: 'e.g. 3 Days / 2 Nights' }
  },
  {
    _id: 'default_location',
    fieldName: 'location',
    label: 'Location / Destination',
    fieldType: 'text',
    isRequired: false,
    colSpan: 6,
    order: 5,
    setTitle: 'Standard Package Details',
    config: { placeholder: 'e.g. Manali, Himachal Pradesh' }
  },
  {
    _id: 'default_description',
    fieldName: 'description',
    label: 'Package Description',
    fieldType: 'textarea',
    isRequired: false,
    colSpan: 12,
    order: 6,
    setTitle: 'Standard Package Details',
    config: { rows: 3, placeholder: 'Detailed overview of the package itinerary or highlights...' }
  },
  {
    _id: 'default_inclusions',
    fieldName: 'inclusions',
    label: 'Inclusions',
    fieldType: 'tag',
    isRequired: false,
    colSpan: 6,
    order: 7,
    setTitle: 'Inclusions & Exclusions',
    secondaryLabel: 'Separate included features with commas'
  },
  {
    _id: 'default_exclusions',
    fieldName: 'exclusions',
    label: 'Exclusions',
    fieldType: 'tag',
    isRequired: false,
    colSpan: 6,
    order: 8,
    setTitle: 'Inclusions & Exclusions',
    secondaryLabel: 'Separate excluded items with commas'
  }
];

const DynamicPackageForm = ({
  fields = [],
  values = {},
  onChange,
  onFileChange,
  errors = {},
  loading = false
}) => {
  const [showPassword, setShowPassword] = useState({});

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading form setup configuration for selected service...
        </Typography>
      </Box>
    );
  }

  const activeFields = (fields && Array.isArray(fields)) ? fields : [];

  if (activeFields.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: 'action.hover',
          borderRadius: '12px',
          border: '1.5px dashed',
          borderColor: 'divider'
        }}
      >
        <Typography variant="subtitle1" fontWeight="700" color="text.secondary">
          No Custom Form Fields Configured by Admin
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          The administrator has not configured any additional custom form setup fields for this service category.
        </Typography>
      </Paper>
    );
  }

  const handleValueChange = (fieldName, val) => {
    if (onChange) {
      onChange(fieldName, val);
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  // Group fields by set (setTitle / setId)
  const sortedFields = [...activeFields].sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderControl = (field) => {
    const {
      fieldType,
      label,
      fieldName,
      isRequired,
      secondaryLabel,
      config = {}
    } = field;

    const value = values[fieldName] !== undefined ? values[fieldName] : (config.multiple ? [] : '');
    const errorMsg = errors[fieldName];

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'search':
      case 'number':
      case 'date':
      case 'datetime':
      case 'time':
      case 'month':
      case 'week': {
        const inputType =
          fieldType === 'phone'
            ? 'tel'
            : fieldType === 'datetime'
            ? 'datetime-local'
            : fieldType;

        return (
          <TextField
            fullWidth
            id={fieldName}
            label={`${label}${isRequired ? ' *' : ''}`}
            type={inputType}
            value={value}
            onChange={(e) => handleValueChange(fieldName, e.target.value)}
            placeholder={config.placeholder || secondaryLabel || ''}
            required={isRequired}
            error={Boolean(errorMsg)}
            helperText={errorMsg || secondaryLabel}
            inputProps={{
              minLength: config.minLength,
              maxLength: config.maxLength,
              min: config.min,
              max: config.max
            }}
          />
        );
      }

      case 'password': {
        return (
          <TextField
            fullWidth
            id={fieldName}
            label={`${label}${isRequired ? ' *' : ''}`}
            type={showPassword[fieldName] ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleValueChange(fieldName, e.target.value)}
            placeholder={config.placeholder || ''}
            required={isRequired}
            error={Boolean(errorMsg)}
            helperText={errorMsg || secondaryLabel}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility(fieldName)} edge="end">
                    {showPassword[fieldName] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        );
      }

      case 'textarea':
      case 'editor':
      case 'html': {
        return (
          <TextField
            fullWidth
            multiline
            rows={config.rows || 3}
            id={fieldName}
            label={`${label}${isRequired ? ' *' : ''}`}
            value={value}
            onChange={(e) => handleValueChange(fieldName, e.target.value)}
            placeholder={config.placeholder || secondaryLabel || 'Enter details...'}
            required={isRequired}
            error={Boolean(errorMsg)}
            helperText={errorMsg || secondaryLabel}
          />
        );
      }

      case 'select':
      case 'dropdown': {
        const rawOptions = config.options || [];
        const optionsList = rawOptions.map((opt) =>
          typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) }
        );

        if (config.multiple) {
          const arrVal = Array.isArray(value) ? value : [];
          return (
            <FormControl fullWidth error={Boolean(errorMsg)} required={isRequired}>
              <InputLabel id={`label-${fieldName}`}>{`${label}${isRequired ? ' *' : ''}`}</InputLabel>
              <Select
                labelId={`label-${fieldName}`}
                multiple
                value={arrVal}
                onChange={(e) => handleValueChange(fieldName, e.target.value)}
                label={`${label}${isRequired ? ' *' : ''}`}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => {
                      const matchOpt = optionsList.find((o) => o.value === val);
                      return <Chip key={val} label={matchOpt?.label || val} size="small" />;
                    })}
                  </Box>
                )}
              >
                {optionsList.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        return (
          <FormControl fullWidth error={Boolean(errorMsg)} required={isRequired}>
            <InputLabel id={`label-${fieldName}`}>{`${label}${isRequired ? ' *' : ''}`}</InputLabel>
            <Select
              labelId={`label-${fieldName}`}
              value={value || ''}
              onChange={(e) => handleValueChange(fieldName, e.target.value)}
              label={`${label}${isRequired ? ' *' : ''}`}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {optionsList.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      case 'radio': {
        const optionsList = (config.options || []).map((opt) =>
          typeof opt === 'object' ? opt : { label: String(opt), value: String(opt) }
        );

        return (
          <FormControl component="fieldset" error={Boolean(errorMsg)} required={isRequired}>
            <FormLabel component="legend" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>
              {label} {isRequired && '*'}
            </FormLabel>
            <RadioGroup
              row
              value={value}
              onChange={(e) => handleValueChange(fieldName, e.target.value)}
            >
              {optionsList.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      }

      case 'checkbox': {
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleValueChange(fieldName, e.target.checked)}
              />
            }
            label={`${label}${isRequired ? ' *' : ''}`}
          />
        );
      }

      case 'switch': {
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleValueChange(fieldName, e.target.checked)}
              />
            }
            label={`${label}${isRequired ? ' *' : ''}`}
          />
        );
      }

      case 'rating': {
        return (
          <Box>
            <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {label} {isRequired && '*'}
            </Typography>
            <Rating
              value={Number(value) || 0}
              onChange={(e, newVal) => handleValueChange(fieldName, newVal)}
            />
          </Box>
        );
      }

      case 'tag':
      case 'feature': {
        const tagsArr = Array.isArray(value)
          ? value
          : typeof value === 'string'
          ? value.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        return (
          <TextField
            fullWidth
            label={`${label} (Comma separated)${isRequired ? ' *' : ''}`}
            value={tagsArr.join(', ')}
            onChange={(e) =>
              handleValueChange(
                fieldName,
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="e.g. Welcome Drink, AC Room, Free WiFi"
            helperText={secondaryLabel || 'Separate tags/features with commas'}
          />
        );
      }

      case 'upload':
      case 'image':
      case 'file upload': {
        return (
          <Box sx={{ border: '1.5px dashed', borderColor: 'divider', borderRadius: '12px', p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>
              {label} {isRequired && '*'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CloudUploadIcon />}
                sx={{ borderStyle: 'dashed' }}
              >
                Upload File(s)
                <input
                  type="file"
                  hidden
                  multiple={config.maxFiles > 1 || config.multiple}
                  onChange={(e) => {
                    if (e.target.files && onFileChange) {
                      onFileChange(fieldName, Array.from(e.target.files));
                    }
                  }}
                />
              </Button>
              {Array.isArray(value) && value.length > 0 && (
                <Chip label={`${value.length} File(s) attached`} size="small" color="primary" />
              )}
            </Stack>
          </Box>
        );
      }

      case 'section_header': {
        return (
          <Box sx={{ py: 1, my: 1, borderBottom: '2px solid', borderColor: 'primary.light' }}>
            <Typography variant="h3" fontWeight="800" color="primary.main">
              {label}
            </Typography>
            {secondaryLabel && (
              <Typography variant="caption" color="text.secondary">
                {secondaryLabel}
              </Typography>
            )}
          </Box>
        );
      }

      default: {
        return (
          <TextField
            fullWidth
            id={fieldName}
            label={`${label}${isRequired ? ' *' : ''}`}
            value={value}
            onChange={(e) => handleValueChange(fieldName, e.target.value)}
            placeholder={config.placeholder || ''}
            required={isRequired}
          />
        );
      }
    }
  };

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      <Grid container spacing={2.5}>
        {sortedFields.map((field, idx) => {
          const isFirstOfGroup =
            field.setTitle &&
            (idx === 0 ||
              sortedFields[idx - 1].setTitle !== field.setTitle ||
              sortedFields[idx - 1].setId !== field.setId);

          const defaultSpan = [
            'textarea',
            'editor',
            'map',
            'upload',
            'file upload',
            'image',
            'section_header'
          ].includes(field.fieldType)
            ? 12
            : 6;

          const colSpan =
            field.colLg ||
            field.colSpan ||
            field.col_lg ||
            field.config?.colLg ||
            defaultSpan;

          return (
            <React.Fragment key={field._id || field.fieldName || idx}>
              {isFirstOfGroup && (
                <Grid size={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      mt: idx === 0 ? 0 : 2,
                      bgcolor: 'primary.light',
                      border: '1px solid',
                      borderColor: 'primary.200',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <FolderIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="800" color="primary.dark">
                      {field.setTitle}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid
                size={{
                  xs: 12,
                  sm: Math.min(12, Number(field.colSm || field.col_sm || 12)),
                  md: Math.min(12, Number(colSpan))
                }}
              >
                {renderControl(field)}
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DynamicPackageForm;
