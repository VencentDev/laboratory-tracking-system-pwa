"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { trpc } from "@/core/lib/trpc-client";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { BarcodeDisplay } from "@/features/inventory/components/barcode-display";
import { CategorySelector } from "@/features/inventory/components/category-selector";
import { ToolStatusSelector } from "@/features/inventory/components/tool-status-selector";
import { useTools } from "@/features/inventory/hooks/use-tools";
import { getNextToolBarcodePreview } from "@/features/inventory/lib/barcode";
import { getCategoryOptions } from "@/features/inventory/lib/category-options";
import { toolSchema, type ToolInput } from "@/features/inventory/lib/validations";
import type { ToolProfile } from "@/features/inventory/types";

type ToolFormProps = {
  tool?: ToolProfile;
};

function getDefaultValues(tool?: ToolProfile): ToolInput {
  return {
    name: tool?.name ?? "",
    description: tool?.description ?? "",
    category: tool?.category ?? "",
    currentStatus: tool?.currentStatus ?? "available",
  };
}

export function ToolForm({ tool }: ToolFormProps) {
  const utils = trpc.useUtils();
  const { data: tools } = useTools();
  const createToolMutation = trpc.tools.create.useMutation();
  const updateToolMutation = trpc.tools.update.useMutation();
  const form = useForm<ToolInput>({
    resolver: zodResolver(toolSchema),
    defaultValues: getDefaultValues(tool),
  });
  const displayedBarcode = tool?.barcode ?? getNextToolBarcodePreview(tools);
  const categoryOptions = getCategoryOptions(tools);
  const categoryValue = useWatch({
    control: form.control,
    name: "category",
  });
  const currentStatusValue = useWatch({
    control: form.control,
    name: "currentStatus",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (tool) {
        const updatedTool = await updateToolMutation.mutateAsync({
          id: tool.id,
          ...values,
        });

        if (!updatedTool) {
          toast.error("Tool details could not be updated. Try again in a moment.");
          return;
        }

        await utils.tools.list.invalidate();
        toast.success(`${updatedTool.name} was updated successfully.`);
        return;
      }

      const createdTool = await createToolMutation.mutateAsync(values);

      if (!createdTool) {
        toast.error("Tool registration failed. Try again to generate a new barcode.");
        return;
      }

      await utils.tools.list.invalidate();
      form.reset(getDefaultValues());
      toast.success(`${createdTool.name} was registered and is ready for barcode printing.`);
    } catch {
      toast.error("The request could not be completed. Try again once the database is available.");
    }
  });

  const isSaving = createToolMutation.isPending || updateToolMutation.isPending;

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="px-0 pb-0 pt-0">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <OverlappingField htmlFor="tool-name" label="Name">
              <Input id="tool-name" placeholder="Digital microscope" {...form.register("name")} />
            </OverlappingField>
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <OverlappingField htmlFor="tool-description" label="Description">
              <Input id="tool-description" placeholder="Optional notes about the tool" {...form.register("description")} />
            </OverlappingField>
            {form.formState.errors.description ? (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <OverlappingField htmlFor="tool-category" label="Category">
              <CategorySelector
                categories={categoryOptions}
                value={categoryValue ?? ""}
                disabled={isSaving}
                onChange={(value) => {
                  form.setValue("category", value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              />
            </OverlappingField>
            {form.formState.errors.category ? (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            ) : null}
          </div>

          {tool ? (
            <div className="space-y-2">
              <OverlappingField htmlFor="tool-status" label="Status">
                <ToolStatusSelector
                  value={currentStatusValue}
                  onChange={(value) => {
                    if (value === "all") {
                      return;
                    }

                    form.setValue("currentStatus", value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  options={[
                    { value: "available", label: "Available" },
                    { value: "borrowed", label: "Borrowed" },
                    { value: "missing", label: "Missing" },
                  ]}
                  className="w-full justify-between rounded-xl"
                />
              </OverlappingField>
              {form.formState.errors.currentStatus ? (
                <p className="text-sm text-destructive">{form.formState.errors.currentStatus.message}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2 pt-1">
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">{tool ? "Assigned Barcode" : "Generated Barcode"}</p>
              <p className="text-xs text-muted-foreground">
                {tool
                  ? "This barcode stays fixed for the registered tool."
                  : "This barcode will be assigned when you register the tool."}
              </p>
            </div>
            <BarcodeDisplay showPrintButton={false} size="compact" value={displayedBarcode} />
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : tool ? "Update tool" : "Register tool"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
