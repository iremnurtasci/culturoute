import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CulturalItem, SearchFilters, Route as CultureRoute } from './types';
import { searchCulturalItems } from './services/europeanaService';
import MapComponent from './components/MapComponent';
import SearchPanel from './components/SearchPanel';
import RoutePanel from './components/RoutePanel';
import './App.css';

const App: React.FC = () => {
  const [culturalItems, setCulturalItems] = useState<CulturalItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CulturalItem[]>([]);
  const [currentRoute, setCurrentRoute] = useState<CultureRoute | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<CultureRoute[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: 'art',
    country: '',
    type: '',
    maxResults: 100
  });
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [routeDetails, setRouteDetails] = useState<Record<string, CulturalItem[]>>({});
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [activeShareRoute, setActiveShareRoute] = useState<string | null>(null);

  // İlk yükleme için varsayılan arama
  useEffect(() => {
    const initialSearch = async () => {
      setIsLoading(true);
      const defaultFilters: SearchFilters = {
        query: 'art',
        country: '',
        type: '',
        maxResults: 100
      };
      
      try {
        const { items, total } = await searchCulturalItems(defaultFilters);
        setCulturalItems(items);
        setTotalResults(total);
        setCurrentFilters(defaultFilters);
        setCurrentPage(1);
      } catch (error) {
        console.error('Initial search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialSearch();
  }, []);

  // Yeni arama filtrelerini kullanarak arama yapar
  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      // Arama öncesi aktif filtreleri güncelle
      setCurrentFilters(filters);
      
      // API ile arama yap - tüm filtreleri API'ye gönder
      const { items, total } = await searchCulturalItems(filters);
      setCulturalItems(items);
      setTotalResults(total);
      setCurrentPage(1);
      
      // Önceki seçimleri temizle
      setSelectedItems([]);
      setCurrentRoute(undefined);
      
      console.log(`Arama tamamlandı. ${items.length} sonuç bulundu. Toplam: ${total}`);
      console.log('Kullanılan filtreler:', filters);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerClick = (item: CulturalItem) => {
    // Eğer öğe zaten seçiliyse, seçimden kaldır
    if (selectedItems.some(selected => selected.id === item.id)) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      // Değilse, seçili öğelere ekle
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleCreateRoute = (route: CultureRoute) => {
    // Rota ile ilgili eser bilgilerini kaydet
    setRouteDetails(prev => ({
      ...prev,
      [route.id]: selectedItems
    }));
    
    setSavedRoutes(prev => [...prev, route]);
    setCurrentRoute(route);
    alert(`"${route.name}" rotası başarıyla oluşturuldu!`);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setCurrentRoute(undefined);
  };

  const handleSelectRoute = (route: CultureRoute) => {
    setCurrentRoute(route);
    
    // Kaydedilmiş eserler varsa onları kullan
    if (routeDetails[route.id]) {
      setSelectedItems(routeDetails[route.id]);
    } else {
      // Yoksa mevcut eserlerden bulmaya çalış
      const routeItemIds = route.points.map(point => point.itemId);
      const routeItems = culturalItems.filter(item => routeItemIds.includes(item.id));
      setSelectedItems(routeItems);
      
      // Bulunan eserleri detaylara ekle
      if (routeItems.length > 0) {
        setRouteDetails(prev => ({
          ...prev,
          [route.id]: routeItems
        }));
      }
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    // Rotayı sil
    setSavedRoutes(prev => prev.filter(route => route.id !== routeId));
    
    // Eğer silinen rota aktif rotaysa, seçimi temizle
    if (currentRoute && currentRoute.id === routeId) {
      setCurrentRoute(undefined);
      setSelectedItems([]);
    }
    
    // Rota detaylarını da sil
    setRouteDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[routeId];
      return newDetails;
    });
  };

  const handleLoadMore = async () => {
    if (isLoading || totalResults <= culturalItems.length) return;
    
    setIsLoading(true);
    const nextPage = currentPage + 1;
    
    try {
      // Mevcut filtreleri kullanarak daha fazla sonuç yükle
      const loadMoreFilters = {
        ...currentFilters,
        maxResults: 100,
        page: nextPage
      };
      
      const { items, total } = await searchCulturalItems(loadMoreFilters);
      
      // Yeni öğeleri mevcut listeye ekle
      setCulturalItems(prev => [...prev, ...items]);
      setTotalResults(total);
      setCurrentPage(nextPage);
      
      console.log(`Daha fazla sonuç yüklendi. Toplam: ${culturalItems.length + items.length}/${total}`);
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rota kartı için önizleme görseli oluşturan yardımcı fonksiyon
  const getRoutePreviewImage = (routeId: string): string | undefined => {
    const items = routeDetails[routeId];
    if (items && items.length > 0) {
      // İlk eserin görselini kullan
      for (const item of items) {
        if (item.imageUrl) {
          return item.imageUrl;
        }
      }
    }
    // Varsayılan görsel
    return undefined;
  };

  // Rota için ülke listesi oluşturan yardımcı fonksiyon
  const getRouteCountries = (routeId: string): string[] => {
    const items = routeDetails[routeId];
    if (!items || items.length === 0) return [];
    
    const countries = new Set<string>();
    items.forEach(item => {
      if (item.providingCountry) {
        countries.add(item.providingCountry);
      }
    });
    
    return Array.from(countries);
  };

  // Rota URL'ini oluştur
  const getRouteShareUrl = (routeId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/routes/${routeId}`;
  };

  // URL'i panoya kopyala
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Bağlantı panoya kopyalandı!');
      })
      .catch(err => {
        console.error('Kopyalama başarısız:', err);
      });
  };

  // Rotayı sosyal medyada paylaş
  const shareOnSocialMedia = (platform: string, routeId: string) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (!route) return;
    
    const shareUrl = getRouteShareUrl(routeId);
    const shareText = `Culturoute üzerinde "${route.name}" rotamı keşfet!`;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  };

  // Paylaşım modalı
  const ShareModal = ({ routeId, onClose }: { routeId: string; onClose: () => void }) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (!route) return null;
    
    const shareUrl = getRouteShareUrl(routeId);
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>"{route.name}" Rotasını Paylaş</h3>
          
          <div className="share-url-container">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly
              className="share-url-input"
            />
            <button 
              className="copy-url-button"
              onClick={() => copyToClipboard(shareUrl)}
            >
              Kopyala
            </button>
          </div>
          
          <div className="social-share-buttons">
            <button 
              className="social-button twitter"
              onClick={() => shareOnSocialMedia('twitter', routeId)}
            >
              Twitter'da Paylaş
            </button>
            <button 
              className="social-button facebook"
              onClick={() => shareOnSocialMedia('facebook', routeId)}
            >
              Facebook'ta Paylaş
            </button>
            <button 
              className="social-button whatsapp"
              onClick={() => shareOnSocialMedia('whatsapp', routeId)}
            >
              WhatsApp'ta Paylaş
            </button>
          </div>
          
          <button className="modal-close-button" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Culturoute</h1>
          <nav>
            <Link to="/">Ana Sayfa</Link>
            <Link to="/routes">Rotalarım</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <div className="main-content">
              <div className="sidebar">
                <SearchPanel 
                  onSearch={handleSearch} 
                  isLoading={isLoading}
                  initialFilters={currentFilters}
                />
                <RoutePanel 
                  selectedItems={selectedItems} 
                  onCreateRoute={handleCreateRoute} 
                  onClearSelection={handleClearSelection}
                />
                
                {/* Durum bilgisi */}
                <div className="status-info">
                  <h3>Arama Durumu</h3>
                  <p>
                    {isLoading ? 'Aranıyor...' : (
                      <>
                        <strong>{culturalItems.length}</strong> sonuç görüntüleniyor
                        {totalResults > 0 && (
                          <> (toplam <strong>{totalResults}</strong> sonuçtan)</>
                        )}
                      </>
                    )}
                  </p>
                  {currentFilters.type && (
                    <div className="active-filter">
                      <span>Aktif Tür Filtresi:</span> {currentFilters.type}
                    </div>
                  )}
                  {currentFilters.country && (
                    <div className="active-filter">
                      <span>Aktif Ülke Filtresi:</span> {currentFilters.country}
                    </div>
                  )}
                </div>
              </div>
              <div className="map-container">
                {isLoading && culturalItems.length === 0 ? (
                  <div className="loading-indicator">Yükleniyor...</div>
                ) : (
                  <MapComponent 
                    items={culturalItems}
                    selectedRoute={currentRoute}
                    onMarkerClick={handleMarkerClick}
                    selectedItems={selectedItems}
                    onLoadMore={handleLoadMore}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          } />

          <Route path="/routes" element={
            <div className="routes-page">
              <h2>Kaydedilen Rotalar</h2>
              {savedRoutes.length === 0 ? (
                <p>Henüz kaydedilmiş rota yok.</p>
              ) : (
                <div className="routes-list">
                  {savedRoutes.map(route => {
                    const previewImage = getRoutePreviewImage(route.id);
                    const countries = getRouteCountries(route.id);
                    const routeItems = routeDetails[route.id] || [];
                    
                    return (
                      <div key={route.id} className="route-card">
                        <div className="route-card-content">
                          {previewImage && (
                            <div className="route-preview-image">
                              <img src={previewImage} alt={route.name} />
                            </div>
                          )}
                          
                          <div className="route-info">
                            <h3>{route.name}</h3>
                            <p className="route-stops">
                              <strong>{route.points.length}</strong> durak
                            </p>
                            
                            {countries.length > 0 && (
                              <div className="route-countries">
                                <span>Ülkeler:</span> {countries.join(', ')}
                              </div>
                            )}
                            
                            {routeItems.length > 0 && (
                              <div className="route-items-list">
                                <span>Eserler:</span>
                                <ul>
                                  {routeItems.slice(0, 3).map((item, index) => (
                                    <li key={item.id}>
                                      {index + 1}. {item.title.length > 30 ? 
                                        `${item.title.substring(0, 30)}...` : item.title}
                                    </li>
                                  ))}
                                  {routeItems.length > 3 && (
                                    <li>...ve {routeItems.length - 3} eser daha</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="route-actions">
                          <button 
                            className="view-route-button"
                            onClick={() => {
                              handleSelectRoute(route);
                              // Ana sayfaya yönlendir
                              window.location.href = '/';
                            }}
                          >
                            Rotayı Görüntüle
                          </button>
                          <button 
                            className="delete-route-button"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            Rotayı Sil
                          </button>
                        </div>
                        
                        <div className="route-share-action">
                          <button 
                            className="share-route-button"
                            onClick={() => {
                              setActiveShareRoute(route.id);
                              setShareModalOpen(true);
                            }}
                          >
                            Paylaş
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link to="/" className="back-button">Ana Sayfaya Dön</Link>
            </div>
          } />
        </Routes>
        
        {/* Paylaşım Modalı */}
        {shareModalOpen && activeShareRoute && (
          <ShareModal 
            routeId={activeShareRoute} 
            onClose={() => {
              setShareModalOpen(false);
              setActiveShareRoute(null);
            }} 
          />
        )}
      </div>
    </Router>
  );
};

export default App;
