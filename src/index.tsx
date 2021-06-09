import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import L, { LatLngBounds, Map } from 'leaflet';
import LeafletMap from './component/leafletMap';
import cordova from './cordova';
import geolocation, { Position } from './geolocation';
import { bboxClip, polygon as turfPolygon, booleanWithin } from '@turf/turf';

const waterSymbol = '🚰';
const shopSymbol = '🛒';
const parkingSymbol = '🅿️';
const burgerSymbol = '🍔';
const toiletSymbol = '🚻';

const parkingIcon    = L.divIcon({ html: parkingSymbol, className: 'icon' });
const shopIcon       = L.divIcon({ html: shopSymbol, className: 'icon' });
const waterIcon      = L.divIcon({ html: waterSymbol, className: 'icon' });
const coffeeIcon     = L.divIcon({ html: '☕', className: 'icon' });
const burgerIcon     = L.divIcon({ html: burgerSymbol, className: 'icon' });
const restaurantIcon = L.divIcon({ html: '🍴', className: 'icon' });
const kioskIcon      = L.divIcon({ html: '🥤', className: 'icon' });
const positionIcon   = L.divIcon({ html: '📍', className:'icon' });
const toiletIcon     = L.divIcon({ html: toiletSymbol, className: 'icon' });

const useBoolean = (defaultVal: boolean): [boolean, () => void] => {
    const [val, setVal] = useState<boolean>(defaultVal);
    return [
        val,
        () => setVal(oldVal => !oldVal),
    ];
};

const App: React.FunctionComponent = () => {
    const [localized, setLocalized] = useState<boolean>(false);
    const [latitude, setLatitude] = useState<number>(NaN);
    const [longitude, setLongitude] = useState<number>(NaN);
    const [showToilet, toggleShowToilet] = useBoolean(false);
    const [showWater, toggleShowWater] = useBoolean(false);
    const [showFood, toggleShowFood] = useBoolean(false);
    const [showShops, toggleShowShops] = useBoolean(false);
    const [showParking, toggleShowParking] = useBoolean(false);
    const [parkingData, setParkingData] = useState<Record<string, any>>(null);
    const [rentalAndShopsData, setRentalAndShopsData] = useState<Record<string, any>>(null);
    const [waysData, setWaysData] = useState<Record<string, any>>(null);
    const [waterData, setWaterData] = useState<Record<string, any>>(null);
    const [foodData, setFoodData] = useState<Record<string, any>>(null);
    const [toiletData, setToiletData] = useState<Record<string, any>>(null);
    const [bounds, setBounds] = useState<LatLngBounds>(null);
    const [map, setMap] = useState<Map>(null);

    useEffect(() => {
        const callback = (position: Position) => {
            setLatitude(position.latitude);
            setLongitude(position.longitude);
            setLocalized(true);
        };
        geolocation.watchPosition(callback);
        return () => {
            geolocation.unwatchPosition(callback);
        };
    }, [map]);

    useEffect(() => {
        if (!map || !localized) {
            return;
        }

        map.panTo([latitude, longitude], {animate: true});
    }, [localized, map]);

    useEffect(() => {
        import('./geojson/bicycle parking.geojson')
            .then(data => setParkingData(data))
            .catch(err => console.error(err));
        import('./geojson/bike rental and shops.geojson')
            .then(data => setRentalAndShopsData(data))
            .catch(err => console.error(err));
        import('./geojson/cycle ways.geojson')
            .then(data => setWaysData(data))
            .catch(err => console.error(err));
        import('./geojson/drinking water.geojson')
            .then(data => setWaterData(data))
            .catch(err => console.error(err));
        import('./geojson/food vendors.geojson')
            .then(data => setFoodData(data))
            .catch(err => console.error(err));
        import('./geojson/toilets.geojson')
            .then(data => setToiletData(data))
            .catch(err => console.error(err));
    }, []);

    const pointsInBounds = (data: Record<string, any>) => {
        if (!data || !bounds) {
            return data;
        }

        return {
            ...data,
            features: data.features.filter((point: any) => {
                const boundingPolygon = turfPolygon([[
                    [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
                    [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
                    [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
                    [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
                    [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
                ]]);
                return booleanWithin(point, boundingPolygon);
            })
        };
    };

    const geoJsonLayers: {data: Record<string, any>, options: L.GeoJSONOptions}[] = [{
        data: (waysData && bounds) ? {
            ...waysData,
            features: waysData.features.map((feature: any) => bboxClip(feature, [
                bounds.getSouthWest().lng,
                bounds.getSouthWest().lat,
                bounds.getNorthEast().lng,
                bounds.getNorthEast().lat,
            ]))
        } : waysData,
        options: {
            style: () => ({
                color: '#01367c', // same as bicycle road sign
                weight: 8,
            }),
        },
    }];
    if (showParking) {
        geoJsonLayers.push({
            data: pointsInBounds(parkingData),
            options: {
                pointToLayer: (_point, latlng) =>
                    L.marker(latlng, { icon: parkingIcon }),
            },
        });
    }
    if (showShops) {
        geoJsonLayers.push({
            data: pointsInBounds(rentalAndShopsData),
            options: {
                pointToLayer: (_point, latlng) =>
                    L.marker(latlng, { icon: shopIcon }),
            },
        });
    }
    if (showWater) {
        geoJsonLayers.push({
            data: pointsInBounds(waterData),
            options: {
                pointToLayer: (_point, latlng) =>
                    L.marker(latlng, { icon: waterIcon }),
            },
        });
    }
    if (showFood) {
        geoJsonLayers.push({
            data: pointsInBounds(foodData),
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
        });
    }
    if (showToilet) {
        geoJsonLayers.push({
            data: pointsInBounds(toiletData),
            options: {
                pointToLayer: (_point, latlng) =>
                    L.marker(latlng, { icon: toiletIcon }),
            },
        });
    }

    return <React.Fragment>
        <LeafletMap
            defaultCenter={[31.807663, 34.658638]}
            defaultZoom={16}
            minZoom={8}
            maxBounds={[
                [29, 33.6],
                [34, 37.5],
            ]}
            onBoundsChange={newBounds => setBounds(newBounds)}
            onMapChange={newMap => setMap(newMap)}
            layers={{
                geojson: geoJsonLayers,
            }}
            markers={!isNaN(latitude) && !isNaN(longitude) ? [{
                latlng: [longitude, latitude],
                icon: positionIcon,
            }] : null}
        />
        <div className="controls">
            <button
                type="button"
                className={showToilet ? 'on' : ''}
                onClick={() => toggleShowToilet()}
            >
                {toiletSymbol} Toilet
            </button>
            <button
                type="button"
                className={showWater ? 'on' : ''}
                onClick={() => toggleShowWater()}
            >
                {waterSymbol} Water
            </button>
            <button
                type="button"
                className={showFood ? 'on' : ''}
                onClick={() => toggleShowFood()}
            >
                {burgerSymbol} Food
            </button>
            <button
                type="button"
                className={showShops ? 'on' : ''}
                onClick={() => toggleShowShops()}
            >
                {shopSymbol} Shops
            </button>
            <button
                type="button"
                className={showParking ? 'on' : ''}
                onClick={() => toggleShowParking()}
            >
                {parkingSymbol} Parking
            </button>
        </div>
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
