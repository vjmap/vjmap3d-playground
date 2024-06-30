
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/077threeWebglmaterialsenvmaphdr
        // --materials_envmaps_hdr--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_envmaps_hdr
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x000000,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [ 0, 0, 120  ]
            },
            control: {
                minDistance: 50,
                maxDistance: 300
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const params = {
            envMap: 'HDR',
            roughness: 0.0,
            metalness: 0.0,
            exposure: 1.0,
            debug: false
        };
        
        let torusMesh, planeMesh;
        let generatedCubeRenderTarget, ldrCubeRenderTarget, hdrCubeRenderTarget, rgbmCubeRenderTarget;
        let ldrCubeMap, hdrCubeMap, rgbmCubeMap;
        
        init();
        
        function init() {
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            //
        
            let geometry = new THREE.TorusKnotGeometry( 18, 8, 150, 20 );
            // let geometry = new THREE.SphereGeometry( 26, 64, 32 );
            let material = new THREE.MeshStandardMaterial( {
                color: 0xffffff,
                metalness: params.metalness,
                roughness: params.roughness
            } );
        
            torusMesh = new THREE.Mesh( geometry, material );
            scene.add( torusMesh );
        
        
            geometry = new THREE.PlaneGeometry( 200, 200 );
            material = new THREE.MeshBasicMaterial();
        
            planeMesh = new THREE.Mesh( geometry, material );
            planeMesh.position.y = - 50;
            planeMesh.rotation.x = - Math.PI * 0.5;
            scene.add( planeMesh );
        
            THREE.DefaultLoadingManager.onLoad = function ( ) {
        
                pmremGenerator.dispose();
        
            };
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ];
            hdrCubeMap = new HDRCubeTextureLoader()
                .setPath(assetsPath +  './textures/cube/pisaHDR/' )
                .load( hdrUrls, function () {
        
                    hdrCubeRenderTarget = pmremGenerator.fromCubemap( hdrCubeMap );
        
                    hdrCubeMap.magFilter = THREE.LinearFilter;
                    hdrCubeMap.needsUpdate = true;
        
                } );
        
            const ldrUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ];
            ldrCubeMap = new THREE.CubeTextureLoader()
                .setPath( './textures/cube/pisa/' )
                .load( ldrUrls, function () {
        
                    ldrCubeRenderTarget = pmremGenerator.fromCubemap( ldrCubeMap );
        
                } );
        
        
            const rgbmUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ];
            rgbmCubeMap = new RGBMLoader().setMaxRange( 16 )
                .setPath(assetsPath +  './textures/cube/pisaRGBM16/' )
                .loadCubemap( rgbmUrls, function () {
        
                    rgbmCubeRenderTarget = pmremGenerator.fromCubemap( rgbmCubeMap );
        
                } );
        
            const pmremGenerator = new THREE.PMREMGenerator( renderer );
            pmremGenerator.compileCubemapShader();
        
            const envScene = new DebugEnvironment();
            generatedCubeRenderTarget = pmremGenerator.fromScene( envScene );
        
            const gui = new GUI();
        
            gui.add( params, 'envMap', [ 'Generated', 'LDR', 'HDR', 'RGBM16' ] );
            gui.add( params, 'roughness', 0, 1, 0.01 );
            gui.add( params, 'metalness', 0, 1, 0.01 );
            gui.add( params, 'exposure', 0, 2, 0.01 );
            gui.add( params, 'debug' );
            gui.open();
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        function render() {
        
            torusMesh.material.roughness = params.roughness;
            torusMesh.material.metalness = params.metalness;
        
            let renderTarget, cubeMap;
        
            switch ( params.envMap ) {
        
                case 'Generated':
                    renderTarget = generatedCubeRenderTarget;
                    cubeMap = generatedCubeRenderTarget.texture;
                    break;
                case 'LDR':
                    renderTarget = ldrCubeRenderTarget;
                    cubeMap = ldrCubeMap;
                    break;
                case 'HDR':
                    renderTarget = hdrCubeRenderTarget;
                    cubeMap = hdrCubeMap;
                    break;
                case 'RGBM16':
                    renderTarget = rgbmCubeRenderTarget;
                    cubeMap = rgbmCubeMap;
                    break;
        
            }
        
            const newEnvMap = renderTarget ? renderTarget.texture : null;
        
            if ( newEnvMap && newEnvMap !== torusMesh.material.envMap ) {
        
                torusMesh.material.envMap = newEnvMap;
                torusMesh.material.needsUpdate = true;
        
                planeMesh.material.map = newEnvMap;
                planeMesh.material.needsUpdate = true;
        
            }
        
            torusMesh.rotation.y += 0.005;
            planeMesh.visible = params.debug;
        
            scene.background = cubeMap;
            renderer.toneMappingExposure = params.exposure;
        
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};