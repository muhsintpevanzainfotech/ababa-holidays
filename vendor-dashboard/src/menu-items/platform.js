import { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails, IconMail, IconQuestionMark, IconWorld, IconUsers, IconBox, IconWallet, IconReceipt } from '@tabler/icons-react';

// constant
const icons = { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails, IconMail, IconQuestionMark, IconWorld, IconUsers, IconBox, IconWallet, IconReceipt };

// ==============================|| PLATFORM MANAGEMENT MENU ITEMS ||============================== //

const platform = {
  id: 'platform',
  title: 'Platform Studio',
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
    },
    {
      id: 'banners',
      title: 'Banners',
      type: 'item',
      url: '/platform/banners',
      icon: icons.IconPhoto,
      breadcrumbs: true
    },
    {
      id: 'blogs',
      title: 'Blogs & News',
      type: 'item',
      url: '/platform/blogs',
      icon: icons.IconNews,
      breadcrumbs: true
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      type: 'item',
      url: '/platform/testimonials',
      icon: icons.IconMessage2,
      breadcrumbs: true
    },
    {
      id: 'services',
      title: 'Services Catalog',
      type: 'item',
      url: '/platform/services',
      icon: icons.IconBriefcase,
      breadcrumbs: true
    },
    {
      id: 'packages',
      title: 'Packages & Listings',
      type: 'collapse',
      icon: icons.IconBox,
      children: [
        {
          id: 'all-packages',
          title: 'All Packages',
          type: 'item',
          url: '/platform/packages',
          breadcrumbs: true
        }
      ]
    },
    {
      id: 'vendors',
      title: 'Vendor Staff & Team',
      type: 'item',
      url: '/platform/vendors',
      icon: icons.IconUsers,
      breadcrumbs: true
    },
    {
      id: 'enquiries',
      title: 'Web Enquiries',
      type: 'item',
      url: '/platform/enquiries',
      icon: icons.IconQuestionMark,
      breadcrumbs: true
    },
    {
      id: 'contact-us',
      title: 'Contact Messages',
      type: 'item',
      url: '/platform/contact-us',
      icon: icons.IconMail,
      breadcrumbs: true
    }
  ]
};

export default platform;
