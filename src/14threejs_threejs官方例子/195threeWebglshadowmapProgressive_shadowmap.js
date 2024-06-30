
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/195threeWebglshadowmapProgressive
        // --shadowmap_progressive--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmap_progressive
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1,
                far: 1000,
                position: [0, 100, 200 ]
            },
            control: {
                maxPolarAngle:  Math.PI / 1.5,
                minDistance: 100,
                maxDistance: 500,
                target: [ 0, 100, 0 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        // ShadowMap + LightMap Res and Number of Directional Lights
        const shadowMapRes = 512, lightMapRes = 1024, lightCount = 8;
        let controls = app.cameraControl, control, control2,
            object = new THREE.Mesh(), lightOrigin = null, progressiveSurfacemap;
        const dirLights = [], lightmapObjects = [];
        const params = { 'Enable': true, 'Blur Edges': true, 'Blend Window': 200,
                            'Light Radius': 50, 'Ambient Weight': 0.5, 'Debug Lightmap': false };
        init();
        createGUI();
        
        function init() {
        
            // renderer
            renderer.shadowMap.enabled = true;
        
            // camera
            camera.name = 'Camera';
        
            // scene
            scene.background = new THREE.Color( 0x949494 );
            scene.fog = new THREE.Fog( 0x949494, 1000, 3000 );
        
            // progressive lightmap
            progressiveSurfacemap = new ProgressiveLightMap( renderer, lightMapRes );
        
            // directional lighting "origin"
            lightOrigin = new THREE.Group();
            lightOrigin.position.set( 60, 150, 100 );
            scene.add( lightOrigin );
        
            // transform gizmo
            control = new TransformControls( camera, renderer.domElement );
            control.addEventListener( 'dragging-changed', ( event ) => {
        
                controls.enabled = ! event.value;
        
            } );
            control.attach( lightOrigin );
            scene.add( control );
        
            // create 8 directional lights to speed up the convergence
            for ( let l = 0; l < lightCount; l ++ ) {
        
                const dirLight = new THREE.DirectionalLight( 0xffffff, 1.0 / lightCount );
                dirLight.name = 'Dir. Light ' + l;
                dirLight.position.set( 200, 200, 200 );
                dirLight.castShadow = true;
                dirLight.shadow.camera.near = 100;
                dirLight.shadow.camera.far = 5000;
                dirLight.shadow.camera.right = 150;
                dirLight.shadow.camera.left = - 150;
                dirLight.shadow.camera.top = 150;
                dirLight.shadow.camera.bottom = - 150;
                dirLight.shadow.mapSize.width = shadowMapRes;
                dirLight.shadow.mapSize.height = shadowMapRes;
                lightmapObjects.push( dirLight );
                dirLights.push( dirLight );
        
            }
        
            // ground
            const groundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry( 600, 600 ),
                new THREE.MeshPhongMaterial( { color: 0xffffff, depthWrite: true } )
            );
            groundMesh.position.y = - 0.1;
            groundMesh.rotation.x = - Math.PI / 2;
            groundMesh.name = 'Ground Mesh';
            lightmapObjects.push( groundMesh );
            scene.add( groundMesh );
        
            // model
            function loadModel() {
        
                object.traverse( function ( child ) {
        
                    if ( child.isMesh ) {
        
                        child.name = 'Loaded Mesh';
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = new THREE.MeshPhongMaterial();
        
                        // This adds the model to the lightmap
                        lightmapObjects.push( child );
                        progressiveSurfacemap.addObjectsToLightMap( lightmapObjects );
        
                    } else {
        
                        child.layers.disableAll(); // Disable Rendering for this
        
                    }
        
                } );
                scene.add( object );
                object.scale.set( 2, 2, 2 );
                object.position.set( 0, - 16, 0 );
                control2 = new TransformControls( camera, renderer.domElement );
                control2.addEventListener( 'dragging-changed', ( event ) => {
        
                    controls.enabled = ! event.value;
        
                } );
                control2.attach( object );
                scene.add( control2 );
                const lightTarget = new THREE.Group();
                lightTarget.position.set( 0, 20, 0 );
                for ( let l = 0; l < dirLights.length; l ++ ) {
        
                    dirLights[ l ].target = lightTarget;
        
                }
        
                object.add( lightTarget );
        
            }
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/ShadowmappableMesh.glb', false).then( ( obj ) => {
        
                object = obj.scene.children[ 0 ];
                loadModel()
        
            } );
        
           app.signal.onAppUpdate.add(animate)
        }
        
        function createGUI() {
        
            const gui = new GUI( { title: 'Accumulation Settings' } );
            gui.add( params, 'Enable' );
            gui.add( params, 'Blur Edges' );
            gui.add( params, 'Blend Window', 1, 500 ).step( 1 );
            gui.add( params, 'Light Radius', 0, 200 ).step( 10 );
            gui.add( params, 'Ambient Weight', 0, 1 ).step( 0.1 );
            gui.add( params, 'Debug Lightmap' );
        
        }
        
        
        function animate() {
        
            
        
            // Accumulate Surface Maps
            if ( params[ 'Enable' ] ) {
        
                progressiveSurfacemap.update( camera, params[ 'Blend Window' ], params[ 'Blur Edges' ] );
        
                if ( ! progressiveSurfacemap.firstUpdate ) {
        
                    progressiveSurfacemap.showDebugLightmap( params[ 'Debug Lightmap' ] );
        
                }
        
            }
        
            // Manually Update the Directional Lights
            for ( let l = 0; l < dirLights.length; l ++ ) {
        
                // Sometimes they will be sampled from the target direction
                // Sometimes they will be uniformly sampled from the upper hemisphere
                if ( Math.random() > params[ 'Ambient Weight' ] ) {
        
                    dirLights[ l ].position.set(
                        lightOrigin.position.x + ( Math.random() * params[ 'Light Radius' ] ),
                        lightOrigin.position.y + ( Math.random() * params[ 'Light Radius' ] ),
                        lightOrigin.position.z + ( Math.random() * params[ 'Light Radius' ] ) );
        
                } else {
        
                    // Uniform Hemispherical Surface Distribution for Ambient Occlusion
                    const lambda = Math.acos( 2 * Math.random() - 1 ) - ( 3.14159 / 2.0 );
                    const phi = 2 * 3.14159 * Math.random();
                    dirLights[ l ].position.set(
                                ( ( Math.cos( lambda ) * Math.cos( phi ) ) * 300 ) + object.position.x,
                        Math.abs( ( Math.cos( lambda ) * Math.sin( phi ) ) * 300 ) + object.position.y + 20,
                                    ( Math.sin( lambda ) * 300 ) + object.position.z
                    );
        
                }
        
            }
        
           
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};