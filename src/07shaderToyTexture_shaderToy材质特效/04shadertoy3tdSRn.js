
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/04shadertoy3tdSRn
        // --扩散效果1--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/3tdSRn
        let shader = `
        vec3 drawCircle(vec2 pos, float radius, float width, float power, vec4 color)
        {
            vec2 mousePos = iMouse.xy - vec2(0.5);
            float dist1 = length(pos);
            dist1 = fract((dist1 * 5.0) - fract(iTime));
            float dist2 = dist1 - radius;
            float intensity = pow(radius / abs(dist2), width); 
            vec3 col = color.rgb * intensity * power * max((0.8- abs(dist2)), 0.0);
            return col;
        }
        
        vec3 hsv2rgb(float h, float s, float v)
        {
            vec4 t = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
            vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
            return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
        }
        
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            // // -1.0 ~ 1.0
            vec2 pos = (fragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
            
            float h = mix(0.5, 0.65, length(pos));
            vec4 color = vec4(hsv2rgb(h, 1.0, 1.0), 1.0);
            float radius = 0.5;
            float width = 0.8;
            float power = 0.1;
            vec3 finalColor = drawCircle(pos, radius, width, power, color);
        
            pos = abs(pos);
            // vec3 finalColor = vec3(pos.x, 0.0, pos.y);
        
            fragColor = vec4(finalColor, 1.0);
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
        //  再创建一个半球扩散动画
        {
            let mat = new vjmap3d.ShadertoyMaterial(app, {
                color: "#00ffff",
                // map: texture,
                colorOpacity: 0.5,
                shader: shader,
                brightOpacity: 1,
                hsbOffset: [0.2, 0, 0],
                //hsbExpr: `hsb.x += sin(iTime);`,
                // @ts-ignore
                transparent: true,
                //sizeAttenuation: false,
                side: THREE.DoubleSide
                //sizeAttScale: 0.5
            });
           
            let size = 2;
            // 创建半球几何体
            let radius = size;
            let widthSegments = 32;
            let heightSegments = 16;
            let phiStart = 0;
            let phiLength = Math.PI; // 使用 Math.PI 表示半球
            let geom = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength);
            // @ts-ignore
            let sphere = new THREE.Mesh(geom, mat);
            sphere.position.set(-10, 0, 0);
            sphere.rotateX(-Math.PI / 2);
            app.scene.add(sphere)
        }
        
    }
    catch (e) {
        console.error(e);
    }
};