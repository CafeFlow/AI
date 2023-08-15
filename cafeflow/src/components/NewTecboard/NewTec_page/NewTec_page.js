import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../Constant";
import writer1 from "../../../icons/writer1.png";
import ViewCount from "../../../icons/ViewCount.png";
import check from "../../../icons/check.png";

import "./NewTec_page.css";

const NewTec_page = () => {
  const navigate = useNavigate();
  const { newtecId } = useParams(); // 현재 URL의 파라미터 추출

  // 상태 변수들
  const [newtec, setNewTec] = useState(null); // 질문 데이터를 저장하는 상태 변수
  const [editing, setEditing] = useState(false); // 편집 모드 상태 변수. 수정할 때 사용
  const [title, setTitle] = useState(""); // 제목을 저장하는 상태 변수
  const [content, setContent] = useState(""); // 내용을 저장하는 상태 변수
  const [comment, setComment] = useState(""); // 댓글을 저장하는 상태 변수
  const [comments, setComments] = useState([]); // 댓글 리스트를 저장하는 상태 변수
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글의 ID를 저장하는 상태
  const [editingComment, setEditingComment] = useState(""); // 수정할 댓글의 내용을 저장하는 상태
  const [isChecked, setIsChecked] = useState(false); // 채택하기 버튼
  const token = localStorage.getItem("jwtToken"); // JWT 토큰
  const currentUser = localStorage.getItem("nickname"); // 현재 로그인한 유저의 닉네임
  const [adoptedId, setadoptedId] = useState(""); //채택된 답변 id저장
  const [isadopted, setIsAdopted] = useState(false); //게시물이 체크되었는지 저장

  const nickname = localStorage.getItem("nickname");
  // 페이지가 렌더링될 때, 현재 questionId에 해당하는 질문의 데이터를 가져옴
  useEffect(() => {
    axios
      .get(`${API_URL}/ai-info/${newtecId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setNewTec(response.data.data);
        setTitle(response.data.data.title);
        setContent(response.data.data.content);
        setComments(response.data.data.answers); // 댓글 데이터 설정
        localStorage.setItem(
          "question_createdBy",
          response.data.data.createdBy
        );
        // console.log(response.data.data.questionCheck);
        if (response.data.data.questionCheck === "채택") {
          setIsAdopted(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [newtecId, token]);

  const username = localStorage.getItem("question_createdBy");
  // console.log("question_createdBy : "+username);
  // 날짜 형식을 YYYY-MM-DD 형태로 변환
  function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // NewTec 글 삭제 기능 : 현재 로그인 중인 유저의 정보와 질문 작성자의 정보가 일치해야함 보임
  const handleDelete = () => {
    if (window.confirm("글을 삭제하시겠습니까?")) {
      axios
        .delete(`${API_URL}/ai-info/${newtecId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response);
          console.log("NewTechnology 글 삭제 완료!");
          navigate("/newtec_list");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // NewTec 댓글 삭제 기능
  const handleDeleteComment = (id) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      axios
        .delete(`${API_URL}/ai-info/answer/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          console.log("댓글 삭제 완료!");
          setComments(comments.filter((comment) => comment.id !== id)); // 삭제된 댓글을 제외하고 댓글 리스트를 업데이트
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleAdoptionClick = (comment) => {
    //console.log("comment : " + comment.id);
    setadoptedId(comment.id);
    // flag

    axios
      .post(
        `${API_URL}/ai-info/answer/check?id=${comment.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
        // console.log(token);
        alert("에러 발생");
      });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingComment(comment.content);
  };

  // NewTec 댓글 수정 기능
  const handleCommentUpdate = () => {
    if (window.confirm("댓글을 수정하시겠습니까?")) {
      axios
        .patch(
          `${API_URL}/ai-info/answer/${editingCommentId}`, // 댓글을 수정하는 API의 경로
          {
            content: editingComment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // 서버로부터 응답을 받았을 때의 처리
          setComments(
            comments.map((comment) =>
              comment.id === editingCommentId ? response.data.data : comment
            )
          ); // 수정된 댓글을 업데이트
          setEditingCommentId(null); // 수정 모드 종료
          setEditingComment(""); // 수정 필드 초기화
          console.log("NewTec 댓글 수정 완료!");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // 수정 상태를 활성화하는 함수
  const handleEdit = () => {
    setEditing(true);
  };

  // 컴포넌트가 마운트되면 로컬 스토리지에서 상태를 불러옴
  useEffect(() => {
    const savedState = localStorage.getItem(`isChecked_${newtecId}`);
    if (savedState) {
      setIsChecked(JSON.parse(savedState));
    }
  }, [newtecId]);

  // const handleAdoptionClick = () => {
  //   setIsChecked(true);
  //   localStorage.setItem(`isChecked_${questionId}`, "true"); // 상태를 로컬 스토리지에 저장
  // };

  // QnA 질문 수정 기능 : 현재 로그인 중인 유저의 정보와 질문 작성자의 정보가 일치해야함 보임
  const handleUpdate = () => {
    if (window.confirm("질문을 수정하시겠습니까?")) {
      axios
        .patch(
          `${API_URL}/ai-info/${newtecId}`,
          {
            title: title,
            content: content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setEditing(false); // 수정 모드 종료
          setNewTec(response.data.data); // 수정된 질문 데이터를 설정
          console.log("NewTec 질문 수정 완료!");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // 댓글 기능 : 댓글 입력 완료 후 사용자의 닉네임과 함께 보이도록 설정
  const handleComment = () => {
    if (window.confirm("댓글을 입력하시겠습니까?")) {
      if (comment.trim() === "") {
        alert("내용을 입력해주세요!");
        return;
      }
      axios
        .post(
          `${API_URL}/ai-info/answer/${newtecId}`, // 댓글을 등록하는 API의 경로
          {
            content: comment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // 서버로부터 응답을 받았을 때의 처리
          setComment(""); // 댓글 입력 필드를 초기화
          console.log("댓글 입력 성공!");
          console.log(response.data);
          console.log(response.data.data.createdBy);
          setComments((prevComments) => [...prevComments, response.data.data]); // 새로운 댓글 추가
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // question 데이터가 아직 로드되지 않았다면 로딩 메시지를 표시
  if (!newtec) {
    return <div>Loading...</div>;
  }

  const formattedDate = (createdAt) => {
    const date = new Date(createdAt);
    date.setHours(date.getHours() + 9); // UTC+9로 조정

    // 시간대 차이를 고려해야 하기 때문에 getUTC 메서드 대신 일반 메서드를 사용합니다.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하기 때문에 +1을 합니다.
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0"); // 24시간 형식으로 변환합니다.
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <div className="a">
      {editing ? (
        // <div className="QnAEditContainer">
        <div className="NewTecEditContainer2">
          <h1>AI 정보 얻기</h1>
          <span>
            <span>{nickname}</span>
            최신 AI정보를 받아 보세요~!
          </span>
          <form>
            <h2>제목</h2>
            <input
              value={title}
              className="NewTecInput"
              type="text"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <h2>본문</h2>
            <textarea
              className="NewTecContent"
              value={content}
              type="text"
              name="content"
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요!"
            />
            <br />

            <button
              className="NewTecSubmit"
              type="submit"
              onClick={handleUpdate}
            >
              수정하기
            </button>
          </form>
        </div>
      ) : (
        // </div>
        <div>
          {/* <div className="a1">
            <h1 style={{ marginBottom: "10px" }}>Q & A</h1>
            <span style={{ color: "gray" }}>질문하세요!</span>
          </div> */}
          <div className="a2">
            <div className="a3">
              <h1 style={{ marginBottom: "0px", fontSize: "2vw" }}>AI-INFO</h1>
              <span
                style={{
                  color: "gray",
                  marginBottom: "1vh",
                  fontSize: "1.1vw",
                }}
              >
                질문하세요!
              </span>
              <div className="a4">
                <div className="a5">
                  <h1 style={{ margin: "0px" }}>{newtec.title}</h1>
                </div>
                <div className="a5">
                  {currentUser == newtec.createdBy && (
                    <>
                      <button className="button" onClick={handleDelete}>
                        삭제
                      </button>
                      {/* <img
                          src={divider}
                          style={{ marginLeft: "10px", marginRight: "10px" }}
                        ></img> */}
                      <button className="button" onClick={handleEdit}>
                        수정
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="a6">
                  <img
                    src={writer1}
                    style={{
                      width: "30px",
                      height: "30px",
                    }}
                  ></img>
                  <p style={{ color: "#64748B" }}>{newtec.createdBy}</p>
                  <p>{formatDate(newtec.createdAt)}</p>
                  <div className="a7">
                    <img
                      style={{ width: "1.3vw", height: "1.8vh" }}
                      src={ViewCount}
                    ></img>
                    <p>{newtec.viewCount}</p>
                  </div>
                </div>
                {
                  currentUser == newtec.createdBy && isChecked ? (
                    // isChecked가 true일 때 체크 이미지와 "채택 완료" 텍스트를 보여줌
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "5px",
                      }}
                    >
                      <img
                        src={check} // 체크 이미지 경로
                        style={{ width: "25px", height: "25px" }}
                        alt="체크"
                      />
                      <span style={{ color: "gray" }}>채택 완료</span>
                    </div>
                  ) : currentUser == newtec.createdBy && isChecked === false ? (
                    <button onClick={handleAdoptionClick}>채택하기</button>
                  ) : (
                    ""
                  )
                  // isChecked가 false일 때 "채택하기" 버튼을 보여줌
                }
              </div>
              <div>
                <p>
                  <b>내용 </b>: {newtec.content}
                </p>
              </div>
              <hr />
              <div>
                {token ? (
                  <div>
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                    />
                    <button onClick={handleComment}>입력 완료</button>
                  </div>
                ) : (
                  <p>
                    <Link to="/login">로그인</Link>을 해야합니다.
                  </p>
                )}
                {comments &&
                  comments.map((comment) => (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.8vw",
                        marginTop: "2vh",
                        justifyContent: "space-between",
                        border: "1px solid gray",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                      key={comment.id}
                    >
                      <span style={{ color: "black", fontSize: "15px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.1vw",
                          }}
                        >
                          <b>{comment.createdBy}</b>
                          {comment.content}
                          <span style={{ color: "gray", fontSize: "11px" }}>
                            {formattedDate(comment.createdAt)}
                          </span>
                        </div>
                      </span>
                      {currentUser === comment.createdBy && (
                        <div className="comment-edit-delete-container">
                          <button
                            className="button"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            삭제
                          </button>
                          {editingCommentId === comment.id ? (
                            <div>
                              <input
                                value={editingComment}
                                onChange={(e) =>
                                  setEditingComment(e.target.value)
                                }
                                placeholder="수정할 내용을 입력하세요..."
                              />
                              <button onClick={handleCommentUpdate}>
                                수정 완료
                              </button>
                              <button onClick={() => setEditingCommentId(null)}>
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              className="button"
                              onClick={() => handleEditComment(comment)}
                            >
                              수정
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTec_page;
