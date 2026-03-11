
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mesh/01meshentityheatmap
        // -- Create mesh entity -- Create a Mesh entity and heatmap from data
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
//
    const box = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
let ent = new vjmap3d.MeshEntity(box);
ent.addTo(app);
ent.add(vjmap3d.EventModule, {
    clickHighlight: true,
    highlightOpacity: 0.2,
    hoverSelect: true,
    hoverHtmlText: "I am MeshEntity",
    clickHtmlText: `You clicked me!`,
    popupOptions: {
        anchor: "bottom"
    }
});
// 
let control = new vjmap3d.ButtonGroupControl({
    buttons: [
        {
            id: "id1",
            html: "Data heatmap",
            style: {
                width: "100px"
            },
            onclick: async () => {
                // Get entity bounding box
                let box3d = ent.getBoundingBox(false);
                let pointNum = 10; // Simulate 10 data points
                let data = []
                let size = new THREE.Vector3();
                box3d.getSize(size)
                for(let k = 0 ; k < pointNum; k++) {
                    data.push({
                        x: box3d.min.x + Math.random() * size.x,
                        y: box3d.min.y + Math.random() * size.y,
                        z: box3d.min.z + Math.random() * size.z,
                        value: Math.random() * 100
                    })
                }
                // Set heatmap data material
                await ent.setHeatmapDataMaterial({
                    data,
                })
            }
        },{
            id: "id2",
            html: "Clear heatmap",
            style: {
                width: "100px"
            },
            onclick: async () => {
                // Restore original material
                ent.resetMaterial();
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