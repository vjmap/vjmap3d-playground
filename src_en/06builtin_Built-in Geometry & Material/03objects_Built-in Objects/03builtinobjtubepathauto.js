
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/03builtinobjtubepathauto
        // -- Auto 3D tube: generate from map or custom data
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: {
            visible: true, // Grid size (width x height)
            args: [1000, 1000],
            // Grid cell size
            cellSize: 10,
            // Grid section size
            sectionSize: 100
        } // Whether to show grid helper
    },
    control: {
        initState: {
            cameraTarget: new THREE.Vector3(207, 0, 35),
            cameraPosition: new THREE.Vector3(121, 60, 68)
        }
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let texture = new THREE.TextureLoader().load(env.assetsPath + "textures/diffuse.jpg", () => {
    texture.wrapS = THREE.RepeatWrapping;
});
let outMaterial = new THREE.MeshPhongMaterial({
    color: 0x7dffeb,
    map: texture,
    side: THREE.FrontSide
});
let texture2 = new THREE.TextureLoader().load(env.assetsPath + "textures/uv_grid_opengl.jpg", () => {
    texture2.wrapS = THREE.RepeatWrapping;
});
let innerMaterial = new THREE.MeshPhongMaterial({
    color: 0x7dffeb,
    map: texture2,
    side: THREE.FrontSide
});

// Get 3D coordinates from map or provide directly
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
    condition: `name='2' or name='4'`,// Polylines/3D polylines with elevation
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

// Translate and scale by bounds
app.centerOrigin = new THREE.Vector3(center.x, box3d.min.y, center.z);
// Scale so max extent is ~500
let dist = Math.max(box3d.max.x - box3d.min.x, box3d.max.z - box3d.min.z);
app.scaleOrigin = 500 / dist;

// Recompute coordinates with transform
for(let p of tubeDatas ) {
    p.paths = p.paths.map(t => vjmap3d.toWorld(t.toArray()).toArray())
}

let tubeEntity;
let cancelActionCb;
const createTubeEntity = (data, sect) => {
    if (tubeEntity) {
        // Remove previous entity if any
        tubeEntity.entity.remove();
        tubeEntity = null;
    }
    if (cancelActionCb) {
        // Cancel previous texture animation if any
        cancelActionCb()
        cancelActionCb = null;
    }
    let opts = {
        data: data,
        // data: [
        //     {
        //         paths: [
        //             [3, 0, 2],
        //             [-10, 1.5, -5],
        //             [-12, 1.8, 3],
        //             [-5, 2, 4]
        //         ],
        //         name: "path1"
        //     },
        //     {
        //         paths: [
        //             [3, 0, 2],
        //             [12, 1.5, -3],
        //             [15, 3, 4]
        //         ],
        //         name: "path2"
        //     },
        //     {
        //         paths: [
        //             [2, 2, 10],
        //             [-1, 3, 11],
        //             [3, 0, 2]
        //         ],
        //         name: "path3"
        //     }
        // ,{
        //     paths: [
        //         [3, 5, 2],
        //         [3, 0, 2]
        //     ]
        // }
        // ],
        nodeRadius: 0.5,
        innerSideMaterial: innerMaterial,
        outerMaterial: outMaterial,
        sect: sect ?? {
            shape: "arch",
            rectWidth: 1,
            rectHeight: 0.5
        },
        /** Topology strategy: nodeIntersect (default) or nodeEqual. nodeIntersect splits segments at intersections; nodeEqual only links when endpoints match. */
        topoStrategy: "nodeIntersect"
    }
    let pathTube = new vjmap3d.PathTubeEntities(opts);
    pathTube.addTo(app);
    // 
    for(let n = 0; n < pathTube.entity.childrens.length; n++) {
        let ent = pathTube.entity.childrens[n];
        ent.add(vjmap3d.EventModule, {
            clickHighlight: true,
            highlightOpacity: 0.2,
            hoverSelect: true,
            // @ts-ignore
            hoverHtmlText: ent.node.isNode ? 
           `Node: ${ent.node.userData.dataIndexs} path(s) linked`:
           pathTube.data[ent.node.userData.dataIndex].name,
            popupOptions: {
                anchor: "bottom"
            }
        });
    }

    tubeEntity = pathTube;
}

createTubeEntity(tubeDatas)


let marker2ds = []
const showSectCoordMarker = (pt) => {
    if (!tubeEntity) return;
    if (marker2ds.length > 0 ) {
        marker2ds.forEach(m => m.remove());
        marker2ds = [];
    }
    let pts = tubeEntity.getSectPoints(pt);
    if (!pts) return;
    let points = [pts.posBase, pts.posLeft, pts.posLeftTop, pts.posTop, pts.posRightTop, pts.posRight]
    let clr = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"]
    for(let p  = 0; p < points.length; p++) {
        let marker2d = new vjmap3d.Marker2D({
            color: clr[p],
            allowOverlap: true
        });
        marker2d.setPosition(points[p]);
        marker2d.addTo(app);
        marker2ds.push(marker2d)
    }
}
// Mouse position control
let mousePositionControl = new vjmap3d.MousePositionControl({
    UnProjectModes: app.isMapMode ? [true] : [true],
    labelFormat: (x, y, z, _, retIntersectObject) => {
        let cad = vjmap3d.fromWorld([x, y, z]);
        return `${cad[0].toFixed(4)}, ${cad[2].toFixed(4)}, ${cad[1].toFixed(4)}`;
    }
});
app.addControl(mousePositionControl, "bottom-right");

const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Arch section", () => {
    createTubeEntity(tubeDatas, {
        shape: "arch"
    })
})
gui.addButton("Rect section", () => {
    createTubeEntity(tubeDatas, {
        shape: "rect"
    })
})
gui.addButton("Rect no top", () => {
    createTubeEntity(tubeDatas, {
        shape: "rectNoTop"
    })
})
gui.addButton("Circle section", () => {
    createTubeEntity(tubeDatas, {
        shape: "circle"
    })
})


gui.addButton("Texture flow", () => {
    if (cancelActionCb) return;
    cancelActionCb = tubeEntity?.entity.addAction(() => {
        texture.offset.x += 0.02;
        texture2.offset.x += 0.02
    })
})

gui.addButton("Stop texture flow", () => {
    if (!cancelActionCb) return;
    cancelActionCb()
    cancelActionCb = null;
})


gui.addButton("Get section coords", async () => {
    
    await app.actionDrawPoint({
        unprojectOpts: true, // Use scene data for projection
        updateCoordinate: pt => showSectCoordMarker(pt.toArray())
    })
    if (marker2ds.length > 0 ) {
        marker2ds.forEach(m => m.remove());
        marker2ds = [];
    }
})

let outMaterialShortestPath;
let tubeShortestPath;
let startMarker2d, endMarker2d;
const showShortPath = (startPoint, endPoint) => {
    if (tubeShortestPath) {
        tubeShortestPath.remove()
    }
    if (!outMaterialShortestPath) {
        // Material for shortest path highlight
        outMaterialShortestPath = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            map: texture,
            side: THREE.FrontSide
        });
    }

    let sp = vjmap3d.findShortestPath(startPoint, endPoint,
        tubeEntity.inputData.map(d => ({
            points: d.paths
        }))
    );
  
    let opts = {
        data: [
            {
                paths: sp.route,
                name: "path1"
            }
        ],
        nodeRadius: 0.5,
        innerSideMaterial: innerMaterial,
        outerMaterial: outMaterialShortestPath,
        // Slightly larger section
        sect: {
            shape: "arch",
            rectWidth: 1.2,
            rectHeight: 0.6
        },
        /** Topology strategy: nodeIntersect (default) or nodeEqual. nodeIntersect splits segments at intersections; nodeEqual only links when endpoints match. */
        topoStrategy: "nodeEqual"
    }
    tubeShortestPath = new vjmap3d.PathTubeEntities(opts);
    tubeShortestPath.addTo(app);
}

// Remove shortest path
const removeShortestPath = () => {
    if (startMarker2d) {
        startMarker2d.remove();
        startMarker2d = null;
    }
    if (endMarker2d) {
        endMarker2d.remove();
        endMarker2d = null;
    }
    if (tubeShortestPath) {
        tubeShortestPath.remove();
        tubeShortestPath = null;
    }
   
}

gui.addButton("Find shortest path", async () => {
    removeShortestPath();

    app.logInfo("Pick path start point")
    let startPoint1 = await app.actionDrawPoint({
        unprojectOpts: true, // Use scene data for projection
    })
    if (startPoint1.isCancel) return;


    startMarker2d = new vjmap3d.Marker2D({
        color: 'red',
        allowOverlap: true
    });
    startMarker2d.setPosition(startPoint1.data.position);
    startMarker2d.addTo(app);

    app.logInfo("Pick path end point")
    let endPoint1 = await app.actionDrawPoint({
        unprojectOpts: true, // Use scene data for projection
    })
    if (endPoint1.isCancel) return;

    endMarker2d = new vjmap3d.Marker2D({
        color: 'yellow',
        allowOverlap: true
    });
    endMarker2d.setPosition(endPoint1.data.position);
    endMarker2d.addTo(app);

    showShortPath(startPoint1.data.position, endPoint1.data.position)
})

gui.addButton("Remove shortest path", async () => {
    removeShortestPath();
});

gui.toJson().forEach(c => ui.appendChild(c));


    }
    catch (e) {
        console.error(e);
    }
};