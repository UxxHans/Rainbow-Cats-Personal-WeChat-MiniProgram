# AggregateCommand

数据库聚合操作符，通过 db.command.aggregate 获取

### [AggregateCommand.abs(value: number | Expression\<number\>)](./operators/abs.md)

描述: 聚合操作符。返回一个数字的绝对值。

### [AggregateCommand.add(value: Expression[])](./operators/add.md)

描述: 聚合操作符。将数字相加或将数字加在日期上。如果数组中的其中一个值是日期，那么其他值将被视为毫秒数加在该日期上。

### [AggregateCommand.addToSet(value: Expression)](./operators/addToSet.md)

描述: 聚合操作符。聚合运算符。向数组中添加值，如果数组中已存在该值，不执行任何操作。它只能在 group stage 中使用。

### [AggregateCommand.allElementsTrue(value: Expression[])](./operators/allElementsTrue.md)

描述: 聚合操作符。输入一个数组，或者数组字段的表达式。如果数组中所有元素均为真值，那么返回 true，否则返回 false。空数组永远返回 true。

### [AggregateCommand.and(value: Expression[])](./operators/and.md)

描述: 聚合操作符。给定多个表达式，and 仅在所有表达式都返回 true 时返回 true，否则返回 false。

### [AggregateCommand.anyElementTrue(value: Expression[])](./operators/anyElementTrue.md)

描述: 聚合操作符。输入一个数组，或者数组字段的表达式。如果数组中任意一个元素为真值，那么返回 true，否则返回 false。空数组永远返回 false。

### [AggregateCommand.arrayElemAt(value: Expression[])](./operators/arrayElemAt.md)

描述: 聚合操作符。返回在指定数组下标的元素。

### [AggregateCommand.arrayToObject(value: any)](./operators/arrayToObject.md)

描述: 聚合操作符。将一个数组转换为对象。

### [AggregateCommand.avg(value: Expression\<number\>)](./operators/avg.md)

描述: 聚合操作符。返回一组集合中，指定字段对应数据的平均值。

### [AggregateCommand.ceil(value: Expression\<number\>)](./operators/ceil.md)

描述: 聚合操作符。向上取整，返回大于或等于给定数字的最小整数。

### [AggregateCommand.cmp(value: Expression[])](./operators/cmp.md)

描述: 聚合操作符。给定两个值，返回其比较值：

### [AggregateCommand.concat(value: Expression[])](./operators/concat.md)

描述: 聚合操作符。连接字符串，返回拼接后的字符串。

### [AggregateCommand.concatArrays(value: Expression[])](./operators/concatArrays.md)

描述: 聚合操作符。将多个数组拼接成一个数组。

### [AggregateCommand.cond(value: any)](./operators/cond.md)

描述: 聚合操作符。计算布尔表达式，返回指定的两个值其中之一。

### [AggregateCommand.dateFromParts(value: any)](./operators/dateFromParts.md)

描述: 聚合操作符。给定日期的相关信息，构建并返回一个日期对象。

### [AggregateCommand.dateFromString(value: any)](./operators/dateFromString.md)

描述: 聚合操作符。将一个日期/时间字符串转换为日期对象

### [AggregateCommand.dateToString(value: any)](./operators/dateToString.md)

描述: 聚合操作符。根据指定的表达式将日期对象格式化为符合要求的字符串。

### [AggregateCommand.dayOfMonth(value: Expression\<string\>)](./operators/dayOfMonth.md)

描述: 聚合操作符。返回日期字段对应的  天数（一个月中的哪一天），是一个介于 1 至 31 之间的数字。

### [AggregateCommand.dayOfWeek(value: Expression\<string\>)](./operators/dayOfWeek.md)

描述: 聚合操作符。返回日期字段对应的天数（一周中的第几天），是一个介于 1（周日）到 7（周六）之间的整数。

### [AggregateCommand.dayOfYear(value: Expression\<string\>)](./operators/dayOfYear.md)

描述: 聚合操作符。返回日期字段对应的天数（一年中的第几天），是一个介于 1 到 366 之间的整数。

### [AggregateCommand.divide(value: Expression[])](./operators/divide.md)

描述: 聚合操作符。传入被除数和除数，求商。

### [AggregateCommand.eq(value: Expression[])](./operators/eq.md)

描述: 聚合操作符。匹配两个值，如果相等则返回 true，否则返回 false。

### [AggregateCommand.exp(value: Expression\<number\>)](./operators/exp.md)

描述: 聚合操作符。取 e（自然对数的底数，欧拉数） 的 n 次方。

### [AggregateCommand.filter(value: any)](./operators/filter.md)

描述: 聚合操作符。根据给定条件返回满足条件的数组的子集。

### [AggregateCommand.first(value: Expression)](./operators/first.md)

描述: 聚合操作符。返回指定字段在一组集合的第一条记录对应的值。仅当这组集合是按照某种定义排序（ sort ）后，此操作才有意义。

### [AggregateCommand.floor(value: Expression\<number\>)](./operators/floor.md)

描述: 聚合操作符。向下取整，返回大于或等于给定数字的最小整数。

### [AggregateCommand.gt(value: Expression[])](./operators/gt.md)

描述: 聚合操作符。匹配两个值，如果前者大于后者则返回 true，否则返回 false。

### [AggregateCommand.gte(value: Expression[])](./operators/gte.md)

描述: 聚合操作符。匹配两个值，如果前者大于或等于后者则返回 true，否则返回 false。

### [AggregateCommand.hour(value: Expression\<string\>)](./operators/hour.md)

描述: 聚合操作符。返回日期字段对应的小时数，是一个介于 0 到 23 之间的整数。

### [AggregateCommand.ifNull(value: Expression[])](./operators/ifNull.md)

描述: 聚合操作符。计算给定的表达式，如果表达式结果为 null、undefined 或者不存在，那么返回一个替代值；否则返回原值。

### [AggregateCommand.in(value: Expression[])](./operators/in.md)

描述: 聚合操作符。给定一个值和一个数组，如果值在数组中则返回 true，否则返回 false。

### [AggregateCommand.indexOfArray(value: Expression[])](./operators/indexOfArray.md)

描述: 聚合操作符。在数组中找出等于给定值的第一个元素的下标，如果找不到则返回 -1。

### [AggregateCommand.indexOfBytes(value: Expression[])](./operators/indexOfBytes.md)

描述: 聚合操作符。在目标字符串中查找子字符串，并返回第一次出现的 UTF-8 的字节索引（从 0 开始）。如果不存在子字符串，返回 -1。

### [AggregateCommand.indexOfCP(value: Expression[])](./operators/indexOfCP.md)

描述: 聚合操作符。在目标字符串中查找子字符串，并返回第一次出现的 UTF-8 的 code point 索引（从 0 开始）。如果不存在子字符串，返回 -1。

### [AggregateCommand.isArray(value: Expression)](./operators/isArray.md)

描述: 聚合操作符。判断给定表达式是否是数组，返回布尔值。

### [AggregateCommand.isoDayOfWeek(value: Expression\<string\>)](./operators/isoDayOfWeek.md)

描述: 聚合操作符。返回日期字段对应的 ISO 8601 标准的天数（一周中的第几天），是一个介于 1（周一）到 7（周日）之间的整数。

### [AggregateCommand.isoWeek(value: Expression\<string\>)](./operators/isoWeek.md)

描述: 聚合操作符。返回日期字段对应的 ISO 8601 标准的周数（一年中的第几周），是一个介于 1 到 53 之间的整数。

### [AggregateCommand.isoWeekYear(value: Expression\<string\>)](./operators/isoWeekYear.md)

描述: 聚合操作符。返回日期字段对应的 ISO 8601 标准的天数（一年中的第几天）。

### [AggregateCommand.last(value: Expression)](./operators/last.md)

描述: 聚合操作符。返回指定字段在一组集合的最后一条记录对应的值。仅当这组集合是按照某种定义排序（ sort ）后，此操作才有意义。

### [AggregateCommand.let(value: any)](./operators/let.md)

描述: 聚合操作符。自定义变量，并且在指定表达式中使用，返回的结果是表达式的结果。

### [AggregateCommand.literal(value: any)](./operators/literal.md)

描述: 聚合操作符。直接返回一个值的字面量，不经过任何解析和处理。

### [AggregateCommand.ln(value: Expression\<number\>)](./operators/ln.md)

描述: 聚合操作符。计算给定数字在自然对数值。

### [AggregateCommand.log(value: Expression[])](./operators/log.md)

描述: 聚合操作符。计算给定数字在给定对数底下的 log 值。

### [AggregateCommand.log10(value: Expression\<number\>)](./operators/log10.md)

描述: 聚合操作符。计算给定数字在对数底为 10 下的 log 值。

### [AggregateCommand.lt(value: Expression[])](./operators/lt.md)

描述: 聚合操作符。匹配两个值，如果前者小于后者则返回 true，否则返回 false。

### [AggregateCommand.lte(value: Expression[])](./operators/lte.md)

描述: 聚合操作符。匹配两个值，如果前者小于或等于后者则返回 true，否则返回 false。

### [AggregateCommand.map(value: any)](./operators/map.md)

描述: 聚合操作符。类似 JavaScript Array 上的 map 方法，将给定数组的每个元素按给定转换方法转换后得出新的数组。

### [AggregateCommand.max(value: Expression)](./operators/max.md)

描述: 聚合操作符。返回一组数值的最大值。

### [AggregateCommand.mergeObjects(value: Expression\<document\>)](./operators/mergeObjects.md)

描述: 聚合操作符。将多个文档合并为单个文档。

### [AggregateCommand.millisecond(value: Expression\<string\>)](./operators/millisecond.md)

描述: 聚合操作符。返回日期字段对应的毫秒数，是一个介于 0 到 999 之间的整数。

### [AggregateCommand.min(value: Expression)](./operators/min.md)

描述: 聚合操作符。返回一组数值的最小值。

### [AggregateCommand.minute(value: Expression\<string\>)](./operators/minute.md)

描述: 聚合操作符。返回日期字段对应的分钟数，是一个介于 0 到 59 之间的整数。

### [AggregateCommand.mod(value: Expression[])](./operators/mod.md)

描述: 聚合操作符。取模运算，取数字取模后的值。

### [AggregateCommand.month(value: Expression\<string\>)](./operators/month.md)

描述: 聚合操作符。返回日期字段对应的月份，是一个介于 1 到 12 之间的整数。

### [AggregateCommand.multiply(value: Expression[])](./operators/multiply.md)

描述: 聚合操作符。取传入的数字参数相乘的结果。

### [AggregateCommand.neq(value: Expression[])](./operators/neq.md)

描述: 聚合操作符。匹配两个值，如果不相等则返回 true，否则返回 false。

### [AggregateCommand.not(value: Expression)](./operators/not.md)

描述: 聚合操作符。给定一个表达式，如果表达式返回 true，则 not 返回 false，否则返回 true。注意表达式不能为逻辑表达式（and、or、nor、not）。

### [AggregateCommand.objectToArray(value: Expression\<object\>)](./operators/objectToArray.md)

描述: 聚合操作符。将一个对象转换为数组。方法把对象的每个键值对都变成输出数组的一个元素，元素形如 { k: \<key\>, v: \<value\> }。

### [AggregateCommand.or(value: Expression[])](./operators/or.md)

描述: 聚合操作符。给定多个表达式，如果任意一个表达式返回 true，则 or 返回 true，否则返回 false。

### [AggregateCommand.pow(value: Expression[])](./operators/pow.md)

描述: 聚合操作符。求给定基数的指数次幂。

### [AggregateCommand.push(value: any)](./operators/push.md)

描述: 聚合操作符。在 group 阶段，返回一组中表达式指定列与对应的值，一起组成的数组。

### [AggregateCommand.range(value: Expression[])](./operators/range.md)

描述: 聚合操作符。返回一组生成的序列数字。给定开始值、结束值、非零的步长，range 会返回从开始值开始逐步增长、步长为给定步长、但不包括结束值的序列。

### [AggregateCommand.reduce(value: any)](./operators/reduce.md)

描述: 聚合操作符。类似 JavaScript 的 reduce 方法，应用一个表达式于数组各个元素然后归一成一个元素。

### [AggregateCommand.reverseArray(value: Expression\<any[]\>)](./operators/reverseArray.md)

描述: 聚合操作符。返回给定数组的倒序形式。

### [AggregateCommand.second(value: Expression\<string\>)](./operators/second.md)

描述: 聚合操作符。返回日期字段对应的秒数，是一个介于 0 到 59 之间的整数，在特殊情况下（闰秒）可能等于 60。

### [AggregateCommand.setDifference(value: Expression[])](./operators/setDifference.md)

描述: 聚合操作符，输入两个集合，输出只存在于第一个集合中的元素。

### [AggregateCommand.setEquals(value: Expression[])](./operators/setEquals.md)

描述: 聚合操作符，输入两个集合，判断两个集合中包含的元素是否相同（不考虑顺序、去重）。

### [AggregateCommand.setIntersection(value: Expression[])](./operators/setIntersection.md)

描述: 聚合操作符，输入两个集合，输出两个集合的交集。

### [AggregateCommand.setIsSubset(value: Expression[])](./operators/setIsSubset.md)

描述: 聚合操作符，输入两个集合，判断第一个集合是否是第二个集合的子集。

### [AggregateCommand.setUnion(value: Expression[])](./operators/setUnion.md)

描述: 聚合操作符，输入两个集合，输出两个集合的并集。

### [AggregateCommand.size(value: Expression\<any[]\>)](./operators/size.md)

描述: 聚合操作符。返回数组长度。

### [AggregateCommand.slice(value: Expression[])](./operators/slice.md)

描述: 聚合操作符。类似 JavaScritp 的 slice 方法。返回给定数组的指定子集。

### [AggregateCommand.split(value: Expression[])](./operators/split.md)

描述: 聚合操作符。按照分隔符分隔数组，并且删除分隔符，返回子字符串组成的数组。如果字符串无法找到分隔符进行分隔，返回原字符串作为数组的唯一元素。

### [AggregateCommand.sqrt(value: Expression[])](./operators/sqrt.md)

描述: 聚合操作符。求平方根。

### [AggregateCommand.stdDevPop(value: Expression)](./operators/stdDevPop.md)

描述: 聚合操作符。返回一组字段对应值的标准差。

### [AggregateCommand.stdDevSamp(value: Expression)](./operators/stdDevSamp.md)

描述: 聚合操作符。计算输入值的样本标准偏差。如果输入值代表数据总体，或者不概括更多的数据，请改用 db.command.aggregate.stdDevPop。

### [AggregateCommand.strLenBytes(value: Expression)](./operators/strLenBytes.md)

描述: 聚合操作符。计算并返回指定字符串中 utf-8 编码的字节数量。

### [AggregateCommand.strLenCP(value: Expression)](./operators/strLenCP.md)

描述: 聚合操作符。计算并返回指定字符串的 UTF-8 code points 数量。

### [AggregateCommand.strcasecmp(value: Expression[])](./operators/strcasecmp.md)

描述: 聚合操作符。对两个字符串在不区分大小写的情况下进行大小比较，并返回比较的结果。

### [AggregateCommand.substr(value: Expression[])](./operators/substr.md)

描述: 聚合操作符。返回字符串从指定位置开始的指定长度的子字符串。它是 db.command.aggregate.substrBytes 的别名，更推荐使用后者。

### [AggregateCommand.substrBytes(value: Expression[])](./operators/substrBytes.md)

描述: 聚合操作符。返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 UTF-8 字节索引的字符开始，长度为指定的字节数。

### [AggregateCommand.substrCP(value: Expression[])](./operators/substrCP.md)

描述: 聚合操作符。返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 UTF-8 字节索引的字符开始，长度为指定的字节数。

### [AggregateCommand.subtract(value: Expression[])](./operators/subtract.md)

描述: 聚合操作符。将两个数字相减然后返回差值，或将两个日期相减然后返回相差的毫秒数，或将一个日期减去一个数字返回结果的日期。

### [AggregateCommand.sum(value: Expression)](./operators/sum.md)

描述: 聚合操作符。计算并且返回一组字段所有数值的总和。

### [AggregateCommand.switch(value: any)](./operators/switch.md)

描述: 聚合操作符。根据给定的 switch-case-default 计算返回值、

### [AggregateCommand.toLower(value: any)](./operators/toLower.md)

描述: 聚合操作符。将字符串转化为小写并返回。

### [AggregateCommand.toUpper(value: any)](./operators/toUpper.md)

描述: 聚合操作符。将字符串转化为大写并返回。

### [AggregateCommand.trunc(value: Expression\<number\>)](./operators/trunc.md)

描述: 聚合操作符。将数字截断为整形。

### [AggregateCommand.week(value: Expression\<string\>)](./operators/week.md)

描述: 聚合操作符。返回日期字段对应的周数（一年中的第几周），是一个介于 0 到 53 之间的整数。

### [AggregateCommand.year(value: Expression\<string\>)](./operators/year.md)

描述: 聚合操作符。返回日期字段对应的年份。

### [AggregateCommand.zip(value: any)](./operators/zip.md)

描述: 聚合操作符。把二维数组的第二维数组中的相同序号的元素分别拼装成一个新的数组进而组装成一个新的二维数组。如可将 [ [ 1, 2, 3 ], [ "a", "b", "c" ] ] 转换成 [ [ 1, "a" ], [ 2, "b" ], [ 3, "c" ] ]。
