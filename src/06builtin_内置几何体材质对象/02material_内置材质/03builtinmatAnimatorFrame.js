
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/03builtinmatAnimatorFrame
        // --动画帧纹理材质--
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
        let texture = await vjmap3d.ResManager.loadTextureSync(env.assetsPath + "sprites/alien.png", true);
        let mat = new vjmap3d.AnimatorFrameMaterial(
            {
                imageWidth: texture.source.data.width,
                imageHeight: texture.source.data.height,
                rowCount: 1,
                colCount: 16,
                //spriteCount: 16,
                //spriteWidth: texture.source.data.width / 16,
                //spriteHeight: texture.source.data.height,
                curRunFrameCount: app.time.frameCount,
                map: texture,
                side: THREE.DoubleSide,
                transparent: true
            },
            { time: app.commonUniforms.time }
        );
        let geoW = 5, geoH = 5;
        let geom = new THREE.PlaneGeometry(geoW, geoH);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(1, 0, 1);
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};