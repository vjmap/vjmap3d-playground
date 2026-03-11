
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker3d/01uimarker3dsingle
        // -- Create Marker3D --
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
let marker3d = new vjmap3d.Marker3D({
    color: vjmap3d.randHtmlColor(),
    width: 1
});
marker3d.setPosition([2, 0, 1]);
marker3d.addTo(app);
marker3d.signal.click.add(() => {
    app.logInfo("click");
});
marker3d.signal.occlusion.add(() => {
    app.logInfo("occlusion");
});
marker3d.signal.elementSizeReady.add(() => {
    app.logInfo("elementSizeReady");
});
marker3d.signal.onAdd.add(() => {
    app.logInfo("onAdd");
});
marker3d.signal.onRemove.add(() => {
    app.logInfo("onRemove");
});
marker3d.getElement().addEventListener("contextmenu", event => {
    // @ts-ignore
    if (event.button != 2) return;// Not right button
    // Prevent default map context menu
    event.preventDefault();
    event.stopPropagation();
    new vjmap3d.ContextMenu({
        event: event,
        theme: "dark", //light
        width: "250px",
        items: [
            {type: 'custom', markup: `
Marker context menu
`},
            {
                label: 'Delete marker',
                onClick: () => {
                    marker3d.remove()
                }
            }
        ]
    });
})


    }
    catch (e) {
        console.error(e);
    }
};