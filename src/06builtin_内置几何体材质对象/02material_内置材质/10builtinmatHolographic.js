
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/10builtinmatHolographic
        // --全息投影材质--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let size = 3;
        let position = new THREE.Vector3(0, 0, 0);
        // 创建半球几何体
        let radius = size;
        let widthSegments = 32;
        let heightSegments = 16;
        let phiStart = 0;
        let phiLength = Math.PI; 
        let geom = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength);
        let mat = new vjmap3d.HolographicMaterial(app, {
            fresnelAmount: 0.45,
            fresnelOpacity: 0.1,
            scanlineSize:  2.0,
            hologramBrightness: 1.2,
            signalSpeed:  0.45,
            hologramColor:  "#51a4de",
            enableBlinking:  true,
            blinkFresnelOnly:  true,
            hologramOpacity:  1.0,
        })
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(position);
        mesh.rotateX(-Math.PI / 2);
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};