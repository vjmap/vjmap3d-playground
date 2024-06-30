
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker2d/03uimarker2docclusion
        // --2D标记遮挡判断--
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
        let box = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshStandardMaterial({
            color: '#0ff'
        });
        let mesh = new THREE.Mesh(box, material);
        mesh.position.set(0, 0, 0)
        app.scene.add(mesh);
        //
        let marker2d = new vjmap3d.Marker2D({
            color: "#f00",
            occlusionOpacity:0.2 // 遮挡时透明度
        });
        marker2d.setPosition([0, 0, -1.5]);
        marker2d.addTo(app);  
        marker2d.signal.occlusion.add(e => {
            if (e.occlusion) {
                app.logInfo("被遮挡", "warn");
            } else {
                app.logInfo("没被遮挡", "success");
            }
        });
        app.signal.onAppAfterRender.add(t => {
            app.cameraControl.azimuthAngle += 20 * t.deltaTime * THREE.MathUtils.DEG2RAD;
        })
        
    }
    catch (e) {
        console.error(e);
    }
};