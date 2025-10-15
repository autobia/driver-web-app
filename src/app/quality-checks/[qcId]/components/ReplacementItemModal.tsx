"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { addReplacementItem } from "../../../../store/slices/qcSlice";
import {
  useGetManufacturersQuery,
  useGetBrandsQuery,
} from "../../../../store/api/inventoryApi";
import { Loader2, Package } from "lucide-react";

interface ReplacementItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalItemId: number;
  maxQuantity: number;
}

export default function ReplacementItemModal({
  isOpen,
  onClose,
  originalItemId,
  maxQuantity,
}: ReplacementItemModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useDispatch();

  const [selectedManufacturerId, setSelectedManufacturerId] =
    useState<string>("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [sku, setSku] = useState<string>("");

  // Fetch manufacturers
  const { data: manufacturers, isLoading: isLoadingManufacturers } =
    useGetManufacturersQuery();

  // Fetch all brands and filter client-side
  const { data: allBrands, isLoading: isLoadingBrands } = useGetBrandsQuery();

  // Filter brands by selected manufacturer using linked_manufacturers
  const brands = selectedManufacturerId
    ? allBrands?.filter(
        (brand) =>
          brand.linked_manufacturers &&
          brand.linked_manufacturers.includes(
            parseInt(selectedManufacturerId)
          ) &&
          brand.is_active
      )
    : [];

  const handleAddReplacement = () => {
    if (!selectedManufacturerId || !selectedBrandId || !quantity || !sku) {
      return;
    }

    const selectedManufacturer = manufacturers?.find(
      (m) => m.id.toString() === selectedManufacturerId
    );
    const selectedBrand = brands?.find(
      (b) => b.id.toString() === selectedBrandId
    );

    if (!selectedManufacturer || !selectedBrand) {
      return;
    }

    const replacementItem = {
      id: `replacement-${Date.now()}-${Math.random()}`, // Temporary ID
      sku,
      quantity: parseInt(quantity),
      manufacturer: {
        id: selectedManufacturer.id,
        name: selectedManufacturer.name_en,
      },
      brand: {
        id: selectedBrand.id,
        name: selectedBrand.name_en,
      },
      originalItemId,
    };

    dispatch(addReplacementItem(replacementItem));
    handleClose();
  };

  const handleClose = () => {
    setSelectedManufacturerId("");
    setSelectedBrandId("");
    setQuantity("1");
    setSku("");
    onClose();
  };

  const isFormValid =
    selectedManufacturerId &&
    selectedBrandId &&
    quantity &&
    sku &&
    parseInt(quantity) > 0 &&
    parseInt(quantity) <= maxQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>{t("addReplacementItem")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("addReplacementItemDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Manufacturer Selection */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer">{t("manufacturer")}</Label>
            <Select
              value={selectedManufacturerId}
              onValueChange={setSelectedManufacturerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectManufacturer")} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingManufacturers ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2">{t("loading")}</span>
                  </div>
                ) : (
                  manufacturers?.map((manufacturer) => (
                    <SelectItem
                      key={manufacturer.id}
                      value={manufacturer.id.toString()}
                    >
                      {locale === "ar"
                        ? manufacturer.name_ar
                        : manufacturer.name_en}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brand">{t("brand")}</Label>
            <Select
              value={selectedBrandId}
              onValueChange={setSelectedBrandId}
              disabled={!selectedManufacturerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectBrand")} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBrands ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2">{t("loading")}</span>
                  </div>
                ) : (
                  brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {locale === "ar" ? brand.name_ar : brand.name_en}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* SKU Input */}
          <div className="space-y-2">
            <Label htmlFor="sku">{t("sku")}</Label>
            <Input
              id="sku"
              type="text"
              placeholder={t("enterSku")}
              value={sku}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSku(e.target.value)
              }
              className="w-full"
            />
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              placeholder="1"
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuantity(e.target.value)
              }
              className="w-full"
            />
            {parseInt(quantity) > maxQuantity && (
              <p className="text-xs text-red-500">
                {t("quantityExceedsAvailable")}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {t("maxQuantity")}: {maxQuantity}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            {t("cancel")}
          </Button>
          <Button onClick={handleAddReplacement} disabled={!isFormValid}>
            {t("addItem")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
