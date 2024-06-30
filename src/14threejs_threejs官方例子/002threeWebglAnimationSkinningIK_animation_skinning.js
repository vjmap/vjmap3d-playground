
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/002threeWebglAnimationSkinningIK
        // --animation_skinning_ik--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_animation_skinning_ik
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false,
                background: 0xffffff,
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 55,
                near: 0.001,
                far: 5000,
                position: [0.9728517749133652, 1.1044765132727201, 0.7316689528482836],
                lookAt: [0, 0, 0],
            },
            control: {
                minDistance: 0.2,
                maxDistance: 1.5,
                draggingSmoothTime: 0.3
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        let orbitControls = app.cameraControl;
        
        scene.fog = new THREE.FogExp2( 0xffffff, .17 );
        
        let mirrorSphereCamera;
        let transformControls;
        const OOI = {};
        let IKSolver;
        
        let gui, conf;
        const v0 = new THREE.Vector3();
        
        init().then( () => {
            app.signal.onAppUpdate.add(() => animate())
        } );
        
        async function init() {
        
            conf = {
                followSphere: false,
                turnHead: true,
                ik_solver: true,
                update: updateIK
            };
        
        
            const ambientLight = new THREE.AmbientLight( 0xffffff, 8 ); // soft white light
            scene.add( ambientLight );
        
          
            app.logInfo("资源加载中，请稍候...")
            const gltf = await vjmap3d.ResManager.loadRes( 'https://vjmap.com/map3d/resources/models/kira.glb' , false );
            gltf.scene.traverse( n => {
        
                if ( n.name === 'head' ) OOI.head = n;
                if ( n.name === 'lowerarm_l' ) OOI.lowerarm_l = n;
                if ( n.name === 'Upperarm_l' ) OOI.Upperarm_l = n;
                if ( n.name === 'hand_l' ) OOI.hand_l = n;
                if ( n.name === 'target_hand_l' ) OOI.target_hand_l = n;
        
                if ( n.name === 'boule' ) OOI.sphere = n;
                if ( n.name === 'Kira_Shirt_left' ) OOI.kira = n;
        
            } );
            scene.add( gltf.scene );
        
            orbitControls.setTarget( OOI.sphere.position.x,  OOI.sphere.position.y, OOI.sphere.position.z); // orbit controls lookAt the sphere
            OOI.hand_l.attach( OOI.sphere );
        
            // mirror sphere cube-camera
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 1024 );
            mirrorSphereCamera = new THREE.CubeCamera( 0.05, 50, cubeRenderTarget );
            scene.add( mirrorSphereCamera );
            const mirrorSphereMaterial = new THREE.MeshBasicMaterial( { envMap: cubeRenderTarget.texture } );
            OOI.sphere.material = mirrorSphereMaterial;
        
            transformControls = new TransformControls( camera, renderer.domElement );
            transformControls.size = 0.75;
            transformControls.showX = false;
            transformControls.space = 'world';
            transformControls.attach( OOI.target_hand_l );
            scene.add( transformControls );
        
            // disable orbitControls while using transformControls
            transformControls.addEventListener( 'mouseDown', () => orbitControls.enabled = false );
            transformControls.addEventListener( 'mouseUp', () => orbitControls.enabled = true );
        
            OOI.kira.add( OOI.kira.skeleton.bones[ 0 ] );
            const iks = [
                {
                    target: 22, // "target_hand_l"
                    effector: 6, // "hand_l"
                    links: [
                        {
                            index: 5, // "lowerarm_l"
                            rotationMin: new THREE.Vector3( 1.2, - 1.8, - .4 ),
                            rotationMax: new THREE.Vector3( 1.7, - 1.1, .3 )
                        },
                        {
                            index: 4, // "Upperarm_l"
                            rotationMin: new THREE.Vector3( 0.1, - 0.7, - 1.8 ),
                            rotationMax: new THREE.Vector3( 1.1, 0, - 1.4 )
                        },
                    ],
                }
            ];
            IKSolver = new CCDIKSolver( OOI.kira, iks );
            const ccdikhelper = new CCDIKHelper( OOI.kira, iks, 0.01 );
            scene.add( ccdikhelper );
        
            gui = new GUI();
            gui.add( conf, 'followSphere' ).name( 'follow sphere' );
            gui.add( conf, 'turnHead' ).name( 'turn head' );
            gui.add( conf, 'ik_solver' ).name( 'IK auto update' );
            gui.add( conf, 'update' ).name( 'IK manual update()' );
            gui.open();
        
            
        }
        
        function animate( ) {
        
            if ( OOI.sphere && mirrorSphereCamera ) {
        
                OOI.sphere.visible = false;
                OOI.sphere.getWorldPosition( mirrorSphereCamera.position );
                mirrorSphereCamera.update( renderer, scene );
                OOI.sphere.visible = true;
        
            }
        
            if ( OOI.sphere && conf.followSphere ) {
        
                // orbitControls follows the sphere
                OOI.sphere.getWorldPosition( v0 );
                orbitControls.target.lerp( v0, 0.1 );
        
            }
        
            if ( OOI.head && OOI.sphere && conf.turnHead ) {
        
                // turn head
                OOI.sphere.getWorldPosition( v0 );
                OOI.head.lookAt( v0 );
                OOI.head.rotation.set( OOI.head.rotation.x, OOI.head.rotation.y + Math.PI, OOI.head.rotation.z );
        
            }
        
            if ( conf.ik_solver ) {
        
                updateIK();
        
            }
        
            
        
        }
        
        function updateIK() {
        
            if ( IKSolver ) IKSolver.update();
        
            scene.traverse( function ( object ) {
        
                if ( object.isSkinnedMesh ) object.computeBoundingSphere();
        
            } );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};