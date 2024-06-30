
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/02particleloadfromfile
        // --从文件中加载粒子效果--
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
        let particle = await app.loadParticle(env.assetsPath + "json/magic_zone.json");
        let particle2 = await app.loadParticle(env.assetsPath + "json/magic_zone.json", {
            // 可对加载的数据进行修改
            onData: data => {
                data.object.children[0].children[0].ps.startColor.color = {r: 0,g: 1,b: 1,a: 1};
                data.object.children[1].children[0].ps.startColor.color = { r: 0,g: 1,b: 1,a: 0.1764706};
                data.object.children[2].ps.startColor.color = { r: 0, g: 1, b: 1, a: 1 };
            },
            position: [-5, 0, 3],
            scale: [1.5, 1.5, 1.5]
        });
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};