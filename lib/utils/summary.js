var _ = require("lodash");
var links = require("./links");

function normalizeChapters(chapterList, level, base) {
	var i = base || 0;
	return _.map(chapterList, function(chapter) {
		chapter.level = (level? [level || "", i] : [i]).join(".");
		chapter.exteral = links.isExternal(chapter.path);
		chapter.article = normalizeChapters(chapter.articles || [], chapter.level, 1);

		i = i + 1;
		return chapter;
	});
};

function normalizeSummary(summary) {
	if (_.isArray(summary)) summary = { chapters: summary };
	summary.chapters = normalizeChapters(summary.chapters);
	return summary;
};

module.exports = {
	normalize: normalizeSummary
};
