
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/162threeWebglbuffergeometryattributesnone
        // --buffergeometry_attributes_none--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_attributes_none
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
                position: [  0, 0, 4]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            // geometry
        
            const triangleCount = 10000;
            const vertexCountPerTriangle = 3;
            const vertexCount = triangleCount * vertexCountPerTriangle;
        
            const geometry = new THREE.BufferGeometry();
            geometry.setDrawRange( 0, vertexCount );
        
            // material
        
            const material = new THREE.RawShaderMaterial( {
                uniforms: {
                    seed: { value: 42 },
                },
                vertexShader: /* glsl */`
                    uniform mat4 modelViewMatrix;
        			uniform mat4 projectionMatrix;
        
        			uniform float seed;
        
        			const uint ieeeMantissa = 0x007FFFFFu;
        			const uint ieeeOne = 0x3F800000u;
        
        			uint hash(uint x) {
        				x += ( x << 10u );
        				x ^= ( x >>  6u );
        				x += ( x <<  3u );
        				x ^= ( x >> 11u );
        				x += ( x << 15u );
        				return x;
        			}
        
        			uint hash(uvec2 v) { return hash( v.x ^ hash(v.y) ); }
        
        			float hashNoise(vec2 xy) {
        				uint m = hash(floatBitsToUint(xy));
        
        				m &= ieeeMantissa;
        				m |= ieeeOne;
        
        				return uintBitsToFloat( m ) - 1.0;
        			}
        
        			float pseudoRandom(float lower, float delta, in vec2 xy) {
        				return lower + delta*hashNoise(xy);
        			}
        
        			vec3 pseudoRandomVec3(float lower, float upper, int index) {
        				float delta = upper - lower;
        				float x = pseudoRandom(lower, delta, vec2(index, 0));
        				float y = pseudoRandom(lower, delta, vec2(index, 1));
        				float z = pseudoRandom(lower, delta, vec2(index, 2));
        				return vec3(x, y, z);
        			}
        
        			out vec3 vColor;
        
        			void main()	{
        
        				const float scale = 1.0/64.0;
        				vec3 position = pseudoRandomVec3(-1.0, +1.0, gl_VertexID/3) + scale * pseudoRandomVec3(-1.0, +1.0, gl_VertexID);
        				vec3 color = pseudoRandomVec3(0.25, 1.0, gl_VertexID/3);
        				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
        				vColor = color;
        
        			}
                `,
                fragmentShader: /* glsl */`
                
        			precision mediump float;
        
                    in vec3 vColor;
        
                    out vec4 fColor;
        
                    void main()	{
        
                        fColor = vec4(vColor, 1);
        
                    }
                `,
                side: THREE.DoubleSide,
                glslVersion: THREE.GLSL3
            } );
        
            // mesh
        
            mesh = new THREE.Mesh( geometry, material );
            mesh.frustumCulled = false;
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