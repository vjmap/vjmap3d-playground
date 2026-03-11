
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/07entitybehaviormod
        // --Entity behavior module--Add behavior module to entity
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let entity = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
    splitSubEntity: true,
    toEntity: true,
});
entity.scale.set(5, 5, 5)
entity.addTo(app);
const aEntry = new vjmap3d.AnimationTrack(['scale', 'alpha', 'v']);
aEntry.addKey(0, [1, 0.2, 0]);
aEntry.addKey(3, [2, 1, 0.8]);
aEntry.addTransition(0, vjmap3d.Easings.easeInCubic);
//
const aExit = new vjmap3d.AnimationTrack(['scale', 'alpha', 'v']);
aExit.addKey(0, [2, 1, 0]);
aExit.addKey(4, [1, 0, 1]);
aExit.addTransition(0, vjmap3d.Easings.easeInOutCubic);
//
// Behavior tree logic below:
// - Sequence
//   -- Repeat 6 times
//       --- Animation behavior
//       --- Parallel, exit when one completes (rotation runs 5s then exit)
//       --- Animation behavior (reverse)
//   -- Destroy entity
let oldScale = entity.scale.x
entity.add(vjmap3d.BehaviorModule, vjmap3d.SequenceBehavior.from([
    vjmap3d.RepeatBehavior.from(vjmap3d.SequenceBehavior.from([
        new vjmap3d.AnimationBehavior(new vjmap3d.AnimationTrackPlayback(aEntry, (scale, alpha, v) => {
            entity.scale.set(oldScale * scale, oldScale *  scale, oldScale * scale);
            entity.setOpacity(alpha);
        })),
        vjmap3d.ParallelBehavior.from([
            vjmap3d.RotationBehavior.fromJSON({resetWhenFinalize: true}),
            vjmap3d.DelayBehavior.from(5)
        ], vjmap3d.ParallelBehaviorPolicy.RequireOne),
        new vjmap3d.AnimationBehavior(new vjmap3d.AnimationTrackPlayback(aExit, (scale, alpha, v) => {
            entity.scale.set(oldScale * scale, oldScale * scale, oldScale * scale);
            entity.setOpacity(alpha);
        }))
    ]), 6),
    vjmap3d.DestoryBehavior.create() // Destroy entity
]))


    }
    catch (e) {
        console.error(e);
    }
};