# Expression

聚合表达式

### 说明

表达式可以是字段路径、常量、或聚合操作符。表达式可以嵌套表达式。

#### 字段路径

表达式用字段路径表示法来指定记录中的字段。字段路径的表示由一个 $ 符号加上字段名或嵌套字段名。嵌套字段名用点将嵌套的各级字段连接起来。如 $profile 就表示 profile 的字段路径，\$profile.name 就表示 profile.name 的字段路径（profile 字段中嵌套的 name 字段）。

#### 常量

常量可以是任意类型。默认情况下 \$ 开头的字符串都会被当做字段路径处理，如果想要避免这种行为，使用 AggregateCommand.literal 声明为常量。

#### 聚合操作符

[AggregateCommand](./aggregateCommand.md)
