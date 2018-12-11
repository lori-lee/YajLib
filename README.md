# YajLib (support: ES6 or above)
## YajLib is a lightweight js lib which is written by Lori Lee(leejqy@163.com)
## Currently only a few classes / functions (diffNg / tokenizer / htmlTokenizer / lcdClock / md5) are exported.
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
#### var targetDOM1 = document.querySelector('#svg-clock-1'); //<div id="svg-clock-1"&lt;/div&gt;
#### var clock1 = new YajLib.lcdClock(targetDOM1, 0x7);
#### clock1.run();
### md5 function
#### YajLib.md5('')  ==>  output d41d8cd98f00b204e9800998ecf8427e
#### More examples, see the html/js code of file diffme.html
