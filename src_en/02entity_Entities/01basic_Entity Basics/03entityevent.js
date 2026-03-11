
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/03entityevent
        // --Entity events--Add event module to entity for events
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
let box = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshStandardMaterial({
    color: "#0f0",
    side: THREE.DoubleSide
});
let mesh = new THREE.Mesh(box, material);
let entity = vjmap3d.Entity.fromObject3d(mesh);
entity.addTo(app);
// Method 1: Add event module
entity.add(vjmap3d.EventModule, {
    clickHighlight: true,
    highlightOpacity: 0.2,
    hoverSelect: true,
    hoverHtmlText: "I am MeshEntity",
    popupOptions: {
        anchor: "bottom"
    },
    clickCallback: (ent, isClick) => {
        if (!isClick) return;
        app.logInfo(`You clicked me`)
    }
});
// Method 2: Listen to events
let box2 = new THREE.BoxGeometry(1, 1, 1)
const material2 = new THREE.MeshStandardMaterial({
    color: "#f00",
    side: THREE.DoubleSide
});
let mesh2 = new THREE.Mesh(box2, material2);
let entity2 = vjmap3d.Entity.fromObject3d(mesh2);
entity2.position.set(-3, 2, -3)
entity2.addTo(app);
entity2.pointerEvents = true; // Enable event listening
let onMouseEnterCancelCb = entity2.signal.onMouseEnter.add(() => entity2.outline = true)
let onMouseLeaveCancelCb =  entity2.signal.onMouseLeave.add(() => entity2.outline = false)
let control = new vjmap3d.ButtonGroupControl({
    buttons: [
        {
            id: "id1",
            html: "Remove events",
            title: "Remove events",
            style: {
                width: "90px"
            },
            onclick: async () => {
               entity.removeModule(vjmap3d.EventModule);
               onMouseEnterCancelCb();
               onMouseLeaveCancelCb();
               app.logInfo(`After removing events, it will no longer respond`)
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