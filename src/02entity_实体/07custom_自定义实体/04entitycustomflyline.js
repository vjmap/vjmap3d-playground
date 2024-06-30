
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/04entitycustomflyline
        // --飞线--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        
        let pts = [
            [[-5, 0, 0], [5, 0, 0]],
            [[-10, 0, -10], [10, 0, 10]],
            [[-10, 0, 10], [10, 0, -10]]
        ]
        pts.forEach(p => {
            vjmap3d.createFlyline({
                source: p[0],
                target: p[1],
                count: 1000,
                range: 500,
                height: 6,
                color: vjmap3d.randColor(),
                color2: vjmap3d.randColor(),
                speed: Math.random() + 0.5,
                size: vjmap3d.randInt(80, 120),
                opacity: 1.0,
            });
        })
        
        
        // 增加烟花背景
        for(let i = 0; i < 50; i++) {
            let pt = vjmap3d.randPoint2D({maxX: 30, maxY: 30, minY: -30, minX: -30});
            vjmap3d.createFlyline({
                source: [pt[0], -5, pt[1]],
                target: [pt[0], 5, pt[1]],
                count: 1000,
                range: 500,
                height: 0,
                color: vjmap.randomColor(),
                color2: vjmap.randomColor(),
                speed: 1,
                size: 3,
                opacity: 1.0,
            }, app);
        }
    }
    catch (e) {
        console.error(e);
    }
};