
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/028threeWebglinstancingDynamic
        // --instancing_dynamic--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_instancing_dynamic
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 0.1, 
                far: 100,
                position: [ 0, 0 , 0 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
        const count = Math.pow( amount, 3 );
        const dummy = new THREE.Object3D();
        
        init();
        
        function init() {
            camera.position.set( amount * 0.9, amount * 0.9, amount * 0.9 );
            camera.lookAt( 0, 0, 0 );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.BufferGeometryLoader();
            loader.load(assetsPath +  'models/json/suzanne_buffergeometry.json', function ( geometry ) {
        
                geometry.computeVertexNormals();
                geometry.scale( 0.5, 0.5, 0.5 );
        
                const material = new THREE.MeshNormalMaterial();
                // check overdraw
                // let material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.1, transparent: true } );
        
                mesh = new THREE.InstancedMesh( geometry, material, count );
                mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
                scene.add( mesh );
        
                //
        
                const gui = new GUI();
                gui.add( mesh, 'count', 0, count );
        
            } );
        
            //
            app.signal.onAppUpdate.add(render);
        
        }
        
        function render() {
        
            if ( mesh ) {
        
                const time = Date.now() * 0.001;
        
                mesh.rotation.x = Math.sin( time / 4 );
                mesh.rotation.y = Math.sin( time / 2 );
        
                let i = 0;
                const offset = ( amount - 1 ) / 2;
        
                for ( let x = 0; x < amount; x ++ ) {
        
                    for ( let y = 0; y < amount; y ++ ) {
        
                        for ( let z = 0; z < amount; z ++ ) {
        
                            dummy.position.set( offset - x, offset - y, offset - z );
                            dummy.rotation.y = ( Math.sin( x / 4 + time ) + Math.sin( y / 4 + time ) + Math.sin( z / 4 + time ) );
                            dummy.rotation.z = dummy.rotation.y * 2;
        
                            dummy.updateMatrix();
        
                            mesh.setMatrixAt( i ++, dummy.matrix );
        
                        }
        
                    }
        
                }
        
                mesh.instanceMatrix.needsUpdate = true;
                mesh.computeBoundingSphere();
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};