
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/service/02servicevector
        // --CAD数据查询矢量绘制--
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
        const MAP_DEFAULT_SIZE = 200;
        let res = await svc.openMap({
            mapid: env.exampleMapId, // 地图ID,(请确保此ID已存在，可上传新图形新建ID)
            mapopenway: vjmap.MapOpenWay.GeomRender, // 以几何数据渲染方式打开
            style: vjmap.openMapDarkStyle() // div为深色背景颜色时，这里也传深色背景样式
        });
        if (res.error) {
            showError(res.error);
            return;
        }
        let mapBounds = vjmap.GeoBounds.fromString(res.bounds);
        app.centerOrigin = new THREE.Vector3(mapBounds.center().x, 0, mapBounds.center().y);
        app.scaleOrigin = MAP_DEFAULT_SIZE / mapBounds.width();
        const queryMapData = async () => {
            let cadPrj = new vjmap.GeoProjection(mapBounds);
            res = await svc.conditionQueryFeature({
                condition: `1 == 1`, // 只需要写sql语句where后面的条件内容,字段内容请参考文档"服务端条件查询和表达式查询"
                fields: "",
                includegeom: true, // 是否返回几何数据,为了性能问题，realgeom为false时，如果返回条数大于1.只会返回每个实体的外包矩形，如果条数为1的话，会返回此实体的真实geojson；realgeom为true时每条都会返回实体的geojson
                realgeom: true,
                limit: 1000000 //设置很大,不传的话，默认只能取100条
            }, pt => {
                // 查询到的每个点进行坐标处理回调
                return cadPrj.fromMercator(pt);// 转成cad的坐标
            })
            if (res.error) {
                showError(res.error)
                return
            } else {
                if (res && res.result && res.result.length > 0) {
                    let idx = 0;
                    let features = [];
                    for (let ent of res.result) {
                        if (ent.geom && ent.geom.geometries) {
                            let clr = vjmap.entColorToHtmlColor(ent.color, true);
                            for (let g = 0; g < ent.geom.geometries.length; g++) {
                                features.push({
                                    id: idx++,
                                    type: "Feature",
                                    properties: {
                                        objectid: ent.objectid,
                                        color: clr,
                                        alpha: ent.alpha / 255,
                                        lineWidth: 1,
                                        name: ent.name,
                                        isline: ent.isline,
                                        layerindex: ent.layerindex
                                    },
                                    geometry: ent.geom.geometries[g]
                                })
                            }
                        }
                    }
                    let geom = {
                        type: "FeatureCollection",
                        features: features
                    };
                    return geom;
                }
            }
        }
        let geojson = await queryMapData();
        let dataPolyline = [];
        let dataPolygon = [];
        for (let i = 0; i < geojson?.features.length; i++) {
            let feature = geojson?.features[i];
            if ((feature.geometry.type == "LineString")) {
                dataPolyline.push({
                    coordinates: feature.geometry.coordinates.map(c => vjmap3d.toWorld([c[0], c[1]]).toArray()),
                    color: feature.properties.color,
                    id: feature.id,
                    lineWidth:  1,
                    lineOpacity: feature.properties.alpha,
                    dashSize: 0.2,
                    gapSize: 0.2,
                    dashed: false,
                    objectid: feature.properties.objectid
                })
            } else if ((feature.geometry.type == "Polygon")) {
                dataPolygon.push({
                    coordinates: feature.geometry.coordinates.map(c => c.map(s => {
                        let vec3 = vjmap3d.toWorld([s[0], s[1]]).toArray();
                        return [vec3[0], vec3[2]]
                    })),
                    color: feature.properties.color,
                    id: feature.id,
                    opacity: feature.properties.alpha,
                    objectid: feature.properties.objectid,
                    extrude: {
                        depth: 2
                    }
                })
            }
        }
        let polylines = new vjmap3d.PolylinesEntity({
            data: dataPolyline,
            highlightStyle: {
                vertexColors: false,
                color: 0xFFFF00
            },
        })
        polylines.addTo(app);
        polylines.pointerEvents = true;
        // 
        let hoverVertexPointData = [];
        let hoverVertexSymbol = new vjmap3d.SymbolEntity({
            data: hoverVertexPointData,
            style: {
                size: 13,
                shape: "circle",
                color: "#0f0",
                borderColor: "#f00",
                transparent: true,
                opacity: 1,
                borderWidth: 3,
                sizeAttenuation: false,
                vertexBorderColor: false,
                vertexColors: false,
                vertexSize: false
            }
        });
        hoverVertexSymbol.addTo(app);
        // 
        polylines.on("mouseover", e => {
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = polylines.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData) {
                    // objectid相同的都选上
                    let entities = polylines.getData().filter(item => item.objectid == itemData.objectid)
                    entities.forEach(e => e.id !==undefined &&  polylines.setItemHighlight(e.id, true))
                }
            } else if (e?.intersection?.index !== undefined) {
                let itemData = polylines.getVertexSymbol().getItemDataByPointIndex(e?.intersection?.index);
                if (!itemData) return;
                let pointData = {...itemData};
                pointData.size = (pointData.size ?? 10) + 3;
                // 顶点
                hoverVertexSymbol.setData([
                    pointData
                ])
            }                  
        })
        polylines.on("mouseout", e => {
            polylines.clearHighlight()
            hoverVertexSymbol.setData([])
        })
        // 
        let polygons = new vjmap3d.FillExtrusionsEntity({ // PolygonsEntity
            data: dataPolygon ,
            showVertex: false,
        })
        polygons.addTo(app)
        //
        polygons.pointerEvents = true;
        polygons.on("mouseover", e => {
            console.log(e)
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = polygons.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData) {
                    // objectid相同的都选上
                    let entities = polygons.getData().filter(item => item.objectid == itemData.objectid)
                    entities.forEach(e => e.id !==undefined && polygons.setItemHighlight(e.id, true))
                }
            }
        })
        polygons.on("mouseout", e => {
            polygons.clearHighlight()
        })
        
    }
    catch (e) {
        console.error(e);
    }
};