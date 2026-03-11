
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker2d/04uimarker2dmore
        // -- 2D marker animation --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
const ui = await app.getConfigPane({ title: "Marker", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Animate marker", async () => {
    let marker2d = new vjmap3d.Marker2D({
        color: vjmap3d.randHtmlColor()
    });
    marker2d.setPosition(vjmap3d.toVector3(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}))))
    marker2d.addTo(app);
    marker2d.setAnimation("MAP_ANIMATION_BOUNCE");
});
gui.addButton("RotatingTextBorderMarker2d", async () => {
    // Create default
    let markerEle = new vjmap3d.RotatingTextBorderMarker(
        {
            position: vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}),
            text: "3D map"
        },
        {}
    );
    let marker2d = markerEle.createMarker2d({
        draggable: true
    });
    marker2d.addTo(app);
});
gui.addButton("BreathingApertureMarker", async () => {
    // Create default
    let markerEle = new vjmap3d.BreathingApertureMarker(
        {
            position: vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5}),
            text: "3D map"
        },
        {
            textColor: vjmap3d.randHtmlColor()
        }
    );
    let marker2d = markerEle.createMarker2d({
        draggable: true
    });
    marker2d.addTo(app);
});
gui.toJson().forEach(c => ui.appendChild(c));

    }
    catch (e) {
        console.error(e);
    }
};