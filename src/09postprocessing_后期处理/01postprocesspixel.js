
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/postprocessing/01postprocesspixel
        // --像素化后期效果--
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
        let entity = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
            toEntity: true,
            scale: [10, 10, 10]
        });
        entity.position.set(-2, 0, 1);
        entity.addTo(app);
        // 创建像素化效果
        const effect = new vjmap3d.PixelationEffect(5); 
        // 创建后期效果通道并增加
        app.addEffectRenderPass(new vjmap3d.EffectPass(app.camera, effect), 2000);
        // ui配置
        const ui = await app.getConfigPane({ title: "后期效果设置", style: { width: "250px"}});
        let folder = new vjmap3d.UiPanelJsonConfig();
        folder.addBinding(effect, "granularity", { min: 0, max: 50, step: 1 });
        folder.toJson().forEach(c => ui.appendChild(c))
        
    }
    catch (e) {
        console.error(e);
    }
};