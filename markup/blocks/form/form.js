// счетчик для для изменения диапазона значений
let counter = {
    container: document.querySelector('.field_number'),
    numInput: document.querySelector('.field__input_number'),
    numBtn: document.querySelectorAll('.btn_number'),
    btnMin: document.querySelector('.btn_min'),
    btnMax: document.querySelector('.btn_max'),

    init: function () {
        if (this.container) {
            this.inputVal = this.numInput.value;
            this.setUpListeners();
        }
    },

    setUpListeners: function () {

        // при клике на кнопки .btn_min .btn_min происходит обновление значения счетчика
        for (let i = 0; i <= this.numBtn.length - 1; i++) {
            this.numBtn[i].addEventListener('click', function (event) {
                this.updateCounter.call(counter, event);
            }.bind(counter));
        }

        // приводе ногово значения в поле .field_number происходит обновление значения счетчика
        this.numInput.addEventListener('change', function (event) {
            this.inputChange(event);
        }.bind(counter));
    },

    // блокировка кнопок .btn_min .btn_min при достижении минимального / максимального значения счетчика
    getDisabledBtn: function () {
        function removeDisabled() {
            let numBtn = this.numBtn;
            for (let i = 0; i < numBtn.length; i++) {
                numBtn[i].disabled = false;
            }
        }

        if (this.inputVal !== 1 && this.inputVal !== 10) {
            removeDisabled.call(counter);
        } else if (this.inputVal === 1) {
            removeDisabled.call(counter);
            this.btnMin.disabled = true;
        } else if (this.inputVal === 10) {
            removeDisabled.call(counter);
            this.btnMax.disabled = true;
        }
    },

    // обновление значения счетчика при клике на кнопки .btn_min .btn_min
    updateCounter: function (event) {
        let element = event.target,
            inputVal = this.inputVal;

        if (element.classList.contains('btn_min') && inputVal > 1) {
            inputVal--;
        } else if (element.classList.contains('btn_max') && inputVal < 10) {
            inputVal++;
        }

        this.inputVal = this.numInput.value = inputVal;

        this.getDisabledBtn();
    },

    // обновление значения счетчика при вводе в поле .field__input_number нового значения
    inputChange: function (event) {
        let currentValue = event.target.value;
        currentValue = (currentValue >= 10) ? 10 : currentValue;
        currentValue = (currentValue <= 1) ? 1 : currentValue;

        this.inputVal = this.numInput.value = currentValue;

        this.getDisabledBtn();
    },

    result: function () {
        return this.inputVal;
    }
};

// переключатель
let swich = {
    switchSLed: document.querySelector('.field-swich__led'),

    init: function () {
        if (this.switchSLed) {
            this.setUpListeners();
        }
    },

    setUpListeners: function () {
        // при клике на индикатор, происходит переключение состояний радиобатанов на противоположные
        this.switchSLed.addEventListener('click', function () {
            this.updateSwitchSLed();
        }.bind(swich));
    },

    // переключение состояний радиобатанов
    updateSwitchSLed: function () {
        let colorSelectionController = document.getElementsByName('typeSwitchColor'),
            value = colorSelectionController[0].checked;

        colorSelectionController[0].checked = !value;
        colorSelectionController[1].checked = value;
    },
};

swich.init();
counter.init();
