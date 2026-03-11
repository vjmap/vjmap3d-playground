
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/03builtinobjtubepathroute
        // -- 3D tube path route: define and display routes on 3D tubes
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    control: {
        initState: {
            cameraTarget: new THREE.Vector3(191, 37, 20),
			cameraPosition: new THREE.Vector3(171, 51, 11),
        }
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
const outMaterial = new THREE.MeshPhongMaterial({
    color: '#73FBFD',
    side: THREE.DoubleSide
  })
  const innerMaterial = new THREE.MeshPhongMaterial({
    color: '#73FBFD',
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  })

  
// Get 3D coordinates from map data, or provide coordinates directly
let mapid = "sys_tube"
let style = await app.svc.createStyle({
    backcolor: 0,
}, mapid, "v1")
let tubeDatas = [];
let query = await app.svc.conditionQueryFeature({
    mapid: mapid,
    version: "v1",
    layer: style.stylename,
    geom: true,
    condition: `name='2' or name='4'`,// Query polylines/3D polylines with elevation
    fields: "objectid,points,elevation",
    limit: 100000
});
let results = query.result;
let box3d = new THREE.Box3();
let allPts = []

let lineDatas = []
if (results && results.length > 0) {
    for(let n = 0; n < results.length; n++) {
        let linePoints =  results[n].points.split(";").map(p => vjmap3d.GeoPoint.fromString(p));
        // @ts-ignore
        linePoints = linePoints.map(p => vjmap3d.toVector3([p.x, p.z ?? results[n].elevation ?? 0, p.y]));

        lineDatas.push(linePoints)

         // Collect all points for bounds
        allPts.push(...linePoints)

        tubeDatas.push({
            paths: linePoints,
            name:  results[n].objectid
        })
    }
}


// Get data bounds
box3d.setFromPoints(allPts)

// Compute center
let center = box3d.min.clone().add(box3d.max).multiplyScalar(0.5);

// Translate and scale by bounds so coordinates fit the scene
app.centerOrigin = new THREE.Vector3(center.x, box3d.min.y, center.z);
// Scale so max extent is ~500
let dist = Math.max(box3d.max.x - box3d.min.x, box3d.max.z - box3d.min.z);
app.scaleOrigin = 500 / dist;

// Recompute coordinates with transform
for(let p of tubeDatas ) {
    p.paths = p.paths.map(t => vjmap3d.toWorld(t.toArray()).toArray())
}

/** For shortest path only without loading model, use the code below */
/*
let patop = vjmap3d.buildPathTubeTopo(tubeDatas)
let sp = vjmap3d.findShortestPath([-39, 3, 72], 
    [-8, 2, -23],
    patop.inputData.map((d) => ({
        points: d.paths
    }))
)
*/


let opts = {
    data: tubeDatas,
    nodeRadius: 0.5,
    innerSideMaterial: innerMaterial,
    outerMaterial: outMaterial,
    sect: {
        shape: "rectNoTop"
    },
    topoStrategy: 'nodeIntersect'
}
let pathTube = new vjmap3d.PathTubeEntities(opts);
pathTube.addTo(app);
// Show border lines
pathTube.showEdgeLine({
    bottom: true,
    top: true,
    center: false,
    color: "#73FBFD"
})

// Snap point style
app.setEnvConfig("snapSymbolColor", "#EF88BE") // Snap point fill
app.setEnvConfig("snapBorderColor", "#EA3680") // Snap point border
app.setEnvConfig("snapShape", "circle") // Snap point shape

const fixCoordinate = (coordinates) => {
    for(let c of coordinates) {
        c[1] += 0.5 // Slightly raise so line is not occluded
    }
    return coordinates
}
const drawLine = async () => {
    // Use centerline as snap points
    let lines = pathTube.getEdgeLines({
        center: true,
        bottom: false,
        top: false
    })
    let pts = await app.actionDrawLineSting({
       unprojectOpts: true, // Use scene data for projection
       snapDrawPoint: false, // Snap to drawn points
       snapDrawLayerPoint:false, // Snap to draw layer points
       snapStylePointOpacity: 1, // Snap point visibility (0 = hidden)
       snapStylePixelSize: 5, // Snap pixel size, default 5
       disableUnProjectMenu: true, // Disable screen-to-world context menu
       snapData: lines.flat()
    });

    if (pts.isCancel) return;
    let tailLineEntity = new vjmap3d.TrailLineEntity({
        positions: fixCoordinate(pts.data.coordinates),        // XZ plane
        width:10,                   // Line width
        placeLength:15,             // Icon placement length
        placeSpace:10,              // Icon placement spacing
        iconUrl: env.assetsPath + "textures/arrow.png",        // Icon
        speed:2,        // Speed
        smooth: true,
        isAnimate:true  // Enable animation
    })
    tailLineEntity.addTo(app);
}

// Pick two points to generate route
const twoPointPath = async () => {
     // Use centerline as snap points
     let lines = pathTube.getEdgeLines({
        center: true,
        bottom: false,
        top: false
    })
    const pickPoint = async (tip) => {
        if (tip) app.logInfo(tip)
        let pts = await app.actionDrawPoint({
            unprojectOpts: true, // Use scene data for projection
            snapDrawPoint: false, // Snap to drawn points
            snapDrawLayerPoint:false, // Snap to draw layer points
            snapStylePointOpacity: 1, // Snap point visibility
            snapStylePixelSize: 5, // Snap pixel size
            disableUnProjectMenu: true, // Disable screen-to-world context menu
            snapData: lines.flat()
        });
        if (pts.isCancel) return;
        return pts.data.position
    }
    let p1 = await pickPoint("Pick start point")
    if (!p1) return;
    // Show start point
    let marker2d = new vjmap3d.Marker2D({
      color: "#ffff00",
    });
    marker2d.setPosition(p1);
    marker2d.addTo(app);

    let p2 = await pickPoint("Pick end point")
    if (!p2) return;
    marker2d.remove(); // Remove start marker

    let sp = vjmap3d.findShortestPath(p1, p2,
        pathTube.inputData.map((d) => ({
            points: d.paths
        }))
    )
    let tailLineEntity = new vjmap3d.TrailLineEntity({
        // @ts-ignore
        positions: fixCoordinate(sp.route),        // XZ plane
        width:10,                   // Line width
        placeLength:15,             // Icon placement length
        placeSpace:10,              // Icon placement spacing
        iconUrl: env.assetsPath + "textures/arrow.png",        // Icon
        speed:2,        // Speed
        smooth: true,
        isAnimate:true  // Enable animation
    })
    tailLineEntity.addTo(app);
   
}

const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Draw route manually", () => {
   drawLine()
})
gui.addButton("Pick two points for route", () => {
    twoPointPath()
 })
gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};