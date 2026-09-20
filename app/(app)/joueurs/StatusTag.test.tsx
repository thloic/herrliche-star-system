import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTag } from "./StatusTag";

describe("StatusTag", () => {
  it("affiche « Payé » quand le mois est payé", () => {
    render(<StatusTag isPaid />);
    expect(screen.getByText("Payé")).toBeInTheDocument();
  });

  it("affiche « En attente » sinon", () => {
    render(<StatusTag isPaid={false} />);
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("reste un simple texte sans onClick", () => {
    render(<StatusTag isPaid={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("devient cliquable et appelle onClick sans propager le clic", async () => {
    const onClick = vi.fn();
    render(<StatusTag isPaid={false} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "En attente" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
