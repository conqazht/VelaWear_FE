import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DeleteResourceDialog,
  ResourceFormSheet,
} from "@/app/(admin)/dashboard/_components/management/resource-overlays";
import { I18nCatalogProvider, I18nProvider } from "@/components/providers/i18n-provider";
import { adminMessages } from "@/lib/i18n/messages/catalog-admin";

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="vi">
      <I18nCatalogProvider messages={adminMessages}>{ui}</I18nCatalogProvider>
    </I18nProvider>,
  );
}

describe("ResourceOverlays", () => {
  describe("ResourceFormSheet / Modal Dialog", () => {
    it("renders dialog with title, description, and form children when open", () => {
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn();

      renderWithI18n(
        <ResourceFormSheet
          open={true}
          onOpenChange={onOpenChange}
          title="Create Category"
          description="Fill in category details"
          onSubmit={onSubmit}
        >
          <div data-testid="form-field">
            <input name="name" placeholder="Category Name" />
          </div>
        </ResourceFormSheet>,
      );

      expect(screen.getByText("Create Category")).toBeInTheDocument();
      expect(screen.getByText("Fill in category details")).toBeInTheDocument();
      expect(screen.getByTestId("form-field")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /lưu thay đổi|save/i })).toBeInTheDocument();
    });

    it("calls onOpenChange(false) when cancel button is clicked", () => {
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn();

      renderWithI18n(
        <ResourceFormSheet
          open={true}
          onOpenChange={onOpenChange}
          title="Edit Category"
          description="Update details"
          onSubmit={onSubmit}
        >
          <div>Form content</div>
        </ResourceFormSheet>,
      );

      const cancelButton = screen.getByRole("button", { name: /hủy|cancel/i });
      fireEvent.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("disables submit button and fieldset when isPending is true", () => {
      renderWithI18n(
        <ResourceFormSheet
          open={true}
          onOpenChange={vi.fn()}
          title="Edit Category"
          description="Update details"
          onSubmit={vi.fn()}
          isPending={true}
        >
          <div>Form content</div>
        </ResourceFormSheet>,
      );

      const submitButton = screen.getByRole("button", { name: /lưu thay đổi|save/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("DeleteResourceDialog", () => {
    it("renders alert dialog with resource name and action confirmation", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      renderWithI18n(
        <DeleteResourceDialog
          open={true}
          onOpenChange={onOpenChange}
          resourceName="Summer Collection"
          onConfirm={onConfirm}
        />,
      );

      expect(screen.getByText(/Summer Collection/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hủy/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /xóa/i })).toBeInTheDocument();
    });

    it("triggers onConfirm callback when confirm button is clicked", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      renderWithI18n(
        <DeleteResourceDialog
          open={true}
          onOpenChange={onOpenChange}
          resourceName="Test Item"
          onConfirm={onConfirm}
        />,
      );

      const confirmButton = screen.getByRole("button", { name: /xóa/i });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
