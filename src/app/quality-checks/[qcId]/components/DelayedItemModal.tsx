"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { addDelayedItem } from "../../../../store/slices/qcSlice";
import { Clock } from "lucide-react";

interface DelayedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalItemId: number;
  maxQuantity: number;
}

export default function DelayedItemModal({
  isOpen,
  onClose,
  originalItemId,
  maxQuantity,
}: DelayedItemModalProps) {
  const t = useTranslations();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState<string>("1");

  const handleSubmit = () => {
    if (!isFormValid) return;

    const delayedQuantity = parseInt(quantity);

    const delayedItem = {
      id: `delayed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quantity: delayedQuantity,
      originalItemId,
    };

    dispatch(addDelayedItem(delayedItem));
    handleClose();
  };

  const handleClose = () => {
    setQuantity("1");
    onClose();
  };

  const isFormValid =
    parseInt(quantity) > 0 && parseInt(quantity) <= maxQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <DialogTitle>{t("addDelayedItem")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("addDelayedItemDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              max={maxQuantity}
              placeholder="1"
            />
            <p className="text-xs text-gray-500">
              {t("maxQuantity")}: {maxQuantity}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {t("addDelayedItem")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
