/**
 * Created by nzt on 15. 4. 26.
 */
var path = require('path');
var java = require('java');
var async = require('async');
var deasync = require('deasync');
//
java.classpath.push(path.resolve(__dirname, '../jar/scala-library-2.11.6.jar'));
java.classpath.push(path.resolve(__dirname, '../jar/twitter-text-1.11.1.jar'));
java.classpath.push(path.resolve(__dirname, '../jar/korean-text-3.0.jar'));



var processor = function(options) {
  var procBuilder;
  var self = this;
  var done = false;

  async.waterfall([
    function(callback) {
      java.newInstance('com.twitter.penguin.korean.TwitterKoreanProcessorJava$Builder', function(err, proc) {
        if (err)
          return callback(err);

        procBuilder = proc;
        callback();
      });
    },
    function(callback) {
      if (options && options.normalizer === false)
        return procBuilder.disableNormalizer(function(err) {
          if (err)
            return callback(err);
          callback();
        });

      callback();
    },
    function(callback) {
      if (options && options.stemmer === false)
        return procBuilder.disableStemmer(function(err) {
          if (err)
            return callback(err);
          callback();
        });

      callback();
    },
    function(callback) {
      if (options && options.spamfilter === true)
        return procBuilder.enablePhraseExtractorSpamFilter(function(err) {
          if (err)
            return callback(err);
          callback();
        });

      callback();
    },
    function(callback) {
      procBuilder.build(function(err, processor) {
        if (err)
          return callback(err);

        self._processor = processor;
        callback();
      })
    }
  ], function(err) {
    if (err)
      self._err = err;

    done = true;
  });

  while(!done) {
    deasync.runLoopOnce();
  }
};

processor.prototype.tokenizeToStrings = function(string, callback) {
  this._processor.tokenizeToStrings(string, function(err, result) {
    if (err)
      return callback(err);

    result.toArray(callback);
  });
};

processor.prototype.tokenize = function(string, callback) {
  var _processor = this._processor;

  async.waterfall([
    function(callback) {
      _processor.tokenize(string ,callback);
    },
    function(result, callback) {
      result.toArray(callback);
    },
    function(tokenArray, callback) {
      async.map(tokenArray, KoreanTokenToJSON, callback);
    }
  ], function(err, result) {
    if (err)
      return callback(err);

    callback(null, result);
  });
};

processor.prototype.extractPhrases = function(string, callback) {
  var _processor = this._processor;

  async.waterfall([
    function(callback) {
      _processor.extractPhrases(string ,callback);
    },
    function(result, callback) {
      result.toArray(callback);
    },
    function(tokenArray, callback) {
      async.map(tokenArray, KoreanTokenToJSON, callback);
    }
  ], function(err, result) {
    if (err)
      return callback(err);

    callback(null, result);
  });
};

function KoreanTokenToJSON(classObj, callback) {
  var token = {};
  async.waterfall([
    function(callback) {
      classObj.text(function(err, text) {
        if (err)
          return callback(err);
        token.text = text;
        callback();
      })
    },
    function(callback) {
      classObj.pos(function(err, pos) {
        if (err)
          return callback(err);

        token.pos = pos.toString();
        callback();
      });
    },
    function(callback) {
      classObj.offset(function(err, offset) {
        if (err)
          return callback(err);

        token.offset = offset;
        callback();
      })
    },
    function(callback) {
      classObj.length(function(err, length) {
        if (err)
          return callback(err);

        token.length = length;
        callback();
      })
    },
    function(callback) {
      if (classObj.hasOwnProperty('unknown')) {
        classObj.unknown(function(err, unknown) {
          if (err)
            return callback(err);

          token.unknown = unknown;
          callback();
        });
      } else {
        callback();
      }
    }
  ], function(err) {
    if (err)
      return callback(err);

    callback(null, token);
  });
}

module.exports = exports = processor;
