
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/117threeWebglpointsWaves
        // --points_waves--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_points_waves
        
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 75,
                near: 1,
                far: 10000,
                position: [0, 0, 1000 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;
        
        let particles, count = 0;
        
        
        init();
        
        function init() {
        
            const numParticles = AMOUNTX * AMOUNTY;
        
            const positions = new Float32Array( numParticles * 3 );
            const scales = new Float32Array( numParticles );
        
            let i = 0, j = 0;
        
            for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
        
                for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
        
                    positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
                    positions[ i + 1 ] = 0; // y
                    positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z
        
                    scales[ j ] = 1;
        
                    i += 3;
                    j ++;
        
                }
        
            }
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );
        
            const material = new THREE.ShaderMaterial( {
        
                uniforms: {
                    color: { value: new THREE.Color( 0xffffff ) },
                },
                vertexShader: /* glsl */`
                attribute float scale;
        
                    void main() {
        
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        
                        gl_PointSize = scale * ( 300.0 / - mvPosition.z );
        
                        gl_Position = projectionMatrix * mvPosition;
        
        }
                `,
                fragmentShader: /* glsl */`
                uniform vec3 color;
        
                    void main() {
        
                        if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
        
                        gl_FragColor = vec4( color, 1.0 );
        
                    }
        
                `,
        
            } );
        
            //
        
            particles = new THREE.Points( geometry, material );
            scene.add( particles );
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        function render() {
        
            camera.position.x += ( app.Input.x() - camera.position.x ) * .05;
            camera.position.y += ( - app.Input.y() - camera.position.y ) * .05;
            camera.lookAt( scene.position );
        
            const positions = particles.geometry.attributes.position.array;
            const scales = particles.geometry.attributes.scale.array;
        
            let i = 0, j = 0;
        
            for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
        
                for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
        
                    positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
                                    ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
        
                    scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 20 +
                                    ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 20;
        
                    i += 3;
                    j ++;
        
                }
        
            }
        
            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.scale.needsUpdate = true;
        
        
            count += 0.1;
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};