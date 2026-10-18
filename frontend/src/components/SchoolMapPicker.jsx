import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, Search, Navigation, CheckCircle2, AlertTriangle, 
  Crosshair, Layers, Check, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';

// Custom SVG-based Pin Icon
const createSchoolPinIcon = (label = "Maktab") => {
  return L.divIcon({
    className: 'custom-school-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: #0F172A;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 99px;
          margin-bottom: 5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          white-space: nowrap;
          border: 1.5px solid #6366F1;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          🏫 ${label}
        </div>
        <div style="
          background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(239, 68, 68, 0.45);
          border: 2.5px solid #FFFFFF;
        ">
          <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">📍</span>
        </div>
        <div style="
          width: 12px;
          height: 6px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          margin-top: 1px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [38, 64],
    iconAnchor: [19, 60],
    popupAnchor: [0, -60],
  });
};

const UZBEKISTAN_REGIONS = [
  { name: 'Toshkent', lat: 41.311081, lng: 69.240562, zoom: 13 },
  { name: 'Samarqand', lat: 39.654167, lng: 66.959722, zoom: 13 },
  { name: 'Buxoro', lat: 39.774722, lng: 64.428611, zoom: 13 },
  { name: 'Andijon', lat: 40.78206, lng: 72.34424, zoom: 13 },
  { name: 'Farg\'ona', lat: 40.38421, lng: 71.78432, zoom: 13 },
  { name: 'Namangan', lat: 40.9983, lng: 71.6726, zoom: 13 },
  { name: 'Qarshi', lat: 38.86056, lng: 65.78905, zoom: 13 },
  { name: 'Urganch', lat: 41.55, lng: 60.6333, zoom: 13 },
  { name: 'Nukus', lat: 42.4602, lng: 59.6166, zoom: 13 },
  { name: 'Termiz', lat: 37.22417, lng: 67.27833, zoom: 13 },
];

export default function SchoolMapPicker({
  latitude,
  longitude,
  radiusMeters = 150,
  schoolName = "Maktab",
  address = "",
  onChangeLocation,
  onConfirmLocation,
  isSaving = false,
  isConfirmed = false,
  required = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [manualLat, setManualLat] = useState(latitude ? String(latitude) : '');
  const [manualLng, setManualLng] = useState(longitude ? String(longitude) : '');

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = hasCoords ? [latitude, longitude] : [41.311081, 69.240562];
    const initialZoom = hasCoords ? 16 : 12;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Map click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setManualLat(lat.toFixed(6));
      setManualLng(lng.toFixed(6));
      updateMarkerAndCircle(map, lat, lng, radiusMeters, schoolName);

      // Reverse geocoding (Nominatim OpenStreetMap)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz,ru,en`)
        .then(res => res.json())
        .then(data => {
          const autoAddress = data?.display_name || '';
          if (onChangeLocation) {
            onChangeLocation({
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              address: autoAddress,
              radiusMeters,
            });
          }
        })
        .catch(() => {
          if (onChangeLocation) {
            onChangeLocation({
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              address: '',
              radiusMeters,
            });
          }
        });
    });

    mapInstanceRef.current = map;

    // Place initial marker if coords present
    if (hasCoords) {
      updateMarkerAndCircle(map, latitude, longitude, radiusMeters, schoolName);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  // Update marker & geofence circle
  const updateMarkerAndCircle = (map, lat, lng, radius, label) => {
    if (!map) return;
    const pos = [lat, lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
      markerRef.current.setIcon(createSchoolPinIcon(label || "Maktab"));
    } else {
      markerRef.current = L.marker(pos, {
        icon: createSchoolPinIcon(label || "Maktab"),
        draggable: true,
      }).addTo(map);

      // Allow dragging marker
      markerRef.current.on('dragend', (e) => {
        const markerPos = e.target.getLatLng();
        setManualLat(markerPos.lat.toFixed(6));
        setManualLng(markerPos.lng.toFixed(6));
        if (circleRef.current) {
          circleRef.current.setLatLng(markerPos);
        }
        if (onChangeLocation) {
          onChangeLocation({
            latitude: Number(markerPos.lat.toFixed(6)),
            longitude: Number(markerPos.lng.toFixed(6)),
            address: '',
            radiusMeters: radius,
          });
        }
      });
    }

    if (circleRef.current) {
      circleRef.current.setLatLng(pos);
      circleRef.current.setRadius(radius || 150);
    } else {
      circleRef.current = L.circle(pos, {
        radius: radius || 150,
        color: '#4F46E5',
        fillColor: '#818CF8',
        fillOpacity: 0.22,
        weight: 2,
        dashArray: '5, 6',
      }).addTo(map);
    }
  };

  // Synchronize when external latitude/longitude changes
  useEffect(() => {
    if (latitude !== undefined && latitude !== null) {
      setManualLat(String(latitude));
    }
    if (longitude !== undefined && longitude !== null) {
      setManualLng(String(longitude));
    }
    if (mapInstanceRef.current && hasCoords) {
      updateMarkerAndCircle(mapInstanceRef.current, latitude, longitude, radiusMeters, schoolName);
      try {
        const center = mapInstanceRef.current.getCenter();
        if (Math.abs(center.lat - latitude) > 0.002 || Math.abs(center.lng - longitude) > 0.002) {
          mapInstanceRef.current.setView([latitude, longitude], 16, { animate: false });
        }
      } catch (_) {}
    }
  }, [latitude, longitude, radiusMeters, schoolName]);

  // Handle Nominatim search
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const q = encodeURIComponent(searchQuery + ', O\'zbekiston');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&accept-language=uz,ru,en&limit=6`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualLat(lat.toFixed(6));
      setManualLng(lng.toFixed(6));
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
        updateMarkerAndCircle(mapInstanceRef.current, lat, lng, radiusMeters, schoolName);
      }
      setSearchResults([]);
      setSearchQuery('');
      if (onChangeLocation) {
        onChangeLocation({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          address: item.display_name || address,
          radiusMeters,
        });
      }
    }
  };

  // Get device GPS location
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert("Qurilmangiz yoki brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi.");
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
          updateMarkerAndCircle(mapInstanceRef.current, lat, lng, radiusMeters, schoolName);
        }
        if (onChangeLocation) {
          onChangeLocation({
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            address: address,
            radiusMeters,
          });
        }
      },
      (err) => {
        setGeoLocating(false);
        alert("Geolokatsiyani aniqlashda xatolik yuz berdi: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Manual Lat/Lng submit
  const handleApplyManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Iltimos, to'g'ri geografik koordinatalarni kiriting (Lat: -90..90, Lng: -180..180)!");
      return;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      updateMarkerAndCircle(mapInstanceRef.current, lat, lng, radiusMeters, schoolName);
    }
    if (onChangeLocation) {
      onChangeLocation({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        address: address,
        radiusMeters,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Top Action Bar: Search & GPS Location & Quick Region Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, position: 'relative', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="Xaritadan manzilni qidirish (masalan: Amir Temur shoh ko'chasi, Yunusobod)..."
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: 14,
                border: '1.5px solid #CBD5E1',
                fontSize: 13,
                boxSizing: 'border-box',
                fontWeight: 600,
                color: '#1E293B',
                backgroundColor: '#FFFFFF',
              }}
            />
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 13 }} />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            style={{
              padding: '0 20px',
              borderRadius: 14,
              backgroundColor: '#1E1B4B',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: searching ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 42,
            }}>
            <Search size={14} />
            {searching ? "..." : "Qidirish"}
          </button>

          {/* Device GPS Button */}
          <button
            type="button"
            onClick={handleGetDeviceLocation}
            disabled={geoLocating}
            style={{
              padding: '0 18px',
              borderRadius: 14,
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: geoLocating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 42,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}>
            <Navigation size={14} color="#4F46E5" className={geoLocating ? "animate-spin" : ""} />
            {geoLocating ? "Aniqlanmoqda..." : "📍 Joriy GPS lokatsiyam"}
          </button>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #CBD5E1',
              boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
              zIndex: 1000,
              maxHeight: 220,
              overflowY: 'auto',
            }}>
              <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 800, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>
                TOPILGAN MANZILLAR (Xaritada belgilash uchun bosing):
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: '10px 14px',
                    fontSize: 12.5,
                    borderBottom: '1px solid #F8FAFC',
                    cursor: 'pointer',
                    color: '#1E293B',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EEF2FF'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  📍 {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Region Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={12} /> Tezkor hududlar:
          </span>
          {UZBEKISTAN_REGIONS.map((reg) => (
            <button
              key={reg.name}
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([reg.lat, reg.lng], reg.zoom, { animate: true });
                }
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: 11,
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}>
              {reg.name}
            </button>
          ))}
        </div>
      </div>

      {/* The Leaflet Map Container */}
      <div style={{
        position: 'relative',
        height: 380,
        borderRadius: 20,
        overflow: 'hidden',
        border: hasCoords ? (isConfirmed ? '2px solid #10B981' : '2px solid #4F46E5') : '2.5px dashed #EF4444',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
      }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />

        {/* Floating crosshair reminder */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(4px)',
          padding: '6px 12px',
          borderRadius: 10,
          border: '1px solid #CBD5E1',
          fontSize: 11,
          fontWeight: 800,
          color: '#334155',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <Crosshair size={13} color="#4F46E5" /> Xarita ustini bosib metka qo'ying
        </div>
      </div>

      {/* Bottom Controls: Manual Inputs & DIRECT CONFIRMATION BUTTON */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        
        {/* Manual Coordinates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748B', display: 'block' }}>Kenglik (Lat) *</label>
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="41.311081"
              style={{
                width: 115,
                padding: '7px 10px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                fontWeight: 700,
                marginTop: 3,
                backgroundColor: '#FFF'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748B', display: 'block' }}>Uzunlik (Lng) *</label>
            <input
              type="text"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="69.240562"
              style={{
                width: 115,
                padding: '7px 10px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                fontWeight: 700,
                marginTop: 3,
                backgroundColor: '#FFF'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748B', display: 'block' }}>Qamrov radiusi (m)</label>
            <input
              type="number"
              min={20}
              max={2000}
              value={radiusMeters}
              onChange={(e) => {
                const r = parseInt(e.target.value) || 150;
                if (circleRef.current) circleRef.current.setRadius(r);
                if (onChangeLocation && hasCoords) {
                  onChangeLocation({
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                    address,
                    radiusMeters: r,
                  });
                }
              }}
              style={{
                width: 80,
                padding: '7px 10px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                fontWeight: 700,
                marginTop: 3,
                backgroundColor: '#FFF'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleApplyManualCoords}
            style={{
              marginTop: 18,
              padding: '8px 14px',
              borderRadius: 10,
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}>
            Kiritish
          </button>
        </div>

        {/* DIRECT CONFIRMATION / SAVE BUTTON */}
        <div>
          {hasCoords ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isConfirmed ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 14,
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  color: '#065F46',
                  fontWeight: 900,
                  fontSize: 13,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                }}>
                  <ShieldCheck size={18} color="#10B981" />
                  <span>✓ Joylashuv Bazada Tasdiqlangan</span>
                </div>
              ) : null}

              {onConfirmLocation && (
                <button
                  type="button"
                  onClick={onConfirmLocation}
                  disabled={isSaving}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 14,
                    background: isConfirmed 
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' 
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 900,
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 8px 18px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.2s ease',
                  }}>
                  {isSaving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {isConfirmed ? "Joylashuvni Qayta Saqlash 💾" : "📍 Joylashuvni Tasdiqlash va Saqlash 💾"}
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 12,
              backgroundColor: '#FEF2F2',
              border: '1px solid #F87171',
              color: '#991B1B',
              fontSize: 12,
              fontWeight: 800,
            }}>
              <AlertTriangle size={15} color="#DC2626" />
              <span>Xaritadan bino ustiga bosib nuqta tanlang</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
