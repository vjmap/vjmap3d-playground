
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/109threeWebglmorphtargetsWebcam
        // --morphtargets_webcam--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_morphtargets_webcam
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x666666,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 1,
                far: 100,
                position: [0, 0, 5]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const { FaceLandmarker, FilesetResolver } = vision;
        
        const blendshapesMap = {
            // '_neutral': '',
            'browDownLeft': 'browDown_L',
            'browDownRight': 'browDown_R',
            'browInnerUp': 'browInnerUp',
            'browOuterUpLeft': 'browOuterUp_L',
            'browOuterUpRight': 'browOuterUp_R',
            'cheekPuff': 'cheekPuff',
            'cheekSquintLeft': 'cheekSquint_L',
            'cheekSquintRight': 'cheekSquint_R',
            'eyeBlinkLeft': 'eyeBlink_L',
            'eyeBlinkRight': 'eyeBlink_R',
            'eyeLookDownLeft': 'eyeLookDown_L',
            'eyeLookDownRight': 'eyeLookDown_R',
            'eyeLookInLeft': 'eyeLookIn_L',
            'eyeLookInRight': 'eyeLookIn_R',
            'eyeLookOutLeft': 'eyeLookOut_L',
            'eyeLookOutRight': 'eyeLookOut_R',
            'eyeLookUpLeft': 'eyeLookUp_L',
            'eyeLookUpRight': 'eyeLookUp_R',
            'eyeSquintLeft': 'eyeSquint_L',
            'eyeSquintRight': 'eyeSquint_R',
            'eyeWideLeft': 'eyeWide_L',
            'eyeWideRight': 'eyeWide_R',
            'jawForward': 'jawForward',
            'jawLeft': 'jawLeft',
            'jawOpen': 'jawOpen',
            'jawRight': 'jawRight',
            'mouthClose': 'mouthClose',
            'mouthDimpleLeft': 'mouthDimple_L',
            'mouthDimpleRight': 'mouthDimple_R',
            'mouthFrownLeft': 'mouthFrown_L',
            'mouthFrownRight': 'mouthFrown_R',
            'mouthFunnel': 'mouthFunnel',
            'mouthLeft': 'mouthLeft',
            'mouthLowerDownLeft': 'mouthLowerDown_L',
            'mouthLowerDownRight': 'mouthLowerDown_R',
            'mouthPressLeft': 'mouthPress_L',
            'mouthPressRight': 'mouthPress_R',
            'mouthPucker': 'mouthPucker',
            'mouthRight': 'mouthRight',
            'mouthRollLower': 'mouthRollLower',
            'mouthRollUpper': 'mouthRollUpper',
            'mouthShrugLower': 'mouthShrugLower',
            'mouthShrugUpper': 'mouthShrugUpper',
            'mouthSmileLeft': 'mouthSmile_L',
            'mouthSmileRight': 'mouthSmile_R',
            'mouthStretchLeft': 'mouthStretch_L',
            'mouthStretchRight': 'mouthStretch_R',
            'mouthUpperUpLeft': 'mouthUpperUp_L',
            'mouthUpperUpRight': 'mouthUpperUp_R',
            'noseSneerLeft': 'noseSneer_L',
            'noseSneerRight': 'noseSneer_R',
            // '': 'tongueOut'
        };
        
        //
        
        scene.scale.x = - 1;
        
        const environment = new RoomEnvironment( renderer );
        const pmremGenerator = new THREE.PMREMGenerator( renderer );
        
        scene.background = new THREE.Color( 0x666666 );
        scene.environment = pmremGenerator.fromScene( environment ).texture;
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        // Face
        
        let face, eyeL, eyeR;
        const eyeRotationLimit = THREE.MathUtils.degToRad( 30 );
        
        vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/facecap.glb', false).then( ( gltf ) => {
        
                const mesh = gltf.scene.children[ 0 ];
                scene.add( mesh );
        
                const head = mesh.getObjectByName( 'mesh_2' );
                head.material = new THREE.MeshNormalMaterial();
        
                face = mesh.getObjectByName( 'mesh_2' );
                eyeL = mesh.getObjectByName( 'eyeLeft' );
                eyeR = mesh.getObjectByName( 'eyeRight' );
        
                // GUI
        
                const gui = new GUI();
                gui.close();
        
                const influences = head.morphTargetInfluences;
        
                for ( const [ key, value ] of Object.entries( head.morphTargetDictionary ) ) {
        
                    gui.add( influences, value, 0, 1, 0.01 )
                        .name( key.replace( 'blendShape1.', '' ) )
                        .listen( influences );
        
                }
        
                renderer.setAnimationLoop( animate );
        
            } );
        
        // Video Texture
        
        const video = document.createElement( 'video' );
        
        const texture = new THREE.VideoTexture( video );
        texture.colorSpace = THREE.SRGBColorSpace;
        
        const geometry = new THREE.PlaneGeometry( 1, 1 );
        const material = new THREE.MeshBasicMaterial( { map: texture, depthWrite: false } );
        const videomesh = new THREE.Mesh( geometry, material );
        scene.add( videomesh );
        
        // MediaPipe
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions( filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 1
        } );
        
        if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
        
            navigator.mediaDevices.getUserMedia( { video: { facingMode: 'user' } } )
                .then( function ( stream ) {
        
                    video.srcObject = stream;
                    video.play();
        
                } )
                .catch( function ( error ) {
        
                    console.error( 'Unable to access the camera/webcam.', error );
        
                } );
        
        }
        
        const transform = new THREE.Object3D();
        
        function animate() {
        
            if ( video.readyState >= HTMLMediaElement.HAVE_METADATA ) {
        
                const results = faceLandmarker.detectForVideo( video, Date.now() );
        
                if ( results.facialTransformationMatrixes.length > 0 ) {
        
                    const facialTransformationMatrixes = results.facialTransformationMatrixes[ 0 ].data;
        
                    transform.matrix.fromArray( facialTransformationMatrixes );
                    transform.matrix.decompose( transform.position, transform.quaternion, transform.scale );
        
                    const object = scene.getObjectByName( 'grp_transform' );
        
                    object.position.x = transform.position.x;
                    object.position.y = transform.position.z + 40;
                    object.position.z = - transform.position.y;
        
                    object.rotation.x = transform.rotation.x;
                    object.rotation.y = transform.rotation.z;
                    object.rotation.z = - transform.rotation.y;
        
                }
        
                if ( results.faceBlendshapes.length > 0 ) {
        
                    const faceBlendshapes = results.faceBlendshapes[ 0 ].categories;
        
                    // Morph values does not exist on the eye meshes, so we map the eyes blendshape score into rotation values
                    const eyeScore = {
                        leftHorizontal: 0,
                        rightHorizontal: 0,
                        leftVertical: 0,
                        rightVertical: 0,
                        };
        
                    for ( const blendshape of faceBlendshapes ) {
        
                        const categoryName = blendshape.categoryName;
                        const score = blendshape.score;
        
                        const index = face.morphTargetDictionary[ blendshapesMap[ categoryName ] ];
        
                        if ( index !== undefined ) {
        
                            face.morphTargetInfluences[ index ] = score;
        
                        }
        
                        // There are two blendshape for movement on each axis (up/down , in/out)
                        // Add one and subtract the other to get the final score in -1 to 1 range
                        switch ( categoryName ) {
        
                            case 'eyeLookInLeft':
                                eyeScore.leftHorizontal += score;
                                break;
                            case 'eyeLookOutLeft':
                                eyeScore.leftHorizontal -= score;
                                break;
                            case 'eyeLookInRight':
                                eyeScore.rightHorizontal -= score;
                                break;
                            case 'eyeLookOutRight':
                                eyeScore.rightHorizontal += score;
                                break;
                            case 'eyeLookUpLeft':
                                eyeScore.leftVertical -= score;
                                break;
                            case 'eyeLookDownLeft':
                                eyeScore.leftVertical += score;
                                break;
                            case 'eyeLookUpRight':
                                eyeScore.rightVertical -= score;
                                break;
                            case 'eyeLookDownRight':
                                eyeScore.rightVertical += score;
                                break;
        
                        }
        
                    }
        
                    eyeL.rotation.z = eyeScore.leftHorizontal * eyeRotationLimit;
                    eyeR.rotation.z = eyeScore.rightHorizontal * eyeRotationLimit;
                    eyeL.rotation.x = eyeScore.leftVertical * eyeRotationLimit;
                    eyeR.rotation.x = eyeScore.rightVertical * eyeRotationLimit;
        
                }
        
            }
        
            videomesh.scale.x = video.videoWidth / 100;
            videomesh.scale.y = video.videoHeight / 100;
        
          
        
        }
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};