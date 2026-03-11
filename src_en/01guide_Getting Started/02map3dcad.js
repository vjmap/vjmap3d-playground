
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/guide/02map3dcad
        // --Create 3D app with CAD as base map--A vjmap3D app that loads a CAD map
// Create a service instance and connect to the service
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    camera: {  // Camera settings
        viewHelper: { enable: true } // Whether to show view helper
    }
})
let res = await app.svc.openMap({
        mapid: env.exampleMapId, // Map ID (ensure it exists; you can upload a new drawing to create one)
        mapopenway: vjmap3d.MapOpenWay.GeomRender, // Open with geometry render mode
        style: vjmap3d.openMapDarkStyle()
});
if (res.error) {
    showError(res.error);
    return;
}
// Get current map visible bounds
let clipPolygon = vjmap3d.GeoBounds.fromString(res.drawBounds).toPointArray();
let provider = new vjmap3d.MapProvider(
    [
        {
            url: app.svc.rasterTileUrl()
        }
    ],
    {
        transparent: true
    }
);
let mapBounds = vjmap3d.GeoBounds.fromString(res.bounds)
let scale = 100;
let mapviewEnt = new vjmap3d.MapViewEntity({
    provider,
    baseScale: scale,
    mapBounds: mapBounds.toArray(),
    clipPolygon // When transparent, clip region cannot be used
});
mapviewEnt.addTo(app);
//
// Create a Mesh above the CAD map center
let cadLen = mapBounds.width() / 50; // 1/50 of CAD map width
let len = vjmap3d.toDist(cadLen); // CAD length to world length
let box = new THREE.BoxGeometry(len, len, len)
const material = new THREE.MeshStandardMaterial({
    color: "#f00",
    side: THREE.DoubleSide
});
let mesh = new THREE.Mesh(box, material);
let cadPos = [mapBounds.center().x, mapBounds.center().y, cadLen]; // Mesh position in CAD coords
//
let worldPos = vjmap3d.toWorld(cadPos);// CAD coords to world coords
mesh.position.copy(worldPos);
//app.scene.add(mesh) // Or add mesh directly to scene without entity
// Create an entity linked to the mesh
let entity = vjmap3d.Entity.fromObject3d(mesh);
entity.addTo(app);
// Add event module for hover highlight
entity.add(vjmap3d.EventModule, {
    hoverSelect: true,
    hoverHtmlText: 'Box created with vjmap3d',
    popupOptions: {
        anchor: "bottom"
    }
});

    }
    catch (e) {
        console.error(e);
    }
};