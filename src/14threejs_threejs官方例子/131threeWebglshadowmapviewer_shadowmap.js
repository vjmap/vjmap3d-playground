
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/131threeWebglshadowmapviewer
        // --shadowmap_viewer--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmap_viewer
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [  0, 15, 35  ]
            },
            control: {
                target: [ 0, 2, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let dirLight, spotLight;
        let torusKnot, cube;
        let dirLightShadowMapViewer, spotLightShadowMapViewer;
        
        init();
        
        function init() {
        
            initScene();
            initShadowMapViewers();
            initMisc();
        
        
        }
        
        function initScene() {
        
            // Lights
        
            scene.add( new THREE.AmbientLight( 0x404040, 3 ) );
        
            spotLight = new THREE.SpotLight( 0xffffff, 500 );
            spotLight.name = 'Spot Light';
            spotLight.angle = Math.PI / 5;
            spotLight.penumbra = 0.3;
            spotLight.position.set( 10, 10, 5 );
            spotLight.castShadow = true;
            spotLight.shadow.camera.near = 8;
            spotLight.shadow.camera.far = 30;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            scene.add( spotLight );
        
            scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );
        
            dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.name = 'Dir. Light';
            dirLight.position.set( 0, 10, 0 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.near = 1;
            dirLight.shadow.camera.far = 10;
            dirLight.shadow.camera.right = 15;
            dirLight.shadow.camera.left = - 15;
            dirLight.shadow.camera.top	= 15;
            dirLight.shadow.camera.bottom = - 15;
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            scene.add( dirLight );
        
            scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );
        
            // Geometry
            let geometry = new THREE.TorusKnotGeometry( 25, 8, 75, 20 );
            let material = new THREE.MeshPhongMaterial( {
                color: 0xff0000,
                shininess: 150,
                specular: 0x222222
            } );
        
            torusKnot = new THREE.Mesh( geometry, material );
            torusKnot.scale.multiplyScalar( 1 / 18 );
            torusKnot.position.y = 3;
            torusKnot.castShadow = true;
            torusKnot.receiveShadow = true;
            scene.add( torusKnot );
        
            geometry = new THREE.BoxGeometry( 3, 3, 3 );
            cube = new THREE.Mesh( geometry, material );
            cube.position.set( 8, 3, 8 );
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add( cube );
        
            geometry = new THREE.BoxGeometry( 10, 0.15, 10 );
            material = new THREE.MeshPhongMaterial( {
                color: 0xa0adaf,
                shininess: 150,
                specular: 0x111111
            } );
        
            const ground = new THREE.Mesh( geometry, material );
            ground.scale.multiplyScalar( 3 );
            ground.castShadow = false;
            ground.receiveShadow = true;
            scene.add( ground );
        
            app.signal.onContainerSizeChange.add(onWindowResize);
            app.signal.onAppAfterRender.add(render)
        }
        
        function initShadowMapViewers() {
        
            dirLightShadowMapViewer = new ShadowMapViewer( dirLight );
            spotLightShadowMapViewer = new ShadowMapViewer( spotLight );
            resizeShadowMapViewers();
        
        }
        
        function initMisc() {
        
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.BasicShadowMap;
        
        
        }
        
        function resizeShadowMapViewers() {
        
            const size = app.containerSize.width * 0.15;
        
            dirLightShadowMapViewer.position.x = 10;
            dirLightShadowMapViewer.position.y = 10;
            dirLightShadowMapViewer.size.width = size;
            dirLightShadowMapViewer.size.height = size;
            dirLightShadowMapViewer.update(); //Required when setting position or size directly
        
            spotLightShadowMapViewer.size.set( size, size );
            spotLightShadowMapViewer.position.set( size + 20, 10 );
            // spotLightShadowMapViewer.update();	//NOT required because .set updates automatically
        
        }
        
        function onWindowResize() {
        
            resizeShadowMapViewers();
            dirLightShadowMapViewer.updateForWindowResize();
            spotLightShadowMapViewer.updateForWindowResize();
        
        }
        function renderShadowMapViewers() {
        
            dirLightShadowMapViewer.render( renderer );
            spotLightShadowMapViewer.render( renderer );
        
        }
        
        function render(e) {
        
            const delta = e.deltaTime;
        
            renderShadowMapViewers();
        
            torusKnot.rotation.x += 0.25 * delta;
            torusKnot.rotation.y += 2 * delta;
            torusKnot.rotation.z += 1 * delta;
        
            cube.rotation.x += 0.25 * delta;
            cube.rotation.y += 2 * delta;
            cube.rotation.z += 1 * delta;
        
        }
        
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};