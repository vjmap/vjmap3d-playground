
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/178threeWebglclipculldistance
        // --clipculldistance--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_clipculldistance
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 10,
                position: [0, 0, 2]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let material;
        
        init();
        
        function init() {
        
        
            if ( renderer.extensions.has( 'WEBGL_clip_cull_distance' ) === false ) {
        
                app.logInfo("WEBGL_clip_cull_distance not supported", "error")
                return;
        
            }
        
            const ext = renderer
                .getContext()
                .getExtension( 'WEBGL_clip_cull_distance' );
            const gl = renderer.getContext();
        
            gl.enable( ext.CLIP_DISTANCE0_WEBGL );
        
            // geometry
        
            const vertexCount = 200 * 3;
        
            const geometry = new THREE.BufferGeometry();
        
            const positions = [];
            const colors = [];
        
            for ( let i = 0; i < vertexCount; i ++ ) {
        
                // adding x,y,z
                positions.push( Math.random() - 0.5 );
                positions.push( Math.random() - 0.5 );
                positions.push( Math.random() - 0.5 );
        
                // adding r,g,b,a
                colors.push( Math.random() * 255 );
                colors.push( Math.random() * 255 );
                colors.push( Math.random() * 255 );
                colors.push( Math.random() * 255 );
        
            }
        
            const positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
            const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );
            colorAttribute.normalized = true;
        
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'color', colorAttribute );
        
            // material
        
            material = new THREE.ShaderMaterial( {
        
                uniforms: {
                    time: { value: 1.0 }
                },
                vertexShader: /* glsl */`
                    uniform float time;
        
                    varying vec4 vColor;
        
                    void main() {
        
                        vColor = color;
        
                        #ifdef USE_CLIP_DISTANCE
                            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                            gl_ClipDistance[ 0 ] = worldPosition.x - sin( time ) * ( 0.5 );
                        #endif
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                    varying vec4 vColor;
        
                    void main() {
        
                        gl_FragColor = vColor;
        
                    }
                `,
                side: THREE.DoubleSide,
                transparent: true,
                vertexColors: true
        
            } );
        
            material.extensions.clipCullDistance = true;
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            material.uniforms.time = app.commonUniforms.iTime
        }
        
    }
    catch (e) {
        console.error(e);
    }
};