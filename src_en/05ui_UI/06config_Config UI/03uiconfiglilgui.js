
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/config/03uiconfiglilgui
        // -- lil-gui style config --
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
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 ),
    new THREE.MeshStandardMaterial( { color: 0x00ffff } )
)
mesh.position.set(-2, 0, 0);
app.scene.add(mesh);
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
let folder = gui.addFolder("mesh");
folder.open();
folder.add(mesh, 'uuid');
folder.add(mesh, 'visible').label("Visible");
folder.addBinding({scale: 1}, "scale", {type: "slider", min: 0.5, max: 5, step: 0.1}).onChange(v => mesh.scale.set(v, v, v))
folder.add(mesh, 'position').label("Position");
folder.addFunction(() => {
    // Use getter so UI refreshes on rotate
    return {
        type: 'vec3',
        label: 'Rotate',
        property: [mesh, 'rotation'],
    }
});
folder.add(mesh.material, 'color').label("Color");
folder.add(mesh.material, 'side', [
    {
        label: "Front",
        value: THREE.FrontSide,
    },{
        label: "Back",
        value: THREE.BackSide,
    },{
        label: "Double",
        value: THREE.DoubleSide,
    }
]);
let subFolder = folder.addFolder("Rotate model");
subFolder.open();
[
    'X +', 'X -', 'Y +', 'Y -', 'Z +', 'Z -',
].forEach((l)=>{
subFolder.addButton('Rotate ' + l + '10', (e)=>{
        mesh.rotateOnAxis(new THREE.Vector3(l.includes('X') ? 1 : 0, l.includes('Y') ? 1 : 0, l.includes('Z') ? 1 : 0), Math.PI / 18 * (l.includes('-') ? -1 : 1))
        // Refresh UI
        ui.uiRefresh()
    })
});
gui.toJson().forEach(c => ui.appendChild(c))

    }
    catch (e) {
        console.error(e);
    }
};