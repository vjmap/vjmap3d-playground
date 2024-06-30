
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/05entityroutepath
        // --实体动画路径--创建一个实体沿指定路径行走的动画模块。
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
        container: "map", // 容器id
            scene: {  // 场景设置
                gridHelper: { visible: true } // 是否显示坐标网格
            }
        })
        let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/soldier.glb", {
            splitSubEntity: true
        });
        app.logInfo("请在图上绘制一条要行走的路径线，双击结束", 60000)
        let line = await app.actionDrawLineSting({
            isAddToApp: true
        });
        if (line.isCancel) return
        ent.addTo(app);
        let pathAnmiMod = ent.add(vjmap3d.PathAnimateModule)
        pathAnmiMod.start({
            paths: line.data.coordinates,
            cameraFollow: true, 
            animation: {
                duration: 10000,
                yoyoForever: true
            },
            startAimatorClipName: 'Walk',
            stopAimatorClipName: ""
        })
        let miniMapControl = true; // 是否显示小地图
        if (miniMapControl) {
            let miniMapControl = new vjmap3d.MiniMapControl({
                followTarget: ent.node,
                // mapSyncRotateZ: true,
                mapSize: 10,
            });
            app.addControl(miniMapControl)
        }
    }
    catch (e) {
        console.error(e);
    }
};