
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/04entityanimatemod
        // --实体动画模块--加载有动画的模型，通过动画模块显示动画
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }, 
            control:{
                initState: { // 相机初始位置 
                    cameraTarget: new THREE.Vector3(-8, 0, -4),
                    cameraPosition: new THREE.Vector3(-33, 16, -17)
                }
            }
        })
        let ent = await vjmap3d.ResManager.loadModel(vjmap3d.ResManager.svrUrl("models/Stork.glb"), {
            splitSubEntity: true,
            scale: 0.1,
            anchor: "front-bottom-right"
        });
        ent.addTo(app);
        let mod = ent.getModule(vjmap3d.AnimatorModule);
        if (!mod) return;
        let animator = mod.getAnimator();
        animator.play(0) // 开启动画
         
        const ui = await app.getConfigPane()
        ui.appendChild({
            type: "button",
            label: "停止动画",
            value: () => {
                animator.stop(0)  // 停止动画
            }
        })
        ui.appendChild({
            type: "button",
            label: "开始动画",
            value: () => {
                animator.play(0) // 开启动画
            }
        })
    }
    catch (e) {
        console.error(e);
    }
};