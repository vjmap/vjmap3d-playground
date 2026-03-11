
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/fillExtrusion/02fillExtrusionsEntity2d
        // -- Fill extrusion entity (2D map mode) -- Create, modify, delete extrusions, based on 2D map (3D as overlay layer)
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
let data = [];
// Outer boundary CAD point coordinates
let edge = [
	[587653761.9404196, 3103856376.721289],
	[587602251.0620328, 3103887684.472128],
	[587616705.4171646, 3103910542.4372025],
	[587668345.3998574, 3103879913.002372]
].map(p => vjmap3d.toWorld(p).toArray());
// Inner hole 1 CAD point coordinates
let holes1 = [
	[587611243.649386, 3103892845.733727],
	[587618986.3449678, 3103888191.3405075],
	[587624099.183289, 3103897555.098504],
	[587616962.944966, 3103901844.930998]
].map(p => vjmap3d.toWorld(p).toArray());
// Inner hole 2 CAD point coordinates
let holes2 = [
	[587648133.0725995, 3103883387.5836215],
	[587642667.2109047, 3103873956.0132804],
	[587650162.938667, 3103869450.080676],
	[587655761.2825799, 3103878763.0610456]
].map(p => vjmap3d.toWorld(p).toArray());
//
let bounds = map.getMapExtent();
let depth = vjmap3d.toDist(bounds.width() / 40);// Use 1/40 of map width as extrusion height
data.push({
    coordinates: [edge, holes1, holes2],
    color: "#FFFE91", // Bottom color
    color2: "#0ff", // Top color
    showBorder: true, // Show border line
    borderColor: "#39107B",// Border bottom color
    borderColor2: "#EA3FF7",// Border top color
    baseHeight: depth / 5, // Base height
    extrude: {
        depth: depth,
        steps: 1,
        bevelEnabled: false
    }
})
//
let fillExtrusions = new vjmap3d.FillExtrusionsEntity({ //FillExtrusionsEntity
    data: data,
    // showBorder: true, globally control whether to show border line
    highlightStyle: {
        color: "#777" // Highlight color
    }
})
fillExtrusions.addTo(app)
//
fillExtrusions.pointerEvents = true; // Enable event interaction
fillExtrusions.on("mouseover", e => {
    if (e?.intersection?.faceIndex !== undefined) {
        let itemData = fillExtrusions.getItemDataByFaceIndex(e?.intersection?.faceIndex);
        if (itemData && itemData.id) fillExtrusions.setItemHighlight(itemData.id, true)
    }
})
fillExtrusions.on("mouseout", e => {
    fillExtrusions.clearHighlight()
})
//
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'checkbox',
        label: 'Show vertices',
        getValue: () => fillExtrusions.isShowVertex(),
        setValue: v => {
            fillExtrusions.setShowVertex(v)
        }
    },
    {
        type: 'checkbox',
        label: 'Show border line',
        value: false,
        onChange: ({ value } )=> {
            let mod = fillExtrusions.getModule(vjmap3d.FillExtrusionsModule);
            mod.showBorder = value;
            mod.setData(mod.getData());
        }
    },
    {
        type: 'button',
        label: 'Add extrusion',
        value: ()=> {
            data.push({
                coordinates: [mapBounds.randomPoint().toArray(),mapBounds.randomPoint().toArray(),mapBounds.randomPoint().toArray()].map(p => vjmap3d.toWorld(p).toArray()),
                color: vjmap3d.randColor(),
                extrude: {
                    depth: vjmap3d.toDist(bounds.width() * (Math.random() + 0.1) / 60),
                    steps: 1,
                    bevelEnabled: false
                }
            })
            fillExtrusions.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Change first extrusion color',
        value: ()=> {
            if (data.length > 0) {
                data[0].color = vjmap3d.randColor()
            }
            fillExtrusions.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Delete first extrusion',
        value: ()=> {
            if (data.length == 0) {
                return
            }
            data.splice(0, 1)
            fillExtrusions.setData(data)
        }
    }
]
cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};