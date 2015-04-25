# twt-krjs
nodejs interface twitter-korean-text

# Compatibility

Currently wraps [twitter-korean-text 3.0](https://github.com/twitter/twitter-korean-text/tree/korean-text-3.0) / 현재 이 프로젝트는 [twitter-korean-text 3.0](https://github.com/twitter/twitter-korean-text/tree/korean-text-3.0)을 사용중입니다.

# Usage

```
var TwitterKoreanText = require('twtkrjs');
var processor = new TwitterKoreanText({
  stemmer: false,      // (optional default: true)
  normalizer: false,   // (optional default: true)
  spamfilter: true     // (optional default: false)
});


processor.tokenizeToStrings("한국어를 처리하는 예시입니닼ㅋㅋㅋㅋㅋ", function(err, result) { ... }) // async
var result = processor.tokenizeToStrings("한국어를 처리하는 예시입니닼ㅋㅋㅋㅋㅋ");  // sync
```


# TODO

- add test case / 테스트 케이스 추가
- etc...
