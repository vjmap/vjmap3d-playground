
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/221miscExporterGltf
        // --misc_exporter_gltf--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_exporter_gltf
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 2000,
                position: [ 600, 400, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        function exportGLTF( input ) {
        
            const gltfExporter = new GLTFExporter();
        
            const options = {
                trs: params.trs,
                onlyVisible: params.onlyVisible,
                binary: params.binary,
                maxTextureSize: params.maxTextureSize
            };
            gltfExporter.parse(
                input,
                function ( result ) {
        
                    if ( result instanceof ArrayBuffer ) {
        
                        saveArrayBuffer( result, 'scene.glb' );
        
                    } else {
        
                        const output = JSON.stringify( result, null, 2 );
                        console.log( output );
                        saveString( output, 'scene.gltf' );
        
                    }
        
                },
                function ( error ) {
        
                    console.log( 'An error happened during parsing', error );
        
                },
                options
            );
        
        }
        
        const link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link ); // Firefox workaround, see #6594
        
        function save( blob, filename ) {
        
            link.href = URL.createObjectURL( blob );
            link.download = filename;
            link.click();
        
            // URL.revokeObjectURL( url ); breaks Firefox...
        
        }
        
        function saveString( text, filename ) {
        
            save( new Blob( [ text ], { type: 'text/plain' } ), filename );
        
        }
        
        
        function saveArrayBuffer( buffer, filename ) {
        
            save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
        
        }
        
        
        let object, object2, material, geometry, scene1, scene2;
        let gridHelper, sphere, model, coffeemat;
        
        const params = {
            trs: false,
            onlyVisible: true,
            binary: false,
            maxTextureSize: 4096,
            exportScene1: exportScene1,
            exportScenes: exportScenes,
            exportSphere: exportSphere,
            exportModel: exportModel,
            exportObjects: exportObjects,
            exportSceneObject: exportSceneObject,
            exportCompressedObject: exportCompressedObject,
        };
        
        init();
        
        function init() {
        
        
            // Make linear gradient texture
        
            const data = new Uint8ClampedArray( 100 * 100 * 4 );
        
            for ( let y = 0; y < 100; y ++ ) {
        
                for ( let x = 0; x < 100; x ++ ) {
        
                    const stride = 4 * ( 100 * y + x );
        
                    data[ stride ] = Math.round( 255 * y / 99 );
                    data[ stride + 1 ] = Math.round( 255 - 255 * y / 99 );
                    data[ stride + 2 ] = 0;
                    data[ stride + 3 ] = 255;
        
                }
        
            }
        
            const gradientTexture = new THREE.DataTexture( data, 100, 100, THREE.RGBAFormat );
            gradientTexture.minFilter = THREE.LinearFilter;
            gradientTexture.magFilter = THREE.LinearFilter;
            gradientTexture.needsUpdate = true;
        
            scene1 = scene;
            scene1.name = 'Scene1';
        
           
            camera.name = 'PerspectiveCamera';
            scene1.add( camera );
        
            // ---------------------------------------------------------------------
            // Ambient light
            // ---------------------------------------------------------------------
            const ambientLight = new THREE.AmbientLight( 0xcccccc );
            ambientLight.name = 'AmbientLight';
            scene1.add( ambientLight );
        
            // ---------------------------------------------------------------------
            // DirectLight
            // ---------------------------------------------------------------------
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.target.position.set( 0, 0, - 1 );
            dirLight.add( dirLight.target );
            dirLight.lookAt( - 1, - 1, 0 );
            dirLight.name = 'DirectionalLight';
            scene1.add( dirLight );
        
            // ---------------------------------------------------------------------
            // Grid
            // ---------------------------------------------------------------------
            gridHelper = new THREE.GridHelper( 2000, 20, 0xc1c1c1, 0x8d8d8d );
            gridHelper.position.y = - 50;
            gridHelper.name = 'Grid';
            scene1.add( gridHelper );
        
            // ---------------------------------------------------------------------
            // Axes
            // ---------------------------------------------------------------------
            const axes = new THREE.AxesHelper( 500 );
            axes.name = 'AxesHelper';
            scene1.add( axes );
        
            // ---------------------------------------------------------------------
            // Simple geometry with basic material
            // ---------------------------------------------------------------------
            // Icosahedron
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const mapGrid = new THREE.TextureLoader().load(assetsPath + 'textures/uv_grid_opengl.jpg' );
            mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
            mapGrid.colorSpace = THREE.SRGBColorSpace;
            material = new THREE.MeshBasicMaterial( {
                color: 0xffffff,
                map: mapGrid
            } );
        
            object = new THREE.Mesh( new THREE.IcosahedronGeometry( 75, 0 ), material );
            object.position.set( - 200, 0, 200 );
            object.name = 'Icosahedron';
            scene1.add( object );
        
            // Octahedron
            material = new THREE.MeshBasicMaterial( {
                color: 0x0000ff,
                wireframe: true
            } );
            object = new THREE.Mesh( new THREE.OctahedronGeometry( 75, 1 ), material );
            object.position.set( 0, 0, 200 );
            object.name = 'Octahedron';
            scene1.add( object );
        
            // Tetrahedron
            material = new THREE.MeshBasicMaterial( {
                color: 0xff0000,
                transparent: true,
                opacity: 0.5
            } );
        
            object = new THREE.Mesh( new THREE.TetrahedronGeometry( 75, 0 ), material );
            object.position.set( 200, 0, 200 );
            object.name = 'Tetrahedron';
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // Buffered geometry primitives
            // ---------------------------------------------------------------------
            // Sphere
            material = new THREE.MeshStandardMaterial( {
                color: 0xffff00,
                metalness: 0.5,
                roughness: 1.0,
                flatShading: true,
            } );
            material.map = gradientTexture;
            material.bumpMap = mapGrid;
            sphere = new THREE.Mesh( new THREE.SphereGeometry( 70, 10, 10 ), material );
            sphere.position.set( 0, 0, 0 );
            sphere.name = 'Sphere';
            scene1.add( sphere );
        
            // Cylinder
            material = new THREE.MeshStandardMaterial( {
                color: 0xff00ff,
                flatShading: true
            } );
            object = new THREE.Mesh( new THREE.CylinderGeometry( 10, 80, 100 ), material );
            object.position.set( 200, 0, 0 );
            object.name = 'Cylinder';
            scene1.add( object );
        
            // TorusKnot
            material = new THREE.MeshStandardMaterial( {
                color: 0xff0000,
                roughness: 1
            } );
            object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 15, 40, 10 ), material );
            object.position.set( - 200, 0, 0 );
            object.name = 'Cylinder';
            scene1.add( object );
        
        
            // ---------------------------------------------------------------------
            // Hierarchy
            // ---------------------------------------------------------------------
            const mapWood = new THREE.TextureLoader().load( assetsPath + 'textures/hardwood2_diffuse.jpg' );
            material = new THREE.MeshStandardMaterial( { map: mapWood, side: THREE.DoubleSide } );
        
            object = new THREE.Mesh( new THREE.BoxGeometry( 40, 100, 100 ), material );
            object.position.set( - 200, 0, 400 );
            object.name = 'Cube';
            scene1.add( object );
        
            object2 = new THREE.Mesh( new THREE.BoxGeometry( 40, 40, 40, 2, 2, 2 ), material );
            object2.position.set( 0, 0, 50 );
            object2.rotation.set( 0, 45, 0 );
            object2.name = 'SubCube';
            object.add( object2 );
        
        
            // ---------------------------------------------------------------------
            // Groups
            // ---------------------------------------------------------------------
            const group1 = new THREE.Group();
            group1.name = 'Group';
            scene1.add( group1 );
        
            const group2 = new THREE.Group();
            group2.name = 'subGroup';
            group2.position.set( 0, 50, 0 );
            group1.add( group2 );
        
            object2 = new THREE.Mesh( new THREE.BoxGeometry( 30, 30, 30 ), material );
            object2.name = 'Cube in group';
            object2.position.set( 0, 0, 400 );
            group2.add( object2 );
        
            // ---------------------------------------------------------------------
            // THREE.Line Strip
            // ---------------------------------------------------------------------
            geometry = new THREE.BufferGeometry();
            let numPoints = 100;
            let positions = new Float32Array( numPoints * 3 );
        
            for ( let i = 0; i < numPoints; i ++ ) {
        
                positions[ i * 3 ] = i;
                positions[ i * 3 + 1 ] = Math.sin( i / 2 ) * 20;
                positions[ i * 3 + 2 ] = 0;
        
            }
        
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            object = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffff00 } ) );
            object.position.set( - 50, 0, - 200 );
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // THREE.Line Loop
            // ---------------------------------------------------------------------
            geometry = new THREE.BufferGeometry();
            numPoints = 5;
            const radius = 70;
            positions = new Float32Array( numPoints * 3 );
        
            for ( let i = 0; i < numPoints; i ++ ) {
        
                const s = i * Math.PI * 2 / numPoints;
                positions[ i * 3 ] = radius * Math.sin( s );
                positions[ i * 3 + 1 ] = radius * Math.cos( s );
                positions[ i * 3 + 2 ] = 0;
        
            }
        
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            object = new THREE.LineLoop( geometry, new THREE.LineBasicMaterial( { color: 0xffff00 } ) );
            object.position.set( 0, 0, - 200 );
        
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // THREE.Points
            // ---------------------------------------------------------------------
            numPoints = 100;
            const pointsArray = new Float32Array( numPoints * 3 );
            for ( let i = 0; i < numPoints; i ++ ) {
        
                pointsArray[ 3 * i ] = - 50 + Math.random() * 100;
                pointsArray[ 3 * i + 1 ] = Math.random() * 100;
                pointsArray[ 3 * i + 2 ] = - 50 + Math.random() * 100;
        
            }
        
            const pointsGeo = new THREE.BufferGeometry();
            pointsGeo.setAttribute( 'position', new THREE.BufferAttribute( pointsArray, 3 ) );
        
            const pointsMaterial = new THREE.PointsMaterial( { color: 0xffff00, size: 5 } );
            const pointCloud = new THREE.Points( pointsGeo, pointsMaterial );
            pointCloud.name = 'Points';
            pointCloud.position.set( - 200, 0, - 200 );
            scene1.add( pointCloud );
        
            // ---------------------------------------------------------------------
            // Ortho camera
            // ---------------------------------------------------------------------
            const cameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10 );
            scene1.add( cameraOrtho );
            cameraOrtho.name = 'OrthographicCamera';
        
            material = new THREE.MeshLambertMaterial( {
                color: 0xffff00,
                side: THREE.DoubleSide
            } );
        
            object = new THREE.Mesh( new THREE.CircleGeometry( 50, 20, 0, Math.PI * 2 ), material );
            object.position.set( 200, 0, - 400 );
            scene1.add( object );
        
            object = new THREE.Mesh( new THREE.RingGeometry( 10, 50, 20, 5, 0, Math.PI * 2 ), material );
            object.position.set( 0, 0, - 400 );
            scene1.add( object );
        
            object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
            object.position.set( - 200, 0, - 400 );
            scene1.add( object );
        
            //
            const points = [];
        
            for ( let i = 0; i < 50; i ++ ) {
        
                points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * 15 + 50, ( i - 5 ) * 2 ) );
        
            }
        
            object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
            object.position.set( 200, 0, 400 );
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // Big red box hidden just for testing `onlyVisible` option
            // ---------------------------------------------------------------------
            material = new THREE.MeshBasicMaterial( {
                color: 0xff0000
            } );
            object = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material );
            object.position.set( 0, 0, 0 );
            object.name = 'CubeHidden';
            object.visible = false;
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // Model requiring KHR_mesh_quantization
            // ---------------------------------------------------------------------
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/ShaderBall.glb', false).then( ( gltf ) => {
        
                model = gltf.scene;
                model.scale.setScalar( 50 );
                model.position.set( 200, - 40, - 200 );
                scene1.add( model );
        
            } );
        
            // ---------------------------------------------------------------------
            // Model requiring KHR_mesh_quantization
            // ---------------------------------------------------------------------
        
            material = new THREE.MeshBasicMaterial( {
                color: 0xffffff,
            } );
            object = new THREE.InstancedMesh( new THREE.BoxGeometry( 10, 10, 10, 2, 2, 2 ), material, 50 );
            const matrix = new THREE.Matrix4();
            const color = new THREE.Color();
            for ( let i = 0; i < 50; i ++ ) {
        
                matrix.setPosition( Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50 );
                object.setMatrixAt( i, matrix );
                object.setColorAt( i, color.setHSL( i / 50, 1, 0.5 ) );
        
            }
        
            object.position.set( 400, 0, 200 );
            scene1.add( object );
        
            // ---------------------------------------------------------------------
            // 2nd THREE.Scene
            // ---------------------------------------------------------------------
            scene2 = new THREE.Scene();
            object = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
            object.position.set( 0, 0, 0 );
            object.name = 'Cube2ndScene';
            scene2.name = 'Scene2';
            scene2.add( object );
        
            //
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;
        
            //
        
            // ---------------------------------------------------------------------
            // Exporting compressed textures and meshes (KTX2 / Draco / Meshopt)
            // ---------------------------------------------------------------------
           
        
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/coffeemat.glb', false).then( ( gltf ) => {
        
                gltf.scene.position.x = 400;
                gltf.scene.position.z = - 200;
        
                scene1.add( gltf.scene );
        
                coffeemat = gltf.scene;
        
            } );
        
            //
        
            const gui = new GUI();
        
            let h = gui.addFolder( 'Settings' );
            h.add( params, 'trs' ).name( 'Use TRS' );
            h.add( params, 'onlyVisible' ).name( 'Only Visible Objects' );
            h.add( params, 'binary' ).name( 'Binary (GLB)' );
            h.add( params, 'maxTextureSize', 2, 8192 ).name( 'Max Texture Size' ).step( 1 );
        
            h = gui.addFolder( 'Export' );
            h.add( params, 'exportScene1' ).name( 'Export Scene 1' );
            h.add( params, 'exportScenes' ).name( 'Export Scene 1 and 2' );
            h.add( params, 'exportSphere' ).name( 'Export Sphere' );
            h.add( params, 'exportModel' ).name( 'Export Model' );
            h.add( params, 'exportObjects' ).name( 'Export Sphere With Grid' );
            h.add( params, 'exportSceneObject' ).name( 'Export Scene 1 and Object' );
            h.add( params, 'exportCompressedObject' ).name( 'Export Coffeemat (from compressed data)' );
        
            gui.open();
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function exportScene1() {
        
            exportGLTF( scene1 );
        
        }
        
        function exportScenes() {
        
            exportGLTF( [ scene1, scene2 ] );
        
        }
        
        function exportSphere() {
        
            exportGLTF( sphere );
        
        }
        
        function exportModel() {
        
            exportGLTF( model );
        
        }
        
        function exportObjects() {
        
            exportGLTF( [ sphere, gridHelper ] );
        
        }
        
        function exportSceneObject() {
        
            exportGLTF( [ scene1, gridHelper ] );
        
        }
        
        function exportCompressedObject() {
        
            exportGLTF( [ coffeemat ] );
        
        }
        
        //
        
        function animate() {
        
            const timer = Date.now() * 0.0001;
        
            camera.position.x = Math.cos( timer ) * 800;
            camera.position.z = Math.sin( timer ) * 800;
        
            camera.lookAt( scene1.position );
            
        
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};