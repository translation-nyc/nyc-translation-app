import {describe, expect, test, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Alert from "../src/components/Alert";

describe("Alert", () => {
    test("Show alert", () => {
        const alertMessage = "Test alert";

        render(
            <Alert
                message={alertMessage}
                isVisible={true}
                onDismiss={() => undefined}
                autoDismissTime={0}
            />
        );

        const alert = screen.getByRole("alert", {
            name: "Alert message",
        });

        expect(alert.innerHTML).toBe(alertMessage);
    });

    test("Hidden alert", () => {
        render(
            <Alert
                message=""
                isVisible={false}
                onDismiss={() => undefined}
                autoDismissTime={0}
            />
        );

        const alert = screen.queryByRole("alert", {
            name: "Alert message",
        });

        expect(alert).toBeNull();
    });

    test("Dismiss alert", async () => {
        const alertMessage = "Test alert";
        let closed = false;
        const dismissAlert = vi.fn(() => closed = true);

        render(
            <Alert
                message={alertMessage}
                isVisible={true}
                onDismiss={dismissAlert}
                autoDismissTime={0}
            />
        );

        expect(dismissAlert).not.toHaveBeenCalled();
        expect(closed).toBe(false);

        const alert = screen.getByRole("alert", {
            name: "Alert message",
        });

        expect(alert.innerHTML).toBe(alertMessage);

        const button = screen.getByRole("button", {
            name: "Dismiss alert button",
        });

        await userEvent.click(button);

        expect(dismissAlert).toHaveBeenCalled();
        expect(closed).toBe(true);
    });

    test("Auto dismiss alert", async () => {
        const alertMessage = "Test alert";
        const autoDismissTime = 100;
        let closed = false;
        const dismissAlert = vi.fn(() => closed = true);

        render(
            <Alert
                message={alertMessage}
                isVisible={true}
                onDismiss={dismissAlert}
                autoDismissTime={autoDismissTime}
            />
        );

        expect(dismissAlert).not.toHaveBeenCalled();
        expect(closed).toBe(false);

        const alert = screen.getByRole("alert", {
            name: "Alert message",
        });

        expect(alert.innerHTML).toBe(alertMessage);

        await new Promise(resolve => setTimeout(resolve, autoDismissTime));

        expect(dismissAlert).toHaveBeenCalled();
        expect(closed).toBe(true);
    });
});
