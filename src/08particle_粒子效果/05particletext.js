
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/05particletext
        // --文字粒子动画--
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
        let texture = await vjmap3d.ResManager.loadTextureSync(
            env.assetsPath + "textures/texture1.png"
        );
        let logo_texture1 = await vjmap3d.ResManager.loadTextureSync(
            env.assetsPath + "textures/logo_texture1.png"
        );
        let logo_texture2 = await vjmap3d.ResManager.loadTextureSync(
            env.assetsPath + "textures/logo_texture2.png"
        );
        let seq = new vjmap3d.TextureSequencer(0.15, 0.15, new THREE.Vector3(-15, 1, 1));
        seq.fromImage(logo_texture1.image, 0.6);
        let seq2 = new vjmap3d.TextureSequencer(0.12, 0.12, new THREE.Vector3(-6, 0, 5));
        seq2.fromImage(logo_texture2.image, 0.6);
        let applySeq = new vjmap3d.ApplySequences(0.001);
        applySeq.appendSequencer(new vjmap3d.IntervalValue(1.0, 2.0), seq);
        applySeq.appendSequencer(new vjmap3d.IntervalValue(5.0, 6.0), seq2);
        //
        app.addParticle({
            system: {
                duration: 8,
                looping: true,
                startLife: new vjmap3d.ConstantValue(7.8),
                startSpeed: new vjmap3d.ConstantValue(0),
                startSize: new vjmap3d.IntervalValue(0.01, 0.1),
                startColor: new vjmap3d.RandomColor(
                    new THREE.Vector4(0, 1, 1, 1),
                    new THREE.Vector4(1, 0, 1, 1)
                ),
                worldSpace: false,
                emissionOverTime: new vjmap3d.ConstantValue(0),
                emissionBursts: [
                    {
                        time: 0,
                        count: new vjmap3d.ConstantValue(1000),
                        cycle: 1,
                        interval: 1,
                        probability: 1
                    }
                ],
                shape: new vjmap3d.GridEmitter({ width: 15, height: 15, column: 50, row: 50 }),
                material: new THREE.MeshBasicMaterial({
                    map: texture,
                    blending: THREE.NormalBlending,
                    transparent: true,
                    side: THREE.FrontSide
                }),
                renderMode: vjmap3d.RenderMode.BillBoard,
                startTileIndex: new vjmap3d.ConstantValue(2),
                uTileCount: 10,
                vTileCount: 10,
                renderOrder: 0
            },
            simulations: [applySeq]
        });
        
    }
    catch (e) {
        console.error(e);
    }
};