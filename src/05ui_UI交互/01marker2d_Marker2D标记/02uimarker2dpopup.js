
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker2d/02uimarker2dpopup
        // --2D标记信息提示框--
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
        for (let i = 0; i < 100; i++) {
            let marker2d = new vjmap3d.Marker2D({
                color: vjmap3d.randHtmlColor(),
                allowOverlap: true,
                fadeDistance: 200,
                occlusionOpacity: 0.2
            });
            marker2d.setPosition(vjmap3d.toVector3(vjmap3d.randPoint3D()));
            marker2d.addTo(app);
            marker2d.setPopup(
                new vjmap3d.Popup2D({
                    backgroundColor: "#A0FFA0",
                    buttonColor: "#f00",
                    closeOnClick: true,
                    closeButton: true
                }).setHTML(`index${i + 1}`)
            );
            // marker2d.togglePopup();
        }
    }
    catch (e) {
        console.error(e);
    }
};