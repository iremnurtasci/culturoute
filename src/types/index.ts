export interface CulturalItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  provider?: string;
  period?: string;
  type?: string;
  latitude: number;
  longitude: number;
  link?: string;
  creator?: string;
  year?: string;
  providingInstitution?: string;
  providingCountry?: string;
}

export interface SearchFilters {
  query: string;
  country: string;
  type: string;
  maxResults?: number;
  page?: number;
}

export interface SearchResponse {
  items: CulturalItem[];
  total: number;
}

export interface RoutePoint {
  id: string;
  order: number;
  itemId: string;
}

export interface Route {
  id: string;
  name: string;
  points: RoutePoint[];
} 