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
    let aElements = document.getElementsByTagName(tag);
    let aEle = [];
    for (let i = 0; i < aElements.length; i++) {
        if (aElements[i].getAttribute(attr) === value)
            aEle.push(aElements[i]);
    }
    return aEle;
}

export {getElementByAttr}