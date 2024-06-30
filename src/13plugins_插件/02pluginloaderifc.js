
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/02pluginloaderifc
        // --加载ifc模型--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
        container: "map", // 容器id
            scene: {  // 场景设置
                gridHelper: { visible: true } // 是否显示坐标网格
            }
        })
        await vjmap3d.ResManager.loadExtensionIfcLoader()
        let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/model.ifc", {
            splitSubEntity: false,
            position: [0, 0, 0]
        });
        ent.addTo(app);
        app.cameraControl.loadState({
            cameraTarget: new THREE.Vector3(0.3284790969323134,1.8240027596797397e-20, 1.6326208403110127),
            cameraPosition: new THREE.Vector3(0.9768856247903213,0.5587020679946232, 6.629605159565004)
        })
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};