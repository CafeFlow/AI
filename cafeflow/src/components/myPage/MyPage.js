import axios from "axios";
import React, { useEffect, useState,useRef } from "react";
import { API_URL } from "../Constant";

import "./MyPage.css";

import shareIcon from "../../icons/share_android.png";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useSetRecoilState,useRecoilValue  } from "recoil";
import { nicknameState } from "../../recoils/Recoil";
import userDefaultImg from "../../icons/Account_circle.png";
import share_img from "../../icons/share_android.png"
import share_img_editing from "../../icons/editing_share_button.png"
import {
  imgUrlState,
} from "../../recoils/Recoil";
const MyPage = () => {
  const navigate = useNavigate();

  // 초기값으로 로컬 스토리지의 값을 사용
  const [email, setEmail] = useState(localStorage.getItem("email"));
  // const [nickname, setNickname] = useState(localStorage.getItem("nickname"));
  const [point, setPoint] = useState(localStorage.getItem("point"));

  const token = localStorage.getItem("jwtToken");

  const [state,setState]=useState("프로필");
  const [editing,setEditing]=useState(false);
  const [editEmail,setEditEmail]=useState(localStorage.getItem("email"));
  const [editNickname,setEditNickName]=useState(localStorage.getItem("nickname"));
  // 추가
  
  const setEditImgUrl = useSetRecoilState(imgUrlState);
  const [imgUrl,setImgUrl]=useState(useRecoilValue(imgUrlState));
  const [postState,setPostState]=useState("qna");
  const [posts, setPosts] = useState([]);
  const [nickname, setNickname] = useRecoilState(nicknameState);
  const [imgFile, setImgFile] = useState("");
  const imgRef = useRef();
  const [directoryName,setDirectoryName]=useState("profile");

  const [id, setId] = useState(localStorage.getItem("email"));
  const [type, setType] = useState("question");
 

  const moveToStore = () => {
    navigate("/store");
  };
  useEffect(() => {
    axios
      .get(`${API_URL}/get-info?email=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { email, nickname, point } = response.data;
        setEmail(email);
        setNickname(nickname);
        setPoint(point);
        // console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
        // console.log(token);
      });
  }, [token, email]); // email도 의존성 배열에 추가하여 email 값이 변경될 때마다 API 호출

  const getPost = () => {
    axios
      .get(`${API_URL}/member/${id}/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleQnA = () => {
    setPostState("qna");
    getPost();
  };
  const qna_div = (
    <div
      style={{ width: "500px", height: "500px", backgroundColor: "yellow" }}
    ></div>
  );

  const community_div = (
    <div
      style={{ width: "500px", height: "500px", backgroundColor: "red" }}
    ></div>
  );

  const posts_div = 
    <div>
      <button onClick={handleQnA}>Q&A</button>

      <button onClick={()=>{setPostState("community")}}>Community</button>
      {postState==="qna"?qna_div:community_div}
            
  </div>
  // console.log("imgUrl" + imgUrl);

  const EditingChange=()=>{
    if(editing){
      axios
        .patch(
          `${API_URL}/update/info`,
          {
            nickname: editNickname,
            email: editEmail,
            url: imgUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("mypage 수정 완료!");
          console.log(response);
          

          // API 호출 후 반환된 값(또는 수정된 값)으로 상태를 업데이트합니다.
          // 이 부분은 서버의 응답에 따라 달라질 수 있습니다.
          // 아래는 예시로, 서버가 수정된 값을 반환한다고 가정하였습니다.
          setNickname(editNickname);
          setEmail(editEmail);
          setEditImgUrl(imgUrl);

          // 로컬 스토리지의 값을 업데이트하는 것도 좋은 방법입니다.
          localStorage.setItem("nickname", editNickname);
          localStorage.setItem("email", editEmail);
        })
        .catch((error) => {
          console.error(error);
          console.log(token);
        });
    }


    setEditing(!editing);

  }

  const saveImgFile = () => {
    const file = imgRef.current.files[0];
    const reader = new FileReader(); // 파일마다 새로운 FileReader 객체 생성
    
    reader.onloadend = () => {
      setImgFile(reader.result);
    };
    
    if (file) {
      reader.readAsDataURL(file);
    }

    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("directoryName", directoryName);
      axios
        .post(`${API_URL}/upload/image`, formData)
        .then((response) => {
          const imgUrl1=response.data.data.imageUrl;
          localStorage.setItem("imageUrl1", imgUrl1);
          // console.log(localStorage.getItem("imageUrl"));
          setImgUrl(imgUrl1);
          console.log("이미지 업로드 완료되었습니다.");
        })
        .catch((error) => {
          console.error("이미지 업로드 중 에러:", error);
        });
    }
  }
  
  return (
    <div className="a">
      <div className="mypage_container1">
        <div className="mypage_container2">
          <div className="top-container">
            <p style={editing?{color:"gray",fontSize:"50px"}:{color:"black" ,fontSize:"50px"}}><b>My Page</b></p>
            <div
              className="share_edit_button-container"
              style={{ display: "flex", alignItems: "center" }}
            >
              <button
                className="share_edit_button"
                style={editing?{backgroundImage: `url('${share_img_editing}')`}:{backgroundImage:`url('${share_img}')`}}
              ></button>
              <button
                className="share_edit_button"
                style={{ color: "black" }}
                onClick={EditingChange}
              >
                <b>편집</b>
              </button>
            </div>
          </div>
          <div className="middle-container">
            <div>
              {editing ? <div><img style={{width:"200px",height:"200px"}} src={imgFile?imgFile:imgUrl===null?userDefaultImg:imgUrl}
                  alt="프로필 이미지"
                  />
                  <form className="form-edit">
                    
                    <label className="edit-profileImg-label" htmlFor="profileImg">프로필 이미지 변경</label>
                    <input 
                    className="edit-profileImg-input"
                    type="file"
                    accept="image/*"
                    id="profileImg"
                    onChange={saveImgFile}
                    // onChange={(event)=>{alert(event.target.files[0].name)}}
                    ref={imgRef}
                    />
                  </form></div>
                  :<div className="profile-img-container" style={imgUrl===null?{backgroundImage: `url('${userDefaultImg}')`, backgroundPosition:"center"}:{backgroundImage: `url('${imgUrl}')`, border:"5px solid black", borderRadius:"50px" , backgroundPosition:"center",width:"150px",height:"150px"}}>
                
                </div>}
              
             
            </div>
            
            <div className="info-container">
              <div className="info">
                <p className="label1">아이디</p>
                  <p className="label2">
                    <b>{email}</b>
                  </p>
              </div>
              <div>
                <p className="label1">닉네임</p>
                {editing ? (
                  <input
                    type="string"
                    name="id"
                    placeholder="닉네임"
                    className="editInput"
                    value={editNickname}
                    onChange={(e) => setEditNickName(e.target.value)}
                  />
                ) : (
                  <p className="label2">
                    <b>{nickname}</b>
                  </p>
                )}
              </div>
              <div>
                <div>
                  <p className="label1">포트폴리오</p>
                  <a>
                    <img className="logo1"></img>
                  </a>
                  <a>
                    <img className="logo2"></img>
                  </a>
                  <a>
                    <img className="logo3"></img>
                  </a>
                </div>
              </div>
              <div className="point-container">
                <div>
                  <p className="label1">내 포인트</p>
                  <p className="label2">
                    <b>{point}베리</b>
                  </p>
                </div>
                <button className="charge-button" onClick={moveToStore}>
                  충전하기
                </button>
              </div>
            </div>
          </div>
          <div className="check-outer-box">
            <div className="check-inner-box" style={{}}>
              <p className="check-p1">내 프로필을 조회한 사람</p>
              <p className="check-p2">
                5월 14일-8월 11일 동안{" "}
                <span style={{ color: "black" }}>674</span>명이 내 프로필을
                조회했습니다.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyPage;
