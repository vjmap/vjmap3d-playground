
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/05coordTransform3dlayer2
        // -- VJMap 3D layer coordinate transform 2 --
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
// 
let data = [];
let markers = [];
let color1 = new THREE.Color("#0ff");
let color2 = new THREE.Color("#f00");
let cnt = 6
for(let x = 0; x <= cnt; x++) {
    for(let y = 1; y <= cnt; y++) {
        for(let z = 0; z <= cnt; z++) {
            let px = mapBounds.min.x + x * mapBounds.width() / cnt;
            let py = mapBounds.min.y + y * mapBounds.height() / cnt;
            let pz = z * mapBounds.height() / cnt;
            let worldPos = vjmap3d.toWorld([px, py, pz]);
            let clr = new THREE.Color().copy(color1).lerp(color2, z / cnt);
            let div = vjmap3d.DOM.createStyledDiv(`<div class="markertext${z}"></div>`, `.markertext${z}{font-weight:600;color:#${clr.getHexString()};text-align:center;display:block;padding-top:10px;font-size:1.3em;}`);
            let marker2d = new vjmap3d.Marker2D({
                element: div,
                anchor: 'bottom',
                fadeDistance: 300,
                allowOverlap: false
            });
            marker2d.setPosition(worldPos);
            marker2d.addTo(app)
            markers.push(marker2d);
            //
            data.push({
                position: worldPos.toArray(),
                color: clr,
                borderColor: clr,
                size: 10
            })
        } 
    } 
}
let symbol = new vjmap3d.SymbolEntity({ //SymbolEntity
    data: data,
    pixelRaycasting: true, // Pixel pick
    style: {
        shape: "circle",
        transparent: true,
        //fadeDistance: 500,
        borderWidth: 2,
        sizeAttenuation: false
    }
})
symbol.addTo(app);
const update = () => {
    for(let m of markers) {
        let position = m.position;
        let cad = vjmap3d.fromWorld(position.toArray())
        let lnglat = map.toLngLat(cad)
        let altitude = vjmap3d.fromDist(position.z, true)
        let scene = vjmap3d.map2dUtils.world2Scene(position)
        let posArr = [];
        posArr.push(`CAD: ${cad[0].toFixed(2)}, ${cad[1].toFixed(2)}, ${cad[2].toFixed(2)}`)
        posArr.push(`LngLat: ${lnglat[0].toFixed(2)}, ${lnglat[1].toFixed(2)}, ${altitude.toFixed(2)}`);
        posArr.push(`World: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`)
        posArr.push(`Scene: ${scene.x.toFixed(2)}, ${scene.y.toFixed(2)}, ${scene.z.toFixed(2)}`)
        m.element.children[0].innerHTML = posArr.join("<br/>")
    }
}
update()
setInterval(() => {
    update()
}, 3000)
    
    }
    catch (e) {
        console.error(e);
    }
};