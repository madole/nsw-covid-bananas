import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {Entity, ModelGraphics, Viewer} from 'resium'
import './App.css';
import {Cartesian3, CesiumTerrainProvider, Ion, IonResource} from 'cesium'

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMjk3OGRkNS0zZTZjLTQyZGYtYjAzNy1lYTk5NmY3NDkyZTMiLCJpZCI6MzMxMzksInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNjc1ODh9.KjJzjblyvrJlF0WkZZznyR6FXfNZY432yc19DtT1Ozc'


const DATA_URL = "https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/venue-data.json";

/**
 * Data fetching hook
 */
const useCovidData = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch(DATA_URL)
            .then((resp) => resp.json())
            .then(({date, data}) => {
                    const cartesians = data?.monitor.map((item) => {
                        const {Lat, Lon} = item
                        const lon = Number(Lon.split(',')[0])
                        const lat = Number(Lat.split(',')[0])
                        const position = Cartesian3.fromDegrees(
                            lon,
                            lat
                        )
                        return {...item, position}
                    })
                    setData({date, cartesians});
                }
            )
    }, []);

    return data;
};


const TERRAIN_PROVIDER = new CesiumTerrainProvider({
    url: IonResource.fromAssetId(1),
})

const userAgent = navigator.userAgent.toLowerCase()

function App() {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(null);
    const data = useCovidData()
    useEffect(() => {
        if (!data) return
        ref.current.cesiumElement.animation.container.style.visibility = 'hidden';
        ref.current.cesiumElement.timeline.container.style.visibility = 'hidden';
        ref.current.cesiumElement.scene.globe.enableLighting = !userAgent.includes('android');
        ref.current.cesiumElement.forceResize();
    }, [data])

    if (!data) {
        return <h1>Loading...</h1>
    }
    console.log(hovered)

    return (
        <>
            <h1 className="title">
                <div>COVID Locations</div>
                <div>{new Date(data.date).toDateString()}</div>
            </h1>
            <Viewer ref={ref} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
                    baseLayerPicker={false}
                    requestRenderMode={true}
                    terrainProvider={TERRAIN_PROVIDER}
            >
                {data.cartesians.map(item => (
                    <Entity position={item.position} key={item.position.latitude + item.position.longitude}
                            onMouseEnter={(e) => setHovered(item)} onMouseLeave={() => setHovered(null)}>
                        <ModelGraphics uri={"/banana.gltf"} minimumPixelSize={200} maximumPixelSize={500}/>
                    </Entity>
                ))}
            </Viewer>
            <div className={`info-box ${hovered ? "hovered" : ""}`}>
                <table>
                    {hovered && Object.entries(hovered).map(([k, v]) => {
                        if (k === 'position' || k === 'HealthAdviceHTML') return null
                        return <tr key={`${hovered.Time}${k} - ${v}`}>
                            <td className="table-key">{k}</td>
                            <td>{v}</td>
                        </tr>
                    })}
                </table>
            </div>
        </>
    );
}

export default App;
