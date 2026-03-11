
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/guide/03map3daslayer
        // --VJMap 3D as a layer--VJMap 2D as base map, vjmap3d as a 3D layer on top
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Open map
let res = await svc.openMap({
    mapid: env.exampleMapId, // Map ID
    // @ts-ignore
    mapopenway: vjmap.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap.openMapLightStyle() // Use dark style here if div has dark background
})
if (res.error) {
    // If open fails
    showError(res.error)
    return;
}
// Get map bounds
let mapBounds = vjmap.GeoBounds.fromString(res.bounds);
// Create geo projection from bounds
let prj = new vjmap.GeoProjection(mapBounds);
//
// Map instance
let map = new vjmap.Map({
    container: 'map', // DIV container id
    style: svc.rasterStyle(), // Style, raster style here
    center: prj.toLngLat(mapBounds.center()), // Set map center
    zoom: 2, // Set map zoom level
    pitch: 45,
    antialias: true, // Antialias
    renderWorldCopies: false // Do not show world copies
});
//
// Attach service and projection to map
map.attach(svc, prj);
await map.onLoad();
//
// Create 3D layer
let mapLayer = new vjmap3d.MapThreeLayer(map, {
    stat: {
        show: true,
        left: "0"
    }
});
map.addLayer(new vjmap.ThreeLayer({ context: mapLayer }))
let app = mapLayer.app;
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


// Load a model below
// CAD position where the model will be placed
let pos = [mapBounds.center().x + mapBounds.width() / 20, mapBounds.center().y, cadLen * 2];
// Model size: 1/10 of map width
let size = vjmap3d.toDist(mapBounds.width() / 10)
let ent = await vjmap3d.ResManager.loadModel(vjmap3d.ResManager.svrUrl("models/Stork.glb"), {
    //splitSubEntity: true,
    //anchor: "front-bottom-right",
    size: size,
    position: vjmap3d.toWorld(pos)
});
ent.addTo(app);

// If the model has animation, use the following to play it
let mod = ent.getModule(vjmap3d.AnimatorModule);
if (!mod) return;
let animator = mod.getAnimator();
animator.play(0) // Play animation

    }
    catch (e) {
        console.error(e);
    }
};