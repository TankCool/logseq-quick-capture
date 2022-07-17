import "@logseq/libs";
import Vue from "vue";
import App from "./src/App.vue";

async function showQuickCapture() {
  logseq.showMainUI();
}

function main() {
  const app = new Vue({ el: "#app", render: (h) => h(App) });

  logseq.provideModel({
    handleShowQuickCapture() {
      showQuickCapture();
    },
  });

  logseq.App.registerUIItem("toolbar", {
    key: "logseq-quick-capture",
    template: `
      <span class="logseq-quick-capture">
        <a title="Quick Capture (q c)" class="button" data-on-click="handleShowQuickCapture">
          <i class="ti ti-pencil"></i>
        </a>
      </span>
    `,
  });
  logseq.App.registerCommandPalette(
    {
      key: "logseq-quick-capture",
      label: "Show Quick Capture",
      keybinding: {
        mode: "non-editing",
        binding: "q c",
      },
    },
    () => {
      showQuickCapture();
    }
  );
}

logseq.ready(main).catch(console.error);
