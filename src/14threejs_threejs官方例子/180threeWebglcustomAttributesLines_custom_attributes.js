
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/180threeWebglcustomAttributesLines
        // --custom_attributes_lines--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_custom_attributes_lines
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
                position: [0, 0, 400]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let line, uniforms;
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        const loader = new FontLoader();
        loader.load(assetsPath + 'fonts/helvetiker_bold.typeface.json', function ( font ) {
        
            init( font );
        
        } );
        
        function init( font ) {
        
            scene.background = new THREE.Color( 0x050505 );
        
            uniforms = {
        
                amplitude: { value: 5.0 },
                opacity: { value: 0.3 },
                color: { value: new THREE.Color( 0xffffff ) }
        
            };
        
            const shaderMaterial = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl */`
                     uniform float amplitude;
        
                    attribute vec3 displacement;
                    attribute vec3 customColor;
        
                    varying vec3 vColor;
        
                    void main() {
        
                        vec3 newPosition = position + amplitude * displacement;
        
                        vColor = customColor;
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                    uniform vec3 color;
        			uniform float opacity;
        
        			varying vec3 vColor;
        
        			void main() {
        
        				gl_FragColor = vec4( vColor * color, opacity );
        
        			}
                `,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
        
            } );
        
        
            const geometry = new TextGeometry( 'three.js', {
        
                font: font,
        
                size: 50,
                depth: 15,
                curveSegments: 10,
        
                bevelThickness: 5,
                bevelSize: 1.5,
                bevelEnabled: true,
                bevelSegments: 10,
        
            } );
        
            geometry.center();
        
            const count = geometry.attributes.position.count;
        
            const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
            geometry.setAttribute( 'displacement', displacement );
        
            const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
            geometry.setAttribute( 'customColor', customColor );
        
            const color = new THREE.Color( 0xffffff );
        
            for ( let i = 0, l = customColor.count; i < l; i ++ ) {
        
                color.setHSL( i / l, 0.5, 0.5 );
                color.toArray( customColor.array, i * customColor.itemSize );
        
            }
        
            line = new THREE.Line( geometry, shaderMaterial );
            line.rotation.x = 0.2;
            scene.add( line );
        
           app.signal.onAppUpdate.add(render)
        
        }
        
        function render() {
        
            const time = Date.now() * 0.001;
        
            line.rotation.y = 0.25 * time;
        
            uniforms.amplitude.value = Math.sin( 0.5 * time );
            uniforms.color.value.offsetHSL( 0.0005, 0, 0 );
        
            const attributes = line.geometry.attributes;
            const array = attributes.displacement.array;
        
            for ( let i = 0, l = array.length; i < l; i += 3 ) {
        
                array[ i ] += 0.3 * ( 0.5 - Math.random() );
                array[ i + 1 ] += 0.3 * ( 0.5 - Math.random() );
                array[ i + 2 ] += 0.3 * ( 0.5 - Math.random() );
        
            }
        
            attributes.displacement.needsUpdate = true;
        
           
        
        }
    }
    catch (e) {
        console.error(e);
    }
};