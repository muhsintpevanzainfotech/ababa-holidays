import { useEffect } from 'react';
import { matchPath } from 'react-router-dom';

// ==============================|| MENU COLLAPSED - RECURSIVE FUNCTION ||============================== //

/**
 * Recursively traverses menu items to find and open the correct parent menu.
 * If a menu item matches the current pathname, it marks the corresponding menu as selected and opens it.
 */
function setParentOpenedMenu(items, pathname, menuId, setSelected, setOpen) {
  for (const item of items) {
    if (item.children?.length) {
      setParentOpenedMenu(item.children, pathname, menuId, setSelected, setOpen);
    }

    const itemBasePath = item.url ? item.url.split('?')[0] : '';
    if ((item.link && matchPath({ path: item.link, end: false }, pathname)) || item.url === pathname || (itemBasePath && itemBasePath === pathname)) {
      setSelected?.(menuId ?? null);
      setOpen?.(true);
    }
  }
}

// ==============================|| MENU COLLAPSED - HOOK ||============================== //

/**
 * Hook to handle menu collapse behavior based on the current route.
 * Automatically expands the parent menu when navigating to an active route item,
 * while allowing the user to freely collapse and expand submenus manually.
 */
export default function useMenuCollapse(menu, pathname, miniMenuOpened, setSelected, setOpen, setAnchorEl) {
  useEffect(() => {
    if (menu?.children?.length) {
      setParentOpenedMenu(menu.children, pathname, menu.id, setSelected, setOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}
