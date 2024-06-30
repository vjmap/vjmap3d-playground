
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/170threeWebglbuffergeometryinstancinginterleaved
        // --buffergeometry_instancing_interleaved--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_instancing_interleaved
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 1000,
                position: [0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        const instances = 5000;
        let lastTime = 0;
        
        const moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
        const tmpQ = new THREE.Quaternion();
        const tmpM = new THREE.Matrix4();
        const currentM = new THREE.Matrix4();
        
        init();
        
        function init() {
        
            // geometry
        
            const geometry = new THREE.InstancedBufferGeometry();
        
            // per mesh data x,y,z,w,u,v,s,t for 4-element alignment
            // only use x,y,z and u,v; but x, y, z, nx, ny, nz, u, v would be a good layout
            const vertexBuffer = new THREE.InterleavedBuffer( new Float32Array( [
                // Front
                - 1, 1, 1, 0, 0, 0, 0, 0,
                1, 1, 1, 0, 1, 0, 0, 0,
                - 1, - 1, 1, 0, 0, 1, 0, 0,
                1, - 1, 1, 0, 1, 1, 0, 0,
                // Back
                1, 1, - 1, 0, 1, 0, 0, 0,
                - 1, 1, - 1, 0, 0, 0, 0, 0,
                1, - 1, - 1, 0, 1, 1, 0, 0,
                - 1, - 1, - 1, 0, 0, 1, 0, 0,
                // Left
                - 1, 1, - 1, 0, 1, 1, 0, 0,
                - 1, 1, 1, 0, 1, 0, 0, 0,
                - 1, - 1, - 1, 0, 0, 1, 0, 0,
                - 1, - 1, 1, 0, 0, 0, 0, 0,
                // Right
                1, 1, 1, 0, 1, 0, 0, 0,
                1, 1, - 1, 0, 1, 1, 0, 0,
                1, - 1, 1, 0, 0, 0, 0, 0,
                1, - 1, - 1, 0, 0, 1, 0, 0,
                // Top
                - 1, 1, 1, 0, 0, 0, 0, 0,
                1, 1, 1, 0, 1, 0, 0, 0,
                - 1, 1, - 1, 0, 0, 1, 0, 0,
                1, 1, - 1, 0, 1, 1, 0, 0,
                // Bottom
                1, - 1, 1, 0, 1, 0, 0, 0,
                - 1, - 1, 1, 0, 0, 0, 0, 0,
                1, - 1, - 1, 0, 1, 1, 0, 0,
                - 1, - 1, - 1, 0, 0, 1, 0, 0
            ] ), 8 );
        
            // Use vertexBuffer, starting at offset 0, 3 items in position attribute
            const positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 0 );
            geometry.setAttribute( 'position', positions );
            // Use vertexBuffer, starting at offset 4, 2 items in uv attribute
            const uvs = new THREE.InterleavedBufferAttribute( vertexBuffer, 2, 4 );
            geometry.setAttribute( 'uv', uvs );
        
            const indices = new Uint16Array( [
                0, 2, 1,
                2, 3, 1,
                4, 6, 5,
                6, 7, 5,
                8, 10, 9,
                10, 11, 9,
                12, 14, 13,
                14, 15, 13,
                16, 17, 18,
                18, 17, 19,
                20, 21, 22,
                22, 21, 23
            ] );
        
            geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        
            // material
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const material = new THREE.MeshBasicMaterial();
            material.map = new THREE.TextureLoader().load(assetsPath + 'textures/crate.gif' );
            material.map.colorSpace = THREE.SRGBColorSpace;
            material.map.flipY = false;
        
            // per instance data
        
            const matrix = new THREE.Matrix4();
            const offset = new THREE.Vector3();
            const orientation = new THREE.Quaternion();
            const scale = new THREE.Vector3( 1, 1, 1 );
            let x, y, z, w;
        
            mesh = new THREE.InstancedMesh( geometry, material, instances );
        
            for ( let i = 0; i < instances; i ++ ) {
        
                // offsets
        
                x = Math.random() * 100 - 50;
                y = Math.random() * 100 - 50;
                z = Math.random() * 100 - 50;
        
                offset.set( x, y, z ).normalize();
                offset.multiplyScalar( 5 ); // move out at least 5 units from center in current direction
                offset.set( x + offset.x, y + offset.y, z + offset.z );
        
                // orientations
        
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;
                w = Math.random() * 2 - 1;
        
                orientation.set( x, y, z, w ).normalize();
        
                matrix.compose( offset, orientation, scale );
        
                mesh.setMatrixAt( i, matrix );
        
            }
        
            scene.add( mesh );
        
          
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        //
        
        function animate() {
        
            const time = performance.now();
        
            mesh.rotation.y = time * 0.00005;
        
            const delta = ( time - lastTime ) / 5000;
            tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
            tmpM.makeRotationFromQuaternion( tmpQ );
        
            for ( let i = 0, il = instances; i < il; i ++ ) {
        
                mesh.getMatrixAt( i, currentM );
                currentM.multiply( tmpM );
                mesh.setMatrixAt( i, currentM );
        
            }
        
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
        
            lastTime = time;
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};