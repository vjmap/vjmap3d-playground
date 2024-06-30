
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/037threeWebglInteractiveraycastingPoints
        // --interactive_raycasting_points--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_raycasting_points
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 10000,
                position: [ 10, 10, 10 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let pointclouds;
        let intersection = null;
        let spheresIndex = 0;
        let toggle = 0;
        
        const spheres = [];
        
        const threshold = 0.1;
        const pointSize = 0.05;
        const width = 80;
        const length = 160;
        const rotateY = new THREE.Matrix4().makeRotationY( 0.005 );
        
        init();
        
        function generatePointCloudGeometry( color, width, length ) {
        
            const geometry = new THREE.BufferGeometry();
            const numPoints = width * length;
        
            const positions = new Float32Array( numPoints * 3 );
            const colors = new Float32Array( numPoints * 3 );
        
            let k = 0;
        
            for ( let i = 0; i < width; i ++ ) {
        
                for ( let j = 0; j < length; j ++ ) {
        
                    const u = i / width;
                    const v = j / length;
                    const x = u - 0.5;
                    const y = ( Math.cos( u * Math.PI * 4 ) + Math.sin( v * Math.PI * 8 ) ) / 20;
                    const z = v - 0.5;
        
                    positions[ 3 * k ] = x;
                    positions[ 3 * k + 1 ] = y;
                    positions[ 3 * k + 2 ] = z;
        
                    const intensity = ( y + 0.1 ) * 5;
                    colors[ 3 * k ] = color.r * intensity;
                    colors[ 3 * k + 1 ] = color.g * intensity;
                    colors[ 3 * k + 2 ] = color.b * intensity;
        
                    k ++;
        
                }
        
            }
        
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            geometry.computeBoundingBox();
        
            return geometry;
        
        }
        
        function generatePointcloud( color, width, length ) {
        
            const geometry = generatePointCloudGeometry( color, width, length );
            const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );
        
            return new THREE.Points( geometry, material );
        
        }
        
        function generateIndexedPointcloud( color, width, length ) {
        
            const geometry = generatePointCloudGeometry( color, width, length );
            const numPoints = width * length;
            const indices = new Uint16Array( numPoints );
        
            let k = 0;
        
            for ( let i = 0; i < width; i ++ ) {
        
                for ( let j = 0; j < length; j ++ ) {
        
                    indices[ k ] = k;
                    k ++;
        
                }
        
            }
        
            geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        
            const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );
        
            return new THREE.Points( geometry, material );
        
        }
        
        function generateIndexedWithOffsetPointcloud( color, width, length ) {
        
            const geometry = generatePointCloudGeometry( color, width, length );
            const numPoints = width * length;
            const indices = new Uint16Array( numPoints );
        
            let k = 0;
        
            for ( let i = 0; i < width; i ++ ) {
        
                for ( let j = 0; j < length; j ++ ) {
        
                    indices[ k ] = k;
                    k ++;
        
                }
        
            }
        
            geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
            geometry.addGroup( 0, indices.length );
        
            const material = new THREE.PointsMaterial( { size: pointSize, vertexColors: true } );
        
            return new THREE.Points( geometry, material );
        
        }
        
        function init() {
        
            camera.lookAt( scene.position );
            camera.updateMatrix();
        
            //
        
            const pcBuffer = generatePointcloud( new THREE.Color( 1, 0, 0 ), width, length );
            pcBuffer.scale.set( 5, 10, 10 );
            pcBuffer.position.set( - 5, 0, 0 );
            scene.add( pcBuffer );
        
            const pcIndexed = generateIndexedPointcloud( new THREE.Color( 0, 1, 0 ), width, length );
            pcIndexed.scale.set( 5, 10, 10 );
            pcIndexed.position.set( 0, 0, 0 );
            scene.add( pcIndexed );
        
            const pcIndexedOffset = generateIndexedWithOffsetPointcloud( new THREE.Color( 0, 1, 1 ), width, length );
            pcIndexedOffset.scale.set( 5, 10, 10 );
            pcIndexedOffset.position.set( 5, 0, 0 );
            scene.add( pcIndexedOffset );
        
            pointclouds = [ pcBuffer, pcIndexed, pcIndexedOffset ];
        
            //
        
            const sphereGeometry = new THREE.SphereGeometry( 0.1, 32, 32 );
            const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        
            for ( let i = 0; i < 40; i ++ ) {
        
                const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
                scene.add( sphere );
                spheres.push( sphere );
        
            }
        
        
            pointclouds.forEach(p => vjmap3d.Entity.attchObject(p)); // 只有变成entity才能queryEntitiesByScreenPos查询
            
        
            app.signal.onAppRender.add(e => {
                camera.applyMatrix4( rotateY );
                camera.updateMatrixWorld();
                let io = app.queryEntitiesByScreenPos(app.Input.x(), app.Input.y(), {
                    raycasterParameters: {
                        Points: {
                            threshold: threshold
                        }
                    }
                } );
                intersection = io?.intersection;
                if ( toggle > 0.02 && intersection?.point   ) {
        
                    spheres[ spheresIndex ].position.copy( intersection.point );
                    spheres[ spheresIndex ].scale.set( 1, 1, 1 );
                    spheresIndex = ( spheresIndex + 1 ) % spheres.length;
            
                    toggle = 0;
            
                }
            
                for ( let i = 0; i < spheres.length; i ++ ) {
            
                    const sphere = spheres[ i ];
                    sphere.scale.multiplyScalar( 0.98 );
                    sphere.scale.clampScalar( 0.01, 1 );
            
                }
            
                toggle += e.deltaTime;
            })
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};