/**
 * @param icon A blueprint icon which coul be found in https://blueprintjs.com/docs/#icons
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
