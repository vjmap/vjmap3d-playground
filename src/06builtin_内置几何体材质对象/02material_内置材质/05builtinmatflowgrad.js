
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/05builtinmatflowgrad
        // --流动的渐变材质--
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
        let data = [];
        for(let i = 0; i < 10; i++) {
            for(let j = 0; j < 10; j++) {
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(Math.random() * 3 + 0.5, Math.random() * 5 + 3, Math.random() * 3 + 0.5),
                    new THREE.MeshStandardMaterial({ color: 0xff0000 })
                );
                box.position.set(i * 10 - 50, 0, j * 10 - 50)
                app.scene.add(box);
                let mat = vjmap3d.createFlowGradientMaterial(app, {
                    object: box,
                    borderWidth: Math.random() * 5,
                    circleTime: Math.random() + 0.2,
                    lightColor: vjmap3d.randColor(),
                    color: vjmap3d.randColor(),
                    topColor: vjmap3d.randColor(),
                })
                box.material = mat;
            }
        }
    }
    catch (e) {
        console.error(e);
    }
};