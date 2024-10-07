# jenkins/ArgoCD로 CI/CD 파이프라인 구축하기.

## 구조

1. 로컬에서 각 서비스 폴더에 git init을 통해 저장소 생성 후, git branch로 해당서비스 브랜치 생성 및 add,commit,push로 github에 저장
   (add, commit을 해야 기본브랜치가 생긴다. 그 뒤에 서비스브랜치 생성 후 git switch [브랜치명])

2. 각 서비스폴더에는 Jenkinsfile, Dockerfile, 서비스.py 등 파일이 존재하고 개발 후 bookstore로 push를 통해서 해당 브랜치에 update
   (서비스폴더의 README.md에 태그에 따라 수정내용 작성)

3. webhook을 통해 Jenkins로 요청을 보내고 Jenkins에서는 multiple pipeline의 수정된 브랜치의 pipeline 작동. (ECR의 해당 repository로 push)

## Jenkins 인스턴스 생성.

t3.medium으로 인스턴스 생성후, 8080, 50000, 22번포트 열기.
인스턴스에 ecr에 접근할수 있는 권한 할당 (AmazonEC2ContainerRegistryFullAccess)

## Docker 설치

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

## Key,Repo 추가

apt update
wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

## 젠킨스 설치, 유저생성

apt install -y fontconfig openjdk-17-jre
apt-get update
apt-get install jenkins -y
usermod -aG docker jenkins
systemctl restart jenkins

## 젠킨스 접속

인스턴스 퍼블릭주소 8080포트로 접속.
cat /var/lib/jenkins/secrets/initialAdminPassword 으로 비밀번호 확인 후 접속.
패키지 install하기.
계정정보, url설정후 시작.

## 플러그인 설치

Docker, Docker Pipeline, Publish Over SSH, , AWS Credentials, Amazon ECR, Slack Notification(선택사항) 플러그인 설치
설치가 끝나고 실행중인 작업이 없으면 Jenkins 재시작 <- 체크확인

## Credential 설정

Global -> Add credential -> AWS credentials에서 aws_cre 생성

Global -> Add credential -> Username with password에서 git_cre 생성

## item 만들기

이름작성 후 multiple pipeline 선택(나의 경우는 bookstore)
Branch Sources -> github
credentials, repository URL 지정
-> 한개의 github repository에서 각 서비스들을 브랜치로 분리해서 관리할 것이다. (recommend, reservation ...)


## github 준비

github에서 repository만들고, 해당 리포지토리에 webhook추가

- Payload URL : 젠킨스주소:8080/github-webhook/

## 시작

로컬에서 변경사항 수정후 git add, commit, push를 통해 github의 해당서비스의 브랜치로 커밋
-> github에서 push된 브랜치만 Jenkins의 multiple pipeline의 해당 브랜치의 파이프라인 작동

ex) recommend 브랜치 수정후 push -> Jenkins multiple pipeline로 webhook 후
recommend 브랜치 pipeline 작동 (ecr recommend repository로 새 tag를 만들고 push한다.)
