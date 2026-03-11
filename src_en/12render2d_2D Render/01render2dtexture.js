
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/01render2dtexture
        // -- 2D drawing engine --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left rotate, right pan
})
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg2.png");
let elements = [];
// Add image as background
elements.push(new vjmap3d.render2d.Image({
    style: {
        x: 0,
        y: 0,
        image: image,
        width: 270, // Pixel width
        height: 250 // Pixel height
    }
}))
elements.push(new vjmap3d.render2d.Text({
    style: {
        x: 138,
        y: 100,
        text: "VJMAP",
        fill: "#0ff",
        font: '50px Arial',
        verticalAlign: "middle",
        align: "center",
    }
}))
// Use as 2D render texture
let renderTexture = vjmap3d.createRender2dTexture({
    autoCanvasSize: false, // Auto size from content
    sharedCanvas: true, // Share canvas for performance
    canvasWidth: 270, // Pixel width
    canvasHeight: 250, // Pixel height
    elements: elements,
});
let geoW = 2, geoH = 2;
let geom = new THREE.PlaneGeometry(geoW, geoH);
let mat = new THREE.MeshStandardMaterial({
    map: renderTexture.texture(),
    transparent: true
})
let mesh = new THREE.Mesh(geom, mat);
mesh.position.set(0, 1, 0);
app.scene.add(mesh);
// Use via canvas
let canvas = document.createElement("canvas");
canvas.width = 270;
canvas.height = 250;
let render = vjmap3d.render2d.init(canvas);
let group = new vjmap3d.render2d.Group();
render.add(group);
for(let n = 0; n < elements.length; n++) {
    group.add(elements[n])
}
let marker = new vjmap3d.Marker2D({
    element: canvas,
    anchor: "bottom"
})
marker.setPosition(-5, 0, 3);
marker.addTo(app);

    }
    catch (e) {
        console.error(e);
    }
};