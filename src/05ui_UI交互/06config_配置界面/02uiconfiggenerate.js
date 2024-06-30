
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/config/02uiconfiggenerate
        // --根据对象生成配置界面--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                defaultLights: false
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
        const light = new THREE.SpotLight( "#ff4800", 110 );
        light.angle = 0.3;
        light.penumbra = 0.2;
        light.decay = 2;
        light.distance = 50;
        light.position.set( -7, 2.6, 8.6 );
        app.scene.add(light)
        let config = [
            {
                prop: "position"
            },
            {
                prop: "color"
            },
            {
                prop: "intensity"
            },
            {
                prop: "angle"
            },
            {
                prop: "penumbra"
            },
            {
                prop: "decay"
            },
            {
                prop: "distance",
                value: "50" // 缺省值
            }
        ];
        const ui = await app.getConfigPane({ title: "SpotLight设置", style: { width: "250px"}});
        let cfg = vjmap3d.generateUiConfig(light, config);
        cfg.forEach(c => ui.appendChild(c))
    }
    catch (e) {
        console.error(e);
    }
};