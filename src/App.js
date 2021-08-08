import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { CameraFlyTo, Entity, ModelGraphics, Scene, Viewer } from "resium";
import "./App.css";
import { Cartesian3, Color, HeightReference, Ion, Rectangle } from "cesium";
import icon from "./assets/placeholder.png";
import { doesLocationIntersectMyLocationCircle } from "./utils/doesLocationIntersectMyLocationCircle";
import { userAgent } from "./utils/userAgent";
import { TERRAIN_PROVIDER } from "./utils/terrainProvider";
import { getCurrentPosition } from "./utils/getCurrentPosition";
import { useCovidData } from "./hooks/UseCovidData";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMjk3OGRkNS0zZTZjLTQyZGYtYjAzNy1lYTk5NmY3NDkyZTMiLCJpZCI6MzMxMzksInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNjc1ODh9.KjJzjblyvrJlF0WkZZznyR6FXfNZY432yc19DtT1Ozc";

const SYDNEY_BOUNDING_BOX = Rectangle.fromDegrees(
  150.253135,
  -34.227857,
  152.010948,
  -33.502628
);

function App() {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [showMyLocation, setShowMyLocation] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
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
      setMyLocation(
        Cartesian3.fromDegrees(data.coords.longitude, data.coords.latitude, 50)
      );
    });
  }, [showMyLocation]);

  if (!data) {
    return <h1>Loading...</h1>;
  }

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
        <CameraFlyTo destination={SYDNEY_BOUNDING_BOX} duration={2} once />
        {data.cartesians.map((item, i) => {
          const intersectsMyLocationCircle =
            showMyLocation === false
              ? false
              : doesLocationIntersectMyLocationCircle(item, myLocation, radius);
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
                lightColor={
                  intersectsMyLocationCircle
                    ? new Cartesian3(255, 0, 0)
                    : undefined
                }
              />
            </Entity>
          );
        })}
        <Entity
          show={showMyLocation}
          key={radius}
          position={myLocation}
          ellipse={{
            semiMinorAxis: radius * 1000,
            semiMajorAxis: radius * 1000,
            material: Color.AQUA.withAlpha(0.5),
            heightReference: HeightReference.RELATIVE_TO_GROUND,
          }}
        />
        <Entity
          show={showMyLocation}
          position={myLocation}
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
