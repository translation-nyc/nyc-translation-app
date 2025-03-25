import {RefObject, useEffect, useRef} from "react";

export interface DialogHook {
    dialogRef: RefObject<HTMLDialogElement | null>;
    openDialog: () => void;
}

export function useDialog(): DialogHook {
    const dialogRef = useRef<HTMLDialogElement>(null);

    function openDialog() {
        dialogRef.current?.showModal();
    }

    useEffect(() => {
        const dialog = dialogRef.current;

        function closeDialog(event: MouseEvent) {
            if (event.target === dialog) {
                dialog?.close();
            }
        }

        dialog?.addEventListener("click", closeDialog);
        return () => dialog?.removeEventListener("click", closeDialog);
    }, []);

    return {
        dialogRef,
        openDialog,
    };
}
