interface QuestionDraft {
  questionId: string | null;
  draft: string;
  reasoning: string;
}
// A replaced card must never read an input that still belongs to its predecessor.
export function saveQuestionDraft(
  session: QuestionDraft,
  renderedQuestionId: string | undefined,
  answer: string,
  reasoning: string,
): boolean {
  if (session.questionId !== renderedQuestionId) return false;
  session.draft = answer;
  session.reasoning = reasoning;
  return true;
}
