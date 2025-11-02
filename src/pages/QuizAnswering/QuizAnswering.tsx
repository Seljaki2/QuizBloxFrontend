import { useEffect, useState } from 'react';
import { Button, Card, Flex, Form, Image } from 'antd';
import styles from './QuizAnswering.module.css';
import TextArea from 'antd/es/input/TextArea';
import { socket } from '../../fetch/socketio';
import { questionIndex, session, users } from '../../fetch/GAMINGSESSION';
import type { Answer, AppUser, GuestUser } from '../../fetch/types';
import { PICTURE_URL } from '../../api';
import { useNavigate } from "react-router-dom";
       
export default function QuizAnswering() {
  const isQuizOver = true;
  const navigate = useNavigate();
  const colorClasses = [styles.blue, styles.pink, styles.orange, styles.green];

  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null | string>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [userInput, setUserInput] = useState('null');
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [usersState, setUsersState] = useState(users);

  const handleAnswer = (answer: Answer, colorClass: string) => {
    setSelectedAnswer(answer);
    setSelectedColor(colorClass);
    setWaiting(true);

    sendShit(session?.quiz.questions[questionIndexState].id, answer.id, userInput, Date.now(), undefined);
    console.log('Submitted preset/media answer:', answer);
    setWaiting(false);

  };

  const sendShit = (questionId: string, answerId: string | null, userEntry: string, answerTime: number, isCorrect: string | undefined) => {
    socket?.emit('answer-question', {
      questionId: questionId,
      answerId: answerId,
      userEntry: userEntry,
      answerTime: answerTime,
      isCustomCorrect: isCorrect,
    });
    console.log('sendShit', 'zaj sem v sendShit');
    console.log('stuff', session);
  };

  const handleCustomQuestion = () => {
    console.log('handleCustomQuestion', 'zaj sem v handleCustomQuestion');
    const questionText = session?.quiz.questions[questionIndexState].answers[0].text || '';
    const input = userInput.trim().toLowerCase();

    if (!questionText || !input) return false;

    const answers = questionText
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);
    const isMatch = answers.some(answer => input.includes(answer));

    return isMatch;
  };

  const handleTextSubmit = () => {
    setSelectedAnswer('custom');
    setWaiting(true);
    const isCorrect = handleCustomQuestion();
    sendShit(session?.quiz.questions[questionIndexState].id, null, userInput, Date.now(), isCorrect.toString());
    console.log('handleTextSubmit', 'zaj sem v handleTextSubmit');
    setResult(isCorrect ? 'correct' : 'incorrect');
  };

  useEffect(() => {
    socket?.on('next-question', (index: number) => {
      setQuestionIndexState(index);
      setSelectedAnswer(null);
      setSelectedColor('');
      setUserInput('null');
      setWaiting(false);
      setResult(null);
      setUserInput('');
    });
    socket?.on('finish-question', (currentUsers: Array<AppUser | GuestUser>) => {
      setUsersState(currentUsers);
      setWaiting(false);
    });

    return () => {
      socket?.off('next-question');
      socket?.off('finish-question');
    };
  }, []);


    const average = Math.round(
        (testUsers[0].score + testUsers[1].score + testUsers[2].score) / testUsers.length
    );

    if (isQuizOver) {
        return (
            <Card className={styles.card}>
                <>
                    {average <= currentUser.score ? (
                        <>
                            <h1 className={styles.header2}>Odlično, {currentUser.username}!</h1>
                            <Flex className={styles.flexContainer} gap="medium">
                                <div className={styles.scoreGood}>
                                    <span className={styles.boxTitle}>Tvoj rezultat</span>
                                    <span className={styles.boxValue}>{currentUser.score} točk</span>
                                </div>
                                <div className={styles.avg}>
                                    <span className={styles.boxTitle}>Povprečje</span>
                                    <span className={styles.boxValue}>{average} točk</span>
                                </div>
                            </Flex>
                            <p className={styles.sentence}>Dosegli ste nadpovprečno število točk, čestitke! Le tako naprej!</p>
                        </>
                    ) : (
                        <>
                            <h1 className={styles.header2}>Skoraj, {currentUser.username}!</h1>
                            <Flex className={styles.flexContainer} gap="small">
                                <div className={styles.scoreBad}>
                                    <span className={styles.boxTitle}>Tvoj rezultat</span>
                                    <span className={styles.boxValue}>{currentUser.score} točk</span>
                                </div>
                                <div className={styles.avg}>
                                    <span className={styles.boxTitle}>Povprečje</span>
                                    <span className={styles.boxValue}>{average} točk</span>
                                </div>
                            </Flex>
                            <p className={styles.sentence}>Dosegli ste podpovprečno število točk, saj bo! Malo truda pa bo bolje!</p>
                        </>
                    )}
                </>
                <Flex className={styles.buttonContainer} gap="small">
                    <Button className={styles.button}>Poglej si poročilo</Button>
                    <Button className={styles.homeButton} onClick={() => navigate("/")}>
                        Domov
                    </Button>
                </Flex>        
            </Card>
        );
    }


    return (
    <Flex
      style={{ width: '100%', position: 'relative' }}
      vertical
      align="center"
      justify="center"
      className={styles.container}
    >
      {(questionIndexState>0)?<Card className={styles.infoCard}>
        <div className={styles.infoTitle}>Tvoja statistika</div>
        <div>Mesto: #5</div>
        <div>Točke: 1450</div>
        <div>+25 točk da prihitiš igralca #4</div>
        <div>+80 točk pred igralcem #6</div>
      </Card>:null}

      {!selectedAnswer && <h1 className={styles.header}>ODGOVORI:</h1>}

      {selectedAnswer && waiting && (
        <h1
          className={styles.header}
        >
          Čakamo, da vsi zaključijo ...
        </h1>
      )}

      {result && !waiting && (
        <h1
          className={styles.header}
          style={{
            marginTop: '2rem',
            color: result === 'correct' ? '#4CAF50' : '#d33434',
          }}
        >
          {result === 'correct' ? 'Pravilen odgovor!' : 'Napačen odgovor!'}
        </h1>
      )}

      {session?.quiz.questions[questionIndexState].questionType == 'CUSTOM_ANWSER' &&
        !waiting &&
        !result &&
        !selectedAnswer && (
          <Form style={{ width: '80%' }} onFinish={handleTextSubmit}>
            <Form.Item name={['answer']}>
              <TextArea
                autoSize={{ minRows: 5, maxRows: 5 }}
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '15px solid #5FAFF5',
                }}
                className={styles.textField}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.commitButton}
            >
              Oddaj
            </Button>
          </Form>
        )}

      {session?.quiz.questions[questionIndexState].questionType == 'PRESET_ANWSER' &&
        !waiting &&
        !result &&
        !selectedAnswer && (
          <Form>
            <Flex wrap="wrap" justify="center" gap="large">
              {session?.quiz.questions[questionIndexState].answers?.map((answer: any, index: any) => {
                const color = colorClasses[index % colorClasses.length];
                return (
                  <Button
                    key={index}
                    type="default"
                    htmlType="button"
                    className={`${styles.textButton} ${color}`}
                    onClick={() => handleAnswer(answer, color)}
                  >
                    <div className={styles.textButtonContent}>
                      {answer.text}
                    </div>
                  </Button>
                );
              })}
            </Flex>
          </Form>
        )}

      {session?.quiz.questions[questionIndexState].questionType == 'MEDIA_ANWSER' &&
        !waiting &&
        !result &&
        !selectedAnswer && (
          <Form>
            <Flex
              wrap="wrap"
              justify="center"
              align="center"
              gap="large"
              style={{ width: '100%' }}
            >
              {session?.quiz.questions[questionIndexState].answers.map((answer: any, index: any) => {
                const color = colorClasses[index % colorClasses.length];
                return (
                  <Button
                    key={index}
                    type="default"
                    htmlType="button"
                    className={`${styles.imageButton} ${color}`}
                    onClick={() => handleAnswer(answer, color)}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={answer.content}
                        preview={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </Button>
                );
              })}
            </Flex>
          </Form>
        )}

      {selectedAnswer && !waiting && (
        <div style={{ marginTop: '2rem' }}>
          {session?.quiz.questions[questionIndexState].questionType == 'CUSTOM_ANWSER' ? (
            <div className={
              result === 'correct'
                ? styles.bounce
                : result === 'incorrect'
                  ? styles.shake
                  : ''
            }
            >
              <span className={styles.spanText}> Tvoj odgovor: <span
                style={{ color: '#64F55F' }}>{userInput} </span> </span>
            </div>
          ) : session?.quiz.questions[questionIndexState].questionType == 'PRESET_ANWSER' ? (
            <Button
              type="default"
              className={`${styles.textButton} ${selectedColor} ${result === 'correct'
                ? styles.bounce
                : result === 'incorrect'
                  ? styles.shake
                  : ''
              }`}
              disabled
            >
              <div className={styles.textButtonContent}>
                {selectedAnswer.text}
              </div>
            </Button>
          ) : session?.quiz.questions[questionIndexState].questionType == 'MEDIA_ANWSER' ? (
            <Button
              type="default"
              className={`${styles.imageButton} ${selectedColor} ${result === 'correct'
                ? styles.bounce
                : result === 'incorrect'
                  ? styles.shake
                  : ''
              }`} disabled
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={PICTURE_URL + selectedAnswer?.media?.path}
                  preview={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </Button>
          ) : null}
        </div>
      )}
    </Flex>
  );
}
