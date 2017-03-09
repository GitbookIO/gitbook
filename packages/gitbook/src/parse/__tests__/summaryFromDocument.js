const expect = require('expect');
const readDocument = require('./utils/readDocument');
const summaryFromDocument = require('../summaryFromDocument');
const Summary = require('../../models/summary');

function readSummary(filename) {
    const document = readDocument(filename);
    return summaryFromDocument(document);
}

function expectParts(summary, expectedParts) {
    const expectedSummary = Summary.createFromParts(expectedParts);
    expect(
        summary.toJS().parts
    ).toEqual(
        expectedSummary.toJS().parts
    );
}

describe('summaryFromDocument', () => {

    it('should parse from a UL', () => {
        const summary = readSummary('summary/ul.yaml');
        expectParts(summary, [
            {
                title: '',
                articles: [
                    {
                        title: 'Hello',
                        ref: ''
                    },
                    {
                        title: 'World',
                        ref: ''
                    }
                ]
            }
        ]);
    });

    it('should parse from a UL with links', () => {
        const summary = readSummary('summary/ul-with-link.yaml');

        expectParts(summary, [
            {
                title: '',
                articles: [
                    {
                        title: 'Hello',
                        ref: 'hello.md'
                    },
                    {
                        title: 'World',
                        ref: ''
                    }
                ]
            }
        ]);
    });

    it('should parse parts', () => {
        const summary = readSummary('summary/parts-ul.yaml');

        expectParts(summary, [
            {
                title: '',
                articles: [
                    {
                        title: 'Hello',
                        ref: ''
                    }
                ]
            },
            {
                title: 'Some Part',
                articles: [
                    {
                        title: 'World',
                        ref: ''
                    }
                ]
            },
            {
                title: '', // untitled part
                articles: [
                    {
                        title: 'Yeah',
                        ref: ''
                    }
                ]
            }
        ]);
    });

    it('should ignore empty items', () => {
        const summary = readSummary('summary/empty-items.yaml');

        expectParts(summary, [
            {
                title: '',
                articles: []
            }
        ]);
    });

    it('should parse empty parts', () => {
        const summary = readSummary('summary/empty-part.yaml');

        expectParts(summary, [
            {
                title: 'Part 1',
                articles: [
                    {
                        title: 'Article 1'
                    }
                ]
            },
            {
                title: 'Empty part 1',
                articles: []
            },
            {
                title: 'Empty part 2',
                articles: []
            },
            {
                title: 'Part 2',
                articles: [
                    {
                        title: 'Article 2'
                    }
                ]
            },
            {
                title: 'Empty part 3',
                articles: []
            }
        ]);
    });

    it('should parse an deep summary', () => {
        const summary = readSummary('summary/deep.yaml');

        expectParts(summary, [
            {
                title: '1',
                articles: [
                    {
                        title: '1.1',
                        articles: [
                            {
                                title: '1.1.1'
                            },
                            {
                                title: '1.1.2'
                            }
                        ]
                    },
                    {
                        title: '1.2',
                        articles: [
                            {
                                title: '1.2.1'
                            },
                            {
                                title: '1.2.2'
                            }
                        ]
                    }
                ]
            },
            {
                title: '2',
                articles: [
                    {
                        title: '2.1',
                        articles: [
                            {
                                title: '2.1.1',
                                articles: [
                                    {
                                        title: '2.1.1.1',
                                        articles: [
                                            {
                                                title: '2.1.1.1.1'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it('should parse an empty summary', () => {
        const summary = readSummary('summary/empty.yaml');

        expectParts(summary, [
        ]);
    });

    it('should be flexible', () => {
        const summary = readSummary('summary/flexible.yaml');

        expectParts(summary, [
            {
                title: '',
                articles: [
                    {
                        title: 'Article 1',
                        ref: 'art1.md'
                    },
                    {
                        title: 'Article 2',
                        articles: []
                    },
                    {
                        title: 'Article 3',
                        ref: 'art3.md',
                        articles: [
                            {
                                title: 'Article 2.1',
                                ref: 'art2.1.md',
                                articles: []
                            }
                        ]
                    }
                ]
            }
        ]);
    });

});
