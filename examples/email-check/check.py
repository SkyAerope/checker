import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 启用跨域支持，允许前端访问

@app.route("/", methods=["POST"])
def check_email():
    """
    检查邮箱的 API 端点
    """
    try:
        data = request.get_json()
        
        if data is None:
            return jsonify({
                "status": "unknown",
                "detail": "后端接收不到邮箱数据"
            })

        email = data.get("data", "")
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, email):
            status = "valid"
            detail = "邮箱格式正确"
        else:
            status = "invalid"
            detail = "邮箱格式不符合标准"

        return jsonify({
            "status": status,
            "detail": detail
        })
    
    except Exception as e:
        return jsonify({
            "status": "unknown",
            "detail": f"服务器错误: {str(e)}"
        }), 500


@app.route("/health", methods=["GET"])
def health_check():
    """健康检查端点"""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    print("邮箱验证服务已启动")
    print(f"API 地址: http://localhost:{os.getenv('PORT', 5000)}/")
    print("使用 POST 请求发送 JSON 数据: {\"data\": \"your-email@example.com\"}")
    app.run(host="0.0.0.0", port=os.getenv('PORT', 5000), debug=True)
