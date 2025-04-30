import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
  onLocationSelect?: (lat: number, lng: number, name: string) => void;
  requiterLocation?: {
    latitude: number;
    longitude: number;
    locationName: string;
  } | null;
  showDirections?: boolean;
}

function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number, name: string) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());

      // Reverse geocoding to get location name
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
      )
        .then((response) => response.json())
        .then((data) => {
          const name = data.display_name;
          setLocationName(name);
          if (onLocationSelect) {
            onLocationSelect(e.latlng.lat, e.latlng.lng, name);
          }
        });
    });
  }, [map, onLocationSelect]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Your location: {locationName}</Popup>
    </Marker>
  );
}

function RoutingMachine({ start, end }: { start: L.LatLng; end: L.LatLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: "#6366F1", weight: 4 }],
        extendToWaypoints: false,
        missingRouteTolerance: 0,
      },
      createMarker: () => null,
    } as L.Routing.RoutingControlOptions & { createMarker?: any }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]);

  return null;
}

export function Map({
  latitude,
  longitude,
  locationName,
  onLocationSelect,
  requiterLocation,
  showDirections,
}: LocationData) {
  const position: [number, number] =
    latitude && longitude ? [latitude, longitude] : [0, 0];

  const userIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const requiterIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {latitude && longitude ? (
        <Marker position={position} icon={userIcon}>
          <Popup>{locationName || "Customer Location"}</Popup>
        </Marker>
      ) : (
        <LocationMarker onLocationSelect={onLocationSelect} />
      )}

      {requiterLocation && (
        <Marker
          position={[requiterLocation.latitude, requiterLocation.longitude]}
          icon={requiterIcon}
        >
          <Popup>{requiterLocation.locationName || "Your Location"}</Popup>
        </Marker>
      )}

      {showDirections && requiterLocation && (
        <RoutingMachine
          start={
            new L.LatLng(requiterLocation.latitude, requiterLocation.longitude)
          }
          end={new L.LatLng(latitude, longitude)}
        />
      )}
    </MapContainer>
  );
}
