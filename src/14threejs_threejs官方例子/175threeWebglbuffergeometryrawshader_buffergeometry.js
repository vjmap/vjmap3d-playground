
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/175threeWebglbuffergeometryrawshader
        // --buffergeometry_rawshader--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_rawshader
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 50,
                near: 1,
                far: 10,
                position: [0, 0, 2]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0x101010 );
        
            // geometry
            // nr of triangles with 3 vertices per triangle
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
        
            colorAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader
        
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'color', colorAttribute );
        
            // material
        
            const material = new THREE.RawShaderMaterial( {
        
                uniforms: {
                    time: { value: 1.0 }
                },
                vertexShader: /* glsl */`
                	precision mediump float;
        			precision mediump int;
        
        			uniform mat4 modelViewMatrix; // optional
        			uniform mat4 projectionMatrix; // optional
        
        			attribute vec3 position;
        			attribute vec4 color;
        
        			varying vec3 vPosition;
        			varying vec4 vColor;
        
        			void main()	{
        
        				vPosition = position;
        				vColor = color;
        
        				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
        			}
        
                `,
                fragmentShader: /* glsl */`
                 precision mediump float;
        			precision mediump int;
        
        			uniform float time;
        
        			varying vec3 vPosition;
        			varying vec4 vColor;
        
        			void main()	{
        
        				vec4 color = vec4( vColor );
        				color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
        
        				gl_FragColor = color;
        
        			}
                `,
                side: THREE.DoubleSide,
                transparent: true
        
            } );
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            vjmap3d.Entity.attchObject(mesh).addAction(() => {
                const time = performance.now();
                mesh.rotation.y = time * 0.0005;
                mesh.material.uniforms.time.value = time * 0.005;
            })
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};