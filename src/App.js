import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { CameraFlyTo, Entity, ModelGraphics, Scene, Viewer } from "resium";
import "./App.css";
import {
  Cartesian3,
  CesiumTerrainProvider,
  Color,
  HeightReference,
  Ion,
  IonResource,
  Rectangle,
} from "cesium";
import icon from "./assets/placeholder.png";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMjk3OGRkNS0zZTZjLTQyZGYtYjAzNy1lYTk5NmY3NDkyZTMiLCJpZCI6MzMxMzksInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNjc1ODh9.KjJzjblyvrJlF0WkZZznyR6FXfNZY432yc19DtT1Ozc";

const DATA_URL =
  "https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/venue-data.json";

/**
 * Data fetching hook
 */
const useCovidData = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(DATA_URL)
      .then((resp) => resp.json())
      .then(({ date, data }) => {
        const cartesians = data?.monitor.map((item) => {
          const { Lat, Lon } = item;
          const lon = Number(Lon.split(",")[0]);
          const lat = Number(Lat.split(",")[0]);
          const position = Cartesian3.fromDegrees(lon, lat);
          return { ...item, position };
        });
        setData({ date, cartesians });
      });
  }, []);

  return data;
};

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      geolocationOptions
    );
  });
}

const TERRAIN_PROVIDER = new CesiumTerrainProvider({
  url: IonResource.fromAssetId(1),
});

const userAgent = navigator.userAgent.toLowerCase();

function App() {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [showMyLocation, setShowMyLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(1);

  const data = useCovidData();
  useEffect(() => {
    if (!data) return;
    ref.current.cesiumElement.animation.container.style.visibility = "hidden";
    ref.current.cesiumElement.timeline.container.style.visibility = "hidden";
    ref.current.cesiumElement.scene.globe.enableLighting =
      !userAgent.includes("android");
    ref.current.cesiumElement.forceResize();
  }, [data]);

  useEffect(() => {
    if (!showMyLocation) return;
    getCurrentPosition().then((data) => {
      setLocation(
        Cartesian3.fromDegrees(data.coords.longitude, data.coords.latitude, 50)
      );
    });
  }, [showMyLocation]);

  if (!data) {
    return <h1>Loading...</h1>;
  }

  const flyTo = Rectangle.fromDegrees(
    150.253135,
    -34.227857,
    152.010948,
    -33.502628
  );
  return (
    <>
      <nav>
        <h1 className="title">
          <div>COVID Locations</div>
          <div>{new Date(data.date).toDateString()}</div>
        </h1>
      </nav>
      <Viewer
        ref={ref}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        terrainProvider={TERRAIN_PROVIDER}
        terrainShadows={true}
        shadows={true}
        useBrowserRecommendedResolution={true}
      >
        <Scene />
        <CameraFlyTo destination={flyTo} duration={2} once />
        {data.cartesians.map((item, i) => {
          if (!item.position.x) {
            debugger;
          }
          return (
            <Entity
              position={item.position}
              key={item.position.x + ":" + item.position.y + ":" + i}
              onMouseEnter={(e) => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
            >
              <ModelGraphics
                uri={"/banana.gltf"}
                minimumPixelSize={200}
                maximumPixelSize={500}
              />
            </Entity>
          );
        })}
        <Entity
          show={showMyLocation}
          key={radius}
          position={location}
          ellipse={{
            semiMinorAxis: radius * 1000,
            semiMajorAxis: radius * 1000,
            material: Color.AQUA.withAlpha(0.5),
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          }}
        />
        <Entity
          show={showMyLocation}
          position={location}
          point={{
            color: Color.AQUA,
            outlineColor: Color.BLACK,
            outlineWidth: 5,
            pixelSize: 16,
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          }}
        />
      </Viewer>
      <div className={`info-box ${hovered ? "hovered" : ""}`}>
        <table>
          <tbody>
            {hovered &&
              Object.entries(hovered).map(([k, v]) => {
                if (k === "position" || k === "HealthAdviceHTML") return null;
                return (
                  <tr key={`${hovered.Time}${k} - ${v}`}>
                    <td className="table-key">{k}</td>
                    <td>{v}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showMyLocation ? (
        <div className={"location-controls"}>
          <div className="radius-display">Radius: {radius}KM</div>
          <input
            type="range"
            min="1"
            max="20"
            value={radius}
            step="1"
            onChange={(e) => {
              setRadius(e.target.value);
            }}
          />
          <button
            className="location-button"
            onClick={() => setShowMyLocation(false)}
          >
            Hide my location
          </button>
        </div>
      ) : (
        <button
          className="location-button location-controls"
          onClick={() => setShowMyLocation(true)}
        >
          <img className="icon" src={icon} alt="" />
          Show my location
        </button>
      )}
    </>
  );
}

export default App;
