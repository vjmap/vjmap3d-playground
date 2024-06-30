
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/32shadertoyXll3R2
        // --闪电--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/Xll3R2
        let shader = `
        float hash(float x)
        {
        	return fract(21654.6512 * sin(385.51 * x));
        }
        
        float hash(vec2 p)
        {
        	return fract(1654.65157 * sin(15.5134763 * p.x + 45.5173247 * p.y+ 5.21789));
        }
        
        vec2 hash2(vec2 p)
        {
        	return vec2(hash(p*.754),hash(1.5743*p+4.5476351));
        }
        vec2 add = vec2(1.0, 0.0);
        
        vec2 noise2(vec2 x)
        {
            vec2 p = floor(x);
            vec2 f = fract(x);
            f = f*f*(3.0-2.0*f);
            
            vec2 res = mix(mix( hash2(p),          hash2(p + add.xy),f.x),
                            mix( hash2(p + add.yx), hash2(p + add.xx),f.x),f.y);
            return res;
        }
        
        vec2 fbm2(vec2 x)
        {
            vec2 r = vec2(0.0);
            float a = 1.0;
            
            for (int i = 0; i < 8; i++)
            {
                r += noise2(x) * a;
                x *= 2.;
                a *= .5;
            }
             
            return r;
        }
        
        
        float dseg( vec2 ba, vec2 pa )
        {
        	
        	float h = clamp( dot(pa,ba)/dot(ba,ba), -0.2, 1. );	
        	return length( pa - ba*h );
        }
        
        
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
        	
        	
        	vec2 p = 2.*fragCoord.xy/iResolution.yy-1.;
            vec2 d;
            vec2 tgt = vec2(1., -1.);
            float c=0.;
            if(p.y>=0.)
                c= (1.-(fbm2((p+.2)*p.y+.1*iTime)).x)*p.y;
        	else 
                c = (1.-(fbm2(p+.2+.1*iTime)).x)*p.y*p.y;
        	vec3 col=vec3(0.),col1 = c*vec3(.3,.5,1.);
            float mdist = 100000.;
            
            float t = hash(floor(5.*iTime));
            tgt+=4.*hash2(tgt+t)-1.5;
            if(hash(t+2.3)>.6)
        	for (int i=0; i<100; i++) {
        		
        		vec2 dtgt = tgt-p;		
        		d = .05*(vec2(-.5, -1.)+hash2(vec2(float(i), t)));
                float dist =dseg(d,dtgt);
        		mdist = min(mdist,dist);
        		tgt -= d;
        		c=exp(-.5*dist)+exp(-55.*mdist);
                col=c*vec3(.7,.8,1.);
        	}
            col+=col1;
        	fragColor = vec4(col, 1.0);
        }
        `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            mouseInputPos: [500, 500],
            // @ts-ignore
            side: THREE.DoubleSide,
            brightOpacity: 1,
            transparent: true,
            depthWrite: false
        });
        let screenQuad = new vjmap3d.ScreenQuad(app, {
            material: texture3d
        });
        app.scene.add(screenQuad.mesh);
    }
    catch (e) {
        console.error(e);
    }
};