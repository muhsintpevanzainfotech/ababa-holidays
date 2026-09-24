import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], map.getZoom(), { animate: true });
    }
  }, [latitude, longitude, map]);
  return latitude && longitude ? <Marker position={[latitude, longitude]} /> : null;
}

const MapPicker = ({ latitude, longitude, onLocationSelect, isViewMode }) => {
  return (
    <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer 
        center={[latitude || 20.5937, longitude || 78.9629]} 
        zoom={latitude ? 13 : 5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {!isViewMode && <MapEvents onLocationSelect={onLocationSelect} />}
        <MapFlyTo latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
