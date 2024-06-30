
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/06entitysetroute
        // --实体设置路径动画和速度--路径行走每段路径设置不同动画和速度。
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
        container: "map", // 容器id
            scene: {  // 场景设置
                gridHelper: { visible: true } // 是否显示坐标网格
            }
        })
        let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/soldier.glb", {
            splitSubEntity: true
        });
        ent.addTo(app);
        let pathSegs = [
            {
                point: [0,0,0]
            },
            {
                point: [10,0,10],
                time: 1000
            },
            {
                point: [10, 0, 20],
                time: 2000
            },
            {
                point: [20, 0, 20],
                time: 1000
            },
            {
                point: [20, 0, 10],
                time: 3000
            },
            {
                point: [10, 0, 10],
                time: 2000
            }
        ]
        // 
        let pathAnmiMod = ent.add(vjmap3d.PathAnimateModule)
        for(let n = 1; n < pathSegs.length; n++) {
            await pathAnmiMod.start({
                paths: [pathSegs[n - 1].point, pathSegs[n].point],
                animation: {
                    // @ts-ignore
                    duration: pathSegs[n].time
                },
                cameraFollow: true,
                startAimatorClipName: 'Walk',
                stopAimatorClipName: n == pathSegs.length - 1 ? "" : "Walk"
            })
        }
        
    }
    catch (e) {
        console.error(e);
    }
};