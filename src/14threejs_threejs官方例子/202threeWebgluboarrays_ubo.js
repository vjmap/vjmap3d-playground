
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/202threeWebgluboarrays
        // --ubo_arrays--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_ubo_arrays
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 0.1,
                far: 100,
                position: [ 0, 50, 50 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let lightingUniformsGroup, lightCenters;
        
        
        const pointLightsMax = 300;
        
        const api = {
            count: 200,
        };
        
        init();
        
        function init() {
        
            camera.lookAt( scene.position );
        
            // geometry
        
            const geometry = new THREE.SphereGeometry();
        
            // uniforms groups
        
            lightingUniformsGroup = new THREE.UniformsGroup();
            lightingUniformsGroup.setName( 'LightingData' );
        
            const data = [];
            const dataColors = [];
            lightCenters = [];
        
            for ( let i = 0; i < pointLightsMax; i ++ ) {
        
                const col = new THREE.Color( 0xffffff * Math.random() ).toArray();
                const x = Math.random() * 50 - 25;
                const z = Math.random() * 50 - 25;
        
                data.push( new THREE.Uniform( new THREE.Vector4( x, 1, z, 0 ) ) ); // light position
                dataColors.push( new THREE.Uniform( new THREE.Vector4( col[ 0 ], col[ 1 ], col[ 2 ], 0 ) ) ); // light color
        
                // Store the center positions
                lightCenters.push( { x, z } );
        
            }
        
            lightingUniformsGroup.add( data ); // light position
            lightingUniformsGroup.add( dataColors ); // light position
            lightingUniformsGroup.add( new THREE.Uniform( pointLightsMax ) ); // light position
        
            const cameraUniformsGroup = new THREE.UniformsGroup();
            cameraUniformsGroup.setName( 'ViewData' );
            cameraUniformsGroup.add( new THREE.Uniform( camera.projectionMatrix ) ); // projection matrix
            cameraUniformsGroup.add( new THREE.Uniform( camera.matrixWorldInverse ) ); // view matrix
        
            const material = new THREE.RawShaderMaterial( {
                uniforms: {
                    modelMatrix: { value: null },
                    normalMatrix: { value: null }
                },
                // uniformsGroups: [ cameraUniformsGroup, lightingUniformsGroup ],
                name: 'Box',
                defines: {
                    POINTLIGHTS_MAX: pointLightsMax
                },
                vertexShader: /* glsl */`
                uniform ViewData {
        				mat4 projectionMatrix;
        				mat4 viewMatrix;
        			};
        
        			uniform mat4 modelMatrix;
        			uniform mat3 normalMatrix;
        
        			in vec3 position;
        			in vec3 normal;
        			in vec2 uv;
        			out vec2 vUv;
        
        			out vec3 vPositionEye;
        			out vec3 vNormalEye;
        
        			void main()	{
        
        				vec4 vertexPositionEye = viewMatrix * modelMatrix * vec4( position, 1.0 );
        
        				vPositionEye = (modelMatrix * vec4( position, 1.0 )).xyz;
        				vNormalEye = (vec4(normal , 1.)).xyz;
        
        				vUv = uv;
        
        				gl_Position = projectionMatrix * vertexPositionEye;
        
        			}
        
                `,
                fragmentShader: /* glsl */`
                precision highp float;
        			precision highp int;
        
        			uniform LightingData {
        				vec4 lightPosition[POINTLIGHTS_MAX];
        				vec4 lightColor[POINTLIGHTS_MAX];
        				float pointLightsCount;
        			};
        			
        			#include <common>
        			float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
        		
        				float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
        		
        				if ( cutoffDistance > 0.0 ) {
        		
        					distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
        		
        				}
        		
        				return distanceFalloff;
        			
        			}
        
        			in vec2 vUv;
        			in vec3 vPositionEye;
        			in vec3 vNormalEye;
        			out vec4 fragColor;
        
        			void main()	{
        
        				vec4 color = vec4(vec3(0.), 1.);
        				for (int x = 0; x < int(pointLightsCount); x++) {
        					vec3 offset = lightPosition[x].xyz - vPositionEye;
        					vec3 dirToLight = normalize( offset );
        					float distance = length( offset );
        
        					float diffuse = max(0.0, dot(vNormalEye, dirToLight));
        					float attenuation = 1.0 / (distance * distance);
        
        					vec3 lightWeighting = lightColor[x].xyz * getDistanceAttenuation( distance, 4., .7 );
        					color.rgb += lightWeighting;
        				}
        				fragColor = color;
        
        			}
                `,
                glslVersion: THREE.GLSL3
            } );
        
            const plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), material.clone() );
            plane.material.uniformsGroups = [ cameraUniformsGroup, lightingUniformsGroup ];
            plane.material.uniforms.modelMatrix.value = plane.matrixWorld;
            plane.material.uniforms.normalMatrix.value = plane.normalMatrix;
            plane.rotation.x = - Math.PI / 2;
            plane.position.y = - 1;
            scene.add( plane );
        
            // meshes
            const gridSize = { x: 10, y: 1, z: 10 };
            const spacing = 6;
        
            for ( let i = 0; i < gridSize.x; i ++ ) {
        
                for ( let j = 0; j < gridSize.y; j ++ ) {
        
                    for ( let k = 0; k < gridSize.z; k ++ ) {
        
                        const mesh = new THREE.Mesh( geometry, material.clone() );
                        mesh.name = 'Sphere';
                        mesh.material.uniformsGroups = [ cameraUniformsGroup, lightingUniformsGroup ];
                        mesh.material.uniforms.modelMatrix.value = mesh.matrixWorld;
                        mesh.material.uniforms.normalMatrix.value = mesh.normalMatrix;
                        scene.add( mesh );
        
                        mesh.position.x = i * spacing - ( gridSize.x * spacing ) / 2;
                        mesh.position.y = 0;
                        mesh.position.z = k * spacing - ( gridSize.z * spacing ) / 2;
        
                    }
        
                }
        
            }
        
        
            // gui
            const gui = new GUI();
            gui.add( api, 'count', 1, pointLightsMax ).step( 1 ).onChange( function () {
        
                lightingUniformsGroup.uniforms[ 2 ].value = api.count;
        
            } );
        
            app.signal.onAppUpdate.add(animate)
        
        }
        
        //
        
        function animate(e) {
        
            const elapsedTime = e.elapsedTime;
        
            const lights = lightingUniformsGroup.uniforms[ 0 ];
        
            // Parameters for circular movement
            const radius = 5; // Smaller radius for individual circular movements
            const speed = 0.5; // Speed of rotation
        
            // Update each light's position
            for ( let i = 0; i < lights.length; i ++ ) {
        
                const light = lights[ i ];
                const center = lightCenters[ i ];
        
                // Calculate circular movement around the light's center
                const angle = speed * elapsedTime + i * 0.5; // Phase difference for each light
                const x = center.x + Math.sin( angle ) * radius;
                const z = center.z + Math.cos( angle ) * radius;
        
                // Update the light's position
                light.value.set( x, 1, z, 0 );
        
            }
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};