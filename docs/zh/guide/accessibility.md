# 无障碍与定位

## 键盘导航

| 区域 | 按键 |
|------|------|
| 标签栏 | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> 在字段间移动，<kbd>Home</kbd> / <kbd>End</kbd> 跳到首个或末个 |
| 网格单元 | <kbd>Click</kbd> 切换选中，<kbd>Shift</kbd>+<kbd>Click</kbd> 选中自上次点击单元起的整段范围 |
| 内联选择器 | <kbd>↑</kbd> <kbd>↓</kbd> 高亮，<kbd>Enter</kbd> / <kbd>Space</kbd> 选择，<kbd>Esc</kbd> 关闭 |
| 数字微调器 | <kbd>↑</kbd> <kbd>↓</kbd> 增减 |
| 弹出面板 | 聚焦输入框展开面板，<kbd>Esc</kbd> 关闭 |

弹出面板在打开期间会注册 document 级的 <kbd>Esc</kbd> 处理，因此无论当前焦点落在哪个
内部控件上都能关闭。

## 角色与属性

| 元素 | ARIA |
|------|------|
| 标签栏 | `role="tablist"`，标签带 `aria-selected` |
| 网格单元 | `<button>` 带 `aria-pressed` 反映选中态，并用 `title` 提供取值标签 |
| 字段单选项列表 | `role="radiogroup"` 配合真实 radio 输入，屏幕阅读器会朗读每个模式 |
| 日期单选项列表 | radio 输入共享由 Vue `useId()` 生成的 `name`，同页多个选择器也不会串组 |
| 图标 | `aria-hidden="true"` —— 它们只是装饰，含义由相邻文本承载 |

由于底层控件是原生 button、radio 与 input，组件无需额外的按键处理即可配合常见的浏览器
与辅助技术导航。

## 响应式行为

面板主体是 CSS Grid。在 `640px` 以下：

- 字段/预览网格折叠为单列
- 预览区移动到编辑器下方，分隔线由左边框改为上边框
- 标签栏横向滚动（`overflow-x: auto`），而不是把标签挤压变形

## 弹出面板自动定位

弹出面板与内联选择器下拉框会在展开前测量视口可用空间：

| 行为 | 规则 |
|------|------|
| 垂直翻转 | 若面板高度大于触发器下方空间，且上方空间更充裕，则向上展开 |
| 水平偏移 | 若面板会溢出右边缘，则按其溢出量向左偏移 |
| 边界钳制 | 面板与视口任一边缘的距离不小于 `8px` |
| 间距 | 触发器与面板之间为 `4px` |
| 动态重定位 | 面板打开期间，窗口滚动与尺寸变化时重新计算位置 |

该计算位于 `calcPlacement`，并从包的源码中导出以便复用；它接收锚点矩形、面板尺寸以及
可选的视口尺寸，返回 `{ top, left, flipUp }`。

## 减弱动效

过渡动画使用 `--cron-transition-duration` 与 `--cron-transition-easing` 自定义属性。
若要尊重"减弱动效"偏好，在自己的样式表里把时长设为 `0ms`：

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --cron-transition-duration: 0ms;
  }
}
```
