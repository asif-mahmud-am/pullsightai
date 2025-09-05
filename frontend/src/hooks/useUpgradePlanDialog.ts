import { useRef } from "react";
import {
    UpgradePlanDialogProps,
    UpgradePlanDialogRef,
} from "@/components/reusable/UpgradePlanDialog";

export const useUpgradePlanDialog = () => {
    const dialogRef = useRef<UpgradePlanDialogRef>(null);

    const showUpgradeDialog = (data: Partial<UpgradePlanDialogProps> = {}) => {
        dialogRef.current?.show(data);
    };

    const hideUpgradeDialog = () => {
        dialogRef.current?.hide();
    };

    return {
        dialogRef,
        showUpgradeDialog,
        hideUpgradeDialog,
    };
};
