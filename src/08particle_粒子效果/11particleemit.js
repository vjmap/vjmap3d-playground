
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/11particleemit
        // --发射效果--
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
        let texture = await vjmap3d.ResManager.loadTextureSync(env.assetsPath + "textures/texture1.png");
        let groups = []
        const initEffect = (index) => {
            const group = new THREE.Group();
            let p1 = app.addParticle({
                system: {
                    duration: 1,
                    looping: false,
                    startLife: new vjmap3d.IntervalValue(0.1, 0.2),
                    startSpeed: new vjmap3d.ConstantValue(0),
                    startSize: new vjmap3d.ConstantValue(4),
                    startColor: new vjmap3d.ConstantColor(new THREE.Vector4(1, 0.585716, 0.1691176, 1)),
                    worldSpace: false,
        
                    // @ts-ignore
                    maxParticle: 10,
                    emissionOverTime: new vjmap3d.ConstantValue(0),
                    emissionBursts: [
                        {
                            time: 0,
                            count: new vjmap3d.ConstantValue(1),
                            cycle: 1,
                            interval: 0.01,
                            probability: 1,
                        },
                    ],
        
                    shape: new vjmap3d.PointEmitter(),
                    material: new THREE.MeshBasicMaterial({
                        map: texture,
                        blending: THREE.AdditiveBlending,
                        transparent: true,
                        side: THREE.DoubleSide,
                    }),
                    startTileIndex: new vjmap3d.ConstantValue(1),
                    uTileCount: 10,
                    vTileCount: 10,
                    renderOrder: 0,
                },
                simulations: [
                    new vjmap3d.SizeOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.95, 0.75, 0), 0]]))
                ],
                parent: group
            });
            
        
        
            let system = {
                duration: 1,
                looping: false,
                startLife: new vjmap3d.IntervalValue(0.1, 0.2),
                startSpeed: new vjmap3d.ConstantValue(0),
                startSize: new vjmap3d.IntervalValue(1, 5),
                startColor: new vjmap3d.ConstantColor(new THREE.Vector4(1, 1, 1, 1)),
                worldSpace: false,
        
                // @ts-ignore
                maxParticle: 5,
                emissionOverTime: new vjmap3d.ConstantValue(0),
                emissionBursts: [
                    {
                        time: 0,
                        count: new vjmap3d.ConstantValue(1),
                        cycle: 1,
                        interval: 0.01,
                        probability: 1,
                    },
                ],
        
                shape: new vjmap3d.PointEmitter(),
                material: new THREE.MeshBasicMaterial({
                    map: texture,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide,
                }),
                startTileIndex: new vjmap3d.ConstantValue(91),
                uTileCount: 10,
                vTileCount: 10,
                renderOrder: 2,
                // @ts-ignore
                renderMode: vjmap3d.RenderMode.LocalSpace,
            }
            let p2 = app.addParticle({
                system: system,
                simulations: [
                    new vjmap3d.ColorOverLife(
                        // @ts-ignore
                        new vjmap3d.ColorRange(new THREE.Vector4(1, 0.3882312, 0.125, 1), new THREE.Vector4(1, 0.826827, 0.3014706, 1))
                    ),
                    new vjmap3d.SizeOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.95, 0.75, 0), 0]])),
                    new vjmap3d.FrameOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(91, 94, 97, 100), 0]]))
                ],
                parent: group
            });
            // @ts-ignore
            p2.position.x = 1;
        
            
            let p3 = app.addParticle({
                system: system,
                simulations: [
                    new vjmap3d.ColorOverLife(
                        // @ts-ignore
                        new vjmap3d.ColorRange(new THREE.Vector4(1, 0.3882312, 0.125, 1), new THREE.Vector4(1, 0.826827, 0.3014706, 1))
                    ),
                    new vjmap3d.SizeOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.95, 0.75, 0), 0]])),
                    new vjmap3d.FrameOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(91, 94, 97, 100), 0]]))
                ],
                parent: group
            });
            p3.system = p2.system
            p3.renderOrder = 2;
            p3.position.x = 1;
            p3.rotation.x = Math.PI / 2;
        
            let p4 = app.addParticle({
                system: {
                    duration: 1,
                    looping: false,
                    startLife: new vjmap3d.IntervalValue(0.1, 0.2),
                    startSpeed: new vjmap3d.ConstantValue(0),
                    startSize: new vjmap3d.IntervalValue(1, 2.5),
                    startRotation: new vjmap3d.IntervalValue(-Math.PI, Math.PI),
                    startColor: new vjmap3d.ConstantColor(new THREE.Vector4(1, 1, 1, 1)),
                    worldSpace: false,
        
                    maxParticle: 5,
                    emissionOverTime: new vjmap3d.ConstantValue(0),
                    emissionBursts: [
                        {
                            time: 0,
                            count: new vjmap3d.ConstantValue(2),
                            cycle: 1,
                            interval: 0.01,
                            probability: 1,
                        },
                    ],
        
                    shape: new vjmap3d.PointEmitter(),
                    material: new THREE.MeshBasicMaterial({
                        map: texture,
                        blending: THREE.AdditiveBlending,
                        transparent: true,
                        side: THREE.DoubleSide,
                    }),
                    startTileIndex: new vjmap3d.ConstantValue(81),
                    uTileCount: 10,
                    vTileCount: 10,
                    renderMode: vjmap3d.RenderMode.BillBoard,
                    renderOrder: 2,
                },
                simulations: [
                    // @ts-ignore
                    new vjmap3d.ColorOverLife(new vjmap3d.ColorRange(new THREE.Vector4(1, 0.95, 0.82, 1), new THREE.Vector4(1, 0.38, 0.12, 1))),
                    new vjmap3d.FrameOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(81, 84.333, 87.666, 91), 0]]))
                ],
                parent: group
            });
            
            let smoke = app.addParticle({
                system: {
                    duration: 2.5,
                    looping: false,
                    startLife: new vjmap3d.IntervalValue(0.6, 0.8),
                    startSpeed: new vjmap3d.IntervalValue(0.1, 3),
                    startSize: new vjmap3d.IntervalValue(0.75, 1.5),
                    startRotation: new vjmap3d.IntervalValue(-Math.PI, Math.PI),
                    startColor: new vjmap3d.RandomColor(new THREE.Vector4(0.6323, 0.6323, 0.6323, 0.31), new THREE.Vector4(1, 1, 1, 0.54)),
                    worldSpace: true,
            
                    maxParticle: 10,
                    emissionOverTime: new vjmap3d.ConstantValue(0),
                    emissionBursts: [
                        {
                            time: 0,
                            count: new vjmap3d.ConstantValue(5),
                            cycle: 1,
                            interval: 0.01,
                            probability: 1,
                        },
                    ],
            
                    shape: new vjmap3d.ConeEmitter({
                        angle: (20 * Math.PI) / 180,
                        radius: 0.3,
                        thickness: 1,
                        arc: Math.PI * 2,
                    }),
                    material: new THREE.MeshBasicMaterial({
                        map: texture,
                        blending: THREE.NormalBlending,
                        transparent: true,
                        side: THREE.DoubleSide,
                    }),
                    startTileIndex: new vjmap3d.ConstantValue(81),
                    uTileCount: 10,
                    vTileCount: 10,
                    renderMode: vjmap3d.RenderMode.BillBoard,
                    renderOrder: -2,
                },
                simulations: [
                    // @ts-ignore
                    new vjmap3d.ColorOverLife(new vjmap3d.ColorRange(new THREE.Vector4(1, 1, 1, 1), new THREE.Vector4(1, 1, 1, 0))),
                    new vjmap3d.RotationOverLife(new vjmap3d.IntervalValue(-Math.PI / 4, Math.PI / 4)),
                    new vjmap3d.FrameOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(28, 31, 34, 37), 0]]))
                ],
                parent: group
            });
            smoke.rotation.y = Math.PI / 2;
        
        
            let particles = app.addParticle({
                system: {
                    duration: 1,
                    looping: false,
                    startLife: new vjmap3d.IntervalValue(0.2, 0.6),
                    startSpeed: new vjmap3d.IntervalValue(1, 15),
                    startSize: new vjmap3d.IntervalValue(0.1, 0.3),
                    startColor: new vjmap3d.RandomColor(new THREE.Vector4(1, 0.91, 0.51, 1), new THREE.Vector4(1, 0.44, 0.16, 1)),
                    worldSpace: true,
        
                    maxParticle: 10,
                    emissionOverTime: new vjmap3d.ConstantValue(0),
                    emissionBursts: [
                        {
                            time: 0,
                            count: new vjmap3d.ConstantValue(8),
                            cycle: 1,
                            interval: 0.01,
                            probability: 1,
                        },
                    ],
        
                    shape: new vjmap3d.ConeEmitter({
                        angle: (20 * Math.PI) / 180,
                        radius: 0.3,
                        thickness: 1,
                        arc: Math.PI * 2,
                    }),
                    material: new THREE.MeshBasicMaterial({
                        map: texture,
                        blending: THREE.AdditiveBlending,
                        transparent: true,
                        side: THREE.DoubleSide,
                    }),
                    startTileIndex: new vjmap3d.ConstantValue(0),
                    uTileCount: 10,
                    vTileCount: 10,
                    renderMode: vjmap3d.RenderMode.StretchedBillBoard,
                    speedFactor: 0.4,
                    renderOrder: 1,
                },
                simulations: [
                    new vjmap3d.SizeOverLife(new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.95, 0.75, 0), 0]]))
                ],
                parent: group
            });
            particles.rotation.y = Math.PI / 2;
        
            group.position.set(Math.floor(index / 10) * 2 - 10, 0, (index % 10) * 2 - 10);
            group.visible = false;
            groups.push(group)
           app.scene.add(group)
        }
        
        
            
            
        for (let i = 0; i < 100; i++) {
            initEffect(i);
        }
            
            
        
        let totalTime = 0;
        let refreshIndex = 0;
        let refreshTime = 1;
        app.signal.onAppBeforeRender.add(e => {
            let delta = e.deltaTime;
           
            while (Math.floor((totalTime / refreshTime) * groups.length) >= refreshIndex) {
                if (refreshIndex < groups.length) {
                    groups[refreshIndex].traverse((object) => {
                        if (object instanceof vjmap3d.ParticleEmitter) {
                            object.system.restart();
                        }
                    });
                    if (groups[refreshIndex] instanceof vjmap3d.ParticleEmitter) {
                        groups[refreshIndex].system.restart();
                    }
                }
                refreshIndex++;
            }
            totalTime += delta;
            if (totalTime > refreshTime) {
                totalTime = 0;
                refreshIndex = 0;
            }
           
        })
        
    }
    catch (e) {
        console.error(e);
    }
};