
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/161threeWebglbuffergeometryattributesInteger
        // --buffergeometry_attributes_integer--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_attributes_integer
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            camera: {
                fov: 27,
                near: 1,
                far: 3500,
                position: [  0, 0, 2500]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            // geometry
        
            const triangles = 10000;
        
            const geometry = new THREE.BufferGeometry();
        
            const positions = [];
            const uvs = [];
            const textureIndices = [];
        
            const n = 800, n2 = n / 2; // triangles spread in the cube
            const d = 50, d2 = d / 2; // individual triangle size
        
            for ( let i = 0; i < triangles; i ++ ) {
        
                // positions
        
                const x = Math.random() * n - n2;
                const y = Math.random() * n - n2;
                const z = Math.random() * n - n2;
        
                const ax = x + Math.random() * d - d2;
                const ay = y + Math.random() * d - d2;
                const az = z + Math.random() * d - d2;
        
                const bx = x + Math.random() * d - d2;
                const by = y + Math.random() * d - d2;
                const bz = z + Math.random() * d - d2;
        
                const cx = x + Math.random() * d - d2;
                const cy = y + Math.random() * d - d2;
                const cz = z + Math.random() * d - d2;
        
                positions.push( ax, ay, az );
                positions.push( bx, by, bz );
                positions.push( cx, cy, cz );
        
                // uvs
        
                uvs.push( 0, 0 );
                uvs.push( 0.5, 1 );
                uvs.push( 1, 0 );
        
                // texture indices
        
                const t = i % 3;
                textureIndices.push( t, t, t );
        
            }
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
            geometry.setAttribute( 'textureIndex', new THREE.Int16BufferAttribute( textureIndices, 1 ) );
            geometry.attributes.textureIndex.gpuType = THREE.IntType;
        
            geometry.computeBoundingSphere();
        
            // material
        
            const loader = new THREE.TextureLoader();
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const map1 = loader.load( assetsPath + 'textures/crate.gif' );
            const map2 = loader.load( assetsPath +'textures/floors/FloorsCheckerboard_S_Diffuse.jpg' );
            const map3 = loader.load( assetsPath + 'textures/terrain/grasslight-big.jpg' );
        
            const material = new THREE.ShaderMaterial( {
                uniforms: {
                    uTextures: {
                        value: [ map1, map2, map3 ]
                    }
                },
                vertexShader: /* glsl */`
                    in int textureIndex;
        
                    flat out int vIndex; // "flat" indicates that the value will not be interpolated (required for integer attributes)
                    out vec2 vUv;
        
                    void main()	{
        
                        vIndex = textureIndex;
                        vUv = uv;
        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                    }
                `,
                fragmentShader: /* glsl */`
                     flat in int vIndex;
        			in vec2 vUv;
        
        			uniform sampler2D uTextures[ 3 ];
        
        			out vec4 outColor;
        
        			void main()	{
        
        				if ( vIndex == 0 ) outColor = texture( uTextures[ 0 ], vUv );
        				else if ( vIndex == 1 ) outColor = texture( uTextures[ 1 ], vUv );
        				else if ( vIndex == 2 ) outColor = texture( uTextures[ 2 ], vUv );
        
        			}
                `,
                side: THREE.DoubleSide,
                glslVersion: THREE.GLSL3
            } );
        
            // mesh
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            vjmap3d.Entity.attchObject(mesh).addAction(({ elapsed } )=> {
                mesh.rotation.x = elapsed * 0.25;
                mesh.rotation.y = elapsed * 0.5;
            })
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};