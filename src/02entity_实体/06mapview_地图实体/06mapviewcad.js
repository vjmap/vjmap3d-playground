
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mapview/06mapviewcad
        // --加载CAD图--加载CAD图并能拾取获取CAD图上的数据
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
        const pickMapObject = async () => {
            let result = await app.pickPoint({
                unprojectOpts: [mapviewEnt.node]
            });
            if (!result.point) return;
            console.log(result);
            let mapPoint = mapviewEnt.worldToMap(result.point);
            // @ts-ignore
            let px = result.event.originalEvent.offsetX,
            // @ts-ignore
            py = result.event.originalEvent.offsetY;
            // 获取一个像素多少地图长度
            let worldPointNextPoint = app.unproject(px, py + 1, [mapviewEnt.node]);
            if (!worldPointNextPoint) return;
            let mapNextPoint = mapviewEnt.worldToMap(worldPointNextPoint);
            let onePixelDist = Math.max(
                Math.abs(mapPoint[0] - mapNextPoint[0]),
                Math.abs(mapPoint[1] - mapNextPoint[1])
            );
            // @ts-ignore
            let queryResult = await svc.pointQueryFeature({
                x: mapPoint[0],
                y: mapPoint[1],
                pixelsize: 5,
                pixelToGeoLength: onePixelDist
            });
            if (queryResult.result?.length > 0) {
                app.logInfo(`拾取的objectid是: ${queryResult.result[0].objectid}`, "success")
            } else {
                app.logInfo(`没有拾取到`, "warn")
            }
        }
        let control = new vjmap3d.ButtonGroupControl({
            buttons: [
                {
                    id: "grid",
                    html: "拾取地图上的对象",
                    title: "拾取地图上的对象",
                    style: {
                        width: "130px"
                    },
                    onclick: async () => {
                        await pickMapObject()
                    }
                }
            ]
        });
        app.addControl(control, "top-right");
        
    }
    catch (e) {
        console.error(e);
    }
};