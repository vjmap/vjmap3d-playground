
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/85pluginPhysicscreate
        // --物理引擎--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        await app.enablePhysicsEngine();
        app.addPhysicsGround();
        const boxGeo1 = new THREE.BoxGeometry(1, 1, 1);
        const boxMat1 = new THREE.MeshStandardMaterial({
            color: 0xffffff * Math.random()
        });
        const meshBox = new THREE.Mesh(boxGeo1, boxMat1);
        meshBox.position.set(5, 5, 3) 
        let entBox = new vjmap3d.MeshEntity(meshBox);
        entBox.addTo(app);
        entBox.add(vjmap3d.PhysicsModule, {
            type: vjmap3d.ShapeType2.BOX
        })
        //
        const sphereGeo = new THREE.SphereGeometry(1);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: 0xff0000
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-5, 1, 3) 
        let ent= new vjmap3d.MeshEntity(mesh);
        ent.addTo(app);
        let mod = ent.add(vjmap3d.PhysicsModule, {
            type: vjmap3d.ShapeType2.SPHERE
        })
        let sphereBody = mod.getBody();
        let CANNON = app.physicsEngine;
        const radius = 1
        const impulse = new CANNON.Vec3(8, 0, 0)
        const topPoint = new CANNON.Vec3(0, radius, 0)
        sphereBody.applyImpulse(impulse, topPoint)
        sphereBody.linearDamping = 0.3
        sphereBody.angularDamping = 0.3
        //
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff
        });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.set(0, 1, 3) 
        let boxEnt = new vjmap3d.MeshEntity(boxMesh);
        boxEnt.addTo(app);
        let boxMod = boxEnt.add(vjmap3d.PhysicsModule, {
            type: vjmap3d.ShapeType2.BOX,
            body: {
                isTrigger: true,
                mass: 0
            }
        })
        let triggerBody = boxMod.getBody();
        // It is possible to run code on the exit/enter of the trigger.
        triggerBody.addEventListener('collide', (event) => {
            if (event.body === sphereBody) {
                let object = sphereBody.entity?.node;
                // @ts-ignore
                object.material.color = new THREE.Color(0x00ff00)
                console.log('The sphere entered the trigger!', event)
            }
        })
        app.physicsWorld.addEventListener('endContact', (event) => {
            if (
            (event.bodyA === sphereBody && event.bodyB === triggerBody) ||
            (event.bodyB === sphereBody && event.bodyA === triggerBody)
            ) {
                let object = sphereBody.entity?.node;
                // @ts-ignore
                object.material.color = new THREE.Color(0xff0000)
                console.log('The sphere exited the trigger!', event)
            }
        })
        
        
    }
    catch (e) {
        console.error(e);
    }
};