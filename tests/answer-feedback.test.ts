import { expect, it } from "vitest";
import { answerFeedback } from "../src/domain";
it("suggests one-letter typos without silently accepting related anatomy or vertebral levels", () => {
  expect(answerFeedback("nerw posrodkoy", ["nerw pośrodkowy"])).toBe("typo");
  expect(answerFeedback("nervus medianus", ["Nervus medianus"])).toBe("exact");
  expect(answerFeedback("nervus ulnaris", ["Nervus medianus"])).toBe(
    "different",
  );
  expect(answerFeedback("C3", ["C4"])).toBe("different");
});
