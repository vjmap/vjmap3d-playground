
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/194threeWebglshadowmapPcss
        // --shadowmap_pcss--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmap_pcss
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
                position: [7, 13, 7 ]
            },
            control: {
                maxPolarAngle: Math.PI * 0.5,
                minDistance: 10,
                maxDistance: 75,
                target: [ 0, 2.5, 0 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let group;
        
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0xcce0ff, 5, 100 );
        
            // We use this particular camera position in order to expose a bug that can sometimes happen presumably
            // due to lack of precision when interpolating values over really large triangles.
            // It reproduced on at least NVIDIA GTX 1080 and GTX 1050 Ti GPUs when the ground plane was not
            // subdivided into segments.
        
            scene.add( camera );
        
            // lights
        
            scene.add( new THREE.AmbientLight( 0xaaaaaa, 3 ) );
        
            const light = new THREE.DirectionalLight( 0xf0f6ff, 4.5 );
            light.position.set( 2, 8, 4 );
        
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            light.shadow.camera.far = 20;
        
            scene.add( light );
        
            // scene.add( new DirectionalLightHelper( light ) );
            scene.add( new THREE.CameraHelper( light.shadow.camera ) );
        
            // group
        
            group = new THREE.Group();
            scene.add( group );
        
            const geometry = new THREE.SphereGeometry( 0.3, 20, 20 );
        
            for ( let i = 0; i < 20; i ++ ) {
        
                const material = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
        
                const sphere = new THREE.Mesh( geometry, material );
                sphere.position.x = Math.random() - 0.5;
                sphere.position.z = Math.random() - 0.5;
                sphere.position.normalize();
                sphere.position.multiplyScalar( Math.random() * 2 + 1 );
                sphere.castShadow = true;
                sphere.receiveShadow = true;
                sphere.userData.phase = Math.random() * Math.PI;
                group.add( sphere );
        
            }
        
            // ground
        
            const groundMaterial = new THREE.MeshPhongMaterial( { color: 0x898989 } );
        
            const ground = new THREE.Mesh( new THREE.PlaneGeometry( 20000, 20000, 8, 8 ), groundMaterial );
            ground.rotation.x = - Math.PI / 2;
            ground.receiveShadow = true;
            scene.add( ground );
        
            // column
        
            const column = new THREE.Mesh( new THREE.BoxGeometry( 1, 4, 1 ), groundMaterial );
            column.position.y = 2;
            column.castShadow = true;
            column.receiveShadow = true;
            scene.add( column );
        
            // overwrite shadowmap code
        
            let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
        
            shader = shader.replace(
                '#ifdef USE_SHADOWMAP',
                '#ifdef USE_SHADOWMAP' +
                /* glsl */`
                #define LIGHT_WORLD_SIZE 0.005
        				#define LIGHT_FRUSTUM_WIDTH 3.75
        				#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
        				#define NEAR_PLANE 9.5
        
        				#define NUM_SAMPLES 17
        				#define NUM_RINGS 11
        				#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
        
        				vec2 poissonDisk[NUM_SAMPLES];
        
        				void initPoissonSamples( const in vec2 randomSeed ) {
        					float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
        					float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );
        
        					// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
        					float angle = rand( randomSeed ) * PI2;
        					float radius = INV_NUM_SAMPLES;
        					float radiusStep = radius;
        
        					for( int i = 0; i < NUM_SAMPLES; i ++ ) {
        						poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
        						radius += radiusStep;
        						angle += ANGLE_STEP;
        					}
        				}
        
        				float penumbraSize( const in float zReceiver, const in float zBlocker ) { // Parallel plane estimation
        					return (zReceiver - zBlocker) / zBlocker;
        				}
        
        				float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiver ) {
        					// This uses similar triangles to compute what
        					// area of the shadow map we should search
        					float searchRadius = LIGHT_SIZE_UV * ( zReceiver - NEAR_PLANE ) / zReceiver;
        					float blockerDepthSum = 0.0;
        					int numBlockers = 0;
        
        					for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
        						float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonDisk[i] * searchRadius));
        						if ( shadowMapDepth < zReceiver ) {
        							blockerDepthSum += shadowMapDepth;
        							numBlockers ++;
        						}
        					}
        
        					if( numBlockers == 0 ) return -1.0;
        
        					return blockerDepthSum / float( numBlockers );
        				}
        
        				float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiver, float filterRadius ) {
        					float sum = 0.0;
        					float depth;
        					#pragma unroll_loop_start
        					for( int i = 0; i < 17; i ++ ) {
        						depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonDisk[ i ] * filterRadius ) );
        						if( zReceiver <= depth ) sum += 1.0;
        					}
        					#pragma unroll_loop_end
        					#pragma unroll_loop_start
        					for( int i = 0; i < 17; i ++ ) {
        						depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonDisk[ i ].yx * filterRadius ) );
        						if( zReceiver <= depth ) sum += 1.0;
        					}
        					#pragma unroll_loop_end
        					return sum / ( 2.0 * float( 17 ) );
        				}
        
        				float PCSS ( sampler2D shadowMap, vec4 coords ) {
        					vec2 uv = coords.xy;
        					float zReceiver = coords.z; // Assumed to be eye-space z in this code
        
        					initPoissonSamples( uv );
        					// STEP 1: blocker search
        					float avgBlockerDepth = findBlocker( shadowMap, uv, zReceiver );
        
        					//There are no occluders so early out (this saves filtering)
        					if( avgBlockerDepth == -1.0 ) return 1.0;
        
        					// STEP 2: penumbra size
        					float penumbraRatio = penumbraSize( zReceiver, avgBlockerDepth );
        					float filterRadius = penumbraRatio * LIGHT_SIZE_UV * NEAR_PLANE / zReceiver;
        
        					// STEP 3: filtering
        					//return avgBlockerDepth;
        					return PCF_Filter( shadowMap, uv, zReceiver, filterRadius );
        				}
        
                `
            );
        
            shader = shader.replace(
                '#if defined( SHADOWMAP_TYPE_PCF )',
                /* glsl */`
                return PCSS( shadowMap, shadowCoord );
                ` +
                '#if defined( SHADOWMAP_TYPE_PCF )'
            );
        
            THREE.ShaderChunk.shadowmap_pars_fragment = shader;
        
            // renderer
        
            renderer.setClearColor( scene.fog.color );
            renderer.shadowMap.enabled = true;
        
        
            app.signal.onAppUpdate.add(animate)
        }
        
        
        //
        
        function animate() {
        
            const time = performance.now() / 1000;
        
            group.traverse( function ( child ) {
        
                if ( 'phase' in child.userData ) {
        
                    child.position.y = Math.abs( Math.sin( time + child.userData.phase ) ) * 4 + 0.3;
        
                }
        
            } );
        
           
        
        }
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};