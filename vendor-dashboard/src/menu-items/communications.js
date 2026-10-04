import { IconQuestionMark, IconMail } from '@tabler/icons-react';

const icons = { IconQuestionMark, IconMail };

const communications = {
  id: 'communications-group',
  title: 'COMMUNICATIONS',
  type: 'group',
  children: [
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

export default communications;
