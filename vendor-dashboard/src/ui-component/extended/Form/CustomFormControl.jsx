import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';

const CustomFormControl = styled(FormControl)(() => ({
  marginTop: 8,
  marginBottom: 8,
  '& > label': {
    top: 20,
    left: 0,
    '&[data-shrink="false"]': {
      top: 6
    }
  },
  '&:has(.MuiInputAdornment-positionStart) > label[data-shrink="false"]': {
    left: 32
  },
  '& > div > input': {
    padding: '26px 14px 10px !important'
  },
  '& > div.MuiInputBase-adornedStart > input': {
    paddingLeft: '4px !important'
  },
  '& legend': {
    display: 'none'
  },
  '& fieldset': {
    top: 0
  }
}));

export default CustomFormControl;
