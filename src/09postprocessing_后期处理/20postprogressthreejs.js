
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/postprocessing/20postprogressthreejs
        // --使用threejs后期处理效果--
        // 如果不使用vjmap3d提供的后期处理，需要使用threejs示例中提供的后期处理效果，需要禁止vjmap3d的后期处理，示例如下
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
            entityOutline: {
                enable: false
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
        
        const outlineParams = {
            edgeStrength: 3.0,
            edgeGlow: 0.1,
            edgeThickness: 1.0,
            pulsePeriod: 2,
            rotate: false,
            usePatternTexture: false
        };
        
        const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
        const materials = {};
        
        const renderScene = new RenderPass( scene, camera );
        
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( app.containerSize.width,app.containerSize.height ), 1.5, 0.4, 0.85 );
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
        
        let outlinePass = new OutlinePass( new THREE.Vector2( app.containerSize.width, app.containerSize.height ), scene, camera );
        outlinePass.pulsePeriod = 3;
        outlinePass.visibleEdgeColor.set("#ffff00")
        finalComposer.addPass( outlinePass );
        
        const textureLoader = new THREE.TextureLoader();
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        textureLoader.load(assetsPath + 'textures/tri_pattern.jpg', function ( texture ) {
        
            outlinePass.patternTexture = texture;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        
        } );
        
        
        finalComposer.addPass( mixPass );
        finalComposer.addPass( outputPass );
        
        let effectFXAA = new ShaderPass( FXAAShader );
        effectFXAA.uniforms[ 'resolution' ].value.set( 1 / app.containerSize.width, 1 / app.containerSize.height );
        finalComposer.addPass( effectFXAA );
        
        const gui = new GUI();
        
        const bloomFolder = gui.addFolder( 'bloom' );
        
        bloomFolder.add( params, 'threshold', 0.0, 1.0 ).onChange( function ( value ) {
        
            bloomPass.threshold = Number( value );
        
        } );
        
        bloomFolder.add( params, 'strength', 0.0, 3 ).onChange( function ( value ) {
        
            bloomPass.strength = Number( value );
        
        } );
        
        bloomFolder.add( params, 'radius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
        
            bloomPass.radius = Number( value );
            
        
        } );
        
        const toneMappingFolder = gui.addFolder( 'tone mapping' );
        
        toneMappingFolder.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
        
            renderer.toneMappingExposure = Math.pow( value, 4.0 );
            
        
        } );
        const outlineFolder = gui.addFolder( 'outline' );
        outlineFolder.add( outlineParams, 'edgeStrength', 0.01, 10 ).onChange( function ( value ) {
        
            outlinePass.edgeStrength = Number( value );
        
        } );
        
        outlineFolder.add( outlineParams, 'edgeGlow', 0.0, 1 ).onChange( function ( value ) {
        
            outlinePass.edgeGlow = Number( value );
        
        } );
        
        outlineFolder.add( outlineParams, 'edgeThickness', 1, 4 ).onChange( function ( value ) {
        
            outlinePass.edgeThickness = Number( value );
        
        } );
        
        outlineFolder.add( outlineParams, 'pulsePeriod', 0.0, 5 ).onChange( function ( value ) {
        
            outlinePass.pulsePeriod = Number( value );
        
        } );
        
        outlineFolder.add( outlineParams, 'rotate' );
        
        outlineFolder.add( outlineParams, 'usePatternTexture' ).onChange( function ( value ) {
        
            outlinePass.usePatternTexture = value;
        
        } );
        
        
        const conf = {
            visibleEdgeColor: '#ffff00',
            hiddenEdgeColor:'#190a05'
        
        }
        
        outlineFolder.addColor( conf, 'visibleEdgeColor' ).onChange( function ( value ) {
        
            outlinePass.visibleEdgeColor.set( value );
        
        } );
        
        outlineFolder.addColor( conf, 'hiddenEdgeColor' ).onChange( function ( value ) {
        
            outlinePass.hiddenEdgeColor.set( value );
        
        } );
        
        app.signal.onContainerSizeChange.add(() => {
            let width = app.containerSize.width, height = app.containerSize.height;
            bloomComposer.setSize( width, height );
            finalComposer.setSize( width, height );
        
            effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
            
        })
        
        
        function disposeMaterial( obj ) {
        
            if ( obj.material ) {
        
                obj.material.dispose();
        
            }
        
        }
        
        
        
        function render() {
            scene.traverse( darkenNonBloomed );
            bloomComposer.render();
            scene.traverse( restoreMaterial );
        
            // render the entire scene, then render bloom scene on top
            finalComposer.render();
        }
        app.signal.onAppRender.add(render);
        
        
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
        
        // 下面的代码是支持实体中设置bloom辉光效果
        const getBloomChildMeshes = ( objects,  results) => {
            objects.forEach(object => {
                const children = object.children;
                if (object.isMesh || object.isSprite || object.isLine) {
                    if (!results.has(object)) {
                        if (object.userData.disableBloom  !== true) {
                            results.add(object)
                        }
                    }
                }
                for ( let i = 0, l = children.length; i < l; i ++ ) {
                    getBloomChildMeshes([ children[ i ]], results);
                }
            })
        }
        
        function onBloomChange(bloomObjects) {
            
            let results = new Set();
            // 过滤出当前场景的
            let curBloomObjects = bloomObjects.filter(obj => vjmap3d.getOwerScene(obj) == app.scene)
            getBloomChildMeshes(curBloomObjects, results);
            
            app.scene.traverse(obj => {
                if (results.has(obj)) {
                    obj.layers.enable( BLOOM_SCENE )
                } else {
                    obj.layers.disable( BLOOM_SCENE )
                }
            })
        }
        app.signal.onBloomedChange.add(onBloomChange);
        
        function onOutlineChange(outlineObjects) {
            
            let results = new Set();
            // 过滤出当前场景的
            let curObjects = outlineObjects.filter(obj => vjmap3d.getOwerScene(obj) == app.scene)
            getBloomChildMeshes(curObjects, results);
            
            outlinePass.selectedObjects = Array.from(results);
        }
        app.signal.onOutlineChange.add(onOutlineChange);
        
        
        // 初始化场景
        function setupScene() {
        
            scene.traverse( disposeMaterial );
            scene.children.length = 0;
        
            const geometry = new THREE.IcosahedronGeometry( 1, 15 );
        
            for ( let i = 0; i < 10; i ++ ) {
        
                const color = new THREE.Color();
                color.setHSL( Math.random(), 0.7, Math.random() * 0.2 + 0.05 );
        
                const material = new THREE.MeshBasicMaterial( { color: color } );
                const sphere = new THREE.Mesh( geometry, material );
                sphere.position.x = Math.random() * 10 - 5;
                sphere.position.y = Math.random() * 10 - 5;
                sphere.position.z = Math.random() * 10 - 5;
                sphere.position.normalize().multiplyScalar( Math.random() * 4.0 + 2.0 );
                sphere.scale.setScalar( Math.random() * Math.random() + 0.2 );
                //scene.add( sphere );
                let meshEntity = vjmap3d.Entity.fromObject3d(sphere);
                meshEntity.addTo(app)
                if ( Math.random() < 0.25 ) meshEntity.bloom = true;
                if ( Math.random() < 0.25 ) meshEntity.outline = true;
                meshEntity.pointerEvents = true
                meshEntity.signal.onPointerDownUp.add(e => {
                    if (vjmap3d.isLeftButton(e)) {
                        // 如果是左键
                        meshEntity.bloom = !meshEntity.bloom
                    } else {
                        meshEntity.outline = !meshEntity.outline
                    }
                })
        
            }
        
            
        
        }
        
        setupScene();
        
        
    }
    catch (e) {
        console.error(e);
    }
};