
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/032threeWebglInteractiveBuffergeometry
        // --interactive_buffergeometry--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_buffergeometry
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x050505,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 1, 
                far: 3500,
                position: [0, 0, 2750 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh, line;
        
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            scene.add( new THREE.AmbientLight( 0x444444, 3 ) );
        
            const light1 = new THREE.DirectionalLight( 0xffffff, 1.5 );
            light1.position.set( 1, 1, 1 );
            scene.add( light1 );
        
            const light2 = new THREE.DirectionalLight( 0xffffff, 4.5 );
            light2.position.set( 0, - 1, 0 );
            scene.add( light2 );
        
            //
        
            const triangles = 5000;
        
            let geometry = new THREE.BufferGeometry();
        
            const positions = new Float32Array( triangles * 3 * 3 );
            const normals = new Float32Array( triangles * 3 * 3 );
            const colors = new Float32Array( triangles * 3 * 3 );
        
            const color = new THREE.Color();
        
            const n = 800, n2 = n / 2;	// triangles spread in the cube
            const d = 120, d2 = d / 2;	// individual triangle size
        
            const pA = new THREE.Vector3();
            const pB = new THREE.Vector3();
            const pC = new THREE.Vector3();
        
            const cb = new THREE.Vector3();
            const ab = new THREE.Vector3();
        
            for ( let i = 0; i < positions.length; i += 9 ) {
        
                // positions
        
                const x = Math.random() * n - n2;
                const y = Math.random() * n - n2;
                const z = Math.random() * n - n2;
        
                const ax = x + Math.random() * d - d2;
                const ay = y + Math.random() * d - d2;
                const az = z + Math.random() * d - d2;
        
                const bx = x + Math.random() * d - d2;
                const by = y + Math.random() * d - d2;
                const bz = z + Math.random() * d - d2;
        
                const cx = x + Math.random() * d - d2;
                const cy = y + Math.random() * d - d2;
                const cz = z + Math.random() * d - d2;
        
                positions[ i ] = ax;
                positions[ i + 1 ] = ay;
                positions[ i + 2 ] = az;
        
                positions[ i + 3 ] = bx;
                positions[ i + 4 ] = by;
                positions[ i + 5 ] = bz;
        
                positions[ i + 6 ] = cx;
                positions[ i + 7 ] = cy;
                positions[ i + 8 ] = cz;
        
                // flat face normals
        
                pA.set( ax, ay, az );
                pB.set( bx, by, bz );
                pC.set( cx, cy, cz );
        
                cb.subVectors( pC, pB );
                ab.subVectors( pA, pB );
                cb.cross( ab );
        
                cb.normalize();
        
                const nx = cb.x;
                const ny = cb.y;
                const nz = cb.z;
        
                normals[ i ] = nx;
                normals[ i + 1 ] = ny;
                normals[ i + 2 ] = nz;
        
                normals[ i + 3 ] = nx;
                normals[ i + 4 ] = ny;
                normals[ i + 5 ] = nz;
        
                normals[ i + 6 ] = nx;
                normals[ i + 7 ] = ny;
                normals[ i + 8 ] = nz;
        
                // colors
        
                const vx = ( x / n ) + 0.5;
                const vy = ( y / n ) + 0.5;
                const vz = ( z / n ) + 0.5;
        
                color.setRGB( vx, vy, vz );
        
                colors[ i ] = color.r;
                colors[ i + 1 ] = color.g;
                colors[ i + 2 ] = color.b;
        
                colors[ i + 3 ] = color.r;
                colors[ i + 4 ] = color.g;
                colors[ i + 5 ] = color.b;
        
                colors[ i + 6 ] = color.r;
                colors[ i + 7 ] = color.g;
                colors[ i + 8 ] = color.b;
        
            }
        
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
            geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        
            geometry.computeBoundingSphere();
        
            let material = new THREE.MeshPhongMaterial( {
                color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
                side: THREE.DoubleSide, vertexColors: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
        
            geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );
        
            material = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true } );
        
            line = new THREE.Line( geometry, material );
            scene.add( line );
        
           
            let meshEntity = vjmap3d.MeshEntity.attchObject(mesh);
            meshEntity.pointerEvents = true;
            meshEntity.addAction(({ entity, elapsed }) => {
                entity.node.rotation.x = elapsed * 0.15;
                entity.node.rotation.y = elapsed * 0.25;
            })
        
            app.signal.onMouseMove.add(e => {
                if (!(e.intersection  && e.entity == meshEntity)) {
                    line.visible = false;
                    return; // 如果没有相交或不在当前实体上
                } else {
                    // 在当前实体上
                    const intersect = e.intersection;
                    const face = intersect.face;
            
                    const linePosition = line.geometry.attributes.position;
                    const meshPosition = mesh.geometry.attributes.position;
            
                    linePosition.copyAt( 0, meshPosition, face.a );
                    linePosition.copyAt( 1, meshPosition, face.b );
                    linePosition.copyAt( 2, meshPosition, face.c );
                    linePosition.copyAt( 3, meshPosition, face.a );
            
                    mesh.updateMatrix();
            
                    line.geometry.applyMatrix4( mesh.matrix );
            
                    line.visible = true;
                }
                
            })
        }
        
    }
    catch (e) {
        console.error(e);
    }
};