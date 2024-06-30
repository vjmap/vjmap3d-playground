
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/136threeWebgltestMemory2
        // --test_memory2--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_test_memory2
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 10000,
                position: [ 0, 0, 2000   ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const N = 100;
        
        
        let geometry;
        
        const meshes = [];
        
        let fragmentShader, vertexShader;
        
        init();
        setInterval( render, 1000 / 60 );
        
        function init() {
        
            vertexShader = /* glsl */`
            
        			void main() {
        
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_Position = projectionMatrix * mvPosition;
        
                        }
            `;
            fragmentShader = /* glsl */`
            	void main() {
        
                    if ( mod ( gl_FragCoord.x, 4.0001 ) < 1.0 || mod ( gl_FragCoord.y, 4.0001 ) < 1.0 )
        
                        gl_FragColor = vec4( XXX, 1.0 );
        
                    else
        
                        gl_FragColor = vec4( 1.0 );
        
                    }
            `;
        
         
        
            geometry = new THREE.SphereGeometry( 15, 64, 32 );
        
            for ( let i = 0; i < N; i ++ ) {
        
                const material = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: generateFragmentShader() } );
        
                const mesh = new THREE.Mesh( geometry, material );
        
                mesh.position.x = ( 0.5 - Math.random() ) * 1000;
                mesh.position.y = ( 0.5 - Math.random() ) * 1000;
                mesh.position.z = ( 0.5 - Math.random() ) * 1000;
        
                scene.add( mesh );
        
                meshes.push( mesh );
        
            }
        
            app.signal.onAppRender.add(render)
        }
        
        //
        
        function generateFragmentShader() {
        
            return fragmentShader.replace( 'XXX', Math.random() + ',' + Math.random() + ',' + Math.random() );
        
        }
        
        function render() {
        
            for ( let i = 0; i < N; i ++ ) {
        
                const mesh = meshes[ i ];
                mesh.material = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: generateFragmentShader() } );
        
            }
        
            renderer.render( scene, camera );
        
            console.log( 'before', renderer.info.programs.length );
        
            for ( let i = 0; i < N; i ++ ) {
        
                const mesh = meshes[ i ];
                mesh.material.dispose();
        
            }
        
            console.log( 'after', renderer.info.programs.length );
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};