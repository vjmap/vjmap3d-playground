
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/046threeWebgllightspotlights
        // --lights_spotlights--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_spotlights
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 35,
                near: 0.1, 
                far: 100,
                position: [ 4.6, 2.2, - 2.1 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const matFloor = new THREE.MeshPhongMaterial( { color: 0x808080 } );
        const matBox = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
        
        const geoFloor = new THREE.PlaneGeometry( 100, 100 );
        const geoBox = new THREE.BoxGeometry( 0.3, 0.1, 0.2 );
        
        const mshFloor = new THREE.Mesh( geoFloor, matFloor );
        mshFloor.rotation.x = - Math.PI * 0.5;
        const mshBox = new THREE.Mesh( geoBox, matBox );
        
        const ambient = new THREE.AmbientLight( 0x444444 );
        
        const spotLight1 = createSpotlight( 0xFF7F00 );
        const spotLight2 = createSpotlight( 0x00FF7F );
        const spotLight3 = createSpotlight( 0x7F00FF );
        
        let lightHelper1, lightHelper2, lightHelper3;
        
        function init() {
        
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
            spotLight1.position.set( 1.5, 4, 4.5 );
            spotLight2.position.set( 0, 4, 3.5 );
            spotLight3.position.set( - 1.5, 4, 4.5 );
        
            lightHelper1 = new THREE.SpotLightHelper( spotLight1 );
            lightHelper2 = new THREE.SpotLightHelper( spotLight2 );
            lightHelper3 = new THREE.SpotLightHelper( spotLight3 );
        
            mshFloor.receiveShadow = true;
            mshFloor.position.set( 0, - 0.05, 0 );
        
            mshBox.castShadow = true;
            mshBox.receiveShadow = true;
            mshBox.position.set( 0, 0.5, 0 );
        
            scene.add( mshFloor );
            scene.add( mshBox );
            scene.add( ambient );
            scene.add( spotLight1, spotLight2, spotLight3 );
            scene.add( lightHelper1, lightHelper2, lightHelper3 );
        
            app.on("onAppUpdate", animate)
        
        }
        
        function createSpotlight( color ) {
        
            const newObj = new THREE.SpotLight( color, 10 );
        
            newObj.castShadow = true;
            newObj.angle = 0.3;
            newObj.penumbra = 0.2;
            newObj.decay = 2;
            newObj.distance = 50;
        
            return newObj;
        
        }
        
        function tween( light ) {
        
            new TWEEN.Tween( light ).to( {
                angle: ( Math.random() * 0.7 ) + 0.1,
                penumbra: Math.random() + 1
            }, Math.random() * 3000 + 2000 )
                .easing( TWEEN.Easing.Quadratic.Out ).start();
        
            new TWEEN.Tween( light.position ).to( {
                x: ( Math.random() * 3 ) - 1.5,
                y: ( Math.random() * 1 ) + 1.5,
                z: ( Math.random() * 3 ) - 1.5
            }, Math.random() * 3000 + 2000 )
                .easing( TWEEN.Easing.Quadratic.Out ).start();
        
        }
        
        function updateTweens() {
        
            tween( spotLight1 );
            tween( spotLight2 );
            tween( spotLight3 );
        
            setTimeout( updateTweens, 5000 );
        
        }
        
        function animate() {
        
            TWEEN.update();
        
            if ( lightHelper1 ) lightHelper1.update();
            if ( lightHelper2 ) lightHelper2.update();
            if ( lightHelper3 ) lightHelper3.update();
        
           
        }
        
        init();
        updateTweens();
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};