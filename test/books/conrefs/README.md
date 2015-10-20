# Readme

<p id="test-plugin-block-shortcuts-1">$$test_block1$$</p>
<p id="test-plugin-block-shortcuts-2">{% include "./block.md" %}</p>

### Relative

<p id="t1">{% include "./hello.md" %}</p>
<p id="t2">{% include "/hello.md" %}</p>

### Git

<p id="t3">{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md" %}</p>
<p id="t4">{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test2.md" %}</p>
<p id="t5">{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test3.md" %}</p>
