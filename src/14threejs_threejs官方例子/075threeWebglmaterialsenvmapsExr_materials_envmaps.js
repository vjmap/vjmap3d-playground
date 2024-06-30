
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/075threeWebglmaterialsenvmapsExr
        // --materials_envmaps_exr--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_envmaps_exr
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [0, 0, 120  ]
            },
            control: {
                minDistance: 50,
                maxDistance: 300
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const params = {
            envMap: 'EXR',
            roughness: 0.0,
            metalness: 0.0,
            exposure: 1.0,
            debug: false,
        };
        
        let torusMesh, planeMesh;
        let pngCubeRenderTarget, exrCubeRenderTarget;
        let pngBackground, exrBackground;
        
        init();
        
        function init() {
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
            //
        
            let geometry = new THREE.TorusKnotGeometry( 18, 8, 150, 20 );
            let material = new THREE.MeshStandardMaterial( {
                metalness: params.metalness,
                roughness: params.roughness,
                envMapIntensity: 1.0
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
            new EXRLoader().load(assetsPath + 'textures/piz_compressed.exr', function ( texture ) {
        
                texture.mapping = THREE.EquirectangularReflectionMapping;
        
                exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
                exrBackground = texture;
        
            } );
        
            new THREE.TextureLoader().load( assetsPath + 'textures/equirectangular.png', function ( texture ) {
        
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
        
                pngCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
                pngBackground = texture;
        
            } );
        
            const pmremGenerator = new THREE.PMREMGenerator( renderer );
            pmremGenerator.compileEquirectangularShader();
        
        
            const gui = new GUI();
        
            gui.add( params, 'envMap', [ 'EXR', 'PNG' ] );
            gui.add( params, 'roughness', 0, 1, 0.01 );
            gui.add( params, 'metalness', 0, 1, 0.01 );
            gui.add( params, 'exposure', 0, 2, 0.01 );
            gui.add( params, 'debug' );
            gui.open();
        
            app.on("onAppUpdate", render)
        
        }
        
        function render() {
        
            torusMesh.material.roughness = params.roughness;
            torusMesh.material.metalness = params.metalness;
        
            let newEnvMap = torusMesh.material.envMap;
            let background = scene.background;
        
            switch ( params.envMap ) {
        
                case 'EXR':
                    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
                    background = exrBackground;
                    break;
                case 'PNG':
                    newEnvMap = pngCubeRenderTarget ? pngCubeRenderTarget.texture : null;
                    background = pngBackground;
                    break;
        
            }
        
            if ( newEnvMap !== torusMesh.material.envMap ) {
        
                torusMesh.material.envMap = newEnvMap;
                torusMesh.material.needsUpdate = true;
        
                planeMesh.material.map = newEnvMap;
                planeMesh.material.needsUpdate = true;
        
            }
        
            torusMesh.rotation.y += 0.005;
            planeMesh.visible = params.debug;
        
            scene.background = background;
            renderer.toneMappingExposure = params.exposure;
        
        }
    }
    catch (e) {
        console.error(e);
    }
};