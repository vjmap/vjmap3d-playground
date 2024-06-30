
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/192threeWebglrendertargetTexture2darray
        // --rendertarget_texture2darray--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_rendertarget_texture2darray
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 0.1,
                far: 2000,
                position: [0, 0, 70 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const DIMENSIONS = {
            width: 256,
            height: 256,
            depth: 109
        };
        
        const params = {
            intensity: 1
        };
        
        /** Post-processing objects */
        
        const postProcessScene = new THREE.Scene();
        const postProcessCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        
        const renderTarget = new THREE.WebGLArrayRenderTarget( DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.depth );
        renderTarget.texture.format = THREE.RedFormat;
        
        const postProcessMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                uTexture: { value: null },
                uDepth: { value: 55 },
                uIntensity: { value: 1.0 }
            },
            vertexShader: /* glsl */`
             out vec2 vUv;
        
                void main()
                {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
        
            `.trim(),
            fragmentShader: /* glsl */`
                precision highp sampler2DArray;
                precision mediump float;
        
                in vec2 vUv;
        
                uniform sampler2DArray uTexture;
                uniform int uDepth;
                uniform float uIntensity;
        
                void main()
                {
                    float voxel = texture(uTexture, vec3( vUv, uDepth )).r;
                    gl_FragColor.r = voxel * uIntensity;
                }
            `.trim()
        } );
        
        let depthStep = 0.4;
        
        let mesh;
        
        const planeWidth = 50;
        const planeHeight = 50;
        
        init();
        
        function init() {
        
        
            /** Post-processing scene */
        
            const planeGeometry = new THREE.PlaneGeometry( 2, 2 );
            const screenQuad = new THREE.Mesh( planeGeometry, postProcessMaterial );
            postProcessScene.add( screenQuad );
        
            // 2D Texture array is available on WebGL 2.0
        
        
            const gui = new GUI();
        
            gui.add( params, 'intensity', 0, 1 ).step( 0.01 ).onChange( value => postProcessMaterial.uniforms.uIntensity.value = value );
            gui.open();
        
            // width 256, height 256, depth 109, 8-bit, zip archived raw data
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            new THREE.FileLoader()
                .setResponseType( 'arraybuffer' )
                .load( assetsPath + 'textures/3d/head256x256x109.zip', function ( data ) {
        
                    const zip = unzipSync( new Uint8Array( data ) );
                    const array = new Uint8Array( zip[ 'head256x256x109' ].buffer );
        
                    const texture = new THREE.DataArrayTexture( array, DIMENSIONS.width, DIMENSIONS.height, DIMENSIONS.depth );
                    texture.format = THREE.RedFormat;
                    texture.needsUpdate = true;
        
                    const material = new THREE.ShaderMaterial( {
                        uniforms: {
                            diffuse: { value: renderTarget.texture },
                            depth: { value: 55 },
                            size: { value: new THREE.Vector2( planeWidth, planeHeight ) }
                        },
                        vertexShader: /* glsl */`
                        uniform vec2 size;
                        out vec2 vUv;
        
                        void main() {
        
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                            // Convert position.xy to 1.0-0.0
        
                            vUv.xy = position.xy / size + 0.5;
                            vUv.y = 1.0 - vUv.y; // original data is upside down
        
                        }
                        `.trim(),
                        fragmentShader: /* glsl */`
                             precision highp float;
                            precision highp int;
                            precision highp sampler2DArray;
        
                            uniform sampler2DArray diffuse;
                            in vec2 vUv;
                            uniform int depth;
        
                            void main() {
        
                                vec4 color = texture( diffuse, vec3( vUv, depth ) );
        
                                // lighten a bit
                                gl_FragColor = vec4( color.rrr * 1.5, 1.0 );
                            }
                        `.trim()
                    } );
        
                    const geometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
        
                    mesh = new THREE.Mesh( geometry, material );
        
                    scene.add( mesh );
        
                    postProcessMaterial.uniforms.uTexture.value = texture;
        
                    app.signal.onAppBeforeRender.add(animate)
        
                } );
        
        }
        
        
        function animate() {
        
            let value = mesh.material.uniforms[ 'depth' ].value;
        
            value += depthStep;
        
            if ( value > 109.0 || value < 0.0 ) {
        
                if ( value > 1.0 ) value = 109.0 * 2.0 - value;
                if ( value < 0.0 ) value = - value;
        
                depthStep = - depthStep;
        
            }
        
            mesh.material.uniforms[ 'depth' ].value = value;
        
           
            renderTo2DArray();
        }
        
        /**
         * Renders the 2D array into the render target `renderTarget`.
         */
        function renderTo2DArray() {
        
            const layer = Math.floor( mesh.material.uniforms[ 'depth' ].value );
            postProcessMaterial.uniforms.uDepth.value = layer;
            renderer.setRenderTarget( renderTarget, layer );
            renderer.render( postProcessScene, postProcessCamera );
            renderer.setRenderTarget( null );
        
        }
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};