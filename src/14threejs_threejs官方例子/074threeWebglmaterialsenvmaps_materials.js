
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/074threeWebglmaterialsenvmaps
        // --materials_envmaps--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_envmaps
        const height = 500; // of camera frustum
        const aspect = window.innerWidth / window.innerHeight;
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                isOrthographicCamera: true,
                left: - height * aspect,
                right: height * aspect,
                top: height,
                bottom: - height,
                near: 1, 
                far: 10000 ,
                position: [0, 0, 1500]
            },
            control: {
                minDistance: 20,
                maxDistance: 100
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const settings = {
            metalness: 1.0,
            roughness: 0.4,
            ambientIntensity: 0.2,
            aoMapIntensity: 1.0,
            envMapIntensity: 1.0,
            displacementScale: 2.436143, // from original model
            normalScale: 1.0
        };
        
        let mesh, material;
        
        let pointLight, ambientLight;
        
        
        let r = 0.0;
        
        init();
        initGui();
        
        // Init gui
        function initGui() {
        
            const gui = new GUI();
            //let gui = gui.addFolder( "Material" );
            gui.add( settings, 'metalness' ).min( 0 ).max( 1 ).onChange( function ( value ) {
        
                material.metalness = value;
        
            } );
        
            gui.add( settings, 'roughness' ).min( 0 ).max( 1 ).onChange( function ( value ) {
        
                material.roughness = value;
        
            } );
        
            gui.add( settings, 'aoMapIntensity' ).min( 0 ).max( 1 ).onChange( function ( value ) {
        
                material.aoMapIntensity = value;
        
            } );
        
            gui.add( settings, 'ambientIntensity' ).min( 0 ).max( 1 ).onChange( function ( value ) {
        
                ambientLight.intensity = value;
        
            } );
        
            gui.add( settings, 'envMapIntensity' ).min( 0 ).max( 3 ).onChange( function ( value ) {
        
                material.envMapIntensity = value;
        
            } );
        
            gui.add( settings, 'displacementScale' ).min( 0 ).max( 3.0 ).onChange( function ( value ) {
        
                material.displacementScale = value;
        
            } );
        
            gui.add( settings, 'normalScale' ).min( - 1 ).max( 1 ).onChange( function ( value ) {
        
                material.normalScale.set( 1, - 1 ).multiplyScalar( value );
        
            } );
        
        }
        
        function init() {
        
            scene.add( camera );
        
            // lights
        
            ambientLight = new THREE.AmbientLight( 0xffffff, settings.ambientIntensity );
            scene.add( ambientLight );
        
            pointLight = new THREE.PointLight( 0xff0000, 1.5, 0, 0 );
            pointLight.position.z = 2500;
            scene.add( pointLight );
        
            const pointLight2 = new THREE.PointLight( 0xff6666, 3, 0, 0 );
            camera.add( pointLight2 );
        
            const pointLight3 = new THREE.PointLight( 0x0000ff, 1.5, 0, 0 );
            pointLight3.position.x = - 1000;
            pointLight3.position.z = 1000;
            scene.add( pointLight3 );
        
            // env map
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const path = assetsPath +  'textures/cube/SwedishRoyalCastle/';
            const format = '.jpg';
            const urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
        
            const reflectionCube = new THREE.CubeTextureLoader().load( urls );
        
            // textures
        
            const textureLoader = new THREE.TextureLoader();
            const normalMap = textureLoader.load(assetsPath +  'models/obj/ninja/normal.png' );
            const aoMap = textureLoader.load( assetsPath + 'models/obj/ninja/ao.jpg' );
            const displacementMap = textureLoader.load( assetsPath + 'models/obj/ninja/displacement.jpg' );
        
            // material
        
            material = new THREE.MeshStandardMaterial( {
        
                color: 0xc1c1c1,
                roughness: settings.roughness,
                metalness: settings.metalness,
        
                normalMap: normalMap,
                normalScale: new THREE.Vector2( 1, - 1 ), // why does the normal map require negation in this case?
        
                aoMap: aoMap,
                aoMapIntensity: 1,
        
                displacementMap: displacementMap,
                displacementScale: settings.displacementScale,
                displacementBias: - 0.428408, // from original model
        
                envMap: reflectionCube,
                envMapIntensity: settings.envMapIntensity,
        
                side: THREE.DoubleSide
        
            } );
        
            //
        
            const loader = vjmap3d.LoadManager.objLoader;
            loader.load(assetsPath +  'models/obj/ninja/ninjaHead_Low.obj', function ( group ) {
        
                const geometry = group.children[ 0 ].geometry;
                geometry.center();
        
                mesh = new THREE.Mesh( geometry, material );
                mesh.scale.multiplyScalar( 25 );
                scene.add( mesh );
        
            } );
        
            app.on("onAppUpdate", () => {
                pointLight.position.x = 2500 * Math.cos( r );
                pointLight.position.z = 2500 * Math.sin( r );
            
                r += 0.01;
            })
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};