
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/07shadertoyXsyfRy
        // --实时时针效果--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/XsyfRy
        let shader = `
        // Golfing of "Electronic clock" by Uiharu. https://shadertoy.com/view/ldVBDD
        // 2018-06-14 17:12:11
        // Thanks to Fabrice (as usual :-p) for golfing tips
        
        
        // Draw a line at distance .3 from point p
        #define D(p) min(.02-.02 / abs(length(p-r)-.3), 0.)
        
        // Draw a segment of length 2 from p with direction v
        #define S(p) !=n ? l += D(p + v*clamp(dot(r-p,v),0.,2.)) : l,
        
        void mainImage( out vec4 o, vec2 u )
        {
            vec2 r = iResolution.xy,
                     v;
            u = (u+u-r)/r.x*14.;
            
            r = abs(u);
            
            float d=iDate.w,
                  T=1.,
                  i=-T,
                  l = int(d)%2<1 ? D(vec2(4.5,1)) : 0.,
                  t=6.;
            
            // Loop over the 6 digits of the clock, starting with seconds
            for(o = vec4(-2,-1,0,1); i++< 5.;)
            {
                v = o.wz; // (1,0)
                
                // Position for digits
                r = (u + v*(4.5*i - mod(i,2.) - 10.75))
                    *mat2(cos(.1*sin(.05/mod(d,T)) + vec4(0,11,33,0)));
                
                //r = (u + v*(4.5*i - mod(i,2.) - 10.75))
                //    * mat2(cos(.1*sin(.05*pow(2.,i)/mod(d,T)) + vec4(0,11,33,0)));
                
                // t : modulo for each digit (10 for units, 6 for decades)
                int n = int(d/T)%int(t = 16. - t);
                
                // Draw a digit of size (2,4) centered on (0,0)
                // draw horizontal segments (with v=(1,0))
                
                if(n!=1)
                    4 S(-o.wx)               // top (!1,!4)
                    n!=7 && 4 S(o.yx)        // bottom (!1,!4,!7)
                    n!=7 && 0 S(-v) l;       // center (!0,!1,!7)
        		
                
                // draw vertical segments (with v=(0,1))
                v = v.yx; // (0,1)
                n%2<1 && 4 S(o.yx)           // bottom left (0,2,6,8)
                
                2 S(o.wx)                    // bottom right (!2)
                (n<1 || n>3) && 7 S(o.yz)    // top left (!1,!2,!3,!7)
                
                n=++n/2; // n = (n+1)/2
                3 S(o.wz)                    // top right (!5,!6)
                
                T*=t;
            }
            //o = vec4(.4,.2,1,1) * -5. * l;
            o.z-=5.;
            o*=l;
        }
        `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            brightOpacity: 1,
            opacityColor: 0,
            hsbOffset: [0, 0.8, 0],
            // hsbExpr: `hsb.x += sin(iTime);`,
            // @ts-ignore
            transparent: true,
            //sizeAttenuation: false,
            side: THREE.DoubleSide,
            //sizeAttScale: 0.5
        });
        let size = 20;
        let position = new THREE.Vector3(0, 0, 0);
        let geom = new THREE.PlaneGeometry(size, size);
        // @ts-ignore
        let mesh = new THREE.Mesh(geom, texture3d);
        mesh.position.copy(position);
        mesh.rotateX(-Math.PI / 4);
        app.scene.add(mesh)
            
    }
    catch (e) {
        console.error(e);
    }
};