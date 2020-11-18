import { clear, openBlock } from "./user-event";
import WindowClient from "./window-client";

/**
 * TODO: Replace this paradigm with an attr config instead.
 */
const getButtonConfig = (target: HTMLButtonElement, targetCommand: string) => {
  const rawParts = target.innerText
    .substring(targetCommand.length + 1)
    .split(" ");
  let quotedWord = "";
  const restOfButtonText: string[] = [];
  for (const part of rawParts) {
    if (quotedWord) {
      if (part.endsWith('"')) {
        restOfButtonText.push(
          `${quotedWord} ${part.substring(0, part.length - 1)}`
        );
        quotedWord = "";
      } else {
        quotedWord = `${quotedWord} ${part}`;
      }
    } else {
      if (part.startsWith('"')) {
        quotedWord = part.substring(1);
      } else {
        restOfButtonText.push(part);
      }
    }
  }
  const numPairs = Math.floor(restOfButtonText.length / 2);
  const buttonConfig = {} as { [key: string]: string };
  for (let i = 0; i < numPairs; i++) {
    buttonConfig[restOfButtonText[i * 2]] = restOfButtonText[i * 2 + 1];
  }
  return buttonConfig;
};

const clickEventListener = (
  targetCommand: string,
  callback: (
    buttonConfig?: { [key: string]: string },
    blockUid?: string,
    parentUid?: string
  ) => void
) => async (e: MouseEvent) => {
  const htmlTarget = e.target as HTMLElement;
  if (
    htmlTarget &&
    htmlTarget.tagName === "BUTTON" &&
    htmlTarget.innerText
      .toUpperCase()
      .trim()
      .startsWith(targetCommand.toUpperCase())
  ) {
    const target = htmlTarget as HTMLButtonElement;
    const buttonConfig = getButtonConfig(target, targetCommand);

    if (window.roamDatomicAlphaAPI) {
      target.innerText = "Loading...";
      target.disabled = true;

      const { blockUid, parentUid } = getUidsFromButton(target);
      new WindowClient()
        .updateBlock({ uid: blockUid })
        .then(() => callback(buttonConfig, blockUid, parentUid));
    } else {
      const divContainer = target.closest(".roam-block") as HTMLDivElement;
      await openBlock(divContainer);
      await clear();

      callback(buttonConfig);
    }
  }
};

export const addButtonListener = (
  targetCommand: string,
  callback: (
    buttonConfig?: { [key: string]: string },
    blockUid?: string,
    parentUid?: string
  ) => void
) =>
  document.addEventListener(
    "click",
    clickEventListener(targetCommand, callback)
  );

/**
 * @param icon A blueprint icon which could be found in https://blueprintjs.com/docs/#icons
 */
export const createIconButton = (icon: string) => {
  const popoverButton = document.createElement("span");
  popoverButton.className = "bp3-button bp3-minimal bp3-small";
  popoverButton.tabIndex = 0;

  const popoverIcon = document.createElement("span");
  popoverIcon.className = `bp3-icon bp3-icon-${icon}`;
  popoverButton.appendChild(popoverIcon);

  return popoverButton;
};

export const getUids = (block: HTMLDivElement | HTMLTextAreaElement) => {
  const blockUid = block.id.substring(block.id.length - 9, block.id.length);
  const restOfHTMLId = block.id.substring(0, block.id.length - 9);
  const potentialDateUid = restOfHTMLId.substring(
    restOfHTMLId.length - 11,
    restOfHTMLId.length - 1
  );
  const parentUid = isNaN(new Date(potentialDateUid).valueOf())
    ? potentialDateUid.substring(1)
    : potentialDateUid;
  return {
    blockUid,
    parentUid,
  };
};

export const getUidsFromButton = (button: HTMLButtonElement) => {
  const block = button.closest(".roam-block") as HTMLDivElement;
  return getUids(block);
};