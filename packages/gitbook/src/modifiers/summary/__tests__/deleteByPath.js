const expect = require('expect');
const Summary = require('../../../models/summary');

describe('deleteByPath', () => {
    const deleteByPath = require('../deleteByPath');

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

    it('should remove a single article', () => {
        const newSummary = deleteByPath(summary, 'README.md');
        expectParts(newSummary, [
            {
                articles: []
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
        const newSummary = deleteByPath(summary, '2/1.md');
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
                        articles: []
                    }
                ]
            }
        ]);
    });

    describe('should handle dirs', () => {
        const expectedParts = [
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
                    }
                ]
            }
        ];

        [
            deleteByPath(summary, '2/'),
            deleteByPath(summary, '2')
        ].map((newSummary, i) =>
              it('# ' + i,
                  () => expectParts(newSummary, expectedParts))
        );
    });

    it('should not delete descendants that don\'t match', () => {
        const newSummary = deleteByPath(summary, '2/README.md');
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
                        // Unlink
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
});

function expectParts(summary, expectedParts) {
    const expectedSummary = Summary.createFromParts(expectedParts);
    expect(
        summary.toJS().parts
    ).toEqual(
        expectedSummary.toJS().parts
    );
}

