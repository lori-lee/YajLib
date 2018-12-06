# YajLib
## YajLib is a lightweight js lib which wrote by Lori Lee(leejqy@163.com)
## Currently only a few class / functions. (diffNg / tokenizer / htmlTokenizer) are exposed.
## Example
### diff between 2 files / multi-line texts:
#### var options= null;//Designed for advanced UI customize. if null default view will be used.
#### var diffNg = YajLib.diffNg(options);
#### var diffResult = diffNg.mdiff(textA, textB);
#### document.querySelector('.diff-letf').innerHTML = diffResult['left'];
#### document.querySelector('.diff-right').innerHTML= diffResult['right'];
### Tokenize a string
#### YajLib.tokenize(text);
### Tokenize a html string
#### YajLib.htmlTokenizer(html);
