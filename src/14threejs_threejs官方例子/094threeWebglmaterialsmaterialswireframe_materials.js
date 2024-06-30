
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/094threeWebglmaterialsmaterialswireframe
        // --materials_wireframe--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_wireframe
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 500,
                position: [ 0, 0, 200]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const API = {
            thickness: 1
        };
        
        let mesh2;
        
        init();
        
        function init() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            new THREE.BufferGeometryLoader().load(assetsPath + 'models/json/WaltHeadLo_buffergeometry.json', function ( geometry ) {
        
                geometry.deleteAttribute( 'normal' );
                geometry.deleteAttribute( 'uv' );
        
                setupAttributes( geometry );
        
                // left
        
                const material1 = new THREE.MeshBasicMaterial( {
        
                    color: 0xe0e0ff,
                    wireframe: true
        
                } );
        
                const mesh1 = new THREE.Mesh( geometry, material1 );
                mesh1.position.set( - 40, 0, 0 );
        
                scene.add( mesh1 );
        
                // right
        
                const material2 = new THREE.ShaderMaterial( {
        
                    uniforms: { 'thickness': { value: API.thickness } },
                    vertexShader: /* glsl */ `
                    attribute vec3 center;
        			varying vec3 vCenter;
        
        			void main() {
        
        				vCenter = center;
        
        				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
        			}`,
                    fragmentShader: /* glsl */ `
                    uniform float thickness;
        
                        varying vec3 vCenter;
        
                        void main() {
        
                            vec3 afwidth = fwidth( vCenter.xyz );
        
                            vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );
        
                            float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );
        
                            gl_FragColor.rgb = gl_FrontFacing ? vec3( 0.9, 0.9, 1.0 ) : vec3( 0.4, 0.4, 0.5 );
                            gl_FragColor.a = edge;
        
                        }
                    `,
                    side: THREE.DoubleSide,
                    alphaToCoverage: true // only works when WebGLRenderer's "antialias" is set to "true"
        
                } );
        
                mesh2 = new THREE.Mesh( geometry, material2 );
                mesh2.position.set( 40, 0, 0 );
        
                scene.add( mesh2 );
        
             
            } );
        
            //
        
            const gui = new GUI();
        
            gui.add( API, 'thickness', 0, 4 ).onChange( function () {
        
                mesh2.material.uniforms.thickness.value = API.thickness;
        
            } );
        
            gui.open();
        
            
        }
        
        function setupAttributes( geometry ) {
        
            const vectors = [
                new THREE.Vector3( 1, 0, 0 ),
                new THREE.Vector3( 0, 1, 0 ),
                new THREE.Vector3( 0, 0, 1 )
            ];
        
            const position = geometry.attributes.position;
            const centers = new Float32Array( position.count * 3 );
        
            for ( let i = 0, l = position.count; i < l; i ++ ) {
        
                vectors[ i % 3 ].toArray( centers, i * 3 );
        
            }
        
            geometry.setAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};