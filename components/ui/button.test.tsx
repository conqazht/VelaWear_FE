import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button UI Component", () => {
  it("renders a standard native button by default", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });

    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders with custom variant and size classes", () => {
    render(
      <Button variant="outline" size="sm">
        Small Outline
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Small Outline" });

    expect(button).toHaveClass("border");
    expect(button).toHaveClass("text-[0.8rem]");
  });

  it("renders non-button custom link element without runtime console warnings", () => {
    const { container } = render(
      <Button render={<a href="https://example.com/external" />}>External Link</Button>,
    );

    const link = container.querySelector("a[href='https://example.com/external']");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("External Link");
    expect(link?.tagName).toBe("A");
  });
});
