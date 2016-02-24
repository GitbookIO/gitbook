# Pages and Summary

GitBook uses a `SUMMARY.md` file to define the structure of chapters and subchapters of the book. The `SUMMARY.md` file is used to generate the book's table of contents.

The `SUMMARY.md`'s format is simply a list of links, the title of the link is used as the chapter's title, and the target is a path to that chapter's file.

Subchapters are defined simply by adding a nested list to a parent chapter.

### Simple example

```
# Summary

* [Part I](part1/README.md)
    * [Writing is nice](part1/writing.md)
    * [GitBook is nice](part1/gitbook.md)
* [Part II](part2/README.md)
    * [We love feedback](part2/feedback_please.md)
    * [Better tools for authors](part2/better_tools.md)
```

### Example with subchapters split into parts

```
# Summary

### Part 1

* [Writing is nice](part1/writing.md)
* [GitBook is nice](part1/gitbook.md)

### Part 2

* [We love feedback](part2/feedback_please.md)
* [Better tools for authors](part2/better_tools.md)
```
