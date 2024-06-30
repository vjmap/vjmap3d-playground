
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/function/02functionextrude
        // --查询CAD图中的多段线进行拉伸--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        let res = await app.svc.openMap({
            mapid: env.exampleMapId, // 地图ID,(请确保此ID已存在，可上传新图形新建ID)
            mapopenway: vjmap3d.MapOpenWay.GeomRender, // 以几何数据渲染方式打开
            style: vjmap3d.openMapDarkStyle()
        });
        if (res.error) {
            showError(res.error);
            return;
        }
        let provider = new vjmap3d.MapProvider(
            [
                {
                    url: app.svc.rasterTileUrl()
                }
            ],
            {
                transparent: true
            }
        );
        let mapBounds = vjmap3d.GeoBounds.fromString(res.bounds)
        let scale = 100;
        let mapviewEnt = new vjmap3d.MapViewEntity({
            provider,
            baseScale: scale,
            mapBounds: mapBounds.toArray()
        });
        mapviewEnt.addTo(app);
        //
        let cadPrj = new vjmap.GeoProjection(mapBounds);
        let query = await svc.conditionQueryFeature({
            // https://vjmap.com/app/visual/#/query?mapid=sys_zp&version=v1&mapopenway=GeomRender&theme=dark
            condition: ` name = "1" or name = "2"`, // 查询所有的多段线和直线
            fields: "isclosed,points", 
            limit: 100000 //设置很大，相当于把所有的都查出来。不传的话，默认只能取100条
        }, pt => {
            // 查询到的每个点进行坐标处理回调
            return cadPrj.fromMercator(pt);// 转成cad的坐标
        })
        let polylines = [];
        if (query.error) {
            showError(query.error);
            return;
        } else {
            if (query.recordCount > 0) {
                for(let i = 0; i < query.result.length; i++) {
                    let points = query.result[i].points;
                    let lines = points.split(";;");
                    for(let n = 0; n < lines.length; n++) {
                        let line = lines[n].split(";");
                        let pts = []
                        for(let pt of line) {
                            if (!pt) continue;
                            let p = vjmap3d.GeoPoint.fromString(pt);
                            let world = vjmap3d.toWorld([p.x, p.y]);
                            pts.push( [world.x, world.z])
                        }
                        if (pts.length >= 2) {
                            if (query.result[i].isclosed) {
                                // 闭合
                                pts.push(pts[0])
                            }
                            polylines.push(pts);
                        }
                    }
                }
            }
        }
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshStandardMaterial({
           // wireframe: true
        });
        const {position, normal, indices,uv, boundingRect} = vjmap3d.extrudePolyline(polylines, {
            depth: 1,
            lineWidth: 0.02,
            bevelSize: 0.01,
            bevelSegments: 0,
            miterLimit: 2,
        });
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
        //
        const mesh = new THREE.Mesh(geometry, material);
        let waveWallMat = vjmap3d.createFlowGradientMaterial(app, {
            object: mesh,
            lightScale: 0.1,
            circleTime: 1,
            lightColor: 0xffff00,
            color: 0x00ffff,
            topColor: 0x9FFCFD,
            opacity: 1,
            transparent: false,
            //topOpacity: 0.6
        });
        // @ts-ignore
        mesh.material = waveWallMat;
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};