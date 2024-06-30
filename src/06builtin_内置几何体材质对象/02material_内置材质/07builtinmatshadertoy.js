
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/07builtinmatshadertoy
        // --Shadertoy材质--
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
        // https://www.shadertoy.com/view/4dlfR7
        let shader = `
        #define NUM_PARTICLES 200.0
        #define GLOW 0.5
        vec3 Orb(vec2 uv, vec3 color, float radius, float offset)
        {        
            vec2 position = vec2(sin(offset * (iTime+30.)),
                                    cos(offset * (iTime+30.)));
            position *= sin((iTime ) - offset) * cos(offset);
            //offset = pModPolar(position,2.);
            radius = radius * offset;
            float dist = radius / distance(uv, position);
            return color * pow(dist, 1.0 / GLOW);
        }
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec2 uv =  vec2(fragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
            vec3 pixel = vec3(0.0, 0.0, 0.0);
                vec3 color = vec3(0.0, 0.0, 0.0);
                color.r = ((sin(((iTime)) * 0.55) + 1.5) * 0.4);
            color.g = ((sin(((iTime)) * 0.34) + 2.0) * 0.4);
            color.b = ((sin(((iTime)) * 0.31) + 4.5) * 0.3);
            float radius = 0.005;
            for	(float i = 0.0; i < NUM_PARTICLES; i++)
                pixel += Orb(uv, color, radius, i / NUM_PARTICLES);
            fragColor = mix(vec4(uv,0.8+0.5*sin(iTime),1.0), vec4(pixel, 1.0), 0.8);
        }`
        let mat = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader
        });
        let geoW = 2,
            geoH = 2;
        let geom = new THREE.BoxGeometry(geoW, geoH, 2);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, 2, 0);
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};