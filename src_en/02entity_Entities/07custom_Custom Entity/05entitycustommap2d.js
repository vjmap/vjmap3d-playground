
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/05entitycustommap2d
        // --VJMap 2D map effect--VJMap 2D as base, vjmap3d as 3D layer on top
let svc = new vjmap.Service(env.serviceUrl, env.accessToken)
// Open map
let res = await svc.openMap({
    mapid: env.exampleMapId, // Map ID
    // @ts-ignore
    mapopenway: vjmap.MapOpenWay.GeomRender, // Open with geometry render mode
    style: vjmap.openMapLightStyle() // Use dark style if div has dark background
})
if (res.error) {
    // If open fails
    showError(res.error)
    return;
}
// Get map bounds
let mapBounds = vjmap.GeoBounds.fromString(res.bounds);
// Create geo projection from bounds
let prj = new vjmap.GeoProjection(mapBounds);
let rasterStyle = svc.rasterStyle()
// @ts-ignore
rasterStyle.layers[0].paint = {
    // Custom map style (dark)
    "raster-inverse": 1, // 0=normal 1=invert
    "raster-monochrome": "#4586b6", // Monochrome color
    "raster-saturation": 0, // Saturation -1 to 1
    "raster-contrast": 0, // Contrast -1 to 1
}
//
// Map instance
let map = new vjmap.Map({
    container: 'map', // DIV container id
    style: rasterStyle, // Raster style
    center: prj.toLngLat(mapBounds.center()), // Set map center
    zoom: 2, // Set map zoom level
    pitch: 45,
    antialias: true, // Antialias
    renderWorldCopies: false // Do not show world copies
});

//
// Attach service and projection
map.attach(svc, prj);
await map.onLoad();
//
// Create 3D layer
let mapLayer = new vjmap3d.MapThreeLayer(map, {
    stat: {
        show: true,
        left: "0"
    }
});
map.addLayer(new vjmap.ThreeLayer({ context: mapLayer }))
let app = mapLayer.app;
// Create a square pyramid
const createConeMesh = (co /*[number, number, number] | THREE.Vector3*/, opts /*{
    size?: number;
    height?: number;
    color?: THREE.ColorRepresentation;
    rotation?: boolean;
    rotationAxis?: THREE.Vector3;
    rotationSpeed?: number;
    jumpHeightScale?: number;
    jumpDuration?: number;
 }*/, app) => {
    opts ??= {};
    let size = opts.size || 0.5;
    let height = opts.height || size * 4; // Pyramid height
    // ConeGeometry with 4 segments for square pyramid
    let geometry = new THREE.ConeGeometry(size, height, 4);
    // Rotate to desired angle if needed
    // geometry.rotateX(Math.PI);
    app ??= vjmap3d.Store.app;
    if (app.isMapMode) {
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(0, 0, height / 2);
    } else {
        geometry.rotateX(Math.PI);
        geometry.translate(0, height / 2, 0);
    }
    // MeshBasicMaterial MeshLambertMaterial
    let material = new THREE.MeshLambertMaterial({
        color: opts.color || 0xffcc00,
    });
    let mesh = new THREE.Mesh(geometry, material);

    // // Stack another pyramid on top
    let mesh2 = mesh.clone();
    if (app.isMapMode) {
        // 2D map mode
        mesh2.scale.z = 0.5;
        mesh2.position.z = height * (1 + mesh2.scale.z);
    } else {
        // 3D mode
        mesh2.scale.y = 0.5;
        mesh2.position.y = height * (1 + mesh2.scale.y);
    }
    mesh2.rotateX(Math.PI);
    mesh.add(mesh2);

    let entity =  vjmap3d.Entity.fromObject3d(mesh);
    let pt = vjmap3d.toVector3(co);
    entity.position.copy(pt);
    entity.addTo(app);
    // Rotation
    let mod = entity.addModule(vjmap3d.BehaviorModule);
    let rotateId = "";
    const startRotation = () => {
        // Start rotation
        stopRotation();
        rotateId = mod.addBehavior(vjmap3d.RotationBehavior.fromJSON({
            axis: opts.rotationAxis ?? (app.isMapMode ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0)),
            speed: opts.rotationSpeed ?? 2,
            resetWhenFinalize: true // Reset angle when finished
        }))
    }
    const stopRotation = () => {
        // Stop rotation
        if (rotateId) {
            mod.removeBehaviorById(rotateId);
            rotateId = ""
        }
    }
    if (opts.rotation !== false) {
        startRotation()
    }

    // Bounce
    opts.jumpHeightScale ??= 0.6;
    let jumpHeight = height * opts.jumpHeightScale;
    let anim;
    const startJump = () => {
        if (anim) {
            stopJump()
        }
        // Start bounce
        anim = vjmap3d.animation({
            //from:  mesh.position,
            //to: new THREE.Vector3(mesh.position.x, mesh.position.y + dumpHeight, mesh.position.z),
            duration: opts.jumpDuration ?? 1000,
            onProgress(target, key, start, end, alpha, reversed) {
                if (app.isMapMode) {
                    mesh.position.z = pt.z + alpha * jumpHeight
                } else {
                    mesh.position.y = pt.y + alpha * jumpHeight
                }
            },
            yoyoForever: true
        })
    }
    const stopJump = () => {
        // Stop bounce
        if (!anim) return;
        app.tweenManager.stopById(anim.id)
        anim = null;
        mesh.position.copy(pt);
    }
    if (jumpHeight != 0) {
        startJump()
    }
    return {
        entity,
        startRotation,
        stopRotation,
        startJump,
        stopJump
    };
}

// Create 3D light wall
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

// Create wave light wall
const createWaveWall = (pt /*[number, number, number] | THREE.Vector3*/, opts /* {
    size?: number;
    height?: number;
 }*/, app /*vjmap3d.App*/) => {
    opts ??= {};
    app ??= vjmap3d.Store.app;
    let model = new THREE.Group(); // Group
    // Plane with transparent PNG texture
    let len = opts.size ?? 10;
    let height = opts.height ?? len / 10;
    const geometry = new THREE.CylinderGeometry(len, len, height, 32, 1, true);
    geometry.translate(0, height / 2, 0);
    if (app.isMapMode) {
        // 2D map mode
        geometry.rotateX(Math.PI / 2.0);
    }
    
    let texture = vjmap3d.ResManager.loadTexture(opts.texture ?? env.assetsPath + "textures/wavewall.png")
    let material = new THREE.MeshLambertMaterial({
        color: opts.color || 0x00ffff,
        map: texture,
        side: THREE.DoubleSide, // Double-sided
        transparent: true, // Enable for shader transparency
        opacity: opts.opacity || 0.5,// Overall opacity
        depthTest: false,
    });

    let mesh = new THREE.Mesh(geometry, material); // Mesh
    model.add(mesh); // Add to model
    model.position.copy(vjmap3d.toVector3(pt));

    let entity =  vjmap3d.Entity.fromObject3d(model);
    entity.addTo(app);

    entity.addAnimationAction({
        duration: 2000,
        repeatForever: true
    }, ({ alpha}) => {
        model.scale.set(alpha, alpha, alpha)
    })
    return entity
}



// Get map bounds
let mapExtent = vjmap.GeoBounds.fromString(res.bounds);

// Query wall line coordinates to draw
let query = await svc.conditionQueryFeature({
    condition: `objectid='9BE'`, // SQL WHERE clause; see "Server condition query" docs for fields
    // Query text entities; see "Supported CAD entity types" for type numbers
    // condition: `name='12' or name='13' or name='26' or name='27'`,
    fields: ""
})
let linePoints = [];
if (query.error) {
    showError(query.error)
    return
} else {
    if (query.recordCount > 0) {
        let points = query.result[0].points; // Point sequence
        linePoints = points.split(";").map(p => vjmap.GeoPoint.fromString(p));
        // Close loop
        linePoints.push(linePoints[0]);
        linePoints = linePoints.map(p => vjmap3d.toWorld(p).toArray())
        createWall(linePoints, {
            height: vjmap3d.toDist(mapExtent.width() / 20)
        }, app)
    }
}

let c = mapExtent.center();
linePoints[0] = vjmap3d.toWorld(c).toArray();

for(let i = 0; i < linePoints.length; i++) {
    if (i != 0) {
        // Add fly line from center to point
        vjmap3d.createFlyline({
            source: [linePoints[0][0], linePoints[0][1], 0],
            target: [linePoints[i][0], linePoints[i][1], 0],
            count: 1000,
            range: 200,
            height: vjmap3d.toDist(mapExtent.width() / 5),
            color: vjmap.randomColor(),
            color2: vjmap.randomColor(),
            size: 5000
        }, app);
    }

    let pt = linePoints[i];
    pt.z = 1000;
    // Create a square pyramid
    createConeMesh(pt, {
        size: 10240,
        color: vjmap.randomColor()
    }, app);
}

// Create a wave ring
createWaveWall(linePoints[0], {
    color: "#ffff00",
    size: vjmap3d.toDist(mapExtent.width() / 10),
    height: vjmap3d.toDist(mapExtent.width() / 20),
}, app);

// Add firework-style background
for(let i = 0; i < 20; i++) {
    let pt = vjmap3d.toWorld(mapExtent.randomPoint().toArray());
    vjmap3d.createFlyline({
        source: [pt.x, pt.y, 0],
        target: [pt.x, pt.y, vjmap3d.toDist(mapExtent.width() / 10)],
        count: 1000,
        range: 500,
        height: 0,
        color: vjmap.randomColor(),
        color2: vjmap.randomColor(),
        speed: 1,
        size: 3,
        opacity: 1.0,
    }, app);
}
    }
    catch (e) {
        console.error(e);
    }
};