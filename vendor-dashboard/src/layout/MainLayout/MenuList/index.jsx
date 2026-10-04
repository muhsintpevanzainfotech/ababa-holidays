import { Activity, memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';
import api from 'utils/api';

import { useGetMenuMaster } from 'api/menu';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');
  const [dbServices, setDbServices] = useState([]);

  const user = useSelector((state) => state.auth?.user) || (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      return {};
    }
  })();

  const isVendorStaff = user && (user.role === 'Vendor-Staff' || user.role === 'vendor-staff');

  useEffect(() => {
    Promise.all([
      api.get('/services?limit=100').catch(() => null),
      api.get('/vendors/profile').catch(() => null)
    ])
      .then(([svcRes, profileRes]) => {
        let allServices = [];
        if (svcRes) {
          if (Array.isArray(svcRes.data)) allServices = svcRes.data;
          else if (Array.isArray(svcRes)) allServices = svcRes;
        }

        let rawSelected = null;
        if (profileRes) {
          const p = profileRes.data?.profile || profileRes.profile || profileRes.data || {};
          rawSelected = p.selectedServices;
        }

        if (Array.isArray(rawSelected) && rawSelected.length > 0) {
          const resolved = rawSelected
            .map((item) => {
              if (typeof item === 'object' && item !== null && (item.title || item.name)) {
                return item;
              }
              const itemIdStr = String(item._id || item);
              const found = allServices.find((s) => String(s._id) === itemIdStr || String(s.customId) === itemIdStr);
              return found || (typeof item === 'object' ? item : null);
            })
            .filter(Boolean);

          setDbServices(resolved.length > 0 ? resolved : allServices);
        } else {
          setDbServices(allServices);
        }
      })
      .catch((err) => console.error('Failed to load menu services:', err));
  }, []);

  const itemPermissionMap = {
    vendors: 'manage_staff',
    'subscription-settings': 'vendor_only',
    packages: 'manage_packages',
    services: 'manage_services',
    bookings: 'manage_bookings',
    enquiries: 'manage_enquiries',
    'contact-us': 'manage_enquiries',
    banners: 'manage_banners',
    blogs: 'manage_content',
    testimonials: 'manage_content'
  };

  const isItemAllowed = (item, isVendorStaff, userPermissions) => {
    if (!isVendorStaff) return true;
    if (item.id === 'vendors' || item.id === 'subscription-settings') return false;

    const requiredPerm = itemPermissionMap[item.id];
    if (!requiredPerm) return true;

    const userPerms = Array.isArray(userPermissions)
      ? userPermissions
      : ['manage_packages', 'manage_bookings', 'manage_enquiries'];

    return userPerms.includes(requiredPerm);
  };

  const formattedMenuItems = menuItems.items
    .map((group) => {
      const allowedChildren = (group.children || []).filter((child) =>
        isItemAllowed(child, isVendorStaff, user?.permissions)
      );

      if (allowedChildren.length === 0) return null;

      let currentGroup = { ...group, children: allowedChildren };

      if (currentGroup.id !== 'platform' && currentGroup.id !== 'services-group') return currentGroup;

      const updatedChildren = [];

      (currentGroup.children || []).forEach((child) => {
        if (child.id === 'packages') {
          const serviceSubItems = dbServices.map((svc) => {
            const sId = svc._id || svc.id || svc.customId;
            return {
              id: `svc-${sId}`,
              title: svc.title || svc.name || 'Service',
              type: 'item',
              url: `/platform/packages?service=${sId}`,
              breadcrumbs: true
            };
          });

          updatedChildren.push({
            id: 'packages',
            title: 'Packages & Listings',
            type: 'collapse',
            icon: child.icon,
            children: [
              {
                id: 'all-packages',
                title: 'All Packages',
                type: 'item',
                url: '/platform/packages',
                breadcrumbs: true
              },
              ...serviceSubItems
            ]
          });
        } else {
          updatedChildren.push(child);
        }
      });

      return {
        ...currentGroup,
        children: updatedChildren
      };
    })
    .filter((group) => group && group.children && group.children.length > 0);

  const lastItem = null;

  let lastItemIndex = formattedMenuItems.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < formattedMenuItems.length) {
    lastItemId = formattedMenuItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = formattedMenuItems.slice(lastItem - 1, formattedMenuItems.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = formattedMenuItems.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              <Activity mode={index !== 0 ? 'visible' : 'hidden'}>
                <Divider sx={{ py: 0.5 }} />
              </Activity>
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
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

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
