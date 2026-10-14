import PropTypes from 'prop-types';
import { Activity, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from '../NavItem';
import Transitions from 'ui-component/extended/Transitions';

import { useGetMenuMaster } from 'api/menu';
import useConfig from 'hooks/useConfig';
import useMenuCollapse from 'hooks/useMenuCollapse';

// assets
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function NavCollapse({ menu, level, parentId }) {
  const theme = useTheme();
  const { isDark } = useThemeMode();

  const ref = useRef(null);
  const anchorRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const {
    state: { borderRadius }
  } = useConfig();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openMini, setOpenMini] = useState(false);

  const { pathname, search } = useLocation();

  // Automatically collapse mini flyout on route navigation
  useEffect(() => {
    setOpenMini(false);
  }, [pathname, search]);

  const handleMiniOpen = () => {
    if (!drawerOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setOpenMini(true);
    }
  };

  const handleMiniClose = () => {
    if (!drawerOpen) {
      closeTimeoutRef.current = setTimeout(() => {
        setOpenMini(false);
      }, 180);
    }
  };

  const handlePopperEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleClick = () => {
    if (drawerOpen) {
      setOpen((prev) => !prev);
      setSelected((prev) => (!prev ? menu.id : null));
    } else {
      setOpenMini((prev) => !prev);
    }
  };

  const handleClosePopper = () => {
    setOpenMini(false);
  };

  // menu collapse for sub-levels
  useMenuCollapse(menu, pathname, openMini, setSelected, setOpen, () => {});

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

  useEffect(() => {
    if (menu.url === pathname) {
      setSelected(menu.id);
      setOpenMini(false);
      setOpen(true);
    }
  }, [pathname, menu]);

  // Clean up any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // menu collapse & items
  const menus = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return <NavCollapse key={item.id} menu={item} level={level + 1} parentId={parentId} />;
      case 'item':
        return (
          <NavItem
            key={item.id}
            item={item}
            level={level + 1}
            onSubItemClick={() => setOpenMini(false)}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  const isSelected = selected === menu.id || menu.children?.some((child) => child.url === pathname || (child.children && child.children.some((sub) => sub.url === pathname)));

  const Icon = menu.icon;
  const menuIcon = menu.icon ? (
    <Icon strokeWidth={1.5} size={drawerOpen ? '20px' : '22px'} />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: isSelected ? 8 : 6,
        height: isSelected ? 8 : 6,
        color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : (isDark ? '#64748b' : '#94a3b8')
      }}
      fontSize={level > 0 ? 'inherit' : 'medium'}
    />
  );

  const collapseIcon = drawerOpen ? (
    open ? (
      <IconChevronUp stroke={1.75} size="16px" style={{ marginTop: 'auto', marginBottom: 'auto', color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : 'inherit' }} />
    ) : (
      <IconChevronDown stroke={1.75} size="16px" style={{ marginTop: 'auto', marginBottom: 'auto', color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : 'inherit' }} />
    )
  ) : null;

  return (
    <>
      <Box
        ref={anchorRef}
        sx={{ width: '100%', position: 'relative' }}
        {...(!drawerOpen && {
          onMouseEnter: handleMiniOpen,
          onMouseLeave: handleMiniClose
        })}
      >
        <ListItemButton
          sx={{
            zIndex: 1201,
            borderRadius: `${borderRadius}px`,
            mb: 0.5,
            minHeight: 44,
            ...(drawerOpen && level !== 1 && { ml: `${level * 18}px` }),
            ...(!drawerOpen && {
              px: 0,
              justifyContent: 'center',
              alignItems: 'center'
            }),
            ...(drawerOpen && {
              py: 1,
              px: 1.75
            }),
            border: '1px solid',
            borderColor: isSelected
              ? (isDark ? 'rgba(65, 160, 174, 0.35)' : 'rgba(54, 102, 156, 0.2)')
              : 'transparent',
            color: isSelected
              ? (isDark ? '#ffffff' : '#36669c')
              : (isDark ? '#94a3b8' : '#475569'),
            background: (isSelected || openMini)
              ? (isDark ? 'linear-gradient(90deg, rgba(65, 160, 174, 0.2) 0%, rgba(58, 47, 107, 0.25) 100%)' : 'rgba(54, 102, 156, 0.1)')
              : 'transparent',
            '&:hover': {
              borderColor: isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.15)',
              background: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.06)',
              color: isDark ? '#ffffff' : '#0f172a',
              '& .MuiListItemIcon-root': {
                color: isDark ? '#41a0ae' : '#36669c'
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
          className={openMini ? 'Mui-selected' : ''}
          onClick={handleClick}
        >
          <ListItemIcon
            sx={{
              minWidth: drawerOpen ? 36 : 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              color: isSelected ? (isDark ? '#41a0ae' : '#36669c') : (isDark ? '#94a3b8' : '#64748b'),
              transition: 'all 0.18s ease-in-out'
            }}
          >
            {menuIcon}
          </ListItemIcon>

          {drawerOpen && (
            <ListItemText
              primary={
                <Typography
                  ref={ref}
                  noWrap
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.88rem',
                    color: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {menu.title}
                </Typography>
              }
              secondary={
                menu.caption && (
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
                    {menu.caption}
                  </Typography>
                )
              }
            />
          )}

          {collapseIcon}
        </ListItemButton>
      </Box>

      {/* Flyout Popper for Mini-Drawer Mode */}
      <Activity mode={!drawerOpen ? 'visible' : 'hidden'}>
        <Popper
          open={Boolean(openMini && anchorRef.current)}
          anchorEl={anchorRef.current}
          placement="right-start"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 10]
              }
            },
            {
              name: 'preventOverflow',
              options: {
                padding: 10
              }
            }
          ]}
          sx={{
            overflow: 'visible',
            zIndex: 2200
          }}
        >
          {({ TransitionProps }) => (
            <Transitions in={openMini} {...TransitionProps}>
              <Paper
                onMouseEnter={handlePopperEnter}
                onMouseLeave={handleMiniClose}
                sx={{
                  overflow: 'hidden',
                  bgcolor: isDark ? '#16152b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(65, 160, 174, 0.3)' : '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.65)' : '0 12px 32px rgba(15, 23, 42, 0.12)',
                  backgroundImage: 'none',
                  minWidth: 210,
                  maxWidth: 280
                }}
              >
                <ClickAwayListener onClickAway={handleClosePopper}>
                  <Box>
                    {/* Header showing parent collapse group title */}
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        bgcolor: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.05)',
                        borderBottom: '1px solid',
                        borderColor: isDark ? 'rgba(65, 160, 174, 0.2)' : '#e2e8f0'
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          color: isDark ? '#ffffff' : '#0f172a'
                        }}
                      >
                        {menu.title}
                      </Typography>
                      {menu.caption && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark ? '#9ca3af' : '#64748b',
                            fontSize: '0.72rem',
                            display: 'block',
                            mt: 0.25
                          }}
                        >
                          {menu.caption}
                        </Typography>
                      )}
                    </Box>

                    {/* Subitems with full titles, proper spacing, and auto-collapse on click */}
                    <List component="div" disablePadding sx={{ p: 1 }}>
                      {menus}
                    </List>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Activity>

      {/* Accordion List for Expanded Drawer Mode */}
      <Activity mode={drawerOpen ? 'visible' : 'hidden'}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Activity mode={open ? 'visible' : 'hidden'}>
            <List
              disablePadding
              sx={{
                position: 'relative',
                '&:after': {
                  content: "''",
                  position: 'absolute',
                  left: '25px',
                  top: 0,
                  height: '100%',
                  width: '1px',
                  opacity: 1,
                  bgcolor: isDark ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)'
                }
              }}
            >
              {menus}
            </List>
          </Activity>
        </Collapse>
      </Activity>
    </>
  );
}

NavCollapse.propTypes = {
  menu: PropTypes.any,
  level: PropTypes.number,
  parentId: PropTypes.string
};
