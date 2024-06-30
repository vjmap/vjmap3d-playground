
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/214miscanimationkeys
        // --misc_animation_keys--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_animation_keys
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [25, 25, 50]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mixer;
        
        init();
        
        function init() {
        
            camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.set( 25, 25, 50 );
            camera.lookAt( scene.position );
        
            //
        
            const axesHelper = new THREE.AxesHelper( 10 );
            scene.add( axesHelper );
        
            //
        
            const geometry = new THREE.BoxGeometry( 5, 5, 5 );
            const material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true } );
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            // create a keyframe track (i.e. a timed sequence of keyframes) for each animated property
            // Note: the keyframe track type should correspond to the type of the property being animated
        
            // POSITION
            const positionKF = new THREE.VectorKeyframeTrack( '.position', [ 0, 1, 2 ], [ 0, 0, 0, 30, 0, 0, 0, 0, 0 ] );
        
            // SCALE
            const scaleKF = new THREE.VectorKeyframeTrack( '.scale', [ 0, 1, 2 ], [ 1, 1, 1, 2, 2, 2, 1, 1, 1 ] );
        
            // ROTATION
            // Rotation should be performed using quaternions, using a THREE.QuaternionKeyframeTrack
            // Interpolating Euler angles (.rotation property) can be problematic and is currently not supported
        
            // set up rotation about x axis
            const xAxis = new THREE.Vector3( 1, 0, 0 );
        
            const qInitial = new THREE.Quaternion().setFromAxisAngle( xAxis, 0 );
            const qFinal = new THREE.Quaternion().setFromAxisAngle( xAxis, Math.PI );
            const quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, 1, 2 ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w ] );
        
            // COLOR
            const colorKF = new THREE.ColorKeyframeTrack( '.material.color', [ 0, 1, 2 ], [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], THREE.InterpolateDiscrete );
        
            // OPACITY
            const opacityKF = new THREE.NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2 ], [ 1, 0, 1 ] );
        
            // create an animation sequence with the tracks
            // If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
            const clip = new THREE.AnimationClip( 'Action', 3, [ scaleKF, positionKF, quaternionKF, colorKF, opacityKF ] );
        
            // setup the THREE.AnimationMixer
            mixer = new THREE.AnimationMixer( mesh );
        
            // create a ClipAction and set it to play
            const clipAction = mixer.clipAction( clip );
            clipAction.play();
        
            //
            app.signal.onAppUpdate.add(animate)
        
        }
        
        function animate(e) {
        
            const delta = e.deltaTime
        
            if ( mixer ) {
        
                mixer.update( delta );
        
            }
        
           
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};