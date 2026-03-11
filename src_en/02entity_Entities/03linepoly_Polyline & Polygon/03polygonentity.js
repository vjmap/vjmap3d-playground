
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/03polygonentity
        // --Polygon entity--Create, modify, delete polygon entity
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let data = [];
data.push({
    coordinates: [[7, 0, 3],[-4, 0, -2],[-5, 0, 3]],
    color: "#f00"
})
data.push({
    // With multiple rings, inner rings create holes
    coordinates: [[[7, 0, -8],[-1, 2, -1],[-8, 1, -9],[17, 0, -18]],  [ [-2, 0, -9],[2, 0, -10],[2, 0, -7],[-1, 0, -6]]],
    // When color is array, use vertex gradient
    color: ["#0f0","#ff0","#0ff","#f00","#00f","#f0f","#777","#7ff"]
})
//
let polygons = new vjmap3d.PolygonsEntity({ //PolygonsEntity
    data: data,
    highlightStyle: {
        color: "#777" // Highlight color
    }
})
polygons.addTo(app)
//
polygons.pointerEvents = true; // Enable event interaction
polygons.on("mouseover", e => {
    if (e?.intersection?.faceIndex !== undefined) {
        let itemData = polygons.getItemDataByFaceIndex(e?.intersection?.faceIndex);
        if (itemData && itemData.id) polygons.setItemHighlight(itemData.id, true)
    }
})
polygons.on("mouseout", e => {
    polygons.clearHighlight()
})
//
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'checkbox',
        label: 'Show vertices',
        getValue: () => polygons.isShowVertex(),
        setValue: v => {
            polygons.setShowVertex(v)
        }
    },
    {
        type: 'button',
        label: 'Add a polygon',
        value: ()=> {
            data.push({
                coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                color: vjmap3d.randColor()
            })
            polygons.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Change first polygon color',
        value: ()=> {
            if (data.length > 0) {
                data[0].color = vjmap3d.randColor()
            }
            polygons.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Delete first polygon',
        value: ()=> {
            if (data.length == 0) {
                return
            }
            data.splice(0, 1)
            polygons.setData(data)
        }
    }
]
cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};