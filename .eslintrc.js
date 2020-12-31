module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "airbnb-base",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        'prettier/prettier': ['error', { singleQuote: true }],
        'import/extensions': 'off',
        '@typescript/interface-name-prefix' : 'off'
    }
};
