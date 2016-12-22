Styled hint blocks in your docs
==============

This plugins requires gitbook `>=4.0.0`.

### Install

Add the below to your `book.json` file, then run `gitbook install` :

```json
{
    "plugins": ["hints"]
}
```

### Usage

You can now provide hints in various ways using the `hint` tag.

```markdown
{% hint style='info' %}
Important info: this note needs to be highlighted
{% endhint %}
```

##### Styles

Available styles are:

- `info` (default)
- `tip`
- `danger`
- `warning`

##### Custom Icons

```markdown
{% hint style='info' icon="mail" %}
Important info: this note needs to be highlighted
{% endhint %}
```
