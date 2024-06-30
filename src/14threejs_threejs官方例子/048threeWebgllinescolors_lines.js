
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/048threeWebgllinescolors
        // --lines_colors--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lines_colors
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 33,
                near: 1, 
                far: 10000,
                position: [ 0, 0, 1000 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init() {
        
            camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 1, 10000 );
            camera.position.z = 1000;
        
        
            const hilbertPoints = GeometryUtils.hilbert3D( new THREE.Vector3( 0, 0, 0 ), 200.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
        
            const geometry1 = new THREE.BufferGeometry();
            const geometry2 = new THREE.BufferGeometry();
            const geometry3 = new THREE.BufferGeometry();
        
            const subdivisions = 6;
        
            let vertices = [];
            let colors1 = [];
            let colors2 = [];
            let colors3 = [];
        
            const point = new THREE.Vector3();
            const color = new THREE.Color();
        
            const spline = new THREE.CatmullRomCurve3( hilbertPoints );
        
            for ( let i = 0; i < hilbertPoints.length * subdivisions; i ++ ) {
        
                const t = i / ( hilbertPoints.length * subdivisions );
                spline.getPoint( t, point );
        
                vertices.push( point.x, point.y, point.z );
        
                color.setHSL( 0.6, 1.0, Math.max( 0, - point.x / 200 ) + 0.5, THREE.SRGBColorSpace );
                colors1.push( color.r, color.g, color.b );
        
                color.setHSL( 0.9, 1.0, Math.max( 0, - point.y / 200 ) + 0.5, THREE.SRGBColorSpace );
                colors2.push( color.r, color.g, color.b );
        
                color.setHSL( i / ( hilbertPoints.length * subdivisions ), 1.0, 0.5, THREE.SRGBColorSpace );
                colors3.push( color.r, color.g, color.b );
        
            }
        
            geometry1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry3.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        
            geometry1.setAttribute( 'color', new THREE.Float32BufferAttribute( colors1, 3 ) );
            geometry2.setAttribute( 'color', new THREE.Float32BufferAttribute( colors2, 3 ) );
            geometry3.setAttribute( 'color', new THREE.Float32BufferAttribute( colors3, 3 ) );
        
            //
        
            const geometry4 = new THREE.BufferGeometry();
            const geometry5 = new THREE.BufferGeometry();
            const geometry6 = new THREE.BufferGeometry();
        
            vertices = [];
            colors1 = [];
            colors2 = [];
            colors3 = [];
        
            for ( let i = 0; i < hilbertPoints.length; i ++ ) {
        
                const point = hilbertPoints[ i ];
        
                vertices.push( point.x, point.y, point.z );
        
                color.setHSL( 0.6, 1.0, Math.max( 0, ( 200 - hilbertPoints[ i ].x ) / 400 ) * 0.5 + 0.5, THREE.SRGBColorSpace );
                colors1.push( color.r, color.g, color.b );
        
                color.setHSL( 0.3, 1.0, Math.max( 0, ( 200 + hilbertPoints[ i ].x ) / 400 ) * 0.5, THREE.SRGBColorSpace );
                colors2.push( color.r, color.g, color.b );
        
                color.setHSL( i / hilbertPoints.length, 1.0, 0.5, THREE.SRGBColorSpace );
                colors3.push( color.r, color.g, color.b );
        
            }
        
            geometry4.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry5.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            geometry6.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        
            geometry4.setAttribute( 'color', new THREE.Float32BufferAttribute( colors1, 3 ) );
            geometry5.setAttribute( 'color', new THREE.Float32BufferAttribute( colors2, 3 ) );
            geometry6.setAttribute( 'color', new THREE.Float32BufferAttribute( colors3, 3 ) );
        
            // Create lines and add to scene
        
            const material = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: true } );
        
            let line, p;
            const scale = 0.3, d = 225;
        
            const parameters = [
                [ material, scale * 1.5, [ - d, - d / 2, 0 ], geometry1 ],
                [ material, scale * 1.5, [ 0, - d / 2, 0 ], geometry2 ],
                [ material, scale * 1.5, [ d, - d / 2, 0 ], geometry3 ],
        
                [ material, scale * 1.5, [ - d, d / 2, 0 ], geometry4 ],
                [ material, scale * 1.5, [ 0, d / 2, 0 ], geometry5 ],
                [ material, scale * 1.5, [ d, d / 2, 0 ], geometry6 ],
            ];
        
            for ( let i = 0; i < parameters.length; i ++ ) {
        
                p = parameters[ i ];
                line = new THREE.Line( p[ 3 ], p[ 0 ] );
                line.scale.x = line.scale.y = line.scale.z = p[ 1 ];
                line.position.x = p[ 2 ][ 0 ];
                line.position.y = p[ 2 ][ 1 ];
                line.position.z = p[ 2 ][ 2 ];
                scene.add( line );
        
            }
        
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        function animate() {
        
            camera.position.x += ( app.Input.x() - camera.position.x ) * 0.05;
            camera.position.y += ( - app.Input.y() + 200 - camera.position.y ) * 0.05;
        
            camera.lookAt( scene.position );
        
            const time = Date.now() * 0.0005;
        
            for ( let i = 0; i < scene.children.length; i ++ ) {
        
                const object = scene.children[ i ];
        
                if ( object.isLine ) {
        
                    object.rotation.y = time * ( i % 2 ? 1 : - 1 );
        
                }
        
            }
        
            
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};