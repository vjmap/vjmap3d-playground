
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/029threeWebglinstancingPerformance
        // --instancing_performance--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_instancing_performance
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
                position: [ 0, 0 , 30 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let gui, guiStatsEl,material;
        
        
        // gui
        
        const Method = {
            INSTANCED: 'INSTANCED',
            MERGED: 'MERGED',
            NAIVE: 'NAIVE'
        };
        
        const api = {
            method: Method.INSTANCED,
            count: 1000
        };
        
        //
        
        init();
        initMesh();
        
        //
        
        function clean() {
        
            const meshes = [];
        
            scene.traverse( function ( object ) {
        
                if ( object.isMesh ) meshes.push( object );
        
            } );
        
            for ( let i = 0; i < meshes.length; i ++ ) {
        
                const mesh = meshes[ i ];
                mesh.material.dispose();
                mesh.geometry.dispose();
        
                scene.remove( mesh );
        
            }
        
        }
        
        const randomizeMatrix = function () {
        
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
        
            return function ( matrix ) {
        
                position.x = Math.random() * 40 - 20;
                position.y = Math.random() * 40 - 20;
                position.z = Math.random() * 40 - 20;
        
                quaternion.random();
        
                scale.x = scale.y = scale.z = Math.random() * 1;
        
                matrix.compose( position, quaternion, scale );
        
            };
        
        }();
        
        function initMesh() {
        
            clean();
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            // make instances
            new THREE.BufferGeometryLoader()
                .setPath(assetsPath +  'models/json/' )
                .load( 'suzanne_buffergeometry.json', function ( geometry ) {
        
                    material = new THREE.MeshNormalMaterial();
        
                    geometry.computeVertexNormals();
        
                    console.time( api.method + ' (build)' );
        
                    switch ( api.method ) {
        
                        case Method.INSTANCED:
                            makeInstanced( geometry );
                            break;
        
                        case Method.MERGED:
                            makeMerged( geometry );
                            break;
        
                        case Method.NAIVE:
                            makeNaive( geometry );
                            break;
        
                    }
        
                    console.timeEnd( api.method + ' (build)' );
        
                } );
        
        }
        
        function makeInstanced( geometry ) {
        
            const matrix = new THREE.Matrix4();
            const mesh = new THREE.InstancedMesh( geometry, material, api.count );
        
            for ( let i = 0; i < api.count; i ++ ) {
        
                randomizeMatrix( matrix );
                mesh.setMatrixAt( i, matrix );
        
            }
        
            scene.add( mesh );
        
            //
        
            const geometryByteLength = getGeometryByteLength( geometry );
        
            guiStatsEl.innerHTML = [
        
                '<i>GPU draw calls</i>: 1',
                '<i>GPU memory</i>: ' + formatBytes( api.count * 16 + geometryByteLength, 2 )
        
            ].join( '<br/>' );
        
        }
        
        function makeMerged( geometry ) {
        
            const geometries = [];
            const matrix = new THREE.Matrix4();
        
            for ( let i = 0; i < api.count; i ++ ) {
        
                randomizeMatrix( matrix );
        
                const instanceGeometry = geometry.clone();
                instanceGeometry.applyMatrix4( matrix );
        
                geometries.push( instanceGeometry );
        
            }
        
            const mergedGeometry = BufferGeometryUtils.mergeGeometries( geometries );
        
            scene.add( new THREE.Mesh( mergedGeometry, material ) );
        
            //
        
            guiStatsEl.innerHTML = [
        
                '<i>GPU draw calls</i>: 1',
                '<i>GPU memory</i>: ' + formatBytes( getGeometryByteLength( mergedGeometry ), 2 )
        
            ].join( '<br/>' );
        
        }
        
        function makeNaive( geometry ) {
        
            const matrix = new THREE.Matrix4();
        
            for ( let i = 0; i < api.count; i ++ ) {
        
                randomizeMatrix( matrix );
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.applyMatrix4( matrix );
        
                scene.add( mesh );
        
            }
        
            //
        
            const geometryByteLength = getGeometryByteLength( geometry );
        
            guiStatsEl.innerHTML = [
        
                '<i>GPU draw calls</i>: ' + api.count,
                '<i>GPU memory</i>: ' + formatBytes( api.count * 16 + geometryByteLength, 2 )
        
            ].join( '<br/>' );
        
        }
        
        function init() {
            // gui
        
            gui = new GUI();
            gui.add( api, 'method', Method ).onChange( initMesh );
            gui.add( api, 'count', 1, 10000 ).step( 1 ).onChange( initMesh );
        
            const perfFolder = gui.addFolder( 'Performance' );
        
            guiStatsEl = document.createElement( 'div' );
            guiStatsEl.classList.add( 'gui-stats' );
        
            perfFolder.$children.appendChild( guiStatsEl );
            perfFolder.open();
        
            
            Object.assign( window, { scene } );
        
            // auto rotation
            app.signal.onAppAfterUpdate.add(e => {
                app.cameraControl.azimuthAngle += 20 * e.deltaTime * THREE.MathUtils.DEG2RAD;
            });
        
        }
        
        //
        
        function getGeometryByteLength( geometry ) {
        
            let total = 0;
        
            if ( geometry.index ) total += geometry.index.array.byteLength;
        
            for ( const name in geometry.attributes ) {
        
                total += geometry.attributes[ name ].array.byteLength;
        
            }
        
            return total;
        
        }
        
        // Source: https://stackoverflow.com/a/18650828/1314762
        function formatBytes( bytes, decimals ) {
        
            if ( bytes === 0 ) return '0 bytes';
        
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = [ 'bytes', 'KB', 'MB' ];
        
            const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
        
            return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};