
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/02builtinmattextflow2d
        // -- Text scroll material (2D map mode) --
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Open map
let res = await svc.openMap({
    mapid: env.exampleMapId, // Map ID
    // @ts-ignore
    mapopenway: vjmap.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap.openMapLightStyle() // When div has dark background, pass dark background style here too
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
let mapW = vjmap3d.toDist(mapBounds.width())
// Vertical text scroll
let geoW = mapW / 10, geoH = mapW / 20;
let geom = new THREE.PlaneGeometry(geoW, geoH);
let mat = vjmap3d.createTextFlowMaterial(app, {
    geometryWidth: geoW,
    geometryHeight: geoH,
    flowDirection: "vertical",
    flowSpeed: 0.03,
    text: `Spring is one of the most beautiful and lively seasons of the year. In this season, nature brings us many surprises and joys. I like to walk in the park and enjoy the scenery there.
Entering the park, you will see a path winding into the distance. The path is lined with all kinds of trees. They have put out fresh green leaves that gleam in the sunlight.
Walking along the path, you will see a sea of blooming flowers: red roses, purple lavender, yellow sunflowers and more. The park also has a small lake, a pavilion, and play equipment for children.
Spring is a season of life and hope. Let us enjoy the beauty of spring together!`,
    fill: "#FF1285",
    font: "30px sans-serif",
    padding: [5, 5, 5, 5],
    backgroundColor: "#FFFE91",
    lineHeight: 50,
    width: 300,
    overflow: "break"
});
let mesh = new THREE.Mesh(geom, mat);
mesh.position.copy(vjmap3d.toWorld(mapBounds.center().toArray()));
mesh.rotateX( Math.PI / 2)
mesh.rotateY( Math.PI)
app.scene.add(mesh);
// Horizontal scroll text
let geoW2 = mapW / 10, geoH2 = mapW / 50;
let geom2 = new THREE.PlaneGeometry(geoW2, geoH2);
let mat2 = vjmap3d.createTextFlowMaterial(app, {
    geometryWidth: geoW2,
    geometryHeight: geoH2,
    flowDirection: "horizon",
    flowSpeed: 0.03,
    text: `Spring is one of the most beautiful and lively seasons. In this season, nature brings us many surprises and joys. I like to walk in the park and enjoy the scenery there.`,
    fill: "#16417C",
    font: "30px sans-serif",
    padding: [5, 5, 5, 5],
    backgroundColor: "#00ff00",
    lineHeight: 50
});
let mesh2 = new THREE.Mesh(geom2, mat2);
mesh2.position.copy(vjmap3d.toWorld(mapBounds.randomPoint().toArray()));
mesh2.rotateX( Math.PI / 2)
mesh2.rotateY( Math.PI)
app.scene.add(mesh2);
    }
    catch (e) {
        console.error(e);
    }
};