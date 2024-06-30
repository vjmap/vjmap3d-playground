
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/027threeWebglInstancingMorph
        // --instancing_morph--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_instancing_morph
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x99DDFF,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 100, 
                far: 10000,
                position: [ 0, 0 , 0 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh, mixer, dummy;
        
        const offset = 5000;
        
        const timeOffsets = new Float32Array( 1024 );
        
        for ( let i = 0; i < 1024; i ++ ) {
        
            timeOffsets[ i ] = Math.random() * 3;
        
        }
        
        const clock = new THREE.Clock( true );
        
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x99DDFF, 5000, 10000 );
        
            const light = new THREE.DirectionalLight( 0xffffff, 1 );
        
            light.position.set( 200, 1000, 50 );
        
            light.castShadow = true;
        
            light.shadow.camera.left = - 5000;
            light.shadow.camera.right = 5000;
            light.shadow.camera.top = 5000;
            light.shadow.camera.bottom = - 5000;
            light.shadow.camera.far = 2000;
        
            light.shadow.bias = - 0.01;
        
            light.shadow.camera.updateProjectionMatrix();
        
            scene.add( light );
        
            const hemi = new THREE.HemisphereLight( 0x99DDFF, 0x669933, 1 / 3 );
        
            scene.add( hemi );
        
            const ground = new THREE.Mesh(
                new THREE.PlaneGeometry( 1000000, 1000000 ),
                new THREE.MeshStandardMaterial( { color: 0x669933, depthWrite: true } )
            );
        
            ground.rotation.x = - Math.PI / 2;
        
            ground.receiveShadow = true;
        
            scene.add( ground );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            vjmap3d.ResManager.loadRes( assetsPath +'models/gltf/Horse.glb', false).then( ( glb ) => {
        
                dummy = glb.scene.children[ 0 ];
        
                mesh = new THREE.InstancedMesh( dummy.geometry, dummy.material, 1024 );
        
                mesh.castShadow = true;
        
                for ( let x = 0, i = 0; x < 32; x ++ ) {
        
                    for ( let y = 0; y < 32; y ++ ) {
        
                        dummy.position.set( offset - 300 * x + 200 * Math.random(), 0, offset - 300 * y );
        
                        dummy.updateMatrix();
        
                        mesh.setMatrixAt( i, dummy.matrix );
        
                        mesh.setColorAt( i, new THREE.Color( `hsl(${Math.random() * 360}, 50%, 66%)` ) );
        
                        i ++;
        
                    }
        
        
                }
        
                scene.add( mesh );
        
                mixer = new THREE.AnimationMixer( glb.scene );
        
                const action = mixer.clipAction( glb.animations[ 0 ] );
        
                action.play();
        
            } );
        
            
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.VSMShadowMap;
            //
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        function render() {
        
            const time = clock.getElapsedTime();
        
            const r = 3000;
            camera.position.set( Math.sin( time / 10 ) * r, 1500 + 1000 * Math.cos( time / 5 ), Math.cos( time / 10 ) * r );
            camera.lookAt( 0, 0, 0 );
        
            if ( mesh ) {
        
                for ( let i = 0; i < 1024; i ++ ) {
        
                    mixer.setTime( time + timeOffsets[ i ] );
        
                    mesh.setMorphAt( i, dummy );
        
                }
        
                mesh.morphTexture.needsUpdate = true;
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};