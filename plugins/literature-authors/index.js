const fs = require('fs/promises');
const path = require('path');
const yaml = require('js-yaml');

module.exports = function literatureAuthorsPlugin(context) {
  return {
    name: 'literature-authors',

    async loadContent() {
      const authorsPath = path.join(context.siteDir, 'blog', 'authors.yml');
      const content = await fs.readFile(authorsPath, 'utf8');
      return yaml.load(content) ?? {};
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData({authors: content});
    },
  };
};
