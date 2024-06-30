
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/138threeWebgltonemapping
        // --tonemapping--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_tonemapping
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 0.25,
                far: 20,
                position: [  - 1.8, 0.6, 2.7   ]
            },
            control: {
                target: [0, 0, - 0.2 ]
            },
            postProcess: {
                enable: false
            }
            
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh
        let gui, guiExposure = null;
        
        const params = {
            exposure: 1.0,
            toneMapping: 'AgX',
            blurriness: 0.3,
            intensity: 1.0,
        };
        
        const toneMappingOptions = {
            None: THREE.NoToneMapping,
            Linear: THREE.LinearToneMapping,
            Reinhard: THREE.ReinhardToneMapping,
            Cineon: THREE.CineonToneMapping,
            ACESFilmic: THREE.ACESFilmicToneMapping,
            AgX: THREE.AgXToneMapping,
            Neutral: THREE.NeutralToneMapping,
            Custom: THREE.CustomToneMapping
        };
        
        init().catch( function ( err ) {
        
            console.error( err );
        
        } );
        
        async function init() {
        
        
            renderer.toneMapping = toneMappingOptions[ params.toneMapping ];
            renderer.toneMappingExposure = params.exposure;
        
            // Set CustomToneMapping to Uncharted2
            // source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
        
            THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
        
                'vec3 CustomToneMapping( vec3 color ) { return color; }',
        
                `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
        
                float toneMappingWhitePoint = 1.0;
        
                vec3 CustomToneMapping( vec3 color ) {
                    color *= toneMappingExposure;
                    return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
        
                }`
        
            );
        
            scene.backgroundBlurriness = params.blurriness;
        
           
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const rgbeLoader = new RGBELoader()
                .setPath(assetsPath + 'textures/equirectangular/' );
        
            const gltfLoader = new GLTFLoader().setPath(assetsPath + 'models/gltf/DamagedHelmet/glTF/' );
        
            const [ texture, gltf ] = await Promise.all( [
                rgbeLoader.loadAsync( 'venice_sunset_1k.hdr' ),
                gltfLoader.loadAsync( 'DamagedHelmet.gltf' ),
            ] );
        
            // environment
        
            texture.mapping = THREE.EquirectangularReflectionMapping;
        
            scene.background = texture;
            scene.environment = texture;
        
            // model
        
            mesh = gltf.scene.getObjectByName( 'node_damagedHelmet_-6514' );
            scene.add( mesh );
        
           
        
            gui = new GUI();
            const toneMappingFolder = gui.addFolder( 'tone mapping' );
        
            toneMappingFolder.add( params, 'toneMapping', Object.keys( toneMappingOptions ) )
        
                .onChange( function () {
        
                    updateGUI( toneMappingFolder );
        
                    renderer.toneMapping = toneMappingOptions[ params.toneMapping ];
                   
        
                } );
        
            const backgroundFolder = gui.addFolder( 'background' );
        
            backgroundFolder.add( params, 'blurriness', 0, 1 )
        
                .onChange( function ( value ) {
        
                    scene.backgroundBlurriness = value;
                   
        
                } );
        
            backgroundFolder.add( params, 'intensity', 0, 1 )
        
                .onChange( function ( value ) {
        
                    scene.backgroundIntensity = value;
                  
        
                } );
        
            updateGUI( toneMappingFolder );
        
            gui.open();
        
        }
        
        function updateGUI( folder ) {
        
            if ( guiExposure !== null ) {
        
                guiExposure.destroy();
                guiExposure = null;
        
            }
        
            if ( params.toneMapping !== 'None' ) {
        
                guiExposure = folder.add( params, 'exposure', 0, 2 )
        
                    .onChange( function () {
        
                        renderer.toneMappingExposure = params.exposure;
                       
                    } );
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};