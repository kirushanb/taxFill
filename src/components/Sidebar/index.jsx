
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Icon from '@mui/material/Icon';
import Link from '@mui/material/Link';

const menuItems = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    key: '',
  },
  {
    label: 'Feedback',
    icon: 'rate_review',
    key: 'addFeedback',
  },
  // {
  //   label: 'Customers',
  //   icon: 'people',
  //   key: 'customers',
  // },
  // {
  //   label: 'Reports',
  //   icon: 'bar_chart',
  //   key: 'reports',
  // },
];

const Sidebar = () => (
  menuItems.map(item => (
    <ListItem button key={item.key} component={Link} href={`/dashboard/${item.key}`} color="inherit">
      <ListItemIcon>
        <Icon>{ item.icon }</Icon>
      </ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItem>
  ))
);

export default Sidebar;
