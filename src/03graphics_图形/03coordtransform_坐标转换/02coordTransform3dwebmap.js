
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/02coordTransform3dwebmap
        // --三维互联网地图做为底图场景坐标转换--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        const tdtVecUrl =
            "https://t3.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66";
        const tdtAnnoUrl = `https://t3.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66`;
        let provider = new vjmap3d.MapProvider(
            [
                {
                    url: tdtVecUrl
                },
                {
                    url: tdtAnnoUrl
                }
            ],
            {
                rootTile: [7, 105, 48]
            }
        );
        let mapviewEnt = new vjmap3d.MapViewEntity({
            provider,
            baseScale: 100,
        });
        mapviewEnt.addTo(app);
        // 增加坐标信息
        const showCoordInfo = (pixel) => {
            let screen = pixel;
            let worldPositon = app.unproject(screen.x, screen.y);
            let ndc = app.screenToNdc(screen.x, screen.y);
            let lngLat = mapviewEnt.worldToLngLat(worldPositon);
            let localPositon = mapviewEnt.lngLatToLocal(lngLat);
            // let localPositon = mapviewEnt.node.worldToLocal(worldPositon.clone()); // 与上面的写法等同
            let info = `经纬度: ${lngLat[0].toFixed(5)},${lngLat[1].toFixed(5)}<br/>`
            info += `世界坐标: ${worldPositon.x.toFixed(1)},${worldPositon.y.toFixed(1)},${worldPositon.z.toFixed(1)}<br/>`
            info += `屏幕坐标: ${screen.x.toFixed(1)},${screen.y.toFixed(1)}<br/>`
            info += `NDC坐标: ${ndc.x.toFixed(1)},${ndc.y.toFixed(1)}<br/>`
            info += `地图局部坐标: ${localPositon.x.toFixed(6)},${localPositon.y.toFixed(6)},${localPositon.z.toFixed(6)}<br/>`
            app.popup2d.setPosition(worldPositon);
            app.popup2d.setHTML(info);
        }
        app.signal.onMouseMove.add(e => showCoordInfo(vjmap3d.eventXY(e)))
    }
    catch (e) {
        console.error(e);
    }
};