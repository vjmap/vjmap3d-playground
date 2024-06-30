
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/08shadertoyMdlXz8
        // --水纹效果--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/MdlXz8
        let shader = `
        // Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
        // :)
        // by David Hoskins.
        // Original water turbulence effect by joltz0r
        
        
        // Redefine below to see the tiling...
        //#define SHOW_TILING
        
        #define TAU 6.28318530718
        #define MAX_ITER 5
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord ) 
        {
        	float time = iTime * .5+23.0;
            // uv should be the 0-1 uv of texture...
        	vec2 uv = fragCoord.xy / iResolution.xy;
            
        #ifdef SHOW_TILING
        	vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
        #else
            vec2 p = mod(uv*TAU, TAU)-250.0;
        #endif
        	vec2 i = vec2(p);
        	float c = 1.0;
        	float inten = .005;
        
        	for (int n = 0; n < MAX_ITER; n++) 
        	{
        		float t = time * (1.0 - (3.5 / float(n+1)));
        		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
        	}
        	c /= float(MAX_ITER);
        	c = 1.17-pow(c, 1.4);
        	vec3 colour = vec3(pow(abs(c), 8.0));
            colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);
        
        	#ifdef SHOW_TILING
        	// Flash tile borders...
        	vec2 pixel = 2.0 / iResolution.xy;
        	uv *= 2.0;
        	float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
        	vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
        	uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
        	colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
        	#endif
            
        	fragColor = vec4(colour, 1.0);
        }
        `
        let texture3d = new vjmap3d.ShadertoyTexture(app, {
            width: 800,
            height: 800,
            shader: shader,
            //brightOpacity: 1,
            //hsbOffset: [0.1, 0, 0],
        });
        let size = 10;
        let mat = new THREE.MeshStandardMaterial({
            map: texture3d.texture,
            transparent: true,
            side: THREE.DoubleSide,
            opacity: 0.8
        });
        let geom = new THREE.PlaneGeometry(size, size);
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, 0, 0);
        mesh.rotateX(-Math.PI / 2);
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};