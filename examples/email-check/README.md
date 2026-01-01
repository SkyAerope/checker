# 邮箱合法性检查

[check.py](./check.py)是一个后端示例，它使用正则表达式来检查邮箱的合法性。

## 运行
```bash
uv run check.py
```

服务端会运行在`http://localhost:5000`。如果你设置了`PORT`环境变量，那么服务端会运行在`http://localhost:${PORT}`。

## 使用curl测试
```bash
curl -X POST http://localhost:5000/ -H "Content-Type: application/json" -d '{"data": "test@example.com"}'
```

## 漏洞
这个示例会将连续的点号、首尾的点号、@后的点号都视作合法的邮箱。
具体来说，它会把这些判定为合法：
```
email..email@example.com
.email@example.com
email.@example.com
email@.example.com
```