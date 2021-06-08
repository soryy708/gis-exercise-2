import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import LeafletMap from './component/leafletMap';
import cordova from './cordova';
import geolocation, { Position } from './geolocation';

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
