
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/115threeWebglpointsDynamic
        // --points_dynamic--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_points_dynamic
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x000104,
                defaultLights: false
            },
            camera: {
                fov: 20,
                near: 1,
                far: 50000,
                position: [0, 700, 7000 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        let parent;
        
        const meshes = [], clonemeshes = [];
        
        
        init();
        
        function init() {
        
        
            scene.fog = new THREE.FogExp2( 0x000104, 0.0000675 );
        
            camera.lookAt( scene.position );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const loader =  vjmap3d.LoadManager.objLoader;
        
            loader.load(assetsPath + 'models/obj/male02/male02.obj', function ( object ) {
        
                const positions = combineBuffer( object, 'position' );
        
                createMesh( positions, scene, 4.05, - 500, - 350, 600, 0xff7744 );
                createMesh( positions, scene, 4.05, 500, - 350, 0, 0xff5522 );
                createMesh( positions, scene, 4.05, - 250, - 350, 1500, 0xff9922 );
                createMesh( positions, scene, 4.05, - 250, - 350, - 1500, 0xff99ff );
        
            } );
        
            loader.load(assetsPath + 'models/obj/female02/female02.obj', function ( object ) {
        
                const positions = combineBuffer( object, 'position' );
        
                createMesh( positions, scene, 4.05, - 1000, - 350, 0, 0xffdd44 );
                createMesh( positions, scene, 4.05, 0, - 350, 0, 0xffffff );
                createMesh( positions, scene, 4.05, 1000, - 350, 400, 0xff4422 );
                createMesh( positions, scene, 4.05, 250, - 350, 1500, 0xff9955 );
                createMesh( positions, scene, 4.05, 250, - 350, 2500, 0xff77dd );
        
            } );
        
        
            
            renderer.autoClear = false;
            parent = new THREE.Object3D();
            scene.add( parent );
        
            const grid = new THREE.Points( new THREE.PlaneGeometry( 15000, 15000, 64, 64 ), new THREE.PointsMaterial( { color: 0xff0000, size: 10 } ) );
            grid.position.y = - 400;
            grid.rotation.x = - Math.PI / 2;
            parent.add( grid );
        
            app.signal.onAppUpdate.add(e => render(e))
        
        }
        
        
        
        function combineBuffer( model, bufferName ) {
        
            let count = 0;
        
            model.traverse( function ( child ) {
        
                if ( child.isMesh ) {
        
                    const buffer = child.geometry.attributes[ bufferName ];
        
                    count += buffer.array.length;
        
                }
        
            } );
        
            const combined = new Float32Array( count );
        
            let offset = 0;
        
            model.traverse( function ( child ) {
        
                if ( child.isMesh ) {
        
                    const buffer = child.geometry.attributes[ bufferName ];
        
                    combined.set( buffer.array, offset );
                    offset += buffer.array.length;
        
                }
        
            } );
        
            return new THREE.BufferAttribute( combined, 3 );
        
        }
        
        function createMesh( positions, scene, scale, x, y, z, color ) {
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', positions.clone() );
            geometry.setAttribute( 'initialPosition', positions.clone() );
        
            geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );
        
            const clones = [
        
                [ 6000, 0, - 4000 ],
                [ 5000, 0, 0 ],
                [ 1000, 0, 5000 ],
                [ 1000, 0, - 5000 ],
                [ 4000, 0, 2000 ],
                [ - 4000, 0, 1000 ],
                [ - 5000, 0, - 5000 ],
        
                [ 0, 0, 0 ]
        
            ];
        
            for ( let i = 0; i < clones.length; i ++ ) {
        
                const c = ( i < clones.length - 1 ) ? 0x252525 : color;
        
                mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { size: 30, color: c } ) );
                mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
        
                mesh.position.x = x + clones[ i ][ 0 ];
                mesh.position.y = y + clones[ i ][ 1 ];
                mesh.position.z = z + clones[ i ][ 2 ];
        
                parent.add( mesh );
        
                clonemeshes.push( { mesh: mesh, speed: 0.5 + Math.random() } );
        
            }
        
            meshes.push( {
                mesh: mesh, verticesDown: 0, verticesUp: 0, direction: 0, speed: 15, delay: Math.floor( 200 + 200 * Math.random() ),
                start: Math.floor( 100 + 200 * Math.random() ),
            } );
        
        }
        
        
        function render(e) {
        
            let delta = 10 * e.deltaTime;
        
            delta = delta < 2 ? delta : 2;
        
            parent.rotation.y += - 0.02 * delta;
        
            for ( let j = 0; j < clonemeshes.length; j ++ ) {
        
                const cm = clonemeshes[ j ];
                cm.mesh.rotation.y += - 0.1 * delta * cm.speed;
        
            }
        
            for ( let j = 0; j < meshes.length; j ++ ) {
        
                const data = meshes[ j ];
                const positions = data.mesh.geometry.attributes.position;
                const initialPositions = data.mesh.geometry.attributes.initialPosition;
        
                const count = positions.count;
        
                if ( data.start > 0 ) {
        
                    data.start -= 1;
        
                } else {
        
                    if ( data.direction === 0 ) {
        
                        data.direction = - 1;
        
                    }
        
                }
        
                for ( let i = 0; i < count; i ++ ) {
        
                    const px = positions.getX( i );
                    const py = positions.getY( i );
                    const pz = positions.getZ( i );
        
                    // falling down
                    if ( data.direction < 0 ) {
        
                        if ( py > 0 ) {
        
                            positions.setXYZ(
                                i,
                                px + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta,
                                py + 3.0 * ( 0.25 - Math.random() ) * data.speed * delta,
                                pz + 1.5 * ( 0.50 - Math.random() ) * data.speed * delta
                            );
        
                        } else {
        
                            data.verticesDown += 1;
        
                        }
        
                    }
        
                    // rising up
                    if ( data.direction > 0 ) {
        
                        const ix = initialPositions.getX( i );
                        const iy = initialPositions.getY( i );
                        const iz = initialPositions.getZ( i );
        
                        const dx = Math.abs( px - ix );
                        const dy = Math.abs( py - iy );
                        const dz = Math.abs( pz - iz );
        
                        const d = dx + dy + dx;
        
                        if ( d > 1 ) {
        
                            positions.setXYZ(
                                i,
                                px - ( px - ix ) / dx * data.speed * delta * ( 0.85 - Math.random() ),
                                py - ( py - iy ) / dy * data.speed * delta * ( 1 + Math.random() ),
                                pz - ( pz - iz ) / dz * data.speed * delta * ( 0.85 - Math.random() )
                            );
        
                        } else {
        
                            data.verticesUp += 1;
        
                        }
        
                    }
        
                }
        
                // all vertices down
                if ( data.verticesDown >= count ) {
        
                    if ( data.delay <= 0 ) {
        
                        data.direction = 1;
                        data.speed = 5;
                        data.verticesDown = 0;
                        data.delay = 320;
        
                    } else {
        
                        data.delay -= 1;
        
                    }
        
                }
        
                // all vertices up
                if ( data.verticesUp >= count ) {
        
                    if ( data.delay <= 0 ) {
        
                        data.direction = - 1;
                        data.speed = 15;
                        data.verticesUp = 0;
                        data.delay = 120;
        
                    } else {
        
                        data.delay -= 1;
        
                    }
        
                }
        
                positions.needsUpdate = true;
        
            }
        
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};