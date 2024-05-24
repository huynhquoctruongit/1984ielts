function nodeTillStartContainer(node: any, start: any) {
  const div = document.createElement("div");
  div.appendChild(node.cloneNode(true));
  let result = div.innerHTML.substring(0, div.innerHTML.indexOf(">") + 1);

  for (let child of Array.from(node.childNodes) as any) {
    if (child === start) break;
    if (child.contains(start)) {
      result += nodeTillStartContainer(child, start);
      break;
    }

    const temp: any = document.createElement("div");
    temp.appendChild(child.cloneNode(true));
    result += temp.innerHTML;
  }

  return result;
}

function handleNbspsBefore(selection: any) {
  if (selection?.toString()) {
    const range = selection?.getRangeAt(0);
    const start = range?.startContainer;
    if (range && start) {
      let result = "";
      let initialContainer = start.parentElement;
      // while (!initialContainer.hasAttribute("contentEditable")) {
      //   initialContainer = initialContainer.parentElement;
      // }
      for (let node of Array.from(initialContainer.childNodes as any) as any) {
        if (node === start) break;
        if (node.contains(start)) {
          result += nodeTillStartContainer(node, start).replaceAll("&nbsp;", " ");
          break;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          result += node.textContent.replaceAll("&nbsp;", " ");
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const temp = document.createElement("div");
          temp.appendChild(node.cloneNode(true));
          result += temp.innerHTML.replaceAll("&nbsp;", " ");
        }
      }

      result += start.textContent.substring(0, range.startOffset).replaceAll("&nbsp;", " ");

      return result;
    }
  }
}

export const getStartOf = (selection: any) => {
  if (handleNbspsBefore(selection)) {
    return handleNbspsBefore(selection).length;
  }
};
