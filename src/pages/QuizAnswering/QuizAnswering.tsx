import { useContext, useEffect, useState } from 'react';
import { Button, Card, Flex, Form, Image } from 'antd';
import styles from './QuizAnswering.module.css';
import TextArea from 'antd/es/input/TextArea';
import { socket } from '../../fetch/socketio';
import { clearSession, guestUsername, questionIndex, session, users } from '../../fetch/GAMINGSESSION';
import type { Answer, AppUser, GuestUser } from '../../fetch/types';
import { PICTURE_URL } from '../../api';
import { useNavigate } from "react-router-dom";
import { UserContext } from '../../context/UserContext.tsx';

export default function QuizAnswering() {
  const navigate = useNavigate();
  const colorClasses = [styles.blue, styles.pink, styles.orange, styles.green];
  const [isQuizOver, setIsQuizOver] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null | string>(null);
  const [userInput, setUserInput] = useState('null');
  const [waiting, setWaiting] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [questionIndexState, setQuestionIndexState] = useState(questionIndex);
  const [usersState, setUsersState] = useState(users);
  const [average, setAverage] = useState(0);
  const [userState, setUserState] = useState<number>(-1);
  const { user } = useContext(UserContext);

  const getUserIndex = () => {
    const index = usersState.findIndex(u =>
      guestUsername
        ? ('guestUsername' in u ? u.guestUsername === guestUsername : false)
        : ('username' in u ? u.username === user.username : false)
    );

    setUserState(index);
  };


  const handleAnswer = (answer: Answer, colorClass: string) => {
    setSelectedAnswer(answer);
    setWaiting(true);

    sendQuestion(session?.quiz.questions[questionIndexState].id, answer.id, null, Date.now(), undefined);
    setResult(answer.isCorrect ? 'correct' : 'incorrect')
    setWaiting(false);

  };

  const sendQuestion = (questionId: string, answerId: string | null, userEntry: string, answerTime: number, isCorrect: string | undefined) => {
    socket?.emit('answer-question', {
      questionId: questionId,
      answerId: answerId,
      userEntry: userEntry,
      answerTime: answerTime,
      isCustomCorrect: isCorrect,
    });
  };

  const handleCustomQuestion = () => {
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
    sendQuestion(session?.quiz.questions[questionIndexState].id, null, userInput, Date.now(), isCorrect.toString());
    setResult(isCorrect ? 'correct' : 'incorrect');
  };

  useEffect(() => {
    socket?.on('next-question', (index: number) => {
      setQuestionIndexState(index);
      setSelectedAnswer(null);
      setUserInput('null');
      setWaiting(false);
      setResult(null);
      setUserInput('');
      getUserIndex();
    });
    socket?.on('finish-question', (currentUsers: Array<AppUser | GuestUser>) => {
      setUsersState(currentUsers);
      setAverage(calcAverage(currentUsers));
      setWaiting(false);
      getUserIndex()
      if (questionIndexState >= session?.quiz.questions.length - 1) {
        setIsQuizOver(true);
      }
    });
    socket?.on('disconnect', () => {
      clearSession();
      navigate("/");
    })

    return () => {
      socket?.off('next-question');
      socket?.off('finish-question');
    };
  }, [getUserIndex, navigate, questionIndexState]);


  const calcAverage = (currentUsers: Array<AppUser | GuestUser>) => {
    if (!currentUsers || currentUsers.length === 0) return 0;
    const total = currentUsers.reduce((sum, user) => sum + user.totalScore, 0);
    return Math.round(total / currentUsers.length);
  }

  if (isQuizOver) {
    return (
      <Card className={styles.card}>
        <>
          {average <= usersState[userState]?.totalScore ? (
            <>
              <h1 className={styles.header2}>Odlično, {(usersState[userState]?.guestUsername) ? usersState[userState]?.guestUsername : usersState[userState]?.username}!</h1>
              <Flex className={styles.flexContainer} gap="medium">
                <div className={styles.scoreGood}>
                  <span className={styles.boxTitle}>Tvoj rezultat</span>
                  <span className={styles.boxValue}>{usersState[userState]?.totalScore} točk</span>
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
              <h1 className={styles.header2}>Skoraj, {(usersState[userState]?.guestUsername) ? usersState[userState]?.guestUsername : usersState[userState]?.username}!</h1>
              <Flex className={styles.flexContainer} gap="small">
                <div className={styles.scoreBad}>
                  <span className={styles.boxTitle}>Tvoj rezultat</span>
                  <span className={styles.boxValue}>{usersState[userState]?.totalScore} točk</span>
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
          <Button className={styles.button} onClick={() => {
            const sessionId = session?.session.id;
            clearSession();
            if (sessionId) {
              navigate('/reports', {
                state: {
                  sessionId: sessionId
                }
              });
            };
          }}>Poglej si poročilo</Button>
          <Button className={styles.homeButton} onClick={() => { clearSession(); navigate("/"); }}>
            Domov
          </Button>
        </Flex>
      </Card>
    );
  } else {


    return (
      <Flex
        style={{ width: '100%', position: 'relative' }}
        vertical
        align="center"
        justify="center"
        className={styles.container}
      >
        {(questionIndexState > 0) ? <Card className={styles.infoCard}>
          <div className={styles.infoTitle}>Tvoja statistika</div>
          <div>Mesto: {userState + 1}</div>
          <div>Točke: {usersState[userState].totalScore}</div>
          {(userState == 0 && usersState.length > 1) ?
            <div>+{usersState[userState + 1].totalScore - usersState[userState].totalScore} točk da prehitiš igralca
              #{userState + 2}</div> : null}
          {(userState >= usersState.length && usersState.length > 1) ?
            <div>+{usersState[userState].totalScore - usersState[userState - 1].totalScore} točk pred igralcem
              #{userState}</div> : null}
        </Card> : null}

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
                {session?.quiz.questions[questionIndexState].answers.map((answer: Answer, index: any) => {
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
                          src={PICTURE_URL + answer?.media?.path}
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

        {selectedAnswer != null && !waiting && (
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
                  style={{ color: 'Black' }}>{userInput} </span> </span>
              </div>
            ) : session?.quiz.questions[questionIndexState].questionType == 'PRESET_ANWSER' && !waiting ? (
              <Button
                type="text"
                className={
                  result === 'correct'
                    ? styles.bounceButton
                    : result === 'incorrect'
                      ? styles.shakeButton
                      : ''
                }
                disabled
              >
                <div className={styles.textButtonContent} style={{ "color": "white" }}>
                  {selectedAnswer.text}
                </div>
              </Button>
            ) : session?.quiz.questions[questionIndexState].questionType == 'MEDIA_ANWSER' && !waiting ? (
              <Button
                type="text"
                className={
                  result === 'correct'
                    ? styles.bounceButton
                    : result === 'incorrect'
                      ? styles.shakeButton
                      : ''
                } disabled
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={PICTURE_URL + selectedAnswer?.media.path}
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
}
