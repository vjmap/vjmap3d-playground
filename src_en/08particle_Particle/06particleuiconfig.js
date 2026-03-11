
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/06particleuiconfig
        // -- Particle config --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
const texture = new THREE.TextureLoader().load(env.assetsPath + "textures/curve_triangle.png");
let options = {
    duration: 5,
    looping: true,
    prewarm: false,
    startSpeed: 1,
    startLifeMin: 4,
    startLifeMax: 5,
    startSizeMin: 1,
    startSizeMax: 2,
    startColorMin: new THREE.Color(0, 1, 1),
    startColorMax: new THREE.Color(1, 0, 0),
    emissionOverTime: 0,
    emissionBursts: {
        // Burst time (must be <= Duration)
        time: 0,
        // Count
        count: 10,
        // Cycles
        cycle: 1,
        // Interval
        interval: 0.01,
        // Probability
        probability: {
            uiConfig: {
                type: "slider",
                label: "Probability",
                value: 1,
                bounds: [0, 1],
                step: 0.01
            }
        }
    }
}
let particle;
const updateParticle = (opts) => {
    if (particle) app.removeParticle(particle);
    particle = app.addParticle({
        system: {
            // Duration (seconds per cycle)
            duration: opts.duration,
            // Loop emission
            looping: opts.looping,
            // Warmup (only when looping)
            prewarm: opts.prewarm,
            //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
            // Lifetime
            startLife: new vjmap3d.IntervalValue(opts.startLifeMin, opts.startLifeMax),
            // Initial speed
            startSpeed: new vjmap3d.ConstantValue(opts.startSpeed),
            // Initial size
            startSize: new vjmap3d.IntervalValue(opts.startSizeMin, opts.startSizeMax),
            //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
            // startColor: new vjmap3d.ConstantColor(new THREE.Vector4(0, 1, 1, 1)),
            // Initial color
            startColor: new vjmap3d.ColorRange(
                new THREE.Vector4(opts.startColorMin.r, opts.startColorMin.g, opts.startColorMin.b, 1),
                new THREE.Vector4(opts.startColorMax.r, opts.startColorMax.g, opts.startColorMax.b, 1)
            ),
            // World space
            worldSpace: false,
            //maxParticle: 100,
            // Emission rate per second
            emissionOverTime: new vjmap3d.ConstantValue(opts.emissionOverTime),
            // Burst: time, count, cycles, interval
            emissionBursts: [
                {
                    // Burst time (must be <= Duration)
                    time: opts.emissionBursts.time,
                    // Count
                    count: new vjmap3d.ConstantValue(opts.emissionBursts.count),
                    // Cycles
                    cycle: opts.emissionBursts.cycle,
                    // Interval
                    interval: opts.emissionBursts.interval,
                    // Probability
                    probability: opts.emissionBursts.probability.uiConfig.value
                }
            ],
            // Emitter shape: Hemisphere, Cone, Donut, Box
            shape: new vjmap3d.PointEmitter(),
            material: new THREE.MeshBasicMaterial({
                blending: THREE.NormalBlending,
                transparent: true,
                map: texture
                //side: DoubleSide,
            }),
            // Texture frame index
            startTileIndex: new vjmap3d.ConstantValue(0),
            // Horizontal tiles
            uTileCount: 1,
            // Vertical tiles
            vTileCount: 1,
            renderOrder: 2,
            //
            // BillBoard, StretchedBillBoard, Mesh, Trail, HorizontalBillboard, VerticalBillboard
            // Mesh = 2,
            // Trail = 3,            // HorizontalBillBoard = 4, VerticalBillBoard = 5
            renderMode: vjmap3d.RenderMode.VerticalBillBoard,
            rendererEmitterSettings: {
                speedFactor: 0,
                lengthFactor: 2
            }
        },
        simulations: new vjmap3d.SpeedOverLife(
            new vjmap3d.PiecewiseBezier([[new vjmap3d.Bezier(1, 0.75, 0.5, 0), 0]])
        ),
        position: [-5, 0, 0]
    });
}
updateParticle(options);
const ui = await app.getConfigPane({ title: "Settings", style: { width: "250px"}});
let cfg = {
    type: 'folder',
    expanded: true,
    app: app,
    label: "Params",
    children: vjmap3d.generateUiConfig(options),
    onChange: v => {
        console.log(options)
        updateParticle(options)
    }
}
ui.appendChild(cfg)


    }
    catch (e) {
        console.error(e);
    }
};