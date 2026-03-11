
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
        // -- Create particle effect --
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
let particle = app.addParticle({
    system: {
        // Emission duration (seconds per cycle)
        duration: 5,
        // Loop emission
        looping: true,
        // Warmup (only when looping)
        prewarm: false,
        //instancingGeometry: new PlaneGeometry(1, 1),//.rotateX((-90 / 180) * Math.PI),
        // Particle lifetime
        startLife: new vjmap3d.IntervalValue(4, 5),
        // Initial speed
        startSpeed: new vjmap3d.ConstantValue(1),
        // Initial size
        startSize: new vjmap3d.IntervalValue(1, 2),
        //startRotation: new EulerGenerator(new ConstantValue(0), new ConstantValue(0), new ConstantValue(0)),
        // startColor: new vjmap3d.ConstantColor(new THREE.Vector4(0, 1, 1, 1)),
        // Initial color
        startColor: new vjmap3d.ColorRange(
            new THREE.Vector4(0, 1, 1, 1),
            new THREE.Vector4(1, 0, 0, 1)
        ),
        // World space
        worldSpace: false,
        //maxParticle: 100,
        // Emission rate per second
        emissionOverTime: new vjmap3d.ConstantValue(0),
        // Burst: time, count, cycle, interval, probability
        emissionBursts: [
            {
                time: 0,
                count: new vjmap3d.ConstantValue(10),
                cycle: 1,
                interval: 0.01,
                probability: 1
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
        uTileCount: 1,
        vTileCount: 1,
        renderOrder: 2,
        //
        // BillBoard = 0, StretchedBillBoard = 1
        // Mesh = 2,
        // Trail = 3,
        // HorizontalBillBoard = 4, VerticalBillBoard = 5
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
const ui = await app.getConfigPane({ title: "Particles", style: { width: "250px"}});
ui.appendChild({
    type: "button",
    label: 'Export JSON',
    value: async ()=>{
        vjmap3d.downloadBlob(JSON.stringify(particle.toJSON(),0,4), "particle.json")
    }
})
ui.appendChild({
    type: "button",
    label: 'Delete particle',
    value: async ()=>{
         app.removeParticle(particle);
    }
})

    }
    catch (e) {
        console.error(e);
    }
};