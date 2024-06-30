
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/189threeWebglmultipleRendertargets
        // --multiple_rendertargets--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_multiple_rendertargets
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 0.1,
                far: 50,
                position: [0, 0, 4 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let renderTarget;
        let postScene, postCamera;
        
        const parameters = {
            samples: 4,
            wireframe: false
        };
        
        const gui = new GUI();
        gui.add( parameters, 'samples', 0, 4 ).step( 1 );
        gui.add( parameters, 'wireframe' );
        
        init();
        
        function init() {
        
            // Create a multi render target with Float buffers
        
            renderTarget = new THREE.WebGLRenderTarget(
                window.innerWidth * window.devicePixelRatio,
                window.innerHeight * window.devicePixelRatio,
                {
                    count: 2,
                    minFilter: THREE.NearestFilter,
                    magFilter: THREE.NearestFilter
                }
            );
        
            // Name our G-Buffer attachments for debugging
        
            renderTarget.textures[ 0 ].name = 'diffuse';
            renderTarget.textures[ 1 ].name = 'normal';
        
            // Scene setup
        
            scene.background = new THREE.Color( 0x222222 );
        
           
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.TextureLoader();
        
            const diffuse = loader.load(assetsPath + 'textures/hardwood2_diffuse.jpg');
            diffuse.wrapS = THREE.RepeatWrapping;
            diffuse.wrapT = THREE.RepeatWrapping;
            diffuse.colorSpace = THREE.SRGBColorSpace;
        
            scene.add( new THREE.Mesh(
                new THREE.TorusKnotGeometry( 1, 0.3, 128, 32 ),
                new THREE.RawShaderMaterial( {
                    name: 'G-Buffer Shader',
                    vertexShader: /* glsl */`
                        in vec3 position;
                        in vec3 normal;
                        in vec2 uv;
        
                        out vec3 vNormal;
                        out vec2 vUv;
        
                        uniform mat4 modelViewMatrix;
                        uniform mat4 projectionMatrix;
                        uniform mat3 normalMatrix;
        
                        void main() {
        
                            vUv = uv;
        
                            // get smooth normals
                            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
                            vec3 transformedNormal = normalMatrix * normal;
                            vNormal = normalize( transformedNormal );
        
                            gl_Position = projectionMatrix * mvPosition;
        
                        }
                    `.trim(),
                    fragmentShader: /* glsl */`
                        precision highp float;
                        precision highp int;
        
                        layout(location = 0) out vec4 gColor;
                        layout(location = 1) out vec4 gNormal;
        
                        uniform sampler2D tDiffuse;
                        uniform vec2 repeat;
        
                        in vec3 vNormal;
                        in vec2 vUv;
        
                        void main() {
        
                            // write color to G-Buffer
                            gColor = texture( tDiffuse, vUv * repeat );
        
                            // write normals to G-Buffer
                            gNormal = vec4( normalize( vNormal ), 0.0 );
        
                        }
                    `.trim(),
                    uniforms: {
                        tDiffuse: { value: diffuse },
                        repeat: { value: new THREE.Vector2( 5, 0.5 ) }
                    },
                    glslVersion: THREE.GLSL3
                } )
            ) );
        
            // PostProcessing setup
        
            postScene = new THREE.Scene();
            postCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        
            postScene.add( new THREE.Mesh(
                new THREE.PlaneGeometry( 2, 2 ),
                new THREE.RawShaderMaterial( {
                    name: 'Post-FX Shader',
                    vertexShader: /* glsl */`
                        in vec3 position;
                        in vec2 uv;
        
                        out vec2 vUv;
        
                        uniform mat4 modelViewMatrix;
                        uniform mat4 projectionMatrix;
        
                        void main() {
        
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                        }
                    `.trim(),
                    fragmentShader: /* glsl */`
                        precision highp float;
                        precision highp int;
        
                        vec4 LinearTosRGB( in vec4 value ) {
                            return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
                        }
        
                        layout(location = 0) out vec4 pc_FragColor;
        
                        in vec2 vUv;
        
                        uniform sampler2D tDiffuse;
                        uniform sampler2D tNormal;
        
                        void main() {
        
                            vec4 diffuse = texture( tDiffuse, vUv );
                            vec4 normal = texture( tNormal, vUv );
        
                            pc_FragColor = mix( diffuse, normal, step( 0.5, vUv.x ) );
                            pc_FragColor.a = 1.0;
        
                            pc_FragColor = LinearTosRGB( pc_FragColor );
        
                        }
                    `.trim(),
                    uniforms: {
                        tDiffuse: { value: renderTarget.textures[ 0 ] },
                        tNormal: { value: renderTarget.textures[ 1 ] },
                    },
                    glslVersion: THREE.GLSL3
                } )
            ) );
        
           app.signal.onContainerSizeChange.add(onWindowResize)
           app.signal.onAppBeforeRender.add(() => {
                renderTarget.samples = parameters.samples;
        
                scene.traverse( function ( child ) {
        
                    if ( child.material !== undefined ) {
        
                        child.material.wireframe = parameters.wireframe;
        
                    }
        
                } );
        
                // render scene into target
                renderer.setRenderTarget( renderTarget );
           });
           app.signal.onAppAfterRender.add(() => {
             // render post FX
             renderer.setRenderTarget( null );
             renderer.render( postScene, postCamera );
           });
        }
        
        function onWindowResize() {
        
            const dpr = renderer.getPixelRatio();
            renderTarget.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
        
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};