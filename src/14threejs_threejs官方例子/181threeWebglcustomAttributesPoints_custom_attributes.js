
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/181threeWebglcustomAttributesPoints
        // --custom_attributes_points--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_custom_attributes_points
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
                far: 10000,
                position: [0, 0, 300]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let sphere;
        
        init();
        
        function init() {
        
        
            const amount = 100000;
            const radius = 200;
        
            const positions = new Float32Array( amount * 3 );
            const colors = new Float32Array( amount * 3 );
            const sizes = new Float32Array( amount );
        
            const vertex = new THREE.Vector3();
            const color = new THREE.Color( 0xffffff );
        
            for ( let i = 0; i < amount; i ++ ) {
        
                vertex.x = ( Math.random() * 2 - 1 ) * radius;
                vertex.y = ( Math.random() * 2 - 1 ) * radius;
                vertex.z = ( Math.random() * 2 - 1 ) * radius;
                vertex.toArray( positions, i * 3 );
        
                if ( vertex.x < 0 ) {
        
                    color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
        
                } else {
        
                    color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
        
                }
        
                color.toArray( colors, i * 3 );
        
                sizes[ i ] = 10;
        
            }
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
            geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const material = new THREE.ShaderMaterial( {
        
                uniforms: {
                    color: { value: new THREE.Color( 0xffffff ) },
                    pointTexture: { value: new THREE.TextureLoader().load(assetsPath + 'textures/sprites/spark1.png' ) }
                },
                vertexShader: /* glsl */`
                attribute float size;
        			attribute vec3 customColor;
        
        			varying vec3 vColor;
        
        			void main() {
        
        				vColor = customColor;
        
        				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
        				gl_PointSize = size * ( 300.0 / -mvPosition.z );
        
        				gl_Position = projectionMatrix * mvPosition;
        
        			}
                `,
                fragmentShader: /* glsl */`
                     uniform vec3 color;
        			uniform sampler2D pointTexture;
        
        			varying vec3 vColor;
        
        			void main() {
        
        				gl_FragColor = vec4( color * vColor, 1.0 );
        				gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
        
        			}
                `,
        
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
        
            } );
        
            //
        
            sphere = new THREE.Points( geometry, material );
            scene.add( sphere );
        
            //
        
            app.signal.onAppUpdate.add(render)
           
        
        }
        
        
        function render() {
        
            const time = Date.now() * 0.005;
        
            sphere.rotation.z = 0.01 * time;
        
            const geometry = sphere.geometry;
            const attributes = geometry.attributes;
        
            for ( let i = 0; i < attributes.size.array.length; i ++ ) {
        
                attributes.size.array[ i ] = 14 + 13 * Math.sin( 0.1 * i + time );
        
            }
        
            attributes.size.needsUpdate = true;
        
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};