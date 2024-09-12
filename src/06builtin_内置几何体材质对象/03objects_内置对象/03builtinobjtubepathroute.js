
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/03builtinobjtubepathroute
        // --三维管道路线定义--在三维管道定义路线显示
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            control: {
                initState: {
                    cameraTarget: new THREE.Vector3(191, 37, 20),
        			cameraPosition: new THREE.Vector3(171, 51, 11),
                }
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        const outMaterial = new THREE.MeshPhongMaterial({
            color: '#73FBFD',
            side: THREE.DoubleSide
          })
          const innerMaterial = new THREE.MeshPhongMaterial({
            color: '#73FBFD',
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
          })
        
          
        // 从图中获取三维坐标数据，也可以直接给坐标
        let mapid = "sys_tube"
        let style = await app.svc.createStyle({
            backcolor: 0,
        }, mapid, "v1")
        let tubeDatas = [];
        let query = await app.svc.conditionQueryFeature({
            mapid: mapid,
            version: "v1",
            layer: style.stylename,
            geom: true,
            condition: `name='2' or name='4'`,// 查找有高程值的多段线和三维多段线
            fields: "objectid,points,elevation",
            limit: 100000
        });
        let results = query.result;
        let box3d = new THREE.Box3();
        let allPts = []
        
        let lineDatas = []
        if (results && results.length > 0) {
            for(let n = 0; n < results.length; n++) {
                let linePoints =  results[n].points.split(";").map(p => vjmap3d.GeoPoint.fromString(p));
                // @ts-ignore
                linePoints = linePoints.map(p => vjmap3d.toVector3([p.x, p.z ?? results[n].elevation ?? 0, p.y]));
        
                lineDatas.push(linePoints)
        
                 // 记录下所有点坐标，用来计算范围
                allPts.push(...linePoints)
        
                tubeDatas.push({
                    paths: linePoints,
                    name:  results[n].objectid
                })
            }
        }
        
        
        // 获取数据范围
        box3d.setFromPoints(allPts)
        
        // 计算中心点
        let center = box3d.min.clone().add(box3d.max).multiplyScalar(0.5);
        
        // 因为业务数据有可能坐标很大或很小，所以对整个应用根据坐标范围对坐标进行一个平移和缩放
        app.centerOrigin = new THREE.Vector3(center.x, box3d.min.y, center.z);
        // 根据最大距离，缩放至宽度为500左右
        let dist = Math.max(box3d.max.x - box3d.min.x, box3d.max.z - box3d.min.z);
        app.scaleOrigin = 500 / dist;
        
        // 根据设置的平移和缩放量，重新计算下坐标
        for(let p of tubeDatas ) {
            p.paths = p.paths.map(t => vjmap3d.toWorld(t.toArray()).toArray())
        }
        
        /** 如果只是纯为了计算最短路径，不想加载模型，可用下面代码 */
        /*
        let patop = vjmap3d.buildPathTubeTopo(tubeDatas)
        let sp = vjmap3d.findShortestPath([-39, 3, 72], 
            [-8, 2, -23],
            patop.inputData.map((d) => ({
                points: d.paths
            }))
        )
        */
        
        
        let opts = {
            data: tubeDatas,
            nodeRadius: 0.5,
            innerSideMaterial: innerMaterial,
            outerMaterial: outMaterial,
            sect: {
                shape: "rectNoTop"
            },
            topoStrategy: 'nodeIntersect'
        }
        let pathTube = new vjmap3d.PathTubeEntities(opts);
        pathTube.addTo(app);
        // 显示边框线
        pathTube.showEdgeLine({
            bottom: false,
            top: true,
            center: false,
            color: "#73FBFD"
        })
        
        // 设置捕捉点颜色设置
        app.setEnvConfig("snapSymbolColor", "#EF88BE") // 捕捉点填充颜色
        app.setEnvConfig("snapBorderColor", "#EA3680") // 捕捉点边框颜色
        app.setEnvConfig("snapShape", "circle") // 捕捉点形状
        
        const fixCoordinate = (coordinates) => {
            for(let c of coordinates) {
                c[1] += 0.5 // 把坐标稍弄高点，要不刚好的话会遮住
            }
            return coordinates
        }
        const drawLine = async () => {
            // 先获取中心点的坐标做为捕捉点
            let lines = pathTube.getEdgeLines({
                center: true,
                bottom: false,
                top: false
            })
            let pts = await app.actionDrawLineSting({
               unprojectOpts: true, // 用场景数据进行坐标投影
               snapDrawPoint: false, // 是否捕捉绘制的点
               snapDrawLayerPoint:false, // 是否捕捉绘制图层上面的点
               snapStylePointOpacity: 1, // 如果想显示出捕捉点，可以设置透明度不为0
               snapStylePixelSize: 5, // 如果不好捕捉，可改大点 捕捉时像素大小，默认5 
               disableUnProjectMenu: true, // 禁止弹出默认的屏幕空间至世界坐标的投影右键菜单设置
               snapData: lines.flat()
            });
        
            if (pts.isCancel) return;
            let tailLineEntity = new vjmap3d.TrailLineEntity({
                positions: fixCoordinate(pts.data.coordinates),        //以xz轴为平面
                width:10,                   //线宽
                placeLength:15,             //图标放置的长度
                placeSpace:10,              //图标放置间隔
                iconUrl: env.assetsPath + "textures/arrow.png",        //图标
                speed:2,        //速度
                smooth: true,
                isAnimate:true  //是否需要动画
            })
            tailLineEntity.addTo(app);
        }
        
        // 拾取两点生成线路
        const twoPointPath = async () => {
             // 先获取中心点的坐标做为捕捉点
             let lines = pathTube.getEdgeLines({
                center: true,
                bottom: false,
                top: false
            })
            const pickPoint = async (tip) => {
                if (tip) app.logInfo(tip)
                let pts = await app.actionDrawPoint({
                    unprojectOpts: true, // 用场景数据进行坐标投影
                    snapDrawPoint: false, // 是否捕捉绘制的点
                    snapDrawLayerPoint:false, // 是否捕捉绘制图层上面的点
                    snapStylePointOpacity: 1, // 如果想显示出捕捉点，可以设置透明度不为0
                    snapStylePixelSize: 5, // 如果不好捕捉，可改大点 捕捉时像素大小，默认5 
                    disableUnProjectMenu: true, // 禁止弹出默认的屏幕空间至世界坐标的投影右键菜单设置
                    snapData: lines.flat()
                });
                if (pts.isCancel) return;
                return pts.data.position
            }
            let p1 = await pickPoint("请拾取起点")
            if (!p1) return;
            // 先把起点显示下
            let marker2d = new vjmap3d.Marker2D({
              color: "#ffff00",
            });
            marker2d.setPosition(p1);
            marker2d.addTo(app);
        
            let p2 = await pickPoint("请拾取终点")
            if (!p2) return;
            marker2d.remove(); // 移除起点标识点
        
            let sp = vjmap3d.findShortestPath(p1, p2,
                pathTube.inputData.map((d) => ({
                    points: d.paths
                }))
            )
            let tailLineEntity = new vjmap3d.TrailLineEntity({
                // @ts-ignore
                positions: fixCoordinate(sp.route),        //以xz轴为平面
                width:10,                   //线宽
                placeLength:15,             //图标放置的长度
                placeSpace:10,              //图标放置间隔
                iconUrl: env.assetsPath + "textures/arrow.png",        //图标
                speed:2,        //速度
                smooth: true,
                isAnimate:true  //是否需要动画
            })
            tailLineEntity.addTo(app);
           
        }
        
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("手动绘制线路", () => {
           drawLine()
        })
        gui.addButton("拾取两点生成线路", () => {
            twoPointPath()
         })
        gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};