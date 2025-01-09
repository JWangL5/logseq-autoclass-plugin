import "@logseq/libs";
import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin";

// 检查或创建页面，并设置 `class` 和继承 `icon`
async function createPageWithClassAndIcon(pageName: string, className: string) {
  // 检查页面是否存在
  const page = await logseq.Editor.getPage(pageName);
  if (!page) {
    // 创建页面
    const classPage = await logseq.Editor.getPage(className);
    if (classPage?.properties?.icon) {
        await logseq.Editor.createPage(pageName, {class: `[[${className}]]`, icon: classPage.properties.icon}, { redirect: false });
    }else{
        await logseq.Editor.createPage(pageName, {class: `[[${className}]]`}, { redirect: false });
    }
  }
}

// 监听块内容变化
async function setupBlockContentListener() {
    logseq.DB.onChanged(async ({ txData }) => {
      for (const change of txData) {
        const [entityId, attribute, value, transaction, added] = change;

        // 检测块内容变化
        if (attribute === "block/content" && added) {
          // 检查内容是否包含 `[[PageA@TypeA]]`

          const match = value.match(/\[\[(.+?)@(\w+)\]\]/);
          if (match) {
            const originalPageName = match[0]; // 原始内容，例如 [[PageA@TypeA]]
            const pageName = match[1]; // 提取 PageA
            const className = match[2]; // 提取 TypeA
            const updatedContent = value.replace(originalPageName, `[[${pageName}]]`);

            // 更新块内容
            const block = await logseq.Editor.getBlock(entityId);
            if (block) {
                await createPageWithClassAndIcon(pageName, className);
                await logseq.Editor.updateBlock(block.uuid, updatedContent);
            }
          }
        }
      }
    });
}


// 插件主函数
function main(baseInfo: LSPluginBaseInfo) {
  // logseq.UI.showMsg("AutoClass Plugin Loaded");

  // 设置监听器
  setupBlockContentListener();
}

// 初始化插件
logseq.ready(main).catch(console.error);
