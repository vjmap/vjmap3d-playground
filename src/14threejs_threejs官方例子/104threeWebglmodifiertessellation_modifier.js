
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/104threeWebglmodifiertessellation
        // --modifier_tessellation--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_modifier_tessellation
        
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 10000,
                position: [- 100, 100, 200]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let mesh, uniforms;
        
        const loader = new FontLoader();
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        loader.load(assetsPath + 'fonts/helvetiker_bold.typeface.json', function ( font ) {
        
            init( font );
        
        } );
        
        function init( font ) {
        
            //
        
            let geometry = new TextGeometry( 'THREE.JS', {
        
                font: font,
        
                size: 40,
                depth: 5,
                curveSegments: 3,
        
                bevelThickness: 2,
                bevelSize: 1,
                bevelEnabled: true
        
            } );
        
            geometry.center();
        
            const tessellateModifier = new TessellateModifier( 8, 6 );
        
            geometry = tessellateModifier.modify( geometry );
        
            //
        
            const numFaces = geometry.attributes.position.count / 3;
        
            const colors = new Float32Array( numFaces * 3 * 3 );
            const displacement = new Float32Array( numFaces * 3 * 3 );
        
            const color = new THREE.Color();
        
            for ( let f = 0; f < numFaces; f ++ ) {
        
                const index = 9 * f;
        
                const h = 0.2 * Math.random();
                const s = 0.5 + 0.5 * Math.random();
                const l = 0.5 + 0.5 * Math.random();
        
                color.setHSL( h, s, l );
        
                const d = 10 * ( 0.5 - Math.random() );
        
                for ( let i = 0; i < 3; i ++ ) {
        
                    colors[ index + ( 3 * i ) ] = color.r;
                    colors[ index + ( 3 * i ) + 1 ] = color.g;
                    colors[ index + ( 3 * i ) + 2 ] = color.b;
        
                    displacement[ index + ( 3 * i ) ] = d;
                    displacement[ index + ( 3 * i ) + 1 ] = d;
                    displacement[ index + ( 3 * i ) + 2 ] = d;
        
                }
        
            }
        
            geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
            geometry.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );
        
            //
        
            uniforms = {
        
                amplitude: { value: 0.0 }
        
            };
        
            const shaderMaterial = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl */`
                
        			uniform float amplitude;
        
                    attribute vec3 customColor;
                    attribute vec3 displacement;
        
                    varying vec3 vNormal;
                    varying vec3 vColor;
        
                    void main() {
        
                        vNormal = normal;
                        vColor = customColor;
        
                        vec3 newPosition = position + normal * amplitude * displacement;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                 varying vec3 vNormal;
        			varying vec3 vColor;
        
        			void main() {
        
        				const float ambient = 0.4;
        
        				vec3 light = vec3( 1.0 );
        				light = normalize( light );
        
        				float directional = max( dot( vNormal, light ), 0.0 );
        
        				gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );
        
        			}
                `
        
            } );
        
            //
        
            mesh = new THREE.Mesh( geometry, shaderMaterial );
        
            scene.add( mesh );
        
            app.signal.onAppUpdate.add(render)
        }
        
        function render() {
        
            const time = Date.now() * 0.001;
        
            uniforms.amplitude.value = 1.0 + Math.sin( time * 0.5 );
        
           
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};