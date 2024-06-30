
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/animation/03animatemany
        // --同时多个动画--
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
        let tween1 = new vjmap3d.Tween(boxEnt).by(2000, { position: new THREE.Vector3(-5, 0, 3) });
        let tween2 = new vjmap3d.Tween(boxEnt).by(3000, { scale: new THREE.Vector3(1.5, 1.5, 1.5) });
        let tween = new vjmap3d.Tween(boxEnt);
        tween.parallel(tween1, tween2).yoyoForever().start()
        //
        const geometry2 = new THREE.BoxGeometry(1, 1, 1);
        const mat2 = new THREE.MeshPhongMaterial({color: '#0ff'});
        const mesh2 = new THREE.Mesh(geometry2, mat2);
        let boxEnt2 = new vjmap3d.MeshEntity(mesh2);
        boxEnt2.addTo(app);
        boxEnt2.position.set(0, 0, -2)
        let tween4 = new vjmap3d.Tween(boxEnt2).by(2000, { position: new THREE.Vector3(-5, 0, -3) });
        let tween5 = new vjmap3d.Tween(boxEnt2).by(3000, { scale: new THREE.Vector3(1.5, 1.5, 1.5) });
        let tween3 = new vjmap3d.Tween(boxEnt2);
        tween3.sequence(tween4, tween5).start()
        
        
    }
    catch (e) {
        console.error(e);
    }
};