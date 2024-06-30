
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/044threeWebgllightspointlights
        // --lights_pointlights--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_pointlights
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 0.1, 
                far: 1000,
                position: [ 0,0, 100 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let light1, light2, light3, light4,
            object;
        
        
        init();
        
        function init() {
        
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            //model
            vjmap3d.ResManager.loadRes(assetsPath + 'models/obj/walt/WaltHead.obj', false).then(( obj ) => {
        
                object = obj;
                object.scale.multiplyScalar( 0.8 );
                object.position.y = - 30;
                scene.add( object );
        
            } );
        
            const sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
        
            //lights
        
            light1 = new THREE.PointLight( 0xff0040, 400 );
            light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
            scene.add( light1 );
        
            light2 = new THREE.PointLight( 0x0040ff, 400 );
            light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
            scene.add( light2 );
        
            light3 = new THREE.PointLight( 0x80ff80, 400 );
            light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
            scene.add( light3 );
        
            light4 = new THREE.PointLight( 0xffaa00, 400 );
            light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
            scene.add( light4 );
        
            app.on("onAppUpdate", e => render(e))
        }
        
        
        function render(e) {
        
            const time = Date.now() * 0.0005;
            const delta = e.deltaTime;
        
            if ( object ) object.rotation.y -= 0.5 * delta;
        
            light1.position.x = Math.sin( time * 0.7 ) * 30;
            light1.position.y = Math.cos( time * 0.5 ) * 40;
            light1.position.z = Math.cos( time * 0.3 ) * 30;
        
            light2.position.x = Math.cos( time * 0.3 ) * 30;
            light2.position.y = Math.sin( time * 0.5 ) * 40;
            light2.position.z = Math.sin( time * 0.7 ) * 30;
        
            light3.position.x = Math.sin( time * 0.7 ) * 30;
            light3.position.y = Math.cos( time * 0.3 ) * 40;
            light3.position.z = Math.sin( time * 0.5 ) * 30;
        
            light4.position.x = Math.sin( time * 0.3 ) * 30;
            light4.position.y = Math.cos( time * 0.7 ) * 40;
            light4.position.z = Math.sin( time * 0.5 ) * 30;
        
          
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};