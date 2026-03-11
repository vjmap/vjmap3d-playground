
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/custom/01entitycustomcone
        // --Square pyramid (4-sided cone)--
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

 let cones = []
for(let x = 0; x < 5; x++) {
    for(let y = 0; y < 5; y++) {
        cones.push(createConeMesh([-x * 3, 0, -y * 3], {
            color: vjmap3d.randColor(),
            size:  0.5 + vjmap3d.randInt(1, 10) / 100
        }))
    }
}
// Enable bloom on first cone
cones[0].entity.bloom = true

const ui = await app.getConfigPane({ title: "Actions", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Stop rotation (1st)", () => cones[0].stopRotation());
gui.addButton("Start rotation (1st)", () => cones[0].startRotation());
gui.addButton("Stop bounce (1st)", () => cones[0].stopJump());
gui.addButton("Start bounce (1st)", () => cones[0].startJump());
gui.toJson().forEach(c => ui.appendChild(c))
    }
    catch (e) {
        console.error(e);
    }
};