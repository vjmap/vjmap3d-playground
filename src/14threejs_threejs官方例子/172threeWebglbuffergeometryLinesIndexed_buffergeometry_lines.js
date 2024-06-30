
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/172threeWebglbuffergeometryLinesIndexed
        // --buffergeometry_lines_indexed--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_lines_indexed
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 27,
                near: 1,
                far: 10000,
                position: [0, 0, 9000]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let parent_node;
        
        init();
        
        function init() {
        
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.LineBasicMaterial( { vertexColors: true } );
        
            const indices = [];
            const positions = [];
            const colors = [];
        
            let next_positions_index = 0;
        
            //
        
            const iteration_count = 4;
            const rangle = 60 * Math.PI / 180.0;
        
            function add_vertex( v ) {
        
                positions.push( v.x, v.y, v.z );
                colors.push( Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1 );
        
                return next_positions_index ++;
        
            }
        
            // simple Koch curve
        
            function snowflake_iteration( p0, p4, depth ) {
        
                if ( -- depth < 0 ) {
        
                    const i = next_positions_index - 1; // p0 already there
                    add_vertex( p4 );
                    indices.push( i, i + 1 );
        
                    return;
        
                }
        
                const v = p4.clone().sub( p0 );
                const v_tier = v.clone().multiplyScalar( 1 / 3 );
                const p1 = p0.clone().add( v_tier );
        
                const angle = Math.atan2( v.y, v.x ) + rangle;
                const length = v_tier.length();
                const p2 = p1.clone();
                p2.x += Math.cos( angle ) * length;
                p2.y += Math.sin( angle ) * length;
        
                const p3 = p0.clone().add( v_tier ).add( v_tier );
        
                snowflake_iteration( p0, p1, depth );
                snowflake_iteration( p1, p2, depth );
                snowflake_iteration( p2, p3, depth );
                snowflake_iteration( p3, p4, depth );
        
            }
        
            function snowflake( points, loop, x_offset ) {
        
                for ( let iteration = 0; iteration != iteration_count; iteration ++ ) {
        
                    add_vertex( points[ 0 ] );
        
                    for ( let p_index = 0, p_count = points.length - 1; p_index != p_count; p_index ++ ) {
        
                        snowflake_iteration( points[ p_index ], points[ p_index + 1 ], iteration );
        
                    }
        
                    if ( loop ) snowflake_iteration( points[ points.length - 1 ], points[ 0 ], iteration );
        
                    // translate input curve for next iteration
        
                    for ( let p_index = 0, p_count = points.length; p_index != p_count; p_index ++ ) {
        
                        points[ p_index ].x += x_offset;
        
                    }
        
                }
        
            }
        
            let y = 0;
        
            snowflake(
                [
                    new THREE.Vector3( 0, y, 0 ),
                    new THREE.Vector3( 500, y, 0 )
                ],
                false, 600
            );
        
            y += 600;
            snowflake(
                [
                    new THREE.Vector3( 0, y, 0 ),
                    new THREE.Vector3( 250, y + 400, 0 ),
                    new THREE.Vector3( 500, y, 0 )
                ],
                true, 600
            );
        
            y += 600;
            snowflake(
                [
                    new THREE.Vector3( 0, y, 0 ),
                    new THREE.Vector3( 500, y, 0 ),
                    new THREE.Vector3( 500, y + 500, 0 ),
                    new THREE.Vector3( 0, y + 500, 0 )
                ],
                true, 600
            );
        
            y += 1000;
            snowflake(
                [
                    new THREE.Vector3( 250, y, 0 ),
                    new THREE.Vector3( 500, y, 0 ),
                    new THREE.Vector3( 250, y, 0 ),
                    new THREE.Vector3( 250, y + 250, 0 ),
                    new THREE.Vector3( 250, y, 0 ),
                    new THREE.Vector3( 0, y, 0 ),
                    new THREE.Vector3( 250, y, 0 ),
                    new THREE.Vector3( 250, y - 250, 0 ),
                    new THREE.Vector3( 250, y, 0 )
                ],
                false, 600
            );
        
            //
        
            geometry.setIndex( indices );
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
            geometry.computeBoundingSphere();
        
            const lineSegments = new THREE.LineSegments( geometry, material );
            lineSegments.position.x -= 1200;
            lineSegments.position.y -= 1200;
        
            parent_node = new THREE.Object3D();
            parent_node.add( lineSegments );
        
            scene.add( parent_node );
        
          
            app.signal.onAppUpdate.add(animate)
        
        }
        
        function animate() {
        
            const time = Date.now() * 0.001;
        
            parent_node.rotation.z = time * 0.5;
        
           
        }
    }
    catch (e) {
        console.error(e);
    }
};