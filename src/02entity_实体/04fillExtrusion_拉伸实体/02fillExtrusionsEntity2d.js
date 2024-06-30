
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/fillExtrusion/02fillExtrusionsEntity2d
        // --拉伸实体(2D地图模式)--创建、修改、删除拉伸,基于2D地图(3D做为一个图层叠加)
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
        let data = [];
        // 外面边界的cad图上点坐标
        let edge = [
        	[587653761.9404196, 3103856376.721289],
        	[587602251.0620328, 3103887684.472128],
        	[587616705.4171646, 3103910542.4372025],
        	[587668345.3998574, 3103879913.002372]
        ].map(p => vjmap3d.toWorld(p).toArray());
        // 里面洞1的cad图上点坐标
        let holes1 = [
        	[587611243.649386, 3103892845.733727],
        	[587618986.3449678, 3103888191.3405075],
        	[587624099.183289, 3103897555.098504],
        	[587616962.944966, 3103901844.930998]
        ].map(p => vjmap3d.toWorld(p).toArray());
        // 里面洞2的cad图上点坐标
        let holes2 = [
        	[587648133.0725995, 3103883387.5836215],
        	[587642667.2109047, 3103873956.0132804],
        	[587650162.938667, 3103869450.080676],
        	[587655761.2825799, 3103878763.0610456]
        ].map(p => vjmap3d.toWorld(p).toArray());
        //
        let bounds = map.getMapExtent();
        let depth = vjmap3d.toDist(bounds.width() / 40);// 取地图范围的宽度的1/40距离做为拉伸高度
        data.push({
            coordinates: [edge, holes1, holes2],
            color: "#FFFE91", // 底部颜色
            color2: "#0ff", // 顶部颜色
            showBorder: true, // 显示边框线
            borderColor: "#39107B",// 边框线底部颜色
            borderColor2: "#EA3FF7",// 边框线顶部颜色
            baseHeight: depth / 5, // 基准高度
            extrude: {
                depth: depth,
                steps: 1,
                bevelEnabled: false
            }
        })
        //
        let fillExtrusions = new vjmap3d.FillExtrusionsEntity({ //FillExtrusionsEntity
            data: data,
            // showBorder: true, 可以全局控制是否显示边框线
            highlightStyle: {
                color: "#777" // 高亮时颜色
            }
        })
        fillExtrusions.addTo(app)
        //
        fillExtrusions.pointerEvents = true; // 允许事件交互
        fillExtrusions.on("mouseover", e => {
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = fillExtrusions.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData && itemData.id) fillExtrusions.setItemHighlight(itemData.id, true)
            }
        })
        fillExtrusions.on("mouseout", e => {
            fillExtrusions.clearHighlight()
        })
        //
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'checkbox',
                label: '显示顶点',
                getValue: () => fillExtrusions.isShowVertex(),
                setValue: v => {
                    fillExtrusions.setShowVertex(v)
                }
            },
            {
                type: 'checkbox',
                label: '显示边框线',
                value: false,
                onChange: ({ value } )=> {
                    let mod = fillExtrusions.getModule(vjmap3d.FillExtrusionsModule);
                    mod.showBorder = value;
                    mod.setData(mod.getData());
                }
            },
            {
                type: 'button',
                label: '增加一个拉伸',
                value: ()=> {
                    data.push({
                        coordinates: [mapBounds.randomPoint().toArray(),mapBounds.randomPoint().toArray(),mapBounds.randomPoint().toArray()].map(p => vjmap3d.toWorld(p).toArray()),
                        color: vjmap3d.randColor(),
                        extrude: {
                            depth: vjmap3d.toDist(bounds.width() * (Math.random() + 0.1) / 60),
                            steps: 1,
                            bevelEnabled: false
                        }
                    })
                    fillExtrusions.setData(data)
                }
            },
            {
                type: 'button',
                label: '修改第一个拉伸颜色',
                value: ()=> {
                    if (data.length > 0) {
                        data[0].color = vjmap3d.randColor()
                    }
                    fillExtrusions.setData(data)
                }
            },
            {
                type: 'button',
                label: '删除第一个拉伸',
                value: ()=> {
                    if (data.length == 0) {
                        return
                    }
                    data.splice(0, 1)
                    fillExtrusions.setData(data)
                }
            }
        ]
        cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};