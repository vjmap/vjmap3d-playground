
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/animation/04animatefunction
        // --动画函数--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshPhongMaterial({color: '#f00'});
        const mesh = new THREE.Mesh(geometry, mat);
        let boxEnt = new vjmap3d.MeshEntity(mesh);
        boxEnt.addTo(app);
        let color1 = new THREE.Color('#f00')
        let color2 = new THREE.Color('#0f0')
        vjmap3d.animation({
            duration: 3000,
            easing: "linear",
            yoyoForever: true,
            onProgress(target, key, start, end, alpha, reversed) {
                boxEnt.node.material.color = new THREE.Color().lerpColors(color1, color2, alpha)
            }
        })
        await vjmap3d.animationAsync({
            duration: 3000,
            easing: "linear",
            repeatTimes: 30,
            onProgress(target, key, start, end, alpha, reversed) {
                boxEnt.node.scale.set(alpha + 1, alpha + 1, alpha + 1)
            }
        })
        app.logInfo("缩放动画结束了", "success")
    }
    catch (e) {
        console.error(e);
    }
};