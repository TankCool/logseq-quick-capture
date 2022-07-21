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
      <button class="w-6 h-6 btn-close bg-red-600" @click.stop="cancelCapture">
        Cancel
      </button>
      <button class="w-12 h-12 btn-submit bg-green-600"  @click.stop="submitContent">
        OK
      </button>
    </modal>
  </div>
</template>
<script>
import moment from 'moment'
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
    async submitContent () {
      // console.log("submitContent")
      const journalDay = moment().format('YYYYMMDD')
      let ret
      try {
        // eslint-disable-next-line no-undef
        ret = await logseq.DB.datascriptQuery(`
          [:find (pull ?p [*])
            :where
            [?b :block/page ?p]
            [?p :block/journal? true]
            [?p :block/journal-day ?d]
            [(= ?d ${journalDay})]]
        `)
      } catch (e) {
        console.error(e)
      }
      ret = (ret || []).flat()
      if (ret && ret.length > 0) {
        const journalName = ret[0].name
        // eslint-disable-next-line no-undef
        const page = await logseq.Editor.getPage(journalName)
        if (page) {
          if (this.content) {
            this.$refs.contentRef.blur()
            // eslint-disable-next-line no-undef
            const append = await logseq.Editor.appendBlockInPage(
              page.uuid,
              this.content
            )
            // console.log(append)
            if (append?.content === this.content) {
              // eslint-disable-next-line no-undef
              logseq.UI.showMsg('Quick Capture Success.')
              setTimeout(() => {
                this.content = ''
                // eslint-disable-next-line no-undef
                logseq.hideMainUI()
              }, 200)
            }
          } else {
            // eslint-disable-next-line no-undef
            logseq.UI.showMsg('Nothing to capture.')
          }
        }
      }
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
  position: absolute;
  max-width: 600px;
  min-width: 400px;
  left: 0;
  right: 0;
  top: 25%;
  margin: 0 auto;
}
.modal-wrapper textarea {
  resize: none;
  padding: 10px;
  outline: none;
  border-radius: 6px;
  height: 160px;
}
.btn-close {
  position: absolute;
  right: 80px;
  bottom: 15px;
  color: #f7f7f7;
  width: 60px;
  height: 30px;
  border-radius: 5px;
}
.btn-submit {
  position: absolute;
  right: 10px;
  bottom: 15px;
  color: #f7f7f7;
  width: 60px;
  height: 30px;
  border-radius: 5px;
}
</style>
