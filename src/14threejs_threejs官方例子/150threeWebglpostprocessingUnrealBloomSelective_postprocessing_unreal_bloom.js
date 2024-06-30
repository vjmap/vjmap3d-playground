
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/150threeWebglpostprocessingUnrealBloomSelective
        // --postprocessing_unreal_bloom_selective--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_postprocessing_unreal_bloom_selective
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1, 
                far: 200,
                position: [  0, 0, 20],
                lookAt: [0, 0, 0]
            },
            control: {
                maxPolarAngle: Math.PI * 0.5,
                minDistance: 1,
                maxDistance: 100
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const BLOOM_SCENE = 1;
        
        const bloomLayer = new THREE.Layers();
        bloomLayer.set( BLOOM_SCENE );
        
        const params = {
            threshold: 0,
            strength: 1,
            radius: 0.5,
            exposure: 1
        };
        
        const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
        const materials = {};
        
        
        app.signal.onCameraUpdate.add(render)
        
        const renderScene = new RenderPass( scene, camera );
        
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;
        
        const bloomComposer = new EffectComposer( renderer );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( renderScene );
        bloomComposer.addPass( bloomPass );
        
        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: /* glsl */`
                    varying vec2 vUv;
        
                    void main() {
        
                        vUv = uv;
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                    uniform sampler2D baseTexture;
        			uniform sampler2D bloomTexture;
        
        			varying vec2 vUv;
        
        			void main() {
        
        				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
        
        			}
        
                `,
                defines: {}
            } ), 'baseTexture'
        );
        mixPass.needsSwap = true;
        
        const outputPass = new OutputPass();
        
        const finalComposer = new EffectComposer( renderer );
        finalComposer.addPass( renderScene );
        finalComposer.addPass( mixPass );
        finalComposer.addPass( outputPass );
        
        const raycaster = new THREE.Raycaster();
        
        const mouse = new THREE.Vector2();
        
        window.addEventListener( 'pointerdown', onPointerDown );
        
        const gui = new GUI();
        
        const bloomFolder = gui.addFolder( 'bloom' );
        
        bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {
        
            bloomPass.threshold = Number( value );
            render();
        
        } );
        
        bloomFolder.add( params, 'strength', 0.0, 3 ).onChange( function ( value ) {
        
            bloomPass.strength = Number( value );
            render();
        
        } );
        
        bloomFolder.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
        
            bloomPass.radius = Number( value );
            render();
        
        } );
        
        const toneMappingFolder = gui.addFolder( 'tone mapping' );
        
        toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
        
            renderer.toneMappingExposure = Math.pow( value, 4.0 );
            render();
        
        } );
        
        setupScene();
        
        function onPointerDown( event ) {
        
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
            raycaster.setFromCamera( mouse, camera );
            const intersects = raycaster.intersectObjects( scene.children, false );
            if ( intersects.length > 0 ) {
        
                const object = intersects[ 0 ].object;
                object.layers.toggle( BLOOM_SCENE );
                render();
        
            }
        
        }
        
        app.signal.onContainerSizeChange.add(() => {
            let width = app.containerSize.width, height = app.containerSize.height;
            bloomComposer.setSize( width, height );
            finalComposer.setSize( width, height );
        
            render();
        })
        
        function setupScene() {
        
            scene.traverse( disposeMaterial );
            scene.children.length = 0;
        
            const geometry = new THREE.IcosahedronGeometry( 1, 15 );
        
            for ( let i = 0; i < 50; i ++ ) {
        
                const color = new THREE.Color();
                color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
        
                const material = new THREE.MeshBasicMaterial( { color: color } );
                const sphere = new THREE.Mesh( geometry, material );
                sphere.position.x = Math.random() * 10 - 5;
                sphere.position.y = Math.random() * 10 - 5;
                sphere.position.z = Math.random() * 10 - 5;
                sphere.position.normalize().multiplyScalar( Math.random() * 4.0 + 2.0 );
                sphere.scale.setScalar( Math.random() * Math.random() + 0.5 );
                scene.add( sphere );
        
                if ( Math.random() < 0.25 ) sphere.layers.enable( BLOOM_SCENE );
        
            }
        
            render();
        
        }
        
        function disposeMaterial( obj ) {
        
            if ( obj.material ) {
        
                obj.material.dispose();
        
            }
        
        }
        
        app.signal.onAppRender.add(render)
        
        function render() {
            scene.traverse( darkenNonBloomed );
            bloomComposer.render();
            scene.traverse( restoreMaterial );
        
            // render the entire scene, then render bloom scene on top
            finalComposer.render();
        }
        
        function darkenNonBloomed( obj ) {
        
            if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
        
                materials[ obj.uuid ] = obj.material;
                obj.material = darkMaterial;
        
            }
        
        }
        
        function restoreMaterial( obj ) {
        
            if ( materials[ obj.uuid ] ) {
        
                obj.material = materials[ obj.uuid ];
                delete materials[ obj.uuid ];
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};