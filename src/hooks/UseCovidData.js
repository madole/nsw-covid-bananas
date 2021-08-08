import { useEffect, useState } from "react";
import { Cartesian3 } from "cesium";

const DATA_URL =
  "https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/venue-data.json";
/**
 * Data fetching hook
 */
export const useCovidData = () => {
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
