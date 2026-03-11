
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/02entitysetattr
        // --Entity glow/outline--Set entity highlight glow and outline
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    postProcess: { // Or use defaults if not set
        bloomPass: {
            luminanceThreshold: 0.01,
            luminanceSmoothing: 0.1,
            mipmapBlur: true,
            intensity: 3.0,
        },
        outlinePass: {
            edgeStrength: 4.0,
            pulseSpeed: 0.4,
            visibleEdgeColor: 0x00ffff,
            hiddenEdgeColor: 0x634ab0,
        },
        selectedPass: {
            edgeStrength: 8.0,
            pulseSpeed: 1,
            visibleEdgeColor: 0xff0000,
            hiddenEdgeColor: 0xb0634a,
        }
    }
})
const geometry = new THREE.ConeGeometry(1, 4);
const material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
const cube = new THREE.Mesh( geometry, material );
let entity = vjmap3d.Entity.fromObject3d(cube); // Create an entity from Object3D
entity.addTo(app);// Add entity to app
entity.selected = true;
entity.bloom = true;
// entity.boxHelper = true; // Or use default
// Or custom box helper
entity.boxHelper = {
    lineColor: "#ff0",
    fillColor: "#f0f",
    fillOpacity: 0.01
}

    }
    catch (e) {
        console.error(e);
    }
};