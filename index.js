import '@logseq/libs'
import Vue from 'vue'
import App from './src/App.vue'

async function showQuickCapture () {
  // eslint-disable-next-line no-undef
  logseq.showMainUI()
}

export const callSettings = () => {
  const settings = [
    {
      key: 'defaultBlock',
      type: 'string',
      default: '',
      description: 'The default block on the Daily Notes Page where the new items it put below.',
      title: 'Default Block'
    },
    {
      key: 'prefix',
      type: 'string',
      default: '',
      description: 'Adds an automatic prefix to notes',
      title: 'Prefix'
    },
    {
      key: 'timeStamp',
      type: 'boolean',
      default: false,
      description: 'Prepend a time stamp to the entry entered',
      title: 'Prepend a time stamp'
    }
  ]
  // eslint-disable-next-line no-undef
  logseq.useSettingsSchema(settings)
}

function main () {
  callSettings()

  // eslint-disable-next-line no-unused-vars
  const app = new Vue({
    el: '#app',
    render: (h) => h(App)
  })

  // eslint-disable-next-line no-undef
  logseq.provideModel({
    handleShowQuickCapture () {
      showQuickCapture()
    }
  })

  // eslint-disable-next-line no-undef
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-quick-capture',
    template: `
      <span class="logseq-quick-capture">
        <a title="Quick Capture (q c)" class="button" data-on-click="handleShowQuickCapture">
          <i class="ti ti-pencil"></i>
        </a>
      </span>
    `
  })
  // eslint-disable-next-line no-undef
  logseq.App.registerCommandPalette(
    {
      key: 'logseq-quick-capture',
      label: 'Show Quick Capture',
      keybinding: {
        mode: 'non-editing',
        binding: 'q c'
      }
    },
    () => {
      showQuickCapture()
    }
  )
}

// eslint-disable-next-line no-undef
logseq.ready(main).catch(console.error)
