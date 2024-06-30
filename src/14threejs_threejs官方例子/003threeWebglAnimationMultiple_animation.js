
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/003threeWebglAnimationMultiple
        // --animation_multiple--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_animation_multiple
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false,
                background: 0xa0a0a0,
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [2, 3, - 6 ],
                lookAt: [0, 1, 0],
            },
            control: {
                target: [0, 1, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
        renderer.shadowMap.enabled = true;
        
        let model, animations;
        
        const mixers = [], objects = [];
        
        const params = {
            sharedSkeleton: false
        };
        
        init().then(() => {
            app.signal.onAppUpdate.add(e => animate(e))
        })
        
        async function init() {
        
            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
            hemiLight.position.set( 0, 20, 0 );
            scene.add( hemiLight );
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.position.set( - 3, 10, - 10 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.top = 4;
            dirLight.shadow.camera.bottom = - 4;
            dirLight.shadow.camera.left = - 4;
            dirLight.shadow.camera.right = 4;
            dirLight.shadow.camera.near = 0.1;
            dirLight.shadow.camera.far = 40;
            scene.add( dirLight );
        
            // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );
        
            // ground
        
            const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            scene.add( mesh );
        
            let gltf = await vjmap3d.ResManager.loadRes(env.assetsPath + "models/soldier.glb", false);
        
            model = gltf.scene;
            animations = gltf.animations;
        
            model.traverse( function ( object ) {
        
                if ( object.isMesh ) object.castShadow = true;
        
            } );
        
            setupDefaultScene();
        
        
            const gui = new GUI();
        
            gui.add( params, 'sharedSkeleton' ).onChange( function () {
        
                clearScene();
        
                if ( params.sharedSkeleton === true ) {
        
                    setupSharedSkeletonScene();
        
                } else {
        
                    setupDefaultScene();
        
                }
        
            } );
            gui.open();
        
        }
        
        function clearScene() {
        
            for ( const mixer of mixers ) {
        
                mixer.stopAllAction();
        
            }
        
            mixers.length = 0;
        
            //
        
            for ( const object of objects ) {
        
                scene.remove( object );
        
                scene.traverse( function ( child ) {
        
                    if ( child.isSkinnedMesh ) child.skeleton.dispose();
        
                } );
        
            }
        
        }
        
        function setupDefaultScene() {
        
            // three cloned models with independent skeletons.
            // each model can have its own animation state
        
            const model1 = SkeletonUtils.clone( model );
            const model2 = SkeletonUtils.clone( model );
            const model3 = SkeletonUtils.clone( model );
        
            model1.position.x = - 2;
            model2.position.x = 0;
            model3.position.x = 2;
        
            const mixer1 = new THREE.AnimationMixer( model1 );
            const mixer2 = new THREE.AnimationMixer( model2 );
            const mixer3 = new THREE.AnimationMixer( model3 );
        
            mixer1.clipAction( animations[ 0 ] ).play(); // idle
            mixer2.clipAction( animations[ 1 ] ).play(); // run
            mixer3.clipAction( animations[ 3 ] ).play(); // walk
        
            scene.add( model1, model2, model3 );
        
            objects.push( model1, model2, model3 );
            mixers.push( mixer1, mixer2, mixer3 );
        
        }
        
        function setupSharedSkeletonScene() {
        
            // three cloned models with a single shared skeleton.
            // all models share the same animation state
        
            const sharedModel = SkeletonUtils.clone( model );
            const shareSkinnedMesh = sharedModel.getObjectByName( 'vanguard_Mesh' );
            const sharedSkeleton = shareSkinnedMesh.skeleton;
            const sharedParentBone = sharedModel.getObjectByName( 'mixamorigHips' );
            scene.add( sharedParentBone ); // the bones need to be in the scene for the animation to work
        
            const model1 = shareSkinnedMesh.clone();
            const model2 = shareSkinnedMesh.clone();
            const model3 = shareSkinnedMesh.clone();
        
            model1.bindMode = THREE.DetachedBindMode;
            model2.bindMode = THREE.DetachedBindMode;
            model3.bindMode = THREE.DetachedBindMode;
        
            const identity = new THREE.Matrix4();
        
            model1.bind( sharedSkeleton, identity );
            model2.bind( sharedSkeleton, identity );
            model3.bind( sharedSkeleton, identity );
        
            model1.position.x = - 2;
            model2.position.x = 0;
            model3.position.x = 2;
        
            // apply transformation from the glTF asset
        
            model1.scale.setScalar( 0.01 );
            model1.rotation.x = - Math.PI * 0.5;
            model2.scale.setScalar( 0.01 );
            model2.rotation.x = - Math.PI * 0.5;
            model3.scale.setScalar( 0.01 );
            model3.rotation.x = - Math.PI * 0.5;
        
            //
        
            const mixer = new THREE.AnimationMixer( sharedParentBone );
            mixer.clipAction( animations[ 1 ] ).play();
        
            scene.add( sharedParentBone, model1, model2, model3 );
        
            objects.push( sharedParentBone, model1, model2, model3 );
            mixers.push( mixer );
        
        }
        
        
        function animate(e) {
        
           
            const delta = e.deltaTime;
        
            for ( const mixer of mixers ) mixer.update( delta );
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};