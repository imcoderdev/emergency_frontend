import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points, options = {} }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Default heatmap options
    const heatmapOptions = {
      radius: options.radius || 25,
      blur: options.blur || 15,
      maxZoom: options.maxZoom || 17,
      max: options.max || 1.0,
      minOpacity: options.minOpacity || 0.4,
      gradient: options.gradient || {
        0.2: '#3b82f6', // blue
        0.4: '#22c55e', // green
        0.6: '#eab308', // yellow
        0.8: '#f97316', // orange
        1.0: '#ef4444'  // red
      }
    };

    // Create heat layer
    const heat = L.heatLayer(points, heatmapOptions);
    heat.addTo(map);

    // Cleanup on unmount or when points change
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
