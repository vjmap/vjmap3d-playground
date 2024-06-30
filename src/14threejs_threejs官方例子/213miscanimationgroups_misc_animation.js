
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/213miscanimationgroups
        // --misc_animation_groups--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_animation_groups
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
                position: [ 50, 50, 100 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mixer;
        
        init();
        
        function init() {
        
            camera.lookAt( scene.position );
        
            // all objects of this animation group share a common animation state
        
            const animationGroup = new THREE.AnimationObjectGroup();
        
            //
        
            const geometry = new THREE.BoxGeometry( 5, 5, 5 );
            const material = new THREE.MeshBasicMaterial( { transparent: true } );
        
            //
        
            for ( let i = 0; i < 5; i ++ ) {
        
                for ( let j = 0; j < 5; j ++ ) {
        
                    const mesh = new THREE.Mesh( geometry, material );
        
                    mesh.position.x = 32 - ( 16 * i );
                    mesh.position.y = 0;
                    mesh.position.z = 32 - ( 16 * j );
        
                    scene.add( mesh );
                    animationGroup.add( mesh );
        
                }
        
            }
        
            // create some keyframe tracks
        
            const xAxis = new THREE.Vector3( 1, 0, 0 );
            const qInitial = new THREE.Quaternion().setFromAxisAngle( xAxis, 0 );
            const qFinal = new THREE.Quaternion().setFromAxisAngle( xAxis, Math.PI );
            const quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, 1, 2 ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w ] );
        
            const colorKF = new THREE.ColorKeyframeTrack( '.material.color', [ 0, 1, 2 ], [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], THREE.InterpolateDiscrete );
            const opacityKF = new THREE.NumberKeyframeTrack( '.material.opacity', [ 0, 1, 2 ], [ 1, 0, 1 ] );
        
            // create clip
        
            const clip = new THREE.AnimationClip( 'default', 3, [ quaternionKF, colorKF, opacityKF ] );
        
            // apply the animation group to the mixer as the root object
        
            mixer = new THREE.AnimationMixer( animationGroup );
        
            const clipAction = mixer.clipAction( clip );
            clipAction.play();
        
          
            app.signal.onAppUpdate.add(animate)
        
        }
        
        function animate(e) {
        
            const delta = e.deltaTime;
        
            if ( mixer ) {
        
                mixer.update( delta );
        
            }
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};