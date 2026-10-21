// Pure form serialization, kept separate so checkbox behavior can be tested without a browser.
export function readQuizAnswers(formData, questions) {
  return Object.fromEntries(questions.map((question) => [question.id,
    question.multiple ? formData.getAll(question.id) : formData.get(question.id),
  ]));
}
