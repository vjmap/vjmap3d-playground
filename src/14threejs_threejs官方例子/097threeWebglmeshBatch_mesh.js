
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/097threeWebglmeshBatch
        // --mesh_batch--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_mesh_batch
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1,
                far: 100,
                position: [ 0, 0, 30 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let gui, guiStatsEl;
        let geometries, mesh, material;
        const ids = [];
        const matrix = new THREE.Matrix4();
        
        //
        
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        
        //
        
        const MAX_GEOMETRY_COUNT = 20000;
        
        const Method = {
            BATCHED: 'BATCHED',
            NAIVE: 'NAIVE'
        };
        
        const api = {
            method: Method.BATCHED,
            count: 256,
            dynamic: 16,
        
            sortObjects: true,
            perObjectFrustumCulled: true,
            opacity: 1,
            useCustomSort: true,
        };
        
        init();
        initGeometries();
        initMesh();
        
        //
        
        function randomizeMatrix( matrix ) {
        
            position.x = Math.random() * 40 - 20;
            position.y = Math.random() * 40 - 20;
            position.z = Math.random() * 40 - 20;
        
            rotation.x = Math.random() * 2 * Math.PI;
            rotation.y = Math.random() * 2 * Math.PI;
            rotation.z = Math.random() * 2 * Math.PI;
        
            quaternion.setFromEuler( rotation );
        
            scale.x = scale.y = scale.z = 0.5 + ( Math.random() * 0.5 );
        
            return matrix.compose( position, quaternion, scale );
        
        }
        
        function randomizeRotationSpeed( rotation ) {
        
            rotation.x = Math.random() * 0.01;
            rotation.y = Math.random() * 0.01;
            rotation.z = Math.random() * 0.01;
            return rotation;
        
        }
        
        function initGeometries() {
        
            geometries = [
                new THREE.ConeGeometry( 1.0, 2.0 ),
                new THREE.BoxGeometry( 2.0, 2.0, 2.0 ),
                new THREE.SphereGeometry( 1.0, 16, 8 ),
            ];
        
        }
        
        function createMaterial() {
        
            if ( ! material ) {
        
                material = new THREE.MeshNormalMaterial();
        
            }
        
            return material;
        
        }
        
        function cleanup() {
        
            if ( mesh ) {
        
                mesh.parent.remove( mesh );
        
                if ( mesh.dispose ) {
        
                    mesh.dispose();
        
                }
        
            }
        
        }
        
        function initMesh() {
        
            cleanup();
        
            if ( api.method === Method.BATCHED ) {
        
                initBatchedMesh();
        
            } else {
        
                initRegularMesh();
        
            }
        
        }
        
        function initRegularMesh() {
        
            mesh = new THREE.Group();
            const material = createMaterial();
        
            for ( let i = 0; i < api.count; i ++ ) {
        
                const child = new THREE.Mesh( geometries[ i % geometries.length ], material );
                randomizeMatrix( child.matrix );
                child.matrix.decompose( child.position, child.quaternion, child.scale );
                child.userData.rotationSpeed = randomizeRotationSpeed( new THREE.Euler() );
                mesh.add( child );
        
            }
        
            scene.add( mesh );
        
        }
        
        function initBatchedMesh() {
        
            const geometryCount = api.count;
            const vertexCount = api.count * 512;
            const indexCount = api.count * 1024;
        
            const euler = new THREE.Euler();
            const matrix = new THREE.Matrix4();
            mesh = new THREE.BatchedMesh( geometryCount, vertexCount, indexCount, createMaterial() );
            mesh.userData.rotationSpeeds = [];
        
            // disable full-object frustum culling since all of the objects can be dynamic.
            mesh.frustumCulled = false;
        
            ids.length = 0;
        
            for ( let i = 0; i < api.count; i ++ ) {
        
                const id = mesh.addGeometry( geometries[ i % geometries.length ] );
                mesh.setMatrixAt( id, randomizeMatrix( matrix ) );
        
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationFromEuler( randomizeRotationSpeed( euler ) );
                mesh.userData.rotationSpeeds.push( rotationMatrix );
        
                ids.push( id );
        
            }
        
            scene.add( mesh );
        
        }
        
        function init() {
        
           
            gui = new GUI();
            gui.add( api, 'count', 1, MAX_GEOMETRY_COUNT ).step( 1 ).onChange( initMesh );
            gui.add( api, 'dynamic', 0, MAX_GEOMETRY_COUNT ).step( 1 );
            gui.add( api, 'method', Method ).onChange( initMesh );
            gui.add( api, 'opacity', 0, 1 ).onChange( v => {
        
                if ( v < 1 ) {
        
                    material.transparent = true;
                    material.depthWrite = false;
        
                } else {
        
                    material.transparent = false;
                    material.depthWrite = true;
        
                }
        
                material.opacity = v;
                material.needsUpdate = true;
        
            } );
            gui.add( api, 'sortObjects' );
            gui.add( api, 'perObjectFrustumCulled' );
            gui.add( api, 'useCustomSort' );
        
            guiStatsEl = document.createElement( 'li' );
            guiStatsEl.classList.add( 'gui-stats' );
        
            // listeners
        
            app.signal.onAppUpdate.add(animate)
            // auto rotation
            app.signal.onAppAfterUpdate.add(e => {
                app.cameraControl.azimuthAngle += 2 * e.deltaTime * THREE.MathUtils.DEG2RAD;
            });
        }
        
        //
        
        function sortFunction( list ) {
        
            // initialize options
            this._options = this._options || {
                get: el => el.z,
                aux: new Array( this.maxGeometryCount )
            };
        
            const options = this._options;
            options.reversed = this.material.transparent;
        
            let minZ = Infinity;
            let maxZ = - Infinity;
            for ( let i = 0, l = list.length; i < l; i ++ ) {
        
                const z = list[ i ].z;
                if ( z > maxZ ) maxZ = z;
                if ( z < minZ ) minZ = z;
        
            }
        
            // convert depth to unsigned 32 bit range
            const depthDelta = maxZ - minZ;
            const factor = ( 2 ** 32 - 1 ) / depthDelta; // UINT32_MAX / z range
            for ( let i = 0, l = list.length; i < l; i ++ ) {
        
                list[ i ].z -= minZ;
                list[ i ].z *= factor;
        
            }
        
            // perform a fast-sort using the hybrid radix sort function
            radixSort( list, options );
        
        }
        
        
        function animate() {
        
            animateMeshes();
           
            render();
        
        }
        
        function animateMeshes() {
        
            const loopNum = Math.min( api.count, api.dynamic );
        
            if ( api.method === Method.BATCHED ) {
        
                for ( let i = 0; i < loopNum; i ++ ) {
        
                    const rotationMatrix = mesh.userData.rotationSpeeds[ i ];
                    const id = ids[ i ];
        
                    mesh.getMatrixAt( id, matrix );
                    matrix.multiply( rotationMatrix );
                    mesh.setMatrixAt( id, matrix );
        
                }
        
            } else {
        
                for ( let i = 0; i < loopNum; i ++ ) {
        
                    const child = mesh.children[ i ];
                    const rotationSpeed = child.userData.rotationSpeed;
        
                    child.rotation.set(
                        child.rotation.x + rotationSpeed.x,
                        child.rotation.y + rotationSpeed.y,
                        child.rotation.z + rotationSpeed.z
                    );
        
                }
        
            }
        
        }
        
        function render() {
        
            if ( mesh.isBatchedMesh ) {
        
                mesh.sortObjects = api.sortObjects;
                mesh.perObjectFrustumCulled = api.perObjectFrustumCulled;
                mesh.setCustomSort( api.useCustomSort ? sortFunction : null );
        
            }
        
           
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};