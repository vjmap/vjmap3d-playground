
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/02interactioncommand
        // -- Command mechanism --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left rotate, right pan
})
let box = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({
    color: "#f00",
    side: THREE.DoubleSide
});
let mesh = new THREE.Mesh(box, material);
app.scene.add(mesh)
const ui = await app.getConfigPane({ title: "Input", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Move position", () => {
    let oldPos = mesh.position.clone();
    let newPos = vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}))
    mesh.position.copy(newPos);
    app.addCommand(new vjmap3d.SetPositionCommand(mesh, newPos.clone(), oldPos));
    // executeCommand both adds and runs the command; same as the two lines above
    //app.executeCommand(new vjmap3d.SetPositionCommand(mesh, newPos.clone(), oldPos));
})
gui.addButton("Undo", () => {
    app.undo()
})
gui.addButton("Redo", () => {
    app.redo()
})
gui.addButton("Clear commands", () => {
    app.clearCommands()
})
gui.toJson().forEach(c => ui.appendChild(c));

    }
    catch (e) {
        console.error(e);
    }
};