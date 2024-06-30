
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/211threephysicsJoltInstancing
        // --physics_jolt_instancing--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#physics_jolt_instancing
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 50,
                near: 0.1,
                far: 100,
                position: [ - 1, 1.5, 2 ],
                lookAt: [0, 0.5, 0]
            },
            control: {
                target: [0, 0.5, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let physics, position;
        
        let boxes, spheres;
        
        init();
        
        async function init() {
        
            physics = await JoltPhysics();
            position = new THREE.Vector3();
        
            scene.background = new THREE.Color( 0x666666 );
        
            const hemiLight = new THREE.HemisphereLight();
            scene.add( hemiLight );
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.position.set( 5, 5, 5 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.zoom = 2;
            scene.add( dirLight );
        
            const floor = new THREE.Mesh(
                new THREE.BoxGeometry( 10, 5, 10 ),
                new THREE.ShadowMaterial( { color: 0x444444 } )
            );
            floor.position.y = - 2.5;
            floor.receiveShadow = true;
            floor.userData.physics = { mass: 0 };
            scene.add( floor );
        
            //
        
            const material = new THREE.MeshLambertMaterial();
        
            const matrix = new THREE.Matrix4();
            const color = new THREE.Color();
        
            // Boxes
        
            const geometryBox = new THREE.BoxGeometry( 0.075, 0.075, 0.075 );
            boxes = new THREE.InstancedMesh( geometryBox, material, 400 );
            boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
            boxes.castShadow = true;
            boxes.receiveShadow = true;
            boxes.userData.physics = { mass: 1 };
            scene.add( boxes );
        
            for ( let i = 0; i < boxes.count; i ++ ) {
        
                matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
                boxes.setMatrixAt( i, matrix );
                boxes.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );
        
            }
        
            // Spheres
        
            const geometrySphere = new THREE.IcosahedronGeometry( 0.05, 4 );
            spheres = new THREE.InstancedMesh( geometrySphere, material, 400 );
            spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
            spheres.castShadow = true;
            spheres.receiveShadow = true;
            spheres.userData.physics = { mass: 1 };
            scene.add( spheres );
        
            for ( let i = 0; i < spheres.count; i ++ ) {
        
                matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
                spheres.setMatrixAt( i, matrix );
                spheres.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );
        
            }
        
            physics.addScene( scene );
        
            //
            renderer.shadowMap.enabled = true;
        
            setInterval( () => {
        
                let index = Math.floor( Math.random() * boxes.count );
        
                position.set( 0, Math.random() + 1, 0 );
                physics.setMeshPosition( boxes, position, index );
        
                //
        
                index = Math.floor( Math.random() * spheres.count );
        
                position.set( 0, Math.random() + 1, 0 );
                physics.setMeshPosition( spheres, position, index );
        
            }, 1000 / 60 );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};