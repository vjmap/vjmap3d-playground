
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/079threeWebglmaterialsnormalmap
        // --materials_normalmap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_normalmap
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                background: 0x494949,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 1,
                far: 10000,
                position: [ 0, 0, 12 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        let directionalLight, pointLight, ambientLight;
        
        let mouseX = 0;
        let mouseY = 0;
        
        let targetX = 0;
        let targetY = 0;
        
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        
        let composer, effectFXAA;
        
        init();
        
        function init() {
        
            // LIGHTS
        
            ambientLight = new THREE.AmbientLight( 0xffffff );
            scene.add( ambientLight );
        
            pointLight = new THREE.PointLight( 0xffffff, 30 );
            pointLight.position.set( 0, 0, 6 );
        
            scene.add( pointLight );
        
            directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
            directionalLight.position.set( 1, - 0.5, - 1 );
            scene.add( directionalLight );
        
            const textureLoader = new THREE.TextureLoader();
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const diffuseMap = textureLoader.load(assetsPath +  'models/gltf/LeePerrySmith/Map-COL.jpg' );
            diffuseMap.colorSpace = THREE.SRGBColorSpace;
        
            const specularMap = textureLoader.load(assetsPath +  'models/gltf/LeePerrySmith/Map-SPEC.jpg' );
            specularMap.colorSpace = THREE.SRGBColorSpace;
        
            const normalMap = textureLoader.load(assetsPath +  'models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg' );
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0xefefef,
                specular: 0x222222,
                shininess: 35,
                map: diffuseMap,
                specularMap: specularMap,
                normalMap: normalMap,
                normalScale: new THREE.Vector2( 0.8, 0.8 )
            } );
        
            vjmap3d.ResManager.loadRes(assetsPath +  'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then( ( gltf ) => {
        
                const geometry = gltf.scene.children[ 0 ].geometry;
        
                mesh = new THREE.Mesh( geometry, material );
        
                mesh.position.y = - 0.5;
        
                scene.add( mesh );
        
        
            } );
        
            // COMPOSER
        
            renderer.autoClear = false;
        
            const renderModel = new RenderPass( scene, camera );
        
            const effectBleach = new ShaderPass( BleachBypassShader );
            const effectColor = new ShaderPass( ColorCorrectionShader );
            const outputPass = new OutputPass();
            effectFXAA = new ShaderPass( FXAAShader );
        
            effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
        
            effectBleach.uniforms[ 'opacity' ].value = 0.2;
        
            effectColor.uniforms[ 'powRGB' ].value.set( 1.4, 1.45, 1.45 );
            effectColor.uniforms[ 'mulRGB' ].value.set( 1.1, 1.1, 1.1 );
        
            const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture() } );
        
            composer = new EffectComposer( renderer, renderTarget );
        
            composer.addPass( renderModel );
            composer.addPass( effectBleach );
            composer.addPass( effectColor );
            composer.addPass( outputPass );
            composer.addPass( effectFXAA );
        
            // EVENTS
        
            document.addEventListener( 'mousemove', onDocumentMouseMove );
            
            app.signal.onContainerSizeChange.add(onWindowResize)
        
            app.signal.onAppRender.add(render)
        }
        
        //
        
        function onWindowResize() {
        
            const width = app.containerSize.width;
            const height = app.containerSize.height;
        
           
            composer.setSize( width, height );
        
            effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
        
        }
        
        function onDocumentMouseMove( event ) {
        
            mouseX = ( event.clientX - windowHalfX );
            mouseY = ( event.clientY - windowHalfY );
        
        }
        
        
        function render() {
        
            targetX = mouseX * .001;
            targetY = mouseY * .001;
        
            if ( mesh ) {
        
                mesh.rotation.y += 0.05 * ( targetX - mesh.rotation.y );
                mesh.rotation.x += 0.05 * ( targetY - mesh.rotation.x );
        
            }
        
            composer.render();
        
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};