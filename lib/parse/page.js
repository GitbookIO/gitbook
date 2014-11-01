var _ = require('lodash');
var kramed = require('kramed');
var hljs = require('highlight.js');

var lex = require('./lex');
var renderer = require('./renderer');

var include = require('./include');
var lnormalize = require('../utils/lang').normalize;



// Render a section using our custom renderer
function render(section, _options) {
    // Copy section
    var links = section.links || {};
    section = _.toArray(section);
    section.links = links;

    // Build options using defaults and our custom renderer
    var options = _.extend({}, kramed.defaults, {
        renderer: renderer(null, _options),

        // Synchronous highlighting with highlight.js
        highlight: function (code, lang) {
            if(!lang) return code;

            // Normalize lang
            lang = lnormalize(lang);

            try {
                return hljs.highlight(lang, code).value;
            } catch(e) { }

            return code;
        }
    });

    return kramed.parser(section, options);
}

function quizQuestion(node) {
    if (node.text) {
        node.text = node.text.replace(/^([\[(])x([\])])/, "$1 $2");
    } else {
        return node.replace(/^([\[(])x([\])])/, "$1 $2");
    }
}

function parsePage(page, options) {
    options = options || {};

    // Lex if not already lexed
    page.lexed = (_.isArray(page.content) ? page.content : lex(include(page.content, options.includer || function() { return undefined; })))
    return page.lexed
    .map(function(section) {
        // Transform given type
        if(section.type === 'exercise') {
            var nonCodeNodes = _.reject(section, {
                'type': 'code'
            });

            var codeNodes = _.filter(section, {
                'type': 'code'
            });

            // Languages in code blocks
            var langs = _.pluck(codeNodes, 'lang').map(lnormalize);

            // Check that they are all the same
            var validLangs = _.all(_.map(langs, function(lang) {
                return lang && lang === langs[0];
            }));

            // Main language
            var lang = validLangs ? langs[0] : null;

            return {
                id: section.id,
                type: section.type,
                content: render(nonCodeNodes, options),
                lang: lang,
                code: {
                    base: codeNodes[0].text,
                    solution: codeNodes[1].text,
                    validation: codeNodes[2].text,
                    // Context is optional
                    context: codeNodes[3] ? codeNodes[3].text : null,
                }
            };
        } else if (section.type === 'quiz') {
            var quiz = [], question, foundFeedback = false;
            var nonQuizNodes = section[0].type === 'paragraph' && section[1].type !== 'list_start' ? [section[0]] : [];
            var quizNodes = section.slice(0);
            quizNodes.splice(0, nonQuizNodes.length);

            for (var i = 0; i < quizNodes.length; i++) {
                var node = quizNodes[i];

                if (question && (((node.type === 'list_end' || node.type === 'blockquote_end') && i === quizNodes.length - 1)
                                 || node.type === 'table' || (node.type === 'paragraph' && !foundFeedback))) {
                    quiz.push({
                        base: render(question.questionNodes, options),
                        solution: render(question.solutionNodes, options),
                        feedback: render(question.feedbackNodes, options)
                    });
                }

                if (node.type === 'table' || (node.type === 'paragraph' && !foundFeedback)) {
                    question = { questionNodes: [], solutionNodes: [], feedbackNodes: [] };
                }

                if (node.type === 'blockquote_start') {
                    foundFeedback = true;
                } else if (node.type === 'blockquote_end') {
                    foundFeedback = false;
                }

                if (node.type === 'table') {
                    question.solutionNodes.push(_.cloneDeep(node));
                    node.cells = node.cells.map(function(row) {
                        return row.map(quizQuestion);
                    });
                    question.questionNodes.push(node);
                } else if (!/blockquote/.test(node.type)) {
                    if (foundFeedback) {
                        question.feedbackNodes.push(node);
                    } else if (node.type === 'paragraph' || node.type === 'text'){
                        question.solutionNodes.push(_.cloneDeep(node));
                        quizQuestion(node);
                        question.questionNodes.push(node);
                    } else {
                        question.solutionNodes.push(node);
                        question.questionNodes.push(node);
                    }
                }
            }

            return {
                id: section.id,
                type: section.type,
                content: render(nonQuizNodes, options),
                quiz: quiz
            };
        }

        // Render normal pages
        return {
            id: section.id,
            type: section.type,
            content: render(section, options)
        };
    });
}

// Exports
module.exports = parsePage;
