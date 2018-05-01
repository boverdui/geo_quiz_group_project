const Request = require('./helpers/request.js');
const CountriesData = require('./models/countries_data.js');
const CountdownTimer = require('./models/countdown_timer.js');
const QuizData = require('./models/quiz_data.js');
const QuizView = require('./views/quiz_view.js');
const StartView = require('./views/start_view.js');

const leaderboardRequest = new Request('./db/leaderboard');
let result = {};

document.addEventListener('DOMContentLoaded', () => {
  const newQuizButton = document.querySelector("#new-quiz-button");
  const quizContainer = document.querySelector("#quiz-container");

  const countriesData = new CountriesData();
  const quizData = new QuizData(countriesData);
  const quizView = new QuizView(quizContainer);
  const startView = new StartView(quizContainer);

  const timer = new CountdownTimer(10);
  timer.start();

  countriesData.getData(() => {
    newQuizButton.addEventListener('click', () =>  {
      startView.renderStart((startButton, input) =>  {
        startButton.addEventListener('click', (event) => {
          event.preventDefault();
          quizData.generateQuiz();
          result.score = 0;
          result.name = input.value;
          renderNewQuestion(-1, quizData, quizView);
        });
      });
    });
  });
});

const incrementScore = function() {
  result.score += 1;
}

const renderNewQuestion = function(index, quizData, quizView) {
  if (index < quizData.questions.length - 1) {
    quizView.renderQuestion(
      quizData.questions[index + 1],
      () => {
        renderNewQuestion(index + 1, quizData, quizView);
      },
      incrementScore
    );
  }
  else {
    quizView.renderResult(result);
    leaderboardRequest.post(result, () => {console.log('Successfully wrote to db')});
  }
}
