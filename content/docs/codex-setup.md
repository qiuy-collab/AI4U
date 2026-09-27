---
title: Codex 从下载到对话：图文配置教程
category: tutorial
date: 2026-09-27
minutes: 12
summary: 从下载 Codex 与 CC-Switch 开始，一步步配好请求地址和 API Key，跑通第一次对话，并接入非 GPT 模型的映射与本地路由。
order: 13
---

Codex 本身只是一个「对话外壳」，真正回答你问题的是它背后连着的模型服务。你可以选择官方订阅，也可以接入三方中转。

## 一、开始之前

两条路线的差别如下：

| 对比项 | 官方订阅 | 第三方中转 |
| --- | --- | --- |
| 网络 | 需要科学上网 | 国内直连 |
| 付费 | 境外银行卡或虚拟卡 | 人民币，一般扫码即可 |
| 配置 | 官网登录后即可用 | 填请求地址 + API Key |

本教程走**第三方中转**这条路线，省去网络和付款两道门槛。整条链路用到两个软件：

- **Codex**：你实际用来对话的客户端。
- **CC-Switch**：管理配置的小工具，把地址和 Key 存好，用哪套切哪套，不必手工改配置文件。

## 二、下载 Codex

打开 [Codex 官网](https://openai.com/zh-Hans-CN/codex/)，点「下载 Windows 版」。

![Codex 官网，红框处即「下载 Windows 版」](/images/docs/codex-setup/01-codex-download.png)

下载完成后，按安装向导的提示装好。

## 三、下载 CC-Switch

打开 [CC-Switch 官网](https://ccswitch.io/zh/)，下载对应系统的安装包并安装。

## 四、配置：接通模型服务

### 4.1 在 CC-Switch 里新增供应商

1. 打开 CC-Switch，点顶部的 **Codex** 图标，再点右上角的 **+**。

![点顶部 Codex 图标，再点右上角加号](/images/docs/codex-setup/02-ccswitch-entry.png)

2. 在「预设供应商」里选 **自定义配置**。

![选择「自定义配置」](/images/docs/codex-setup/03-ccswitch-custom.png)

3. 表单里几个关键字段，先认识一下：

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | 随便起，方便自己辨认 |
| API Key | 服务商给你的密钥（必填） |
| API 请求地址 | 服务商提供的接口地址（必填） |
| 默认模型 | 先填一个，之后随时能改 |
| 上游格式 | GPT 系列一般选 Responses（原生） |

![填写表单：API Key 与请求地址是必填项](/images/docs/codex-setup/04-ccswitch-form.png)

> **上游格式怎么选**：先看服务商的接口地址是不是以 `/responses` 结尾。是就选 Responses（原生），不是就换成 Chat Completions（对话补全）。

### 4.2 在中转站获取 API Key

下面以中转站 sshzyu（[sshzyu](https://sshzyu.com)）为例。

**第一步，注册并进入充值中心。** 打开网站首页，注册账号，再在左侧菜单点「充值中心」。

![sshzyu 首页](/images/docs/codex-setup/05-sshzyu-home.png)

![仪表盘左下角的充值中心入口](/images/docs/codex-setup/06-sshzyu-topup.png)

**第二步，输入兑换码。** 购买后会拿到一串兑换码。把它填进输入框，点「兑换」。

![输入兑换码后点击兑换](/images/docs/codex-setup/07-sshzyu-redeem.png)

![API 密钥页面，右上角创建密钥](/images/docs/codex-setup/08-sshzyu-apikeys.png)

> 初次体验可以只充 5 元，够跑通整个流程就行。

**第三步，创建 API 密钥。** 回到「API 密钥」页面，点「创建密钥」。

![兑换成功，余额增加](/images/docs/codex-setup/09-sshzyu-topup-done.png)

**第四步，挑分组。** 厂商选 **OpenAI**，分组按自己的需要挑一个。

![创建密钥：厂商选 OpenAI，再选分组](/images/docs/codex-setup/10-sshzyu-key-openai.png)

分组后面标的「× 0.2」，意思是按官方价格的 0.2 倍计费。所以走中转站的成本更低，具体倍率以页面显示为准。

创建后复制这串密钥，它就是你的 API Key。

> ⚠️ **安全提醒**：API Key 相当于账号密码。不要截图公开、不要发群、不要上传到公开仓库。

### 4.3 把地址和 Key 填进 CC-Switch

回到 CC-Switch，把上一步拿到的密钥和请求地址填进表单，保存后启用。

![填好请求地址与 Key 的配置](/images/docs/codex-setup/11-ccswitch-filled.png)

> ⚠️ **最容易翻车的顺序问题**：切换配置必须在**启动客户端之前**。已经在会话里再切是切不动的——配置在程序启动时就读进内存了。正确顺序是：选好配置 → 重启客户端 → 再运行。

### 4.4 打开 Codex，发第一条消息

配置保存并启用后，打开 Codex，随便发一句话试探。

![Codex 正常回复，说明配置已接通](/images/docs/codex-setup/12-codex-chat.png)

能正常回复，就说明整条链路通了。

## 五、进阶：接入非 GPT 模型

Codex 默认只认 GPT 系列。想用 DeepSeek、Kimi 这类模型，要多做两步：**模型映射**和**本地路由**。

### 5.1 申请一个国产模型密钥

回到中转站的「创建密钥」页面，厂商这一栏改选 **国产模型**，再挑对应分组。

![创建密钥：厂商改选国产模型](/images/docs/codex-setup/13-sshzyu-key-deepseek.png)

创建后复制密钥，照 4.3 的做法填进 CC-Switch。

### 5.2 配置模型映射

为什么需要映射？因为 Codex 只认自己认识的模型名。映射的作用是：**Codex 里显示一个它认识的名字，实际请求转发给你真正想用的模型。**

在配置页往下拉，找到「模型映射」，按下面填：

- 菜单显示名：`gpt-5.6-luna`
- 实际请求模型：`deepseek-v4.1-flash`

同时把「思考能力」「支持思考模式」「支持思考等级」都打开，然后保存。

![模型映射：显示名与实际请求模型分开填](/images/docs/codex-setup/14-ccswitch-mapping.png)

### 5.3 打开本地路由

本地路由是让非 GPT 模型能被 Codex 调用的开关。

回到 CC-Switch 首页，打开顶部的**本地路由**开关。

![首页顶部的本地路由开关](/images/docs/codex-setup/16-ccswitch-router.png)

> 首页找不到这个开关时，去「设置 → 路由」里打开。

打开后重启 Codex，选择刚才映射的名字（`gpt-5.6-luna`），就可以对话了。

## 六、可选：开启长上下文与远程压缩

任务涉及的代码或文档很长时，可以在 CC-Switch 的「通用配置」里打开两项：

- **1M 上下文窗口**：把压缩阈值设为 `900000`，模型一次能看的内容更多。
- **启用远程压缩**：超出部分交给服务端压缩，而不是直接丢弃。

勾选后点「应用通用配置」保存。这两项不是必须的，日常对话用不上。

## 七、常见问题

| 现象 | 先查什么 |
| --- | --- |
| 报 `401` 或 `Invalid API Key` | Key 是否复制完整、分组选得对不对 |
| 配置不生效 | 有没有重启客户端；CC-Switch 里启用的是不是当前那条 |
| 提示模型不存在 | 模型映射配了没；本地路由开了没 |
| 提示命令找不到（Windows） | 重开终端；仍无效就重装 |

排查顺序建议按 **Key → 地址 → 网络** 三步走，不要一上来就怀疑模型。

> 中转站按量计费，余额耗尽就会调用失败。用完顺手看一眼余额。
