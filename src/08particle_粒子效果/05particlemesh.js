
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/05particlemesh
        // --发射Mesh对象--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        const geo = new vjmap3d.SphubeGeometry(400, 400);
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(1.0, 0.0, 1.0),
            roughness: 1.0,
            metalness: 0.5,
        });
        app.addParticle({
            system: {
                duration: 1,
                looping: true,
                prewarm: true,
                instancingGeometry: geo,
                startLife: new vjmap3d.IntervalValue(2.0, 3.0),
                startSpeed: new vjmap3d.ConstantValue(1),
                startSize: new vjmap3d.ConstantValue(0.1),
                startColor: new vjmap3d.ConstantColor(new THREE.Vector4(1, 0.585716, 0.1691176, 1)),
                startRotation: new vjmap3d.RandomQuatGenerator(),
                worldSpace: true,
        
                emissionOverTime: new vjmap3d.ConstantValue(60),
                emissionBursts: [],
        
                shape: new vjmap3d.ConeEmitter({radius: 0.1, angle: 1}),
                material: mat,
                renderMode: vjmap3d.RenderMode.Mesh,
                startTileIndex: new vjmap3d.ConstantValue(0),
                uTileCount: 10,
                vTileCount: 10,
                renderOrder: 0,
            }
        })
        
            
            
    }
    catch (e) {
        console.error(e);
    }
};