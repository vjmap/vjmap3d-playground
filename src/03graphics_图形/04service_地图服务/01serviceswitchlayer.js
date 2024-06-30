
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/service/01serviceswitchlayer
        // --CAD图层切换--
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
        // 获取cad图层
        let layers = svc.getMapLayers();
        const ui = await app.getConfigPane({ title: "关闭图层", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        for(let n = 0; n < layers.length; n++) {
            gui.add(layers[n], "isOff").label(layers[n].name).onChange(async () => {
                await svc.cmdSwitchLayers(layers.reduce((sum, val) => {
                    if (!val.isOff) {
                        sum.push(val.name);
                    }
                    return sum;
                }, []))
                let newProvider = new vjmap3d.MapProvider(
                    [
                        {
                            url: app.svc.rasterTileUrl()
                        }
                    ],
                    {
                        transparent: true
                    }
                );
                mapviewEnt.setProvider(newProvider)
            })
        }
        gui.toJson().forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};