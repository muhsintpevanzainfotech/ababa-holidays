import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Globe, MapPin, Map } from 'lucide-react';

const DestinationLayout = () => {
  const navItems = [
    { name: 'Countries', path: '/destinations/countries', icon: Globe },
    { name: 'States', path: '/destinations/states', icon: MapPin },
    { name: 'Destinations', path: '/destinations/list', icon: Map }
  ];

  return (
    <div className="fade-in">
      {/* Page Content */}
      <div className="destination-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DestinationLayout;
