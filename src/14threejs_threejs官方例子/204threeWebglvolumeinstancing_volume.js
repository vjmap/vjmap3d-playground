
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/204threeWebglvolumeinstancing
        // --volume_instancing--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_volume_instancing
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 0.1,
                far: 1000,
                position: [ 0, 0, 4]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        
        init();
        
        function init() {
            // Material
        
            const vertexShader = /* glsl */`
                in vec3 position;
                in mat4 instanceMatrix;
        
                uniform mat4 modelMatrix;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform vec3 cameraPos;
        
                out vec3 vOrigin;
                out vec3 vDirection;
        
                void main() {
                    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
        
                    vOrigin = vec3( inverse( instanceMatrix * modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
                    vDirection = position - vOrigin;
        
                    gl_Position = projectionMatrix * mvPosition;
                }
            `;
        
            const fragmentShader = /* glsl */`
                precision highp float;
                precision highp sampler3D;
        
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
        
                in vec3 vOrigin;
                in vec3 vDirection;
        
                out vec4 color;
        
                uniform sampler3D map;
        
                uniform float threshold;
                uniform float steps;
        
                vec2 hitBox( vec3 orig, vec3 dir ) {
                    const vec3 box_min = vec3( - 0.5 );
                    const vec3 box_max = vec3( 0.5 );
                    vec3 inv_dir = 1.0 / dir;
                    vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
                    vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
                    vec3 tmin = min( tmin_tmp, tmax_tmp );
                    vec3 tmax = max( tmin_tmp, tmax_tmp );
                    float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
                    float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
                    return vec2( t0, t1 );
                }
        
                float sample1( vec3 p ) {
                    return texture( map, p ).r;
                }
        
                #define epsilon .0001
        
                vec3 normal( vec3 coord ) {
                    if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
                    if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
                    if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
                    if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
                    if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
                    if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );
        
                    float step = 0.01;
                    float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
                    float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
                    float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );
        
                    return normalize( vec3( x, y, z ) );
                }
        
                void main(){
        
                    vec3 rayDir = normalize( vDirection );
                    vec2 bounds = hitBox( vOrigin, rayDir );
        
                    if ( bounds.x > bounds.y ) discard;
        
                    bounds.x = max( bounds.x, 0.0 );
        
                    vec3 p = vOrigin + bounds.x * rayDir;
                    vec3 inc = 1.0 / abs( rayDir );
                    float delta = min( inc.x, min( inc.y, inc.z ) );
                    delta /= 50.0;
        
                    for ( float t = bounds.x; t < bounds.y; t += delta ) {
        
                        float d = sample1( p + 0.5 );
        
                        if ( d > 0.5 ) {
        
                            color.rgb = p * 2.0; // normal( p + 0.5 ); // * 0.5 + ( p * 1.5 + 0.25 );
                            color.a = 1.;
                            break;
        
                        }
        
                        p += rayDir * delta;
        
                    }
        
                    if ( color.a == 0.0 ) discard;
        
                }
            `;
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new VOXLoader();
            loader.load(assetsPath + 'models/vox/menger.vox', function ( chunks ) {
        
                for ( let i = 0; i < chunks.length; i ++ ) {
        
                    const chunk = chunks[ i ];
        
                    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
                    const material = new THREE.RawShaderMaterial( {
                        glslVersion: THREE.GLSL3,
                        uniforms: {
                            map: { value: new VOXData3DTexture( chunk ) },
                            cameraPos: { value: new THREE.Vector3() }
                        },
                        vertexShader,
                        fragmentShader,
                        side: THREE.BackSide
                    } );
        
                    const mesh = new THREE.InstancedMesh( geometry, material, 50000 );
                    mesh.onBeforeRender = function () {
        
                        this.material.uniforms.cameraPos.value.copy( camera.position );
        
                    };
        
                    const transform = new THREE.Object3D();
        
                    for ( let i = 0; i < mesh.count; i ++ ) {
        
                        transform.position.random().subScalar( 0.5 ).multiplyScalar( 150 );
                        transform.rotation.x = Math.random() * Math.PI;
                        transform.rotation.y = Math.random() * Math.PI;
                        transform.rotation.z = Math.random() * Math.PI;
                        transform.updateMatrix();
        
                        mesh.setMatrixAt( i, transform.matrix );
        
                    }
        
                    scene.add( mesh );
        
                }
        
            } );
        
        }
    }
    catch (e) {
        console.error(e);
    }
};