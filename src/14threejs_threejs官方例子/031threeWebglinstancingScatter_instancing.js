
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/031threeWebglinstancingScatter
        // --instancing_scatter--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_instancing_scatter
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xE39469,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 0.1, 
                far: 100,
                position: [25, 25, 25 ],
                lookAt: [0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const api = {
        
            count: 2000,
            distribution: 'random',
            resample: resample,
            surfaceColor: 0xFFF784
        
        };
        
        let stemMesh, blossomMesh;
        let stemGeometry, blossomGeometry;
        let stemMaterial, blossomMaterial;
        
        let sampler;
        const count = api.count;
        const ages = new Float32Array( count );
        const scales = new Float32Array( count );
        const dummy = new THREE.Object3D();
        
        const _position = new THREE.Vector3();
        const _normal = new THREE.Vector3();
        const _scale = new THREE.Vector3();
        
        // let surfaceGeometry = new THREE.BoxGeometry( 10, 10, 10 ).toNonIndexed();
        const surfaceGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 ).toNonIndexed();
        const surfaceMaterial = new THREE.MeshLambertMaterial( { color: api.surfaceColor, wireframe: false } );
        const surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );
        
        // Source: https://gist.github.com/gre/1650294
        const easeOutCubic = function ( t ) {
        
            return ( -- t ) * t * t + 1;
        
        };
        
        // Scaling curve causes particles to grow quickly, ease gradually into full scale, then
        // disappear quickly. More of the particle's lifetime is spent around full scale.
        const scaleCurve = function ( t ) {
        
            return Math.abs( easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );
        
        };
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        vjmap3d.ResManager.loadRes( assetsPath + './models/gltf/Flower/Flower.glb', false).then( ( gltf ) => {
        
            const _stemMesh = gltf.scene.getObjectByName( 'Stem' );
            const _blossomMesh = gltf.scene.getObjectByName( 'Blossom' );
        
            stemGeometry = _stemMesh.geometry.clone();
            blossomGeometry = _blossomMesh.geometry.clone();
        
            const defaultTransform = new THREE.Matrix4()
                .makeRotationX( Math.PI )
                .multiply( new THREE.Matrix4().makeScale( 7, 7, 7 ) );
        
            stemGeometry.applyMatrix4( defaultTransform );
            blossomGeometry.applyMatrix4( defaultTransform );
        
            stemMaterial = _stemMesh.material;
            blossomMaterial = _blossomMesh.material;
        
            stemMesh = new THREE.InstancedMesh( stemGeometry, stemMaterial, count );
            blossomMesh = new THREE.InstancedMesh( blossomGeometry, blossomMaterial, count );
        
            // Assign random colors to the blossoms.
            const color = new THREE.Color();
            const blossomPalette = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ];
        
            for ( let i = 0; i < count; i ++ ) {
        
                color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
                blossomMesh.setColorAt( i, color );
        
            }
        
            // Instance matrices will be updated every frame.
            stemMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
            blossomMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
        
            resample();
        
            init();
            app.signal.onAppUpdate.add(render);
        } );
        
        function init() {
        
            const pointLight = new THREE.PointLight( 0xAA8899, 2.5, 0, 0 );
            pointLight.position.set( 50, - 25, 75 );
            scene.add( pointLight );
        
            scene.add( new THREE.AmbientLight( 0xffffff, 3 ) );
        
            //
        
            scene.add( stemMesh );
            scene.add( blossomMesh );
        
            scene.add( surface );
        
            //
        
            const gui = new GUI();
            gui.add( api, 'count', 0, count ).onChange( function () {
        
                stemMesh.count = api.count;
                blossomMesh.count = api.count;
        
            } );
        
            // gui.addColor( api, 'backgroundColor' ).onChange( function () {
        
            // 	scene.background.setHex( api.backgroundColor );
        
            // } );
        
            // gui.addColor( api, 'surfaceColor' ).onChange( function () {
        
            // 	surfaceMaterial.color.setHex( api.surfaceColor );
        
            // } );
        
            gui.add( api, 'distribution' ).options( [ 'random', 'weighted' ] ).onChange( resample );
            gui.add( api, 'resample' );
        
        }
        
        function resample() {
        
            const vertexCount = surface.geometry.getAttribute( 'position' ).count;
        
            console.info( 'Sampling ' + count + ' points from a surface with ' + vertexCount + ' vertices...' );
        
            //
        
            console.time( '.build()' );
        
            sampler = new MeshSurfaceSampler( surface )
                .setWeightAttribute( api.distribution === 'weighted' ? 'uv' : null )
                .build();
        
            console.timeEnd( '.build()' );
        
            //
        
            console.time( '.sample()' );
        
            for ( let i = 0; i < count; i ++ ) {
        
                ages[ i ] = Math.random();
                scales[ i ] = scaleCurve( ages[ i ] );
        
                resampleParticle( i );
        
            }
        
            console.timeEnd( '.sample()' );
        
            stemMesh.instanceMatrix.needsUpdate = true;
            blossomMesh.instanceMatrix.needsUpdate = true;
        
        }
        
        function resampleParticle( i ) {
        
            sampler.sample( _position, _normal );
            _normal.add( _position );
        
            dummy.position.copy( _position );
            dummy.scale.set( scales[ i ], scales[ i ], scales[ i ] );
            dummy.lookAt( _normal );
            dummy.updateMatrix();
        
            stemMesh.setMatrixAt( i, dummy.matrix );
            blossomMesh.setMatrixAt( i, dummy.matrix );
        
        }
        
        function updateParticle( i ) {
        
            // Update lifecycle.
        
            ages[ i ] += 0.005;
        
            if ( ages[ i ] >= 1 ) {
        
                ages[ i ] = 0.001;
                scales[ i ] = scaleCurve( ages[ i ] );
        
                resampleParticle( i );
        
                return;
        
            }
        
            // Update scale.
        
            const prevScale = scales[ i ];
            scales[ i ] = scaleCurve( ages[ i ] );
            _scale.set( scales[ i ] / prevScale, scales[ i ] / prevScale, scales[ i ] / prevScale );
        
            // Update transform.
        
            stemMesh.getMatrixAt( i, dummy.matrix );
            dummy.matrix.scale( _scale );
            stemMesh.setMatrixAt( i, dummy.matrix );
            blossomMesh.setMatrixAt( i, dummy.matrix );
        
        }
        
        function render() {
        
            if ( stemMesh && blossomMesh ) {
        
                const time = Date.now() * 0.001;
        
                scene.rotation.x = Math.sin( time / 4 );
                scene.rotation.y = Math.sin( time / 2 );
        
                for ( let i = 0; i < api.count; i ++ ) {
        
                    updateParticle( i );
        
                }
        
                stemMesh.instanceMatrix.needsUpdate = true;
                blossomMesh.instanceMatrix.needsUpdate = true;
        
                stemMesh.computeBoundingSphere();
                blossomMesh.computeBoundingSphere();
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};