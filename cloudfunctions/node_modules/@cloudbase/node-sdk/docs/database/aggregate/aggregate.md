# Aggregate

数据库集合的聚合操作实例

### [Aggregate.addFields(object: Object): Aggregate](./stages/addFields.md)

描述: 聚合阶段。添加新字段到输出的记录。经过 addFields 聚合阶段，输出的所有记录中除了输入时带有的字段外，还将带有 addFields 指定的字段。

### [Aggregate.bucket(object: Object): Aggregate](./stages/bucket.md)

描述: 聚合阶段。将输入记录根据给定的条件和边界划分成不同的组，每组即一个 bucket。

### [Aggregate.bucketAuto(object: Object): Aggregate](./stages/bucketAuto.md)

描述: 聚合阶段。将输入记录根据给定的条件划分成不同的组，每组即一个 bucket。与 bucket 的其中一个不同之处在于无需指定 boundaries，bucketAuto 会自动尝试将记录尽可能平均的分散到每组中。

### [Aggregate.count(fieldName: string): Aggregate](./stages/count.md)

描述: 聚合阶段。计算上一聚合阶段输入到本阶段的记录数，输出一个记录，其中指定字段的值为记录数。

### [Aggregate.end(): Promise\<Object\>](./stages/end.md)

描述: 聚合阶段。标志聚合操作定义完成，发起实际聚合操作

### [Aggregate.geoNear(options: Object): Aggregate](./stages/geoNear.md)

描述: 聚合阶段。将记录按照离给定点从近到远输出。

### [Aggregate.group(object: Object): Aggregate](./stages/group.md)

描述: 聚合阶段。将输入记录按给定表达式分组，输出时每个记录代表一个分组，每个记录的 \_id 是区分不同组的 key。输出记录中也可以包括累计值，将输出字段设为累计值即会从该分组中计算累计值。

### [Aggregate.limit(value: number): Aggregate](./stages/limit.md)

描述: 聚合阶段。限制输出到下一阶段的记录数。

### [Aggregate.lookup(object: Object): Aggregate](./stages/lookup.md)

描述: 聚合阶段。联表查询。与同个数据库下的一个指定的集合做 left outer join(左外连接)。对该阶段的每一个输入记录，lookup 会在该记录中增加一个数组字段，该数组是被联表中满足匹配条件的记录列表。lookup 会将连接后的结果输出给下个阶段。

### [Aggregate.match(object: Object): Aggregate](./stages/match.md)

描述: 聚合阶段。根据条件过滤文档，并且把符合条件的文档传递给下一个流水线阶段。

### [Aggregate.project(object: Object): Aggregate](./stages/project.md)

描述: 聚合阶段。把指定的字段传递给下一个流水线，指定的字段可以是某个已经存在的字段，也可以是计算出来的新字段。

### [Aggregate.replaceRoot(object: Object): Aggregate](./stages/replaceRoot.md)

描述: 聚合阶段。指定一个已有字段作为输出的根节点，也可以指定一个计算出的新字段作为根节点。

### [Aggregate.sample(size: number): Aggregate](./stages/sample.md)

描述: 聚合阶段。随机从文档中选取指定数量的记录。

### [Aggregate.skip(value: number): Aggregate](./stages/skip.md)

描述: 聚合阶段。指定一个正整数，跳过对应数量的文档，输出剩下的文档。

### [Aggregate.sort(object: Object): Aggregate](./stages/sort.md)

描述: 聚合阶段。根据指定的字段，对输入的文档进行排序。

### [Aggregate.sortByCount(object: Object): Aggregate](./stages/sortByCount.md)

描述: 聚合阶段。根据传入的表达式，将传入的集合进行分组（group）。然后计算不同组的数量，并且将这些组按照它们的数量进行排序，返回排序后的结果。

### [Aggregate.unwind(value: string|object): Aggregate](./stages/unwind.md)

描述: 聚合阶段。使用指定的数组字段中的每个元素，对文档进行拆分。拆分后，文档会从一个变为一个或多个，分别对应数组的每个元素。

### [Aggregate.bucket(object: Object): Aggregate](./stages/bucket.md)

描述: 聚合阶段。将输入记录根据给定的条件和边界划分成不同的组，每组即一个 bucket。

### [Aggregate.bucketAuto(object: Object): Aggregate](./stages/bucketAuto.md)

描述: 聚合阶段。将输入记录根据给定的条件划分成不同的组，每组即一个 bucket。与 bucket 的其中一个不同之处在于无需指定 boundaries，bucketAuto 会自动尝试将记录尽可能平均的分散到每组中。

### [Aggregate.count(fieldName: string): Aggregate](./stages/count.md)

描述: 聚合阶段。计算上一聚合阶段输入到本阶段的记录数，输出一个记录，其中指定字段的值为记录数。

### [Aggregate.end(): Promise\<Object\>](./stages/end.md)

描述: 标志聚合操作定义完成，发起实际聚合操作。

### [Aggregate.geoNear(options: Object): Aggregate](./stages/geoNear.md)

描述: 聚合阶段。将记录按照离给定点从近到远输出。

### [Aggregate.group(object: Object): Aggregate](./stages/group.md)

描述: 聚合阶段。将输入记录按给定表达式分组，输出时每个记录代表一个分组，每个记录的 \_id 是区分不同组的 key。输出记录中也可以包括累计值，将输出字段设为累计值即会从该分组中计算累计值。

### [Aggregate.limit(value: number): Aggregate](./stages/limit.md)

描述: 聚合阶段。限制输出到下一阶段的记录数。

### [Aggregate.lookup(object: Object): Aggregate](./stages/lookup.md)

描述: 聚合阶段。描述: 聚合阶段。联表查询。与同个数据库下的一个指定的集合做 left outer join(左外连接)。对该阶段的每一个输入记录，lookup 会在该记录中增加一个数组字段，该数组是被联表中满足匹配条件的记录列表。lookup 会将连接后的结果输出给下个阶段。

### [Aggregate.match(object: Object): Aggregate](./stages/match.md)

描述: 聚合阶段。根据条件过滤文档，并且把符合条件的文档传递给下一个流水线阶段。

### [Aggregate.project(object: Object): Aggregate](./stages/project.md)

描述: 聚合阶段。把指定的字段传递给下一个流水线，指定的字段可以是某个已经存在的字段，也可以是计算出来的新字段。

### [Aggregate.replaceRoot(object: Object): Aggregate](./stages/replaceRoot.md)

描述: 聚合阶段。指定一个已有字段作为输出的根节点，也可以指定一个计算出的新字段作为根节点。

### [Aggregate.sample(size: number): Aggregate](./stages/sample.md)

描述: 聚合阶段。随机从文档中选取指定数量的记录。

### [Aggregate.skip(value: number): Aggregate](./stages/skip.md)

描述: 聚合阶段。指定一个正整数，跳过对应数量的文档，输出剩下的文档。

### [Aggregate.sort(object: Object): Aggregate](./stages/sort.md)

描述: 聚合阶段。根据指定的字段，对输入的文档进行排序。

### [Aggregate.sortByCount(object: Object): Aggregate](./stages/sortByCount.md)

描述: 聚合阶段。根据传入的表达式，将传入的集合进行分组（group）。然后计算不同组的数量，并且将这些组按照它们的数量进行排序，返回排序后的结果。

### [Aggregate.unwind(value: string|object): Aggregate](./stages/unwind.md)

描述: 聚合阶段。使用指定的数组字段中的每个元素，对文档进行拆分。拆分后，文档会从一个变为一个或多个，分别对应数组的每个元素。
