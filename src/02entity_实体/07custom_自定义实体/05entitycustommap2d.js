
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/05entitycustommap2d
        // --唯杰2D地图效果--唯杰2D地图为底图，vjmap3d做为一个3D图层叠加在上面
        let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
        // 打开地图
        let res = await svc.openMap({
            mapid: env.exampleMapId, // 地图ID
            // @ts-ignore
            mapopenway: vjmap.MapOpenWay.GeomRender, // 以几何数据渲染方式打开
            style: vjmap.openMapLightStyle() // div为深色背景颜色时，这里也传深色背景样式
        })
        if (res.error) {
            // 如果打开出错
            showError(res.error)
            return;
        }
        // 获取地图范围
        let mapBounds = vjmap.GeoBounds.fromString(res.bounds);
        // 根据地图范围建立几何投影坐标系
        let prj = new vjmap.GeoProjection(mapBounds);
        let rasterStyle = svc.rasterStyle()
        // @ts-ignore
        rasterStyle.layers[0].paint = {
            // 自定义地图样式，用深色来代替默认的样式
            "raster-inverse": 1, //  0不反色 1 反色
            "raster-monochrome": "#4586b6", // // 修改地图样式，用纯色代替
            "raster-saturation": 0, // 饱和度  取值 -1 到 1
            "raster-contrast": 0, // 对比度   取值 -1 到 1
        }
        //
        // 地图对象
        let map = new vjmap.Map({
            container: 'map', // DIV容器ID
            style: rasterStyle, // 样式，这里是栅格样式
            center: prj.toLngLat(mapBounds.center()), // 设置地图中心点
            zoom: 2, // 设置地图缩放级别
            pitch: 45,
            antialias: true, // 反锯齿
            renderWorldCopies: false // 不显示多屏地图
        });
        
        //
        // 关联服务对象和投影对象
        map.attach(svc, prj);
        await map.onLoad();
        //
        // 创建3d图层
        let mapLayer = new vjmap3d.MapThreeLayer(map, {
            stat: {
                show: true,
                left: "0"
            }
        });
        map.addLayer(new vjmap.ThreeLayer({ context: mapLayer }))
        let app = mapLayer.app;
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
        
        // 创建立体光墙
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
        
        // 创建波动光墙
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
        
        
        
        // 获取地图范围
        let mapExtent = vjmap.GeoBounds.fromString(res.bounds);
        
        // 查询要绘制的光墙线坐标
        let query = await svc.conditionQueryFeature({
            condition: `objectid='9BE'`, // 只需要写sql语句where后面的条件内容,字段内容请参考文档"服务端条件查询和表达式查询"
            // 查询所有文字(包括单行文本，多行文本、块注记文字，属性文字) 具体类型数字参考文档"服务端条件查询和表达式查询-支持的cad实体类型"
            // condition: `name='12' or name='13' or name='26' or name='27'`,
            fields: ""
        })
        let linePoints = [];
        if (query.error) {
            showError(query.error)
            return
        } else {
            if (query.recordCount > 0) {
                let points = query.result[0].points; // 得到点坐标序列
                linePoints = points.split(";").map(p => vjmap.GeoPoint.fromString(p));
                // 闭合
                linePoints.push(linePoints[0]);
                linePoints = linePoints.map(p => vjmap3d.toWorld(p).toArray())
                createWall(linePoints, {
                    height: vjmap3d.toDist(mapExtent.width() / 20)
                }, app)
            }
        }
        
        let c = mapExtent.center();
        linePoints[0] = vjmap3d.toWorld(c).toArray();
        
        for(let i = 0; i < linePoints.length; i++) {
            if (i != 0) {
                // 增加从中点至坐标点的飞线
                vjmap3d.createFlyline({
                    source: [linePoints[0][0], linePoints[0][1], 0],
                    target: [linePoints[i][0], linePoints[i][1], 0],
                    count: 1000,
                    range: 200,
                    height: vjmap3d.toDist(mapExtent.width() / 5),
                    color: vjmap.randomColor(),
                    color2: vjmap.randomColor(),
                    size: 5000
                }, app);
            }
        
            let pt = linePoints[i];
            pt.z = 1000;
            // 创建一个四棱锥
            createConeMesh(pt, {
                size: 10240,
                color: vjmap.randomColor()
            }, app);
        }
        
        // 创建一个波动光圈
        createWaveWall(linePoints[0], {
            color: "#ffff00",
            size: vjmap3d.toDist(mapExtent.width() / 10),
            height: vjmap3d.toDist(mapExtent.width() / 20),
        }, app);
        
        // 增加烟花背景
        for(let i = 0; i < 20; i++) {
            let pt = vjmap3d.toWorld(mapExtent.randomPoint().toArray());
            vjmap3d.createFlyline({
                source: [pt.x, pt.y, 0],
                target: [pt.x, pt.y, vjmap3d.toDist(mapExtent.width() / 10)],
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