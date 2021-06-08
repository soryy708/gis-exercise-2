import cordova from './cordova';

export type Position = {
    latitude: number;
    longitude: number;
    accuracy: number;
};

type WatchPositionCallback = (position: Position) => void;

type Context = {
    watchPositionListeners: WatchPositionCallback[];
};

const globalContext: Context = {
    watchPositionListeners: [],
};

function init(context: Context = globalContext): Context {
    if (!context) {
        context = {
            watchPositionListeners: [],
        };
    }

    cordova.onReady(() => {
        navigator.geolocation.watchPosition(pos => {
            context.watchPositionListeners.forEach(cb => cb(pos.coords));
        }, err => {
            console.error(err.message);
        });
    });
    
    return context;
}

function watchPosition(cb: WatchPositionCallback, context: Context = globalContext): void {
    context.watchPositionListeners.push(cb);
}

function unwatchPosition(cb: WatchPositionCallback, context: Context = globalContext): void {
    const index = context.watchPositionListeners.findIndex(c => c === cb);
    if (index === -1) {
        return;
    }
    context.watchPositionListeners.splice(index, 1);
}

init(globalContext);

export default {
    watchPosition,
    unwatchPosition,
};
