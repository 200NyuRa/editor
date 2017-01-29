// переключатель
let app = {
    container: document.getElementById('editor'),
    paint: document.getElementById('paint'),
    picker: document.getElementById('picker-colors'),
    pickerIndicator: document.querySelector('.editor__picker-colors-indicator'),
    pickerPreview: document.querySelector('.editor__picker-preview'),
    clearBtn: document.querySelector('.editor__clear'),
    pickerColor: null,
    currentPoint: 0,
    image: null,
    ctx: null,
    color: null,
    radius: 0,
    maxRadius: 6,
    flagClick: true,
    flagPickerMousedown: false,
    flagColorSelectionAuto: null,
    flagClear: false,
    delayNextAnimation: null,
    arrPoints: [],
    arrLastTenPoints: [],

    init: function () {
        this.container.height = document.documentElement.clientHeight;
        this.container.width = document.documentElement.clientWidth;
        this.container.style.height = this.container.height + 'px';
        this.container.style.width = this.container.width + 'px';
        this.initCanvas();
        this.initPicker();
        this.setUpListeners();
    },

    setUpListeners: function () {
        let updateEventListenerTargets = ['touchstart', 'touchmove', 'mouseup', 'mousemove'];

        // при клике по полотну для рисования
        // определение координаты новой точки, перезвпись массива arrLastTenPoints,
        // прорисовака новой точки и соединение ее со старыми точками
        this.paint.addEventListener('click', function () {

            if (this.flagClick) {
                this.getCoordinates(event, this.numLine);
            }
        }.bind(app));

        this.picker.addEventListener('mousedown', function () {
            this.flagPickerMousedown = true;
        }.bind(app));

        this.pickerIndicator.addEventListener('mousedown', function () {
            this.flagPickerMousedown = true;
        }.bind(app));

        document.addEventListener('mouseup', function () {
            this.flagPickerMousedown = false;
        }.bind(app));

        // обновление значения color-picker'a при событиях 'touchstart', 'touchmove', 'mouseup', 'mousemove'
        // срабатывающих на элементе picker-colors (круг для выбора цвета)
        for (let i = 0, len = updateEventListenerTargets.length; i < len; i++) {
            this.picker.addEventListener(updateEventListenerTargets[i], function () {
                this.updatePicker(event);
            }.bind(app), false);
        }

        this.pickerIndicator.addEventListener('mousemove', function () {
            this.picker.addEventListener('mousemove', function () {
                this.updatePicker(event);
            }.bind(app));
        }.bind(app));

        // клик по полю для рисования редактора, происходит очиска этого поля
        this.clearBtn.addEventListener('click', function () {
            this.flagClear = true;
            this.clearPaint();
        }.bind(app));
    },

    // инициализация поля, в котором  будут прорисовываться линии
    initCanvas: function () {
        this.ctx = this.paint.getContext('2d');
        this.paint.height = this.container.height;
        this.paint.minHeight = 600;
        this.paint.width = this.container.width;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    initPicker: function () {
        // инициализация color-picker
        this.ctxPicker = this.picker.getContext('2d');
        this.picker.width = 170;
        this.picker.height = 170;
        let x = this.picker.width / 2,
            y = this.picker.height / 2,
            radius = x,
            counterClockwise = false;

        // поле-круг для выбора цвета
        for (let angle = 0; angle <= 360; angle += 1) {
            let startAngle = (angle - 2) * Math.PI / 180,
                endAngle = angle * Math.PI / 180;

            this.ctxPicker.beginPath();
            this.ctxPicker.moveTo(x, y);
            this.ctxPicker.arc(x, y, radius, startAngle, endAngle, counterClockwise);
            this.ctxPicker.closePath();
            let gradient = this.ctxPicker.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'hsl(' + angle + ', 10%, 100%)');
            gradient.addColorStop(1, 'hsl(' + angle + ', 100%, 50%)');

            this.ctxPicker.fillStyle = gradient;
            this.ctxPicker.fill();
        }

        // возвращает дефолтное цвета сolor-picker'a при активном ручном режиме выбора цвета
        this.getPickerColor(x, y);
    },

        // текущий цвет сolor-picker'a
    getPickerColor: function (pixelX, pixelY) {
        let rgbVal = document.getElementById('rgbVal'),
            hexVal = document.getElementById('hexVal'),
            imageData = this.ctxPicker.getImageData(pixelX, pixelY, 1, 1),
            pixel = imageData.data,
            dColor,
            rgbColor;

        if (!pixel[pixel.length - 1]) {
            return;
        }

        dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
        rgbVal.value = `${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
        hexVal.value = ('#' + ('0000' + dColor.toString(16)).substr(-6));
        rgbColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        this.pickerPreview.style.backgroundColor = rgbColor;
    },

    // обновление значения цвета сolor-picker'a нажатии мыши и перемещении курсора
    // по кругу для выбора цвета
    updatePicker: function (event) {
        if (event.type === 'mousemove' && !this.flagPickerMousedown) {
            return;
        }

        let pickerOffset = this.picker.getBoundingClientRect(),
            pickerOffsetX = pickerOffset.left,
            pickerOffsetY = pickerOffset.top,
            pickerIndicatorHalfX = this.pickerIndicator.offsetWidth / 2,
            pickerIndicatorHalfY = this.pickerIndicator.offsetHeight / 2,
            that = this,
            left,
            top,
            pickerX,
            pickerY,
            timetID;

        clearTimeout(timetID);
        timetID = setTimeout(function () {
            pickerX = event.pageX - pickerOffsetX;
            pickerY = event.pageY - pickerOffsetY;

            left = pickerX - pickerIndicatorHalfX;
            top = pickerY - pickerIndicatorHalfY;
            that.pickerIndicator.style.left = left + 'px';
            that.pickerIndicator.style.top = top + 'px';

            that.getPickerColor(pickerX, pickerY);
        }, 100);
    },

    // генерация значения цвета редактора при автоматическом режиме выбора цвета
    getColor: function () {
        let start = 30,
            randColor = function () {
                return start + Math.round(Math.random() * (255 - start));
            },
            r = randColor(),
            g = randColor(),
            b = randColor(),
            color = `rgb(${r}, ${g}, ${b})`;

        return color;
    },

    // определение координаты новой точки при клике. Координаты новых точек записываются в массив arrLastTenPoints (в этот массив сохраняется 10
    // последних точек(кликов). Количество линий, которое нужно прорисовать при новом крике на поле редактора берется из значения счетчика 'Amount of points for connection',
    // линии прорисовываютя по данным массива arrPoints - куда из массива arrLastTenPoints копируются элементы, количесво элементов равно
    // значению из счетчика 'Amount of points for connection' + 1)
    getCoordinates: function (event) {
        let numPoint = +document.querySelector('.field__input_number').value + 1,
            newPoint = {};
        newPoint.x = event.pageX - this.paint.offsetLeft;
        newPoint.y = event.pageY - this.paint.offsetTop;

        this.arrPoints = [];

        if (this.arrLastTenPoints.length > 10) {
            this.arrLastTenPoints.splice(0, 1);
        }

        this.arrLastTenPoints.push(newPoint);

        if (numPoint > this.arrLastTenPoints.length) {
            this.arrPoints = this.arrLastTenPoints.slice();
        } else {
            this.arrPoints = this.arrLastTenPoints.slice(this.arrLastTenPoints.length - numPoint);
        }

        // прорисовка линий и точек на полотне редактора
        this.drawEditPaint.call(app);
    },

    // анимация появления точки
    getPoint: function (time) {
        this.flagClick = false;
        let currentPointTime = 0,
            currentRadius = this.radius,
            arrPoints = this.arrPoints,
            newPoint = arrPoints[arrPoints.length - 1],
            that = this,
            timerAnimPointId,
            timerPointId;

        const INCREMENT = 1,
            STEP = this.maxRadius / INCREMENT,
            ANIMATIONSPEED = time / STEP;

        function renderPoint() {
            currentRadius += INCREMENT;
            that.ctx.beginPath();
            that.ctx.fillStyle = that.color;
            that.ctx.moveTo(newPoint.x, newPoint.y);
            that.ctx.arc(newPoint.x, newPoint.y, currentRadius, 0, Math.PI * 2);
            that.ctx.fill();

            clearTimeout(timerPointId);
            timerPointId = setTimeout(function () {
                currentPointTime += ANIMATIONSPEED;

                if (that.flagClear) {
                    clearTimeout(timerPointId);
                    cancelAnimationFrame(timerAnimPointId);
                    that.clearPaint();
                    that.flagClear = false;
                    that.flagClick = true;
                    return;
                }

                if (currentPointTime >= time) {
                    cancelAnimationFrame(timerAnimPointId);
                    that.flagClick = true;
                    return true;
                }

                timerAnimPointId = requestAnimationFrame(renderPoint);
            }, ANIMATIONSPEED);
        }

        timerAnimPointId = requestAnimationFrame(renderPoint);
    },

    // анимация прорисовки линий
    getLine: function () {
        let that = this,
            stepsNumber = 1,
            arrPoints = that.arrPoints,
            forWayPoints = arrPoints.filter(function (item, i, arr) {
                if (item.x && i !== arr.length - 1) {
                    return item;
                }
            }),
            waypoints = [],
            timerAnimLineId = null;
        forWayPoints.reverse();

        function calcPointsLine() {
            that.flagClick = false;
            for (let i = 0; i <= forWayPoints.length - 1; i++) {
                let pt0 = arrPoints[arrPoints.length - 1],
                    pt1 = forWayPoints[i],
                    differenceX = pt1.x - pt0.x,
                    differenceY = pt1.y - pt0.y;
                for (let j = 0; j < 50; j++) {
                    let x = pt0.x + differenceX * j / 50;
                    let y = pt0.y + differenceY * j / 50;
                    waypoints.push({
                        x: x,
                        y: y
                    });
                }
            }
            return (waypoints);
        }

        function randerLine() {
            that.flagClick = false;
            that.ctx.lineCap = 'round';
            that.ctx.lineWidth = 3;
            that.ctx.fillStyle = '#fff';
            that.ctx.beginPath();
            that.ctx.moveTo(waypoints[stepsNumber - 1].x, waypoints[stepsNumber - 1].y);
            that.ctx.lineTo(waypoints[stepsNumber].x, waypoints[stepsNumber].y);
            that.ctx.stroke();

            if (that.flagClear) {
                cancelAnimationFrame(timerAnimLineId);
                that.clearPaint();
                that.flagClear = false;
                that.flagClick = true;
                return;
            }

            if (stepsNumber >= waypoints.length - 1) {
                that.flagClick = true;
                cancelAnimationFrame(timerAnimLineId);
                return;
            }

            timerAnimLineId = window.requestAnimationFrame(randerLine);

            stepsNumber++;
        }

        calcPointsLine();
        that.timeranimlineid = window.requestAnimationFrame(randerLine);
    },

    // прорисовка линий и точек на полотне редактора
    // во время анимации появления точки или прорисовки линий новых точек на полотне редактора действует запрет появления
    // новой точки, автоматического изменения цвета при клике
    drawEditPaint: function () {
        let arrPoints = this.arrPoints,
            newPoint = arrPoints[arrPoints.length - 1],
            lastPoint = arrPoints[arrPoints.length - 2],
            color,
            idTimeLine,
            that = this;

        this.flagColorSelectionAuto = document.getElementById('typeSwitchColorAuto').checked;
        this.currentPoint++;

        // текущий цвет линий и точек сохраняется в свойтсве this.currentPoint, если при автоматическом режиме изменения цвета на поле не более двух точек
        // значение this.currentPoint не меняется, если более 2 точек -  генерируется функцией this.getColor(), если включен ручной режим - значение цвета берется из
        // текущего значения цвета сolor-picker'a
        if (this.currentPoint > 1 && this.currentPoint <= 2) {
            color = this.color;
        } else if (this.flagColorSelectionAuto) {
            color = this.color = this.getColor();
        } else if (!this.flagColorSelectionAuto) {
            color = this.color = this.pickerColor = this.pickerPreview.style.backgroundColor;
        }

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        this.getPoint(300);

        if (this.currentPoint < 2) {
            return;
        }

        clearTimeout(idTimeLine);
        idTimeLine = setTimeout(function () {
            that.getLine(newPoint, lastPoint);
        }, 300);
    },

    // очистка поля для рисования редактора, приведение всех параметров короме занчения color-picker'a в исходное состояние
    clearPaint: function () {
        this.ctx.clearRect(0, 0, this.paint.width, this.paint.height);
        this.currentPoint = 0;
        this.arrLastTenPoints = [];

        if (this.flagClick) {
            this.flagClear = false;
        }

        return true;
    }
};
app.init();
