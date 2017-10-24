### 五子棋算法

- 项目使用原生JavaScript，未使用框架或类库。
- 数据与渲染分离的设计，类似react。
- 将棋局构建成一个state树形数据。
- 每一次落子将产生新的棋局state，新的state数据将被追加到历史数组。
- 使用一个数组将历史state棋局储存，这样悔棋重现变得很简单。
- 在渲染时，新的state会与前一个state对比，只定点渲染产生更新的棋子。
