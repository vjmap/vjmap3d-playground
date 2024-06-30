
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/03render2dtext
        // --2D绘图文本--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        let elements = [];
        
        var width = 1200;
        var height = 1500;
        var unit = 100;
        let rectbk = new vjmap3d.render2d.Rect({
            shape: {
                x: 0,
                y: 0,
                width: width,
                height: height
            },
            style: {
                fill: "#ffffff"
            }
        });
        
        elements.push(rectbk);
        
        for (var i = 0; i < 100 && i * unit < width; i++) {
            elements.push(new vjmap3d.render2d.Line({
                shape: {
                    x1: i * unit,
                    y1: 0,
                    x2: i * unit,
                    y2: height
                },
                style: {
                    fill: null,
                    stroke: '#ddd'
                },
                silent: true
            }));
        }
        
        for (var i = 0; i < 100 && i * unit < height; i++) {
            elements.push(new vjmap3d.render2d.Line({
                shape: {
                    x1: 0,
                    y1: i * unit,
                    x2: width,
                    y2: i * unit
                },
                style: {
                    fill: null,
                    stroke: '#ddd'
                },
                silent: true
            }));
        }
        
        elements.push(new vjmap3d.render2d.Text({
            style: {
                x: 0,
                y: 0,
                text: '国国国国\n国国国国国\n国国国国国国',
                width: 50,
                height: 50,
                fill: '#c0f',
                font: '18px Microsoft Yahei'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 100,
            y: 100,
            style: {
                x: 0,
                y: 0,
                text: 'position\n[100, 100]\nlineWidth: 10',
                width: 50,
                height: 50,
                fill: 'green',
                stroke: 'red',
                lineWidth: 10,
                font: '18px Microsoft Yahei'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 200,
            y: 100,
            rotation: 2,
            scaleX: 0.5,
            scaleY: 0.5,
            style: {
                x: 0,
                y: 0,
                text: 'position\n[200, 100],\nrotation: 2\nscale: 0.5',
                width: 50,
                height: 50,
                fill: '#c0f',
                font: '18px Microsoft Yahei'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 100,
            y: 200,
            rotation: -1,
            originX: 0,
            originY: 50,
            scaleX: .5,
            scaleY: .5,
            style: {
                x: 0,
                y: 0,
                text: 'position\n[100, 200],\nrotation: -1\nscale: 0.5\nalign: middle\nverticalAlign: bottom\norigin:[0, 50]',
                width: 50,
                height: 50,
                fill: '#c0f',
                font: '18px Microsoft Yahei',
                align: 'middle',
                verticalAlign: 'bottom'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Rect({
            x: 300,
            y: 100,
            shape: {
                x: 0, y: 0, width: 200, height: 16
            },
            style: {
                fill: '#333'
            }
        }));
        elements.push(new vjmap3d.render2d.Text({
            x: 300,
            y: 100,
            style: {
                x: 0,
                y: 0,
                text: '微软雅黑 no offset gg',
                fill: '#fff',
                font: '16px Microsoft Yahei'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 400,
            y: 50,
            style: {
                x: 0,
                y: 0,
                text: 'position: [400, 50]\nalign: right\nverticalAlign: middle',
                fill: '#456',
                align: 'right',
                verticalAlign: 'middle'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 500,
            y: 50,
            style: {
                x: 0,
                y: 0,
                text: 'position: [500, 50]\nalign: center\nverticalAlign: bottom',
                fill: '#456',
                align: 'center',
                verticalAlign: 'bottom'
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 600,
            y: 0,
            style: {
                x: 0,
                y: 0,
                text: '阴影阴影\nshadow',
                fill: '#456',
                font: '18px Arial',
                textShadowBlur: 3,
                textShadowColor: '#893e95',
                textShadowOffsetX: 5,
                textShadowOffsetY: 10
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 700,
            y: 0,
            style: {
                x: 0,
                y: 0,
                text: '有文字背景没有框背景和 padding: 10 \nshadow',
                fill: '#ffe',
                font: '18px Arial',
                padding: 10,
                backgroundColor: 'rgba(124, 0, 123, 0.4)',
                textShadowBlur: 3,
                textShadowColor: '#893e95',
                textShadowOffsetX: 5,
                textShadowOffsetY: 10
            }
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            x: 600,
            y: 100,
            rotation: -Math.PI / 16,
            style: {
                x: 0,
                y: 0,
                text: [
                    '有文字背景也有框背景',
                    'borderWidth: 2 和 borderRadius: 5',
                    'padding: [10, 20, 30, 40]',
                    'rotation: -Math.PI / 16'
                ].join('\n'),
                fill: '#ffe',
                font: '18px Arial',
                padding: [10, 20, 30, 40],
                backgroundColor: 'rgba(124, 0, 123, 0.4)',
                borderColor: '#112233',
                borderWidth: 2,
                borderRadius: 5,
                textShadowBlur: 2,
                textShadowColor: '#893e95',
                textShadowOffsetX: 2,
                textShadowOffsetY: 4,
                boxShadowBlur: 5,
                boxShadowColor: '#1099ee',
                boxShadowOffsetX: 5,
                boxShadowOffsetY: 10
            }
        }));
        
        
        elements.push(new vjmap3d.render2d.Text({
            x: 100,
            y: 300,
            style: {
                // Empty text but has background
                text: '',
                x: 0,
                y: 0,
                padding: [10, 20, 30, 40],
                backgroundColor: 'rgba(124, 0, 123, 0.4)'
            }
        }));
        
        
        elements.push(new vjmap3d.render2d.Text({
            style: {
                x: 200,
                y: 300,
                text: [
                    'x: 200, y: 300{j|这行指定了 lineHeight 100px (vertical top)}所以比较宽裕{k|vertical bottom}',
                    '{l|padding: [10, 20]}{m|padding: [10, 20, 30, 40], vertical: top}{o|width100}{n|width100}',
                    '默认样式red 18px',
                    '{a|富文本，样式a没定义}',
                    '{b|默认字体大小但有阴影}默认样式18px{c|绿色 30px}{b|这句非常非常长最长。阴影样式。中间有\n换行}',
                    '{c|align: left}紧跟左{e|这两块}{f|在剩余区域居中}{d|align: right}',
                    '这是指定宽默认取lineHeight的图片{p|} 这是指定高宽的图片{q|}{r|}',
                    '这个自动获取长宽比的图片{s|}只高度指定',
                    '{g|verticalAlign: top}{h|最大文字}{i|verticalAlign: bottom}'
                ].join('\n'),
                fill: 'red',
                font: '18px Arial',
                rich: {
                    b: {
                        textShadowBlur: 3,
                        textShadowColor: '#555',
                        textShadowOffsetX: 2,
                        textShadowOffsetY: 2
                    },
                    c: {
                        font: '30px Microsoft YaHei',
                        fill: 'green'
                    },
                    d: {
                        font: '22px Arial',
                        fill: '#871299',
                        align: 'right'
                    },
                    e: {
                        font: '22px Arial',
                        fill: '#367199',
                        align: 'center'
                    },
                    f: {
                        font: '12px Arial',
                        fill: '#941122',
                        backgroundColor: '#eee',
                        padding: [0,0,0,20],
                        width: 180,
                        align: 'center'
                    },
                    g: {
                        font: '12px Arial',
                        verticalAlign: 'top'
                    },
                    h: {
                        font: '34px Arial'
                    },
                    i: {
                        font: '18px Arial',
                        verticalAlign: 'bottom'
                    },
                    j: {
                        font: '23px Arial',
                        fill: '#922889',
                        verticalAlign: 'top',
                        lineHeight: 100
                    },
                    k: {
                        font: '14px Arial',
                        fill: '#126354',
                        verticalAlign: 'bottom'
                    },
                    l: {
                        font: '18px Arial',
                        fill: '#331199',
                        borderColor: '#11aa11',
                        borderWidth: 2,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        padding: [10, 20]
                    },
                    m: {
                        font: '9px Arial',
                        fill: '#aabbcc',
                        backgroundColor: '#224433',
                        borderRadius: 8,
                        padding: [10, 20, 30, 40],
                        verticalAlign: 'top'
                    },
                    n: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        backgroundColor: '#6712ab',
                        width: 100
                    },
                    o: {
                        align: 'center',
                        width: 100,
                        backgroundColor: '#99aa44'
                    },
                    p: {
                        backgroundColor: {
                            image: './data/hill-Qomolangma.png'
                        },
                        width: 100
                    },
                    q: {
                        backgroundColor: {
                            image: './data/hill-Kilimanjaro.png'
                        },
                        width: 30,
                        height: 90
                    },
                    r: {
                        backgroundColor: {
                            image: './data/hill-Kilimanjaro.png'
                        },
                        width: 30,
                        height: 12,
                        verticalAlign: 'bottom'
                    },
                    s: {
                        backgroundColor: {
                            image: './data/hill-Qomolangma.png'
                        }
                    }
                }
            },
            
        }));
        
        elements.push(new vjmap3d.render2d.Text({
            rotation: -0.1,
            x: 500,
            y: 900,
            style: {
                text: [
                    'position: [500, 900]{j|rotation: -0.1}',
                    '{l|且有 padding: [20, 30, 40, 50]}{m|padding, vertical: top}{o|width100}{n|width100}',
                    '整体的 textAlign center, verticalAlign middle'
                ].join('\n'),
                fill: 'red',
                font: '18px Arial',
                borderRadius: 10,
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                borderColor: '#191933',
                borderWidth: 4,
                padding: [20, 30, 40, 50],
                verticalAlign: 'middle',
                align: 'center',
                rich: {
                    j: {
                        font: '23px Arial',
                        fill: '#922889',
                        verticalAlign: 'top',
                        lineHeight: 100
                    },
                    l: {
                        font: '18px Arial',
                        fill: '#331199',
                        borderColor: '#11aa11',
                        borderWidth: 2,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        padding: [10, 20]
                    },
                    m: {
                        font: '9px Arial',
                        fill: '#aabbcc',
                        backgroundColor: '#224433',
                        borderRadius: 8,
                        padding: [10, 20, 30, 40],
                        verticalAlign: 'top'
                    },
                    n: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        backgroundColor: '#6712ab',
                        width: 100
                    },
                    o: {
                        align: 'center',
                        width: 100,
                        backgroundColor: '#99aa44'
                    }
                }
            },
            
        }));
        
        
        elements.push(new vjmap3d.render2d.Text({
            rotation: -0.1,
            x: 500,
            y: 1300,
            style: {
                text: [
                    'position: [500, 1300]{j|rotation: -0.1}',
                    '整体的 textAlign right, verticalAlign bottom',
                    'shadow'
                ].join('\n'),
                fill: 'red',
                font: '18px Arial',
                borderRadius: 10,
                backgroundColor: 'rgba(0, 255, 0, 0.3)',
                borderColor: '#191933',
                borderWidth: 4,
                shadowBlur: 5,
                shadowColor: '#1099ee',
                shadowOffsetX: 5,
                shadowOffsetY: 10,
                padding: [20, 30, 40, 50],
                verticalAlign: 'bottom',
                align: 'right',
                rich: {
                    j: {
                        font: '23px Arial',
                        fill: '#922889',
                        verticalAlign: 'top',
                        lineHeight: 100
                    }
                }
            },
            
        }));
        
        
        
        
        
        
        
        function getDotStyle(color) {
            return {
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: color
            }
        }
        function genarateTooltipStyle(seriesName, items, colorList) {
            var text = [seriesName];
            var rich = {};
            for (var i = 0; i < items.length; i++) {
                text.push('{dot' + i + '|} ' + items[i]);
                rich['dot' + i] = getDotStyle(colorList[i]);
            }
            return {text: text.join('\n'), rich: rich};
        }
        var styles = genarateTooltipStyle(
            'Some series',
            [
                'C: 1223 km',
                'D: 12 km',
                'Q: 2323 km',
                'Z: 4.23 km',
                'A: 23 km'
            ],
            ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
        );
        
        elements.push(new vjmap3d.render2d.Text({
            rotation: -0.1,
            x: 800,
            y: 1100,
            style: {
                text: styles.text,
                fill: '#333',
                font: '18px Arial',
                borderRadius: 10,
                borderColor: '#191933',
                borderWidth: 2,
                padding: [20, 30, 40, 50],
                rich: styles.rich
            }
        }));
        
        // 做为2d绘图渲染材质使用
        let renderTexture = vjmap3d.createRender2dTexture({
            autoCanvasSize: false, // 是否根据绘制的内容计算渲染的大小
            sharedCanvas: true, // 是否为了提高效率共享一个canvas
            canvasWidth: 1200, // 像素宽，这里是根据底图的像素宽高定的
            canvasHeight: 1500, // 像素高，这里是根据底图的像素宽高定的
            elements: elements,
        });
        let geoW = 20, geoH = 25;
        let geom = new THREE.PlaneGeometry(geoW, geoH);
        let mat = new THREE.MeshStandardMaterial({
            map: renderTexture.texture(),
            transparent: true
        })
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, 0, 0);
        mesh.rotateX(-Math.PI / 2)
        app.scene.add(mesh);
        
            
    }
    catch (e) {
        console.error(e);
    }
};