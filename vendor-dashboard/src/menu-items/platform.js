// assets
import { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails, IconMail, IconQuestionMark, IconWorld, IconUsers, IconBox } from '@tabler/icons-react';

// constant
const icons = { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails, IconMail, IconQuestionMark, IconWorld, IconUsers, IconBox };

// ==============================|| PLATFORM MANAGEMENT MENU ITEMS ||============================== //

const platform = {
  id: 'platform',
  title: 'Platform Studio',
  type: 'group',
  children: [
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
      type: 'item',
      url: '/platform/packages',
      icon: icons.IconBox,
      breadcrumbs: true
    },
    {
      id: 'vendors',
      title: 'Vendor Network',
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
