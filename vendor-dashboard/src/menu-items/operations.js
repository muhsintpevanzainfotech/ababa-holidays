import { IconReceipt, IconWallet } from '@tabler/icons-react';

const icons = { IconReceipt, IconWallet };

const operations = {
  id: 'operations-group',
  title: 'OPERATIONS & FINANCE',
  type: 'group',
  children: [
    {
      id: 'bookings',
      title: 'Customer Bookings',
      type: 'item',
      url: '/platform/bookings',
      icon: icons.IconReceipt,
      breadcrumbs: true
    },
    {
      id: 'wallet',
      title: 'Wallet & Financials',
      type: 'item',
      url: '/platform/wallet',
      icon: icons.IconWallet,
      breadcrumbs: true
    }
  ]
};

export default operations;
