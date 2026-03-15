import type { SourceAdapter } from "../base/types";

export const tuiAdapter: SourceAdapter = {
  source: "tui.dk",
  async search() {
    return {
      source: "tui.dk",
      status: "partial" as const,
      notes: [
        "Adapter scaffolded, but the public search flow appears more JS-heavy and needs a separate selector pass.",
        "For the MVP, this source stays documented but inactive rather than pretending to be reliable.",
      ],
      deals: [],
    };
  },
};

