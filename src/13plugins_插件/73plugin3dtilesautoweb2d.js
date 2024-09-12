
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/73plugin3dtilesautoweb2d
        // --自动叠加互联网地图(3D做为唯杰地图的一个图层展示)--
        let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
        // 根据地图范围建立经纬度投影坐标系
        let prj = new vjmap.LnglatProjection();
        // 地图对象
        let map = new vjmap.Map({
            container: 'map', // DIV容器ID
            style: {
                version: svc.styleVersion(),
                glyphs: svc.glyphsUrl(),
                sources: {
                    sat: {
                        type: 'raster',
                        tiles: ["https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1Ijoic2VtaXNwaGVyZSIsImEiOiJja2s1anBrZzMwN3NkMndsOGt6MHo5ajI5In0._vUKnQ57n7UcWsWgOPIEgQ"],
                    }
                },
                layers: [{
                    id: 'sat',
                    type: 'raster',
                    source: 'sat'
                }]
            },
            center: prj.toLngLat([116.3912, 39.9073]),
            zoom: 10,
            pitch: 0,
            antialias: true, // 反锯齿
            renderWorldCopies: false // 不显示多屏地图
        });
        // 关联服务对象和投影对象
        map.attach(svc, prj);
        // 根据地图本身范围缩放地图至全图显示
        //map.fitMapBounds();
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
        //
        let tiles3d = await vjmap3d.loadPlugin3dtiles();
        //
        let url = 'https://vjmap.com/map3d/resources/3dtiles/baowei/tileset.json';
        let meta = await vjmap3d.httpHelper.get(url);
        let data = meta.data;
        let box = data.root.boundingVolume.box;
        let lngLat = tiles3d.get3dTilesLngLatHeight(box, data.root.transform);
        lngLat[2] = 0;// 不考虑高度
        app.map.setCenter(lngLat);
        app.map.setZoom(17);
        let marker = new vjmap.Marker();
        marker.setLngLat(lngLat);
        marker.addTo(app.map)
        const tiles = new tiles3d.TilesRenderer(url, {
            clearRootTransform: true
        }); 
        tiles.manager.addHandler(/\.gltf$/, vjmap3d.LoadManager.gltfLoader);
        tiles.manager.addHandler(/\.drc$/, vjmap3d.LoadManager.dracoLoader);
        tiles.errorTarget = 2;
        tiles.onLoadModel = (scene) => {
            //console.log(" --- scene --- ")
        }
        let offsetParent = new THREE.Group();
        offsetParent.add(tiles.group)
        //
        let ent = vjmap3d.Entity.fromObject3d(offsetParent);
        ent.position.copy(vjmap3d.map2dUtils.projectToWorld(lngLat));
        let scale = 1.0 / vjmap3d.map2dUtils.WorldResolution
        ent.scale.set(scale, scale, scale);
        ent.addTo(app);
        app.signal.onAppAfterUpdate.add(() => {
            tiles.setCamera(app.camera);
            tiles.setResolutionFromRenderer(app.camera, app.renderer);
            tiles.update();
        });
        
        
    }
    catch (e) {
        console.error(e);
    }
};