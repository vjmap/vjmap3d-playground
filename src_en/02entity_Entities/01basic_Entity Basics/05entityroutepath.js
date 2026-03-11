
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
        // --Entity path animation--Entity walking along a path via PathAnimateModule
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
container: "map", // Container id
    scene: {  // Scene settings
        gridHelper: { visible: true } // Whether to show grid helper
    }
})
let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/soldier.glb", {
    splitSubEntity: true
});
app.logInfo("Please draw a path line on the map, double-click to finish", 60000)
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
let miniMapControl = true; // Whether to show minimap
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