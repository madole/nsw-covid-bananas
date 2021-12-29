import { CesiumTerrainProvider, Ion, IonResource } from "cesium";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1OWQ0MTUxZS02ZmZmLTQzZjktOWU0Mi0zOGQ1NTcxY2E2NDkiLCJpZCI6MzMxMzksImlhdCI6MTY0MDc0Njg4NX0.LS2S6iv8dj0_0cwq2KU5mPgSojy0E11omDHM5bDjzbU";

export const TERRAIN_PROVIDER = new CesiumTerrainProvider({
  url: IonResource.fromAssetId(1),
});
