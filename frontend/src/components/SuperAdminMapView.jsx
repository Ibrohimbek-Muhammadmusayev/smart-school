import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin, Search, Navigation, Building2, Users, GraduationCap,
  CheckCircle2, AlertTriangle, ExternalLink, Layers, Crosshair,
  Sliders, Plus, Phone, ArrowRight, Eye, RefreshCw, Maximize2,
  Filter, X, ChevronRight, Info, ShieldCheck, Sparkles, Check,
  DoorOpen, ArrowUpRight, School, Globe
} from 'lucide-react';

// Custom Pin generator with status colors
const getStatusTheme = (status, paymentStatus) => {
  if (status === 'TRIAL' || paymentStatus === 'TRIAL') {
    return {
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#F59E0B',
      lightBg: '#FEF3C7',
      label: 'Sinov',
      badge: 'TRIAL',
    };
  }
  if (status === 'SUSPENDED' || status === 'BLOCKED' || status === 'ARCHIVED' || paymentStatus === 'OVERDUE') {
    return {
      bg: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
      color: '#EF4444',
      lightBg: '#FEE2E2',
      label: 'Muzlatilgan',
      badge: 'PAUZA',
    };
  }
  return {
    bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#10B981',
    lightBg: '#D1FAE5',
    label: 'Faol',
    badge: 'FAOL',
  };
};

const createCustomPinIcon = (school, isSelected = false) => {
  const theme = getStatusTheme(school.status, school.paymentStatus);
  const nameShort = school.name?.length > 24 ? school.name.slice(0, 22) + '...' : (school.name || "Maktab");
  const scale = isSelected ? 'scale(1.15)' : 'scale(1)';
  const zIndex = isSelected ? 1000 : 100;

  return L.divIcon({
    className: 'sa-school-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%) ${scale}; transition: transform 0.2s ease; z-index: ${zIndex};">
        <div style="
          background: #0F172A;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 99px;
          margin-bottom: 4px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          white-space: nowrap;
          border: 1.5px solid ${theme.color};
          display: flex;
          align-items: center;
          gap: 5px;
          pointer-events: none;
        ">
          <span style="width: 7px; height: 7px; border-radius: 50%; background-color: ${theme.color}; display: inline-block;"></span>
          <span>${nameShort}</span>
        </div>
        <div style="
          background: ${theme.bg};
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px ${theme.color}66;
          border: 2.5px solid #FFFFFF;
          cursor: pointer;
        ">
          <svg style="transform: rotate(45deg); width: 17px; height: 17px;" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6 8-4 8 4"/>
            <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
            <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
            <path d="M18 5v17"/>
            <path d="M6 5v17"/>
          </svg>
        </div>
        <div style="
          width: 14px;
          height: 6px;
          background: rgba(0,0,0,0.35);
          border-radius: 50%;
          margin-top: 1px;
          filter: blur(1.5px);
        "></div>
      </div>
    `,
    iconSize: [36, 60],
    iconAnchor: [18, 56],
    popupAnchor: [0, -56],
  });
};

// District fallback coordinates if coordinates are missing
const DISTRICT_COORDS = {
  'chilonzor': [41.278321, 69.206542],
  'yunusobod': [41.364412, 69.288210],
  'mirzo ulug': [41.338543, 69.334512],
  'yashnobod': [41.295420, 69.324810],
  'shayxontohur': [41.321510, 69.231240],
  'yakkasaroy': [41.284520, 69.253010],
  'olmazor': [41.352130, 69.221520],
  'sergeli': [41.222510, 69.221040],
  'quva': [40.473581, 72.004696],
  'farg': [40.384210, 71.784320],
  'samarqand': [39.654167, 66.959722],
  'buxoro': [39.774722, 64.428611],
  'andijon': [40.782060, 72.344240],
  'namangan': [40.998300, 71.672600],
  'toshkent': [41.311081, 69.240562],
};

const getEffectiveCoords = (school) => {
  const lat = Number(school.latitude);
  const lng = Number(school.longitude);
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng, true]; // [lat, lng, isOriginal]
  }

  // Lookup fallback based on district or name
  const dist = (school.district || school.name || '').toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (dist.includes(key)) {
      return [coords[0], coords[1], false];
    }
  }

  // Generic Tashkent fallback with slight jitter by id hash
  const hash = String(school.id || '1').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offsetLat = ((hash % 10) - 5) * 0.008;
  const offsetLng = (((hash * 3) % 10) - 5) * 0.008;
  return [41.311081 + offsetLat, 69.240562 + offsetLng, false];
};

const QUICK_REGIONS = [
  { name: 'Barcha Maktablar', type: 'all' },
  { name: 'Toshkent shahri', lat: 41.311081, lng: 69.240562, zoom: 12 },
  { name: "Farg'ona vodiysi", lat: 40.500000, lng: 71.900000, zoom: 10 },
  { name: 'Samarqand', lat: 39.654167, lng: 66.959722, zoom: 12 },
  { name: 'Buxoro', lat: 39.774722, lng: 64.428611, zoom: 12 },
];

export default function SuperAdminMapView({
  schoolsList = [],
  onEnterSchool,
  onUpdateSchool,
  onAddNewSchool,
  showToast,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const circlesGroupRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // ALL, ACTIVE, TRIAL, SUSPENDED
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map-only', 'list-only'
  const [mapTileStyle, setMapTileStyle] = useState('osm'); // 'osm', 'satellite', 'dark'
  const [showEditCoordsModal, setShowEditCoordsModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editRadius, setEditRadius] = useState(150);
  const [editAddress, setEditAddress] = useState('');
  const [isSavingCoords, setIsSavingCoords] = useState(false);

  // Prepare districts list
  const districts = useMemo(() => {
    const set = new Set();
    schoolsList.forEach(s => {
      if (s.district) set.add(s.district.trim());
    });
    return Array.from(set).sort();
  }, [schoolsList]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schoolsList.filter(s => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.district && s.district.toLowerCase().includes(q)) ||
        (s.director && s.director.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.id && String(s.id).toLowerCase().includes(q));

      // Status filter
      let matchStatus = true;
      if (selectedStatusFilter === 'ACTIVE') {
        matchStatus = s.status === 'ACTIVE' && s.paymentStatus !== 'OVERDUE';
      } else if (selectedStatusFilter === 'TRIAL') {
        matchStatus = s.status === 'TRIAL' || s.isFreeTrial;
      } else if (selectedStatusFilter === 'SUSPENDED') {
        matchStatus = s.status === 'SUSPENDED' || s.status === 'BLOCKED' || s.paymentStatus === 'OVERDUE';
      }

      // District filter
      const matchDistrict = selectedDistrict === 'ALL' || s.district === selectedDistrict;

      return matchQuery && matchStatus && matchDistrict;
    });
  }, [schoolsList, searchQuery, selectedStatusFilter, selectedDistrict]);

  // Tile Layer URL
  const getTileUrl = (style) => {
    if (style === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (style === 'dark') {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Uzbekistan
    const map = L.map(mapContainerRef.current, {
      center: [41.311081, 69.240562],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    const tileLayer = L.tileLayer(getTileUrl(mapTileStyle), {
      maxZoom: 19,
    }).addTo(map);

    map._tileLayerInstance = tileLayer;

    // Feature Groups for markers and radius circles
    const markersGroup = L.featureGroup().addTo(map);
    const circlesGroup = L.featureGroup().addTo(map);

    markersGroupRef.current = markersGroup;
    circlesGroupRef.current = circlesGroup;
    mapInstanceRef.current = map;

    // Invalidate size after mounting
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        circlesGroupRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._tileLayerInstance) return;
    map.removeLayer(map._tileLayerInstance);
    const newLayer = L.tileLayer(getTileUrl(mapTileStyle), { maxZoom: 19 }).addTo(map);
    map._tileLayerInstance = newLayer;
  }, [mapTileStyle]);

  // Synchronize Markers and Circles with filtered schools
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const circlesGroup = circlesGroupRef.current;

    if (!map || !markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    const bounds = [];

    filteredSchools.forEach(school => {
      const [lat, lng, isOrig] = getEffectiveCoords(school);
      const isSelected = selectedSchool && String(selectedSchool.id) === String(school.id);
      bounds.push([lat, lng]);

      // 1. Marker
      const marker = L.marker([lat, lng], {
        icon: createCustomPinIcon(school, isSelected),
        riseOnHover: true,
      });

      marker.on('click', () => {
        setSelectedSchool(school);
        map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
      });

      // Tooltip on hover
      marker.bindTooltip(`
        <div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #0F172A; padding: 2px 4px;">
          <div>${school.name}</div>
          <div style="font-size: 11px; font-weight: 500; color: #64748B;">${school.district || 'Noma\'lum tuman'} • ${school.studentsCount || 0} o'quvchi</div>
        </div>
      `, { direction: 'top', offset: [0, -56], opacity: 0.95 });

      markersGroup.addLayer(marker);

      // 2. Geofence radius circle
      const theme = getStatusTheme(school.status, school.paymentStatus);
      const rad = school.radius_meters || 150;
      const circle = L.circle([lat, lng], {
        radius: rad,
        color: theme.color,
        fillColor: theme.color,
        fillOpacity: isSelected ? 0.25 : 0.12,
        weight: isSelected ? 2.5 : 1.5,
        dashArray: isSelected ? '4, 4' : '6, 6',
      });
      circlesGroup.addLayer(circle);
    });

    // Auto-fit bounds if we have points and no specific school selected
    if (!selectedSchool && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (_) {}
    }
  }, [filteredSchools, selectedSchool]);

  // Handle quick region jumps
  const handleQuickRegion = (region) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (region.type === 'all') {
      const bounds = filteredSchools.map(s => getEffectiveCoords(s).slice(0, 2));
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else {
        map.flyTo([41.311081, 69.240562], 11);
      }
    } else {
      map.flyTo([region.lat, region.lng], region.zoom, { duration: 1 });
    }
  };

  // Center on school
  const flyToSchool = (school) => {
    setSelectedSchool(school);
    const map = mapInstanceRef.current;
    if (!map) return;
    const [lat, lng] = getEffectiveCoords(school);
    map.flyTo([lat, lng], 16, { duration: 1 });
  };

  // Open edit coords modal
  const openEditCoordsModal = (school) => {
    const [lat, lng] = getEffectiveCoords(school);
    setEditingSchool(school);
    setEditLat(String(lat.toFixed(6)));
    setEditLng(String(lng.toFixed(6)));
    setEditRadius(school.radius_meters || 150);
    setEditAddress(school.location_address || school.address || '');
    setShowEditCoordsModal(true);
  };

  // Save new coords via API
  const handleSaveCoords = async () => {
    if (!editingSchool) return;
    const latNum = parseFloat(editLat);
    const lngNum = parseFloat(editLng);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      alert("Iltimos, to'g'ri kenglik (latitude) va uzunlik (longitude) qiymatlarini kiriting.");
      return;
    }

    setIsSavingCoords(true);
    try {
      const res = await fetch(`/api/superadmin/schools/${editingSchool.id}/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Super-Admin': '1',
          'X-User-Role': 'SUPER_ADMIN',
        },
        body: JSON.stringify({
          latitude: latNum,
          longitude: lngNum,
          radius_meters: parseInt(editRadius, 10) || 150,
          location_address: editAddress.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateSchool) {
          onUpdateSchool({
            ...editingSchool,
            latitude: latNum,
            longitude: lngNum,
            radius_meters: parseInt(editRadius, 10) || 150,
            location_address: editAddress.trim(),
            is_location_set: true,
          });
        }
        if (selectedSchool && String(selectedSchool.id) === String(editingSchool.id)) {
          setSelectedSchool(prev => ({
            ...prev,
            latitude: latNum,
            longitude: lngNum,
            radius_meters: parseInt(editRadius, 10) || 150,
            location_address: editAddress.trim(),
            is_location_set: true,
          }));
        }
        setShowEditCoordsModal(false);
        if (showToast) {
          showToast(`'${editingSchool.name}' geolokatsiyasi muvaffaqiyatli saqlandi!`);
        }
      } else {
        alert(data.message || data.detail || "Xatolik yuz berdi");
      }
    } catch (err) {
      alert("Server bilan bog'lanishda xatolik: " + err.message);
    } finally {
      setIsSavingCoords(false);
    }
  };

  // Grab map center for edit modal
  const handleGrabMapCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const center = map.getCenter();
    setEditLat(center.lat.toFixed(6));
    setEditLng(center.lng.toFixed(6));
  };

  // KPI calculations
  const totalSchools = schoolsList.length;
  const activeSchools = schoolsList.filter(s => s.status === 'ACTIVE').length;
  const totalStudents = schoolsList.reduce((acc, s) => acc + (Number(s.studentsCount) || 0), 0);
  const avgAttendance = totalSchools > 0
    ? (schoolsList.reduce((acc, s) => acc + (Number(s.attendanceRate) || 0), 0) / totalSchools).toFixed(1)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', minHeight: 650, gap: 14 }}>
      
      {/* ================================================================= */}
      {/* 1. TOP STATS & QUICK FILTER BAR                                   */}
      {/* ================================================================= */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* KPI Mini Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
              <School size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Jami Maktablar</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{totalSchools} ta</div>
            </div>
          </div>

          <div style={{ height: 26, width: 1, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Faol Maktablar</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981' }}>{activeSchools} ta</div>
            </div>
          </div>

          <div style={{ height: 26, width: 1, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Jami O'quvchilar</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{totalStudents.toLocaleString()} nafar</div>
            </div>
          </div>

          <div style={{ height: 26, width: 1, backgroundColor: '#E2E8F0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>O'rtacha Davomat</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#D97706' }}>{avgAttendance}%</div>
            </div>
          </div>
        </div>

        {/* Quick Region Buttons & Layer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: 8 }}>
            {QUICK_REGIONS.map((r, i) => (
              <button
                key={i}
                onClick={() => handleQuickRegion(r)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '5px 11px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#334155',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Map Layer Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: 8 }}>
            <button
              onClick={() => setMapTileStyle('osm')}
              title="Standart xarita"
              style={{
                border: 'none',
                backgroundColor: mapTileStyle === 'osm' ? '#FFFFFF' : 'transparent',
                boxShadow: mapTileStyle === 'osm' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '5px 9px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                color: mapTileStyle === 'osm' ? '#4F46E5' : '#64748B',
              }}
            >
              Ko'cha
            </button>
            <button
              onClick={() => setMapTileStyle('satellite')}
              title="Sun'iy yo'ldosh xaritasi"
              style={{
                border: 'none',
                backgroundColor: mapTileStyle === 'satellite' ? '#FFFFFF' : 'transparent',
                boxShadow: mapTileStyle === 'satellite' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '5px 9px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                color: mapTileStyle === 'satellite' ? '#4F46E5' : '#64748B',
              }}
            >
              Kosmik
            </button>
            <button
              onClick={() => setMapTileStyle('dark')}
              title="Modern topografik xarita"
              style={{
                border: 'none',
                backgroundColor: mapTileStyle === 'dark' ? '#FFFFFF' : 'transparent',
                boxShadow: mapTileStyle === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                padding: '5px 9px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                color: mapTileStyle === 'dark' ? '#4F46E5' : '#64748B',
              }}
            >
              Voyager
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. MAIN WORKSPACE (SIDEBAR + INTERACTIVE MAP)                     */}
      {/* ================================================================= */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 14, position: 'relative' }}>
        
        {/* LEFT SCHOOLS PANEL */}
        <div style={{
          width: 360,
          minWidth: 320,
          maxWidth: 400,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          zIndex: 10,
        }}>
          {/* Search & Filters */}
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Maktab, tuman yoki direktor qidirish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  fontSize: 12.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#F8FAFC',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { id: 'ALL', label: 'Barchasi', count: schoolsList.length },
                { id: 'ACTIVE', label: 'Faol', count: activeSchools },
                { id: 'TRIAL', label: 'Sinov', count: schoolsList.filter(s => s.status === 'TRIAL' || s.isFreeTrial).length },
                { id: 'SUSPENDED', label: 'To\'xtatilgan', count: schoolsList.filter(s => s.status === 'SUSPENDED' || s.status === 'BLOCKED' || s.paymentStatus === 'OVERDUE').length },
              ].map(f => {
                const isActive = selectedStatusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedStatusFilter(f.id)}
                    style={{
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      backgroundColor: isActive ? '#4F46E5' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f.label} ({f.count})
                  </button>
                );
              })}
            </div>

            {/* District dropdown */}
            {districts.length > 0 && (
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  fontSize: 11.5,
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="ALL">Barcha tumanlar ({schoolsList.length})</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

          {/* School Cards List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredSchools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 14px', color: '#94A3B8' }}>
                <MapPin size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>Maktab topilmadi</div>
                <div style={{ fontSize: 11.5 }}>Qidiruv shartlarini o'zgartirib ko'ring</div>
              </div>
            ) : (
              filteredSchools.map(school => {
                const isSelected = selectedSchool && String(selectedSchool.id) === String(school.id);
                const theme = getStatusTheme(school.status, school.paymentStatus);
                const [lat, lng, isOrig] = getEffectiveCoords(school);

                return (
                  <div
                    key={school.id}
                    onClick={() => flyToSchool(school)}
                    style={{
                      padding: '11px 12px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #6366F1' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F8FAFF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                        {school.name}
                      </div>
                      <span style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        padding: '1.5px 6px',
                        borderRadius: 4,
                        backgroundColor: theme.lightBg,
                        color: theme.color,
                        flexShrink: 0,
                      }}>
                        {theme.badge}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <MapPin size={11} color="#94A3B8" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {school.district || "Toshkent shahri"} {school.address ? `• ${school.address}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, borderTop: '1px solid #F1F5F9', paddingTop: 6 }}>
                      <div style={{ display: 'flex', gap: 10, color: '#475569' }}>
                        <span>👥 <strong>{school.studentsCount || 0}</strong> o'quvchi</span>
                        <span>📈 <strong>{school.attendanceRate || 0}%</strong></span>
                      </div>
                      <div style={{ fontSize: 10.5, color: isOrig ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                        {isOrig ? "📍 GPS Aniq" : "📍 Taxminiy"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer of list */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748B' }}>
            <span>Ko'rsatilmoqda: <strong>{filteredSchools.length}</strong> ta</span>
            {onAddNewSchool && (
              <button
                onClick={onAddNewSchool}
                style={{
                  border: 'none',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={12} /> Yangi Maktab
              </button>
            )}
          </div>
        </div>

        {/* RIGHT INTERACTIVE LEAFLET MAP */}
        <div style={{
          flex: 1,
          height: '100%',
          backgroundColor: '#E2E8F0',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid #CBD5E1',
          position: 'relative',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Leaflet container */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* FLOATING INSPECTION CARD (Bottom Right of Map) */}
          {selectedSchool && (
            <div style={{
              position: 'absolute',
              bottom: 18,
              right: 18,
              width: 380,
              maxWidth: 'calc(100% - 36px)',
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              boxShadow: '0 16px 36px -8px rgba(15, 23, 42, 0.25), 0 4px 12px rgba(0,0,0,0.08)',
              zIndex: 1000,
              padding: '16px 18px',
              animation: 'slideUp 0.22s ease-out',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    {(() => {
                      const t = getStatusTheme(selectedSchool.status, selectedSchool.paymentStatus);
                      return (
                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: '1.5px 7px',
                          borderRadius: 4,
                          backgroundColor: t.lightBg,
                          color: t.color,
                        }}>
                          {t.label.toUpperCase()}
                        </span>
                      );
                    })()}
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>ID: {selectedSchool.id}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                    {selectedSchool.name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{
                    border: 'none',
                    backgroundColor: '#F1F5F9',
                    borderRadius: 6,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Address / Location details */}
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} color="#6366F1" />
                  <span>{selectedSchool.district || "Toshkent shahri"}{selectedSchool.address ? `, ${selectedSchool.address}` : ''}</span>
                </div>
                {selectedSchool.director && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 11.5 }}>
                    <Users size={12} />
                    <span>Direktor: <strong>{selectedSchool.director}</strong></span>
                    {selectedSchool.phone && (
                      <a href={`tel:${selectedSchool.phone}`} style={{ color: '#4F46E5', textDecoration: 'none', marginLeft: 4, fontWeight: 600 }}>
                        ({selectedSchool.phone})
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Mini Stat Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '8px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>O'quvchilar</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{selectedSchool.studentsCount || 0}</div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '8px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>O'qituvchilar</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{selectedSchool.teachersCount || 0}</div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '8px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>Davomat</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>{selectedSchool.attendanceRate || 0}%</div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '8px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>Radius</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#6366F1' }}>{selectedSchool.radius_meters || 150}m</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {onEnterSchool && (
                  <button
                    onClick={() => onEnterSchool(selectedSchool)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #4F46E5 100%)',
                      color: '#FFFFFF',
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <DoorOpen size={15} /> Maktab Dashbordiga Kirish
                  </button>
                )}

                <button
                  onClick={() => openEditCoordsModal(selectedSchool)}
                  title="Geolokatsiya va radiusni tahrirlash"
                  style={{
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    padding: '9px 11px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <Sliders size={14} /> Tahrirlash
                </button>

                {(() => {
                  const [lat, lng] = getEffectiveCoords(selectedSchool);
                  return (
                    <a
                      href={`https://maps.google.com/?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Google Xaritalarda ochish"
                      style={{
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#64748B',
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. COORDINATE EDIT MODAL                                           */}
      {/* ================================================================= */}
      {showEditCoordsModal && editingSchool && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: 480,
            maxWidth: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Geolokatsiyani Sozlash</h4>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{editingSchool.name}</div>
                </div>
              </div>
              <button
                onClick={() => setShowEditCoordsModal(false)}
                style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Quick Center Grab Button */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11.5, color: '#475569' }}>
                  Xarita markazidagi nuqtani tezkor olish:
                </div>
                <button
                  type="button"
                  onClick={handleGrabMapCenter}
                  style={{
                    border: '1px solid #6366F1',
                    backgroundColor: '#EEF2FF',
                    color: '#4F46E5',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Crosshair size={13} /> Markazni Olish
                </button>
              </div>

              {/* Coordinates Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Kenglik (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editLat}
                    onChange={e => setEditLat(e.target.value)}
                    placeholder="41.311081"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Uzunlik (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editLng}
                    onChange={e => setEditLng(e.target.value)}
                    placeholder="69.240562"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Radius slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                    GPS Davomat Qamrov Radiusi
                  </label>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: 6 }}>
                    {editRadius} metr
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="1000"
                  step="10"
                  value={editRadius}
                  onChange={e => setEditRadius(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4F46E5' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8' }}>
                  <span>30m (Kichik bino)</span>
                  <span>150m (Standart maktab)</span>
                  <span>1000m (Katta kampus)</span>
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Aniq Mo'ljal yoki Manzil
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  placeholder="Masalan: Yunusobod tumani, Amir Temur ko'chasi 14-uy"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 12.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ fontSize: 11, color: '#64748B', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: 8 }}>
                ℹ️ Ushbu koordinata o'quvchi va o'qituvchilarning mobil ilovadagi GPS geofence davomati uchun asosiy markaz bo'lib xizmat qiladi.
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowEditCoordsModal(false)}
                disabled={isSavingCoords}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Bekor Qilish
              </button>
              <button
                type="button"
                onClick={handleSaveCoords}
                disabled={isSavingCoords}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: isSavingCoords ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: isSavingCoords ? 0.7 : 1,
                }}
              >
                {isSavingCoords ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Saqlash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
