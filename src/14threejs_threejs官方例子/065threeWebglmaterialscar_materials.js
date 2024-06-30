
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/065threeWebglmaterialscar
        // --materials_car--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_car
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x333333,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 0.1,
                far: 100,
                position: [4.25, 1.4, - 4.5 ]
            },
            control: {
                maxDistance: 9,
                maxPolarAngle: THREE.MathUtils.degToRad( 90 ),
                target: [0, 0.5, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let grid;
        let controls;
        
        const wheels = [];
        
        async function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.85;
            
            scene.environment = vjmap3d.LoadManager.hdrLoader.load(assetsPath + 'textures/equirectangular/venice_sunset_1k.hdr' );
            scene.environment.mapping = THREE.EquirectangularReflectionMapping;
            scene.fog = new THREE.Fog( 0x333333, 10, 15 );
        
            grid = new THREE.GridHelper( 20, 40, 0xffffff, 0xffffff );
            grid.material.opacity = 0.2;
            grid.material.depthWrite = false;
            grid.material.transparent = true;
            scene.add( grid );
        
            // materials
        
            const bodyMaterial = new THREE.MeshPhysicalMaterial( {
                color: 0xff0000, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03
            } );
        
            const detailsMaterial = new THREE.MeshStandardMaterial( {
                color: 0xffffff, metalness: 1.0, roughness: 0.5
            } );
        
            const glassMaterial = new THREE.MeshPhysicalMaterial( {
                color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
            } );
        
            const ui = await app.getConfigPane({ title: "设置", style: { width: "250px"}});
            let gui = new vjmap3d.UiPanelJsonConfig();
            gui.addColor(bodyMaterial, "color").label("body-color");
            gui.addColor(detailsMaterial, "color").label("details-color");
            gui.addColor(glassMaterial, "color").label("glass-color");
            gui.toJson().forEach(c => ui.appendChild(c))
          
        
            // Car
        
            const shadow = vjmap3d.ResManager.loadTextureLinear(assetsPath +  'models/gltf/ferrari_ao.png' );
        
        
            vjmap3d.ResManager.loadRes(assetsPath +  'models/gltf/ferrari.glb', false).then(( gltf ) => {
        
                const carModel = gltf.scene.children[ 0 ];
        
                carModel.getObjectByName( 'body' ).material = bodyMaterial;
        
                carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
                carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
                carModel.getObjectByName( 'trim' ).material = detailsMaterial;
        
                carModel.getObjectByName( 'glass' ).material = glassMaterial;
        
                wheels.push(
                    carModel.getObjectByName( 'wheel_fl' ),
                    carModel.getObjectByName( 'wheel_fr' ),
                    carModel.getObjectByName( 'wheel_rl' ),
                    carModel.getObjectByName( 'wheel_rr' )
                );
        
                // shadow
                const mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
                    new THREE.MeshBasicMaterial( {
                        map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
                    } )
                );
                mesh.rotation.x = - Math.PI / 2;
                mesh.renderOrder = 2;
                carModel.add( mesh );
        
                scene.add( carModel );
        
            } );
        
            app.signal.onAppUpdate.add(() => {
                const time = - performance.now() / 1000;
        
                for ( let i = 0; i < wheels.length; i ++ ) {
            
                    wheels[ i ].rotation.x = time * Math.PI * 2;
            
                }
            
                grid.position.z = - ( time ) % 1;
            })
        
        }
        
        
        init();
        
        
    }
    catch (e) {
        console.error(e);
    }
};