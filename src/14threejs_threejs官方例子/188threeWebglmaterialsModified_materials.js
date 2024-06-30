
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/188threeWebglmaterialsModified
        // --materials_modified--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_modified
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 0.1,
                far: 100,
                position: [0, 0, 20 ]
            },
            control: {
                minDistance: 10,
                maxDistance: 50
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then ( ( gltf ) => {
        
                const geometry = gltf.scene.children[ 0 ].geometry;
        
                let mesh = new THREE.Mesh( geometry, buildTwistMaterial( 2.0 ) );
                mesh.position.x = - 3.5;
                mesh.position.y = - 0.5;
                scene.add( mesh );
        
                mesh = new THREE.Mesh( geometry, buildTwistMaterial( - 2.0 ) );
                mesh.position.x = 3.5;
                mesh.position.y = - 0.5;
                scene.add( mesh );
        
            } );
        
          app.signal.onAppUpdate.add(render)
        
        }
        
        function buildTwistMaterial( amount ) {
        
            const material = new THREE.MeshNormalMaterial();
            material.onBeforeCompile = function ( shader ) {
        
                shader.uniforms.time = { value: 0 };
        
                shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    [
                        `float theta = sin( time + position.y ) / ${ amount.toFixed( 1 ) };`,
                        'float c = cos( theta );',
                        'float s = sin( theta );',
                        'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                        'vec3 transformed = vec3( position ) * m;',
                        'vNormal = vNormal * m;'
                    ].join( '\n' )
                );
        
                material.userData.shader = shader;
        
            };
        
            // Make sure WebGLRenderer doesnt reuse a single program
        
            material.customProgramCacheKey = function () {
        
                return amount.toFixed( 1 );
        
            };
        
            return material;
        
        }
        
        
        function render() {
        
            scene.traverse( function ( child ) {
        
                if ( child.isMesh ) {
        
                    const shader = child.material.userData.shader;
        
                    if ( shader ) {
        
                        shader.uniforms.time.value = performance.now() / 1000;
        
                    }
        
                }
        
            } );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};