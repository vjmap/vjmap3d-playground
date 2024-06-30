
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/51pluginalgbsg
        // --几何空间交差并补运算--
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
        let amLib = await vjmap3d.loadPluginAlgorithm();
        let len = 1;
        const brush1 = new amLib.Brush( new THREE.SphereGeometry(len) );
        brush1.material.color = new THREE.Color("#0f0")
        //
        brush1.position.set(0,  0, 2)
        brush1.updateMatrixWorld();
        //
        const brush2 = new amLib.Brush( new THREE.BoxGeometry(len, len, len) );
        brush2.position.set(0, 0.5, 2)
        //
        brush2.material.color = new THREE.Color("#f00")
        brush2.updateMatrixWorld();
        //
        const evaluator = new amLib.Evaluator();
        const result = evaluator.evaluate( brush1, brush2, amLib.HOLLOW_SUBTRACTION );
        app.scene.add(result)
    }
    catch (e) {
        console.error(e);
    }
};