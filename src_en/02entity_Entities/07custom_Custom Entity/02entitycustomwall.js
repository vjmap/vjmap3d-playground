
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/02entitycustomwall
        // --3D light wall--
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true }, // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
const createWall = (pts /*[number, number][]*/, opts /*{
    height?: number;
    flyline?: boolean;
    texture1?: string;
    repeatX?: number;
    repeatY?: number;
    color1?: THREE.ColorRepresentation;
    offsetX?: number;
    offsetY?: number;
    texture2?: string;
    color2?: THREE.ColorRepresentation;
    opacity?: number
 }*/, app /*vjmap3d.App*/) => {
    opts ??= {};
    let model = new THREE.Group(); // Group for 3D scene
    let c = [...pts];
    let geometry = new THREE.BufferGeometry(); // Empty geometry
    let posArr = [];
    let uvrr = [];
    let h = opts.height || 1; // Wall extrusion height
    app ??= vjmap3d.Store.app;
    for (let i = 0; i < c.length - 1; i++) {
        if (app.isMapMode) {
            // 2D map mode
            posArr.push(c[i][0], c[i][1], 0, c[i + 1][0], c[i + 1][1], 0, c[i + 1][0], c[i + 1][1], h);
            posArr.push(c[i][0], c[i][1], 0, c[i + 1][0], c[i + 1][1], h, c[i][0], c[i][1], h);
        } else {
            posArr.push(c[i][0], 0, c[i][1], c[i + 1][0], 0, c[i + 1][1], c[i + 1][0], h, c[i + 1][1]);
            posArr.push(c[i][0], 0, c[i][1], c[i + 1][0], h, c[i + 1][1], c[i][0], h, c[i][1]);
        }
        

        // Unwrap points: x 0..1, rectangles fill texture
        uvrr.push(i / c.length, 0, i / c.length + 2 / c.length, 0, i / c.length + 2 / c.length, 1);
        uvrr.push(i / c.length, 0, i / c.length + 2 / c.length, 1, i / c.length, 1);
    }

    // Set geometry position attribute
    geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(posArr), 3);
    // Set geometry uv attribute
    geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(uvrr), 2);
    geometry.computeVertexNormals();

    if (opts.flyline !== false) {
        let texture = vjmap3d.ResManager.loadTexture(opts.texture1 ?? env.assetsPath + "textures/wall1.png");

        // RepeatWrapping for texture
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.x = opts.repeatX || 3;// X repeat
        texture.repeat.y = opts.repeatY || 3;// Y repeat

    
        let material = new vjmap3d.FlowMaterial({
            color: new THREE.Color(opts.color1 || 0xffff00),
            uvOffset: new THREE.Vector2(opts.offsetX || -1, opts.offsetY || 0),
            uvScale: new THREE.Vector2(texture.repeat.x, texture.repeat.y), // repeat
            map: texture,
            side: THREE.DoubleSide, // Double-sided
            transparent: true, // Enable for shader transparency
        }, {time: app.commonUniforms.time});
        let mesh = new THREE.Mesh(geometry, material); // Mesh
        model.add(mesh);
    }

    let texture2 =  vjmap3d.ResManager.loadTexture(opts.texture2 ??  env.assetsPath + "textures/wall2.png");

    let material2 = new THREE.MeshLambertMaterial({
        color: opts.color2 || 0x00ffff,
        map: texture2,
        side: THREE.DoubleSide, // Double-sided
        transparent: true, // Enable for shader transparency
        opacity: opts.opacity || 0.5,// Overall opacity
        depthTest: false,
    });
    let mesh2 = new THREE.Mesh(geometry, material2); // Mesh
    model.add(mesh2);

    let entity =  vjmap3d.Entity.fromObject3d(model);
    entity.addTo(app);
    return entity
}

createWall([
    [-5, -5],
    [-5, 5],
    [5, 5],
    [5, -5],
    [-5, -5]
])
    }
    catch (e) {
        console.error(e);
    }
};