
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/01particlecreate
        // --创建粒子效果--
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
        const texture = new THREE.TextureLoader().load(env.assetsPath + "textures/curve_triangle.png");
        let particle = app.addParticle({
            system: {
                // 粒子发射周期  发射5秒后进入下一个粒子发射周期。
                duration: 5,
                // 粒子按照周期循环发射 让粒子发射时间循环起来，一直发射粒子。
                looping: true,
                // 预热系统 开始播放粒子是已经发射了一段时间的，只在Looping循环时才有效。
                prewarm: false,
                //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
                // 粒子从发生到消失的时间长短
                startLife: new vjmap3d.IntervalValue(4, 5),
                // 粒子初始发生时候的速度
                startSpeed: new vjmap3d.ConstantValue(1),
                // 粒子初始大小
                startSize: new vjmap3d.IntervalValue(1, 2),
                //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
                // startColor: new vjmap3d.ConstantColor(new THREE.Vector4(0, 1, 1, 1)),
                // 粒子初始颜色
                startColor: new vjmap3d.ColorRange(
                    new THREE.Vector4(0, 1, 1, 1),
                    new THREE.Vector4(1, 0, 0, 1)
                ),
                // 世界空间坐标系
                worldSpace: false,
                //maxParticle: 100,
                // 发射频率按时间 1秒发射的数量。
                emissionOverTime: new vjmap3d.ConstantValue(0),
                // 发射爆发 从第几（Time）秒开始。发射多少个（Count）。这次发射循环几次（Cycles）。每次循环间隔多久（Interval）
                emissionBursts: [
                    {
                        // 粒子爆发的时间，不能超过粒子系统的Duration
                        time: 0,
                        // 发射多少个
                        count: new vjmap3d.ConstantValue(10),
                        // 从爆发时间开始的循环次数
                        cycle: 1,
                        // 两次循环的间隔时间
                        interval: 0.01,
                        // 每次爆发的可能性
                        probability: 1
                    }
                ],
                // 发射器形状Shape模块 （Random随机，Loop循环，Ping-Pong乒乓，Burst Spread突发扩张）
                // Hemisphere：半球 ;  Cone：椎体 ; Donut：甜甜圈 ; Box：盒子
                shape: new vjmap3d.PointEmitter(),
                material: new THREE.MeshBasicMaterial({
                    blending: THREE.NormalBlending,
                    transparent: true,
                    map: texture
                    //side: DoubleSide,
                }),
                // 纹理总的图像数里面的位置索引
                startTileIndex: new vjmap3d.ConstantValue(0),
                // 纹理水平方向有几张图片 （uTileCount * vTileCount ) 表示此纹理总的图像数
                uTileCount: 1,
                // 纹理垂直方向有几张图片
                vTileCount: 1,
                renderOrder: 2,
                //
                // BillBoard = 0, 粒子始终面向摄像机。
                // StretchedBillBoard = 1, 粒子面向摄像机，但是会应用各种缩放。
                // Mesh = 2,
                // Trail = 3,
                // HorizontalBillBoard = 4, // 粒子平面与XZ“地板”平面平行。
                // VerticalBillBoard = 5 // 粒子在世界y轴上直立，但面向摄像机。
                renderMode: vjmap3d.RenderMode.VerticalBillBoard,
                rendererEmitterSettings: {
                    // 基于粒子的速度，粒子在摄影机方向上的拉伸程度。
                    speedFactor: 0,
                    // 粒子在摄影机方向上的拉伸程度取决于粒子的大小。
                    lengthFactor: 2
                }
            },
            simulations: new vjmap3d.SpeedOverLife(
                new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.75, 0.5, 0), 0]])
            ),
            position: [-5, 0, 0]
        });
        const ui = await app.getConfigPane({ title: "粒子", style: { width: "250px"}});
        ui.appendChild({
            type: "button",
            label: '导出JSON',
            value: async ()=>{
                vjmap3d.downloadBlob(JSON.stringify(particle.toJSON(),0,4), "particle.json")
            }
        })
        ui.appendChild({
            type: "button",
            label: '删除粒子',
            value: async ()=>{
                 app.removeParticle(particle);
            }
        })
        
    }
    catch (e) {
        console.error(e);
    }
};