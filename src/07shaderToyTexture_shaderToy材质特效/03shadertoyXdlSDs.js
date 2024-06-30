
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/shaderToyTexture/03shadertoyXdlSDs
        // --圆动画--
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
        // 下面代码来源于 shadertoy示例 https://www.shadertoy.com/view/XdlSDs
        let shader = `
          void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
          vec2 p = (2.0*fragCoord.xy-iResolution.xy)/iResolution.y;
          float tau = 3.1415926535*2.0;
          float a = atan(p.x,p.y);
          float r = length(p)*0.75;
          vec2 uv = vec2(a/tau,r);
          
          //get the color
          float xCol = (uv.x - (iTime / 3.0)) * 3.0;
          xCol = mod(xCol, 3.0);
          vec3 horColour = vec3(0.25, 0.25, 0.25);
          
          if (xCol < 1.0) {
              
              horColour.r += 1.0 - xCol;
              horColour.g += xCol;
          }
          else if (xCol < 2.0) {
              
              xCol -= 1.0;
              horColour.g += 1.0 - xCol;
              horColour.b += xCol;
          }
          else {
              
              xCol -= 2.0;
              horColour.b += 1.0 - xCol;
              horColour.r += xCol;
          }
        
          // draw color beam
          uv = (2.0 * uv) - 1.0;
          float beamWidth = (0.7+0.5*cos(uv.x*10.0*tau*0.15*clamp(floor(5.0 + 10.0*cos(iTime)), 0.0, 10.0))) * abs(1.0 / (30.0 * uv.y));
          vec3 horBeam = vec3(beamWidth);
          fragColor = vec4((( horBeam) * horColour), 1.0);
        }
          `
        let texture3d = new vjmap3d.ShadertoyMaterial(app, {
            shader: shader,
            brightOpacity: 1,
            // hsbOffset: [0.1, 0, 0],
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