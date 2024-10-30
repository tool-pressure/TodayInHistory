import json
import os
from datetime import datetime
import uuid
import hashlib

# 你的命名空间（使用 UUID 格式的字符串）
NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, 'ecg-cms')
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/generate_markdown', methods=['POST'])
def generate_markdown():
    try:
        # 从请求中获取 JSON 数据
        course_json = request.json
        if not course_json or 'course' not in course_json:
            return jsonify({"error": "Invalid input"}), 400

        # 获取当前时间并格式化
        current_date = datetime.utcnow().isoformat() + 'Z'

        # 生成 Markdown 文档
        filenames = []
        course_name = course_json['course_name']
        item = course_json['course']

        # 获取课程信息
        chapter = item['info']['chapter']
        title = item['info']['title']
        subtitle = item['info']['subtitle']
        course_content = item['course'].replace('\\n', '\n')
        
        filenametemp = f"{title}-{subtitle}"
        hash_value = hashlib.sha1(filenametemp.encode('utf-8')).digest()
        filenameuuid = str( uuid.uuid5(NAMESPACE, hash_value))
        # 定义 Markdown 文件名
        filename = f"{filenameuuid}.md"
        
        # Markdown 文档内容
        markdown_content = f"""---
title: {course_name}-{title}-{subtitle}
description: {course_name}-{title}-{chapter}-{subtitle}
date: '{current_date}'
---
{course_content}
"""

        # 保存 Markdown 文件
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        filenames.append(filename)
        
        return jsonify({"message": "Markdown files generated", "files": filenames}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
