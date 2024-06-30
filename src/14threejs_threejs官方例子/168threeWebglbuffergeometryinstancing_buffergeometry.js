
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/168threeWebglbuffergeometryinstancing
        // --buffergeometry_instancing--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_instancing
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
                far: 10,
                position: [0, 0, 2]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        function init() {
            // geometry
        
            const vector = new THREE.Vector4();
        
            const instances = 50000;
        
            const positions = [];
            const offsets = [];
            const colors = [];
            const orientationsStart = [];
            const orientationsEnd = [];
        
            positions.push( 0.025, - 0.025, 0 );
            positions.push( - 0.025, 0.025, 0 );
            positions.push( 0, 0, 0.025 );
        
            // instanced attributes
        
            for ( let i = 0; i < instances; i ++ ) {
        
                // offsets
        
                offsets.push( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
        
                // colors
        
                colors.push( Math.random(), Math.random(), Math.random(), Math.random() );
        
                // orientation start
        
                vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
                vector.normalize();
        
                orientationsStart.push( vector.x, vector.y, vector.z, vector.w );
        
                // orientation end
        
                vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
                vector.normalize();
        
                orientationsEnd.push( vector.x, vector.y, vector.z, vector.w );
        
            }
        
            const geometry = new THREE.InstancedBufferGeometry();
            geometry.instanceCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        
            geometry.setAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
            geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( colors ), 4 ) );
            geometry.setAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
            geometry.setAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );
        
            // material
        
            const material = new THREE.RawShaderMaterial( {
        
                uniforms: {
                    'time': { value: 1.0 },
                    'sineTime': { value: 1.0 }
                },
                vertexShader: /* glsl */`
                precision highp float;
        
                    uniform float sineTime;
        
                    uniform mat4 modelViewMatrix;
                    uniform mat4 projectionMatrix;
        
                    attribute vec3 position;
                    attribute vec3 offset;
                    attribute vec4 color;
                    attribute vec4 orientationStart;
                    attribute vec4 orientationEnd;
        
                    varying vec3 vPosition;
                    varying vec4 vColor;
        
                    void main(){
        
                        vPosition = offset * max( abs( sineTime * 2.0 + 1.0 ), 0.5 ) + position;
                        vec4 orientation = normalize( mix( orientationStart, orientationEnd, sineTime ) );
                        vec3 vcV = cross( orientation.xyz, vPosition );
                        vPosition = vcV * ( 2.0 * orientation.w ) + ( cross( orientation.xyz, vcV ) * 2.0 + vPosition );
        
                        vColor = color;
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                     precision highp float;
        
                    uniform float time;
        
                    varying vec3 vPosition;
                    varying vec4 vColor;
        
                    void main() {
        
                        vec4 color = vec4( vColor );
                        color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
        
                        gl_FragColor = color;
        
                    }
                `,
                side: THREE.DoubleSide,
                forceSinglePass: true,
                transparent: true
        
            } );
        
            //
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
        
            //
        
            const gui = new GUI( { width: 350 } );
            gui.add( geometry, 'instanceCount', 0, instances );
        
            app.signal.onAppUpdate.add(animate)
        }
        
        
        function animate() {
        
            const time = performance.now();
        
            const object = scene.children[ 0 ];
        
            object.rotation.y = time * 0.0005;
            object.material.uniforms[ 'time' ].value = time * 0.005;
            object.material.uniforms[ 'sineTime' ].value = Math.sin( object.material.uniforms[ 'time' ].value * 0.05 );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};