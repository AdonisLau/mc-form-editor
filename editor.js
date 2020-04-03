import { isEmptyValue, getJsonValue } from './utils';

const Editor = require('./lib/wangeditor');

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
    },

    uploadURL() {
      let config = this.config.editor;

      return config.action || config.uploadURL;
    }
  },

  watch: {
    value() {
      // 来自自身的emit 不做修改 避免二次渲染
      if (this.equal) {
        return;
      }

      this.setValue();
    },

    disabled: 'setEditable',

    readonly: 'setEditable',

    hidden: {
      immediate: true,
      handler(hidden) {
        !hidden && this.$nextTick(this.init);
      }
    }
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
      let uploadURL = this.uploadURL;

      let config = this.config.editor;
      let formData = new FormData();

      let data = config.data;

      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      formData.append(config.uploadFileName, file);

      let promise = null;

      if (config.request) {
        promise = config.request(formData);
      } else {
        promise = this.getRequest().post(uploadURL, formData);
      }

      promise
        .then(res => {
          let ret = config.onSuccess(res);

          if (!ret.success) {
            return Promise.reject(new Error(ret.message));
          }

          insert(!config.path ? res : getJsonValue(res, config.path));
        })
        .catch(e => this.$message.error(e.message))
        .then(_ => {
          this.I--;
          this.dequeue();
        });
    },

    setValue() {
      if (!this.editor) {
        return;
      }

      this.tiggerValidate('el.form.change');
      this.editor.txt.html(isEmptyValue(this.value) ? '' : this.value);
    },

    setEditable() {
      if (!this.editor) {
        return;
      }

      let editable = !(this.disabled || this.readonly);

      this.editor.$textElem.attr('contenteditable', editable);
    },

    tiggerValidate(name) {
      this.$refs.item.$emit(name);
    },

    notice(value) {
      this.equal = true;
      this.$emit('input', value);
      this.$emit('change', value);

      this.tiggerValidate('el.form.change');

      this.$nextTick(_ => (this.equal = false));
    },

    init() {
      let node = this.$refs.editor;

      if (this.editor) {
        if (!node.querySelector('div')) {
          node.appendChild(this.editor.dom);
        }

        return;
      }

      let config = this.config.editor;
      let dom = document.createElement('div');
      let editor = this.editor = new Editor(dom);
      let customConfig = editor.customConfig;

      editor.dom = dom;

      node.appendChild(dom);

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

      customConfig.onblur = v => {
        this.$emit('blur', v);
        this.tiggerValidate('el.form.blur');
      };

      customConfig.onfocus = v => {
        this.$emit('focus', v);
      };

      editor.create();

      this.setValue();
      this.setEditable();
    },

    clear() {
      this.editor = null;
    }
  },

  created() {
    this.L = 2;
    this.I = 0;
    this.Q = [];
    this.equal = false;
  }
};
