
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/066threeWebglmaterialschannels
        // --materials_channels--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_channels
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 500,
                far: 3000,
                position: [0, 0, 1500 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const params = {
            material: 'normal',
            camera: 'perspective',
            side: 'double'
        };
        
        const sides = {
            'front': THREE.FrontSide,
            'back': THREE.BackSide,
            'double': THREE.DoubleSide
        };
        
        let cameraOrtho, cameraPerspective;
        let controlsOrtho, controlsPerspective;
        
        let mesh, materialStandard, materialDepthBasic, materialDepthRGBA, materialNormal, materialVelocity;
        
        const SCALE = 2.436143; // from original model
        const BIAS = - 0.428408; // from original model
        
        init();
        
        function init() {
        
            const aspect = app.containerSize.width / app.containerSize.height;
            cameraPerspective = app.camera;
            scene.add( cameraPerspective );
        
            const height = 500;
            cameraOrtho = new THREE.OrthographicCamera( - height * aspect, height * aspect, height, - height, 1000, 2500 );
            cameraOrtho.position.z = 1500;
            scene.add( cameraOrtho );
        
            camera = cameraPerspective;
        
            controlsPerspective = new OrbitControls( cameraPerspective, renderer.domElement );
            controlsPerspective.minDistance = 1000;
            controlsPerspective.maxDistance = 2400;
            controlsPerspective.enablePan = false;
            controlsPerspective.enableDamping = true;
        
            controlsOrtho = new OrbitControls( cameraOrtho, renderer.domElement );
            controlsOrtho.minZoom = 0.5;
            controlsOrtho.maxZoom = 1.5;
            controlsOrtho.enablePan = false;
            controlsOrtho.enableDamping = true;
        
            // lights
        
            const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
            scene.add( ambientLight );
        
            const pointLight = new THREE.PointLight( 0xff0000, 1.5, 0, 0 );
            pointLight.position.z = 2500;
            scene.add( pointLight );
        
            const pointLight2 = new THREE.PointLight( 0xff6666, 3, 0, 0 );
            camera.add( pointLight2 );
        
            const pointLight3 = new THREE.PointLight( 0x0000ff, 1.5, 0, 0 );
            pointLight3.position.x = - 1000;
            pointLight3.position.z = 1000;
            scene.add( pointLight3 );
        
            // textures
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const textureLoader = new THREE.TextureLoader();
            const normalMap = textureLoader.load(assetsPath +  'models/obj/ninja/normal.png' );
            const aoMap = textureLoader.load(assetsPath +   'models/obj/ninja/ao.jpg' );
            const displacementMap = textureLoader.load(assetsPath +   'models/obj/ninja/displacement.jpg' );
        
            // material
        
            materialStandard = new THREE.MeshStandardMaterial( {
                color: 0xffffff,
        
                metalness: 0.5,
                roughness: 0.6,
        
                displacementMap: displacementMap,
                displacementScale: SCALE,
                displacementBias: BIAS,
        
                aoMap: aoMap,
        
                normalMap: normalMap,
                normalScale: new THREE.Vector2( 1, - 1 ),
        
                //flatShading: true,
        
                side: THREE.DoubleSide
            } );
        
            materialDepthBasic = new THREE.MeshDepthMaterial( {
                depthPacking: THREE.BasicDepthPacking,
        
                displacementMap: displacementMap,
                displacementScale: SCALE,
                displacementBias: BIAS,
        
                side: THREE.DoubleSide
            } );
        
            materialDepthRGBA = new THREE.MeshDepthMaterial( {
                depthPacking: THREE.RGBADepthPacking,
        
                displacementMap: displacementMap,
                displacementScale: SCALE,
                displacementBias: BIAS,
        
                side: THREE.DoubleSide
            } );
        
            materialNormal = new THREE.MeshNormalMaterial( {
                displacementMap: displacementMap,
                displacementScale: SCALE,
                displacementBias: BIAS,
        
                normalMap: normalMap,
                normalScale: new THREE.Vector2( 1, - 1 ),
        
                //flatShading: true,
        
                side: THREE.DoubleSide
            } );
        
            materialVelocity = new THREE.ShaderMaterial( {
                uniforms: THREE.UniformsUtils.clone( VelocityShader.uniforms ),
                vertexShader: VelocityShader.vertexShader,
                fragmentShader: VelocityShader.fragmentShader,
                side: THREE.DoubleSide
            } );
            materialVelocity.displacementMap = displacementMap; // required for defines
            materialVelocity.uniforms.displacementMap.value = displacementMap;
            materialVelocity.uniforms.displacementScale.value = SCALE;
            materialVelocity.uniforms.displacementBias.value = BIAS;
        
            //
        
            const loader = vjmap3d.LoadManager.objLoader;
            loader.load(assetsPath +   'models/obj/ninja/ninjaHead_Low.obj', function ( group ) {
        
                const geometry = group.children[ 0 ].geometry;
                geometry.center();
        
                mesh = new THREE.Mesh( geometry, materialNormal );
                mesh.scale.multiplyScalar( 25 );
                mesh.userData.matrixWorldPrevious = new THREE.Matrix4(); // for velocity
                scene.add( mesh );
        
            } );
        
            //
        
            const gui = new GUI();
            gui.add( params, 'material', [ 'standard', 'normal', 'velocity', 'depthBasic', 'depthRGBA' ] );
            gui.add( params, 'camera', [ 'perspective', 'ortho' ] );
            gui.add( params, 'side', [ 'front', 'back', 'double' ] );
        
            
            app.on("onAppUpdate", render)
            app.on("onAppAfterRender", () => {
                scene.traverse( function ( object ) {
        
                    if ( object.isMesh ) {
            
                        object.userData.matrixWorldPrevious.copy( object.matrixWorld );
            
                    }
            
                } );
            })
        }
        
        
        function render() {
        
            if ( mesh ) {
        
                let material = mesh.material;
        
                switch ( params.material ) {
        
                    case 'standard': material = materialStandard; break;
                    case 'depthBasic': material = materialDepthBasic; break;
                    case 'depthRGBA': material = materialDepthRGBA; break;
                    case 'normal': material = materialNormal; break;
                    case 'velocity': material = materialVelocity; break;
        
                }
        
                if ( sides[ params.side ] !== material.side ) {
        
                    switch ( params.side ) {
        
                        case 'front': material.side = THREE.FrontSide; break;
                        case 'back': material.side = THREE.BackSide; break;
                        case 'double': material.side = THREE.DoubleSide; break;
        
                    }
        
                    material.needsUpdate = true;
        
                }
        
                mesh.material = material;
        
            }
        
            switch ( params.camera ) {
        
                case 'perspective':
                    camera = cameraPerspective;
                    break;
                case 'ortho':
                    camera = cameraOrtho;
                    break;
        
            }
        
            controlsPerspective.update();
            controlsOrtho.update(); // must update both controls for damping to complete
        
            // remember camera projection changes
        
            materialVelocity.uniforms.previousProjectionViewMatrix.value.copy( materialVelocity.uniforms.currentProjectionViewMatrix.value );
            materialVelocity.uniforms.currentProjectionViewMatrix.value.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        
            if ( mesh && mesh.userData.matrixWorldPrevious ) {
        
                materialVelocity.uniforms.modelMatrixPrev.value.copy( mesh.userData.matrixWorldPrevious );
        
            }
        }
        
    }
    catch (e) {
        console.error(e);
    }
};