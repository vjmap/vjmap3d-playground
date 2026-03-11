
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/06resourceloadbvh
        // -- Load BVH animation --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: false }, // Whether to show grid helper
    },
    control: {
        initState:{
            cameraTarget: new THREE.Vector3(-20,0, 26),
            cameraPosition: new THREE.Vector3(90,240, 270)
        }
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
await vjmap3d.ResManager.loadExtensionLoader();
let result = await vjmap3d.ResManager.loadRes("https://vjmap.com/map3d/resources/models/pirouette.bvh", false);
const skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
app.scene.add( result.skeleton.bones[ 0 ] );
app.scene.add( skeletonHelper );
let animator = new vjmap3d.Animator({
    object: result.skeleton.bones[ 0 ] ,
    animations: result.clip 
});
animator.play(0)
new vjmap3d.Entity().addTo(app).add(vjmap3d.AnimatorModule, animator).getAnimator().play(0)
    }
    catch (e) {
        console.error(e);
    }
};