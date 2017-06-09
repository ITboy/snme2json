const should = require('chai').should();
const rewire = require('rewire');
const snme2json = rewire('../snme2json');

describe('snme2json', function() {
  const TAG = snme2json.__get__('TAG');

  describe('isFirstLine', function(){
    const isFirstLine = snme2json.__get__('isFirstLine');

    it('should be seperated to 2 parts by white characters', function() {
      isFirstLine('a:b c {').should.equal(false);
      isFirstLine('a:b {').should.equal(true);
    });

    it('the first part should be seperated to 2 parts by ":"', function() {
      isFirstLine('a:b {').should.equal(true);
      isFirstLine('a: c {').should.equal(false);
      isFirstLine('a c {').should.equal(false);
      isFirstLine('a:b:c c {').should.equal(false);
      isFirstLine('a::b c {').should.equal(false);
    });

    it('should be end with {', function() {
      isFirstLine('a:b {').should.equal(true);
      isFirstLine('a:b a').should.equal(false);
      isFirstLine('a:b [').should.equal(false);
      isFirstLine('a:b [').should.equal(false);
    });

    it('keywords could be combined with alpha and number characters', function() {
      isFirstLine('abc:def {').should.equal(true);
      isFirstLine('123:456 {').should.equal(true);
      isFirstLine('abc123:def456 {').should.equal(true);
      isFirstLine('123abc:def456 {').should.equal(true);
    });
  });

  describe('isObjStart', function() {
    const isObjStart = snme2json.__get__('isObjStart');

    it('should be seperated to 3 parts by white characters', function() {
      isObjStart('a b:c {').should.equal(true);
      isObjStart('a o b:c {').should.equal(false);
    });

    it('the second part should be seperated to 2 parts by ":"', function() {
      isObjStart('a b:c {').should.equal(true);
      isObjStart('a b::c {').should.equal(false);
      isObjStart('a b:c:d {').should.equal(false);
      isObjStart('a b c {').should.equal(false);
    });

    it('should be end with {', function() {
      isObjStart('d a:b {').should.equal(true);
      isObjStart('d a:b a').should.equal(false);
      isObjStart('d a:b [').should.equal(false);
      isObjStart('d a:b [').should.equal(false);
    });
  });

  describe('isObjEnd', function() {
    const isObjEnd = snme2json.__get__('isObjEnd');

    it('should be euqal {', function() {
      isObjEnd('}').should.equal(true);
      isObjEnd('{').should.equal(false);
    });
  });

  describe('isArrStart', function() {
    const isArrStart = snme2json.__get__('isArrStart');

    it('should be seperated to 2 parts by white characters', function() {
      isArrStart('a [').should.equal(true);
      isArrStart('a b [').should.equal(false);
    });

    it('should be end with [', function() {
      isArrStart('d [').should.equal(true);
      isArrStart('d {').should.equal(false);
      isArrStart('d a').should.equal(false);
      isArrStart('d ]').should.equal(false);
    });
  });

  describe('isArrEnd', function() {
    const isArrEnd = snme2json.__get__('isArrEnd');

    it('should be euqal ]', function() {
      isArrEnd(']').should.equal(true);
      isArrEnd('[').should.equal(false);
    });
  });

  describe('isKeyValue', function() {
    const isKeyValue = snme2json.__get__('isKeyValue');

    it('should not be end with [{', function() {
      isKeyValue('a b[').should.equal(false);
      isKeyValue('a b{').should.equal(false);
      isKeyValue('a b{}').should.equal(true);
      isKeyValue('a b[]').should.equal(true);
    });

    it('could contain any characters except newline in the sescond part', function() {
      isKeyValue('a "skd 2334 [ ] { }_-+!$@#%"').should.equal(true);
    });
  });

  describe('getTag', function() {
    const getTag = snme2json.__get__('getTag');

    it('should return TAG.FIRST_LINE', function() {
      getTag('rtcext:RTCUmbrella {').should.equal(TAG.FIRST_LINE);
    });

    it('should return TAG.OBJ_START', function() {
      getTag('ocfServCtx  ocf:OCFContext {').should.equal(TAG.OBJ_START);
    });

    it('should return TAG.OBJ_END', function() {
      getTag('}').should.equal(TAG.OBJ_END);
    });

    it('should return TAG.ARR_START', function() {
      getTag('subscriptionId  [').should.equal(TAG.ARR_START);
    });

    it('should return TAG.ARR_END', function() {
      getTag(']').should.equal(TAG.ARR_END);
    });


    it('should return TAG.KEY_VALUE', function() {
      getTag('ccTotalOctets  4000000').should.equal(TAG.KEY_VALUE);
      getTag('sessionID  "OCSP_530.1.OSaccesspoint7.acme.com;1495766580;072541517"').should.equal(TAG.KEY_VALUE);
    });

    it('should throw Error', function() {
      const line = 'abcd';
      const lineNo = 1;
      (() => getTag(line, lineNo)).should.throw(Error, `No tags matched, lineNo: ${lineNo}, line: ${line}`);
    });
  });

  describe('modifyFirstLine', function() {
    const modifyFirstLine = snme2json.__get__('modifyFirstLine');

    it('should return {', function() {
      modifyFirstLine('rtcext:RTCUmbrella {').should.equal("{");
    });
  });

  describe('modifyObjStart', function() {
    const modifyObjStart = snme2json.__get__('modifyObjStart');

    it('should remove type and add ":"', function() {
      modifyObjStart('ocfServCtx  ocf:OCFContext {', TAG.OBJ_START).should.equal('"ocfServCtx":{');
    });
  });

  describe('modifyObjEnd', function() {
    const modifyObjEnd = snme2json.__get__('modifyObjEnd');

    it('should return } or },', function() {
      modifyObjEnd('}', TAG.EOS).should.equal('}');
      modifyObjEnd('}', TAG.ARR_START).should.equal('},');
    });
  });

  describe('modifyArrStart', function() {
    const modifyArrStart = snme2json.__get__('modifyArrStart');

    it('should add ":"', function() {
      modifyArrStart('multipleServicesCreditControl  [').should.equal('"multipleServicesCreditControl":[');
    });
  });

  describe('modifyArrEnd', function() {
    const modifyArrEnd = snme2json.__get__('modifyArrEnd');

    it('should return ] or ],', function() {
      modifyArrEnd(']', TAG.EOS).should.equal(']');
      modifyArrEnd(']', TAG.ARR_START).should.equal('],');
    });
  });

  describe('modifyKeyValue', function() {

      const modifyKeyValue = snme2json.__get__('modifyKeyValue');

      it('should add : and , if necessary', function() {
        modifyKeyValue('subscriptionIdType  0', TAG.EOS).should.equal('"subscriptionIdType":0');
        modifyKeyValue('subscriptionIdType  0', TAG.ARR_START).should.equal('"subscriptionIdType":0,');
        modifyKeyValue('sgsnAddress  [-35, -79, 0, 0]', TAG.EOS).should.equal('"sgsnAddress":[-35, -79, 0, 0]');
        modifyKeyValue('sgsnAddress  []', TAG.EOS).should.equal('"sgsnAddress":[]');
        modifyKeyValue('sgsnAddress  {}', TAG.EOS).should.equal('"sgsnAddress":{}');
      });
  });


  describe('isEnd', function() {
    const isEnd = snme2json.__get__('isEnd');

    it('return true if next tag is OBJ_END, ARR_END or EOS', function() {
      isEnd(TAG.OBJ_END).should.be.true;
      isEnd(TAG.ARR_END).should.be.true;
      isEnd(TAG.EOS).should.be.true;
    });
  });
});
