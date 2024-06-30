
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/01resourceloader
        // --资源加载--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/soldier.glb", {
            splitSubEntity: true,
            position: [-3, 0, 0],
            rotation: [0, -Math.PI, 0],
            anchor: "front-bottom-right"
        });
        ent.addTo(app);
        // 
        // 如果有依赖项的资源加载，可通过下面的方式
         // 例如如果是obj，需要先加载mtl文件
         let materials = await vjmap3d.ResManager.loadRes(env.assetsPath + "models/table/table.mtl", true);
         materials.preload();
         let loader = vjmap3d.LoadManager.getLoader("obj");
         // 设置材质
         loader.setMaterials(materials);
         let ent2 = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/table/table.obj", {
            size: 3,
            splitSubEntity: true,
            useCache: true
        });
        ent2.position.set(3, 0, 0)
        ent2.addTo(app);
        //  取消设置材质
        vjmap3d.LoadManager.getLoader("obj")?.setMaterials(null);
    }
    catch (e) {
        console.error(e);
    }
};