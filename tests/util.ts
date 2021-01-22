export const getFocusedTextArea = () => {
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.focus();
  return textarea;
};

const pull = () => ({ ":block/children": [], ":block/string": "", ":block/order": 0 });
const defaultWrite = () => true;
export const alphaRest = {
  pull,
  createBlock: defaultWrite,
  updateBlock: defaultWrite,
  moveBlock: defaultWrite,
  deleteBlock: defaultWrite,
  createPage: defaultWrite,
  updatePage: defaultWrite,
  deletePage: defaultWrite,
}
