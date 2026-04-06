// assets
import { IconSettings } from '@tabler/icons-react';

// constant
const icons = { IconSettings };

// ==============================|| SYSTEM MENU ITEMS ||============================== //

const system = {
  id: 'system',
  title: 'System Prefrences',
  type: 'group',
  children: [
    {
      id: 'settings',
      title: 'Account Settings',
      type: 'item',
      url: '/system/settings',
      icon: icons.IconSettings,
      breadcrumbs: true
    }
  ]
};

export default system;
