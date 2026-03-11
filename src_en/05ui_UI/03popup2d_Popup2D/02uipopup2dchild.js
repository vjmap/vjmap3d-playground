
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/popup2d/02uipopup2dchild
        // -- Popup as child node --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
container: "map", // Container id
    scene: {  // Scene settings
        gridHelper: { visible: true } // Whether to show grid helper
    }
})
const mesh = new THREE.Mesh(
    new THREE.SphereGeometry( 0.3, 16, 16 ),
    new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
)
mesh.position.set(4, 0, 0);
app.scene.add(mesh);
let popup = new vjmap3d.Popup2D({
    backgroundColor: "#0ff",
    closeButton: false,
})
popup.setPosition([0, 0.4, 0]); // Position
popup.setHTML("I am mesh child");
popup.addTo(mesh, app)
// 
let angle = 0;
app.signal.onAppUpdate.add(() => {
    angle += 0.01; // Rotation speed
    mesh.position.x = 4 * Math.cos(angle);
    mesh.position.z = 4 * Math.sin(angle);
})
    }
    catch (e) {
        console.error(e);
    }
};