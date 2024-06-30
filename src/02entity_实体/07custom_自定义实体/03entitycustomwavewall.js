
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/03entitycustomwavewall
        // --波动光墙--
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
        
         const createWaveWall = (pt /*[number, number, number] | THREE.Vector3*/, opts /* {
            size?: number;
            height?: number;
         }*/, app /*vjmap3d.App*/) => {
            opts ??= {};
            app ??= vjmap3d.Store.app;
            let model = new THREE.Group(); //声明一个组对象
            // 矩形平面网格模型设置背景透明的png贴图
            let len = opts.size ?? 10;
            let height = opts.height ?? len / 10;
            const geometry = new THREE.CylinderGeometry(len, len, height, 32, 1, true);
            geometry.translate(0, height / 2, 0);
            if (app.isMapMode) {
                // 二维地图模式
                geometry.rotateX(Math.PI / 2.0);
            }
            
            let texture = vjmap3d.ResManager.loadTexture(opts.texture ?? env.assetsPath + "textures/wavewall.png")
            let material = new THREE.MeshLambertMaterial({
                color: opts.color || 0x00ffff,
                map: texture,
                side: THREE.DoubleSide, //两面可见
                transparent: true, //需要开启透明度计算，否则着色器透明度设置无效
                opacity: opts.opacity || 0.5,//整体改变透明度
                depthTest: false,
            });
        
            let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
            model.add(mesh); //网格模型添加到model中
            model.position.copy(vjmap3d.toVector3(pt));
        
            let entity =  vjmap3d.Entity.fromObject3d(model);
            entity.addTo(app);
        
            entity.addAnimationAction({
                duration: 2000,
                repeatForever: true
            }, ({ alpha}) => {
                model.scale.set(alpha, alpha, alpha)
            })
            return entity
        }
        let wall = createWaveWall([0, 0, 0])
        const ui = await app.getConfigPane({ title: "操作", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("移除实体", () => wall.remove())
        gui.toJson().forEach(c => ui.appendChild(c))
    }
    catch (e) {
        console.error(e);
    }
};