
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/081threeWebglmaterialsPhysicalClearcoat
        // --materials_physical_clearcoat--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_physical_clearcoat
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 0.25,
                far: 50,
                position: [ 0, 0, 10]
            },
            control: {
                minDistance: 3,
                maxDistance: 30
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let particleLight;
        let group;
        
        init();
        
        function init() {
        
            group = new THREE.Group();
            scene.add( group );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            new HDRCubeTextureLoader()
                .setPath(assetsPath + 'textures/cube/pisaHDR/' )
                .load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
                    function ( texture ) {
        
                        const geometry = new THREE.SphereGeometry( .8, 64, 32 );
        
                        const textureLoader = new THREE.TextureLoader();
        
                        const diffuse = textureLoader.load(assetsPath + 'textures/carbon/Carbon.png' );
                        diffuse.colorSpace = THREE.SRGBColorSpace;
                        diffuse.wrapS = THREE.RepeatWrapping;
                        diffuse.wrapT = THREE.RepeatWrapping;
                        diffuse.repeat.x = 10;
                        diffuse.repeat.y = 10;
        
                        const normalMap = textureLoader.load(assetsPath + 'textures/carbon/Carbon_Normal.png' );
                        normalMap.wrapS = THREE.RepeatWrapping;
                        normalMap.wrapT = THREE.RepeatWrapping;
                        normalMap.repeat.x = 10;
                        normalMap.repeat.y = 10;
        
                        const normalMap2 = textureLoader.load(assetsPath +  'textures/water/Water_1_M_Normal.jpg' );
        
                        const normalMap3 = new THREE.CanvasTexture( new FlakesTexture() );
                        normalMap3.wrapS = THREE.RepeatWrapping;
                        normalMap3.wrapT = THREE.RepeatWrapping;
                        normalMap3.repeat.x = 10;
                        normalMap3.repeat.y = 6;
                        normalMap3.anisotropy = 16;
        
                        const normalMap4 = textureLoader.load(assetsPath +  'textures/golfball.jpg' );
        
                        const clearcoatNormalMap = textureLoader.load(assetsPath +  'textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png' );
        
                        // car paint
        
                        let material = new THREE.MeshPhysicalMaterial( {
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            metalness: 0.9,
                            roughness: 0.5,
                            color: 0x0000ff,
                            normalMap: normalMap3,
                            normalScale: new THREE.Vector2( 0.15, 0.15 )
                        } );
        
                        let mesh = new THREE.Mesh( geometry, material );
                        mesh.position.x = - 1;
                        mesh.position.y = 1;
                        group.add( mesh );
        
                        // fibers
        
                        material = new THREE.MeshPhysicalMaterial( {
                            roughness: 0.5,
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            map: diffuse,
                            normalMap: normalMap
                        } );
                        mesh = new THREE.Mesh( geometry, material );
                        mesh.position.x = 1;
                        mesh.position.y = 1;
                        group.add( mesh );
        
                        // golf
        
                        material = new THREE.MeshPhysicalMaterial( {
                            metalness: 0.0,
                            roughness: 0.1,
                            clearcoat: 1.0,
                            normalMap: normalMap4,
                            clearcoatNormalMap: clearcoatNormalMap,
        
                            // y scale is negated to compensate for normal map handedness.
                            clearcoatNormalScale: new THREE.Vector2( 2.0, - 2.0 )
                        } );
                        mesh = new THREE.Mesh( geometry, material );
                        mesh.position.x = - 1;
                        mesh.position.y = - 1;
                        group.add( mesh );
        
                        // clearcoat + normalmap
        
                        material = new THREE.MeshPhysicalMaterial( {
                            clearcoat: 1.0,
                            metalness: 1.0,
                            color: 0xff0000,
                            normalMap: normalMap2,
                            normalScale: new THREE.Vector2( 0.15, 0.15 ),
                            clearcoatNormalMap: clearcoatNormalMap,
        
                            // y scale is negated to compensate for normal map handedness.
                            clearcoatNormalScale: new THREE.Vector2( 2.0, - 2.0 )
                        } );
                        mesh = new THREE.Mesh( geometry, material );
                        mesh.position.x = 1;
                        mesh.position.y = - 1;
                        group.add( mesh );
        
                        //
        
                        scene.background = texture;
                        scene.environment = texture;
        
                    }
        
                );
        
            // LIGHTS
        
            particleLight = new THREE.Mesh(
                new THREE.SphereGeometry( .05, 8, 8 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff } )
            );
            scene.add( particleLight );
        
            particleLight.add( new THREE.PointLight( 0xffffff, 30 ) );
        
           
            //
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.25;
        
            //
        
        
            app.signal.onAppUpdate.add(render)
        
        }
        
        
        function render() {
        
            const timer = Date.now() * 0.00025;
        
            particleLight.position.x = Math.sin( timer * 7 ) * 3;
            particleLight.position.y = Math.cos( timer * 5 ) * 4;
            particleLight.position.z = Math.cos( timer * 3 ) * 3;
        
            for ( let i = 0; i < group.children.length; i ++ ) {
        
                const child = group.children[ i ];
                child.rotation.y += 0.005;
        
            }
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};