const expect = require('expect');
const readDocument = require('./readDocument');
const summaryToDocument = require('../toDocument');
const Summary = require('../../../models/summary');
const { Raw } = require('slate');

/**
 * Expect some parts to be converted to the given document
 */
function expectDocument(documentPath, parts) {
    const summary = Summary.createFromParts(parts);
    const document = summaryToDocument(summary);
    const expectedDocument = readDocument(documentPath);

    expect(
        Raw.serializeDocument(document, { terse: true })
    ).toEqual(
        Raw.serializeDocument(expectedDocument, { terse: true })
    );
}

describe('summaryToDocument', () => {
    it('should convert unlinked articles', () => {
        expectDocument('article-no-link.yaml', [
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

    it('should convert articles with links', () => {
        expectDocument('article-with-link.yaml', [
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

    it('should convert parts', () => {
        expectDocument('parts-ul.yaml', [
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

    it('should convert empty articles', () => {
        expectDocument('empty-items.yaml', [
            {
                title: '',
                articles: [
                    {
                        title: '',
                        ref: ''
                    },
                    {
                        title: '',
                        ref: ''
                    }
                ]
            }
        ]);
    });

    it('should convert empty parts', () => {
        expectDocument('empty-part.yaml', [
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

    it('should convert a deep summary', () => {
        expectDocument('deep.yaml', [
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

    it('should convert an empty summary', () => {
        expectDocument('empty.yaml', [
        ]);
    });
});
