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

const MapEvents = ({ onChange, setPosition }) => {
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      onChange(newPos);
    },
  });
  return null;
};

const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
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
    }
  }, [lat, lng]);

  const defaultCenter = [20.5937, 78.9629];
  const center = position ? [position.lat, position.lng] : defaultCenter;

  return (
    <div className="map-picker-container" style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={position ? 13 : 5} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} />
        <MapEvents setPosition={setPosition} onChange={onChange} />
        <MapCenterUpdater center={center} />
      </MapContainer>
      {position && (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapPicker;
