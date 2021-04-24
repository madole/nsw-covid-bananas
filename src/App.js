import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Entity, ModelGraphics, Viewer} from 'resium'
import './App.css';
import {Cartesian3, CesiumTerrainProvider, Color, Ion, IonResource, Material} from 'cesium'

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMjk3OGRkNS0zZTZjLTQyZGYtYjAzNy1lYTk5NmY3NDkyZTMiLCJpZCI6MzMxMzksInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNjc1ODh9.KjJzjblyvrJlF0WkZZznyR6FXfNZY432yc19DtT1Ozc'


const DATA_URL = "https://opensky-network.org/api/states/all";
const DATA_INDEX = {
    UNIQUE_ID: 0,
    CALL_SIGN: 1,
    ORIGIN_COUNTRY: 2,
    LONGITUDE: 5,
    LATITUDE: 6,
    BARO_ALTITUDE: 7,
    VELOCITY: 9,
    TRUE_TRACK: 10,
    VERTICAL_RATE: 11,
    GEO_ALTITUDE: 13,
    POSITION_SOURCE: 16,
};

function verticalRateToAngle(object) {
    // Return: -90 looking up, +90 looking down
    const verticalRate = object[DATA_INDEX.VERTICAL_RATE] || 0;
    const velocity = object[DATA_INDEX.VELOCITY] || 0;
    return (-Math.atan2(verticalRate, velocity) * 180) / Math.PI;
}

function sortResponseData(response, currentData) {
    if (response && response.states) {
        // In order to keep the animation smooth we need to always return the same
        // objects in the exact same order. This function will discard new objects
        // and only update existing ones.
        let sortedData = response.states;
        if (currentData) {
            const dataAsObj = {};
            sortedData.forEach(
                (entry) => (dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] = entry)
            );
            sortedData = currentData.map(
                (entry) => dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] || entry
            );
        }

        return sortedData;
    }
    return null;
}

const REFRESH_TIME = 10 * 1000

/**
 * Data fetching hook which stops the interval
 * if visible is false or if the component unmounts
 * @param visible
 */
const useAirTrafficData = (visible) => {
    const intervalRef = useRef();
    const [data, setData] = useState([]);
    const getData = useCallback(() => {
        fetch(DATA_URL)
            .then((resp) => resp.json())
            .then(data => {
                    const cartesians = data.states.map((d) => Cartesian3.fromDegrees(
                        d[DATA_INDEX.LONGITUDE] ?? 0,
                        d[DATA_INDEX.LATITUDE] ?? 0,
                        d[DATA_INDEX.GEO_ALTITUDE] ?? 0,
                    ))
                    setData(cartesians);
                }
            )
    }, [data]);

    useEffect(() => {
        if (visible) {
            intervalRef.current = setInterval(getData, REFRESH_TIME);
        }

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [visible, getData]);

    useEffect(() => {
        if (!visible) {
            clearInterval(intervalRef.current);
        }
    }, [visible]);

    return {data};
};

const GLOW_MATERIAL = Material.fromType(Material.PolylineGlowType, {
    glowPower: 0.1,
    color: new Color(1.0, 0.5, 0.0, 1.0)
});

const TERRAIN_PROVIDER = new CesiumTerrainProvider({
    url: IonResource.fromAssetId(1),
})

const userAgent = navigator.userAgent.toLowerCase()

function App() {
    const ref = useRef(null);
    const {data} = useAirTrafficData(true)
    React.useEffect(() => {
        console.log(ref.current)
        ref.current.cesiumElement.animation.container.style.visibility = 'hidden';
        ref.current.cesiumElement.timeline.container.style.visibility = 'hidden';
        ref.current.cesiumElement.scene.globe.enableLighting = !userAgent.includes('android');
        ref.current.cesiumElement.forceResize();
    }, [])


    return (
        <Viewer ref={ref} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} baseLayerPicker={false}
                requestRenderMode={true}
                terrainProvider={TERRAIN_PROVIDER}
        >
            {data.map(position => (
                <Entity position={position} key={position.latitude + position.longitude}>
                    <ModelGraphics uri={"/banana.gltf"} minimumPixelSize={200} maximumPixelSize={500}/>
                </Entity>
            ))}
        </Viewer>
    );
}

export default App;
