
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/124threeWebglshader
        // --shader--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shader
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                isOrthographicCamera: true,
                left: - 1,
                right: 1,
                top: 1,
                bottom: -1,
                near: 0, 
                far: 1 ,
                position: [0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let uniforms;
        
        init();
        
        function init() {
        
            const geometry = new THREE.PlaneGeometry( 2, 2 );
        
            uniforms = {
                time: { value: 1.0 }
            };
        
            const material = new THREE.ShaderMaterial( {
        
                uniforms: uniforms,
                vertexShader: /* glsl */`
                varying vec2 vUv;
        
                    void main()	{
        
                        vUv = uv;
        
                        gl_Position = vec4( position, 1.0 );
        
                    }
                `,
                fragmentShader:  /* glsl */`
                    varying vec2 vUv;
        
                    uniform float time;
        
                    void main()	{
        
                        vec2 p = - 1.0 + 2.0 * vUv;
                        float a = time * 40.0;
                        float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;
        
                        e = 400.0 * ( p.x * 0.5 + 0.5 );
                        f = 400.0 * ( p.y * 0.5 + 0.5 );
                        i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
                        d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
                        r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
                        q = f / r;
                        e = ( r * cos( q ) ) - a / 2.0;
                        f = ( r * sin( q ) ) - a / 2.0;
                        d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
                        h = ( ( f + d ) + a / 2.0 ) * g;
                        i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
                        h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
                        h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
                        i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
                        i = mod( i / 5.6, 256.0 ) / 64.0;
                        if ( i < 0.0 ) i += 4.0;
                        if ( i >= 2.0 ) i = 4.0 - i;
                        d = r / 350.0;
                        d += sin( d * d * 8.0 ) * 0.52;
                        f = ( sin( a * g ) + 1.0 ) / 2.0;
                        gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );
        
        }
                `,
        
            } );
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            app.signal.onAppAfterUpdate.add(() => {
                uniforms[ 'time' ].value = performance.now() / 1000;
            })
        }
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};