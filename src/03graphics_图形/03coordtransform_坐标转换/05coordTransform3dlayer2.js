
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/05coordTransform3dlayer2
        // --做为唯杰地图的三维图层坐标转换2--
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
        // 
        let data = [];
        let markers = [];
        let color1 = new THREE.Color("#0ff");
        let color2 = new THREE.Color("#f00");
        let cnt = 6
        for(let x = 0; x <= cnt; x++) {
            for(let y = 1; y <= cnt; y++) {
                for(let z = 0; z <= cnt; z++) {
                    let px = mapBounds.min.x + x * mapBounds.width() / cnt;
                    let py = mapBounds.min.y + y * mapBounds.height() / cnt;
                    let pz = z * mapBounds.height() / cnt;
                    let worldPos = vjmap3d.toWorld([px, py, pz]);
                    let clr = new THREE.Color().copy(color1).lerp(color2, z / cnt);
                    let div = vjmap3d.DOM.createStyledDiv(`<div class="markertext${z}"></div>`, `.markertext${z}{font-weight:600;color:#${clr.getHexString()};text-align:center;display:block;padding-top:10px;font-size:1.3em;}`);
                    let marker2d = new vjmap3d.Marker2D({
                        element: div,
                        anchor: 'bottom',
                        fadeDistance: 300,
                        allowOverlap: false
                    });
                    marker2d.setPosition(worldPos);
                    marker2d.addTo(app)
                    markers.push(marker2d);
                    //
                    data.push({
                        position: worldPos.toArray(),
                        color: clr,
                        borderColor: clr,
                        size: 10
                    })
                } 
            } 
        }
        let symbol = new vjmap3d.SymbolEntity({ //SymbolEntity
            data: data,
            pixelRaycasting: true, // 像素大小拾取
            style: {
                shape: "circle",
                transparent: true,
                //fadeDistance: 500,
                borderWidth: 2,
                sizeAttenuation: false
            }
        })
        symbol.addTo(app);
        const update = () => {
            for(let m of markers) {
                let position = m.position;
                let cad = vjmap3d.fromWorld(position.toArray())
                let lnglat = map.toLngLat(cad)
                let altitude = vjmap3d.fromDist(position.z, true)
                let scene = vjmap3d.map2dUtils.world2Scene(position)
                let posArr = [];
                posArr.push(`CAD坐标: ${cad[0].toFixed(2)}, ${cad[1].toFixed(2)}, ${cad[2].toFixed(2)}`)
                posArr.push(`经纬度坐标: ${lnglat[0].toFixed(2)}, ${lnglat[1].toFixed(2)}, ${altitude.toFixed(2)}`);
                posArr.push(`世界坐标: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`)
                posArr.push(`场景坐标: ${scene.x.toFixed(2)}, ${scene.y.toFixed(2)}, ${scene.z.toFixed(2)}`)
                m.element.children[0].innerHTML = posArr.join("<br/>")
            }
        }
        update()
        setInterval(() => {
            update()
        }, 3000)
            
    }
    catch (e) {
        console.error(e);
    }
};