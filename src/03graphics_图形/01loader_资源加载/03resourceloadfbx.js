
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/03resourceloadfbx
        // --加载FBX文件--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        await vjmap3d.ResManager.loadExtensionLoader()
        let ent = await vjmap3d.ResManager.loadModel("https://vjmap.com/map3d/resources/models/stanford-bunny.fbx", {
            splitSubEntity: true,
            size:  5,
            anchor: "front-bottom",
            position: [0, 0, 0]
        });
        ent.addTo(app);
        app.cameraControl.rotateTo( 0,  Math.PI / 2, true );
        app.cameraControl.fitToBox(ent.node, true, { paddingLeft: 0.2, paddingRight: 0.2, paddingBottom: 0.2, paddingTop: 0.2 })
            
            
    }
    catch (e) {
        console.error(e);
    }
};