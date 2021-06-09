import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import L from 'leaflet';
import LeafletMap from './component/leafletMap';
import cordova from './cordova';
import geolocation, { Position } from './geolocation';
import parkingData from './geojson/bicycle parking.geojson';
import rentalAndShopsData from './geojson/bike rental and shops.geojson';
import waysData from './geojson/cycle ways.geojson';
import waterData from './geojson/drinking water.geojson';
import foodData from './geojson/food vendors.geojson';
import toiletData from './geojson/toilets.geojson';

const parkingIcon    = L.divIcon({ html: '🅿️', className: 'icon' });
const shopIcon       = L.divIcon({ html: '🛒', className: 'icon' });
const waterIcon      = L.divIcon({ html: '🚰', className: 'icon' });
const coffeeIcon     = L.divIcon({ html: '☕', className: 'icon' });
const burgerIcon     = L.divIcon({ html: '🍔', className: 'icon' });
const restaurantIcon = L.divIcon({ html: '🍴', className: 'icon' });
const kioskIcon      = L.divIcon({ html: '🥤', className: 'icon' });
const toiletIcon     = L.divIcon({ html: '🚻', className: 'icon' });


const App: React.FunctionComponent = () => {
    const [latitude, setLatitude] = useState<number>(NaN);
    const [longitude, setLongitude] = useState<number>(NaN);

    useEffect(() => {
        const callback = (position: Position) => {
            setLatitude(position.latitude);
            setLongitude(position.longitude);
        };
        geolocation.watchPosition(callback);
        return () => {
            geolocation.unwatchPosition(callback);
        };
    }, []);

    return <React.Fragment>
        <LeafletMap
            defaultCenter={[31.807663, 34.658638]}
            defaultZoom={16}
            layers={{
                geojson: [
                    {
                        data: parkingData,
                        options: {
                            pointToLayer: (_point, latlng) =>
                                L.marker(latlng, { icon: parkingIcon }),
                        },
                    },
                    {
                        data: rentalAndShopsData,
                        options: {
                            pointToLayer: (_point, latlng) =>
                                L.marker(latlng, { icon: shopIcon }),
                        },
                    },
                    {
                        data: waysData,
                        options: {
                            style: () => ({
                                color: '#01367c', // same as bicycle road sign
                                weight: 8,
                            }),
                        },
                    },
                    {
                        data: waterData,
                        options: {
                            pointToLayer: (_point, latlng) =>
                                L.marker(latlng, { icon: waterIcon }),
                        },
                    },
                    {
                        data: foodData,
                        options: {
                            pointToLayer: (point, latlng) => {
                                const icon = (() => {
                                    switch (point.properties.fclass) {
                                        case 'restaurant':
                                            return restaurantIcon;
                                        case 'cafe':
                                            return coffeeIcon;
                                        case 'kiosk':
                                            return kioskIcon;
                                        case 'fast_food':
                                            return burgerIcon;
                                    }
                                    return null;
                                })();
                                return L.marker(latlng, { icon });
                            },
                        },
                    },
                    {
                        data: toiletData,
                        options: {
                            pointToLayer: (_point, latlng) =>
                                L.marker(latlng, { icon: toiletIcon }),
                        },
                    },
                ],
            }}
        />
        <div className="footer">
            {!isNaN(latitude) && !isNaN(longitude) && <React.Fragment>
                lat={latitude.toPrecision(6)} long={longitude.toPrecision(6)}
            </React.Fragment>}
        </div>
    </React.Fragment>;
};

cordova.onReady(() => {
    ReactDom.render(<App/>, document.getElementById('root'));
});
