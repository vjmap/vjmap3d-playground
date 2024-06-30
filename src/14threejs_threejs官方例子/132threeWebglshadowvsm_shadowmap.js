
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/132threeWebglshadowvsm
        // --shadowmap_vsm--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmap_vsm
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x222244,
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [ 0, 10, 30  ]
            },
            control: {
                target: [ 0, 2, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let dirLight, spotLight;
        let torusKnot, dirGroup;
        
        init();
        
        function init() {
        
            initScene();
            initMisc();
        
            // Init gui
            const gui = new GUI();
        
            const config = {
                spotlightRadius: 4,
                spotlightSamples: 8,
                dirlightRadius: 4,
                dirlightSamples: 8
            };
        
            const spotlightFolder = gui.addFolder( 'Spotlight' );
            spotlightFolder.add( config, 'spotlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {
        
                spotLight.shadow.radius = value;
        
            } );
        
            spotlightFolder.add( config, 'spotlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {
        
                spotLight.shadow.blurSamples = value;
        
            } );
            spotlightFolder.open();
        
            const dirlightFolder = gui.addFolder( 'Directional Light' );
            dirlightFolder.add( config, 'dirlightRadius' ).name( 'radius' ).min( 0 ).max( 25 ).onChange( function ( value ) {
        
                dirLight.shadow.radius = value;
        
            } );
        
            dirlightFolder.add( config, 'dirlightSamples', 1, 25, 1 ).name( 'samples' ).onChange( function ( value ) {
        
                dirLight.shadow.blurSamples = value;
        
            } );
            dirlightFolder.open();
        
         
        }
        
        function initScene() {
        
            scene.fog = new THREE.Fog( 0x222244, 50, 100 );
        
            // Lights
        
            scene.add( new THREE.AmbientLight( 0x444444 ) );
        
            spotLight = new THREE.SpotLight( 0xff8888, 400 );
            spotLight.angle = Math.PI / 5;
            spotLight.penumbra = 0.3;
            spotLight.position.set( 8, 10, 5 );
            spotLight.castShadow = true;
            spotLight.shadow.camera.near = 8;
            spotLight.shadow.camera.far = 200;
            spotLight.shadow.mapSize.width = 256;
            spotLight.shadow.mapSize.height = 256;
            spotLight.shadow.bias = - 0.002;
            spotLight.shadow.radius = 4;
            scene.add( spotLight );
        
        
            dirLight = new THREE.DirectionalLight( 0x8888ff, 3 );
            dirLight.position.set( 3, 12, 17 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.near = 0.1;
            dirLight.shadow.camera.far = 500;
            dirLight.shadow.camera.right = 17;
            dirLight.shadow.camera.left = - 17;
            dirLight.shadow.camera.top	= 17;
            dirLight.shadow.camera.bottom = - 17;
            dirLight.shadow.mapSize.width = 512;
            dirLight.shadow.mapSize.height = 512;
            dirLight.shadow.radius = 4;
            dirLight.shadow.bias = - 0.0005;
        
            dirGroup = new THREE.Group();
            dirGroup.add( dirLight );
            scene.add( dirGroup );
        
            // Geometry
        
            const geometry = new THREE.TorusKnotGeometry( 25, 8, 75, 20 );
            const material = new THREE.MeshPhongMaterial( {
                color: 0x999999,
                shininess: 0,
                specular: 0x222222
            } );
        
            torusKnot = new THREE.Mesh( geometry, material );
            torusKnot.scale.multiplyScalar( 1 / 18 );
            torusKnot.position.y = 3;
            torusKnot.castShadow = true;
            torusKnot.receiveShadow = true;
            scene.add( torusKnot );
        
            const cylinderGeometry = new THREE.CylinderGeometry( 0.75, 0.75, 7, 32 );
        
            const pillar1 = new THREE.Mesh( cylinderGeometry, material );
            pillar1.position.set( 8, 3.5, 8 );
            pillar1.castShadow = true;
            pillar1.receiveShadow = true;
        
            const pillar2 = pillar1.clone();
            pillar2.position.set( 8, 3.5, - 8 );
            const pillar3 = pillar1.clone();
            pillar3.position.set( - 8, 3.5, 8 );
            const pillar4 = pillar1.clone();
            pillar4.position.set( - 8, 3.5, - 8 );
        
            scene.add( pillar1 );
            scene.add( pillar2 );
            scene.add( pillar3 );
            scene.add( pillar4 );
        
            const planeGeometry = new THREE.PlaneGeometry( 200, 200 );
            const planeMaterial = new THREE.MeshPhongMaterial( {
                color: 0x999999,
                shininess: 0,
                specular: 0x111111
            } );
        
            const ground = new THREE.Mesh( planeGeometry, planeMaterial );
            ground.rotation.x = - Math.PI / 2;
            ground.scale.multiplyScalar( 3 );
            ground.castShadow = true;
            ground.receiveShadow = true;
            scene.add( ground );
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function initMisc() {
        
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.VSMShadowMap;
        
        
        }
        
        
        function animate( e ) {
        
            const delta = e.deltaTime;
        
            torusKnot.rotation.x += 0.25 * delta;
            torusKnot.rotation.y += 0.5 * delta;
            torusKnot.rotation.z += 1 * delta;
        
            dirGroup.rotation.y += 0.7 * delta;
            dirLight.position.z = 17 + Math.sin( e.elapsedTime * 0.001 ) * 5;
        
        
        }
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};