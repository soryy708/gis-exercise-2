declare module '*.geojson' {
    const content: Record<string, any>;
    export default content;
}

declare module 'geojson-path-finder' {
    type GeoJSON = {
        type: 'FeatureCollection',
        features: {
            type: 'Feature',
            properties: Record<string, any>,
            geometry: {
                type: string,
                coordinates: [number, number] | [[number, number]][],
            },
        }[],
    };
    type Point = {
        geometry: {
            type: 'Point' | 'point',
            coordinates: number[],
        },
    };
    export default class PathFinder {
        constructor(geojson: GeoJSON);
        findPath(start: Point, finish: Point): {
            edgeDatas: any;
            path: [number, number][];
            weight: number;
        };
    }
}
