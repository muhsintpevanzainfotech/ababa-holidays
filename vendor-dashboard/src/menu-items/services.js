import { IconBox, IconBriefcase } from '@tabler/icons-react';

const icons = { IconBox, IconBriefcase };

const services = {
  id: 'services-group',
  title: 'SERVICES & CATALOG',
  type: 'group',
  children: [
    {
      id: 'packages',
      title: 'Packages & Listings',
      type: 'item',
      url: '/platform/packages',
      icon: icons.IconBox,
      breadcrumbs: true
    },
    {
      id: 'services',
      title: 'Services Catalog',
      type: 'item',
      url: '/platform/services',
      icon: icons.IconBriefcase,
      breadcrumbs: true
    }
  ]
};

export default services;
