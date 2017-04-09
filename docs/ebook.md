# Generating eBooks and PDFs

{{ book.GB }} can generate not only static websites, but also output content as ebook (ePub, Mobi, PDF):

```
# Generate a PDF file
$ gitbook pdf ./ ./mybook.pdf

# Generate an ePub file
$ gitbook epub ./ ./mybook.epub

# Generate a Mobi file
$ gitbook mobi ./ ./mybook.mobi
```

### Install ebook-convert

`ebook-convert` is required to generate ebooks (epub, mobi, pdf).

##### GNU/Linux

Install the [Calibre application](https://calibre-ebook.com/download).

```
$ sudo apt install calibre
```

In some GNU/Linux distributions node is installed as nodejs, so you need to manually create a symlink:

```
$ sudo ln -s /usr/bin/nodejs /usr/bin/node
```

##### OS X

Download the [Calibre application](https://calibre-ebook.com/download). After moving the `calibre.app` to your Applications folder create a symlink to the ebook-convert tool:

```
$ sudo ln -s ~/Applications/calibre.app/Contents/MacOS/ebook-convert /usr/bin
```

You can replace `/usr/bin` with any directory that is in your `$PATH`.

### Cover

Covers are used for all the ebook formats. You can either provide one on your own, or generate it using the [autocover plugin](https://plugins.gitbook.com/plugin/autocover). Covers should be in the **JPEG** format.

To provide a cover, place a **`cover.jpg`** file at the root directory of your book. By adding a **`cover_small.jpg`** you will specify a smaller version of the cover.

Below is a list of guidelines for covers:

* Size: 
    * `cover.jpg`: 1800x2360px;
    * `cover_small.jpg`: 200x262px;
* Style: 
    * No border;
    * Clearly visible book title;
    * Any important text should be visible in the small version.
