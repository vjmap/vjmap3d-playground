
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/06shadertoyMsG3WW
        // --雷达效果--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/MsG3WW
        let shader = `
        #define L length(c - .1*vec2(    // use: L x,y))  
        #define M(v)   max(0., v)
        
        void mainImage( out vec4 O, vec2 C )
        {
            vec2  R = iResolution.xy, 
                  c = (C+C - R) / R.y,
                  k = .1-.1*step(.007,abs(c));
            float x = L 0))*27., // x,y - polar coords
                  y = mod(atan(c.y, c.x) + iDate.w, 6.28),
                  d = M(.75 - y * .4),
                  b = min( min(L -3,-1)), L 6,-4)) ), L 4,5)) )
                	+ .06 - y *.04;
        
            O = vec4(
                // targets
                b<.08 ? b * M(18.-13.*y) : .0,
                (x<24. ? // inside of circle
                	// background
                	.25
                    // grid
                     +  M( cos(x+.8) -.95 ) * 2.4 + k.x + k.y 
                    // detector
                	+ d * d
                    // ray
                	+ M(.8 - y * (x+x+.3) )
                :0.)
                // outer border
                + M(1. - abs(x+x-48.) ),
            .1, 1);
        }
        `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            brightOpacity: 1,
            opacityColor: "#000059",
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