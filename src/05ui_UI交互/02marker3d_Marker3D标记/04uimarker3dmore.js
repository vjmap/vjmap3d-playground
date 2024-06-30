
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker3d/04uimarker3dmore
        // --3D标记动画--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        const ui = await app.getConfigPane({ title: "Marker", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("动画Marker", async () => {
            let marker3d = new vjmap3d.Marker3D({
                color: vjmap3d.randHtmlColor(),
                width: 1,
            });
            marker3d.setPosition(vjmap3d.toVector3(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}))))
            marker3d.addTo(app);
            marker3d.setAnimation("MAP_ANIMATION_BOUNCE");
        });
        gui.addButton("RotatingTextBorderMarker3d", async () => {
            // 创建一个缺省的
            let markerEle = new vjmap3d.RotatingTextBorderMarker(
                {
                    position: vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}),
                    text: "3D地图"
                },
                {}
            );
            let marker3d = markerEle.createMarker3d({
                pixelWidth: 120,
                pixelHeight: 50,
                width: 5,
                asSprite: true
            });
            marker3d.addTo(app);
        });
        gui.addButton("BreathingApertureMarker", async () => {
            // 创建一个缺省的
            let markerEle = new vjmap3d.BreathingApertureMarker(
                {
                    position: vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}),
                    text: "3D地图"
                },
                {
                    textColor: vjmap3d.randHtmlColor()
                }
            );
            let marker3d = markerEle.createMarker3d({
                pixelWidth: 120,
                pixelHeight: 50,
                width: 5,
                asSprite: true
            });
            marker3d.addTo(app);
        });
        gui.toJson().forEach(c => ui.appendChild(c));
        
        
    }
    catch (e) {
        console.error(e);
    }
};