# mc-form富文本编辑器组件

```shell
npm install mc-form-editor -S
```

# 用法

```javascript
import Vue from 'vue';
import McFormEditor from 'mc-form-editor';
import McForm, { installComponent } from 'mc-form';

installComponent(McFormEditor);

Vue.component(McForm.name, McForm);
```