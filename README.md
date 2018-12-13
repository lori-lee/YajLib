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
#### var targetDOM1 = document.querySelector('#svg-clock-1'); //<div id="svg-clock-1"&gt;&lt;/div&gt;
#### var clock1 = new YajLib.lcdClock(targetDOM1, 0x7);
#### clock1.run();
### md5 function
#### YajLib.md5('')    ==>  output: d41d8cd98f00b204e9800998ecf8427e
#### YajLib.md5('abc') ==>  output: 900150983cd24fb0d6963f7d28e17f72
### base64Encode / base64Decode
#### YajLib.base64Encode('abc')  ==> output: YWJj
#### YajLib.base64Decode('YWJj') ==> output: abc
### Note: Unicode will be used both for md5 & base64Encode (//TODO: add parameter encoding:(utf-8 etc), and evaluate binary bits according to it).
#### More examples, see the html/js code of file diffme.html
