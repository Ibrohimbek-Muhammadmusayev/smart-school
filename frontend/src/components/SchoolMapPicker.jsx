import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Check } from 'lucide-react';

// Custom Marker Icon
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Click Handler Component
function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      // Reverse geocoding (OpenStreetMap Nominatim)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        })
        .catch(() => {});
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customMarkerIcon} />
  );
}

// Pan Map on Search Result
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function SchoolMapPicker({ position, setPosition, address, setAddress }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Nominatim search API for Uzbekistan/Locations
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Uzbekistan')}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (_) {
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setPosition([lat, lon]);
    setAddress(item.display_name);
    setSearchResults([]);
    setSearchQuery(item.display_name);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
        <MapPin size={15} color="#FF5722" /> Maktab Geografik Joylashuvi (Xarita orqali tanlang)
      </label>

      {/* Qidiruv Maydoni */}
      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              placeholder="Xaritadan manzilni qidiring (masalan: Chilonzor 9-mavze)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box' }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 12 }} />
          </div>
          <button 
            type="submit"
            style={{ padding: '0 16px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {isSearching ? '...' : 'Qidirish'}
          </button>
        </form>

        {/* Qidiruv Natijalari Dropdown */}
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: 46, left: 0, right: 0, backgroundColor: '#FFF', borderRadius: 12, border: '1px solid #CBD5E1', zIndex: 1000, maxHeight: 180, overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            {searchResults.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => selectSearchResult(item)}
                style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9', fontSize: 12, cursor: 'pointer', color: '#334155' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFF'}
              >
                📍 {item.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interaktiv Xarita */}
      <div style={{ height: 220, borderRadius: 14, overflow: 'hidden', border: '1px solid #CBD5E1', position: 'relative' }}>
        <MapContainer 
          center={position || [41.2995, 69.2401]} // Default: Toshkent
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <ChangeView center={position} />}
          <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
        </MapContainer>
      </div>

      {/* Tanlangan Manzil Info */}
      {position && (
        <div style={{ padding: '8px 12px', backgroundColor: '#ECFDF5', borderRadius: 10, border: '1px solid #A7F3D0', fontSize: 12, color: '#065F46', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> <b>Koordinatalar:</b> {position[0].toFixed(5)}, {position[1].toFixed(5)}
          {address && <span style={{ marginLeft: 6, color: '#047857' }}>({address.split(',')[0]})</span>}
        </div>
      )}
    </div>
  );
}
