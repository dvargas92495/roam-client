import { openBlock } from "../src";

test("openBlock textarea renders", async () => {
    const div = document.createElement("div");
    const textarea = document.createElement("textarea");
    document.body.appendChild(div);
    div.onclick = () => {
        document.body.removeChild(div);
        document.body.appendChild(textarea);
        textarea.focus();
    }

    const openedBlock = await openBlock(div);
    
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveFocus();
    expect(textarea).toBe(openedBlock);
})