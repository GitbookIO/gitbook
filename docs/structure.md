# Directory structure

GitBook uses a very simple and obvious directory sttructure:

```
.
├── book.json
├── README.md
├── SUMMARY.md
├── chapter-1/
|   ├── README.md
|   └── something.md
└── chapter-2/
    ├── README.md
    └── something.md
```

An overview of what each of these does:

| File | Description |
| -------- | ----------- |
| `book.json` | Stores [configuration](config.md) data (__optional__) |
| `README.md` | Preface / Introduction for your book (**required**) |
| `SUMMARY.md` | Table of Contents |


### Sub-directory

For project documentaiton, it sometimes better to use a diretcory (like `docs/`) to store the prject's documentation. You can use a `.gitbook` file to indicate to GitBook in which folder the book is stored:

```
.
├── .gitbook
└── docs/
    ├── README.md
    └── SUMMARY.md
```

With `.gitbook` containing:

```
./docs/
```
