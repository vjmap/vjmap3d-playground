
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/01shadertoyldycR3
        // --脉冲效果--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/ldycR3
        let shader = `
        vec3 hsb2rgb(in vec3 c)
        {
            vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                                        6.0)-3.0)-1.0,
                                0.0,
                                1.0 );
            rgb = rgb*rgb*(3.0-2.0*rgb);
            return c.z * mix( vec3(1.0), rgb, c.y);
        }
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {   
            vec2 p = (2.0*fragCoord.xy-iResolution.xy)/iResolution.y;
            
            float r = length(p) * 0.9;
            
            vec3 color = hsb2rgb(vec3(0.24, 0.7, 0.4));
            
            float a = pow(r, 2.0);
            float b = sin(r * 0.8 - 1.6);
            float c = sin(r - 0.010);
            float s = sin(a - iTime * 3.0 + b) * c;
            
            color *= abs(1.0 / (s * 10.8)) - 0.01;
            fragColor = vec4(color, 1.);
        }
        `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            brightOpacity: 1,
            hsbOffset: [0.1, 0, 0],
            hsbExpr: `hsb.x += sin(iTime);`,
            // @ts-ignore
            transparent: true,
            sizeAttenuation: false,
            side: THREE.DoubleSide,
            sizeAttScale: 1
        });
        
        let size = 20;
        let position = new THREE.Vector3(0, 0, 0);
        let geom = new THREE.CircleGeometry(size);
        // @ts-ignore
        let mesh = new THREE.Mesh(geom, texture3d);
        mesh.position.copy(position);
        mesh.rotateX(-Math.PI / 2);
        app.scene.add(mesh)
        
            
    }
    catch (e) {
        console.error(e);
    }
};