/**
 * Created by aaron on 2017/5/16.
 */

import './five.less'

import {getElementByAttr} from './utils';

//玩家常量
const PLAYERS = [{name: '红方', type: 1}, {name: '蓝方', type: 2}];

//配置项
let config = {
    IDGAP: 'x',//键名分割符
    ROW: 20,//棋盘行数
    COL: 20,//棋盘列数
    HISTORY_LENGTH: 5//最大历史记录数
};

//根目录dom
let root;

//棋子模型
let grid = {
    //0:空白，1:g1，2:g2
    type: 0
};

//当前总轮数//且通过turn%2可以得出当前落子方。
let turn = 0;

//棋局历史记录
let history = [];

/**
 * 创建一个初始棋局
 * @returns {{}}
 */
function createInitState() {
    let state = {};
    for (let y = 0; y < config.COL; y++) {
        for (let x = 0; x < config.ROW; x++) {
            state[x + config.IDGAP + y] = Object.assign({}, grid);
        }
    }
    return state;
}

/**
 * 获取当前走棋的一方
 * @returns {*}
 */
function getWhoTurn() {
    //console.log(turn % 2);
    return PLAYERS[turn % 2];
}

/**
 * 谁走了一步
 * @param e
 */
function onClickRoot(e) {
    //console.log('第' + turn + '步');

    let gridDom = e.target;

    //获取落子id
    let gid = gridDom.getAttribute('data-id');
    //console.log(gid);

    if (gridDom.getAttribute('class') !== 'g0') {
        //已经落子的格子不能再使用
        return;
    }

    //得到新的棋局
    let newState = changeState(history[0], gid, getWhoTurn().type);

    //console.log(newState);

    //新的棋局载入到历史
    addToHistory(newState);


    //绘制最新的棋局
    draw(history[0]);

    //评审局势
    let result = judge(gid);

    if (result.length >= 4) {
        //当与之相邻的棋子超过4个时，游戏结束。
        stop();
    }


    turn += 1;

}

/**
 * 悔棋
 */
function backStep(step = 1) {
    if (step >= history.length) {
        //撤销步数不能大于历史记录数
        alert('你还未走棋。');
        return;
    }

    //将某一步历史记录再次重现
    addToHistory(Object.assign({}, history[step]));

    //绘制棋局
    draw(history[0]);

    //
    turn -= step;

    //trun不会小于0
    turn = turn < 0 ? 0 : turn;
}

/**
 * 撤销悔棋
 */
function backStepCancel() {
    //console.log(history.length);
    if (history.length <= 1) {
        //撤销步数不能大于历史记录数
        alert('你还未走棋。');
        return;
    }

    //将某一步历史记录再次重现
    addToHistory(Object.assign({}, history[1]));

    draw(history[0]);
    //
    turn += 1;
}

/**
 * 绘制棋盘,如果迁移到canvas，只需重写此方法。
 * @param state
 */
function draw(state) {

    if (!root.innerHTML) {
        //初次渲染，创建所有元素
        for (let y = 0; y < config.COL; y++) {
            let rowDom = document.createElement('div');
            rowDom.setAttribute('class', 'row');
            for (let x = 0; x < config.ROW; x++) {
                let key = x + config.IDGAP + y;
                let gDom = document.createElement('div');
                gDom.setAttribute('class', 'g' + state[key].type);
                gDom.setAttribute('data-id', key);
                //gDom.innerHTML = x + '.' + y;
                rowDom.appendChild(gDom)
            }
            root.appendChild(rowDom);
        }
    } else {
        //比较两个state后，精准渲染。
        let prevState = history[1];
        let key;
        let type;
        for (let y = 0; y < config.COL; y++) {
            for (let x = 0; x < config.ROW; x++) {
                key = x + config.IDGAP + y;
                if (prevState[key].type !== state[key].type) {
                    //console.log(key);
                    type = state[key].type;
                    y = config.COL - 1;
                    break;
                }
            }
        }

        let targetDOM = getElementByAttr('div', 'data-id', key)[0];
        targetDOM.setAttribute('class', 'g' + type);
    }
}


/**
 * 载入到历史
 * @param state
 */
function addToHistory(state) {
    history.unshift(state);
    //新历史

    history = history.splice(0, config.HISTORY_LENGTH);
    //只保留一定的历史
}

/**
 * 获得新的棋局
 * @param state 当前棋局
 * @param gid 变化棋子
 * @param type 变化内容
 * @returns {*}
 */
function changeState(state, gid, type) {
    //console.log('type', type);
    let next = {};
    next[gid] = Object.assign({}, grid, {type: type});
    return Object.assign({}, state, next);
}

/**
 * 评审当前棋局形势,当返回的数组长度等于4，则产生胜利者。
 * @param gid
 * @returns {Array}
 */
function judge(gid) {
    //从9个方向检查
    let grids = [];
    let state = history[0];

    let currentGrid = state[gid];


    let grids1 = testVctId(gid, 0, 4, state, currentGrid);
    //console.log('grids1:|', grids1);
    if (grids1.length === 4) {
        return grids1;
    }

    let grids2 = testVctId(gid, 1, 5, state, currentGrid);
    //console.log('grids2:/', grids2);
    if (grids2.length === 4) {
        return grids2;
    }

    let grids3 = testVctId(gid, 2, 6, state, currentGrid);
    //console.log('grids3:-', grids3);
    if (grids3.length === 4) {
        return grids3;
    }

    let grids4 = testVctId(gid, 3, 7, state, currentGrid);
    //console.log('grids4:\\', grids4);
    if (grids4.length === 4) {
        return grids4;
    }

    return grids;

}

/**
 * 检查各个方向是否有连珠
 * @param gid
 * @param vct0
 * @param vct1
 * @param state
 * @param currentGrid
 * @returns {Array}
 */
function testVctId(gid, vct0, vct1, state, currentGrid) {
    let grids = [];

    for (let i = 1; i <= 5; i++) {
        let nbid = getNeighborId(gid, vct0, i);
        console.log(nbid, i);
        //获取邻居id
        if (state[nbid] && state[nbid].type === currentGrid.type) {
            //如果邻居是同类棋子,添加到数组
            grids.push(nbid);
        } else {
            break;
        }
    }


    for (let i = 1; i <= 5; i++) {
        let nbid = getNeighborId(gid, vct1, i);
        //console.log(nbid, i);
        //获取邻居id

        if (state[nbid] && state[nbid].type === currentGrid.type) {
            //如果邻居是同类棋子,添加到数组
            grids.push(nbid);
        } else {
            break;
        }
    }

    return grids;
}

/**
 * 返回邻居id
 * @param id
 * @param vct 0,1,2,3,4,5,6,7 方向
 * @param len int
 * @returns {string}
 */
function getNeighborId(id, vct, len) {

    let nbid = '';
    let point = idToPoint(id);//相邻id
    //console.log(id, point);
    if (vct === 0) {
        //上
        nbid = point.x + config.IDGAP + (point.y - len);

    } else if (vct === 1) {
        //右上
        nbid = (point.x + len) + config.IDGAP + (point.y - len);

    } else if (vct === 2) {
        //右
        nbid = (point.x + len) + config.IDGAP + point.y;

    } else if (vct === 3) {
        //右下
        nbid = (point.x + len) + config.IDGAP + (point.y + len);

    } else if (vct === 4) {
        //下
        nbid = point.x + config.IDGAP + (point.y + len);

    } else if (vct === 5) {
        //左下
        nbid = (point.x - len) + config.IDGAP + (point.y + len);

    } else if (vct === 6) {
        //左
        nbid = (point.x - len) + config.IDGAP + point.y;

    } else if (vct === 7) {
        //左上
        nbid = (point.x - len) + config.IDGAP + (point.y - len);
    }
    //console.log('in', id, 'out:', nbid, vct, len);
    return nbid;
}

/**
 * 返回id字符串的对象形式
 * @param id
 * @returns {{x: *, y: *}}
 */
function idToPoint(id) {
    //console.log(id.split(config.IDGAP));
    return {x: parseInt(id.split(config.IDGAP)[0]), y: parseInt(id.split(config.IDGAP)[1])}
}


/**
 * 开始游戏
 */
function start(opt) {
    root = opt.root;
    onGameOver = opt.onGameOver;

    turn = 1;
    //重置计数器

    history = [];
    //清空历史

    addToHistory(createInitState());
    //创建初始棋盘数据

    root.addEventListener('click', onClickRoot);
    //侦听点击

    draw(history[0]);
}

/**
 * 游戏结束回调(默认值)
 */
function onGameOver() {
    console.log('game over !');
}

/**
 * 结束游戏
 */
function stop() {
    root.removeEventListener('click', onClickRoot);
    alert('游戏结束');
    onGameOver();
}

export {start, backStep, backStepCancel}