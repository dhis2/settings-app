require('import-export');

const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { i18nextToPot } = require('i18next-conv');
const recursive = require('recursive-readdir');

const argv = require('minimist')(process.argv.slice(2));

const filename = argv.o || 'en.pot';

const settingsKeyMapping = require('./src/settingsKeyMapping.js');
const { categories } = require('./src/settingsCategories.js');

const JS_FUNCTION_REGEX = new RegExp("i18next.t\\('(.*)'\\)", 'g');

const getFileExtension = filename => filename.split('.').pop();

// save file to disk
const save = target => (result) => {
    writeFileSync(target, result);
};

const translations = {};
const addKeysFromFileContent = (fileContent, functionRegex) => {
    let matches;
    while ((matches = functionRegex.exec(fileContent))) {
        if (matches[1]) {
            translations[matches[1]] = '';
        }
    }
};

const addKeysFromConfigObject = (config) => {
    for (const property in config) {
        if (config.hasOwnProperty(property)) {
            const configSection = config[property];

            if (configSection.label) {
                translations[configSection.label] = '';
            }

            if (configSection.pageLabel) {
                translations[configSection.pageLabel] = '';
            }

            if (configSection.hintText) {
                translations[configSection.hintText] = '';
            }

            if (configSection.emptyLabel) {
                translations[configSection.emptyLabel] = '';
            }

            if (configSection.searchLabels) {
                for (const label in configSection.searchLabels) {
                    translations[label] = '';
                }
            }

            if (configSection.options) {
                for (const option in configSection.options) {
                    translations[configSection.options[option]] = '';
                }
            }
        }
    }
};

recursive('src', (err, files) => {
    for (const file of files) {
        const fileExtension = getFileExtension(file);
        if (fileExtension === 'js') {
            addKeysFromFileContent(readFileSync(file, 'utf-8'), JS_FUNCTION_REGEX);
        }
    }

    addKeysFromConfigObject(settingsKeyMapping);
    addKeysFromConfigObject(categories);

    if (!existsSync('i18n/')) {
        mkdirSync('i18n/');
    }

    i18nextToPot('en', JSON.stringify(translations)).then(save(`i18n/${filename}`));
});
