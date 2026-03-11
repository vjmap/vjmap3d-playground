
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/03spriteMarkerEntityrender
        // -- Create sprite marker entity with render texture --
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
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
// Draw via render texture
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
            new vjmap3d.render2d.Text({
                style: {
                    x: 40,
                    y: 20,
                    text: 'VJ',
                    fill: "#0ff",
                    font: '30px Arial',
                    verticalAlign: "top",
                    align: "center",
                    //backgroundColor: vjmap3d.render2d.color.random(),
                    //borderColor: vjmap3d.render2d.color.random(),
                    //borderWidth: 2,
                    //borderRadius: 5,
                    // textShadowBlur: 2,
                    // textShadowColor: '#893e95',
                    // textShadowOffsetX: 2,
                    // textShadowOffsetY: 4,
                }
            })
        ]
    }
});
spriteMarker.addTo(app)
// Create another sprite marker that scales with camera
let spriteMarker2 = new vjmap3d.SpriteMarkerEntity(
    {
        position: [2, 0, 1], // Position
        sizeAttenuation: true, // Scale with camera
        width: 1, // World width
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
                new vjmap3d.render2d.Text({
                    style: {
                        x: 40,
                        y: 20,
                        text: 'VJ',
                        fill: "#0ff",
                        font: '30px Arial',
                        verticalAlign: "top",
                        align: "center"
                    }
                })
            ]
        }
    });
    spriteMarker2.addTo(app)
    }
    catch (e) {
        console.error(e);
    }
};