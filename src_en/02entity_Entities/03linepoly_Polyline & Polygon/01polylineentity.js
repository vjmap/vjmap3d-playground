
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/01polylineentity
        // --Polyline entity--Create, modify, delete polyline entity
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
    color: "#00ff00"
})
data.push({
    coordinates: [[7, 0, -8],[-1, 2, -1],[-8, 1, -9],[7, 0, -8]],
    color: "#ffff00",
    lineWidth: 3,
    dashScale: 2,
    dashOffset: 0,
    dashSize: 3,
    gapSize: 3,
    dashed: true
})
//
let polylines = new vjmap3d.PolylinesEntity({ //PolygonsEntity
    data: data,
})
polylines.addTo(app)
//
polylines.pointerEvents = true; // Enable event interaction
polylines.on("mouseover", e => {
    if (e?.intersection?.faceIndex !== undefined) {
        let itemData = polylines.getItemDataByFaceIndex(e?.intersection?.faceIndex);
        if (itemData && itemData.id) polylines.setItemHighlight(itemData.id, true)
    }
})
polylines.on("mouseout", e => {
    polylines.clearHighlight()
})
//
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px", overflow: "hidden"}});
let cfg = [
    {
        type: 'checkbox',
        label: 'Show vertices',
        getValue: () => polylines.isShowVertex(),
        setValue: v => {
            polylines.setShowVertex(v)
        }
    },
    {
        type: 'button',
        label: 'Add a line',
        value: ()=> {
            data.push({
                coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                color: vjmap3d.randColor()
            })
            polylines.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Change first line color',
        value: ()=> {
            if (data.length > 0) {
                data[0].color = vjmap3d.randColor()
            }
            polylines.setData(data)
        }
    },
    {
        type: 'button',
        label: 'Delete first line',
        value: ()=> {
            if (data.length == 0) {
                return
            }
            data.splice(0, 1)
            polylines.setData(data)
        }
    },{
        type: 'button',
        label: 'Add gradient line',
        value: ()=> {
            data.push({
                coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(),vjmap3d.randPoint3D()],
                // When color is array, draws gradient
                color: [vjmap3d.randColor(), vjmap3d.randColor(), vjmap3d.randColor()],
                lineWidth: 3
            })
            polylines.setData(data)
        }
    }
]
cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};