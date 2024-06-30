
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/076threeWebglmaterialsenvmapgroundprojected
        // --materials_envmaps_groundprojected--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_envmaps_groundprojected
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [- 20, 7, 20  ],
                lookAt: [0, 4, 0]
            },
            control: {
                target: [0, 2, 0],
                maxPolarAngle: THREE.MathUtils.degToRad( 90 ),
                minDistance: 20,
                maxDistance: 80
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const params = {
            height: 15,
            radius: 100,
            enabled: true,
        };
        
        let skybox;
        
        init()
        
        async function init() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const envMap = await vjmap3d.LoadManager.hdrLoader.loadAsync(assetsPath + 'textures/equirectangular/blouberg_sunrise_2_1k.hdr' );
            envMap.mapping = THREE.EquirectangularReflectionMapping;
        
            skybox = new GroundedSkybox( envMap, params.height, params.radius );
            skybox.position.y = params.height - 0.01;
            scene.add( skybox );
        
            scene.environment = envMap;
        
        
            const shadow = new THREE.TextureLoader().load(assetsPath +  'models/gltf/ferrari_ao.png' );
        
            vjmap3d.ResManager.loadRes(assetsPath +  'models/gltf/ferrari.glb', false).then( ( gltf )  => {
        
                const bodyMaterial = new THREE.MeshPhysicalMaterial( {
                    color: 0x000000, metalness: 1.0, roughness: 0.8,
                    clearcoat: 1.0, clearcoatRoughness: 0.2
                } );
        
                const detailsMaterial = new THREE.MeshStandardMaterial( {
                    color: 0xffffff, metalness: 1.0, roughness: 0.5
                } );
        
                const glassMaterial = new THREE.MeshPhysicalMaterial( {
                    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
                } );
        
                const carModel = gltf.scene.children[ 0 ];
                carModel.scale.multiplyScalar( 4 );
                carModel.rotation.y = Math.PI;
        
                carModel.getObjectByName( 'body' ).material = bodyMaterial;
        
                carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
                carModel.getObjectByName( 'trim' ).material = detailsMaterial;
        
                carModel.getObjectByName( 'glass' ).material = glassMaterial;
        
                // shadow
                const mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
                    new THREE.MeshBasicMaterial( {
                        map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
                    } )
                );
                mesh.rotation.x = - Math.PI / 2;
                carModel.add( mesh );
        
                scene.add( carModel );
        
        
            } );
        
            //
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
            const gui = new GUI();
        
            gui.add( params, 'enabled' ).name( 'Grounded' ).onChange( function ( value ) {
        
                if ( value ) {
        
                    scene.add( skybox );
                    scene.background = null;
        
                } else {
        
                    scene.remove( skybox );
                    scene.background = scene.environment;
        
                }
        
        
            } );
        
            gui.open();
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};