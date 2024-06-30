
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/133threeWebglshadowmesh
        // --shadowmesh--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmesh
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x222244,
                defaultLights: false
            },
            camera: {
                fov: 55,
                near: 1,
                far: 3000,
                position: [ 0, 2.5, 10   ]
            },
            postProcess: {
                renderTargetOptions: {
                    stencilBuffer: true
                }
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const sunLight = new THREE.DirectionalLight( 'rgb(255,255,255)', 3 );
        let useDirectionalLight = true;
        let arrowHelper1, arrowHelper2, arrowHelper3;
        const arrowDirection = new THREE.Vector3();
        const arrowPosition1 = new THREE.Vector3();
        const arrowPosition2 = new THREE.Vector3();
        const arrowPosition3 = new THREE.Vector3();
        let groundMesh;
        let lightSphere, lightHolder;
        let pyramid, pyramidShadow;
        let sphere, sphereShadow;
        let cube, cubeShadow;
        let cylinder, cylinderShadow;
        let torus, torusShadow;
        const normalVector = new THREE.Vector3( 0, 1, 0 );
        const planeConstant = 0.01; // this value must be slightly higher than the groundMesh's y position of 0.0
        const groundPlane = new THREE.Plane( normalVector, planeConstant );
        const lightPosition4D = new THREE.Vector4();
        let verticalAngle = 0;
        let horizontalAngle = 0;
        let frameTime = 0;
        const TWO_PI = Math.PI * 2;
        
        init();
        
        async function init() {
        
            scene.background = new THREE.Color( 0x0096ff );
        
            scene.add( camera );
         
            sunLight.position.set( 5, 7, - 1 );
            sunLight.lookAt( scene.position );
            scene.add( sunLight );
        
            lightPosition4D.x = sunLight.position.x;
            lightPosition4D.y = sunLight.position.y;
            lightPosition4D.z = sunLight.position.z;
            // amount of light-ray divergence. Ranging from:
            // 0.001 = sunlight(min divergence) to 1.0 = pointlight(max divergence)
            lightPosition4D.w = 0.001; // must be slightly greater than 0, due to 0 causing matrixInverse errors
        
            // YELLOW ARROW HELPERS
            arrowDirection.subVectors( scene.position, sunLight.position ).normalize();
        
            arrowPosition1.copy( sunLight.position );
            arrowHelper1 = new THREE.ArrowHelper( arrowDirection, arrowPosition1, 0.9, 0xffff00, 0.25, 0.08 );
            scene.add( arrowHelper1 );
        
            arrowPosition2.copy( sunLight.position ).add( new THREE.Vector3( 0, 0.2, 0 ) );
            arrowHelper2 = new THREE.ArrowHelper( arrowDirection, arrowPosition2, 0.9, 0xffff00, 0.25, 0.08 );
            scene.add( arrowHelper2 );
        
            arrowPosition3.copy( sunLight.position ).add( new THREE.Vector3( 0, - 0.2, 0 ) );
            arrowHelper3 = new THREE.ArrowHelper( arrowDirection, arrowPosition3, 0.9, 0xffff00, 0.25, 0.08 );
            scene.add( arrowHelper3 );
        
            // LIGHTBULB
            const lightSphereGeometry = new THREE.SphereGeometry( 0.09 );
            const lightSphereMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(255,255,255)' } );
            lightSphere = new THREE.Mesh( lightSphereGeometry, lightSphereMaterial );
            scene.add( lightSphere );
            lightSphere.visible = false;
        
            const lightHolderGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 0.13 );
            const lightHolderMaterial = new THREE.MeshBasicMaterial( { color: 'rgb(75,75,75)' } );
            lightHolder = new THREE.Mesh( lightHolderGeometry, lightHolderMaterial );
            scene.add( lightHolder );
            lightHolder.visible = false;
        
            // GROUND
            const groundGeometry = new THREE.BoxGeometry( 30, 0.01, 40 );
            const groundMaterial = new THREE.MeshLambertMaterial( { color: 'rgb(0,130,0)' } );
            groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
            groundMesh.position.y = 0.0; //this value must be slightly lower than the planeConstant (0.01) parameter above
            scene.add( groundMesh );
        
            // RED CUBE and CUBE's SHADOW
            const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
            const cubeMaterial = new THREE.MeshLambertMaterial( { color: 'rgb(255,0,0)', emissive: 0x200000 } );
            cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
            cube.position.z = - 1;
            scene.add( cube );
        
            cubeShadow = new ShadowMesh( cube );
            scene.add( cubeShadow );
        
            // BLUE CYLINDER and CYLINDER's SHADOW
            const cylinderGeometry = new THREE.CylinderGeometry( 0.3, 0.3, 2 );
            const cylinderMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(0,0,255)', emissive: 0x000020 } );
            cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
            cylinder.position.z = - 2.5;
            scene.add( cylinder );
        
            cylinderShadow = new ShadowMesh( cylinder );
            scene.add( cylinderShadow );
        
            // MAGENTA TORUS and TORUS' SHADOW
            const torusGeometry = new THREE.TorusGeometry( 1, 0.2, 10, 16, TWO_PI );
            const torusMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,0,255)', emissive: 0x200020 } );
            torus = new THREE.Mesh( torusGeometry, torusMaterial );
            torus.position.z = - 6;
            scene.add( torus );
        
            torusShadow = new ShadowMesh( torus );
            scene.add( torusShadow );
        
            // WHITE SPHERE and SPHERE'S SHADOW
            const sphereGeometry = new THREE.SphereGeometry( 0.5, 20, 10 );
            const sphereMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,255,255)', emissive: 0x222222 } );
            sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
            sphere.position.set( 4, 0.5, 2 );
            scene.add( sphere );
        
            sphereShadow = new ShadowMesh( sphere );
            scene.add( sphereShadow );
        
            // YELLOW PYRAMID and PYRAMID'S SHADOW
            const pyramidGeometry = new THREE.CylinderGeometry( 0, 0.5, 2, 4 );
            const pyramidMaterial = new THREE.MeshPhongMaterial( { color: 'rgb(255,255,0)', emissive: 0x440000, flatShading: true, shininess: 0 } );
            pyramid = new THREE.Mesh( pyramidGeometry, pyramidMaterial );
            pyramid.position.set( - 4, 1, 2 );
            scene.add( pyramid );
        
            pyramidShadow = new ShadowMesh( pyramid );
            scene.add( pyramidShadow );
        
            app.signal.onAppUpdate.add(animate);
            
            const ui = await app.getConfigPane()
            ui.appendChild({
                type: "button",
                label: "切换光(DirectionalLight/PointLight)",
                value: () => {
                    lightButtonHandler()
                }
            })
          
        }
        
        function animate(e) {
        
            frameTime = e.deltaTime;
        
            cube.rotation.x += 1.0 * frameTime;
            cube.rotation.y += 1.0 * frameTime;
        
            cylinder.rotation.y += 1.0 * frameTime;
            cylinder.rotation.z -= 1.0 * frameTime;
        
            torus.rotation.x -= 1.0 * frameTime;
            torus.rotation.y -= 1.0 * frameTime;
        
            pyramid.rotation.y += 0.5 * frameTime;
        
            horizontalAngle += 0.5 * frameTime;
            if ( horizontalAngle > TWO_PI )
                horizontalAngle -= TWO_PI;
            cube.position.x = Math.sin( horizontalAngle ) * 4;
            cylinder.position.x = Math.sin( horizontalAngle ) * - 4;
            torus.position.x = Math.cos( horizontalAngle ) * 4;
        
            verticalAngle += 1.5 * frameTime;
            if ( verticalAngle > TWO_PI )
                verticalAngle -= TWO_PI;
            cube.position.y = Math.sin( verticalAngle ) * 2 + 2.9;
            cylinder.position.y = Math.sin( verticalAngle ) * 2 + 3.1;
            torus.position.y = Math.cos( verticalAngle ) * 2 + 3.3;
        
            // update the ShadowMeshes to follow their shadow-casting objects
            cubeShadow.update( groundPlane, lightPosition4D );
            cylinderShadow.update( groundPlane, lightPosition4D );
            torusShadow.update( groundPlane, lightPosition4D );
            sphereShadow.update( groundPlane, lightPosition4D );
            pyramidShadow.update( groundPlane, lightPosition4D );
        
        
        
        }
        
        function lightButtonHandler() {
        
            useDirectionalLight = ! useDirectionalLight;
        
            if ( useDirectionalLight ) {
        
                scene.background.setHex( 0x0096ff );
        
                groundMesh.material.color.setHex( 0x008200 );
                sunLight.position.set( 5, 7, - 1 );
                sunLight.lookAt( scene.position );
        
                lightPosition4D.x = sunLight.position.x;
                lightPosition4D.y = sunLight.position.y;
                lightPosition4D.z = sunLight.position.z;
                lightPosition4D.w = 0.001; // more of a directional Light value
        
                arrowHelper1.visible = true;
                arrowHelper2.visible = true;
                arrowHelper3.visible = true;
        
                lightSphere.visible = false;
                lightHolder.visible = false;
        
        
            } else {
        
                scene.background.setHex( 0x000000 );
        
                groundMesh.material.color.setHex( 0x969696 );
        
                sunLight.position.set( 0, 6, - 2 );
                sunLight.lookAt( scene.position );
                lightSphere.position.copy( sunLight.position );
                lightHolder.position.copy( lightSphere.position );
                lightHolder.position.y += 0.12;
        
                lightPosition4D.x = sunLight.position.x;
                lightPosition4D.y = sunLight.position.y;
                lightPosition4D.z = sunLight.position.z;
                lightPosition4D.w = 0.9; // more of a point Light value
        
                arrowHelper1.visible = false;
                arrowHelper2.visible = false;
                arrowHelper3.visible = false;
        
                lightSphere.visible = true;
                lightHolder.visible = true;
        
              
        
            }
        
        }
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};