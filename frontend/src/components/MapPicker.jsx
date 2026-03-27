import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position }) => {
  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapPicker = ({ lat, lng, onChange, height = '300px' }) => {
  const [position, setPosition] = useState(lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null);

  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setPosition(null);
    }
  }, [lat, lng]);

  // Default center (India) if no position
  const defaultCenter = [20.5937, 78.9629];
  const center = position ? [position.lat, position.lng] : defaultCenter;

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer 
        center={center} 
        zoom={position ? 13 : 5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} />
        <MapCenterUpdater center={center} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
