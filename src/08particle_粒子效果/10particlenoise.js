
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/10particlenoise
        // --噪声粒子效果--
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
        let texture = await vjmap3d.ResManager.loadTextureSync(env.assetsPath + "textures/particle.png");
        
        app.addParticle({
            system: {
                duration: 1,
                looping: true,
                startLife: new vjmap3d.ConstantValue(4),
                startSpeed: new vjmap3d.IntervalValue(5, 6),
                startSize: new vjmap3d.ConstantValue(0.1),
                startColor: new vjmap3d.ColorRange(
                    new THREE.Vector4(1, 1, 1, 1),
                    new THREE.Vector4(1, 0, 0, 1)
                ),
                worldSpace: true,
        
                emissionOverTime: new vjmap3d.ConstantValue(500),
        
                shape: new vjmap3d.ConeEmitter({ radius: 0.5, angle: 0.5 }),
                material: new THREE.MeshBasicMaterial({
                    map: texture,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide
                }),
                renderMode: vjmap3d.RenderMode.BillBoard,
                startTileIndex: new vjmap3d.ConstantValue(0),
                uTileCount: 10,
                vTileCount: 10,
                renderOrder: 0
            },
            simulations: [
                new vjmap3d.Noise(new vjmap3d.ConstantValue(1), new vjmap3d.ConstantValue(2))
            ],
            rotation: [-Math.PI / 2, 0, 0]
        });
            
            
    }
    catch (e) {
        console.error(e);
    }
};