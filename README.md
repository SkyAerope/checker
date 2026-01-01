## 这是什么？
这个仓库里只有一个前端，需要配合合适的后端使用。它可以用来检查一些数据。
这里的代码大部分是LLM写的，但是`README.md`是我手写的，可以放心看。

## 怎样的数据？
怎样的数据都可以。数据可以是一个或者多个。如果你有很多个，那么每行一个。

比如，假设你想检查邮箱的合法性
> 事实上，检查邮箱合法性的逻辑很简单，通常可以直接在前端完成。这里为了教学目的才做成前端+后端的形式。

并且，你有一些测试数据
```
test@example.com
user.name@domain.com
user+tag@gmail.com
admin@internal.corp
invalid-email.com
@missing-user.com
user@missing-tld
user@domain..com
spaces in@email.com
```

你可以自行编写一个后端，接着在设置中输入这个后端的地址，然后数据输入到`输入`框中，点击“开始”按钮，所有的邮箱就会一个个被检查。

## 如何编写后端？

可以用任意语言编写后端，至少需要暴露一个HTTP接口。
这个接口需要接收POST请求，请求体为JSON，格式如下：
```json
{
    "data": "test@example.com"
}
```
后端需要返回JSON，格式如下：
```json
{
    "status": "valid" | "invalid" | "unknown",
    "detail": "" // 可选
}
```

可选：后端还可以暴露一个`/health`接口用于检测连接。此接口需接收GET请求并返回`200`状态码。

Python示例代码可以参考[examples/email-check](./examples/email-check)。

## 前端的行为
当点击`开始`按钮时，前端会：

```
对于每一行数据：
    发送一个POST请求到后端来检查
    根据后端的响应，将数据分类放到`有效`, `无效`, `未知`三个框中
    可选：如果后端还返回了一些详细信息，则会显示在原数据下方
    在数据输入框删除这行
```
