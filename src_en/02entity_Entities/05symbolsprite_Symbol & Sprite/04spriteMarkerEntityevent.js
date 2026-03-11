
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/04spriteMarkerEntityevent
        // -- Create sprite marker entity with render texture and events --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png");
// Create text button 1
let button1 = new vjmap3d.render2d.Text({
    style: {
        x: 40,
        y: 12,
        text: 'View details',
        fill: "#0ff",
        font: '14px Arial',
        verticalAlign: "top",
        align: "center"
    }
})
// Create text button 2
let button2 = new vjmap3d.render2d.Text({
    style: {
        x: 40,
        y: 38,
        text: 'Click to go',
        fill: "#BDFFAB",
        font: '14px Arial',
        verticalAlign: "top",
        align: "center"
    }
})
let spriteMarker = new vjmap3d.SpriteMarkerEntity(
{
    position: [-2, 0, 1], // Position
    sizeAttenuation: false, // Fixed pixel size
    anchorX: "center",  // X alignment
    anchorY: "bottom", // Y alignment
    renderTexture: {
        autoCanvasSize: false,
        canvasWidth: 80, // Pixel width
        canvasHeight: 80, // Pixel height
        sharedCanvas: false,
        elements: [
            new vjmap3d.render2d.Image({
                style: {
                    x: 0,
                    y: 0,
                    image: image,
                    width: 80, // Pixel width
                    height: 80 // Pixel height
                }
            }),
            button1,
            button2
        ]
    }
});
// Handle text button 1 events
button1.on("mouseover", function() {
    button1.attr("style", {
        fill: "#ff0"
    });
    spriteMarker.refreshRenderTexture();
    app.setCursor("pointer")
});
button1.on("mouseout", function() {
    button1.attr("style", {
        fill: "#0ff"
    });
    spriteMarker.refreshRenderTexture();
    app.setCursor("")
});
button1.on("mouseup", function() {
    app.logInfo("You clicked View details", 2000)
});
//
// Handle text button 2 events
button2.on("mouseover", function() {
    button2.attr("style", {
        fill: "#ff0"
    });
    spriteMarker.refreshRenderTexture();
    app.setCursor("pointer")
});
button2.on("mouseout", function() {
    button2.attr("style", {
        fill: "#BDFFAB"
    });
    spriteMarker.refreshRenderTexture();
    app.setCursor("")
});
button2.on("mouseup", function() {
    app.logInfo("You clicked Click to go", 2000)
});
//
// Add spriteMarker to app
spriteMarker.addTo(app);
spriteMarker.pointerEvents = true; // Enable event interaction
// Handle spriteMarker events and dispatch to RenderTexture elements
spriteMarker.on("mousemove", e => {
    spriteMarker.dispatchRenderTextureEvent("mousemove", e?.intersection?.uv);
});
spriteMarker.on("mouseup", e => {
    spriteMarker.dispatchRenderTextureEvent("mouseup", e?.intersection?.uv);
});
spriteMarker.on("mouseout", e => {
    spriteMarker.dispatchRenderTextureEvent("mouseout");
});

    }
    catch (e) {
        console.error(e);
    }
};