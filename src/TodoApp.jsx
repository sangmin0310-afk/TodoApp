import { useState, useEffect } from 'react';
import './App.css';

function TodoApp() {
  // 상태 변수 정의
  const [todos, setTodos] = useState([]); // 할 일 목록 상태
  const [inputValue, setInputValue] = useState(''); // 입력 필드 값 상태
  const [editIndex, setEditIndex] = useState(null); // 편집 중인 할 일의 인덱스 상태
  const [editValue, setEditValue] = useState(''); // 편집 중인 할 일의 새 값 상태
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크 모드 여부 상태
  const [currentTime, setCurrentTime] = useState(new Date()); // 현재 시간 상태
  const [advice, setAdvice] = useState(null); // 조언 상태

  // 컴포넌트가 처음 렌더링될 때 실행되는 useEffect
  useEffect(() => {
    // 로컬 스토리지에서 저장된 할 일 목록을 불러오기
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    setTodos(savedTodos);

    // 로컬 스토리지에서 저장된 테마 정보를 불러오기
    const savedThema = localStorage.getItem('thema');
    if (savedThema) {
      setIsDarkMode(savedThema === 'dark');
    }

    // 현재 시간을 1초마다 업데이트하는 타이머 설정
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  // 할 일 목록이 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 테마가 변경될 때 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('thema', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 조언을 가져오는 useEffect
  useEffect(() => {
    fetch('https://korean-advice-open-api.vercel.app/api/advice')
      .then((res) => res.json())
      .then((data) => setAdvice(data))
      .catch((error) => console.error('Error fetching advice:', error));
  }, []);

  // 새 할 일을 추가하는 함수
  const handleAdd = () => {
    if (inputValue.trim() === '') return; // 입력값이 비어있으면 무시
    setTodos([...todos, { text: inputValue, completed: false }]); // 새로운 할 일 추가
    setInputValue(''); // 입력 필드 비우기
  };

  // 입력 필드 값 변경
  const handleInput = (e) => {
    setInputValue(e.target.value);
  };

  // 할 일을 편집하기
  const handleEdit = (index) => {
    setEditIndex(index); // 편집할 할 일의 인덱스 설정
    setEditValue(todos[index].text); // 편집할 할 일의 기존 값 설정
  };

  // 편집 완료 후 저장
  const handleSave = () => {
    if (editValue.trim() === '') return; // 편집값이 비어있으면 무시
    const updateTodos = todos.map((todo, index) =>
      index === editIndex ? { ...todo, text: editValue } : todo
    ); // 편집된 할 일 목록 업데이트
    setTodos(updateTodos);
    setEditIndex(null); // 편집 인덱스 초기화
    setEditValue(''); // 편집 값 초기화
  };

  // 편집 중인 값 변경
  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  // 할 일 삭제
  const handleDelete = (index) => {
    setTodos(todos.filter((_, i) => i !== index)); // 해당 인덱스의 할 일 삭제
  };

  // 할 일 완료/미완료 토글
  const handleToggle = (index) => {
    const updatedTodos = todos.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    ); // 해당 인덱스의 완료 상태 반전
    setTodos(updatedTodos);
  };

  // 테마(다크 모드/라이트 모드) 토글
  const handleThema = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <h1>Todo List</h1>
      <button onClick={handleThema}>
        {isDarkMode ? '라이트 모드' : '다크 모드'}
      </button>
      <div className="weather-time">
        <p>현재 시간: {currentTime.toLocaleTimeString()}</p>
      </div>
      {editIndex === null ? (
        <>
          <input
            type="text"
            value={inputValue}
            onChange={handleInput}
            placeholder="메모를 적어보세요"
          />
          <button onClick={handleAdd}>추가</button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={editValue}
            onChange={handleChange}
            placeholder="수정할 내용을 입력하세요"
          />
          <button onClick={handleSave}>저장</button>
          <button onClick={() => setEditIndex(null)}>취소</button>
        </>
      )}
      <ul>
        {todos.map((todo, index) => (
          <li
            key={index}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
          >
            {todo.text}
            <button onClick={() => handleEdit(index)}>수정</button>
            <button onClick={() => handleDelete(index)}>삭제</button>
            <button onClick={() => handleToggle(index)}>
              {todo.completed ? '미완료' : '완료'}
            </button>
          </li>
        ))}
      </ul>
      <div className="advice-section">
        <h2>오늘의 조언</h2>
        {advice ? (
          <>
            <div>{advice.message}</div>
            <div>{advice.author}</div>
          </>
        ) : (
          <p>조언을 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
