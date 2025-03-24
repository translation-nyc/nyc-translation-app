import {describe, expect, test} from "vitest";
import {render, screen} from "@testing-library/react";
import Toolbar from "../src/components/Toolbar";

describe("Toolbar", () => {
    test("App title", () => {
        render(<Toolbar/>);

        const title = screen.getByRole("heading", {
            name: "App title",
        });

        expect(title.innerHTML).toBe("Conversate.");
    });

    test("Login button text", () => {
        render(<Toolbar/>);

        const loginButton = screen.getByRole("button", {
            name: "Login button",
        });

        expect(loginButton.innerHTML).contains("Login");
    });

    test("Sign out button text", () => {
        render(
            <Toolbar
                authenticated={true}
            />
        );

        const signOutButton = screen.getByRole("button", {
            name: "Sign out button",
        });

        expect(signOutButton.innerHTML).contains("Sign out");
    });
});
