export const calculateOffset = (select: any) => {
  var selection = select;
  var start = selection.anchorOffset;
  var end = selection.extentOffset;
  var anchorNode = selection.anchorNode;
  var extentNode = selection.extentNode;

  var startIndex = rangefun(anchorNode, start);
  var endIndex = rangefun(extentNode, end);
  if (startIndex > endIndex) {
    return {
      start: endIndex,
      end: startIndex,
    };
  } else {
    return {
      start: startIndex,
      end: endIndex - 1,
    };
  }
};

function rangefun(child: any, relativeOffset: any) {
  if (child) {
    var parent = child?.parentElement;
    if (parent.tagName != "DIV") {
      parent = parent.closest("div");
      child = child?.parentElement;
    }
    var children = [];
    for (var c of parent.childNodes) {
      if (c === child) break;
      children.push(c);
    }
    return relativeOffset + children.reduce((a, c) => a + c.textContent.length, 0);
  }
}
