
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/04coordTransform3dlayer
        // --做为唯杰地图的三维图层坐标转换--
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
        //
        // 地图对象
        let map = new vjmap.Map({
            container: 'map', // DIV容器ID
            style: svc.rasterStyle(), // 样式，这里是栅格样式
            center: prj.toLngLat(mapBounds.center()), // 设置地图中心点
            zoom: 2, // 设置地图缩放级别
            pitch: 45,
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
        // 在CAD图中心上方创建一个Mesh
        let cadLen = mapBounds.width() / 50; // 取cad图长度的1/50
        let len = vjmap3d.toDist(cadLen); // cad长度转世界坐标长度
        let box = new THREE.BoxGeometry(len, len, len)
        const material = new THREE.MeshStandardMaterial({
            color: "#f00",
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(box, material);
        let cadPos = [mapBounds.center().x, mapBounds.center().y, cadLen]; // mesh在cad中坐标
        //
        let worldPos = vjmap3d.toWorld(cadPos);// cad坐标转世界坐标
        mesh.position.copy(worldPos);
        app.scene.add(mesh);
        // 增加坐标信息
        const showCoordInfo = (event) => {
            let lngLat = event.lngLat;
            let cadPos = map.fromLngLat(lngLat);
            let worldPos = vjmap3d.toWorld([cadPos.x, cadPos.y]); 
            let pixel = map.project(lngLat)
            let info = `CAD图: ${cadPos.x.toFixed(2)},${cadPos.y.toFixed(2)}<br/>`
            info += `经纬度: ${lngLat.lng.toFixed(6)},${lngLat.lat.toFixed(6)}<br/>`
            info += `世界坐标: ${worldPos.x.toFixed(2)},${worldPos.y.toFixed(2)},${worldPos.z.toFixed(2)}<br/>`
            info += `屏幕坐标: ${pixel.x.toFixed(0)},${pixel.y.toFixed(0)}<br/>`
            app.popup2d.setPosition(worldPos);
            app.popup2d.setHTML(info);
        }
        map.on("mousemove", e => showCoordInfo(e))
        
    }
    catch (e) {
        console.error(e);
    }
};