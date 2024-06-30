
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/141threeWebglwaterflowmap
        // --water_flowmap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_water_flowmap
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 0.1,
                far: 200,
                position: [  0, 25, 0]
            },
            control: {
                minDistance: 5,
                maxDistance: 50
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let water;
        
        init();
        
        function init() {
        
            camera.lookAt( scene.position );
        
            // ground
        
            const groundGeometry = new THREE.PlaneGeometry( 20, 20, 10, 10 );
            const groundMaterial = new THREE.MeshBasicMaterial( { color: 0xe7e7e7 } );
            const ground = new THREE.Mesh( groundGeometry, groundMaterial );
            ground.rotation.x = Math.PI * - 0.5;
            scene.add( ground );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(assetsPath + 'textures/floors/FloorsCheckerboard_S_Diffuse.jpg', function ( map ) {
        
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.anisotropy = 16;
                map.repeat.set( 4, 4 );
                map.colorSpace = THREE.SRGBColorSpace;
                groundMaterial.map = map;
                groundMaterial.needsUpdate = true;
        
            } );
        
            // water
        
            const waterGeometry = new THREE.PlaneGeometry( 20, 20 );
            
            const flowMap = textureLoader.load( assetsPath + 'textures/water/Water_1_M_Flow.jpg' );
        
            water = new Water2( waterGeometry, {
                scale: 2,
                textureWidth: 1024,
                textureHeight: 1024,
                flowMap: flowMap,
                normalMap0: textureLoader.load(assetsPath + 'textures/water/Water_1_M_Normal.jpg' ),
        		normalMap1: textureLoader.load(assetsPath +  'textures/water/Water_2_M_Normal.jpg' )
            } );
        
            water.position.y = 1;
            water.rotation.x = Math.PI * - 0.5;
            scene.add( water );
        
            // flow map helper
        
            const helperGeometry = new THREE.PlaneGeometry( 20, 20 );
            const helperMaterial = new THREE.MeshBasicMaterial( { map: flowMap } );
            const helper = new THREE.Mesh( helperGeometry, helperMaterial );
            helper.position.y = 1.01;
            helper.rotation.x = Math.PI * - 0.5;
            helper.visible = false;
            scene.add( helper );
        
            const gui = new GUI();
            gui.add( helper, 'visible' ).name( 'Show Flow Map' );
            gui.open();
        
           
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};