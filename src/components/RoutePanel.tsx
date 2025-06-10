import React, { useState } from 'react';
import { CulturalItem, Route, RoutePoint } from '../types';

interface RoutePanelProps {
  selectedItems: CulturalItem[];
  onCreateRoute: (route: Route) => void;
  onClearSelection: () => void;
}

const RoutePanel: React.FC<RoutePanelProps> = ({ 
  selectedItems, 
  onCreateRoute, 
  onClearSelection 
}) => {
  const [routeName, setRouteName] = useState('');

  const handleCreateRoute = () => {
    if (selectedItems.length < 2) {
      alert('Lütfen rota için en az iki nokta seçin.');
      return;
    }

    if (!routeName.trim()) {
      alert('Lütfen rotanıza bir isim verin.');
      return;
    }

    const routePoints: RoutePoint[] = selectedItems.map((item, index) => ({
      id: `point-${Math.random().toString(36).substr(2, 9)}`,
      order: index + 1,
      itemId: item.id
    }));

    const newRoute: Route = {
      id: `route-${Math.random().toString(36).substr(2, 9)}`,
      name: routeName,
      points: routePoints
    };

    onCreateRoute(newRoute);
    setRouteName('');
  };

  return (
    <div className="route-panel">
      <h2>Rota Oluştur</h2>
      
      {selectedItems.length === 0 ? (
        <p>Rotanıza eklemek için haritadan kültürel eserler seçin.</p>
      ) : (
        <>
          <h3>Seçili Eserler ({selectedItems.length})</h3>
          <ul className="selected-items-list">
            {selectedItems.map((item, index) => (
              <li key={item.id}>
                <span className="item-order">{index + 1}.</span>
                <span className="item-title">{item.title}</span>
                <span className="item-location">
                  {item.provider || 'Bilinmeyen Kurum'}
                </span>
              </li>
            ))}
          </ul>

          <div className="form-group">
            <label htmlFor="routeName">Rota İsmi:</label>
            <input
              type="text"
              id="routeName"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Örn: Avrupa Sanat Turu"
            />
          </div>

          <div className="button-group">
            <button onClick={handleCreateRoute} disabled={selectedItems.length < 2 || !routeName.trim()}>
              Rota Oluştur
            </button>
            <button onClick={onClearSelection}>
              Seçimi Temizle
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoutePanel; 