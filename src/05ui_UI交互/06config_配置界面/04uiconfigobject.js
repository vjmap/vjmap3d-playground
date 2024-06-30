
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/config/04uiconfigobject
        // --选择对象查看配置--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        for(let i = 0; i < 10; i++) {
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry( 1, 1, 1 ),
                new THREE.MeshStandardMaterial( { color: vjmap3d.randColor() } )
            )
            mesh.position.copy(vjmap3d.toVector3(vjmap3d.randPoint3D()));
            let meshEntity = vjmap3d.Entity.fromObject3d(mesh);
            meshEntity.addTo(app);
        }
        const ui = await app.getConfigPane()
        ui.appendChild(app.uiConfig)
        let opts = {
            highlightUseBoxHelper: true,
            highlightOpacity: 0,
            pickCallBack: async (param) => {
                ui.reset();
                if (param.curPick) {
                    let config;
                    if (app.Input.getKeyPressed("ControlLeft") && param.curPick.intersection?.object) {
                        // 如果按往了ctrl键，则只选择中当前选择的
                        let obj = param.curPick.intersection?.object;
                        config = vjmap3d.makeObject3DUiConfig(obj)
                    } else {
                        config = param.curPick.target.uiConfig;
                    }
                    ui.appendChild(config)
                } else {
                    const ui = await app.getConfigPane()
                    ui.appendChild(app.uiConfig)
                }
            }
        }
        app.setCurrentTool("pick", opts)
    }
    catch (e) {
        console.error(e);
    }
};