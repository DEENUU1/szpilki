import { expect, it } from "vitest";
import { captionCategory } from "../src/book-category";
it("classifies unambiguous caption prefixes and keeps unrelated vessels unclassified", () => {
  expect(captionCategory("12 N. pośrodkowy (n. medianus)")).toBe("nervous");
  expect(captionCategory("3 M. ramienny (m. brachialis)")).toBe("muscular");
  expect(captionCategory("4 W. poboczne (lig. collaterale)")).toBe("articular");
  expect(captionCategory("1 Kość udowa (femur)")).toBe("skeletal");
  expect(captionCategory("7 T. ramienna (a. brachialis)")).toBe("other");
});
