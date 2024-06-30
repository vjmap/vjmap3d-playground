
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/169threeWebglbuffergeometryinstancingbillboards
        // --buffergeometry_instancing_billboards--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_instancing_billboards
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 5000,
                position: [0, 0, 1400]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let geometry, material, mesh;
        
        init();
        
        function init() {
        
            const circleGeometry = new THREE.CircleGeometry( 1, 6 );
        
            geometry = new THREE.InstancedBufferGeometry();
            geometry.index = circleGeometry.index;
            geometry.attributes = circleGeometry.attributes;
        
            const particleCount = 75000;
        
            const translateArray = new Float32Array( particleCount * 3 );
        
            for ( let i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {
        
                translateArray[ i3 + 0 ] = Math.random() * 2 - 1;
                translateArray[ i3 + 1 ] = Math.random() * 2 - 1;
                translateArray[ i3 + 2 ] = Math.random() * 2 - 1;
        
            }
        
            geometry.setAttribute( 'translate', new THREE.InstancedBufferAttribute( translateArray, 3 ) );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            material = new THREE.RawShaderMaterial( {
                uniforms: {
                    'map': { value: new THREE.TextureLoader().load(assetsPath + 'textures/sprites/circle.png' ) },
                    'time': { value: 0.0 }
                },
                vertexShader: /* glsl */`
                    precision highp float;
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
                    uniform float time;
        
                    attribute vec3 position;
                    attribute vec2 uv;
                    attribute vec3 translate;
        
                    varying vec2 vUv;
                    varying float vScale;
        
                    void main() {
        
                        vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );
                        vec3 trTime = vec3(translate.x + time,translate.y + time,translate.z + time);
                        float scale =  sin( trTime.x * 2.1 ) + sin( trTime.y * 3.2 ) + sin( trTime.z * 4.3 );
                        vScale = scale;
                        scale = scale * 10.0 + 10.0;
                        mvPosition.xyz += position * scale;
                        vUv = uv;
                        gl_Position = projectionMatrix * mvPosition;
        
                    }
                `,
                fragmentShader: /* glsl */`
                     precision highp float;
        
                    uniform sampler2D map;
        
                    varying vec2 vUv;
                    varying float vScale;
        
                    // HSL to RGB Convertion helpers
                    vec3 HUEtoRGB(float H){
                        H = mod(H,1.0);
                        float R = abs(H * 6.0 - 3.0) - 1.0;
                        float G = 2.0 - abs(H * 6.0 - 2.0);
                        float B = 2.0 - abs(H * 6.0 - 4.0);
                        return clamp(vec3(R,G,B),0.0,1.0);
                    }
        
                    vec3 HSLtoRGB(vec3 HSL){
                        vec3 RGB = HUEtoRGB(HSL.x);
                        float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
                        return (RGB - 0.5) * C + HSL.z;
                    }
        
                    void main() {
                        vec4 diffuseColor = texture2D( map, vUv );
                        gl_FragColor = vec4( diffuseColor.xyz * HSLtoRGB(vec3(vScale/5.0, 1.0, 0.5)), diffuseColor.w );
        
                        if ( diffuseColor.w < 0.5 ) discard;
                    }
                `,
                depthTest: true,
                depthWrite: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            mesh.scale.set( 500, 500, 500 );
            scene.add( mesh );
        
           
            app.signal.onAppUpdate.add(animate)
        
            return true;
        
        }
        
        function animate() {
        
            const time = performance.now() * 0.0005;
        
            material.uniforms[ 'time' ].value = time;
        
            mesh.rotation.x = time * 0.2;
            mesh.rotation.y = time * 0.4;
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};