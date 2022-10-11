module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es2021": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 12
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"windows"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-var": [
			"error"
		],
		"no-undef": [
			"off"
		],
		"no-unused-vars": [
			"off"
		],
		"no-control-regex": [
			"off"
		],
		"no-constant-condition": [
			"error",
			{
				"checkLoops": false
			}
		]
	}
};
