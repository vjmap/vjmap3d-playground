
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/140threeWebglwater
        // --water--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_water
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
                position: [ - 15, 7, 15 ]
            },
            control: {
                minDistance: 5,
                maxDistance: 50
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let water;
        
        let torusKnot;
        
        const params = {
            color: '#ffffff',
            scale: 4,
            flowX: 1,
            flowY: 1
        };
        
        init();
        
        function init() {
        
            // camera
            camera.lookAt( scene.position );
        
            // mesh
        
            const torusKnotGeometry = new THREE.TorusKnotGeometry( 3, 1, 256, 32 );
            const torusKnotMaterial = new THREE.MeshNormalMaterial();
        
            torusKnot = new THREE.Mesh( torusKnotGeometry, torusKnotMaterial );
            torusKnot.position.y = 4;
            torusKnot.scale.set( 0.5, 0.5, 0.5 );
            scene.add( torusKnot );
        
            // ground
        
            const groundGeometry = new THREE.PlaneGeometry( 20, 20 );
            const groundMaterial = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
            const ground = new THREE.Mesh( groundGeometry, groundMaterial );
            ground.rotation.x = Math.PI * - 0.5;
            scene.add( ground );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(assetsPath + 'textures/hardwood2_diffuse.jpg', function ( map ) {
        
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
        
            water = new Water2( waterGeometry, {
                color: params.color,
                scale: params.scale,
                flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
                textureWidth: 1024,
                textureHeight: 1024,
                normalMap0: textureLoader.load(assetsPath + 'textures/water/Water_1_M_Normal.jpg' ),
        		normalMap1: textureLoader.load(assetsPath +  'textures/water/Water_2_M_Normal.jpg' )
            } );
        
            water.position.y = 1;
            water.rotation.x = Math.PI * - 0.5;
            scene.add( water );
        
            // skybox
        
            const cubeTextureLoader = new THREE.CubeTextureLoader();
            cubeTextureLoader.setPath( assetsPath + 'textures/cube/Park2/' );
        
            const cubeTexture = cubeTextureLoader.load( [
                'posx.jpg', 'negx.jpg',
                'posy.jpg', 'negy.jpg',
                'posz.jpg', 'negz.jpg'
            ] );
        
            scene.background = cubeTexture;
        
            // light
        
            const ambientLight = new THREE.AmbientLight( 0xe7e7e7, 1.2 );
            scene.add( ambientLight );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            directionalLight.position.set( - 1, 1, 1 );
            scene.add( directionalLight );
        
        
            // gui
        
            const gui = new GUI();
        
            gui.addColor( params, 'color' ).onChange( function ( value ) {
        
                water.material.uniforms[ 'color' ].value.set( value );
        
            } );
            gui.add( params, 'scale', 1, 10 ).onChange( function ( value ) {
        
                water.material.uniforms[ 'config' ].value.w = value;
        
            } );
            gui.add( params, 'flowX', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {
        
                water.material.uniforms[ 'flowDirection' ].value.x = value;
                water.material.uniforms[ 'flowDirection' ].value.normalize();
        
            } );
            gui.add( params, 'flowY', - 1, 1 ).step( 0.01 ).onChange( function ( value ) {
        
                water.material.uniforms[ 'flowDirection' ].value.y = value;
                water.material.uniforms[ 'flowDirection' ].value.normalize();
        
            } );
        
            gui.open();
        
            app.signal.onAppUpdate.add(animate);
           
        
        }
        
        
        function animate(e) {
        
            const delta = e.deltaTime;
        
            torusKnot.rotation.x += delta;
            torusKnot.rotation.y += delta * 0.5;
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};