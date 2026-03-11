
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/animation/01animatesimple
        // --Create animation--
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true }, // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
const geometry = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshPhongMaterial({color: '#f00'});
const mesh = new THREE.Mesh(geometry, mat);
let boxEnt = new vjmap3d.MeshEntity(mesh);
boxEnt.addTo(app);
// Create tween animation 1
boxEnt.tween().by(1000, { position: new THREE.Vector3(0, 0.5, 0) }, { easing: 'easeInOutBack' }).yoyoForever().start();
// Create tween animation 2
new vjmap3d.Tween(boxEnt)
  .by(2000, { scale: 1, rotation: new THREE.Euler(Math.PI * 2, Math.PI, 0) }, { easing: 'easeOutElastic' })
  .delay(200)
  .to(1000, { scale: 1 }, { easing: 'easeOutBounce' })
  .start();

    }
    catch (e) {
        console.error(e);
    }
};