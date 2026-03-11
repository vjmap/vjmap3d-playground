
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/04particleentity
        // -- Particle effect linked to entity --
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
let entity = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
    toEntity: true,
    scale: [3, 3, 3]
});
entity.position.set(-4, 0, 3);
entity.addTo(app);
let particle = await app.loadParticle(env.assetsPath + "json/blue_fire.json", {
    parent: entity.node, // Link to entity
    rotation: [0, -Math.PI / 2, 0],
    scale: [0.5, 0.5, 0.5]
});
// Path animation
let pathAnmiMod = entity.add(vjmap3d.PathAnimateModule)
pathAnmiMod.start({
    paths: [[-4, 0, 3], [4, 0, 3], [4, 0, -7], [-4, 0, -7], [-4, 0, 3]],
    cameraFollow: false, 
    offsetAngle: 90,
    animation: {
        duration: 15000,
        repeatForever: true
    }
})

const ui = await app.getConfigPane({ title: "Tools", style: { width: "110px" } });
ui.appendChild({
    type: "button",
    label: 'Remove particle',
    value: async () => {
        if (particle.parent) {
            particle.parent.remove(particle)
        }
    }
})
ui.appendChild({
    type: "button",
    label: 'Remove path animation',
    value: async () => {
        entity.removeModule(vjmap3d.PathAnimateModule)
    }
})

    }
    catch (e) {
        console.error(e);
    }
};