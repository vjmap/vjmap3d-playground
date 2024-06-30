
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/179threeWebglcustomAttributes
        // --custom_attributes--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_custom_attributes
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 30,
                near: 1,
                far: 10000,
                position: [0, 0, 300]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let sphere, uniforms;
        
        let displacement, noise;
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0x050505 );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            uniforms = {
        
                'amplitude': { value: 1.0 },
                'color': { value: new THREE.Color( 0xff2200 ) },
                'colorTexture': { value: new THREE.TextureLoader().load( assetsPath + 'textures/water.jpg' ) }
        
            };
        
            uniforms[ 'colorTexture' ].value.wrapS = uniforms[ 'colorTexture' ].value.wrapT = THREE.RepeatWrapping;
        
            const shaderMaterial = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl */`
                    uniform float amplitude;
        
                    attribute float displacement;
        
                    varying vec3 vNormal;
                    varying vec2 vUv;
        
                    void main() {
        
                        vNormal = normal;
                        vUv = ( 0.5 + amplitude ) * uv + vec2( amplitude );
        
                        vec3 newPosition = position + amplitude * normal * vec3( displacement );
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        
                    }
        
                `,
                fragmentShader: /* glsl */`
                    varying vec3 vNormal;
        			varying vec2 vUv;
        
        			uniform vec3 color;
        			uniform sampler2D colorTexture;
        
        			void main() {
        
        				vec3 light = vec3( 0.5, 0.2, 1.0 );
        				light = normalize( light );
        
        				float dProd = dot( vNormal, light ) * 0.5 + 0.5;
        
        				vec4 tcolor = texture2D( colorTexture, vUv );
        				vec4 gray = vec4( vec3( tcolor.r * 0.3 + tcolor.g * 0.59 + tcolor.b * 0.11 ), 1.0 );
        
        				gl_FragColor = gray * vec4( vec3( dProd ) * vec3( color ), 1.0 );
        
        			}
                `,
        
            } );
        
        
            const radius = 50, segments = 128, rings = 64;
        
            const geometry = new THREE.SphereGeometry( radius, segments, rings );
        
            displacement = new Float32Array( geometry.attributes.position.count );
            noise = new Float32Array( geometry.attributes.position.count );
        
            for ( let i = 0; i < displacement.length; i ++ ) {
        
                noise[ i ] = Math.random() * 5;
        
            }
        
            geometry.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );
        
            sphere = new THREE.Mesh( geometry, shaderMaterial );
            scene.add( sphere );
        
           app.signal.onAppUpdate.add(render)
        
        }
        
        
        function render() {
        
            const time = Date.now() * 0.01;
        
            sphere.rotation.y = sphere.rotation.z = 0.01 * time;
        
            uniforms[ 'amplitude' ].value = 2.5 * Math.sin( sphere.rotation.y * 0.125 );
            uniforms[ 'color' ].value.offsetHSL( 0.0005, 0, 0 );
        
            for ( let i = 0; i < displacement.length; i ++ ) {
        
                displacement[ i ] = Math.sin( 0.1 * i + time );
        
                noise[ i ] += 0.5 * ( 0.5 - Math.random() );
                noise[ i ] = THREE.MathUtils.clamp( noise[ i ], - 5, 5 );
        
                displacement[ i ] += noise[ i ];
        
            }
        
            sphere.geometry.attributes.displacement.needsUpdate = true;
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};