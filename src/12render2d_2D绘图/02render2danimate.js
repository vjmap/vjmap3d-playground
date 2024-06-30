
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/02render2danimate
        // --2D绘图动画--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            stat: { show : true,  left: "0"},
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let elements = [];
        
        
        let points = [];
        for (let i = 0; i < 10; i++) {
            points.push([Math.random() * 800 + 200, Math.random() * 900 + 100]);
        }
        
        let polyline = new vjmap3d.render2d.Polyline({
            style: {
                lineDash: [10, 10],
                stroke: 'rgba(220, 20, 60, 0.8)',
                lineWidth: 10
            },
            shape: {
                points: points,
                smooth: 0.5
            }
        });
        const circle1 = new vjmap3d.render2d.Circle({
            shape: {
                cx: 600,
                cy: 600,
                r: 200
            }
        });
        const group1 = new vjmap3d.render2d.Group();
        // 裁剪
        group1.setClipPath(circle1);
        group1.add(polyline);
        elements.push(group1);
        
        polyline.animate('style', true)
            .when(1000, {
                lineDashOffset: 20
            })
            .start();
        
        let line = new vjmap3d.render2d.Line({
            style: {
                lineDash: [10, 10],
                lineWidth: 12,
                stroke: 'rgba(255, 0, 255, 0.8)'
            },
            shape: {
                x1: 100,
                y1: 100,
                x2: 500,
                y2: 500
            }
        });
        elements.push(line);
        
        line.animate('style', true)
            .when(1000, {
                lineDashOffset: -20
            })
            .start();
        
        let star = new vjmap3d.render2d.Star({
            style: {
                lineDash: [20, 10],
                stroke: 'red',
                lineWidth: 5,
                fill: null
            },
            shape: {
                n: 5,
                r: 100,
                cx: 300,
                cy: 200
            }
        });
        elements.push(star);
        
        star.animate('style', true)
            .when(1000, {
                lineDashOffset: 30
            })
            .start();
        
        let curve = new vjmap3d.render2d.BezierCurve({
            style: {
                lineDash: [5, 5],
        
                lineDashOffset: 0
            },
            shape: {
                x1: 100, y1: 100,
                x2: 100, y2: 500,
                x3: 500, y3: 100,
                x4: 500, y4: 500
            }
        });
        
        elements.push(curve);
        
        curve.animate('style', true)
            .when(1000, {
                lineDashOffset: -10
            })
            .start();
        
        const isogon = new vjmap3d.render2d.Isogon({
            shape: {
                x: 120,
                y: 120,
                r: 100,
                n: 20
            },
            style: {
                lineWidth: 3,
                fill: 'none',
                stroke: '#0f0'
            }
        });
        const polygons = vjmap3d.render2d.morph.defaultDividePath(isogon, 40);
        for (let i = 0; i < polygons.length; i++) {
            elements.push(polygons[i]);
        }
        
        const circle = new vjmap3d.render2d.Circle({
            shape: {
                cx: 340,
                cy: 120,
                r: 100
            },
            style: {
                lineWidth: 3,
                fill: 'none',
                stroke: '#00f'
            }
        });
        const polygons2 = vjmap3d.render2d.morph.defaultDividePath(circle, 40);
        for (let i = 0; i < polygons2.length; i++) {
            elements.push(polygons2[i]);
        }
        
        
        // 做为2d绘图渲染材质使用
        let renderTexture = vjmap3d.createRender2dTexture({
            autoCanvasSize: false, // 是否根据绘制的内容计算渲染的大小
            sharedCanvas: false, // 是否为了提高效率共享一个canvas
            canvasWidth: 900, // 像素宽，这里是根据底图的像素宽高定的
            canvasHeight: 900, // 像素高，这里是根据底图的像素宽高定的
            elements: elements,
        });
        let geoW = 10, geoH = 10;
        let geom = new THREE.PlaneGeometry(geoW, geoH);
        let mat = new THREE.MeshStandardMaterial({
            map: renderTexture.texture(),
            transparent: true
        })
        let mesh = new THREE.Mesh(geom, mat);
        mesh.rotateX(-Math.PI / 2)
        app.scene.add(mesh);
        
        
        app.signal.onAppRender.add(() => {
            // 更新材质
            let texture = renderTexture.texture();
            mesh.material.map = texture;
            texture.needsUpdate = true;
        })
        
            
        
        function createPathFromString(d, x, y, width) {
            const path = vjmap3d.render2d.path.createFromString(d);
            const pathRect = path.getBoundingRect();
            const height = width / pathRect.width * pathRect.height;
            const m = pathRect.calculateTransform(new vjmap3d.render2d.BoundingRect(x, y, width, height));
            path.applyTransform(m);
            return path;
        }
        
        const shapes = [
            new vjmap3d.render2d.Rect({
                shape: {
                    x: 100,
                    y: 600,
                    width: 100,
                    height: 200
                }
            }),
            new vjmap3d.render2d.Circle({
                shape: {
                    cx: 200,
                    cy: 700,
                    r: 90
                }
            }),
            new vjmap3d.render2d.Isogon({
                shape: {
                    x: 200,
                    y: 700,
                    r: 100,
                    n: 6
                }
            }),
            new vjmap3d.render2d.Sector({
                shape: {
                    cx: 250,
                    cy: 700,
                    r0: 50,
                    r: 100,
                    startAngle: 1,
                    endAngle: 3
                }
            }),
        
            createPathFromString(
                'M910.5,263.6C899.5,229,801.5-57.8,576.9,24.9c-36.9,19.3-65.7,83-52.9,124.4c13,42,85.6,44.7,111.1,16.5c14.7-16.2,34.5-89.9-8.2-82.4c-8.8,17.5,15.6,87.3-36.6,74.5c-38.6-9.4-31-68.7-10.7-89.8c24.9-26,65.6-34.8,102-26.2c31.8,7.5,303.5,164.9,164.3,440c-10,11.1-25.8,17.1-33.4,28.2c-5.6-2.7-11.3-5.1-16.9-7.6l-4.9-12.9L780,415.5l-9.8-25.4c-3.4-5.6-6.5-11.1-9.1-16.5c11.2-6.5,5.2-8.7,1.1-19.4c-1.3-3.3,2.3-6.1-2.5-12c-3.6-4.4-10-5.5-12.5-10.1c-0.2-1.3-0.3-2.5-0.4-3.7c5.7-0.7,11.4-1,16.9-2.4c-7.6-7.5-18.6-11.1-27-17.8c5.9-0.3,11.9,0.5,17.7-1.2c-6.2-4.1-13.6-5.9-19.9-9.9c4.9-3.7,13-1,19.3-3c-8.9-3.8-25.6-8.2-35.6-12.7c2.6-1.3,6.9-2.2,10.5-2.1c-10.5-6-25.6-10.1-37.6-12.9c5.4,0.1,11.3,0.6,16.3-0.7c-9-5.6-21-5.7-31.3-7.8c3-1.9,5.6-3.6,9-4.5c-6.3-6-21.4-3-30-3c2.1-0.4,8-4.3,10.7-7.3c-6.6-0.2-13,2.3-19.7,2.1c2.5-3.4,5.2-7,7-10.6c-6.1-0.9-11.9,1.4-18,0.7c0.5-1,0.9-2.6,1.7-3.9c-5.8-0.1-11.5,2.5-17.5,1.8c0.5-1.4,0.3-3.7,0.7-5.1c-8.5,1.2-16.8,6.4-25.4,5.1c0.2-1.7-0.7-4.5-0.5-5.9c-4.5,1.9-8.3,4.1-11.4,5.7c-3.3-0.4-6.5-0.6-9.7-0.8c-1-1.8-1.7-4.6-2.2-8.8c-4.2,1.9-7.6,5.3-11.1,8.5c-3.3,0-6.6,0.1-9.9,0.3c-0.3-3.1-0.3-6.2-0.3-9.4c-6.3,2.2-10.7,10.2-17.9,9.5c-0.3-5.1-0.1-10.3-0.3-15.3c-6,3.9-11.2,13.6-14.7,20.2c-0.4,0.1-0.8,0.2-1.2,0.3c-1.2-6.9-2.3-14-4.2-20.8c-4,8.3-6.9,18-12,25.7c-0.6,0.2-1.1,0.4-1.7,0.6c-2.5-5.7-3.8-13.2-5.3-19.1c-2.3,8.7-5.7,16.9-9.3,24.9c-3.2,1.5-6.4,3-9.6,4.7c-1.7-5.9-3.3-11.9-5.1-17.8c-6.9,7.2-9.3,19.1-13.3,28.4c-0.5,0.3-1,0.7-1.6,1c-2.9-9.4-4.4-19.6-5.4-29.3c-5.9,11-6.2,26.2-11.8,38.1c-2.3-5.9-3.1-12.6-3.1-18.9c-4.1,9.9-6.4,21.1-9,32.1c-1.2,1.1-2.5,2.2-3.7,3.3c-4.1-5.2-6.4-11.3-9.8-17c-2.2,8.9-1.6,18.5-1.9,27.9c-0.6,0.6-1.2,1.1-1.8,1.7c-3.7-4.3-6.2-9.9-9.7-13.8c-0.1,8.4-0.4,18.1-2.6,26.2c-3.9-3.7-6-10.2-9.4-13.5c-2.9,7.4-0.9,17.6-1.2,25.9c-0.2,0.2-0.3,0.4-0.5,0.5c-3.2-5-6.3-10.5-9.3-15.8c-2.1,7.5-1.5,18.7-0.5,27.8c-0.7,0.8-1.3,1.7-2,2.6c-3-3.1-5.9-6.7-8.8-9.1c-0.3,6.3,0.1,12.8-0.4,19.1c-3.8-7.7-9.1-14.5-15.7-20.9c4.4,9.9,7.7,21.3,9.1,32.4c-4.1,6-8.3,12.1-12.3,18.4l-14.1,77.9c-23-14.8-23.2-33.1-0.6-55.1l-30.9,3l-12.5,4.9l-24.1-2.5c-30.3-4.6-56.6-5.2-79.2-1.9c-25.2,9.3-49.7,10.8-73.6,4.4c35.1,71,25,129.1-30.2,174.2c30-3.4,33.3,5.1,9.8,25.4c39.2-10.2,46.3,0.7,21,32.8c28.8-11.5,52.9-9.1,72.5,7.4c23.9,3.2,46.2,3.4,66.9,0.6l4.9,12.5c5.7,14.7,8.4,29.4,7.9,43.8c14.3,17,24.7,34.3,31.1,52c14.5,55.2,13.4,105.9-3.2,152.2c-60.2,51.7-51.4,64.8,26.6,39.5c21.8-46.3,34.4-89.8,37.7-130.5l19.3-10.4c24.2,53.9,23.6,98.6-1.7,134.2l9.2,31.5c27.5,0.7,50.2-3,68.1-11.2c3.4-23.1,3.5-43.5,0.4-61.1l-1.8-42.7c-12.2-27.3-17.6-54.3-16.1-81c9.7-26.4,20-47.8,30.9-64.2c20-229.4,88.4-149.7,88.4-149.7c25.3,30.2,33.9,65.7,25.9,106.4c121.4,105.1,126,199.2,13.7,282.5l-1.8,18c64.9,6.1,104.5-22.4,118.7-85.4c20.6-45.1,27.4-11.9,20.4,99.6c81.5-8.9,87.4-87.7,18-236.2c5.1-49.6,15.8-87.9,39.4-133c17.4-33.2,27.3-69.7,59.3-92.3C933.8,441.5,928.6,320.8,910.5,263.6z M153.7,510.1c15,9,23.9,22.1,26.6,39.1C160.1,542,151.2,529,153.7,510.1z M224.6,535.5l27.2-27.8C263.5,537.6,254.4,546.9,224.6,535.5z',
                100, 600,
                200
            ),
        
            createPathFromString(
                'M0,6.792 C0,7.192 0.9,8.492 1.9,9.592 C2.9,10.792 4.9,15.892 6.3,20.992 C9.2,31.592 12.4,36.492 17.5,38.192 C21.6,39.592 21.7,39.792 18.8,42.192 L16.5,43.992 L19.5,45.292 C24.6,47.392 37,47.592 41.6,45.692 L45.5,44.092 L43.1,42.092 C41,40.392 40.9,39.892 42.1,39.092 C42.8,38.592 44.2,38.192 45.1,38.192 C47,38.192 52.4,33.492 53.2,31.192 C53.6,29.892 53.9,29.892 55.3,30.992 C57.5,32.892 59.1,31.592 58.4,28.592 C58,26.992 58.3,26.092 59.1,25.792 C59.9,25.592 62.6,24.792 65.2,24.192 C70.7,22.692 75,18.992 75,15.492 C75,13.692 74.1,12.692 71.3,11.592 C68,10.192 67.3,10.192 63.7,11.592 C61.4,12.492 59.5,12.992 59.3,12.792 C59.1,12.692 59.9,11.292 61,9.892 L63.1,7.292 L60.5,5.592 C59,4.592 55.5,3.192 52.7,2.392 C46.3,0.692 21.5,-0.108 14.1,1.292 C8.4,2.292 0,5.592 0,6.792 Z M70,15.592 C70,18.592 65.7,22.192 62.3,22.192 C61,22.192 59,22.692 57.9,23.192 C55.9,24.292 55.5,23.592 56.6,20.792 C56.9,19.892 57.6,19.492 58.1,19.792 C58.6,20.092 60.5,18.692 62.2,16.792 C66,12.392 70,11.892 70,15.592 Z',
                100, 600,
                200
            ),
        
            createPathFromString(
                'M0.385262674,5.94224634 C0.385262674,6.34224634 -0.28516339,17.7539308 4.32901017,31.1532061 C5.32901017,32.3532061 6.09230991,37.8915223 7.49230991,42.9915223 C10.3923099,53.5915223 9.99336758,58.192 9.99336758,58.192 C9.99336758,58.192 9.99336758,59.1351801 9.99336758,62.192 L9.99336758,63.3762725 L14.9773381,65.692 C20.0773381,67.792 34,67.592 38.6,65.692 L44.0054662,63.992 L44.0054662,62.192 C44.0054662,60.3070603 44.0054662,61.2485521 44.0054662,59.5616903 C44.0054662,59.6227531 44.0054662,58.192 44.0054662,58.192 C44.0054662,58.192 44.0054662,56.0357788 44.0054662,56.0368563 C44.0054662,56.1443976 44.1584889,52.1913962 44.1513903,52.2148862 C44.18043,52.2064969 44.4505642,49.3217527 44.4611476,49.3039416 C44.0054662,46.9651447 46.7678097,39.091534 47.5678097,38.791534 C48.3678097,38.591534 52.8,37.6017328 55.4,37.0017328 C62.3288017,36.7364795 68.4691682,30.4573789 68.4691682,26.851942 C68.4691682,25.0527911 68.4691682,20.2992257 66.1171925,17.7539308 C63.4665746,14.8148385 60.3572838,14.0704885 56.6937477,14.2033611 C54.2179046,14.2931572 54.2497766,12.7733674 54.0497766,12.5733674 C53.8497766,12.4733674 54.0497766,12.5733674 54.0497766,10.8407045 L53.3480457,6.66187369 L51.3120843,4.64051206 C49.8120843,3.64051206 47.4776665,2.98869271 44.6776665,2.18869271 C38.2776665,0.488692712 20.1046423,0.0299756608 12.7046423,1.42997566 C7.00464234,2.42997566 0.385262674,4.74224634 0.385262674,5.94224634 Z M64.7915417,22.8695184 C64.7915417,25.8695184 65.5001114,27.9159065 60.6340924,31.7563748 C59.5900982,32.5803392 64.003575,30.2804794 62.903575,30.7804794 C60.903575,31.8804794 53.6,32.676872 52.3920534,31.7563748 C51.5537443,31.1057778 51.0837569,29.8430422 50.9820915,27.9681678 C51.2625331,24.5690682 52.1351692,22.0569251 53.6,20.4317385 C57.4,16.0317385 64.7915417,19.1695184 64.7915417,22.8695184 Z',
                100, 600,
                200
            )
        ];
        shapes.forEach(shape => {
            shape.setStyle({
                fill: 'red',
                opacity: 0.5,
                stroke: 'red'
            });
        });
        
        let currentShapeIdx = 0;
        renderTexture.render.add(shapes[currentShapeIdx]);
        
        function morphShape() {
            let currentShape = shapes[currentShapeIdx];
            // currentShapeIdx = (currentShapeIdx + 1) % shapes.length;
            let newIndex = currentShapeIdx;
            while (newIndex ===  currentShapeIdx) {
                newIndex = Math.round(Math.random() * (shapes.length - 1));
            }
            currentShapeIdx = newIndex;
            let nextShape = shapes[currentShapeIdx];
            renderTexture.render.remove(currentShape);
            renderTexture.render.add(nextShape);
            vjmap3d.render2d.morph.morphPath(currentShape, nextShape, {
                duration: 1000,
                easing: 'cubicInOut',
                done() {
                    setTimeout(morphShape, 100);
                }
            });
        }
        
        morphShape();
            
            
        
        
    }
    catch (e) {
        console.error(e);
    }
};