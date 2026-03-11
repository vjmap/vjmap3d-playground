
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/07builtinobjheatmap3d
        // -- 3D heatmap --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let data = [];
for(let k = 0; k < 100; k++) {
    data.push({
        point: vjmap3d.randPoint2D({minX: -10, maxX: 10, minY: -10, maxY: 10}),
        value: Math.random() * 50
    })
}
//
let heatmap = new vjmap3d.Heatmap({
    mode3D: true, // 3D mode
    heightRatio: 1.0,
    bounds: [[-10, -10], [10, 10]],
    data: data,
    min: 0,
    max: 50
})
let mesh = await heatmap.create();
let heatmapEnt = new vjmap3d.MeshEntity(mesh);
heatmapEnt.addTo(app);
heatmapEnt.pointerEvents = true
//
const popup = new vjmap3d.Popup2D({
    backgroundColor: "#A0FFA0",
    buttonColor: "#f00",
    closeOnClick: false,
    closeButton: false,
    showArrow: true,
    isHide: true
}).setText("").addTo(app);
//
heatmapEnt.on("mousemove", e => {
    console.log(e)
    if (e?.intersection?.uv) {
        let value = heatmap.getValueByUV(e?.intersection?.uv.toArray());
        popup.setText(`Value: ${value}`)
        if (value) {
            popup.position.copy(e?.intersection?.point)
            popup.show();
        } else {
            popup.hide();
        }
    }
})
heatmapEnt.on("mouseout", e => {
    popup.hide();
})
// Simulate value changes
setInterval(() => {
    let data = [];
    for(let k = 0; k < 100; k++) {
        data.push({
            point: vjmap3d.randPoint2D({minX: -10, maxX: 10, minY: -10, maxY: 10}),
            value: Math.random() * 50
        })
    }
    heatmap.setData({
        //  bounds: [[0, 0], [100, 100]],
        data,
        min: 0,
        max: 50
    })
}, 3000)

    }
    catch (e) {
        console.error(e);
    }
};