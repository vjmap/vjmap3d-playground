
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/01entitycustomcone
        // --四棱锥--
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
        // 创建一个四棱锥
        const createConeMesh = (co /*[number, number, number] | THREE.Vector3*/, opts /*{
            size?: number;
            height?: number;
            color?: THREE.ColorRepresentation;
            rotation?: boolean;
            rotationAxis?: THREE.Vector3;
            rotationSpeed?: number;
            jumpHeightScale?: number;
            jumpDuration?: number;
         }*/, app) => {
            opts ??= {};
                let size = opts.size || 0.5;
                let height = opts.height || size * 4; //棱锥高度
                // 圆锥体几何体API(ConeGeometry)圆周方向四等分实现四棱锥效果
                let geometry = new THREE.ConeGeometry(size, height, 4);
                // 可以根据需要旋转到特定角度
                // geometry.rotateX(Math.PI);
                app ??= vjmap3d.Store.app;
                if (app.isMapMode) {
                    geometry.rotateX(-Math.PI / 2);
                    geometry.translate(0, 0, height / 2);
                } else {
                    geometry.rotateX(Math.PI);
                    geometry.translate(0, height / 2, 0);
                }
                // MeshBasicMaterial MeshLambertMaterial
                let material = new THREE.MeshLambertMaterial({
                    color: opts.color || 0xffcc00,
                });
                let mesh = new THREE.Mesh(geometry, material);
        
                // // 棱锥上在叠加一个棱锥
                let mesh2 = mesh.clone();
                if (app.isMapMode) {
                    //2维地图模式
                    mesh2.scale.z = 0.5;
                    mesh2.position.z = height * (1 + mesh2.scale.z);
                } else {
                    //3维模式
                    mesh2.scale.y = 0.5;
                    mesh2.position.y = height * (1 + mesh2.scale.y);
                }
                mesh2.rotateX(Math.PI);
                mesh.add(mesh2);
        
                let entity =  vjmap3d.Entity.fromObject3d(mesh);
                let pt = vjmap3d.toVector3(co);
                entity.position.copy(pt);
                entity.addTo(app);
                // 旋转
                let mod = entity.addModule(vjmap3d.BehaviorModule);
                let rotateId = "";
                const startRotation = () => {
                    // 开始旋转
                    stopRotation();
                    rotateId = mod.addBehavior(vjmap3d.RotationBehavior.fromJSON({
                        axis: opts.rotationAxis ?? (app.isMapMode ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0)),
                        speed: opts.rotationSpeed ?? 2,
                        resetWhenFinalize: true // 结束时复位成原来角度
                    }))
                }
                const stopRotation = () => {
                    // 停止旋转
                    if (rotateId) {
                        mod.removeBehaviorById(rotateId);
                        rotateId = ""
                    }
                }
                if (opts.rotation !== false) {
                    startRotation()
                }
        
                // 跳动
                opts.jumpHeightScale ??= 0.6;
                let jumpHeight = height * opts.jumpHeightScale;
                let anim;
                const startJump = () => {
                    if (anim) {
                        stopJump()
                    }
                    // 开始跳动
                    anim = vjmap3d.animation({
                        //from:  mesh.position,
                        //to: new THREE.Vector3(mesh.position.x, mesh.position.y + dumpHeight, mesh.position.z),
                        duration: opts.jumpDuration ?? 1000,
                        onProgress(target, key, start, end, alpha, reversed) {
                            if (app.isMapMode) {
                                mesh.position.z = pt.z + alpha * jumpHeight
                            } else {
                                mesh.position.y = pt.y + alpha * jumpHeight
                            }
                        },
                        yoyoForever: true
                    })
                }
                const stopJump = () => {
                    // 停止跳动
                    if (!anim) return;
                    app.tweenManager.stopById(anim.id)
                    anim = null;
                    mesh.position.copy(pt);
                }
                if (jumpHeight != 0) {
                    startJump()
                }
                return {
                    entity,
                    startRotation,
                    stopRotation,
                    startJump,
                    stopJump
                };
            }
        
         let cones = []
        for(let x = 0; x < 5; x++) {
            for(let y = 0; y < 5; y++) {
                cones.push(createConeMesh([-x * 3, 0, -y * 3], {
                    color: vjmap3d.randColor(),
                    size:  0.5 + vjmap3d.randInt(1, 10) / 100
                }))
            }
        }
        // 把第一个设置成辉光
        cones[0].entity.bloom = true
        
        const ui = await app.getConfigPane({ title: "操作", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("第1个停止旋转", () => cones[0].stopRotation());
        gui.addButton("第1个开始旋转", () => cones[0].startRotation());
        gui.addButton("第1个停止跳动", () => cones[0].stopJump());
        gui.addButton("第1个开始跳动", () => cones[0].startJump());
        gui.toJson().forEach(c => ui.appendChild(c))
    }
    catch (e) {
        console.error(e);
    }
};