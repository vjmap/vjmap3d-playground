
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/04coordTransform3dlayer
        // -- VJMap 3D layer coordinate transform --
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Open map
let res = await svc.openMap({
    mapid: env.exampleMapId, // Map ID
    // @ts-ignore
    mapopenway: vjmap.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap.openMapLightStyle() // Use dark style when div has dark background
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
    style: svc.rasterStyle(), // Raster style
    center: prj.toLngLat(mapBounds.center()), // Set map center
    zoom: 2, // Set map zoom level
    pitch: 45,
    antialias: true, // Antialias
    renderWorldCopies: false // Do not show world copies
});
//
// Attach service and projection
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
// Create mesh above CAD map center
let cadLen = mapBounds.width() / 50; // 1/50 of CAD width
let len = vjmap3d.toDist(cadLen); // CAD length to world length
let box = new THREE.BoxGeometry(len, len, len)
const material = new THREE.MeshStandardMaterial({
    color: "#f00",
    side: THREE.DoubleSide
});
let mesh = new THREE.Mesh(box, material);
let cadPos = [mapBounds.center().x, mapBounds.center().y, cadLen]; // Mesh position in CAD
//
let worldPos = vjmap3d.toWorld(cadPos);// CAD to world coords
mesh.position.copy(worldPos);
app.scene.add(mesh);
// Add coordinate info
const showCoordInfo = (event) => {
    let lngLat = event.lngLat;
    let cadPos = map.fromLngLat(lngLat);
    let worldPos = vjmap3d.toWorld([cadPos.x, cadPos.y]); 
    let pixel = map.project(lngLat)
    let info = `CAD: ${cadPos.x.toFixed(2)},${cadPos.y.toFixed(2)}<br/>`
    info += `LngLat: ${lngLat.lng.toFixed(6)},${lngLat.lat.toFixed(6)}<br/>`
    info += `World: ${worldPos.x.toFixed(2)},${worldPos.y.toFixed(2)},${worldPos.z.toFixed(2)}<br/>`
    info += `Screen: ${pixel.x.toFixed(0)},${pixel.y.toFixed(0)}<br/>`
    app.popup2d.setPosition(worldPos);
    app.popup2d.setHTML(info);
}
map.on("mousemove", e => showCoordInfo(e))

    }
    catch (e) {
        console.error(e);
    }
};