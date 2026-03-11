
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/72plugin3dtilesautoweb3d
        // -- Auto overlay web map (3D mode) --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: false } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left rotate, right pan
})
let provider = new vjmap3d.MapProvider(
    [
        {
            url: "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=YOUR_MAPBOX_ACCESS_TOKEN"
        }
    ],
    {
        rootTile: [10, 834, 444],
    }
);
let mapview = new vjmap3d.MapView({
    provider,
    baseScale: 5000
});
app.scene.add(mapview);
//
let tiles3d = await vjmap3d.loadPlugin3dtiles();
//
let url = 'https://vjmap.com/map3d/resources/3dtiles/baowei/tileset.json';
let meta = await vjmap3d.httpHelper.get(url);
let data = meta.data;
let box = data.root.boundingVolume.box;
let lngLat = tiles3d.get3dTilesLngLatHeight(box, data.root.transform);
lngLat[2] = 0;// Ignore height
//
let worldPoint = mapview.lngLatToWorld(lngLat);
let marker2d = new vjmap3d.Marker2D({
    color: vjmap3d.render2d.color.random()
});
marker2d.setPosition(worldPoint);
marker2d.addTo(app);
//
const tiles = new tiles3d.TilesRenderer(url, {
    clearRootTransform: true
}); 
tiles.manager.addHandler(/\.gltf$/, vjmap3d.LoadManager.gltfLoader);
tiles.manager.addHandler(/\.drc$/, vjmap3d.LoadManager.dracoLoader);
tiles.errorTarget = 2;
tiles.onLoadModel = (scene) => {
    console.log(" --- scene --- ")
}
let offsetParent = new THREE.Group();
offsetParent.add(tiles.group)
//
let ent = vjmap3d.Entity.fromObject3d(offsetParent);
ent.position.copy(worldPoint);
let scale = 1 / mapview.worldResolution()
ent.scale.set(scale, scale, scale);
ent.rotation.set(-Math.PI / 2, 0, 0);
ent.position.y += 0.5;
ent.addTo(app);
//
app.signal.onAppAfterUpdate.add(() => {
    tiles.setCamera(app.camera);
    tiles.setResolutionFromRenderer(app.camera, app.renderer);
    tiles.update();
});
app.cameraControl.moveTo( worldPoint.x, worldPoint.y,  worldPoint.z, false)
app.cameraControl.zoom(9, false)


    }
    catch (e) {
        console.error(e);
    }
};