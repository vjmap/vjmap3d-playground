
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/125threeWebglshaderlava
        // --shader_lava--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shader_lava
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 35,
                near: 1,
                far: 3000,
                position: [0, 0, 4]
            },
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let uniforms, mesh;
        
        init();
        
        function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const textureLoader = new THREE.TextureLoader();
        
            const cloudTexture = textureLoader.load(assetsPath + 'textures/lava/cloud.png' );
            const lavaTexture = textureLoader.load(assetsPath +  'textures/lava/lavatile.jpg' );
        
            lavaTexture.colorSpace = THREE.SRGBColorSpace;
        
            cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
            lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
        
            uniforms = {
        
                'fogDensity': { value: 0.45 },
                'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
                'time': { value: 1.0 },
                'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
                'texture1': { value: cloudTexture },
                'texture2': { value: lavaTexture }
        
            };
        
            const size = 0.65;
        
            const material = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl*/`
                uniform vec2 uvScale;
        			varying vec2 vUv;
        
        			void main()
        			{
        
        				vUv = uvScale * uv;
        				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        				gl_Position = projectionMatrix * mvPosition;
        
        			}
                `,
                fragmentShader: /* glsl*/`
                	uniform float time;
        
                    uniform float fogDensity;
                    uniform vec3 fogColor;
        
                    uniform sampler2D texture1;
                    uniform sampler2D texture2;
        
                    varying vec2 vUv;
        
                    void main( void ) {
        
                        vec2 position = - 1.0 + 2.0 * vUv;
        
                        vec4 noise = texture2D( texture1, vUv );
                        vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
                        vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;
        
                        T1.x += noise.x * 2.0;
                        T1.y += noise.y * 2.0;
                        T2.x -= noise.y * 0.2;
                        T2.y += noise.z * 0.2;
        
                        float p = texture2D( texture1, T1 * 2.0 ).a;
        
                        vec4 color = texture2D( texture2, T2 * 2.0 );
                        vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );
        
                        if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
                        if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
                        if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }
        
                        gl_FragColor = temp;
        
                        float depth = gl_FragCoord.z / gl_FragCoord.w;
                        const float LOG2 = 1.442695;
                        float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
                        fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
        
                        gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
        
                    }
                `,
        
            } );
        
            mesh = new THREE.Mesh( new THREE.TorusGeometry( size, 0.3, 30, 30 ), material );
            mesh.rotation.x = 0.3;
            scene.add( mesh );
            vjmap3d.Entity.attchObject(mesh).bloom = true
        
            //
        
            renderer.autoClear = false;
        
        
            app.signal.onAppUpdate.add(e => {
                const delta = 5 * e.deltaTime;
        
                uniforms[ 'time' ].value += 0.2 * delta;
            })
        }
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};