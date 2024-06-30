
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/116threeWebglpointsSprites
        // --points_sprites--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_points_sprites
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 75,
                near: 1,
                far: 2000,
                position: [0, 0, 1000 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let parameters;
        const materials = [];
        
        init();
        
        function init() {
        
            scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );
        
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
        
            const textureLoader = new THREE.TextureLoader();
        
            const assignSRGB = ( texture ) => {
        
                texture.colorSpace = THREE.SRGBColorSpace;
        
            };
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const sprite1 = textureLoader.load( assetsPath + 'textures/sprites/snowflake1.png', assignSRGB );
            const sprite2 = textureLoader.load( assetsPath + 'textures/sprites/snowflake2.png', assignSRGB );
            const sprite3 = textureLoader.load( assetsPath + 'textures/sprites/snowflake3.png', assignSRGB );
            const sprite4 = textureLoader.load( assetsPath + 'textures/sprites/snowflake4.png', assignSRGB );
            const sprite5 = textureLoader.load( assetsPath + 'textures/sprites/snowflake5.png', assignSRGB );
        
            for ( let i = 0; i < 10000; i ++ ) {
        
                const x = Math.random() * 2000 - 1000;
                const y = Math.random() * 2000 - 1000;
                const z = Math.random() * 2000 - 1000;
        
                vertices.push( x, y, z );
        
            }
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        
            parameters = [
                [[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
                [[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
                [[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
                [[ 0.85, 0, 0.5 ], sprite5, 8 ],
                [[ 0.80, 0, 0.5 ], sprite4, 5 ]
            ];
        
            for ( let i = 0; i < parameters.length; i ++ ) {
        
                const color = parameters[ i ][ 0 ];
                const sprite = parameters[ i ][ 1 ];
                const size = parameters[ i ][ 2 ];
        
                materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
                materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );
        
                const particles = new THREE.Points( geometry, materials[ i ] );
        
                particles.rotation.x = Math.random() * 6;
                particles.rotation.y = Math.random() * 6;
                particles.rotation.z = Math.random() * 6;
        
                scene.add( particles );
        
            }
        
            //
        
            const gui = new GUI();
        
            const params = {
                texture: true
            };
        
            gui.add( params, 'texture' ).onChange( function ( value ) {
        
                for ( let i = 0; i < materials.length; i ++ ) {
        
                    materials[ i ].map = ( value === true ) ? parameters[ i ][ 1 ] : null;
                    materials[ i ].needsUpdate = true;
        
                }
        
            } );
        
            gui.open();
        
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        
        function render() {
        
            const time = Date.now() * 0.00005;
        
            camera.position.x += ( app.Input.x() - camera.position.x ) * 0.05;
            camera.position.y += ( - app.Input.y() - camera.position.y ) * 0.05;
        
            camera.lookAt( scene.position );
        
            for ( let i = 0; i < scene.children.length; i ++ ) {
        
                const object = scene.children[ i ];
        
                if ( object instanceof THREE.Points ) {
        
                    object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
        
                }
        
            }
        
            for ( let i = 0; i < materials.length; i ++ ) {
        
                const color = parameters[ i ][ 0 ];
        
                const h = ( 360 * ( color[ 0 ] + time ) % 360 ) / 360;
                materials[ i ].color.setHSL( h, color[ 1 ], color[ 2 ], THREE.SRGBColorSpace );
        
            }
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};