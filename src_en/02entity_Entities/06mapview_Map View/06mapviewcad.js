
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mapview/06mapviewcad
        // -- Load CAD map -- Load CAD map and pick/query CAD data
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left button for rotate (right for pan), same as 2D map usage
})
let res = await app.svc.openMap({
    mapid: env.exampleMapId, // Map ID (ensure it exists or upload new drawing)
    mapopenway: vjmap3d.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap3d.openMapDarkStyle()
});
if (res.error) {
    showError(res.error);
    return;
}
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
    mapBounds: mapBounds.toArray()
});
mapviewEnt.addTo(app);
const pickMapObject = async () => {
    let result = await app.pickPoint({
        unprojectOpts: [mapviewEnt.node]
    });
    if (!result.point) return;
    console.log(result);
    let mapPoint = mapviewEnt.worldToMap(result.point);
    // @ts-ignore
    let px = result.event.originalEvent.offsetX,
    // @ts-ignore
    py = result.event.originalEvent.offsetY;
    // Get map length per pixel
    let worldPointNextPoint = app.unproject(px, py + 1, [mapviewEnt.node]);
    if (!worldPointNextPoint) return;
    let mapNextPoint = mapviewEnt.worldToMap(worldPointNextPoint);
    let onePixelDist = Math.max(
        Math.abs(mapPoint[0] - mapNextPoint[0]),
        Math.abs(mapPoint[1] - mapNextPoint[1])
    );
    // @ts-ignore
    let queryResult = await svc.pointQueryFeature({
        x: mapPoint[0],
        y: mapPoint[1],
        pixelsize: 5,
        pixelToGeoLength: onePixelDist
    });
    if (queryResult.result?.length > 0) {
        app.logInfo(`Picked objectid: ${queryResult.result[0].objectid}`, "success")
    } else {
        app.logInfo(`Nothing picked`, "warn")
    }
}
let control = new vjmap3d.ButtonGroupControl({
    buttons: [
        {
            id: "grid",
            html: "Pick object on map",
            title: "Pick object on map",
            style: {
                width: "130px"
            },
            onclick: async () => {
                await pickMapObject()
            }
        }
    ]
});
app.addControl(control, "top-right");

    }
    catch (e) {
        console.error(e);
    }
};