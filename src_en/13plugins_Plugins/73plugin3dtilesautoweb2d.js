
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/73plugin3dtilesautoweb2d
        // -- Auto overlay web map (3D as VJMap layer) --
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Create lnglat projection from bounds
let prj = new vjmap.LnglatProjection();
// Map instance
let map = new vjmap.Map({
    container: 'map', // DIV container id
    style: {
        version: svc.styleVersion(),
        glyphs: svc.glyphsUrl(),
        sources: {
            sat: {
                type: 'raster',
                tiles: ["https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=YOUR_MAPBOX_ACCESS_TOKEN"],
            }
        },
        layers: [{
            id: 'sat',
            type: 'raster',
            source: 'sat'
        }]
    },
    center: prj.toLngLat([116.3912, 39.9073]),
    zoom: 10,
    pitch: 0,
    antialias: true, // Antialias
    renderWorldCopies: false // Do not show world copies
});
// Attach service and projection
map.attach(svc, prj);
// Fit map to full extent
//map.fitMapBounds();
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
let tiles3d = await vjmap3d.loadPlugin3dtiles();
//
let url = 'https://vjmap.com/map3d/resources/3dtiles/baowei/tileset.json';
let meta = await vjmap3d.httpHelper.get(url);
let data = meta.data;
let box = data.root.boundingVolume.box;
let lngLat = tiles3d.get3dTilesLngLatHeight(box, data.root.transform);
lngLat[2] = 0;// Ignore height
app.map.setCenter(lngLat);
app.map.setZoom(17);
let marker = new vjmap.Marker();
marker.setLngLat(lngLat);
marker.addTo(app.map)
const tiles = new tiles3d.TilesRenderer(url, {
    clearRootTransform: true
}); 
tiles.manager.addHandler(/\.gltf$/, vjmap3d.LoadManager.gltfLoader);
tiles.manager.addHandler(/\.drc$/, vjmap3d.LoadManager.dracoLoader);
tiles.errorTarget = 2;
tiles.onLoadModel = (scene) => {
    //console.log(" --- scene --- ")
}
let offsetParent = new THREE.Group();
offsetParent.add(tiles.group)
//
let ent = vjmap3d.Entity.fromObject3d(offsetParent);
ent.position.copy(vjmap3d.map2dUtils.projectToWorld(lngLat));
let scale = 1.0 / vjmap3d.map2dUtils.WorldResolution
ent.scale.set(scale, scale, scale);
ent.addTo(app);
app.signal.onAppAfterUpdate.add(() => {
    tiles.setCamera(app.camera);
    tiles.setResolutionFromRenderer(app.camera, app.renderer);
    tiles.update();
});


    }
    catch (e) {
        console.error(e);
    }
};