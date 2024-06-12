## 프로젝트 설명

이 프로젝트는 [React](https://reactjs.org/)와 [Express](https://expressjs.com/)를 사용하여 만든 웹 애플리케이션의 서버입니다. 사용자는 정해진 tag나 text를 이용하여 핸드폰 배경화면을 생성하고, 이미지를 저장 및 관리할 수 있습니다.

## 메인 화면

[Main Screen]<img width="1031" alt="스크린샷 2024-06-12 오후 6 28 14" src="https://github.com/kaisiok/ai-artmaker-server/assets/95914687/57461d02-bbb7-4b15-8485-3e79e10666d4">


## 데모

[라이브 데모 보기]![Jun-12-2024 18-45-50](https://github.com/kaisiok/ai-artmaker-server/assets/95914687/b66b218e-055b-4803-bb4c-c90db490a549)

## 주요 기능

- 사용자 로그인 및 인증
- AI 이미지 생성(tag 또는 text)
- 이미지 저장 및 관리
- 소셜 로그인 (네이버)

## 설치 및 사용법

### 사전 요구사항

- Node.js (>=16.14.0)
- npm
- wub ui
- mysql

### 설치

```sh
# 클론 리포지토리
git clone https://github.com/kaisiok/ai-artmaker-server.git

# 서버 설정
cd ai-artmaker-server
npm install
cp .env.example .env
# .env 파일 수정

# 서버 실행
npm start
```

## 사용 예제

1. 회원 가입 및 로그인
2. 원하는 tag를 선택해 이미지 생성(로그인 불필요)
3. 문장을 입력해 이미지 생성(로그인 필요)
4. 생성된 이미지를 저장 및 다운로드

## 클라이언트 레포지토리 주소

이 프로젝트의 클라이언트는 다음 [클라이언트 레포지토리](https://github.com/kaisiok/ai-artmaker-client.git)에서 확인하실 수 있습니다.
