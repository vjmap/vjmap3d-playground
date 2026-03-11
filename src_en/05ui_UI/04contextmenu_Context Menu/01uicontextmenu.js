
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/contextmenu/01uicontextmenu
        // -- Context menu --
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
let box = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshStandardMaterial({
    color: '#0ff'
});
let mesh = new THREE.Mesh(box, material);
mesh.position.set(0, 0, 0)
let meshEnt = vjmap3d.Entity.fromObject3d(mesh);
meshEnt.pointerEvents = true; // Enable events for context menu on entity
meshEnt.addTo(app);
//
let marker2d = new vjmap3d.Marker2D({
    color: vjmap3d.randHtmlColor()
});
marker2d.setPosition([2, 0, 1]);
marker2d.addTo(app);
//
let isAllowShowMenu = true
app.setMenu((event, object) => {
    if (!isAllowShowMenu) return;
    if (object) {
        // When clicking on an entity
        return new vjmap3d.ContextMenu({
            event: event.originalEvent,
            theme: "dark", //light
            width: "250px",
            items: [
                {type: 'custom', markup: `<span style="color: #00ffff; padding-left: 30px">Entity context menu</span>`},
                {
                    label: 'Edit',
                    onClick: () => {
                        app.transformObject({
                            target: object.target.node,
                            clickNoSelfEntityExit: true,
                            clickNoEntityExit: true,
                        });
                    }
                },
                {
                    label: 'Delete',
                    onClick: () => {
                        object.target.remove()
                    }
                },
            ]
        });
    } else {
        // When not clicking on anything, show app menu
        return new vjmap3d.ContextMenu({
            event: event.originalEvent,
            theme: "dark", //light
            width: "250px",
            items: [
                {type: 'custom', markup: `<span style="color: #ffff00; padding-left: 30px">App context menu</span>`},
                {type: 'multi', items: [
                    {label: 'Zoom in', onClick: () => { app.cameraControl.dolly(3); }},
                    {label: 'Zoom out', onClick: () => { app.cameraControl.dolly(-3); }},
                ]},
            ]
        });
    }
})
// Marker is in div, add context menu separately
marker2d.getElement().addEventListener("contextmenu", event => {
    // @ts-ignore
    if (event.button != 2) return;// Not right button
    // Prevent default map context menu
    event.preventDefault();
    event.stopPropagation();
    new vjmap3d.ContextMenu({
        event: event,
        theme: "dark", //light
        width: "250px",
        items: [
            {type: 'custom', markup: `<span style="color: #ff00ff; padding-left: 30px">Marker context menu</span>`},
            {
                label: 'Allow drag',
                onClick: () => {
                    marker2d.setDraggable(true)
                }
            },
            {
                label: 'Disallow drag',
                onClick: () => {
                    marker2d.setDraggable(false)
                }
            }
        ]
    });
})
app.logInfo("Right-click to open context menu")

    }
    catch (e) {
        console.error(e);
    }
};