import { Cartographic } from "cesium";
import circle from "@turf/circle";
import { point } from "@turf/helpers";
import booleanContains from "@turf/boolean-contains";

export function doesLocationIntersectMyLocationCircle(
  covidLocation,
  myLocation,
  radius
) {
  if (!myLocation) return false;
  const circleCartographic = Cartographic.fromCartesian(myLocation);
  const pointCartographic = Cartographic.fromCartesian(covidLocation.position);
  const c = circle(
    [circleCartographic.longitude, circleCartographic.latitude],
    radius / 50,
    {
      steps: 64,
    }
  );
  const p = point([pointCartographic.longitude, pointCartographic.latitude]);
  return booleanContains(c, p);
}
