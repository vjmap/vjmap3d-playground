
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/01symbolEntityAnimate
        // --点符号动画--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        const particles = 5000;
        const n = 50, n2 = n / 2; // particles spread in the cube
        let data = [];
        for (let i = 0; i < particles; i++) {
            // positions
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;
            data.push({
                position: [x, y, z]
            });
        }
        let points = new vjmap3d.SymbolEntity({
            data: data,
            style: {
                size: 3,
                shape: "circle",
                color: "#0f0",
                borderColor: "#f00",
                transparent: true,
                opacity: 1,
                //fadeDistance: 500,
                borderWidth: 2,
                sizeAttenuation: false,
                vertexBorderColor: false,
                vertexColors: false,
                vertexSize: false
            }
        });
        points.addTo(app);
        let target = points.symbolObject.material;
        // by是用相对值
        new vjmap3d.Tween(target)
        .by(
            3000,
            { size: 30, opacity: -0.8 },
            {
                easing: vjmap3d.Easings.easeInSine,
                onProgress(target, key, start, end, alpha, reversed) {
                    // @ts-ignore
                    target.needsUpdate = true;
                },
                onComplete() {
                    //  // @ts-ignore
                    // target.size = 15;
                    // // @ts-ignore
                    // target.opacity = 1;
                }
            }
        )
        .yoyoForever() /*.repeatForever()*/
        .start();
    }
    catch (e) {
        console.error(e);
    }
};