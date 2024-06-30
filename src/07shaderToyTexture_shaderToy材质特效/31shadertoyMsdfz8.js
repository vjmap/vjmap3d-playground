
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/31shadertoyMsdfz8
        // --天空--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: false } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/Msdfz8
        let shader = `
        // create by JiepengTan 2018-04-18  email: jiepengtan@gmail.com
        
        vec3 lightDir = normalize( vec3(0.5,0.6,0.) );
        const mat2 m2 = mat2( 0.60, -0.80, 0.80, 0.60 );
        
        vec3 Cloud(vec3 bgCol,vec3 ro,vec3 rd,vec3 cloudCol,float spd)
        {
            vec3 col = bgCol;
            float t = iTime * 0.15* spd;
            vec2 sc = ro.xz + rd.xz*((3.)*40000.0-ro.y)/rd.y;
            vec2 p = 0.00002*sc;
            float f = 0.0;
          	float s = 0.5;
          	float sum =0.;
          	for(int i=0;i<5;i++){
            	p += t;t *=1.5;
            	f += s*textureLod( iChannel0, p/256.0, 0.0).x; p = m2*p*2.02;
            	sum+= s;s*=0.6;
          	}
            float val = f/sum; 
            col = mix( col, cloudCol, 0.5*smoothstep(0.5,0.8,val) );
            return col;
        }
        
        vec3 RayMarchCloud(vec3 ro,vec3 rd){
            vec3 col = vec3(0.0,0.0,0.0);  
            float sundot = clamp(dot(rd,lightDir),0.0,1.0);
            
             // sky      
            col = vec3(0.2,0.5,0.85)*1.1 - rd.y*rd.y*0.5;
            col = mix( col, 0.85*vec3(0.7,0.75,0.85), pow( 1.0-max(rd.y,0.0), 4.0 ) );
            // sun
            col += 0.25*vec3(1.0,0.7,0.4)*pow( sundot,5.0 );
            col += 0.25*vec3(1.0,0.8,0.6)*pow( sundot,64.0 );
            col += 0.4*vec3(1.0,0.8,0.6)*pow( sundot,512.0 );
            // clouds
            col = Cloud(col,ro,rd,vec3(1.0,0.95,1.0),1.);
                    // .
            col = mix( col, 0.68*vec3(0.4,0.65,1.0), pow( 1.0-max(rd.y,0.0), 16.0 ) );
            return col;
        }
        
        
        
        #define mouse (iMouse.xy / iResolution.xy)
        vec3 InitCam(in vec2 fragCoord ){
            float time = iTime;
            vec2 uv = fragCoord.xy / iResolution.xy;
          
          	vec2 p = fragCoord.xy/iResolution.xy-0.5;
            vec2 q = fragCoord.xy/iResolution.xy;
        	p.x*=iResolution.x/iResolution.y;
            vec2 mo = iMouse.xy / iResolution.xy-.5;
            mo = (mo==vec2(-.5))?mo=vec2(-0,0.4):mo;
        	mo.x *= iResolution.x/iResolution.y * 3.14159;
        	
        
            mo.x += smoothstep(0.6,1.,0.5+0.5)-1.5;
            vec3 eyedir = normalize(vec3(cos(mo.x),mo.y*2.-0.2+sin(1.57)*0.1,sin(mo.x)));
            vec3 rightdir = normalize(vec3(cos(mo.x+1.5708),0.,sin(mo.x+1.5708)));
            vec3 updir = normalize(cross(rightdir,eyedir));
        	vec3 rd=normalize((p.x*rightdir+p.y*updir)*1.+eyedir);
        	return rd;
        }
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec3 col  = vec3 (0.,0.,0.);
            vec3 ro = vec3 (0.,0.,0.);
        	vec3 rd = InitCam(fragCoord);	
            col = RayMarchCloud( ro, rd);    
            fragColor = vec4(col,1.0);
        }
        `
        let texture3d = new vjmap3d.ShadertoyTexture(app, {
            width: app.containerSize.width ,
            height: app.containerSize.height,
            image: {
                shader: shader,
                iChannel0: new THREE.TextureLoader().load(env.assetsPath + "textures/Msdfz8.png")
            },
           mouseInputPos: [100, 450]
        });
        let screenQuad = new vjmap3d.ScreenQuad(app, {
            map: texture3d.texture,
            depthWrite: false
        });
        app.scene.add(screenQuad.mesh);
    }
    catch (e) {
        console.error(e);
    }
};