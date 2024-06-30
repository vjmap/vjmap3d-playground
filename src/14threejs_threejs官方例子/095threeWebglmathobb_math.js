
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/095threeWebglmathobb
        // --math_obb--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_math_obb
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1,
                far: 1000,
                position: [ 0, 0, 75 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let clock, raycaster, hitbox;
        
        const objects = [], mouse = new THREE.Vector2();
        
        init();
        
        function init() {
        
            clock = new THREE.Clock();
        
            raycaster = new THREE.Raycaster();
        
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x222222, 4 );
            hemiLight.position.set( 1, 1, 1 );
            scene.add( hemiLight );
        
            const size = new THREE.Vector3( 10, 5, 6 );
            const geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
        
            // setup OBB on geometry level (doing this manually for now)
        
            geometry.userData.obb = new OBB();
            geometry.userData.obb.halfSize.copy( size ).multiplyScalar( 0.5 );
        
            for ( let i = 0; i < 100; i ++ ) {
        
                const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x00ff00 } ) );
                object.matrixAutoUpdate = false;
        
                object.position.x = Math.random() * 80 - 40;
                object.position.y = Math.random() * 80 - 40;
                object.position.z = Math.random() * 80 - 40;
        
                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;
        
                object.scale.x = Math.random() + 0.5;
                object.scale.y = Math.random() + 0.5;
                object.scale.z = Math.random() + 0.5;
        
                scene.add( object );
        
                // bounding volume on object level (this will reflect the current world transform)
        
                object.userData.obb = new OBB();
        
                objects.push( object );
        
            }
        
            //
        
            hitbox = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } ) );
        
            document.addEventListener( 'click', onClick );
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function onClick( event ) {
        
            event.preventDefault();
        
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
            raycaster.setFromCamera( mouse, camera );
        
            const intersectionPoint = new THREE.Vector3();
            const intersections = [];
        
            for ( let i = 0, il = objects.length; i < il; i ++ ) {
        
                const object = objects[ i ];
                const obb = object.userData.obb;
        
                const ray = raycaster.ray;
        
                if ( obb.intersectRay( ray, intersectionPoint ) !== null ) {
        
                    const distance = ray.origin.distanceTo( intersectionPoint );
                    intersections.push( { distance: distance, object: object } );
        
                }
        
            }
        
            if ( intersections.length > 0 ) {
        
                // determine closest intersection and highlight the respective 3D object
        
                intersections.sort( sortIntersections );
        
                intersections[ 0 ].object.add( hitbox );
        
            } else {
        
                const parent = hitbox.parent;
        
                if ( parent ) parent.remove( hitbox );
        
            }
        
        }
        
        function sortIntersections( a, b ) {
        
            return a.distance - b.distance;
        
        }
        
        //
        
        function animate() {
        
           
        
            // transform cubes
        
            const delta = clock.getDelta();
        
            for ( let i = 0, il = objects.length; i < il; i ++ ) {
        
                const object = objects[ i ];
        
                object.rotation.x += delta * Math.PI * 0.20;
                object.rotation.y += delta * Math.PI * 0.1;
        
                object.updateMatrix();
                object.updateMatrixWorld();
        
                // update OBB
        
                object.userData.obb.copy( object.geometry.userData.obb );
                object.userData.obb.applyMatrix4( object.matrixWorld );
        
                // reset
        
                object.material.color.setHex( 0x00ff00 );
        
            }
        
            // collision detection
        
            for ( let i = 0, il = objects.length; i < il; i ++ ) {
        
                const object = objects[ i ];
                const obb = object.userData.obb;
        
                for ( let j = i + 1, jl = objects.length; j < jl; j ++ ) {
        
                    const objectToTest = objects[ j ];
                    const obbToTest = objectToTest.userData.obb;
        
                    // now perform intersection test
        
                    if ( obb.intersectsOBB( obbToTest ) === true ) {
        
                        object.material.color.setHex( 0xff0000 );
                        objectToTest.material.color.setHex( 0xff0000 );
        
                    }
        
                }
        
            }
        
           
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};