
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/01pluginloaderfbx
        // --加载fbx模型--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
        container: "map", // 容器id
            scene: {  // 场景设置
                gridHelper: { visible: true } // 是否显示坐标网格
            }
        })
        await vjmap3d.ResManager.loadExtensionLoader();
         let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/fbx/nurbs.fbx", {
            splitSubEntity: true,
            anchor: "front-bottom-right",
            position: [-2, 0, 2],
            size: 5,
            // fileType: "fbx" // 如果资源路径后面不是fbx时，需指定类型，否则自动判断 
        });
        ent.addTo(app);
    }
    catch (e) {
        console.error(e);
    }
};