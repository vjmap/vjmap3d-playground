
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
        // --Vue创建Marker2D标记--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        
        // 加载vue3库，实际工程项目中请通过import引入vue，这里是为了示例测试需要
        if (typeof Vue !== "object" || Vue.version.substring(0, 1) != "3")  {
            // 如果没有环境
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
              <button @click="rotation10">旋转10度</button><br/>
              <button @click="rotation_10">旋转-10度</button>
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