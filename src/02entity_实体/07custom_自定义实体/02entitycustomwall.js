
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/02entitycustomwall
        // --立体光墙--
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
        const createWall = (pts /*[number, number][]*/, opts /*{
            height?: number;
            flyline?: boolean;
            texture1?: string;
            repeatX?: number;
            repeatY?: number;
            color1?: THREE.ColorRepresentation;
            offsetX?: number;
            offsetY?: number;
            texture2?: string;
            color2?: THREE.ColorRepresentation;
            opacity?: number
         }*/, app /*vjmap3d.App*/) => {
            opts ??= {};
            let model = new THREE.Group(); //声明一个组对象，用来添加加载成功的三维场景
            let c = [...pts];
            let geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
            let posArr = [];
            let uvrr = [];
            let h = opts.height || 1; // 围墙拉伸高度
            app ??= vjmap3d.Store.app;
            for (let i = 0; i < c.length - 1; i++) {
                if (app.isMapMode) {
                    // 二维地图模式
                    posArr.push(c[i][0], c[i][1], 0, c[i + 1][0], c[i + 1][1], 0, c[i + 1][0], c[i + 1][1], h);
                    posArr.push(c[i][0], c[i][1], 0, c[i + 1][0], c[i + 1][1], h, c[i][0], c[i][1], h);
                } else {
                    posArr.push(c[i][0], 0, c[i][1], c[i + 1][0], 0, c[i + 1][1], c[i + 1][0], h, c[i + 1][1]);
                    posArr.push(c[i][0], 0, c[i][1], c[i + 1][0], h, c[i + 1][1], c[i][0], h, c[i][1]);
                }
                
        
                // 所有点展开  x方向从零到1   所有点生成的矩形铺满一张纹理贴图
                uvrr.push(i / c.length, 0, i / c.length + 2 / c.length, 0, i / c.length + 2 / c.length, 1);
                uvrr.push(i / c.length, 0, i / c.length + 2 / c.length, 1, i / c.length, 1);
            }
        
            // 设置几何体attributes属性的位置position属性
            geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(posArr), 3);
            // 设置几何体attributes属性的位置uv属性
            geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvrr), 2);
            geometry.computeVertexNormals();
        
            if (opts.flyline !== false) {
                let texture = vjmap3d.ResManager.loadTexture(opts.texture1 ?? env.assetsPath + "textures/wall1.png");
        
                // 设置阵列模式为 RepeatWrapping
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.repeat.x = opts.repeatX || 3;// x方向阵列
                texture.repeat.y = opts.repeatY || 3;// y方向阵列
        
            
                let material = new vjmap3d.FlowMaterial({
                    color: new THREE.Color(opts.color1 || 0xffff00),
                    uvOffset: new THREE.Vector2(opts.offsetX || -1, opts.offsetY || 0),
                    uvScale: new THREE.Vector2(texture.repeat.x, texture.repeat.y), // repeat
                    map: texture,
                    side: THREE.DoubleSide, //两面可见
                    transparent: true, //需要开启透明度计算，否则着色器透明度设置无效
                }, {time: app.commonUniforms.time});
                let mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
                model.add(mesh);
            }
        
            let texture2 =  vjmap3d.ResManager.loadTexture(opts.texture2 ??  env.assetsPath + "textures/wall2.png");
        
            let material2 = new THREE.MeshLambertMaterial({
                color: opts.color2 || 0x00ffff,
                map: texture2,
                side: THREE.DoubleSide, //两面可见
                transparent: true, //需要开启透明度计算，否则着色器透明度设置无效
                opacity: opts.opacity || 0.5,//整体改变透明度
                depthTest: false,
            });
            let mesh2 = new THREE.Mesh(geometry, material2); //网格模型对象Mesh
            model.add(mesh2);
        
            let entity =  vjmap3d.Entity.fromObject3d(model);
            entity.addTo(app);
            return entity
        }
        
        createWall([
            [-5, -5],
            [-5, 5],
            [5, 5],
            [5, -5],
            [-5, -5]
        ])
    }
    catch (e) {
        console.error(e);
    }
};