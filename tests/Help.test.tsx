import {describe, expect, test, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Help from "../src/components/Help";

describe("Help", () => {
    test("Open help menu", async () => {
        // Mock the showModal method because dialog is not supported in jsdom
        let opened = false;
        const openHelp = vi.fn(() => opened = true);
        HTMLDialogElement.prototype.showModal = openHelp;

        render(<Help/>);

        expect(openHelp).not.toHaveBeenCalled();
        expect(opened).toBe(false);

        const button = screen.getByRole("button", {
            name: "Help button",
        });

        await userEvent.click(button);

        expect(openHelp).toHaveBeenCalled();
        expect(opened).toBe(true);
    });
});
