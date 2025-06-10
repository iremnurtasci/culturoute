import React, { useState, useEffect } from 'react';
import { SearchFilters } from '../types';

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  initialFilters?: SearchFilters;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading, initialFilters }) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    query: '',
    country: '',
    type: '',
    maxResults: 100
  });

  // initialFilters değiştiğinde state'i güncelle
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Örnek ülke listesi
  const countries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'United Kingdom'
  ];

  // Europeana'nın temel türleri ve alt türleri
  const typeGroups = [
    {
      label: 'Temel Europeana Türleri',
      options: [
        { value: 'TEXT', label: 'TEXT (Metinler)' },
        { value: 'IMAGE', label: 'IMAGE (Görseller)' },
        { value: 'SOUND', label: 'SOUND (Sesler)' },
        { value: 'VIDEO', label: 'VIDEO (Videolar)' },
        { value: '3D', label: '3D (Üç Boyutlu Objeler)' }
      ]
    },
    {
      label: 'Alt Türler',
      options: [
        { value: 'Painting', label: 'Resim' },
        { value: 'Sculpture', label: 'Heykel' },
        { value: 'Photograph', label: 'Fotoğraf' },
        { value: 'Manuscript', label: 'El Yazması' },
        { value: 'Map', label: 'Harita' },
        { value: 'Book', label: 'Kitap' },
        { value: 'Letter', label: 'Mektup' },
        { value: 'Poster', label: 'Poster' },
        { value: 'Coin', label: 'Sikke' },
        { value: 'Drawing', label: 'Çizim' },
        { value: 'Print', label: 'Baskı' },
        { value: 'Tapestry', label: 'Duvar Halısı' },
        { value: 'Furniture', label: 'Mobilya' },
        { value: 'Ceramics', label: 'Seramik' },
        { value: 'Clothing', label: 'Giysi' },
        { value: 'Jewelry', label: 'Mücevher' },
        { value: 'Musical Instrument', label: 'Müzik Aleti' }
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      query: 'art',
      country: '',
      type: '',
      maxResults: 100
    };
    
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  return (
    <div className="search-panel">
      <h2>Kültürel Eser Arama</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="query">
            <i className="search-icon">🔍</i>
            Anahtar Kelime
          </label>
          <input
            type="text"
            id="query"
            name="query"
            value={filters.query}
            onChange={handleInputChange}
            placeholder="Örn: Mona Lisa, Leonardo da Vinci"
            className="input-with-icon"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">
            <i className="location-icon">🌍</i>
            Ülke
          </label>
          <div className="select-wrapper">
            <select
              id="country"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
            >
              <option value="">Tümü</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="type">
            <i className="type-icon">🖼️</i>
            Eser Türü
          </label>
          <div className="select-wrapper">
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleInputChange}
            >
              <option value="">Tümü</option>
              {typeGroups.map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Aranıyor...
              </>
            ) : (
              <>
                <i className="search-button-icon">🔍</i>
                Ara
              </>
            )}
          </button>
          <button type="button" className="reset-button" onClick={handleReset} disabled={isLoading}>
            <i className="reset-icon">↺</i>
            Temizle
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchPanel; 