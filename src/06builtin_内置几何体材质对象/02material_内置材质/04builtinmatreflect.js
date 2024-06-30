
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/04builtinmatreflect
        // --反射材质--
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
        let carMesh = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
            toEntity: true
        });
        carMesh.scale.set(5, 5, 5)
        carMesh.addTo(app);
        const geometry = new THREE.PlaneGeometry(100, 100)
        const { mesh, material } = vjmap3d.createReflectorShaderMesh(geometry, {
            reflectorMaterialType: "ReflectorDudvMaterial",
            reflectivity: 0.2
        })
        mesh.name = "reflectorShaderMesh"
        mesh.rotation.x = -Math.PI / 2
        mesh.position.y = -0.3
        app.scene.add(mesh);
        const ui = await app.getConfigPane()
        ui.appendChild({
            type: "slider",
            label: 'reflectivity',
            property: [material.uniforms.uReflectivity, "value"],
            bounds: [0, 1],
            step: 0.001
        })
        ui.appendChild({
            type: "slider",
            label: '位置y',
            property: [mesh.position, "y"],
            bounds: [-10, 0],
            step: 0.01
        })
        
        
    }
    catch (e) {
        console.error(e);
    }
};