
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/10builtinobjTrailLine
        // --TrailLine--
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
        let guideLine = new vjmap3d.TrailLine({
            positions:[[1,1,1],[-5,1,5],[-5,1,1]],        //以xz轴为平面
            width:10,                   //线宽
            placeLength:15,             //图标放置的长度
            placeSpace:10,              //图标放置间隔
            iconUrl: env.assetsPath + "textures/arrow.png",        //图标
            speed:2,        //速度
            smooth: true,
            isAnimate:true  //是否需要动画
        })
        guideLine.update(app)
        app.scene.add(guideLine.trail)
        app.signal.onAppUpdate.add(e => {
            guideLine.update(app)
        })
    }
    catch (e) {
        console.error(e);
    }
};