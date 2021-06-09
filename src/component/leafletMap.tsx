import React, { useRef, useState, useEffect } from 'react';
import L, { Map, PolylineOptions, MarkerOptions, GeoJSONOptions, LeafletMouseEvent, Icon } from 'leaflet';

const myPositionIcon = L.divIcon({ html: '📍'  });

type LeafletMapProps = {
    defaultCenter?: [number, number];
    defaultZoom?: number;
    layers?: {
        polyline?: {
            latlngs: Array<[number, number]>;
            color?: string;
            dashArray?: string;
            onClick?: () => void;
        }[];
        geojson?: {
            data: Record<string, any>;
            options?: GeoJSONOptions,
        }[],
    };
    markers?: {
        latlng: [number, number],
        icon?: Icon,
    }[],
    onClick?: (ev: LeafletMouseEvent) => void;
};

const LeafletMap: React.FunctionComponent<LeafletMapProps> = (props: LeafletMapProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<Map>(null);
    const [tileLayer, setTileLayer] = useState(null);
    const [userPosition, setUserPosition] = useState(null);

    useEffect(() => {
        setUserPosition(null);
        if (!rootRef.current || rootRef.current.classList.contains('leaflet-container')) {
            return;
        }

        const newMap = L.map(rootRef.current, {
            center: props.defaultCenter,
            zoom: props.defaultZoom,
        });
        if (props.onClick) {
            newMap.on('click', props.onClick);
        }

        const newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 8,
            maxZoom: 16,
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(newMap);

        setMap(newMap);
        setTileLayer(newTileLayer);
    }, [rootRef.current]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const currentPosition=map.locate({setView:false,maxZoom:14,watch:true}).on('locationfound', e=> {
            L.marker(e.latlng,{icon:myPositionIcon}).addTo(map);
        });
        if(currentPosition !== userPosition){
            setUserPosition(currentPosition);
        }
        map.on('locationerror', e=> {
            alert(e.message);
        });
    
        map.eachLayer(layer => {
            if (layer !== tileLayer) {
                map.removeLayer(layer);
            }
        });
        if (props.layers) {
            if (props.layers.polyline) {
                props.layers.polyline.forEach(layer => {
                    const options: PolylineOptions = {};
                    if (layer.color) {
                        options.color = layer.color;
                    }
                    if (layer.dashArray) {
                        options.dashArray = layer.dashArray;
                    }
                    const polyLine = L.polyline(layer.latlngs, options);
                    polyLine.addTo(map);
                    if (layer.onClick) {
                        polyLine.on('click', layer.onClick);
                    }
                });
            }

            if (props.layers.geojson) {
                props.layers.geojson.forEach(layer => {
                    const geojson = L.geoJSON(layer.data as any, layer.options);
                    geojson.addTo(map);
                });
                console.log('reacted here');
            }
        }
        if (props.markers) {
            props.markers.forEach(marker => {
                const options: MarkerOptions = {};
                if (marker.icon) {
                    options.icon = marker.icon;
                }
                L.marker({
                    lat: marker.latlng[1],
                    lng: marker.latlng[0],
                }, options).addTo(map);
            });
        }
    }, [map, tileLayer, props.layers, props.markers]);

    return <div
        ref={rootRef}
    >
    </div>;
};

export default LeafletMap;
