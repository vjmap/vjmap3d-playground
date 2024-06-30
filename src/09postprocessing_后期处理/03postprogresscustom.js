
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/postprocessing/03postprogresscustom
        // --自定义后期处理效果--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
                defaultLights: false,
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        app.scene.add(new THREE.AmbientLight(new THREE.Color('hsl(0, 0%, 100%)'), 0.5));
        let data = [];
        let color = new THREE.Color();
        let startColor = new THREE.Color("#ff0000")
        let endColor = new THREE.Color("#ffff00")
        let heightArr = []
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                let shape = new THREE.Shape();
                let radius = Math.random() * 2 + 0.5
                shape.ellipse(i * 5 - 50, j * 5 - 50, radius, radius, 0, Math.PI * 2, false, 0);
                let points = shape.getPoints()
                let height = 20 * Math.random()  + 5;
                color = color.lerpColors(startColor, endColor, height / 20);
                heightArr.push(height)
                data.push({
                    color: "#ff0000",
                    color2: color.clone(),
                    borderColor:  "#ffff00",
                    coordinates: points.map(p => [p.x, p.y]),
                    extrude: {
                        depth: height
                    }
                })
            }
        }
        let fillExtrusion = new vjmap3d.FillExtrusionsEntity({
            data: data,
            borderStyle: {
                linewidth: 2
            },
        })
        fillExtrusion.addTo(app);
        let val = { v: 0}
        let tm = new Date();
        new vjmap3d.Tween(val).to(3000, { v: 1 }, { easing: 'easeInSine',
            onProgress: (targe, key, start, end, alpha, reversed) => {
                let curTm = new Date();
                tm = curTm;
                let depthData = []
                for(let n = 0; n < data.length; n++) {
                    let depth = THREE.MathUtils.lerp(0, 1, alpha) * heightArr[n]  + 0.1
                    depthData.push({
                        index: n,
                        depth: depth,
                        color2: color.lerpColors(startColor, endColor, depth / 20  + 5)
                    })
                }
                fillExtrusion.setDepths(depthData);
            }
        }).yoyoForever().start();
        app.cameraControl.loadState({
            cameraTarget: new THREE.Vector3(0.390014119563027,1.1852643743923352e-18, 9.854902063178976),
            cameraPosition: new THREE.Vector3(0.4061914276850882,57.326314956526076, 82.76816394954821)
        })
        // 增加后期处理
        let frag = /* glsl */`
            varying vec3 vPosition;
            uniform float iTime;
            uniform float iSpeed;
            uniform float iBrightness;
            uniform float iLineWidth;
            vec3 rgb2hsv(vec3 c)
            {
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }
            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
                float x = vPosition.x;
                float lighty = -x + iSpeed * sin(iTime);
                float alpha = abs(vPosition.y - lighty);
                if(alpha < iLineWidth / 10.){
                    float a = 1.0 -  alpha / 0.1;
                    float enda = smoothstep(0.0,1.0,a);
                    vec3 hsv = rgb2hsv(inputColor.xyz);
                    hsv.z += enda * iBrightness / 5.;
                    hsv.z = clamp(hsv.z, 0., 1.);
                    outputColor.xyz = hsv2rgb(hsv);
                    outputColor.a = inputColor.z;
                }else{
                    outputColor = inputColor;
                }
            }
        `
        // 效果参考 https://www.cnblogs.com/eco-just/p/11667713.html
        let effect = new vjmap3d.Effect("ScenLine", frag,  {
            // @ts-ignore
            uniforms: new Map([
                ["iTime", app.commonUniforms.iTime],
                ["iSpeed", new THREE.Uniform(1.5)],
                ["iBrightness", new THREE.Uniform(1.5)],
                ["iLineWidth", new THREE.Uniform(1.0)]
            ])
        });
        const pass = new vjmap3d.EffectPass(app.camera, effect);
        app.addEffectRenderPass(pass, 700);
        
    }
    catch (e) {
        console.error(e);
    }
};