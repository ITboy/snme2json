const TAG = {
  FIRST_LINE: Symbol('FIRST_LINE'),
  OBJ_START: Symbol('OBJ_START'),
  OBJ_END: Symbol('OBJ_END'),
  ARR_START: Symbol('ARR_START'),
  ARR_END: Symbol('ARR_END'),
  KEY_VALUE: Symbol('KEY_VALUE'),
  EOS: Symbol('EOS'),
}

let isFirstLine = function firstLine(line) {
  return /^\w+:\w+\s+\{$/.test(line);
};

let isObjStart = function objStart(line) {
  return /^\w+\s+\w+:\w+\s+\{$/.test(line);
};

let isObjEnd = function objEnd(line) {
  return /^}$/.test(line);
};

let isArrStart = function arrStart(line) {
  return /^\w+\s+\[$/.test(line);
};

let isArrEnd = function arrEnd(line) {
  return /^]$/.test(line);
};

let isKeyValue = function keyValue(line) {
  return /^\w+\s+.+[^{[]$/.test(line);
};

let getTag = function getTag(line, lineNo) {
  if (line === undefined) return TAG.EOS;
  const checkTagFuncs = [isFirstLine, isObjStart, isObjEnd, isArrStart, isArrEnd, isKeyValue];
  const tags = checkTagFuncs.filter(func => func(line)).map(func => {
    switch (func) {
      case isFirstLine:
        return TAG.FIRST_LINE;
      case isObjStart:
        return TAG.OBJ_START;
      case isObjEnd:
        return TAG.OBJ_END;
      case isArrStart:
        return TAG.ARR_START;
      case isArrEnd:
        return TAG.ARR_END;
      case isKeyValue:
        return TAG.KEY_VALUE;
    }
  });
  if (tags.length === 0) {
    throw Error(`No tags matched, lineNo: ${lineNo}, line: ${line}`);
  } else if (tags.length === 1) {
    return tags[0];
  } else {
    throw Error(`More than one tag matched, line: ${lineNo}`);
  }
};

let modifyFirstLine = function modifyFirstLine(line) {
  return "{";
};

let modifyObjStart = function modifyObjStart(line) {
  const keyword = line.split(/\s+/)[0];
  return `"${keyword}":{`;
};

let modifyObjEnd = function modifyObjEnd(line, nextTag) {
  return isEnd(nextTag) ? "}" : "},";
};

let modifyArrStart = function modifyArrStart(line) {
  const keyword = line.split(/\s+/)[0];
  return `"${keyword}":[`;
};

let modifyArrEnd = function modifyArrEnd(line, nextTag) {
  return isEnd(nextTag) ? "]" : "],";
};

let modifyKeyValue = function modifyKeyValue(line, nextTag) {
  const matchArr = line.match((/(\S+)\s+(.+)$/));

  if (!matchArr) throw Error('No key and value matched in KeyValue Pair');

  const keyPart = matchArr[1];
  const valuePart = matchArr[2];
  let result = `"${keyPart}":${valuePart}`;

  if (!isEnd(nextTag)) result += ",";

  return result;
};

let isEnd = function isEnd(tag) {
  return tag === TAG.OBJ_END || tag === TAG.ARR_END || tag === TAG.EOS;
};

module.exports = function snme2json(snme) {
  let lines = snme.trim().split(/\r?\n/);

  return lines.map(line => line.trim())
  .map((line, index, lines) => {
    const tag = getTag(line, index + 1);
    const nextTag = getTag(lines[index + 1], index + 1);
    switch (tag) {
      case TAG.FIRST_LINE:
        return modifyFirstLine(line);
      case TAG.OBJ_START:
        return modifyObjStart(line);
      case TAG.OBJ_END:
        return modifyObjEnd(line, nextTag);
      case TAG.ARR_START:
        return modifyArrStart(line);
      case TAG.ARR_END:
        return modifyArrEnd(line, nextTag);
      case TAG.KEY_VALUE:
        return modifyKeyValue(line, nextTag);
    }
  }).join('');
}
