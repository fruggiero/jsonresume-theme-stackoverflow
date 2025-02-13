const Handlebars = require('handlebars');
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');
const moment = require('moment');

const HELPERS = join(__dirname, 'theme/hbs-helpers');
const LANGUAGES = join(__dirname, 'theme/lang');

const { birthDate } = require(join(HELPERS, 'birth-date.js'));
const { dateHelpers } = require(join(HELPERS, 'date-helpers.js'));
const { paragraphSplit } = require(join(HELPERS, 'paragraph-split.js'));
const { toLowerCase } = require(join(HELPERS, 'to-lower-case.js'));
const { spaceToDash } = require(join(HELPERS, 'space-to-dash.js'));

const { MY, Y, DMY } = dateHelpers;
let currentLanguage = "en";

Handlebars.registerHelper('birthDate', birthDate);
Handlebars.registerHelper('MY', MY);  // Date: Month year eg. "Jul 2020"
Handlebars.registerHelper('Y', Y);  // Date: Year eg. "2020"
Handlebars.registerHelper('DMY', DMY);
Handlebars.registerHelper('paragraphSplit', paragraphSplit);
Handlebars.registerHelper('toLowerCase', toLowerCase);
Handlebars.registerHelper('spaceToDash', spaceToDash);
Handlebars.registerHelper('translate', function (key) {
  return currentLanguage?.[key] ?? key;
});

function render(resume) {
  if (resume.meta?.language) {
    const path = join(LANGUAGES, `${resume.meta.language}.js`);
    if (existsSync(path)) {
      const {lang, momentLocale} = require(path);
      currentLanguage = lang;
      moment.locale(momentLocale);
    }
  }

  const css = readFileSync(`${__dirname}/style.css`, 'utf-8');
  const template = readFileSync(`${__dirname}/resume.hbs`, 'utf-8');
  const partialsDir = join(__dirname, 'theme/partials');
  const filenamePartial = readdirSync(partialsDir);

  filenamePartial.forEach((filenamePartial) => {
    const matches = /^([^.]+).hbs$/.exec(filenamePartial);
    if (!matches) return;
    const name = matches[1];
    const filepath = join(partialsDir, filenamePartial);
    const template = readFileSync(filepath, 'utf8');
    Handlebars.registerPartial(name, template);
  });

  return Handlebars.compile(template)({
    css,
    resume,
  });
}

const marginValue = '0.8 cm';
const pdfRenderOptions = {
  margin: {
    top: marginValue,
    bottom: marginValue,
    left: marginValue,
    right: marginValue,
  }
}

module.exports = { render, pdfRenderOptions };
