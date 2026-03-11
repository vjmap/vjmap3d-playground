
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/04polygontexture
        // --Polygon entity material--Create material for polygon
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})

let data = [];
data.push({
    coordinates: [[7, 0, 3], [-4, -2, -2], [-5, 0, 3], [6, -2, 7]],
    color: "#f00"
})

let elements = [];
let canvasWidth = 1600;
let canvasHeight = 800; // Ratio based on coordinate aspect

let img = await vjmap3d.loadImage(env.assetsPath + "textures/diffuse.jpg")
var pattern = new vjmap3d.render2d.Pattern(img, 'repeat');
elements.push(new vjmap3d.render2d.Rect({
    shape: {
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight
    },
    style: {
        fill: pattern // "#16417C" // Background pattern or solid color
    }
}))
elements.push(new vjmap3d.render2d.Text({
    style: {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        text: "VJMAP",
        fill: "#EB3324",
        font: canvasWidth / 15 + 'px Arial',
        verticalAlign: "middle",
        align: "center",
    }
}))
// Use as 2D render texture
let renderTexture = vjmap3d.createRender2dTexture({
    autoCanvasSize: false, // Whether to auto size from content
    sharedCanvas: true, // Share one canvas for efficiency
    canvasWidth: canvasWidth, // Pixel width, based on base map
    canvasHeight: canvasHeight, // Pixel height, based on base map
    elements: elements,
});
let texture = renderTexture.texture();

texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
// Flip Y
texture.flipY = false;
// Set texture center
texture.center.set(0.5, 0.5)
// Set rotation angle
texture.rotation = 30 * Math.PI / 180;
let polygons = new vjmap3d.PolygonsEntity({ //PolygonsEntity
    data: data,
    style: {
        vertexColors: false,
        map: texture
    },
    highlightStyle: {
        color: "#0D2547" // Highlight color
    }
})
polygons.addTo(app)

//
polygons.pointerEvents = true; // Enable event interaction
polygons.on("mouseover", e => {
    if (e?.intersection?.faceIndex !== undefined) {
        let itemData = polygons.getItemDataByFaceIndex(e?.intersection?.faceIndex);
        if (itemData && itemData.id) polygons.setItemHighlight(itemData.id, true)
    }
})
polygons.on("mouseout", e => {
    polygons.clearHighlight()
})
    }
    catch (e) {
        console.error(e);
    }
};