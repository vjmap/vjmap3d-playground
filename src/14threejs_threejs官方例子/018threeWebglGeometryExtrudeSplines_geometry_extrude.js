
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/018threeWebglGeometryExtrudeSplines
        // --geometry_extrude_splines--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_extrude_splines
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 0.01, 
                far: 10000,
                position: [0, 50, 500]
            },
            control: {
                minDistance: 100,
                maxDistance: 2000
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let splineCamera, cameraHelper, cameraEye;
        
        const direction = new THREE.Vector3();
        const binormal = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const position = new THREE.Vector3();
        const lookAt = new THREE.Vector3();
        
        const pipeSpline = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( 0, 10, - 10 ), new THREE.Vector3( 10, 0, - 10 ),
            new THREE.Vector3( 20, 0, 0 ), new THREE.Vector3( 30, 0, 10 ),
            new THREE.Vector3( 30, 0, 20 ), new THREE.Vector3( 20, 0, 30 ),
            new THREE.Vector3( 10, 0, 30 ), new THREE.Vector3( 0, 0, 30 ),
            new THREE.Vector3( - 10, 10, 30 ), new THREE.Vector3( - 10, 20, 30 ),
            new THREE.Vector3( 0, 30, 30 ), new THREE.Vector3( 10, 30, 30 ),
            new THREE.Vector3( 20, 30, 15 ), new THREE.Vector3( 10, 30, 10 ),
            new THREE.Vector3( 0, 30, 10 ), new THREE.Vector3( - 10, 20, 10 ),
            new THREE.Vector3( - 10, 10, 10 ), new THREE.Vector3( 0, 0, 10 ),
            new THREE.Vector3( 10, - 10, 10 ), new THREE.Vector3( 20, - 15, 10 ),
            new THREE.Vector3( 30, - 15, 10 ), new THREE.Vector3( 40, - 15, 10 ),
            new THREE.Vector3( 50, - 15, 10 ), new THREE.Vector3( 60, 0, 10 ),
            new THREE.Vector3( 70, 0, 0 ), new THREE.Vector3( 80, 0, 0 ),
            new THREE.Vector3( 90, 0, 0 ), new THREE.Vector3( 100, 0, 0 )
        ] );
        
        const sampleClosedSpline = new THREE.CatmullRomCurve3( [
            new THREE.Vector3( 0, - 40, - 40 ),
            new THREE.Vector3( 0, 40, - 40 ),
            new THREE.Vector3( 0, 140, - 40 ),
            new THREE.Vector3( 0, 40, 40 ),
            new THREE.Vector3( 0, - 40, 40 )
        ] );
        
        sampleClosedSpline.curveType = 'catmullrom';
        sampleClosedSpline.closed = true;
        
        // Keep a dictionary of Curve instances
        const splines = {
            GrannyKnot: new Curves.GrannyKnot(),
            HeartCurve: new Curves.HeartCurve( 3.5 ),
            VivianiCurve: new Curves.VivianiCurve( 70 ),
            KnotCurve: new Curves.KnotCurve(),
            HelixCurve: new Curves.HelixCurve(),
            TrefoilKnot: new Curves.TrefoilKnot(),
            TorusKnot: new Curves.TorusKnot( 20 ),
            CinquefoilKnot: new Curves.CinquefoilKnot( 20 ),
            TrefoilPolynomialKnot: new Curves.TrefoilPolynomialKnot( 14 ),
            FigureEightPolynomialKnot: new Curves.FigureEightPolynomialKnot(),
            DecoratedTorusKnot4a: new Curves.DecoratedTorusKnot4a(),
            DecoratedTorusKnot4b: new Curves.DecoratedTorusKnot4b(),
            DecoratedTorusKnot5a: new Curves.DecoratedTorusKnot5a(),
            DecoratedTorusKnot5c: new Curves.DecoratedTorusKnot5c(),
            PipeSpline: pipeSpline,
            SampleClosedSpline: sampleClosedSpline
        };
        
        let parent, tubeGeometry, mesh;
        
        const params = {
            spline: 'GrannyKnot',
            scale: 4,
            extrusionSegments: 100,
            radiusSegments: 3,
            closed: true,
            animationView: false,
            lookAhead: false,
            cameraHelper: false,
        };
        
        const material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
        
        const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );
        
        function addTube() {
        
            if ( mesh !== undefined ) {
        
                parent.remove( mesh );
                mesh.geometry.dispose();
        
            }
        
            const extrudePath = splines[ params.spline ];
        
            tubeGeometry = new THREE.TubeGeometry( extrudePath, params.extrusionSegments, 2, params.radiusSegments, params.closed );
        
            addGeometry( tubeGeometry );
        
            setScale();
        
        }
        
        function setScale() {
        
            mesh.scale.set( params.scale, params.scale, params.scale );
        
        }
        
        
        function addGeometry( geometry ) {
        
            // 3D shape
        
            mesh = new THREE.Mesh( geometry, material );
            const wireframe = new THREE.Mesh( geometry, wireframeMaterial );
            mesh.add( wireframe );
        
            parent.add( mesh );
        
        }
        
        function animateCamera() {
        
            cameraHelper.visible = params.cameraHelper;
            cameraEye.visible = params.cameraHelper;
        
        }
        
        init();
        
        function init() {
        
            // light
        
            scene.add( new THREE.AmbientLight( 0xffffff ) );
        
            const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
            light.position.set( 0, 0, 1 );
            scene.add( light );
        
            // tube
        
            parent = new THREE.Object3D();
            scene.add( parent );
        
            splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 1000 );
            parent.add( splineCamera );
        
            cameraHelper = new THREE.CameraHelper( splineCamera );
            scene.add( cameraHelper );
        
            addTube();
        
            // debug camera
        
            cameraEye = new THREE.Mesh( new THREE.SphereGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
            parent.add( cameraEye );
        
            cameraHelper.visible = params.cameraHelper;
            cameraEye.visible = params.cameraHelper;
        
            // dat.GUI
        
            const gui = new GUI( { width: 285 } );
        
            const folderGeometry = gui.addFolder( 'Geometry' );
            folderGeometry.add( params, 'spline', Object.keys( splines ) ).onChange( function () {
        
                addTube();
        
            } );
            folderGeometry.add( params, 'scale', 2, 10 ).step( 2 ).onChange( function () {
        
                setScale();
        
            } );
            folderGeometry.add( params, 'extrusionSegments', 50, 500 ).step( 50 ).onChange( function () {
        
                addTube();
        
            } );
            folderGeometry.add( params, 'radiusSegments', 2, 12 ).step( 1 ).onChange( function () {
        
                addTube();
        
            } );
            folderGeometry.add( params, 'closed' ).onChange( function () {
        
                addTube();
        
            } );
            folderGeometry.open();
        
            const folderCamera = gui.addFolder( 'Camera' );
            folderCamera.add( params, 'animationView' ).onChange( function () {
        
                animateCamera();
        
            } );
            folderCamera.add( params, 'lookAhead' ).onChange( function () {
        
                animateCamera();
        
            } );
            folderCamera.add( params, 'cameraHelper' ).onChange( function () {
        
                animateCamera();
        
            } );
            folderCamera.open();
        
        
           app.signal.onAppUpdate.add(render)
        
        }
        
        //
        
        function render() {
        
            // animate camera along spline
        
            const time = Date.now();
            const looptime = 20 * 1000;
            const t = ( time % looptime ) / looptime;
        
            tubeGeometry.parameters.path.getPointAt( t, position );
            position.multiplyScalar( params.scale );
        
            // interpolation
        
            const segments = tubeGeometry.tangents.length;
            const pickt = t * segments;
            const pick = Math.floor( pickt );
            const pickNext = ( pick + 1 ) % segments;
        
            binormal.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
            binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );
        
            tubeGeometry.parameters.path.getTangentAt( t, direction );
            const offset = 15;
        
            normal.copy( binormal ).cross( direction );
        
            // we move on a offset on its binormal
        
            position.add( normal.clone().multiplyScalar( offset ) );
        
            splineCamera.position.copy( position );
            cameraEye.position.copy( position );
        
            // using arclength for stablization in look ahead
        
            tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1, lookAt );
            lookAt.multiplyScalar( params.scale );
        
            // camera orientation 2 - up orientation via normal
        
            if ( ! params.lookAhead ) lookAt.copy( position ).add( direction );
            splineCamera.matrix.lookAt( splineCamera.position, lookAt, normal );
            splineCamera.quaternion.setFromRotationMatrix( splineCamera.matrix );
        
            cameraHelper.update();
        
        }
    }
    catch (e) {
        console.error(e);
    }
};