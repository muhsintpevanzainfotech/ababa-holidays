import PropTypes from 'prop-types';

// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// constant
const headerStyle = {
  '& .MuiCardHeader-action': { mr: 0 }
};

export default function MainCard({
  border = true,
  boxShadow = true,
  children,
  content = true,
  contentClass = '',
  contentSX = {},
  headerSX = {},
  darkTitle,
  secondary,
  shadow,
  sx = {},
  title,
  ref,
  ...others
}) {
  const defaultShadow = '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)';
  const hoverShadow = '0 12px 30px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -2px rgba(15, 23, 42, 0.03)';

  return (
    <Card
      ref={ref}
      {...others}
      sx={(theme) => ({
        border: border ? '1px solid' : 'none',
        borderColor: theme.vars.palette.divider,
        borderRadius: '16px !important',
        background: border ? 'rgba(255, 255, 255, 0.96)' : 'inherit',
        backdropFilter: 'blur(12px)',
        boxShadow: boxShadow ? shadow || defaultShadow : 'none',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: boxShadow ? hoverShadow : 'none',
          borderColor: 'rgba(37, 99, 235, 0.3)'
        },
        ...theme.applyStyles('dark', {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          background: 'rgba(17, 24, 39, 0.92)',
          ':hover': {
            borderColor: 'rgba(59, 130, 246, 0.4)'
          }
        }),
        ...(typeof sx === 'function' ? sx(theme) : sx || {})
      })}
    >
      {/* card header and action */}
      {!darkTitle && title && <CardHeader sx={{ ...headerStyle, ...headerSX }} title={title} action={secondary} />}
      {darkTitle && title && (
        <CardHeader sx={{ ...headerStyle, ...headerSX }} title={<Typography variant="h3">{title}</Typography>} action={secondary} />
      )}

      {/* content & header divider */}
      {title && <Divider />}

      {/* card content */}
      {content && (
        <CardContent sx={contentSX} className={contentClass}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
}

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  contentSX: PropTypes.object,
  headerSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  secondary: PropTypes.any,
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  ref: PropTypes.object,
  others: PropTypes.any
};
