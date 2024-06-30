
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mapview/02mapviewdebugtile
        // --加载调试瓦片图层--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        const tdtImgUrl =
            "https://t2.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66";
        const tdtAnnoUrl = `https://t3.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66`;
        let provider = new vjmap3d.MapProvider(
            [
                {
                    fetchTile: (zoom, x, y) => vjmap3d.MapUtils.fetchDebugTile(zoom, x, y, "#16417C", "#39107B")
                },
                {
                    url: tdtImgUrl,
                    opacity: 0.5
                },
                {
                    url: tdtAnnoUrl
                }
            ]
        );
        
        let mapviewEnt = new vjmap3d.MapViewEntity({
        provider,
        baseScale: 100,
        });
        mapviewEnt.addTo(app);
    }
    catch (e) {
        console.error(e);
    }
};