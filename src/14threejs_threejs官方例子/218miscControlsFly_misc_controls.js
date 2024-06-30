
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/218miscControlsFly
        // --misc_controls_fly--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_controls_fly
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 25,
                near: 50,
                far: 1e7,
                position: [0, 0, 6371 * 5]
            },
            control: {
                enable: false
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const radius = 6371;
        const tilt = 0.41;
        const rotationSpeed = 0.02;
        
        const cloudsScale = 1.005;
        const moonScale = 0.23;
        
        const MARGIN = 0;
        let SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
        let SCREEN_WIDTH = window.innerWidth;
        
        let controls;
        let geometry, meshPlanet, meshClouds, meshMoon;
        let dirLight;
        
        let composer;
        
        const textureLoader = new THREE.TextureLoader();
        
        let d, dPlanet, dMoon;
        const dMoonVec = new THREE.Vector3();
        
        const clock = new THREE.Clock();
        
        init();
        
        function init() {
        
            scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );
        
            dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.position.set( - 1, 0, 1 ).normalize();
            scene.add( dirLight );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const materialNormalMap = new THREE.MeshPhongMaterial( {
        
                specular: 0x7c7c7c,
                shininess: 15,
                map: textureLoader.load( assetsPath + 'textures/planets/earth_atmos_2048.jpg' ),
                specularMap: textureLoader.load(assetsPath +  'textures/planets/earth_specular_2048.jpg' ),
                normalMap: textureLoader.load(assetsPath +  'textures/planets/earth_normal_2048.jpg' ),
        
                // y scale is negated to compensate for normal map handedness.
                normalScale: new THREE.Vector2( 0.85, - 0.85 )
        
            } );
            materialNormalMap.map.colorSpace = THREE.SRGBColorSpace;
        
            // planet
        
            geometry = new THREE.SphereGeometry( radius, 100, 50 );
        
            meshPlanet = new THREE.Mesh( geometry, materialNormalMap );
            meshPlanet.rotation.y = 0;
            meshPlanet.rotation.z = tilt;
            scene.add( meshPlanet );
        
            // clouds
        
            const materialClouds = new THREE.MeshLambertMaterial( {
        
                map: textureLoader.load(assetsPath +   'textures/planets/earth_clouds_1024.png' ),
                transparent: true
        
            } );
            materialClouds.map.colorSpace = THREE.SRGBColorSpace;
        
            meshClouds = new THREE.Mesh( geometry, materialClouds );
            meshClouds.scale.set( cloudsScale, cloudsScale, cloudsScale );
            meshClouds.rotation.z = tilt;
            scene.add( meshClouds );
        
            // moon
        
            const materialMoon = new THREE.MeshPhongMaterial( {
        
                map: textureLoader.load( assetsPath +  'textures/planets/moon_1024.jpg' )
        
            } );
            materialMoon.map.colorSpace = THREE.SRGBColorSpace;
        
            meshMoon = new THREE.Mesh( geometry, materialMoon );
            meshMoon.position.set( radius * 5, 0, 0 );
            meshMoon.scale.set( moonScale, moonScale, moonScale );
            scene.add( meshMoon );
        
            // stars
        
            const r = radius, starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];
        
            const vertices1 = [];
            const vertices2 = [];
        
            const vertex = new THREE.Vector3();
        
            for ( let i = 0; i < 250; i ++ ) {
        
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar( r );
        
                vertices1.push( vertex.x, vertex.y, vertex.z );
        
            }
        
            for ( let i = 0; i < 1500; i ++ ) {
        
                vertex.x = Math.random() * 2 - 1;
                vertex.y = Math.random() * 2 - 1;
                vertex.z = Math.random() * 2 - 1;
                vertex.multiplyScalar( r );
        
                vertices2.push( vertex.x, vertex.y, vertex.z );
        
            }
        
            starsGeometry[ 0 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
            starsGeometry[ 1 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );
        
            const starsMaterials = [
                new THREE.PointsMaterial( { color: 0x9c9c9c, size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x9c9c9c, size: 1, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x7c7c7c, size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x838383, size: 1, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x5a5a5a, size: 2, sizeAttenuation: false } ),
                new THREE.PointsMaterial( { color: 0x5a5a5a, size: 1, sizeAttenuation: false } )
            ];
        
            for ( let i = 10; i < 30; i ++ ) {
        
                const stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
        
                stars.rotation.x = Math.random() * 6;
                stars.rotation.y = Math.random() * 6;
                stars.rotation.z = Math.random() * 6;
                stars.scale.setScalar( i * 10 );
        
                stars.matrixAutoUpdate = false;
                stars.updateMatrix();
        
                scene.add( stars );
        
            }
        
            //
        
            controls = new FlyControls( camera, renderer.domElement );
        
            controls.movementSpeed = 1000;
            controls.domElement = renderer.domElement;
            controls.rollSpeed = Math.PI / 24;
            controls.autoForward = false;
            controls.dragToLook = false;
        
            //
        
            window.addEventListener( 'resize', onWindowResize );
        
            // postprocessing
        
            const renderModel = new RenderPass( scene, camera );
            const effectFilm = new FilmPass( 0.35 );
            const outputPass = new OutputPass();
        
            composer = new EffectComposer( renderer );
        
            composer.addPass( renderModel );
            composer.addPass( effectFilm );
            composer.addPass( outputPass );
        
            app.signal.onAppUpdate.add(render)
            app.logInfo(`	<b>WASD</b> move, <b>R|F</b> up | down, <b>Q|E</b> roll, <b>up|down</b> pitch, <b>left|right</b> yaw`, 20000)
        }
        
        function onWindowResize() {
        
            SCREEN_HEIGHT = window.innerHeight;
            SCREEN_WIDTH = window.innerWidth;
        
            composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        
        }
        
        
        function render(e) {
        
            // rotate the planet and clouds
        
            const delta = e.deltaTime;
        
            meshPlanet.rotation.y += rotationSpeed * delta;
            meshClouds.rotation.y += 1.25 * rotationSpeed * delta;
        
            // slow down as we approach the surface
        
            dPlanet = camera.position.length();
        
            dMoonVec.subVectors( camera.position, meshMoon.position );
            dMoon = dMoonVec.length();
        
            if ( dMoon < dPlanet ) {
        
                d = ( dMoon - radius * moonScale * 1.01 );
        
            } else {
        
                d = ( dPlanet - radius * 1.01 );
        
            }
        
            controls.movementSpeed = 0.33 * d;
            controls.update( delta );
        
            composer.render( delta );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};