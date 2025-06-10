import axios from 'axios';
import { CulturalItem, SearchFilters, SearchResponse } from '../types';

// API anahtarı için güvenlik nedeniyle çevre değişkeni kullanın
const API_KEY = 'ttendeppl'; // Gerçek bir uygulamada .env dosyasında saklayın

const BASE_URL = 'https://api.europeana.eu/record/v2';
const SEARCH_URL = 'https://api.europeana.eu/api/v2/search.json';

// Arama filtrelerini Europeana API formatına dönüştürme
const buildQueryParams = (filters: SearchFilters) => {
  console.log('Arama filtrelerini işleme:', filters);

  // Sorgu terimleri için dizi
  const queryTerms: string[] = [];
  
  // Anahtar kelime sorgusu
  if (filters.query && filters.query.trim() !== '') {
    queryTerms.push(filters.query.trim());
  } else {
    // Varsayılan sorgu - boş sorguları önlemek için
    queryTerms.push('art');
  }

  // Temel sorgu parametreleri
  const params: Record<string, string> = {
    wskey: API_KEY,
    reusability: 'open',
    media: 'true',
    thumbnail: 'true',
    rows: filters.maxResults ? filters.maxResults.toString() : '100', // Kullanıcının belirttiği sonuç sayısı veya varsayılan
    profile: 'rich' // Zengin metadata almak için
  };

  // Sayfalama için start parametresi
  if (filters.page && filters.page > 1) {
    // Her sayfa için başlangıç indeksi hesaplanır (sayfa - 1) * sayfa başına sonuç sayısı
    const startIndex = (filters.page - 1) * (filters.maxResults || 100);
    params.start = startIndex.toString();
  }

  // Tür filtresi
  if (filters.type && filters.type.trim() !== '') {
    const typeValue = filters.type.trim();
    
    // Temel Europeana türleri için direkt TYPE parametresi kullan
    if (['TEXT', 'IMAGE', 'SOUND', 'VIDEO', '3D'].includes(typeValue.toUpperCase())) {
      params.qf = `TYPE:${typeValue.toUpperCase()}`;
    } else {
      // Alt türler için başlık ve açıklama içinde ara
      const typeQuery = `(title:${typeValue} OR description:${typeValue} OR what:${typeValue})`;
      queryTerms.push(typeQuery);
    }
  }

  // Ülke filtresi
  if (filters.country && filters.country.trim() !== '') {
    const countryValue = filters.country.trim();
    
    // qf parametresi zaten varsa AND ile ekle, yoksa yeni parametre oluştur
    if (params.qf) {
      params.qf = `${params.qf} AND COUNTRY:${countryValue}`;
    } else {
      params.qf = `COUNTRY:${countryValue}`;
    }
  }

  // Tüm sorgu terimlerini birleştir
  params.query = queryTerms.join(' AND ');

  console.log('Oluşturulan API parametreleri:', params);
  return params;
};

// Rastgele koordinat oluşturma (gerçek veriler için geo bilgisi varsa onu kullanmak daha iyidir)
const getRandomCoordinatesForCountry = (country: string) => {
  // Basitleştirilmiş ülke-koordinat haritası
  const countryCoordinates: Record<string, [number, number, number]> = {
    'France': [46.603354, 1.888334, 1.5], 
    'Germany': [51.165691, 10.451526, 1.5],
    'Italy': [41.871940, 12.567380, 1.5],
    'Spain': [40.463667, -3.749220, 1.5],
    'Netherlands': [52.132633, 5.291266, 1],
    'United Kingdom': [55.378051, -3.435973, 2],
    'Greece': [39.074208, 21.824312, 1],
    'Sweden': [60.128161, 18.643501, 2],
    'Portugal': [39.399872, -8.224454, 1],
    'Austria': [47.516231, 14.550072, 1],
    'Belgium': [50.503887, 4.469936, 1],
    'Bulgaria': [42.733883, 25.48583, 1],
    'Croatia': [45.1, 15.2, 1],
    'Cyprus': [35.126413, 33.429859, 1],
    'Czech Republic': [49.817492, 15.472962, 1],
    'Denmark': [56.26392, 9.501785, 1],
    'Estonia': [58.595272, 25.013607, 1],
    'Finland': [61.92411, 25.748151, 1],
    'Hungary': [47.162494, 19.503304, 1],
    'Ireland': [53.41291, -8.24389, 1],
    'Latvia': [56.879635, 24.603189, 1],
    'Lithuania': [55.169438, 23.881275, 1],
    'Luxembourg': [49.815273, 6.129583, 0.5],
    'Malta': [35.937496, 14.375416, 0.5],
    'Poland': [51.919438, 19.145136, 1.5],
    'Romania': [45.943161, 24.96676, 1.5],
    'Slovakia': [48.669026, 19.699024, 1],
    'Slovenia': [46.151241, 14.995463, 1]
  };

  const defaultCoords: [number, number, number] = [48.856614, 2.352222, 5]; // Paris (varsayılan)
  const [baseLat, baseLng, spread] = countryCoordinates[country] || defaultCoords;
  
  // Rastgele nokta oluşturma
  const lat = baseLat + (Math.random() - 0.5) * spread;
  const lng = baseLng + (Math.random() - 0.5) * spread;
  
  return { latitude: lat, longitude: lng };
};

// Nesneyi string'e dönüştürme yardımcı fonksiyonu - İç içe nesneleri daha iyi işle
const ensureString = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value) && value.length > 0) {
    // Dizi ise ilk elemanı al
    return ensureString(value[0]);
  } else if (value && typeof value === 'object') {
    try {
      // Bazı Europeana alanları iç içe nesneler içerebilir
      if (value.def) return ensureString(value.def); // Çoğu zaman def anahtarı asıl değeri içerir
      
      return JSON.stringify(value);
    } catch (e) {
      return 'Kompleks nesne';
    }
  } else if (value === null || value === undefined) {
    return '';
  } else {
    return String(value);
  }
};

// Europeana'dan alınan metadata'yı alma yardımcı fonksiyonu
const getMetadataValue = (item: any, fieldNames: string[]): string => {
  for (const fieldName of fieldNames) {
    if (item[fieldName]) {
      if (Array.isArray(item[fieldName]) && item[fieldName].length > 0) {
        const value = item[fieldName][0];
        return ensureString(value);
      } else {
        return ensureString(item[fieldName]);
      }
    }
  }
  return '';
};

// API'den alınan verileri uygulama formatına dönüştürme
const transformEuropeanaData = (data: any): CulturalItem[] => {
  if (!data || !data.items || !Array.isArray(data.items)) {
    console.log('API yanıtında geçerli veri bulunamadı');
    return [];
  }

  console.log(`API'den ${data.items.length} öğe alındı, toplam sonuç: ${data.totalResults || 'bilinmiyor'}`);

  const transformedItems = data.items
    .filter((item: any) => item.title && item.title.length > 0)
    .map((item: any) => {
      // API yanıtını detaylı logla
      console.log('İşlenen öğe:', item);
      
      // Ülke bilgisi (edmCountry)
      const country = getMetadataValue(item, ['edmCountry', 'country']);
      
      // Tür bilgisi (type) - Birden fazla alan kontrol edilecek
      const type = getMetadataValue(item, ['type', 'dcType', 'edmType']);
      
      // Dönem bilgisi (year, created, timespan)
      const period = getMetadataValue(item, ['year', 'dcDate', 'dctermsCreated', 'edmTimespanLabel', 'timespan']);

      // Başlık ve açıklama
      const title = getMetadataValue(item, ['title', 'dcTitle']);
      const description = getMetadataValue(item, ['dcDescription']);
      
      // Görsel URL
      const imageUrl = getMetadataValue(item, ['edmPreview', 'edmIsShownBy']);

      // Yaratıcı/Sanatçı bilgisi
      const creator = getMetadataValue(item, ['dcCreator', 'creator', 'dc:creator']);
      
      // Yıl bilgisi
      const year = getMetadataValue(item, ['year', 'dcDate', 'dc:date', 'edmTimespanLabel']);
      
      // Sağlayan kurum - Europeana dataProvider alanı genellikle sağlayan kurumu içerir
      const providingInstitution = getMetadataValue(item, ['edmDataProvider', 'dataProvider', 'provider', 'dc:publisher']);
      
      // Sağlayan ülke
      const providingCountry = country;

      // Europeana link bilgisi
      const europeanaLink = item.guid || item.edmIsShownAt || item.edmIsShownBy;

      // Konum için rastgele koordinat (gerçek veriler yoksa)
      const { latitude, longitude } = getRandomCoordinatesForCountry(country);

      const culturalItem = {
        id: item.id ? ensureString(item.id) : `item-${Math.random().toString(36).substr(2, 9)}`,
        title: title || 'Untitled',
        description,
        imageUrl: imageUrl || undefined,
        provider: providingInstitution || country, // Kurum bilgisi yoksa ülke bilgisini göster
        period,
        type,
        latitude,
        longitude,
        link: europeanaLink ? ensureString(europeanaLink) : undefined,
        creator,
        year,
        providingInstitution,
        providingCountry
      };

      // Oluşturulan nesneyi logla
      console.log('Dönüştürülen öğe:', culturalItem);
      
      return culturalItem;
    });

  // Sonuçlar hakkında bilgi
  if (transformedItems.length > 0) {
    const typeCounts: Record<string, number> = {};
    transformedItems.forEach((item: CulturalItem) => {
      if (item.type) {
        const type = item.type.toUpperCase().trim();
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
    
    console.log('Sonuçların tür dağılımı:', typeCounts);
  }
  
  return transformedItems;
};

// Kültürel eserleri arama
export const searchCulturalItems = async (filters: SearchFilters): Promise<SearchResponse> => {
  try {
    const params = buildQueryParams(filters);
    console.log('API isteği gönderiliyor:', SEARCH_URL);
    
    const response = await axios.get(SEARCH_URL, { params });
    
    console.log('API yanıtı alındı. Başarı durumu:', response.status === 200 ? 'Başarılı' : 'Hata');
    
    let totalResults = 0;
    if (response.data && response.data.totalResults) {
      totalResults = parseInt(response.data.totalResults, 10);
      if (isNaN(totalResults)) totalResults = 0;
    }
    
    if (response.data && response.data.items) {
      console.log(`API yanıtı: ${response.data.items.length} öğe, toplam: ${totalResults}`);
    }
    
    const items = transformEuropeanaData(response.data);
    return {
      items,
      total: totalResults
    };
  } catch (error) {
    console.error('Kültürel öğeleri getirirken hata oluştu:', error);
    return {
      items: [],
      total: 0
    };
  }
};

// Belirli bir kültürel eseri getirme
export const getCulturalItemById = async (id: string): Promise<CulturalItem | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}.json`, {
      params: { wskey: API_KEY }
    });
    
    const items = transformEuropeanaData({ items: [response.data] });
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error(`${id} ID'li kültürel öğeyi getirirken hata oluştu:`, error);
    return null;
  }
}; 