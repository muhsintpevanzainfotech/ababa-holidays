// assets
import { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails } from '@tabler/icons-react';

// constant
const icons = { IconPhoto, IconNews, IconMessage2, IconBrush, IconBriefcase, IconListDetails };

// ==============================|| PLATFORM MANAGEMENT MENU ITEMS ||============================== //

const platform = {
  id: 'platform',
  title: 'Platform Management',
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
      id: 'policies',
      title: 'Policies Editor',
      type: 'item',
      url: '/platform/policies',
      icon: icons.IconListDetails,
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

export default platform;
