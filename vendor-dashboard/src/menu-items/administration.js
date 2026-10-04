import { IconUsers, IconFileText } from '@tabler/icons-react';

const icons = { IconUsers, IconFileText };

const administration = {
  id: 'administration-group',
  title: 'ADMINISTRATION',
  type: 'group',
  children: [
    {
      id: 'vendors',
      title: 'Vendor Staff & Team',
      type: 'item',
      url: '/platform/vendors',
      icon: icons.IconUsers,
      breadcrumbs: true
    },
    {
      id: 'policies',
      title: 'Policy Management',
      type: 'item',
      url: '/platform/policies',
      icon: icons.IconFileText,
      breadcrumbs: true
    }
  ]
};

export default administration;
