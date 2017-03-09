const expect = require('expect');
const Summary = require('../../../models/summary');

describe('movePath', () => {
    const movePath = require('../movePath');

    const summary = Summary.createFromParts([
        {
            articles: [
                {
                    title: 'Intro',
                    path: 'README.md'
                }
            ]
        },
        {
            title: 'Part',
            articles: [
                {
                    title: '1',
                    path: ''
                },
                {
                    title: '2',
                    path: '2/README.md',
                    articles: [
                        {
                            title: '2a',
                            path: '2/1.md'
                        },
                        {
                            title: '2b',
                            path: '2/1.md#anchor'
                        }
                    ]
                }
            ]
        }
    ]);

    it('should move a single article', () => {
        const newSummary = movePath(summary, 'README.md', 'README2.md');
        expectParts(newSummary, [
            {
                articles: [
                    {
                        title: 'Intro',
                        path: 'README2.md'
                    }
                ]
            },
            {
                title: 'Part',
                articles: [
                    {
                        title: '1',
                        path: ''
                    },
                    {
                        title: '2',
                        path: '2/README.md',
                        articles: [
                            {
                                title: '2a',
                                path: '2/1.md'
                            },
                            {
                                title: '2b',
                                path: '2/1.md#anchor'
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it('should handle anchors', () => {
        const newSummary = movePath(summary, '2/1.md', '2/2.md');
        expectParts(newSummary, [
            {
                articles: [
                    {
                        title: 'Intro',
                        path: 'README.md'
                    }
                ]
            },
            {
                title: 'Part',
                articles: [
                    {
                        title: '1',
                        path: ''
                    },
                    {
                        title: '2',
                        path: '2/README.md',
                        articles: [
                            {
                                title: '2a',
                                path: '2/2.md'
                            },
                            {
                                title: '2b',
                                path: '2/2.md#anchor'
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it('should handle dirs', () => {
        const newSummary = movePath(summary, '2/', '3/');
        expectParts(newSummary, [
            {
                articles: [
                    {
                        title: 'Intro',
                        path: 'README.md'
                    }
                ]
            },
            {
                title: 'Part',
                articles: [
                    {
                        title: '1',
                        path: ''
                    },
                    {
                        title: '2',
                        path: '3/README.md',
                        articles: [
                            {
                                title: '2a',
                                path: '3/1.md'
                            },
                            {
                                title: '2b',
                                path: '3/1.md#anchor'
                            }
                        ]
                    }
                ]
            }
        ]);
    });
});

function expectParts(summary, expectedParts) {
    const expectedSummary = Summary.createFromParts(expectedParts);
    expect(
        summary.toJS().parts
    ).toEqual(
        expectedSummary.toJS().parts
    );
}

