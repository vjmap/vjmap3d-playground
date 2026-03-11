
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker2d/05uimarker2dvue
        // -- Vue Marker2D --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})

// Load Vue 3; in production use import
if (typeof Vue !== "object" || Vue.version.substring(0, 1) != "3")  {
    // If no env
    await vjmap.addScript([{
        src: "https://vjmap.com/demo/js/vue@3.js"
    }])
}
const VueMarker = {
    data() {
        return {
            rotation: 0
        }
    },
    props: ['app'],
    methods: {
        rotation10() {
           this.rotation += 10.0
           this.app.cameraControl.rotate( 10 * THREE.MathUtils.DEG2RAD, 0, true );
        },
        rotation_10() {
            this.rotation -= 10.0
            this.app.cameraControl.rotate( -10 * THREE.MathUtils.DEG2RAD, 0, true );
        }
    },
    mounted() {
     
    },
    unmounted() {
     
    },
    template : `
      <h4>rotation:{{rotation}}</h4>
      <button @click="rotation10">Rotate +10°</button><br/>
      <button @click="rotation_10">Rotate -10°</button>
    `
}

let el = document.createElement('div');
el.style.background = "#0ff"
Vue.createApp(VueMarker, { app }).mount(el)

let marker2d = new vjmap3d.Marker2D({
    element: el,
    anchor: 'bottom'
});
marker2d.setPosition([2, 0, 1]);
marker2d.addTo(app);
    }
    catch (e) {
        console.error(e);
    }
};