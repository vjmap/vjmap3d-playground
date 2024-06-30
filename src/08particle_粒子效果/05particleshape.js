
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/05particleshape
        // --粒子发射形状--
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
        let texture = await vjmap3d.ResManager.loadTextureSync(env.assetsPath + "textures/particle.png");
        
        const initParticleSystem = () => {
            return new vjmap3d.ParticleSystem({
                duration: 5,
                looping: true,
                startLife: new vjmap3d.IntervalValue(1.0, 1.0),
                startSpeed: new vjmap3d.IntervalValue(1, 1),
                startSize: new vjmap3d.IntervalValue(0.1, 0.1),
                startColor: new vjmap3d.RandomColor(new THREE.Vector4(1, 0.91, 0.51, 1), new THREE.Vector4(1, 0.44, 0.16, 1)),
                worldSpace: true,
                // @ts-ignore
                maxParticle: 1000,
                emissionOverTime: new vjmap3d.ConstantValue(1000),
                emissionBursts: [
                    /*{
                        time: 0,
                        count: new ConstantValue(100),
                        cycle: 1,
                        interval: 0.01,
                        probability: 1,
                    },*/
                ],
        
                shape: new vjmap3d.PointEmitter(),
                material: new THREE.MeshBasicMaterial({
                    map: texture,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide,
                }),
                startTileIndex: new vjmap3d.ConstantValue(0),
                uTileCount: 10,
                vTileCount: 10,
                renderMode: vjmap3d.RenderMode.BillBoard,
                renderOrder: 1,
            });
        }
        
        let particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.PointEmitter();
        particles.emitter.name = 'point';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(-5, -5, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.SphereEmitter({
            radius: 1,
            thickness: 0.2,
            arc: Math.PI * 2,
        });
        particles.emitter.name = 'Sphere';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(-5, 0, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.HemisphereEmitter({
            radius: 1,
            thickness: 0.2,
            arc: Math.PI * 2,
        });
        particles.emitter.name = 'Hemisphere';
        particles.emitter.rotation.x = -Math.PI / 2;
        particles.emitter.position.set(-5, 5, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.ConeEmitter({
            radius: 1,
            thickness: 1,
            arc: Math.PI * 2,
            angle: Math.PI / 4,
        });
        particles.emitter.name = 'Cone';
        particles.emitter.position.set(0, -5, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.CircleEmitter({
            radius: 1,
            thickness: 0.2,
            arc: Math.PI * 2,
        });
        particles.emitter.name = 'Circle';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(0, 0, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.DonutEmitter({
            radius: 2,
            thickness: 1,
            arc: Math.PI * 2,
            donutRadius: 0.2,
        });
        particles.emitter.name = 'Donut';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(0, 5, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.ConeEmitter({
            radius: 1,
            thickness: 0.2,
            arc: Math.PI * 2,
            angle: 0,
            mode: vjmap3d.EmitterMode.Loop,
            spread: 0,
            speed: new vjmap3d.ConstantValue(3),
        });
        particles.emitter.name = 'Loop';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(5, -5, 2);
        app.particleRenderer.addSystem(particles);
        app.scene.add(particles.emitter);
        
        particles = initParticleSystem();
        particles.emitterShape = new vjmap3d.GridEmitter({
            width: 2,
            height: 2,
            rows: 10,
            columns: 10,
        });
        particles.emitter.name = 'Grid';
        //particles.emitter.rotation.y = Math.PI / 2;
        particles.emitter.position.set(5, 0, 2);
        app.particleRenderer.addSystem(particles);
        
            
            
        
    }
    catch (e) {
        console.error(e);
    }
};