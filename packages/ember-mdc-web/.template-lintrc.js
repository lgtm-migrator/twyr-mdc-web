'use strict';

module.exports = {
	plugins: ['ember-template-lint-plugin-prettier'],

	extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],

	rules: {
		'self-closing-void-elements': true
	}
};
