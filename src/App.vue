<template>
  <div id="wrapper" @click="hideCapture">
    <modal class="modal-wrapper">
      <textarea
        class="w-24 min-w-full h-24 min-h-full"
        :style="textAreaStyle"
        v-model="content"
        ref="contentRef"
        @click.stop=""
      ></textarea>
      <div class="flex flex-row gap-2 p-2 justify-end">
        <button
          class="ui__button bg-red-600 hover:bg-red-700 focus:border-red-700 active:bg-red-700 text-center text-sm p-1"
          @click.stop="cancelCapture"
        >
          Cancel
        </button>
        <button
          class="ui__button bg-green-600 hover:bg-green-700 focus:border-green-700 active:bg-green-700 text-center text-sm p-1"
          @click.stop="submitContent"
        >
          OK
        </button>
      </div>
    </modal>
  </div>
</template>
<script>

const darkBgColor = '#08404f'
const lightBgColor = '#f7f7f7'
export default {
  name: 'App',
  data () {
    return {
      visible: false,
      content: '',
      themeMode: '',
      dark: {
        textArea: {
          backgroundColor: darkBgColor,
          color: lightBgColor
        }
      },
      light: {
        textArea: {
          backgroundColor: lightBgColor,
          color: darkBgColor
        }
      }
    }
  },
  computed: {
    textAreaStyle () {
      return this.themeMode === 'dark' ? this.dark.textArea : this.light.textArea
    }
  },
  mounted () {
    console.log('logseq-quick-capture loaded')
    // eslint-disable-next-line no-undef
    logseq.on('ui:visible:changed', ({ visible }) => {
      // console.log("ui:visible:changed")
      this.visible = visible
      visible &&
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.contentRef.focus()
        }, 200)
      })
    })
    // eslint-disable-next-line no-undef
    logseq.App.onThemeModeChanged(({ mode }) => {
      this.themeMode = mode
    })
    this.$nextTick(() => {
      document.removeEventListener('keydown', this.keyboardHandler)
      document.addEventListener('keydown', this.keyboardHandler)
    })
    this.init()
  },
  methods: {
    async init () {
      // eslint-disable-next-line no-undef
      const configs = await logseq.App.getUserConfigs()
      this.themeMode = configs?.preferredThemeMode
    },
    keyboardHandler (e) {
      if (this.visible && e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
        this.submitContent()
      }
      if (this.visible && e.keyCode === 27) {
        this.cancelCapture()
      }
    },
    cancelCapture () {
      this.content = ''
      this.hideCapture()
    },
    hideCapture () {
      // eslint-disable-next-line no-undef
      logseq.hideMainUI()
    },
    insertBlockAtEndOfPage: async function (content) {
      try {
        // eslint-disable-next-line no-undef
        const [page] = await logseq.DB.datascriptQuery(`
                     [:find (pull ?p [*])
                     :in $ ?start
                     :where
                     [?b :block/page ?p]
                     [?p :block/journal? true]
                     [?p :block/journal-day ?d]
                     [(= ?d ?start)]]
                     `, ':today')
        if (page && page.length > 0) {
          // eslint-disable-next-line no-undef
          return await logseq.Editor.appendBlockInPage(
            page[0].uuid,
            content
          )
        }
      } catch (e) {
        console.error(e)
      }
    },
    insertBlockBelowParentBlock: async function (parentBlock, content) {
      try {
        // eslint-disable-next-line no-undef
        let [block] = await logseq.DB.datascriptQuery(`
                     [:find (pull ?b [*])
                     :in $ ?start ?parentBlock
                     :where
                     [?b :block/page ?p]
                     [?b :block/content ?parentBlock]
                     [?p :block/journal? true]
                     [?p :block/journal-day ?d]
                     [(= ?d ?start)]]
                     `, ':today', '"' + parentBlock + '"')
        if (!block) {
          block = [await this.insertBlockAtEndOfPage(parentBlock)]
        }
        if (block && block.length > 0) {
          this.$refs.contentRef.blur()
          // eslint-disable-next-line no-undef
          return await logseq.Editor.insertBlock(
            block[0].uuid,
            content
          )
        }
      } catch (e) {
        console.error(e)
      }
    },
    async submitContent () {
      // eslint-disable-next-line no-undef
      const {
        defaultBlock,
        prefix,
        timeStamp
      } = logseq.settings
      const prependContent = this.getPrependContent(timeStamp, prefix) + this.content
      if (defaultBlock) {
        await this.insertBlockBelowParentBlock(defaultBlock, prependContent)
      } else {
        await this.insertBlockAtEndOfPage(prependContent)
      }
      setTimeout(async () => {
        this.$refs.contentRef.blur()
        this.content = ''
        // eslint-disable-next-line no-undef
        await logseq.Editor.exitEditingMode(true)
        // eslint-disable-next-line no-undef
        await logseq.hideMainUI(false)
      }, 200)
    },
    getCurrentTimeStamp () {
      const now = new Date()
      const hours = now.getHours()
      const mins = now.getMinutes()
      return (hours < 10 ? '0' + hours : hours) + ':' + (mins < 10 ? '0' + mins : mins)
    },
    isWorkflowKeywords (prefix) {
      return ['todo', 'done', 'doing', 'later', 'now'].indexOf(prefix.trim().toLowerCase()) > -1
    },
    getPrependContent (timeStamp, prefix) {
      const isKeyword = this.isWorkflowKeywords(prefix)
      const stamp = timeStamp ? this.getCurrentTimeStamp() : ''
      return isKeyword ? prefix + stamp + ' ' : stamp + ' ' + prefix
    }
  }
}
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
</style>
<style scoped>
html,
body,
#wrapper {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.modal-wrapper {
  border-radius: 6px;
  border: 1px solid #aaa;
  position: absolute;
  max-width: 600px;
  min-width: 400px;
  left: 0;
  right: 0;
  top: 25%;
  margin: 0 auto;
  background: white;
}

.modal-wrapper textarea {
  resize: none;
  padding: 10px;
  outline: none;
  border-radius: 6px;
  height: 160px;
}

.ui__button {
  --tw-text-opacity: 1;
  align-items: center;
  border-color: transparent;
  border-radius: .375rem;
  border-width: 1px;
  color: rgb(255 255 255/var(--tw-text-opacity));
  display: flex;
  font-size: .875rem;
  font-weight: 500;
  line-height: 1rem;
  padding: .5rem .75rem;
  transition-duration: .15s;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
</style>
