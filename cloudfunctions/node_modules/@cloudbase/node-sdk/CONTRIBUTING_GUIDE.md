# 开发指南

## 提交 Merge Request 的正确姿势

### 1、Rebase master
提交 MR 之前，请先做 rebase：

```
git fetch origin master
git rebase origin/master
```

如果有冲突，解决冲突，git add 之后：

```
git rebase --continue
```

重复上述流程直到 rebase 完毕


### 2、整理 commits

然后检查所有 commit 是否符合以下格式：

```
[模块]: [标题]
```

比如：

```
test: add test for xxx
database: 升级依赖库
```

如果不符合，请使用：

#### 修改最近一个 commit 的信息

```
git commit --amend
```

#### 把多个 commit 合并为一个或几个

```
git rebase -i origin/master 
```
接下来操作可以参考：https://juejin.im/entry/5ae9706d51882567327809d0

### 3、Push

如果已经做过 rebase，那么无法直接 push，需要使用 `-f` 参数

```
git push origin -f
```