
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/06spriteMarkerEntitybatch2d
        // --批量创建精灵标记实体(2D地图模式)--
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
        let bounds = map.getGeoBounds(0.4);
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
        let imgEle = new vjmap3d.render2d.Image({
            style: {
                x: 0,
                y: 0,
                image: image,
                width: 80, // 像素宽，这里是图片像素宽高定的
                height: 80 // 像素高，这里是图片像素宽高定的
            }
        })
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                let positon = vjmap3d.toWorld([bounds.min.x + i * bounds.width() / 20, bounds.min.y + j * bounds.height() / 20]);
                let idx = `${j * 20 + i}`
                let spriteMarker = new vjmap3d.SpriteMarkerEntity(
                {
                    position: positon, // 位置 
                    sizeAttenuation: false, // 固定像素大小，不随相机变化
                    allowOverlap: false,
                    anchorX: "center",  // x对齐方式
                    anchorY: "bottom", // y对齐方式
                    renderTexture: {
                        autoCanvasSize: true,
                        sharedCanvas: true, // 提高效率共享一个canvas
                        canvasWidth: 80, // 像素宽，这里是根据底图的像素宽高定的
                        canvasHeight: 80, // 像素高，这里是根据底图的像素宽高定的
                        elements: [
                            imgEle,
                            new vjmap3d.render2d.Text({
                                style: {
                                    x: 40,
                                    y: 20,
                                    text: idx,
                                    fill: vjmap3d.render2d.color.random(),
                                    font: '30px Arial',
                                    verticalAlign: "top",
                                    align: "center"
                                }
                            })
                        ]
                    }
                });
                spriteMarker.idx = idx;
                // 增加spriteMarker至应用
                spriteMarker.addTo(app);
                spriteMarker.add(vjmap3d.EventModule, {
                    hoverHighlight: false,
                    hoverSelect: false,
                    hoverHtmlText: `ID: ${idx}`,
                    popupOptions: {
                        anchor: "bottom",
                        offset: [0, -80]
                    },
                    popupAsEntityChild: false, // popup如果直接加到实体上，因为实体group位置在地图中心点，所以不能把popup做为他的子实体加入。或者用下面的语句加入实体中的SpriteMarker中去
                    //popupCallback: (entity, popup, isHover) => entity.node.children[0],
                    hoverCallback: (ent, isHover) => {
                        let opacity = isHover ? 0.6 : 1.0;
                        if (spriteMarker.SpriteMarker.material.opacity != opacity) {
                            spriteMarker.SpriteMarker.material.opacity = opacity
                        }
                    },
                    clickCallback: (ent, isClick) => {
                        if (!isClick) return
                        app.logInfo("您点击的ID是: " + idx, 2000)
                    }
                });
        
        }
        
        
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};