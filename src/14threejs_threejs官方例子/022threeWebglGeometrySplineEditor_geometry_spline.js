
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/022threeWebglGeometrySplineEditor
        // --geometry_spline_editor--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_spline_editor
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1, 
                far: 10000,
                position: [ 0, 250, 1000]
            },
            control: {
                target: [ 0, 250, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        let controls = app.cameraControl;
        
        const splineHelperObjects = [];
        let splinePointsLength = 4;
        const positions = [];
        const point = new THREE.Vector3();
        
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const onUpPosition = new THREE.Vector2();
        const onDownPosition = new THREE.Vector2();
        
        const geometry = new THREE.BoxGeometry( 20, 20, 20 );
        let transformControl;
        
        const ARC_SEGMENTS = 200;
        
        const splines = {};
        
        const params = {
            uniform: true,
            tension: 0.5,
            centripetal: true,
            chordal: true,
            addPoint: addPoint,
            removePoint: removePoint,
            exportSpline: exportSpline
        };
        
        init();
        
        function init() {
            renderer.shadowMap.enabled = true;
        
            scene.add( new THREE.AmbientLight( 0xf0f0f0, 3 ) );
            const light = new THREE.SpotLight( 0xffffff, 4.5 );
            light.position.set( 0, 1500, 200 );
            light.angle = Math.PI * 0.2;
            light.decay = 0;
            light.castShadow = true;
            light.shadow.camera.near = 200;
            light.shadow.camera.far = 2000;
            light.shadow.bias = - 0.000222;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            scene.add( light );
        
            const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
            planeGeometry.rotateX( - Math.PI / 2 );
            const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );
        
            const plane = new THREE.Mesh( planeGeometry, planeMaterial );
            plane.position.y = - 200;
            plane.receiveShadow = true;
            scene.add( plane );
        
            const helper = new THREE.GridHelper( 2000, 100 );
            helper.position.y = - 199;
            helper.material.opacity = 0.25;
            helper.material.transparent = true;
            scene.add( helper );
        
            const gui = new GUI();
        
            gui.add( params, 'uniform' ).onChange( render );
            gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
        
                splines.uniform.tension = value;
                updateSplineOutline();
                render();
        
            } );
            gui.add( params, 'centripetal' ).onChange( render );
            gui.add( params, 'chordal' ).onChange( render );
            gui.add( params, 'addPoint' );
            gui.add( params, 'removePoint' );
            gui.add( params, 'exportSpline' );
            gui.open();
        
           
        
            transformControl = new TransformControls( camera, renderer.domElement );
            transformControl.addEventListener( 'change', render );
            transformControl.addEventListener( 'dragging-changed', function ( event ) {
        
                controls.enabled = ! event.value;
        
            } );
            scene.add( transformControl );
        
            transformControl.addEventListener( 'objectChange', function () {
        
                updateSplineOutline();
        
            } );
        
        
            app.signal.onPointerDown.add(e => onPointerDown(e.originalEvent))
            app.signal.onPointerUp.add(e => onPointerUp(e.originalEvent))
            app.signal.onPointerMove.add(e => onPointerMove(e.originalEvent))
        
        
            /*******
             * Curves
             *********/
        
            for ( let i = 0; i < splinePointsLength; i ++ ) {
        
                addSplineObject( positions[ i ] );
        
            }
        
            positions.length = 0;
        
            for ( let i = 0; i < splinePointsLength; i ++ ) {
        
                positions.push( splineHelperObjects[ i ].position );
        
            }
        
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );
        
            let curve = new THREE.CatmullRomCurve3( positions );
            curve.curveType = 'catmullrom';
            curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
                color: 0xff0000,
                opacity: 0.35
            } ) );
            curve.mesh.castShadow = true;
            splines.uniform = curve;
        
            curve = new THREE.CatmullRomCurve3( positions );
            curve.curveType = 'centripetal';
            curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
                color: 0x00ff00,
                opacity: 0.35
            } ) );
            curve.mesh.castShadow = true;
            splines.centripetal = curve;
        
            curve = new THREE.CatmullRomCurve3( positions );
            curve.curveType = 'chordal';
            curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
                color: 0x0000ff,
                opacity: 0.35
            } ) );
            curve.mesh.castShadow = true;
            splines.chordal = curve;
        
            for ( const k in splines ) {
        
                const spline = splines[ k ];
                scene.add( spline.mesh );
        
            }
        
            load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
                new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
                new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
                new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );
        
            render();
        
        }
        
        function addSplineObject( position ) {
        
            const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
            const object = new THREE.Mesh( geometry, material );
        
            if ( position ) {
        
                object.position.copy( position );
        
            } else {
        
                object.position.x = Math.random() * 1000 - 500;
                object.position.y = Math.random() * 600;
                object.position.z = Math.random() * 800 - 400;
        
            }
        
            object.castShadow = true;
            object.receiveShadow = true;
            scene.add( object );
            splineHelperObjects.push( object );
            return object;
        
        }
        
        function addPoint() {
        
            splinePointsLength ++;
        
            positions.push( addSplineObject().position );
        
            updateSplineOutline();
        
            render();
        
        }
        
        function removePoint() {
        
            if ( splinePointsLength <= 4 ) {
        
                return;
        
            }
        
            const point = splineHelperObjects.pop();
            splinePointsLength --;
            positions.pop();
        
            if ( transformControl.object === point ) transformControl.detach();
            scene.remove( point );
        
            updateSplineOutline();
        
            render();
        
        }
        
        function updateSplineOutline() {
        
            for ( const k in splines ) {
        
                const spline = splines[ k ];
        
                const splineMesh = spline.mesh;
                const position = splineMesh.geometry.attributes.position;
        
                for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {
        
                    const t = i / ( ARC_SEGMENTS - 1 );
                    spline.getPoint( t, point );
                    position.setXYZ( i, point.x, point.y, point.z );
        
                }
        
                position.needsUpdate = true;
        
            }
        
        }
        
        function exportSpline() {
        
            const strplace = [];
        
            for ( let i = 0; i < splinePointsLength; i ++ ) {
        
                const p = splineHelperObjects[ i ].position;
                strplace.push( `new THREE.Vector3(${p.x}, ${p.y}, ${p.z})` );
        
            }
        
            console.log( strplace.join( ',\n' ) );
            const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
            prompt( 'copy and paste code', code );
        
        }
        
        function load( new_positions ) {
        
            while ( new_positions.length > positions.length ) {
        
                addPoint();
        
            }
        
            while ( new_positions.length < positions.length ) {
        
                removePoint();
        
            }
        
            for ( let i = 0; i < positions.length; i ++ ) {
        
                positions[ i ].copy( new_positions[ i ] );
        
            }
        
            updateSplineOutline();
        
        }
        
        function render() {
        
            splines.uniform.mesh.visible = params.uniform;
            splines.centripetal.mesh.visible = params.centripetal;
            splines.chordal.mesh.visible = params.chordal;
            renderer.render( scene, camera );
        
        }
        
        function onPointerDown( event ) {
        
            onDownPosition.x = event.clientX;
            onDownPosition.y = event.clientY;
        
        }
        
        function onPointerUp( event ) {
        
            onUpPosition.x = event.clientX;
            onUpPosition.y = event.clientY;
        
            if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {
        
                transformControl.detach();
                render();
        
            }
        
        }
        
        function onPointerMove( event ) {
        
            pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
            raycaster.setFromCamera( pointer, camera );
        
            const intersects = raycaster.intersectObjects( splineHelperObjects, false );
        
            if ( intersects.length > 0 ) {
        
                const object = intersects[ 0 ].object;
        
                if ( object !== transformControl.object ) {
        
                    transformControl.attach( object );
        
                }
        
            }
        
        }
    }
    catch (e) {
        console.error(e);
    }
};