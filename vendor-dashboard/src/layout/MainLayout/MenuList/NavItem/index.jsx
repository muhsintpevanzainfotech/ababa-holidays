import PropTypes from 'prop-types';
import { Activity, useEffect, useRef, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import useConfig from 'hooks/useConfig';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function NavItem({ item, level, isParents = false, setSelectedID, onSubItemClick }) {
  const theme = useTheme();
  const { isDark } = useThemeMode();

  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const ref = useRef(null);

  const { pathname, search } = useLocation();
  const {
    state: { borderRadius }
  } = useConfig();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const currentFullUrl = pathname + search;
  const isSelected = item?.url?.includes('?')
    ? item.url === currentFullUrl
    : !!matchPath({ path: item?.link ? item.link : item?.url, end: true }, pathname) && !search.includes('service=');

  const [hoverStatus, setHover] = useState(false);

  const compareSize = () => {
    const compare = ref.current && ref.current.scrollWidth > ref.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);
    return () => window.removeEventListener('resize', compareSize);
  }, []);

  const isSubItem = level > 1;
  const showText = drawerOpen || isSubItem;

  const Icon = item?.icon;
  const itemIcon = item?.icon ? (
    <Icon stroke={1.75} size={drawerOpen ? '20px' : '22px'} style={{ ...(isParents && { fontSize: 20, stroke: '1.75' }) }} />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: isSelected ? 8 : 6,
        height: isSelected ? 8 : 6,
        color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : (isDark ? '#64748b' : '#94a3b8'),
        transition: 'all 0.2s ease'
      }}
      fontSize="inherit"
    />
  );

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downMD) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID();
    }

    if (onSubItemClick) {
      onSubItemClick();
    }
  };

  const buttonContent = (
    <ListItemButton
      component={Link}
      to={item.url}
      target={itemTarget}
      disabled={item.disabled}
      disableRipple={!drawerOpen && !isSubItem}
      sx={{
        zIndex: 1201,
        borderRadius: isSubItem ? '8px' : '10px',
        mb: isSubItem ? 0.35 : 0.5,
        py: isSubItem ? 0.85 : 1,
        px: showText ? (isSubItem ? 1.75 : 1.75) : 0,
        minHeight: isSubItem ? 38 : 44,
        width: '100%',
        justifyContent: showText ? 'flex-start' : 'center',
        alignItems: 'center',
        transition: 'all 0.18s ease-in-out',
        ...(drawerOpen && isSubItem && { ml: `${(level - 1) * 16}px` }),
        border: '1px solid',
        borderColor: isSelected
          ? (isDark ? 'rgba(65, 160, 174, 0.35)' : 'rgba(54, 102, 156, 0.2)')
          : 'transparent',
        color: isSelected
          ? (isDark ? '#ffffff' : '#36669c')
          : (isDark ? (isSubItem ? '#f1f5f9' : '#94a3b8') : (isSubItem ? '#1e293b' : '#475569')),
        background: isSelected
          ? (isDark ? 'linear-gradient(90deg, rgba(65, 160, 174, 0.2) 0%, rgba(58, 47, 107, 0.25) 100%)' : 'rgba(54, 102, 156, 0.1)')
          : 'transparent',
        '&:hover': {
          borderColor: isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.15)',
          background: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.06)',
          color: isDark ? '#ffffff' : '#0f172a',
          '& .MuiListItemIcon-root': {
            color: isDark ? '#41a0ae' : '#36669c',
            transform: 'scale(1.08)'
          }
        },
        '&.Mui-selected': {
          borderColor: isDark ? 'rgba(65, 160, 174, 0.4)' : 'rgba(54, 102, 156, 0.25)',
          background: isDark ? 'linear-gradient(90deg, rgba(65, 160, 174, 0.24) 0%, rgba(58, 47, 107, 0.3) 100%)' : 'rgba(54, 102, 156, 0.14)',
          color: isDark ? '#ffffff' : '#36669c',
          '& .MuiListItemIcon-root': {
            color: isDark ? '#41a0ae' : '#36669c'
          },
          '&:hover': {
            background: isDark ? 'linear-gradient(90deg, rgba(65, 160, 174, 0.28) 0%, rgba(58, 47, 107, 0.35) 100%)' : 'rgba(54, 102, 156, 0.18)'
          }
        }
      }}
      selected={isSelected}
      onClick={() => itemHandler()}
    >
      <ListItemIcon
        sx={{
          minWidth: isSubItem ? 26 : (drawerOpen ? 36 : 'auto'),
          justifyContent: 'center',
          alignItems: 'center',
          color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : (isDark ? '#94a3b8' : '#64748b'),
          transition: 'all 0.18s ease-in-out'
        }}
      >
        {itemIcon}
      </ListItemIcon>

      {showText && (
        <ListItemText
          primary={
            <Typography
              ref={ref}
              noWrap
              variant="body2"
              sx={{
                fontWeight: isSelected ? 700 : (isSubItem ? 600 : 500),
                fontSize: isSubItem ? '0.85rem' : '0.88rem',
                color: 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.title}
            </Typography>
          }
          secondary={
            item.caption && (
              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  textTransform: 'capitalize'
                }}
              >
                {item.caption}
              </Typography>
            )
          }
        />
      )}

      {showText && item.chip && (
        <Chip
          color={item.chip?.color}
          variant={item.chip?.variant}
          size={item.chip?.size || 'small'}
          label={item.chip?.label}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ml: 'auto' }}
        />
      )}
    </ListItemButton>
  );

  // When drawer is collapsed and this is a root-level item (level === 1), show tooltip.
  // When inside a Popper flyout (isSubItem = true), the full title is already rendered; DO NOT wrap in tooltip.
  if (!drawerOpen && !isSubItem) {
    return (
      <Tooltip title={item.title} placement="right" arrow>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {buttonContent}
        </Box>
      </Tooltip>
    );
  }

  return buttonContent;
}

NavItem.propTypes = {
  item: PropTypes.any,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.func,
  onSubItemClick: PropTypes.func
};
