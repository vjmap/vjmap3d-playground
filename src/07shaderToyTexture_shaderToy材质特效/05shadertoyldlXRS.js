
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/05shadertoyldlXRS
        // --扩散效果2--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/ldlXRS
        let shader = `
        // Noise animation - Electric
        // by nimitz (stormoid.com) (twitter: @stormoid)
        // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
        // Contact the author for other licensing options
        
        //The domain is displaced by two fbm calls one for each axis.
        //Turbulent fbm (aka ridged) is used for better effect.
        
        #define time iTime*0.15
        #define tau 6.2831853
        
        
        float circ(vec2 p) 
        {
            float r = length(p);
            r = log(sqrt(r));
            return abs(mod(r*4.,tau)-3.14)*3.+.2;
        
        }
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            //setup system
            vec2 p = fragCoord.xy / iResolution.xy-0.5;
            p.x *= iResolution.x/iResolution.y;
            p*=4.;
            
            float rz = 1.;
            
            //rings
            p /= exp(mod(time*10.,3.14159));
            rz *= pow(abs((0.1-circ(p))),.9);
            
            //final color
            vec3 col = vec3(.2,0.1,0.4)/rz;
            col=pow(abs(col),vec3(.99));
            fragColor = vec4(col,1.);
        }
        `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            brightOpacity: 1,
            hsbOffset: [0.2, 0, 0],
            // hsbExpr: `hsb.x += sin(iTime);`,
            // @ts-ignore
            transparent: true,
            //sizeAttenuation: false,
            side: THREE.DoubleSide,
            //sizeAttScale: 0.5
        });
        
        let size = 5;
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