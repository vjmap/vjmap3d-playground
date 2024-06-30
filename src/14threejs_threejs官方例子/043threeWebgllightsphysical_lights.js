
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/043threeWebgllightsphysical
        // --lights_physical--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_physical
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 0.1, 
                far: 100,
                position: [ - 4, 4, 2 ]
            },
            control: {
                minDistance: 1,
                maxDistance: 20
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let bulbLight, bulbMat, hemiLight, stats;
        let ballMat, cubeMat, floorMat;
        
        let previousShadowMap = false;
        
        
        // ref for lumens: http://www.power-sure.com/lumens.htm
        const bulbLuminousPowers = {
            '110000 lm (1000W)': 110000,
            '3500 lm (300W)': 3500,
            '1700 lm (100W)': 1700,
            '800 lm (60W)': 800,
            '400 lm (40W)': 400,
            '180 lm (25W)': 180,
            '20 lm (4W)': 20,
            'Off': 0
        };
        
        // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
        const hemiLuminousIrradiances = {
            '0.0001 lx (Moonless Night)': 0.0001,
            '0.002 lx (Night Airglow)': 0.002,
            '0.5 lx (Full Moon)': 0.5,
            '3.4 lx (City Twilight)': 3.4,
            '50 lx (Living Room)': 50,
            '100 lx (Very Overcast)': 100,
            '350 lx (Office Room)': 350,
            '400 lx (Sunrise/Sunset)': 400,
            '1000 lx (Overcast)': 1000,
            '18000 lx (Daylight)': 18000,
            '50000 lx (Direct Sun)': 50000
        };
        
        const params = {
            shadows: true,
            exposure: 0.68,
            bulbPower: Object.keys( bulbLuminousPowers )[ 4 ],
            hemiIrradiance: Object.keys( hemiLuminousIrradiances )[ 0 ]
        };
        
        init();
        
        function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const bulbGeometry = new THREE.SphereGeometry( 0.02, 16, 8 );
            bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
        
            bulbMat = new THREE.MeshStandardMaterial( {
                emissive: 0xffffee,
                emissiveIntensity: 1,
                color: 0x000000
            } );
            bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
            bulbLight.position.set( 0, 2, 0 );
            bulbLight.castShadow = true;
            scene.add( bulbLight );
        
            hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
            scene.add( hemiLight );
        
            floorMat = new THREE.MeshStandardMaterial( {
                roughness: 0.8,
                color: 0xffffff,
                metalness: 0.2,
                bumpScale: 1
            } );
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(assetsPath + 'textures/hardwood2_diffuse.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set( 10, 24 );
                map.colorSpace = THREE.SRGBColorSpace;
                floorMat.map = map;
                floorMat.needsUpdate = true;
        
            } );
            textureLoader.load(assetsPath +  'textures/hardwood2_bump.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set( 10, 24 );
                floorMat.bumpMap = map;
                floorMat.needsUpdate = true;
        
            } );
            textureLoader.load(assetsPath +  'textures/hardwood2_roughness.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set( 10, 24 );
                floorMat.roughnessMap = map;
                floorMat.needsUpdate = true;
        
            } );
        
            cubeMat = new THREE.MeshStandardMaterial( {
                roughness: 0.7,
                color: 0xffffff,
                bumpScale: 1,
                metalness: 0.2
            } );
            textureLoader.load(assetsPath +  'textures/brick_diffuse.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set( 1, 1 );
                map.colorSpace = THREE.SRGBColorSpace;
                cubeMat.map = map;
                cubeMat.needsUpdate = true;
        
            } );
            textureLoader.load(assetsPath +  'textures/brick_bump.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 4;
                map.repeat.set( 1, 1 );
                cubeMat.bumpMap = map;
                cubeMat.needsUpdate = true;
        
            } );
        
            ballMat = new THREE.MeshStandardMaterial( {
                color: 0xffffff,
                roughness: 0.5,
                metalness: 1.0
            } );
            textureLoader.load(assetsPath +  'textures/planets/earth_atmos_2048.jpg', function ( map ) {
        
                map.anisotropy = 4;
                map.colorSpace = THREE.SRGBColorSpace;
                ballMat.map = map;
                ballMat.needsUpdate = true;
        
            } );
            textureLoader.load(assetsPath +  'textures/planets/earth_specular_2048.jpg', function ( map ) {
        
                map.anisotropy = 4;
                map.colorSpace = THREE.SRGBColorSpace;
                ballMat.metalnessMap = map;
                ballMat.needsUpdate = true;
        
            } );
        
            const floorGeometry = new THREE.PlaneGeometry( 20, 20 );
            const floorMesh = new THREE.Mesh( floorGeometry, floorMat );
            floorMesh.receiveShadow = true;
            floorMesh.rotation.x = - Math.PI / 2.0;
            scene.add( floorMesh );
        
            const ballGeometry = new THREE.SphereGeometry( 0.25, 32, 32 );
            const ballMesh = new THREE.Mesh( ballGeometry, ballMat );
            ballMesh.position.set( 1, 0.25, 1 );
            ballMesh.rotation.y = Math.PI;
            ballMesh.castShadow = true;
            scene.add( ballMesh );
        
            const boxGeometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
            const boxMesh = new THREE.Mesh( boxGeometry, cubeMat );
            boxMesh.position.set( - 0.5, 0.25, - 1 );
            boxMesh.castShadow = true;
            scene.add( boxMesh );
        
            const boxMesh2 = new THREE.Mesh( boxGeometry, cubeMat );
            boxMesh2.position.set( 0, 0.25, - 5 );
            boxMesh2.castShadow = true;
            scene.add( boxMesh2 );
        
            const boxMesh3 = new THREE.Mesh( boxGeometry, cubeMat );
            boxMesh3.position.set( 7, 0.25, 0 );
            boxMesh3.castShadow = true;
            scene.add( boxMesh3 );
        
        
           
            renderer.shadowMap.enabled = true;
            renderer.toneMapping = THREE.ReinhardToneMapping;
        
            const gui = new GUI();
        
            gui.add( params, 'hemiIrradiance', Object.keys( hemiLuminousIrradiances ) );
            gui.add( params, 'bulbPower', Object.keys( bulbLuminousPowers ) );
            gui.add( params, 'exposure', 0, 1 );
            gui.add( params, 'shadows' );
            gui.open();
        
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        //
        
        function animate() {
        
            renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
            renderer.shadowMap.enabled = params.shadows;
            bulbLight.castShadow = params.shadows;
        
            if ( params.shadows !== previousShadowMap ) {
        
                ballMat.needsUpdate = true;
                cubeMat.needsUpdate = true;
                floorMat.needsUpdate = true;
                previousShadowMap = params.shadows;
        
            }
        
            bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
            bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface
        
            hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
            const time = Date.now() * 0.0005;
        
            bulbLight.position.y = Math.cos( time ) * 0.75 + 1.25;
           
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};