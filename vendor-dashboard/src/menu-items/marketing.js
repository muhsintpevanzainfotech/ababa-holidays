import { IconPhoto, IconNews, IconMessage2 } from '@tabler/icons-react';

const icons = { IconPhoto, IconNews, IconMessage2 };

const marketing = {
  id: 'marketing-group',
  title: 'MARKETING & CONTENT',
  type: 'group',
  children: [
    {
      id: 'banners',
      title: 'Banners Catalog',
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
      title: 'Customer Testimonials',
      type: 'item',
      url: '/platform/testimonials',
      icon: icons.IconMessage2,
      breadcrumbs: true
    }
  ]
};

export default marketing;
