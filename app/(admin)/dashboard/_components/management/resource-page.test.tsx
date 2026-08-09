import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResourcePage } from "@/app/(admin)/dashboard/_components/management/resource-page";
import { I18nProvider } from "@/components/providers/i18n-provider";

vi.mock("@/components/errors/animated-status", () => ({
  AnimatedStatus: ({ code }: { code: string }) => (
    <div data-testid="animated-status">HTTP {code}</div>
  ),
}));

type TestRow = {
  id: number;
  name: string;
};

const cachedRow: TestRow = {
  id: 1,
  name: "Áo linen đã lưu",
};

function renderResourcePage({
  rows,
  status,
}: {
  rows: TestRow[];
  status: number;
}) {
  return render(
    <I18nProvider initialLocale="vi">
      <ResourcePage
        title="Sản phẩm"
        description="Quản lý danh mục sản phẩm"
        rows={rows}
        columns={[
          {
            key: "name",
            header: "Tên",
            cell: (row) => row.name,
          },
        ]}
        total={rows.length}
        page={1}
        pageSize={10}
        pageCount={1}
        searchValue=""
        searchPlaceholder="Tìm sản phẩm"
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onRefresh={vi.fn()}
        error={{
          response: {
            status,
            data: { message: `Request failed with status ${status}` },
          },
        }}
      />
    </I18nProvider>,
  );
}

describe("ResourcePage error states", () => {
  it("keeps cached rows and shows an HTTP 503 warning without blocking artwork", () => {
    renderResourcePage({ rows: [cachedRow], status: 503 });

    expect(screen.getByText(cachedRow.name)).toBeInTheDocument();
    expect(screen.getByText("HTTP 503")).toBeInTheDocument();
    expect(screen.queryByTestId("animated-status")).not.toBeInTheDocument();
  });

  it("shows exact HTTP 503 artwork when no usable rows remain", () => {
    renderResourcePage({ rows: [], status: 503 });

    expect(screen.getByTestId("animated-status")).toHaveTextContent("HTTP 503");
  });

  it("keeps HTTP 403 blocking even when cached rows exist", () => {
    renderResourcePage({ rows: [cachedRow], status: 403 });

    expect(screen.getByTestId("animated-status")).toHaveTextContent("HTTP 403");
    expect(screen.queryByText(cachedRow.name)).not.toBeInTheDocument();
  });
});
