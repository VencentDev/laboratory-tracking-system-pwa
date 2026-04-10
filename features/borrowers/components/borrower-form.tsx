"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { trpc } from "@/core/lib/trpc-client";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { BorrowerTypeSelector } from "@/features/borrowers/components/borrower-type-selector";
import { borrowerSchema, type BorrowerInput } from "@/features/borrowers/lib/validations";
import type { BorrowerProfile } from "@/features/borrowers/types";

type BorrowerFormProps = {
  borrower?: BorrowerProfile;
  mode?: "create" | "edit";
};

export function BorrowerForm({ borrower, mode = borrower ? "edit" : "create" }: BorrowerFormProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const utils = trpc.useUtils();
  const createBorrowerMutation = trpc.borrowers.create.useMutation();
  const updateBorrowerMutation = trpc.borrowers.update.useMutation();
  const form = useForm<BorrowerInput>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: {
      schoolId: borrower?.schoolId ?? "",
      name: borrower?.name ?? "",
      type: borrower?.type ?? "student",
      program: borrower?.program ?? "",
      yearLevel: borrower?.yearLevel ? String(borrower.yearLevel) : "",
      section: borrower?.section ?? "",
      contactNumber: borrower?.contactNumber ?? "",
    },
  });

  const isReadOnly = false;

  const onSubmit = form.handleSubmit(async (values) => {
    if (isReadOnly) {
      return;
    }

    setMessage(null);

    try {
      if (borrower) {
        const updatedBorrower = await updateBorrowerMutation.mutateAsync({
          id: borrower.id,
          ...values,
        });

        if (!updatedBorrower) {
          setMessage({
            type: "error",
            text: "Borrower details could not be updated. Try again once the database is available.",
          });
          return;
        }

        await utils.borrowers.list.invalidate();
        await utils.borrowers.byId.invalidate({ id: borrower.id });
        await utils.borrowers.bySchoolId.invalidate({ schoolId: borrower.schoolId });
        await utils.borrowers.bySchoolId.invalidate({ schoolId: values.schoolId });
        toast.success(`${updatedBorrower.name} was updated successfully.`);
        return;
      }

      const createdBorrower = await createBorrowerMutation.mutateAsync(values);

      if (!createdBorrower) {
        setMessage({
          type: "error",
          text: "Borrower recording failed. School ID must remain unique.",
        });
        return;
      }

      await utils.borrowers.list.invalidate();
      form.reset({
        schoolId: "",
        name: "",
        type: "student",
        program: "",
        yearLevel: "",
        section: "",
        contactNumber: "",
      });
      toast.success(`${createdBorrower.name} was recorded and is ready for accountability tracking.`);
    } catch {
      setMessage({
        type: "error",
        text: "The request could not be completed. Try again once the database is available.",
      });
    }
  });

  const isSaving = !isReadOnly && (createBorrowerMutation.isPending || updateBorrowerMutation.isPending);
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{borrower ? "Edit Borrower" : "Borrower Profile"}</CardTitle>
        <CardDescription>
          Record borrower identity details in a simple digital form that supports laboratory accountability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-school-id" label="School ID">
                <Input id="borrower-school-id" readOnly={isReadOnly} {...form.register("schoolId")} />
              </OverlappingField>
              {form.formState.errors.schoolId ? (
                <p className="text-sm text-destructive">{form.formState.errors.schoolId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-type" label="Type">
                <BorrowerTypeSelector
                  value={selectedType}
                  disabled={isSaving || isReadOnly}
                  onChange={(value) => {
                    form.setValue("type", value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </OverlappingField>
              {form.formState.errors.type ? (
                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <OverlappingField htmlFor="borrower-name" label="Name">
              <Input id="borrower-name" readOnly={isReadOnly} {...form.register("name")} />
            </OverlappingField>
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-program" label="Program">
                <Input id="borrower-program" readOnly={isReadOnly} {...form.register("program")} />
              </OverlappingField>
              {form.formState.errors.program ? (
                <p className="text-sm text-destructive">{form.formState.errors.program.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-year-level" label="Year Level">
                <Input id="borrower-year-level" readOnly={isReadOnly} {...form.register("yearLevel")} />
              </OverlappingField>
              {form.formState.errors.yearLevel ? (
                <p className="text-sm text-destructive">{form.formState.errors.yearLevel.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-section" label="Section">
                <Input id="borrower-section" readOnly={isReadOnly} {...form.register("section")} />
              </OverlappingField>
              {form.formState.errors.section ? (
                <p className="text-sm text-destructive">{form.formState.errors.section.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <OverlappingField htmlFor="borrower-contact" label="Contact Number">
                <Input id="borrower-contact" readOnly={isReadOnly} {...form.register("contactNumber")} />
              </OverlappingField>
              {form.formState.errors.contactNumber ? (
                <p className="text-sm text-destructive">{form.formState.errors.contactNumber.message}</p>
              ) : null}
            </div>
          </div>

          {message ? (
            <p className="text-sm text-destructive">
              {message.text}
            </p>
          ) : null}
          {!isReadOnly ? (
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : borrower ? "Update borrower" : "Record borrower"}
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
