import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CulturalItem, Route } from '../types';

// Leaflet ikonlarını düzeltme
// @ts-ignore - _getIconUrl metodu tanımlı olmayabilir, ama çalışması için gerekli
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  items: CulturalItem[];
  selectedRoute?: Route;
  onMarkerClick?: (item: CulturalItem) => void;
  selectedItems?: CulturalItem[];
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  items, 
  selectedRoute, 
  onMarkerClick,
  selectedItems = [],
  onLoadMore,
  isLoading = false
}) => {
  // Hata ayıklama: Gösterilen öğe sayısını loglama
  useEffect(() => {
    console.log('Haritada gösterilen öğe sayısı:', items.length);
  }, [items]);

  // Haritanın merkez noktasını hesaplama
  const getMapCenter = () => {
    if (items.length === 0) {
      return [48.856614, 2.352222] as [number, number]; // Paris (varsayılan)
    }

    // Tüm öğelerin ortalama konumunu hesapla
    const sumLat = items.reduce((sum, item) => sum + item.latitude, 0);
    const sumLng = items.reduce((sum, item) => sum + item.longitude, 0);
    return [sumLat / items.length, sumLng / items.length] as [number, number];
  };

  // Rota çizgisi için nokta dizisi oluşturma
  const getRoutePoints = () => {
    if (!selectedRoute || !selectedRoute.points || selectedRoute.points.length === 0) {
      return [];
    }

    // Rota noktalarını sıraya göre düzenle
    const sortedPoints = [...selectedRoute.points].sort((a, b) => a.order - b.order);
    
    // Her nokta için uygun CulturalItem'ı bul
    return sortedPoints
      .map(point => {
        const item = items.find(i => i.id === point.itemId);
        return item ? [item.latitude, item.longitude] : null;
      })
      .filter(point => point !== null) as [number, number][];
  };

  // Özel marker ikonları oluşturma
  const createMarkerIcon = (isSelected: boolean) => {
    return new L.Icon({
      iconUrl: isSelected 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
        : 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={getMapCenter()} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {items.map(item => {
          const isSelected = selectedItems.some(selected => selected.id === item.id);
          return (
            <Marker 
              key={item.id} 
              position={[item.latitude, item.longitude]}
              icon={createMarkerIcon(isSelected)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(item);
                  }
                }
              }}
            >
              <Popup>
                <div className="cultural-item-popup">
                  <h3>{item.title}</h3>
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                    />
                  )}
                  
                  <div className="metadata-section">
                    {/* Europeana Metadata Alanları */}
                    <p><strong>Sanatçı/Yaratıcı:</strong> {item.creator || 'Bilinmiyor'}</p>
                    <p><strong>Eser Türü:</strong> {item.type || 'Bilinmiyor'}</p>
                    <p><strong>Sağlayan Kurum:</strong> {item.providingInstitution || 'Bilinmiyor'}</p>
                    <p><strong>Yıl:</strong> {item.year || item.period || 'Bilinmiyor'}</p>
                    <p><strong>Ülke:</strong> {item.providingCountry || 'Bilinmiyor'}</p>
                  </div>
                  
                  {item.description && (
                    <div className="description-section">
                      <p className="item-description">
                        {typeof item.description === 'string' 
                          ? (item.description.length > 200 
                            ? `${item.description.substring(0, 200)}...` 
                            : item.description) 
                          : 'Açıklama mevcut'}
                      </p>
                    </div>
                  )}
                  
                  {item.link && (
                    <div className="link-section">
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        Europeana'da görüntüle
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Rota çizgisi */}
        {getRoutePoints().length >= 2 && (
          <Polyline 
            positions={getRoutePoints()} 
            color="blue" 
            weight={3} 
            opacity={0.7} 
          />
        )}
      </MapContainer>
      
      {onLoadMore && (
        <div className="load-more-container">
          <button 
            className="load-more-button"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Yükleniyor...' : 'Daha Fazla Yükle (+ 100 Sonuç)'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent; 