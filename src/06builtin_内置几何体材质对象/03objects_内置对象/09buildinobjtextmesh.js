
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/09buildinobjtextmesh
        // --文本Mesh--
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
        const textParams = {
            color: '#00ffff',
            text: `春天是一年四季中最美丽的季节之一，也是最富有生机的季节。
            在这个季节里，大自然给我们带来了很多惊喜和愉悦。
            在这个季节里，我喜欢去公园里散步，欣赏那里的美景。
            The end 。`,
            fontSize: 2,
            maxWidth: 40,
            lineHeight: 1,
            font: env.assetsPath + 'fonts/gb2312.ttf',
            onPreloadEnd: () => {
              // console.log('loaded')
            },
        }
        let text = await vjmap3d.createTextMesh(textParams);
        let mesh = text.mesh;
        app.scene.add(mesh)
    }
    catch (e) {
        console.error(e);
    }
};