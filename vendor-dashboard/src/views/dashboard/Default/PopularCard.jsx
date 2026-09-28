import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

export default function PopularCard({ isLoading, stats }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const recentList = stats?.recentItems && stats.recentItems.length > 0 ? stats.recentItems : [
    { title: 'Kerala Luxury Houseboat Tour', type: 'Package', status: 'Active', price: '₹14,999' },
    { title: 'Munnar Hill Station Getaway', type: 'Package', status: 'Active', price: '₹12,500' },
    { title: 'Wayanad Nature & Resort Experience', type: 'Package', status: 'Active', price: '₹18,000' }
  ];

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Stack sx={{ gap: gridSpacing }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Recent Agency Activity</Typography>
                <IconButton size="small" sx={{ mt: -0.625 }}>
                  <MoreHorizOutlinedIcon
                    fontSize="small"
                    sx={{ cursor: 'pointer' }}
                    aria-controls="menu-popular-card"
                    aria-haspopup="true"
                    onClick={handleClick}
                  />
                </IconButton>
              </Stack>
              <Menu
                id="menu-popular-card"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                variant="selectedMenu"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleClose}> Today</MenuItem>
                <MenuItem onClick={handleClose}> This Month</MenuItem>
                <MenuItem onClick={handleClose}> This Year </MenuItem>
              </Menu>

              <BajajAreaChartCard />
              <Box>
                {recentList.map((item, index) => (
                  <React.Fragment key={index}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ maxWidth: '65%' }}>
                        <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {item.type || 'Travel Package'}
                        </Typography>
                      </Box>
                      <Stack direction="row" sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 800 }}>
                          {typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : item.price}
                        </Typography>
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '5px',
                            bgcolor: item.status === 'Active' || item.status === 'Confirmed' ? 'success.light' : 'warning.light',
                            color: item.status === 'Active' || item.status === 'Confirmed' ? 'success.dark' : 'warning.dark',
                            ml: 1.5
                          }}
                        >
                          <KeyboardArrowUpOutlinedIcon fontSize="small" color="inherit" />
                        </Avatar>
                      </Stack>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ color: item.status === 'Active' || item.status === 'Confirmed' ? 'success.dark' : 'warning.dark', fontWeight: 700 }}>
                      {item.status || 'Active'}
                    </Typography>
                    {index < recentList.length - 1 && <Divider sx={{ my: 1.5 }} />}
                  </React.Fragment>
                ))}
              </Box>
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Button size="small" disableElevation sx={{ fontWeight: 700 }}>
              View All Activity
              <ChevronRightOutlinedIcon />
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = { isLoading: PropTypes.bool, stats: PropTypes.object };
