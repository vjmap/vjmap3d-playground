
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/06spriteMarkerEntitybatch2d
        // -- Batch create sprite marker entities (2D map mode) --
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Open map
let res = await svc.openMap({
    mapid: env.exampleMapId, // Map ID
    // @ts-ignore
    mapopenway: vjmap.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap.openMapLightStyle() // Use dark background style when div has dark background
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
let bounds = map.getGeoBounds(0.4);
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
let imgEle = new vjmap3d.render2d.Image({
    style: {
        x: 0,
        y: 0,
        image: image,
        width: 80, // Pixel width
        height: 80 // Pixel height
    }
})
for(let i = 0; i < 20; i++) {
    for(let j = 0; j < 20; j++) {
        let positon = vjmap3d.toWorld([bounds.min.x + i * bounds.width() / 20, bounds.min.y + j * bounds.height() / 20]);
        let idx = `${j * 20 + i}`
        let spriteMarker = new vjmap3d.SpriteMarkerEntity(
        {
            position: positon, // Position
            sizeAttenuation: false, // Fixed pixel size
            allowOverlap: false,
            anchorX: "center",  // X alignment
            anchorY: "bottom", // Y alignment
            renderTexture: {
                autoCanvasSize: true,
                sharedCanvas: true, // Share one canvas for efficiency
                canvasWidth: 80, // Pixel width
                canvasHeight: 80, // Pixel height
                elements: [
                    imgEle,
                    new vjmap3d.render2d.Text({
                        style: {
                            x: 40,
                            y: 20,
                            text: idx,
                            fill: vjmap3d.render2d.color.random(),
                            font: '30px Arial',
                            verticalAlign: "top",
                            align: "center"
                        }
                    })
                ]
            }
        });
        spriteMarker.idx = idx;
        // Add spriteMarker to app
        spriteMarker.addTo(app);
        spriteMarker.add(vjmap3d.EventModule, {
            hoverHighlight: false,
            hoverSelect: false,
            hoverHtmlText: `ID: ${idx}`,
            popupOptions: {
                anchor: "bottom",
                offset: [0, -80]
            },
            popupAsEntityChild: false, // If popup is added to entity, entity group is at map center so do not add popup as child; or add to SpriteMarker in entity
            //popupCallback: (entity, popup, isHover) => entity.node.children[0],
            hoverCallback: (ent, isHover) => {
                let opacity = isHover ? 0.6 : 1.0;
                if (spriteMarker.SpriteMarker.material.opacity != opacity) {
                    spriteMarker.SpriteMarker.material.opacity = opacity
                }
            },
            clickCallback: (ent, isClick) => {
                if (!isClick) return
                app.logInfo("Clicked ID: " + idx, 2000)
            }
        });

}



}



    }
    catch (e) {
        console.error(e);
    }
};