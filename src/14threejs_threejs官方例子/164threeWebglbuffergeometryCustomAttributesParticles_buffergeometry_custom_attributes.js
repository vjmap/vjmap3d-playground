
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/164threeWebglbuffergeometryCustomAttributesParticles
        // --buffergeometry_custom_attributes_particles--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_custom_attributes_particles
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 10000,
                position: [  0, 0, 300]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let particleSystem, uniforms, geometry;
        
        const particles = 100000;
        
        init();
        
        function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            uniforms = {
        
                pointTexture: { value: new THREE.TextureLoader().load( assetsPath + 'textures/sprites/spark1.png' ) }
        
            };
        
            const shaderMaterial = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl */`
                     attribute float size;
        
                    varying vec3 vColor;
        
                    void main() {
        
                        vColor = color;
        
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
                        gl_PointSize = size * ( 300.0 / -mvPosition.z );
        
                        gl_Position = projectionMatrix * mvPosition;
        
                    }
                `,
                fragmentShader: /* glsl */`
                   uniform sampler2D pointTexture;
        
                    varying vec3 vColor;
        
                    void main() {
        
                        gl_FragColor = vec4( vColor, 1.0 );
        
                        gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
        
                    }
                `,
        
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
        
            } );
        
        
            const radius = 200;
        
            geometry = new THREE.BufferGeometry();
        
            const positions = [];
            const colors = [];
            const sizes = [];
        
            const color = new THREE.Color();
        
            for ( let i = 0; i < particles; i ++ ) {
        
                positions.push( ( Math.random() * 2 - 1 ) * radius );
                positions.push( ( Math.random() * 2 - 1 ) * radius );
                positions.push( ( Math.random() * 2 - 1 ) * radius );
        
                color.setHSL( i / particles, 1.0, 0.5 );
        
                colors.push( color.r, color.g, color.b );
        
                sizes.push( 20 );
        
            }
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
            geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );
        
            particleSystem = new THREE.Points( geometry, shaderMaterial );
        
            scene.add( particleSystem );
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function animate() {
        
            const time = Date.now() * 0.005;
        
            particleSystem.rotation.z = 0.01 * time;
        
            const sizes = geometry.attributes.size.array;
        
            for ( let i = 0; i < particles; i ++ ) {
        
                sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) );
        
            }
        
            geometry.attributes.size.needsUpdate = true;
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};