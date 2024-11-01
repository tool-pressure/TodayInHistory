const express = require('express');
const fs = require('fs');
const path = require('path');
const { v5: uuidv5 } = require('uuid');
const crypto = require('crypto');
const app = express();
const PORT = 5001;
// 你的命名空间（使用 UUID 格式的字符串）
const NAMESPACE = uuidv5('ecg-cms', uuidv5.DNS);

function toBeijingISOString(date = new Date()) {
    // 获取当前时间的 UTC 时间毫秒数
    const utcMilliseconds = date.getTime();
    // 加上 8 小时的毫秒数，转换为北京时间
    const beijingMilliseconds = utcMilliseconds + (8 * 60 * 60 * 1000);
    // 创建新的 Date 对象，表示北京时间
    const beijingDate = new Date(beijingMilliseconds);
    // 返回 ISO 字符串，手动添加 '+08:00'
    const isoString = beijingDate.toISOString().replace('Z', '+08:00');
    console.log(isoString);
    return isoString;
}
// 生成 Markdown 文档的函数
const generateMarkdown = (course_name, title, chapter, subtitle, course) => {
    const convertUnicode = (str) => JSON.parse('"' + str + '"');
    // 获取当前时间并格式化
    const currentDate = toBeijingISOString();

    // 转换参数中的 Unicode 编码
    const convertedCourseName = convertUnicode(course_name);
    const convertedTitle = convertUnicode(title);
    const convertedSubtitle = convertUnicode(subtitle);
    let coursetemp = course;
    try {
        coursetemp = convertUnicode(course)
    } catch (error) {
        console.log(error)
    }


    return `---
title: ${convertedTitle}-${convertedSubtitle}
description: ${convertedCourseName} - ${convertedTitle}-${chapter}-${convertedSubtitle}
date: '${currentDate}'
---
${coursetemp}
`;
};



// 中间件，用于解析 JSON 请求体
app.use(express.json());

// 创建 API 接口
app.post('/generate_markdown', (req, res) => {
    try {
        // 获取并解析 courseData 字符串
        const courseDataString = req.body.courseData;
        const unescapedStr = courseDataString.replace(/\\"/g, '\"');
        let unescapedStraa = unescapedStr.replace(/\\n\\n/g, 'aaaaaa')
        unescapedStraa = unescapedStraa.replace(/\\n/g, '').replace(/[\x00-\x1F]/g, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        console.log(unescapedStraa)
        // 将 JSON 字符串转换为对象
        let courseData = JSON.parse(unescapedStraa);

        // 获取课程名称
        const course_name = courseData.course_name;
        // 生成 Markdown 文件
        const { chapter, subtitle, title } = courseData.course.info;
        const courseContent = courseData.course.course.replace(/aaaaaa/g, '\n'); // 替换转义字符

        const markdown = generateMarkdown(course_name, title, chapter, subtitle, courseContent);


        const filenametemp = title + subtitle;
        const hashValue = crypto.createHash('sha1').update(filenametemp).digest();
        const filenameUuid = uuidv5(hashValue, NAMESPACE);
        const fileName = `md/${filenameUuid}.md`;

        // 将生成的 Markdown 文件保存到本地
        fs.writeFileSync(path.join(__dirname, fileName), markdown, { encoding: 'utf8' });


        res.send('Markdown 文件已生成');
    } catch (error) {
        return res.status(200).send('无效的 JSON 数据');
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器在 http://0.0.0.0:${PORT} 上运行`);
});

