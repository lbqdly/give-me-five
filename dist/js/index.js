/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.backStepCancel = exports.backStep = exports.start = undefined;

__webpack_require__(7);

var _utils = __webpack_require__(2);

//玩家常量
/**
 * Created by aaron on 2017/5/16.
 */

var PLAYERS = [{ name: '红方', type: 1 }, { name: '蓝方', type: 2 }];

//配置项
var config = {
    IDGAP: 'x', //键名分割符
    ROW: 20, //棋盘行数
    COL: 20, //棋盘列数
    HISTORY_LENGTH: 5 //最大历史记录数
};

//根目录dom
var root = void 0;

//棋子模型
var grid = {
    //0:空白，1:g1，2:g2
    type: 0
};

//当前总轮数//且通过turn%2可以得出当前落子方。
var turn = 0;

//棋局历史记录
var history = [];

/**
 * 创建一个初始棋局
 * @returns {{}}
 */
function createInitState() {
    var state = {};
    for (var y = 0; y < config.COL; y++) {
        for (var x = 0; x < config.ROW; x++) {
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

    var gridDom = e.target;

    //获取落子id
    var gid = gridDom.getAttribute('data-id');
    //console.log(gid);

    if (gridDom.getAttribute('class') !== 'g0') {
        //已经落子的格子不能再使用
        return;
    }

    //得到新的棋局
    var newState = changeState(history[0], gid, getWhoTurn().type);

    //console.log(newState);

    //新的棋局载入到历史
    addToHistory(newState);

    //绘制最新的棋局
    draw(history[0]);

    //评审局势
    var result = judge(gid);

    if (result.length >= 4) {
        //当与之相邻的棋子超过4个时，游戏结束。
        stop();
    }

    turn += 1;
}

/**
 * 悔棋
 */
function backStep() {
    var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

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
        for (var y = 0; y < config.COL; y++) {
            var rowDom = document.createElement('div');
            rowDom.setAttribute('class', 'row');
            for (var x = 0; x < config.ROW; x++) {
                var key = x + config.IDGAP + y;
                var gDom = document.createElement('div');
                gDom.setAttribute('class', 'g' + state[key].type);
                gDom.setAttribute('data-id', key);
                //gDom.innerHTML = x + '.' + y;
                rowDom.appendChild(gDom);
            }
            root.appendChild(rowDom);
        }
    } else {
        //比较两个state后，精准渲染。
        var prevState = history[1];
        var _key = void 0;
        var type = void 0;
        for (var _y = 0; _y < config.COL; _y++) {
            for (var _x2 = 0; _x2 < config.ROW; _x2++) {
                _key = _x2 + config.IDGAP + _y;
                if (prevState[_key].type !== state[_key].type) {
                    //console.log(key);
                    type = state[_key].type;
                    _y = config.COL - 1;
                    break;
                }
            }
        }

        var targetDOM = (0, _utils.getElementByAttr)('div', 'data-id', _key)[0];
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
    var next = {};
    next[gid] = Object.assign({}, grid, { type: type });
    return Object.assign({}, state, next);
}

/**
 * 评审当前棋局形势,当返回的数组长度等于4，则产生胜利者。
 * @param gid
 * @returns {Array}
 */
function judge(gid) {
    //从9个方向检查
    var grids = [];
    var state = history[0];

    var currentGrid = state[gid];

    var grids1 = testVctId(gid, 0, 4, state, currentGrid);
    //console.log('grids1:|', grids1);
    if (grids1.length === 4) {
        return grids1;
    }

    var grids2 = testVctId(gid, 1, 5, state, currentGrid);
    //console.log('grids2:/', grids2);
    if (grids2.length === 4) {
        return grids2;
    }

    var grids3 = testVctId(gid, 2, 6, state, currentGrid);
    //console.log('grids3:-', grids3);
    if (grids3.length === 4) {
        return grids3;
    }

    var grids4 = testVctId(gid, 3, 7, state, currentGrid);
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
    var grids = [];

    for (var i = 1; i <= 5; i++) {
        var nbid = getNeighborId(gid, vct0, i);
        console.log(nbid, i);
        //获取邻居id
        if (state[nbid] && state[nbid].type === currentGrid.type) {
            //如果邻居是同类棋子,添加到数组
            grids.push(nbid);
        } else {
            break;
        }
    }

    for (var _i = 1; _i <= 5; _i++) {
        var _nbid = getNeighborId(gid, vct1, _i);
        //console.log(nbid, i);
        //获取邻居id

        if (state[_nbid] && state[_nbid].type === currentGrid.type) {
            //如果邻居是同类棋子,添加到数组
            grids.push(_nbid);
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

    var nbid = '';
    var point = idToPoint(id); //相邻id
    //console.log(id, point);
    if (vct === 0) {
        //上
        nbid = point.x + config.IDGAP + (point.y - len);
    } else if (vct === 1) {
        //右上
        nbid = point.x + len + config.IDGAP + (point.y - len);
    } else if (vct === 2) {
        //右
        nbid = point.x + len + config.IDGAP + point.y;
    } else if (vct === 3) {
        //右下
        nbid = point.x + len + config.IDGAP + (point.y + len);
    } else if (vct === 4) {
        //下
        nbid = point.x + config.IDGAP + (point.y + len);
    } else if (vct === 5) {
        //左下
        nbid = point.x - len + config.IDGAP + (point.y + len);
    } else if (vct === 6) {
        //左
        nbid = point.x - len + config.IDGAP + point.y;
    } else if (vct === 7) {
        //左上
        nbid = point.x - len + config.IDGAP + (point.y - len);
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
    return { x: parseInt(id.split(config.IDGAP)[0]), y: parseInt(id.split(config.IDGAP)[1]) };
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

exports.start = start;
exports.backStep = backStep;
exports.backStepCancel = backStepCancel;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _game = __webpack_require__(0);

var domBtnBackStep = document.getElementById('backStep');
//let domBtnBackStepCancel = document.getElementById('backStepCancel');
domBtnBackStep.addEventListener('click', function () {
    (0, _game.backStep)();
});

//开始游戏
(0, _game.start)({
    root: document.getElementById('root'),
    onGameOver: function onGameOver() {
        domBtnBackStep.setAttribute('disabled', 'disabled');
    }
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Created by aaron on 2017/5/17.
 */

/**
 * 获取所有匹配次属性的元素
 * @param tag
 * @param attr
 * @param value
 * @returns {Array}
 */
function getElementByAttr(tag, attr, value) {
  var aElements = document.getElementsByTagName(tag);
  var aEle = [];
  for (var i = 0; i < aElements.length; i++) {
    if (aElements[i].getAttribute(attr) === value) aEle.push(aElements[i]);
  }
  return aEle;
}

exports.getElementByAttr = getElementByAttr;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(undefined);
// imports


// module
exports.push([module.i, "#root {\n  width: 440px;\n  height: 440px;\n  padding: 15px;\n  border: solid 1px black;\n}\n.row {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: flex;\n}\n.g {\n  /*outline: solid 1px red;*/\n  display: inline-block;\n  width: 22px;\n  height: 22px;\n  font-size: 10px;\n  text-align: center;\n  border-radius: 50%;\n  cursor: pointer;\n}\n.g0 {\n  /*outline: solid 1px red;*/\n  display: inline-block;\n  width: 22px;\n  height: 22px;\n  font-size: 10px;\n  text-align: center;\n  border-radius: 50%;\n  cursor: pointer;\n  background: url(" + __webpack_require__(8) + ") no-repeat;\n  background-position: center;\n}\n.g1 {\n  /*outline: solid 1px red;*/\n  display: inline-block;\n  width: 22px;\n  height: 22px;\n  font-size: 10px;\n  text-align: center;\n  border-radius: 50%;\n  cursor: pointer;\n  background: url(" + __webpack_require__(9) + ") no-repeat;\n  background-position: center;\n}\n.g2 {\n  /*outline: solid 1px red;*/\n  display: inline-block;\n  width: 22px;\n  height: 22px;\n  font-size: 10px;\n  text-align: center;\n  border-radius: 50%;\n  cursor: pointer;\n  background: url(" + __webpack_require__(10) + ") no-repeat;\n  background-position: center;\n}\n", ""]);

// exports


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(6);

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 6 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(3);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(5)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/postcss-loader/index.js!../node_modules/less-loader/dist/index.js!./five.less", function() {
			var newContent = require("!!../node_modules/css-loader/index.js??ref--1-1!../node_modules/postcss-loader/index.js!../node_modules/less-loader/dist/index.js!./five.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OThGNkVEQ0QzQUM3MTFFNzg0MjJBRjlBQTQ1QkY4RTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OThGNkVEQ0UzQUM3MTFFNzg0MjJBRjlBQTQ1QkY4RTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5OEY2RURDQjNBQzcxMUU3ODQyMkFGOUFBNDVCRjhFMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5OEY2RURDQzNBQzcxMUU3ODQyMkFGOUFBNDVCRjhFMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Psl8gDAAAAAXSURBVHjaYjx79iwDEmBiQAWk8gECDAC9QgJxHC3ezwAAAABJRU5ErkJggg=="

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAIAAAC0tAIdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RENDQ0FFOTEzQUM3MTFFNzg0QUZFQjZDNzU1MEQ4NDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RENDQ0FFOTIzQUM3MTFFNzg0QUZFQjZDNzU1MEQ4NDYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEQ0NDQUU4RjNBQzcxMUU3ODRBRkVCNkM3NTUwRDg0NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQ0NDQUU5MDNBQzcxMUU3ODRBRkVCNkM3NTUwRDg0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoBOZo8AAACcSURBVHjalJKxDYQwDEV/OCp6aorMECaghpVukExBnQ1oWYA2rID0zxCqE6ezv34VP39LsR1JFO075hkpYVmwbeg6hIBhwDiibW+GRSlxmqTvwfIu1Uu40b5/RoulejWAOf9M/ZqQMxjjf7Q4xte7abCu0EhIeq/N9t6xrnEcqmwhTdnVuQKlQqjObSklpPG/bbu03Ikz3eBHgAEAg6nc2dZtFjMAAAAASUVORK5CYII="

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAIAAAC0tAIdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTZGQ0JBQTMzQUM3MTFFNzg5RDJBMUVBNzNDNjFBMUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTZGQ0JBQTQzQUM3MTFFNzg5RDJBMUVBNzNDNjFBMUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNkZDQkFBMTNBQzcxMUU3ODlEMkExRUE3M0M2MUExRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNkZDQkFBMjNBQzcxMUU3ODlEMkExRUE3M0M2MUExRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PknTntMAAACeSURBVHjalJIxDsIwDEV/rIiBvStcAljYqo4VDFwPcQjEGOUCcAkY2ytUcj81EyrCefIUv8SK7aCqmOh7XG9IGfcHni+sV9hu0NQ4tKgqfNCJlPV4UixmgufMGjB1t59XLZi1C+i6n69+VaCJ8+W/akFT+C0nNIUdcEIzxKUOg8uOEcK+OqEpHIETmsJpOXmbZf0um2XRnoSiHRwFGAAuUsQImwuApgAAAABJRU5ErkJggg=="

/***/ })
/******/ ]);