# YajLib (support: ES6 or above)
## YajLib is a lightweight js lib which is written by Lori Lee(leejqy@163.com)
## Currently only a few class / functions. (diffNg / tokenizer / htmlTokenizer / lcdClock) are exposed.
## Example
### diff between 2 files / multi-line texts:
#### var options= null;//Designed for advanced UI customize. if null default view will be used.
#### var diffNg = YajLib.diffNg(options);
#### var diffResult = diffNg.mdiff(textA, textB);
#### document.querySelector('.diff-left').innerHTML = diffResult['left'];
#### document.querySelector('.diff-right').innerHTML= diffResult['right'];
### Tokenize a string
#### YajLib.tokenize(text);
### Tokenize a html string
#### YajLib.htmlTokenizer(html);
###  LCD style clock
#### var targetDOM1 = document.querySelector('#svg-clock-1');//<div id="svg-clock-1"</div>
#### var clock1 = new YajLib.lcdClock(targetDOM1, 0x7);
#### clock1.run();
#### More examples, see the html/js code of file diffme.html
