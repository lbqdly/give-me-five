import {start, backStep} from './game';

let domBtnBackStep = document.getElementById('backStep');
//let domBtnBackStepCancel = document.getElementById('backStepCancel');
domBtnBackStep.addEventListener('click', () => {
    backStep();
});

//开始游戏
start({
    root: document.getElementById('root'),
    onGameOver() {
        domBtnBackStep.setAttribute('disabled', 'disabled');
    }
});