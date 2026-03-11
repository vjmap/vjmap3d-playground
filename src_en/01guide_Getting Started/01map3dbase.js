
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/guide/01map3dbase
        // --Create 3D app--A minimal vjmap3D application
// Create a service instance and connect to the service
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    // Render options
    render: {
        alpha: true,
        antialias: true
    },
    // Whether to show performance stats panel
    stat: {
        show: true,
        left: "0"
    },
    // Scene settings
    scene: {
        // Whether to show grid helper
        gridHelper: {
            visible: true,
            // Grid size (width x height)
            args: [1000, 1000],
            // Grid cell size
            cellSize: 1,
            // Grid section size
            sectionSize: 10
        }
    },
    // Camera settings
    camera: {
        // Whether to show view helper
        viewHelper: {
            enable: true
        }
    },
    control: {
        // Left button for pan (right for rotate) (default)
        leftButtonPan: false
     },
})
let box = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({
    color: "#f00",
    side: THREE.DoubleSide
});
let mesh = new THREE.Mesh(box, material);
app.scene.add(mesh);

    }
    catch (e) {
        console.error(e);
    }
};