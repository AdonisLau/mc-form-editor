import { error, isEmptyValue, getJsonValue } from './utils';

const Editor = require('./lib/wangeditor').wangEditor;

/**
 * input组件
 */
export default {
  name: 'McEditor',

  props: {
    state: {
      type: Object,
      required: true
    },

    config: {
      type: Object,
      required: true
    },

    value: {
      type: null,
      required: true
    },

    rules: {
      type: Object
    },

    gutter: {
      type: Number
    },

    getRequest: {
      type: Function
    }
  },

  computed: {
    hidden() {
      return this.config.ui.hidden(this.state);
    },

    disabled() {
      return this.config.ui.disabled(this.state);
    },

    readonly() {
      return this.config.ui.readonly(this.state);
    }
  },

  watch: {
    value() {
      // 来自自身的emit 不做修改 避免二次渲染
      if (this._equal) {
        return;
      }

      this.setValue();
    },

    disabled: 'setEditable',

    readonly: 'setEditable'
  },

  render(h) {
    if (this.hidden) {
      return null;
    }

    let { ui, field, label } = this.config;

    return (
      <el-col
        span={ ui.column }>
        <el-form-item prop={ field } labelWidth={ui.labelWidth} label={ label } class="mc-form-item" ref="item">
          <div ref="editor" key="editor"></div>
        </el-form-item>
      </el-col>
    );
  },

  methods: {
    handleFiles(files, insert) {
      for (let i = 0, len = files.length; i < len; i++) {
        let file = files[i];

        this.Q.push({
          file,
          insert
        });
      }

      this.dequeue();
    },

    dequeue() {
      if (this.I >= this.L || !this.Q.length) {
        return;
      }

      this.I++;

      this.upload(this.Q.shift());
    },

    upload({ file, insert }) {
      let config = this.config.editor;

      if (!config.uploadURL) {
        return error('editor.uploadURL is required');
      }

      let data = config.data;
      let formData = new FormData();

      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      formData.append(config.uploadFileName, file);

      let request = this.getRequest();

      request.post(config.uploadURL, formData)
        .then(res => {
          insert(getJsonValue(res, config.path));
        })
        .catch(e => this.$message.error(e.message))
        .then(_ => {
          this.I--;
          this.dequeue();
        });
    },

    setValue() {
      this.editor.txt.html(isEmptyValue(this.value) ? '' : this.value);
    },

    setEditable() {
      let editable = !(this.disabled || this.readonly);

      this.editor.$textElem.attr('contenteditable', editable);
    },

    notice(value) {
      this._equal = true;
      this.$emit('input', value);

      let component = this.$refs.item;

      component.$emit('el.form.change');

      this.$nextTick(_ => (this._equal = false));
    }
  },

  created() {
    this.Q = [];
    this.L = 2;
    this.I = 0;
    this._equal = false;
  },

  mounted() {
    let config = this.config.editor;
    let editor = this.editor = new Editor(this.$refs.editor);
    let customConfig = editor.customConfig;

    customConfig.menus = config.menus;
    customConfig.colors = config.colors;
    customConfig.zIndex = config.zIndex;
    customConfig.uploadImgMaxSize = config.uploadImgMaxSize;
    customConfig.uploadImgShowBase64 = config.uploadImgShowBase64;
    customConfig.customUploadImg = (files, insert) => {
      this.handleFiles(files, insert);
    };
    customConfig.onchange = html => {
      // 这里做一下空值处理 不怎么严谨
      if (html === '<p><br></p>') {
        html = '';
      }

      this.notice(html);
    };

    customConfig.onblur = _ => {
      let component = this.$refs.item;

      component.$emit('el.form.blur');
    };

    editor.create();

    this.setValue();
    this.setEditable();
  }
};
