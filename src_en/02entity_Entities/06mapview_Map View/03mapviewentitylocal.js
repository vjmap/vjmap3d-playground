
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mapview/03mapviewentitylocal
        // -- Load local map --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left button for rotate (right for pan), same as 2D map usage
})
const tdtVecUrl =
    "https://t3.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66";
const tdtAnnoUrl = `https://t3.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66`;
let provider = new vjmap3d.MapProvider(
    [
        
        {
            url: tdtVecUrl,
        },
        {
            url: tdtAnnoUrl
        }
    ],
    {
        rootTile: [7, 105, 48],
        // Custom map style
        colorFilter: {
            inVerseColor: true,
            bright: 1.2,
            contrast: 1,
            saturation: 1,
            monochromeColor: "#4586b6"
        }
    }
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