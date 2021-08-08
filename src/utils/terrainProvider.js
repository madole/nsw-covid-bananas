import { CesiumTerrainProvider, IonResource } from "cesium";

export const TERRAIN_PROVIDER = new CesiumTerrainProvider({
  url: IonResource.fromAssetId(1),
});
